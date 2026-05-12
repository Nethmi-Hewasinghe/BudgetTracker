import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatLKR, formatLKRCompact } from "../../utils/formatMoney.js";

const fmt = (val) => formatLKR(val);

/** Scale for one row: always show both bars; include overspend in domain. */
function rowDomainMax(budget, actual) {
  const hi = Math.max(Number(budget) || 0, Number(actual) || 0, 1);
  return hi * 1.12;
}

export function BudgetVsActualChart({ data }) {
  const items = (data || []).map((b) => {
    const cat = b.category;
    const name =
      (typeof cat === "object" && cat?.name) ||
      (typeof b.categoryName === "string" && b.categoryName) ||
      "Category";
    return {
      id: String(b._id ?? name),
      name,
      budget: Number(b.amount) || 0,
      actual: Number(b.actualSpent) || 0,
    };
  });

  const overCount = items.filter((it) => it.actual > it.budget).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col min-h-[340px]">
      <div className="flex items-start justify-between mb-1 gap-4">
        <h3 className="text-base font-semibold text-slate-900">Budget vs actual</h3>
        {overCount > 0 && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            {overCount} over budget
          </span>
        )}
      </div>
      <p className="text-xs text-slate-500 mb-1">Spending against your set limits</p>
      

      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-slate-500 py-12">
          <div className="text-center max-w-sm">
            <p className="font-medium text-slate-700">No budgets for this month</p>
            <p className="mt-1 text-xs text-slate-500">
              Add budgets on the Budgets page for the same month shown in the dashboard header. This chart only
              includes categories you have set a budget for.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-5 w-full">
          <div className="flex items-center gap-4 text-xs text-slate-500 pl-[132px]">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-300" /> Budget
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-600" /> Actual (under)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-600" /> Actual (over)
            </span>
          </div>

          {items.map((item) => {
            const maxD = rowDomainMax(item.budget, item.actual);
            const row = [{ rowKey: "r", budget: item.budget, actual: item.actual }];
            const over = item.actual > item.budget;

            return (
              <div key={item.id} className="grid grid-cols-1 sm:grid-cols-[minmax(0,8.5rem)_1fr] gap-2 sm:gap-3 items-center">
                <div className="text-sm font-medium text-slate-800 truncate sm:pr-2" title={item.name}>
                  {item.name}
                </div>
                <div className="min-w-0">
                  <div className="w-full" style={{ height: 56 }}>
                    <ResponsiveContainer width="100%" height={56}>
                      <BarChart
                        data={row}
                        layout="vertical"
                        margin={{ top: 4, right: 4, left: 0, bottom: 4 }}
                        barCategoryGap={8}
                        barGap={4}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                        <XAxis
                          type="number"
                          domain={[0, maxD]}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: "#64748b" }}
                          tickFormatter={(v) => formatLKRCompact(v)}
                        />
                        <YAxis type="category" dataKey="rowKey" hide width={0} />
                        <Tooltip
                          formatter={(value, name) => [fmt(value), name === "budget" ? "Budget" : "Actual"]}
                          labelFormatter={() => item.name}
                          contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            fontSize: "12px",
                          }}
                        />
                        <Bar dataKey="budget" name="Budget" fill="#cbd5e1" radius={[0, 4, 4, 0]} barSize={12} />
                        <Bar dataKey="actual" name="Actual" radius={[0, 4, 4, 0]} barSize={12}>
                          <Cell fill={over ? "#e11d48" : "#059669"} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-end gap-x-3 gap-y-0.5 text-[11px] text-slate-500 mt-0.5">
                    <span>Budget {fmt(item.budget)}</span>
                    <span className={over ? "text-rose-600 font-medium" : ""}>Actual {fmt(item.actual)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
