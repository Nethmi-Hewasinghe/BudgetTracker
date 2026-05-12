
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatLKR } from "../../utils/formatMoney.js";

const PALETTE = ["#059669", "#0ea5e9", "#f59e0b", "#8b5cf6", "#f43f5e", "#14b8a6", "#6366f1", "#ec4899"];

const fmt = (val) => formatLKR(val);

export function ExpensePieChart({ data }) {
  const items = (data || []).map((d, i) => ({
    name: d.name,
    value: d.total,
    color: d.color || PALETTE[i % PALETTE.length],
  }));

  const total = items.reduce((sum, it) => sum + (it.value || 0), 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col h-full">
      <h3 className="text-base font-semibold text-slate-900 mb-1">Expense distribution</h3>
      <p className="text-xs text-slate-500 mb-4">Spending by category</p>

      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-slate-500 py-12">
          No expense data yet.
        </div>
      ) : (
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative h-52 w-52 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={items}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={90}
                  paddingAngle={2}
                  stroke="none"
                >
                  {items.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => fmt(v)}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.08)",
                    fontSize: "13px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-slate-500 font-medium">Total</span>
              <span className="text-lg font-bold text-slate-900">{fmt(total)}</span>
            </div>
          </div>

          <ul className="flex-1 w-full space-y-2.5">
            {items.map((it) => (
              <li key={it.name} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: it.color }} />
                  <span className="text-slate-600 truncate">{it.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-medium text-slate-900">{fmt(it.value)}</span>
                  <span className="text-xs text-slate-400 w-9 text-right">
                    {total ? Math.round((it.value / total) * 100) : 0}%
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
