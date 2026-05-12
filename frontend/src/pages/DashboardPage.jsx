
import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { formatSignedLKR } from "../utils/formatMoney.js";
import { SummaryCards } from "../components/SummaryCards.jsx";
import { ExpensePieChart } from "../components/charts/ExpensePieChart.jsx";
import { MonthlyIncomeExpenseChart } from "../components/charts/MonthlyIncomeExpenseChart.jsx";
import { BudgetVsActualChart } from "../components/charts/BudgetVsActualChart.jsx";

export function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const now = useMemo(() => new Date(), []);
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/dashboard", { params: { month, year } });
        if (!ignore) setData(res.data);
      } catch (err) {
        if (!ignore) setError(err?.response?.data?.message || "Failed to load dashboard");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [month, year]);

  const summary = data?.summary || { totalIncome: 0, totalExpense: 0, balance: 0 };
  const charts = data?.charts || { expenseByCategory: [], monthlyIncomeExpense: [], budgets: [] };
  const transactions = data?.recentTransactions || [];

  const monthName = now.toLocaleString("default", { month: "long" });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Overview for {monthName} {year}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {error}
        </div>
      )}

      {/* Summary */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm animate-pulse">
              <div className="h-10 w-10 bg-slate-200 rounded-lg mb-4" />
              <div className="h-3 w-24 bg-slate-200 rounded mb-3" />
              <div className="h-7 w-32 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <SummaryCards
          totalIncome={summary.totalIncome}
          totalExpense={summary.totalExpense}
          balance={summary.balance}
        />
      )}

      {/* Two-column charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <>
            <div className="bg-white rounded-xl border border-slate-200 h-80 animate-pulse" />
            <div className="bg-white rounded-xl border border-slate-200 h-80 animate-pulse" />
          </>
        ) : (
          <>
            <ExpensePieChart data={charts.expenseByCategory} />
            <MonthlyIncomeExpenseChart data={charts.monthlyIncomeExpense} />
          </>
        )}
      </div>

      {/* Budget vs Actual */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 h-80 animate-pulse" />
      ) : (
        <BudgetVsActualChart data={charts.budgets} />
      )}

      {/* Recent transactions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Recent transactions</h3>
          <a
            href="/transactions"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            View all
          </a>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                [1, 2, 3, 4].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-200 rounded-full" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-200 rounded-full" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-200 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                    No transactions yet.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      {new Date(t.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{t.title}</td>
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
                        t.type === "Income" ? "text-emerald-600" : "text-slate-900"
                      }`}
                    >
                      {formatSignedLKR(t.amount, t.type)}
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
