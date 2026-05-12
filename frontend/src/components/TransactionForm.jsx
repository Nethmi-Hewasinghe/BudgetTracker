

import { useEffect, useState } from "react";
import { XIcon, SaveIcon } from "lucide-react";

export function TransactionForm({ categories, initial, onSubmit, onCancel }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [type, setType] = useState(initial?.type || "Expense");
  const [category, setCategory] = useState(
    initial?.category?._id || initial?.category || ""
  );
  const [amount, setAmount] = useState(initial?.amount ?? "");
  const [date, setDate] = useState(
    initial?.date
      ? new Date(initial.date).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  );
  const [note, setNote] = useState(initial?.note || "");

  useEffect(() => {
    const filtered = categories.filter((c) => c.type === type);
    if (!filtered.some((c) => c._id === category)) {
      setCategory(filtered[0]?._id || "");
    }
  }, [type, categories, category]);

  const filteredCategories = categories.filter((c) => c.type === type);

  const inputClass =
    "w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

  return (
    <form
      className="space-y-5"
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className={labelClass}>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Grocery shopping"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Type</label>
          <div className="flex bg-slate-100 rounded-lg p-1 h-10">
            {["Expense", "Income"].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setType(opt)}
                className={`flex-1 text-sm font-medium rounded-md transition ${
                  type === opt
                    ? opt === "Income"
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "bg-white text-rose-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            disabled={filteredCategories.length === 0}
            className={`${inputClass} disabled:bg-slate-50 disabled:text-slate-400`}
          >
            {filteredCategories.length === 0 ? (
              <option value="">Add categories first</option>
            ) : null}
            {filteredCategories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Amount (LKR)</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm font-medium">
              Rs
            </span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="0.00"
              className={`${inputClass} pl-9`}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Date</label>
          <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            type="date"
            required
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Note (optional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Add any details..."
          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition resize-none"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 px-4 h-10 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
        >
          <XIcon className="h-4 w-4" />
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 px-4 h-10 rounded-lg bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition"
        >
          <SaveIcon className="h-4 w-4" />
          Save
        </button>
      </div>
    </form>
  );
}

