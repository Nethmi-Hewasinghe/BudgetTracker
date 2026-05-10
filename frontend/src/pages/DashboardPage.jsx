import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { SummaryCards } from "../components/SummaryCards.jsx";
import { ExpensePieChart } from "../components/charts/ExpensePieChart.jsx";
import { MonthlyIncomeExpenseChart } from "../components/charts/MonthlyIncomeExpenseChart.jsx";
import { BudgetVsActualChart } from "../components/charts/BudgetVsActualChart.jsx";

export function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const now = useMemo(() => new Date(), []);
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  useEffect(() => {
    let ignore = false;
    async function load() {
      setError("");
      try {
        const res = await api.get("/dashboard", { params: { month, year } });
        if (!ignore) setData(res.data);
      } catch (err) {
        if (!ignore) setError(err?.response?.data?.message || "Failed to load dashboard");
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [month, year]);

  const summary = data?.summary || { totalIncome: 0, totalExpense: 0, balance: 0 };
  const charts = data?.charts || { expenseByCategory: [], monthlyIncomeExpense: [], budgets: [] };

  return (
    <div className="grid" style={{ gap: 14 }}>
      <SummaryCards
        totalIncome={summary.totalIncome}
        totalExpense={summary.totalExpense}
        balance={summary.balance}
      />

      {error ? <div className="card" style={{ padding: 12, color: "#b91c1c" }}>{error}</div> : null}

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <ExpensePieChart data={charts.expenseByCategory} />
        <MonthlyIncomeExpenseChart data={charts.monthlyIncomeExpense} />
      </div>

      <BudgetVsActualChart data={charts.budgets} />

      <div className="card" style={{ padding: 14 }}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>Recent transactions</div>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Category</th>
              <th>Type</th>
              <th style={{ textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {(data?.recentTransactions || []).map((t) => (
              <tr key={t._id}>
                <td>{new Date(t.date).toLocaleDateString()}</td>
                <td>{t.title}</td>
                <td>{t.category?.name || "-"}</td>
                <td>{t.type}</td>
                <td style={{ textAlign: "right" }}>
                  {t.type === "Expense" ? "-" : "+"}${Number(t.amount).toFixed(2)}
                </td>
              </tr>
            ))}
            {data?.recentTransactions?.length === 0 ? (
              <tr>
                <td colSpan={5} className="muted">
                  No transactions yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

