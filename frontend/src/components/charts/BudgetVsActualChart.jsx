import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function BudgetVsActualChart({ data }) {
  const items = (data || []).map((b) => ({
    name: b.category?.name || "Category",
    budget: b.amount || 0,
    actual: b.actualSpent || 0,
  }));

  return (
    <div className="card" style={{ padding: 14 }}>
      <div style={{ fontWeight: 800, marginBottom: 10 }}>Budget vs actual</div>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <LineChart data={items}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" hide={items.length > 6} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="budget" stroke="#6366f1" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="actual" stroke="#ef4444" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

