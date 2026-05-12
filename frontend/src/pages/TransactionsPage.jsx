

import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { formatSignedLKR } from "../utils/formatMoney.js";
import { TransactionForm } from "../components/TransactionForm.jsx";
import {
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  FilterIcon,
  XIcon,
  ArrowLeftRightIcon,
} from "lucide-react";

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
  const [loading, setLoading] = useState(true);

  const filteredCategories = useMemo(() => {
    if (!filters.type) return categories;
    return categories.filter((c) => c.type === filters.type);
  }, [categories, filters.type]);

  const hasActiveFilters =
    filters.type || filters.category || filters.startDate || filters.endDate;

  async function loadCategories() {
    const [exp, inc] = await Promise.all([
      api.get("/categories", { params: { type: "Expense" } }),
      api.get("/categories", { params: { type: "Income" } }),
    ]);
    setCategories([
      ...(exp.data.categories || []),
      ...(inc.data.categories || []),
    ]);
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
      setLoading(true);
      try {
        await loadCategories();
        await loadTransactions();
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadTransactions().catch((err) =>
      setError(err?.response?.data?.message || "Failed to load transactions")
    );
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

  const totalIncome = transactions
    .filter((t) => t.type === "Income")
    .reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalExpense = transactions
    .filter((t) => t.type === "Expense")
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const selectClass =
    "w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Transactions
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Add, edit, delete, and filter by category, type, or date.
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 px-4 h-10 rounded-lg bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition"
        >
          <PlusIcon className="h-4 w-4" />
          Add transaction
        </button>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SummaryChip
          label="Showing"
          value={`${transactions.length} ${transactions.length === 1 ? "entry" : "entries"}`}
          icon={<ArrowLeftRightIcon className="h-4 w-4 text-slate-500" />}
          iconBg="bg-slate-100"
        />
        <SummaryChip
          label="Income (filtered)"
          value={formatSignedLKR(totalIncome, "Income")}
          valueClass="text-emerald-600"
          icon={<PlusIcon className="h-4 w-4 text-emerald-600" />}
          iconBg="bg-emerald-100"
        />
        <SummaryChip
          label="Expense (filtered)"
          value={formatSignedLKR(totalExpense, "Expense")}
          valueClass="text-rose-600"
          icon={<XIcon className="h-4 w-4 text-rose-600" />}
          iconBg="bg-rose-100"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <FilterIcon className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-900">Filters</h3>
          {hasActiveFilters && (
            <span className="ml-auto text-xs text-emerald-600 font-medium">
              Active
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) =>
                setFilters((f) => ({ ...f, type: e.target.value, category: "" }))
              }
              className={selectClass}
            >
              <option value="">All</option>
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters((f) => ({ ...f, category: e.target.value }))
              }
              className={selectClass}
            >
              <option value="">All</option>
              {filteredCategories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Start date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters((f) => ({ ...f, startDate: e.target.value }))
              }
              className={selectClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              End date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters((f) => ({ ...f, endDate: e.target.value }))
              }
              className={selectClass}
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() =>
                setFilters({
                  type: "",
                  category: "",
                  startDate: "",
                  endDate: "",
                })
              }
              className="w-full h-10 px-4 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Reset
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            {error}
          </div>
        )}
      </div>

      {/* Form (modal-like card) */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              {editing ? "Edit transaction" : "Add transaction"}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                setEditing(null);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              aria-label="Close form"
            >
              <XIcon className="h-4 w-4" />
            </button>
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
      )}

      {/* Transactions table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-base font-semibold text-slate-900">
            All transactions
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase tracking-wide bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium text-right">Amount</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                [1, 2, 3, 4].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 w-20 bg-slate-200 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-32 bg-slate-200 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-20 bg-slate-200 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-16 bg-slate-200 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-20 bg-slate-200 rounded ml-auto" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-8 w-24 bg-slate-200 rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center text-sm text-slate-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                        <ArrowLeftRightIcon className="h-5 w-5 text-slate-400" />
                      </div>
                      <p className="font-medium text-slate-700">
                        No transactions found
                      </p>
                      <p className="text-xs text-slate-500">
                        {hasActiveFilters
                          ? "Try adjusting your filters or "
                          : ""}
                        <button
                          onClick={() => {
                            setEditing(null);
                            setShowForm(true);
                          }}
                          className="text-emerald-600 font-medium hover:underline"
                        >
                          add a new transaction
                        </button>
                        .
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr
                    key={t._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      {new Date(t.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {t.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {t.category?.name || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          t.type === "Income"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-semibold whitespace-nowrap ${
                        t.type === "Income"
                          ? "text-emerald-600"
                          : "text-slate-900"
                      }`}
                    >
                      {formatSignedLKR(t.amount, t.type)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(t);
                            setShowForm(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition"
                          aria-label="Edit transaction"
                        >
                          <PencilIcon className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(t._id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition"
                          aria-label="Delete transaction"
                        >
                          <Trash2Icon className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryChip({ label, value, valueClass = "text-slate-900", icon, iconBg }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3 flex items-center gap-3">
      <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className={`text-base font-bold ${valueClass}`}>{value}</div>
      </div>
    </div>
  );
}

