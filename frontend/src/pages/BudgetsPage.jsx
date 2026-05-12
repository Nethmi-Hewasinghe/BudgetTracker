import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { BudgetCard } from "../components/BudgetCard.jsx";
import { formatLKR } from "../utils/formatMoney.js";
import {
  PlusIcon,
  PencilIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PieChartIcon,
  WalletIcon,
  TrendingUpIcon,
} from "lucide-react";

export function BudgetsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [budgets, setBudgets] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editCategory, setEditCategory] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editMonth, setEditMonth] = useState(month);
  const [editYear, setEditYear] = useState(year);

  async function load() {
    setLoading(true);
    try {
      const [cats, b] = await Promise.all([
        api.get("/categories", { params: { type: "Expense" } }),
        api.get("/budgets", { params: { month, year } }),
      ]);
      setExpenseCategories(cats.data.categories || []);
      setBudgets(b.data.budgets || []);
      setCategory((prev) => prev || (cats.data.categories?.[0]?._id ?? ""));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setEditingId(null);
    load().catch((err) =>
      setError(err?.response?.data?.message || "Failed to load budgets")
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  function startEdit(b) {
    const catId = b.category?._id ?? b.category;
    setEditingId(b._id);
    setEditCategory(String(catId || ""));
    setEditAmount(String(b.amount ?? ""));
    setEditMonth(Number(b.month));
    setEditYear(Number(b.year));
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
      await api.put(`/budgets/${editingId}`, {
        category: editCategory,
        amount: Number(editAmount),
        month: Number(editMonth),
        year: Number(editYear),
      });
      cancelEdit();
      if (Number(editMonth) !== month || Number(editYear) !== year) {
        setMonth(Number(editMonth));
        setYear(Number(editYear));
      } else {
        await load();
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to update budget (duplicate category for that month?)"
      );
    } finally {
      setSaving(false);
    }
  }

  async function addBudget(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/budgets", {
        category,
        amount: Number(amount),
        month: Number(month),
        year: Number(year),
      });
      setAmount("");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create budget");
    } finally {
      setSaving(false);
    }
  }

  async function removeBudget(id) {
    if (!confirm("Delete this budget?")) return;
    setError("");
    try {
      await api.delete(`/budgets/${id}`);
      if (editingId === id) cancelEdit();
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete budget");
    }
  }

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const monthName = useMemo(
    () =>
      new Date(year, month - 1).toLocaleString("default", { month: "long" }),
    [month, year]
  );

  const stats = useMemo(() => {
    const totalBudget = budgets.reduce(
      (s, b) => s + Number(b.amount || 0),
      0
    );
    const totalSpent = budgets.reduce(
      (s, b) => s + Number(b.actualSpent || 0),
      0
    );
    const overCount = budgets.filter(
      (b) => Boolean(b.isOverBudget) || Number(b.actualSpent) > Number(b.amount)
    ).length;
    return { totalBudget, totalSpent, overCount };
  }, [budgets]);

  const selectClass =
    "w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Budgets
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track monthly budget progress and get overspending alerts.
          </p>
        </div>

        {/* Month/year stepper */}
        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm self-start sm:self-auto">
          <button
            onClick={prevMonth}
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition"
            aria-label="Previous month"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <div className="px-3 text-sm font-medium text-slate-700 min-w-[8rem] text-center">
            {monthName} {year}
          </div>
          <button
            onClick={nextMonth}
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition"
            aria-label="Next month"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total budgeted"
          value={formatLKR(stats.totalBudget)}
          icon={<WalletIcon className="h-5 w-5 text-emerald-600" />}
          iconBg="bg-emerald-100"
        />
        <StatCard
          label="Total spent"
          value={formatLKR(stats.totalSpent)}
          icon={<TrendingUpIcon className="h-5 w-5 text-blue-600" />}
          iconBg="bg-blue-100"
          subtitle={
            stats.totalBudget
              ? `${Math.round(
                  (stats.totalSpent / stats.totalBudget) * 100
                )}% of budget`
              : "—"
          }
        />
        <StatCard
          label="Over budget"
          value={`${stats.overCount} ${
            stats.overCount === 1 ? "category" : "categories"
          }`}
          icon={<PieChartIcon className="h-5 w-5 text-rose-600" />}
          iconBg="bg-rose-100"
          valueClass={stats.overCount > 0 ? "text-rose-600" : "text-slate-900"}
        />
      </div>

      {/* Create budget */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <PlusIcon className="h-4 w-4 text-emerald-600" />
          <h3 className="text-base font-semibold text-slate-900">
            Create budget
          </h3>
        </div>

        <form
          onSubmit={addBudget}
          className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
        >
          <div className="md:col-span-7">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Expense category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              disabled={expenseCategories.length === 0}
              className={`${selectClass} disabled:bg-slate-50 disabled:text-slate-400`}
            >
              {expenseCategories.length === 0 ? (
                <option value="">Add expense categories first</option>
              ) : null}
              {expenseCategories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Amount (LKR)
            </label>
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
                className={`${selectClass} pl-9`}
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={saving || expenseCategories.length === 0}
              className="w-full inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-lg bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <PlusIcon className="h-4 w-4" />
              {saving ? "Saving..." : "Save"}
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

      {/* Edit budget */}
      {editingId && (
        <div className="bg-white rounded-xl border border-indigo-200 shadow-sm p-6 ring-1 ring-indigo-100">
          <div className="flex items-center gap-2 mb-4">
            <PencilIcon className="h-4 w-4 text-indigo-600" />
            <h3 className="text-base font-semibold text-slate-900">Edit budget</h3>
          </div>
          <form
            onSubmit={saveEdit}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
          >
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Expense category
              </label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                required
                disabled={expenseCategories.length === 0}
                className={`${selectClass} disabled:bg-slate-50 disabled:text-slate-400`}
              >
                {expenseCategories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Month</label>
              <select
                value={editMonth}
                onChange={(e) => setEditMonth(Number(e.target.value))}
                className={selectClass}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(2000, m - 1).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Year</label>
              <input
                type="number"
                min={2000}
                max={2100}
                value={editYear}
                onChange={(e) => setEditYear(Number(e.target.value))}
                className={selectClass}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount (LKR)</label>
              <input
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                type="number"
                min="0"
                step="0.01"
                required
                className={selectClass}
              />
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
                className="flex-1 h-10 px-3 rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 shadow-sm transition disabled:opacity-60"
              >
                {saving ? "Saving..." : "Update"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Budgets list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-900">
            {monthName} {year} budgets
          </h3>
          <span className="text-xs font-medium text-slate-500">
            {budgets.length} {budgets.length === 1 ? "budget" : "budgets"}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-200 h-48 animate-pulse"
              />
            ))}
          </div>
        ) : budgets.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-16 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                <PieChartIcon className="h-5 w-5 text-slate-400" />
              </div>
              <p className="font-medium text-slate-700">
                No budgets for {monthName} {year}
              </p>
              <p className="text-xs text-slate-500">
                Create your first budget using the form above.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map((b) => (
              <BudgetCard
                key={b._id}
                budget={b}
                onEdit={startEdit}
                onDelete={() => removeBudget(b._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, iconBg, subtitle, valueClass = "text-slate-900" }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
        {label}
      </div>
      <div className={`text-xl font-bold mt-1 ${valueClass}`}>{value}</div>
      {subtitle && (
        <div className="text-xs text-slate-500 mt-1">{subtitle}</div>
      )}
    </div>
  );
}



