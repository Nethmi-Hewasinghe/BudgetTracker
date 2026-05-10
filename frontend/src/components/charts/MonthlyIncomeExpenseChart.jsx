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

export function MonthlyIncomeExpenseChart({ data }) {
  const items = (data || []).map((d) => ({
    name: `${d.year}-${String(d.month).padStart(2, "0")}`,
    income: d.income || 0,
    expense: d.expense || 0,
  }));

  return (
    <div className="card" style={{ padding: 14 }}>
      <div style={{ fontWeight: 800, marginBottom: 10 }}>Monthly income vs expenses</div>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <BarChart data={items}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" hide={items.length > 8} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="income" fill="#22c55e" radius={[8, 8, 0, 0]} />
            <Bar dataKey="expense" fill="#ef4444" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

