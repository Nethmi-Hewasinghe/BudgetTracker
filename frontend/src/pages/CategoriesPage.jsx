import { useEffect, useState } from "react";
import { api } from "../services/api";

export function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [type, setType] = useState("Expense");
  const [name, setName] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [error, setError] = useState("");

  async function load() {
    const { data } = await api.get("/categories", { params: { type } });
    setCategories(data.categories);
  }

  useEffect(() => {
    load().catch((err) => setError(err?.response?.data?.message || "Failed to load categories"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  async function addCategory(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/categories", { name, type, color });
      setName("");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add category");
    }
  }

  async function removeCategory(id) {
    if (!confirm("Delete this category?")) return;
    setError("");
    try {
      await api.delete(`/categories/${id}`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete category");
    }
  }

  return (
    <div className="grid">
      <div className="card" style={{ padding: 14 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>Categories</div>
            <div className="muted" style={{ fontSize: 13 }}>
              Separate income and expense categories.
            </div>
          </div>
          <div className="row">
            <div className="field">
              <label>Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="Expense">Expense</option>
                <option value="Income">Income</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 14 }}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>Add category</div>
        <form className="row" onSubmit={addCategory}>
          <div className="field" style={{ flex: 1, minWidth: 240 }}>
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label>Color</label>
            <input value={color} onChange={(e) => setColor(e.target.value)} type="color" />
          </div>
          <button className="btn btnPrimary" type="submit">
            Add
          </button>
        </form>
        {error ? <div className="err" style={{ marginTop: 10 }}>{error}</div> : null}
      </div>

      <div className="card" style={{ padding: 14 }}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>Your categories</div>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Color</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c._id}>
                <td>{c.name}</td>
                <td>{c.type}</td>
                <td>
                  <span
                    style={{
                      display: "inline-block",
                      width: 14,
                      height: 14,
                      borderRadius: 4,
                      background: c.color || "#94a3b8",
                      border: "1px solid var(--border)",
                    }}
                  />
                </td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn btnDanger" type="button" onClick={() => removeCategory(c._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="muted">
                  No categories yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

