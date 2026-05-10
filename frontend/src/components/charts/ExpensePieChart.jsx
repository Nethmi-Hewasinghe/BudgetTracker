import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export function ExpensePieChart({ data }) {
  const items = (data || []).map((d) => ({
    name: d.name,
    value: d.total,
    color: d.color || "#6366f1",
  }));

  return (
    <div className="card" style={{ padding: 14 }}>
      <div style={{ fontWeight: 800, marginBottom: 10 }}>Expense distribution</div>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={items} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100}>
              {items.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

