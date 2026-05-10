import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { TransactionForm } from "../components/TransactionForm.jsx";

export function TransactionsPage() {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    startDate: "",
    endDate: "",
  });
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const filteredCategories = useMemo(() => {
    if (!filters.type) return categories;
    return categories.filter((c) => c.type === filters.type);
  }, [categories, filters.type]);

  async function loadCategories() {
    const [exp, inc] = await Promise.all([
      api.get("/categories", { params: { type: "Expense" } }),
      api.get("/categories", { params: { type: "Income" } }),
    ]);
    setCategories([...(exp.data.categories || []), ...(inc.data.categories || [])]);
  }

  async function loadTransactions() {
    const params = {};
    if (filters.type) params.type = filters.type;
    if (filters.category) params.category = filters.category;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    const { data } = await api.get("/transactions", { params });
    setTransactions(data.transactions || []);
  }

  useEffect(() => {
    (async () => {
      setError("");
      try {
        await loadCategories();
        await loadTransactions();
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadTransactions().catch((err) => setError(err?.response?.data?.message || "Failed to load transactions"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.type, filters.category, filters.startDate, filters.endDate]);

  async function save(payload) {
    setError("");
    try {
      if (editing) {
        await api.put(`/transactions/${editing._id}`, payload);
      } else {
        await api.post("/transactions", payload);
      }
      setShowForm(false);
      setEditing(null);
      await loadTransactions();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save transaction");
    }
  }

  async function remove(id) {
    if (!confirm("Delete this transaction?")) return;
    setError("");
    try {
      await api.delete(`/transactions/${id}`);
      await loadTransactions();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete");
    }
  }

  return (
    <div className="grid">
      <div className="card" style={{ padding: 14 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>Transactions</div>
            <div className="muted" style={{ fontSize: 13 }}>
              Add, edit, delete, and filter by category/type/date.
            </div>
          </div>
          <button
            className="btn btnPrimary"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            Add transaction
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 14 }}>
        <div className="row">
          <div className="field">
            <label>Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value, category: "" }))}
            >
              <option value="">All</option>
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
            </select>
          </div>
          <div className="field" style={{ minWidth: 220 }}>
            <label>Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
            >
              <option value="">All</option>
              {filteredCategories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Start date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
            />
          </div>
          <div className="field">
            <label>End date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
            />
          </div>
          <button
            className="btn"
            type="button"
            onClick={() => setFilters({ type: "", category: "", startDate: "", endDate: "" })}
          >
            Reset
          </button>
        </div>
        {error ? <div className="err" style={{ marginTop: 10 }}>{error}</div> : null}
      </div>

      {showForm ? (
        <div className="card" style={{ padding: 14 }}>
          <div style={{ fontWeight: 800, marginBottom: 10 }}>
            {editing ? "Edit transaction" : "Add transaction"}
          </div>
          <TransactionForm
            categories={categories}
            initial={editing}
            onSubmit={save}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        </div>
      ) : null}

      <div className="card" style={{ padding: 14 }}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>Transactions</div>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Category</th>
              <th>Type</th>
              <th style={{ textAlign: "right" }}>Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t._id}>
                <td>{new Date(t.date).toLocaleDateString()}</td>
                <td>{t.title}</td>
                <td>{t.category?.name || "-"}</td>
                <td>{t.type}</td>
                <td style={{ textAlign: "right" }}>
                  {t.type === "Expense" ? "-" : "+"}${Number(t.amount).toFixed(2)}
                </td>
                <td style={{ textAlign: "right" }}>
                  <div className="row" style={{ justifyContent: "flex-end" }}>
                    <button
                      className="btn"
                      type="button"
                      onClick={() => {
                        setEditing(t);
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </button>
                    <button className="btn btnDanger" type="button" onClick={() => remove(t._id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="muted">
                  No transactions found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

