


import { useEffect, useState } from "react";
import { api } from "../services/api";
import {
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  TagsIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from "lucide-react";

const COLOR_PRESETS = [
  "#059669", // emerald
  "#0ea5e9", // sky
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#f43f5e", // rose
  "#f59e0b", // amber
  "#14b8a6", // teal
];

export function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [type, setType] = useState("Expense");
  const [name, setName] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("Expense");
  const [editColor, setEditColor] = useState("#6366f1");

  async function load(overrideType) {
    const t = overrideType ?? type;
    setLoading(true);
    try {
      const { data } = await api.get("/categories", { params: { type: t } });
      setCategories(data.categories || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setEditingId(null);
    load().catch((err) =>
      setError(err?.response?.data?.message || "Failed to load categories")
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  function startEdit(c) {
    setEditingId(c._id);
    setEditName(c.name);
    setEditType(c.type);
    setEditColor(c.color || "#6366f1");
    setError("");
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(e) {
    e.preventDefault();
    if (!editingId) return;
    setError("");
    setSaving(true);
    try {
      await api.put(`/categories/${editingId}`, {
        name: editName.trim(),
        type: editType,
        color: editColor,
      });
      cancelEdit();
      if (editType !== type) {
        setType(editType);
        await load(editType);
      } else {
        await load();
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update category");
    } finally {
      setSaving(false);
    }
  }

  async function addCategory(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/categories", { name, type, color });
      setName("");
      setColor("#6366f1");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add category");
    } finally {
      setSaving(false);
    }
  }

  async function removeCategory(id) {
    if (!confirm("Delete this category?")) return;
    setError("");
    try {
      await api.delete(`/categories/${id}`);
      if (editingId === id) cancelEdit();
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete category");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Categories
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Organize your income and expenses into separate categories.
          </p>
        </div>

        {/* Type segmented toggle */}
        <div className="flex bg-slate-100 rounded-lg p-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setType("Expense")}
            className={`inline-flex items-center gap-1.5 px-4 h-9 text-sm font-medium rounded-md transition ${
              type === "Expense"
                ? "bg-white text-rose-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <TrendingDownIcon className="h-4 w-4" />
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType("Income")}
            className={`inline-flex items-center gap-1.5 px-4 h-9 text-sm font-medium rounded-md transition ${
              type === "Income"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <TrendingUpIcon className="h-4 w-4" />
            Income
          </button>
        </div>
      </div>

      {/* Add Category Form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <PlusIcon className="h-4 w-4 text-emerald-600" />
          <h3 className="text-base font-semibold text-slate-900">
            Add a new {type.toLowerCase()} category
          </h3>
        </div>

        <form
          onSubmit={addCategory}
          className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
        >
          <div className="md:col-span-7">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder={
                type === "Expense" ? "e.g. Groceries" : "e.g. Salary"
              }
              className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Color
            </label>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-7 w-7 rounded-full transition ${
                      color === c
                        ? "ring-2 ring-offset-2 ring-slate-400"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-7 w-8 rounded cursor-pointer border border-slate-300"
                aria-label="Custom color"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-lg bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <PlusIcon className="h-4 w-4" />
              {saving ? "Adding..." : "Add"}
            </button>
          </div>
        </form>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            {error}
          </div>
        )}
      </div>

      {/* Edit category */}
      {editingId && (
        <div className="bg-white rounded-xl border border-indigo-200 shadow-sm p-6 ring-1 ring-indigo-100">
          <div className="flex items-center gap-2 mb-4">
            <PencilIcon className="h-4 w-4 text-indigo-600" />
            <h3 className="text-base font-semibold text-slate-900">Edit category</h3>
          </div>
          <form
            onSubmit={saveEdit}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
          >
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Name
              </label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Type
              </label>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
              >
                <option value="Expense">Expense</option>
                <option value="Income">Income</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Color
              </label>
              <div className="flex items-center gap-2">
                <div className="flex gap-1 flex-wrap">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditColor(c)}
                      className={`h-7 w-7 rounded-full transition ${
                        editColor === c ? "ring-2 ring-offset-2 ring-slate-400" : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: c }}
                      aria-label={`Select color ${c}`}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="h-7 w-8 rounded cursor-pointer border border-slate-300"
                  aria-label="Custom color"
                />
              </div>
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button
                type="button"
                onClick={cancelEdit}
                disabled={saving}
                className="flex-1 h-10 px-3 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 px-3 rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">
            Your {type.toLowerCase()} categories
          </h3>
          <span className="text-xs font-medium text-slate-500">
            {categories.length} total
          </span>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 bg-slate-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                <TagsIcon className="h-5 w-5 text-slate-400" />
              </div>
              <p className="font-medium text-slate-700">
                No {type.toLowerCase()} categories yet
              </p>
              <p className="text-xs text-slate-500">
                Add your first one using the form above.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase tracking-wide bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Color</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {categories.map((c) => (
                  <tr
                    key={c._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{
                            backgroundColor: c.color || "#94a3b8",
                          }}
                        />
                        <span className="font-medium text-slate-900">
                          {c.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          c.type === "Income"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {c.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-5 w-5 rounded-md border border-slate-200 shrink-0"
                          style={{
                            backgroundColor: c.color || "#94a3b8",
                          }}
                        />
                        <span className="text-xs text-slate-500 font-mono">
                          {(c.color || "#94a3b8").toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(c)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 transition"
                          aria-label="Edit category"
                        >
                          <PencilIcon className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => removeCategory(c._id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition"
                          aria-label="Delete category"
                        >
                          <Trash2Icon className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


