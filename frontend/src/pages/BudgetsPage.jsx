import { useEffect, useState } from "react";
import { api } from "../services/api";
import { BudgetCard } from "../components/BudgetCard.jsx";

export function BudgetsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [budgets, setBudgets] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    const [cats, b] = await Promise.all([
      api.get("/categories", { params: { type: "Expense" } }),
      api.get("/budgets", { params: { month, year } }),
    ]);
    setExpenseCategories(cats.data.categories || []);
    setBudgets(b.data.budgets || []);
    setCategory((prev) => prev || (cats.data.categories?.[0]?._id ?? ""));
  }

  useEffect(() => {
    load().catch((err) => setError(err?.response?.data?.message || "Failed to load budgets"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  async function addBudget(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/budgets", { category, amount: Number(amount), month: Number(month), year: Number(year) });
      setAmount("");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create budget");
    }
  }

  async function removeBudget(id) {
    if (!confirm("Delete this budget?")) return;
    setError("");
    try {
      await api.delete(`/budgets/${id}`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete budget");
    }
  }

  return (
    <div className="grid">
      <div className="card" style={{ padding: 14 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>Budgets</div>
            <div className="muted" style={{ fontSize: 13 }}>
              Track monthly budget progress and overspending alerts.
            </div>
          </div>
          <div className="row">
            <div className="field">
              <label>Month</label>
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Year</label>
              <input value={year} onChange={(e) => setYear(Number(e.target.value))} type="number" min="2000" max="2100" />
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 14 }}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>Create budget</div>
        <form className="row" onSubmit={addBudget}>
          <div className="field" style={{ minWidth: 260, flex: 1 }}>
            <label>Expense category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} required>
              {expenseCategories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Amount</label>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" min="0" step="0.01" required />
          </div>
          <button className="btn btnPrimary" type="submit">
            Save
          </button>
        </form>
        {error ? <div className="err" style={{ marginTop: 10 }}>{error}</div> : null}
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        {budgets.map((b) => (
          <BudgetCard key={b._id} budget={b} onDelete={() => removeBudget(b._id)} />
        ))}
      </div>

      {budgets.length === 0 ? (
        <div className="card" style={{ padding: 14 }}>
          <div className="muted">No budgets yet for this month.</div>
        </div>
      ) : null}
    </div>
  );
}

