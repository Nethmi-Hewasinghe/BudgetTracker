import { useEffect, useState } from "react";

export function TransactionForm({ categories, initial, onSubmit, onCancel }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [type, setType] = useState(initial?.type || "Expense");
  const [category, setCategory] = useState(initial?.category?._id || initial?.category || "");
  const [amount, setAmount] = useState(initial?.amount ?? "");
  const [date, setDate] = useState(
    initial?.date ? new Date(initial.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [note, setNote] = useState(initial?.note || "");

  useEffect(() => {
    const filtered = categories.filter((c) => c.type === type);
    if (!filtered.some((c) => c._id === category)) {
      setCategory(filtered[0]?._id || "");
    }
  }, [type, categories, category]);

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <form
      className="grid"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          title,
          type,
          category,
          amount: Number(amount),
          date,
          note: note || undefined,
        });
      }}
    >
      <div className="row">
        <div className="field" style={{ flex: 1, minWidth: 220 }}>
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="field" style={{ minWidth: 160 }}>
          <label>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="Expense">Expense</option>
            <option value="Income">Income</option>
          </select>
        </div>
      </div>

      <div className="row">
        <div className="field" style={{ flex: 1, minWidth: 220 }}>
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} required>
            {filteredCategories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field" style={{ minWidth: 160 }}>
          <label>Amount</label>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" min="0" step="0.01" required />
        </div>
        <div className="field" style={{ minWidth: 170 }}>
          <label>Date</label>
          <input value={date} onChange={(e) => setDate(e.target.value)} type="date" required />
        </div>
      </div>

      <div className="field">
        <label>Note (optional)</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
      </div>

      <div className="row" style={{ justifyContent: "flex-end" }}>
        <button className="btn" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn btnPrimary" type="submit">
          Save
        </button>
      </div>
    </form>
  );
}

