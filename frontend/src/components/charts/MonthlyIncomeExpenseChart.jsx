
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatLKR, formatLKRCompact } from "../../utils/formatMoney.js";

const fmt = (val) => formatLKR(val);

const monthLabel = (year, month) => {
  const d = new Date(year, month - 1);
  return d.toLocaleString("default", { month: "short" });
};

export function MonthlyIncomeExpenseChart({ data }) {
  const items = (data || []).map((d) => ({
    name: monthLabel(d.year, d.month),
    income: d.income || 0,
    expense: d.expense || 0,
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col h-full min-h-[320px]">
      <h3 className="text-base font-semibold text-slate-900 mb-1">Monthly income vs expenses</h3>
      <p className="text-xs text-slate-500 mb-4">Last {items.length || 0} months</p>

      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-slate-500">
          No monthly data yet.
        </div>
      ) : (
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={items} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
                hide={items.length > 12}
                dy={6}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
                tickFormatter={(v) => formatLKRCompact(v)}
              />
              <Tooltip
                formatter={(v) => fmt(v)}
                cursor={{ fill: "#f8fafc" }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.08)",
                  fontSize: "13px",
                }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
              <Bar dataKey="income" name="Income" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={36} />
              <Bar dataKey="expense" name="Expense" fill="#e11d48" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
