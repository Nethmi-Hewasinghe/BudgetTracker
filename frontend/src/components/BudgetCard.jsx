import { formatLKR } from "../utils/formatMoney.js";
import { Trash2Icon, PencilIcon, AlertTriangleIcon, CheckCircleIcon } from "lucide-react";

export function BudgetCard({ budget, onEdit, onDelete }) {
  const used = Number(budget.actualSpent || 0);
  const total = Number(budget.amount || 0);
  const percent = total === 0 ? 0 : Math.min(100, (used / total) * 100);
  const rawPercent = total === 0 ? 0 : (used / total) * 100;
  const over = Boolean(budget.isOverBudget) || used > total;
  const nearLimit = !over && percent >= 80;

  const monthName = new Date(budget.year, budget.month - 1).toLocaleString(
    "default",
    { month: "long" }
  );

  // Color scheme by status
  const statusColor = over
    ? "rose"
    : nearLimit
    ? "amber"
    : "emerald";

  const barColor = {
    rose: "bg-rose-500",
    amber: "bg-amber-500",
    emerald: "bg-emerald-500",
  }[statusColor];

  const swatchColor = budget.category?.color || "#64748b";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="h-9 w-9 rounded-lg shrink-0 flex items-center justify-center"
            style={{ backgroundColor: `${swatchColor}20` }}
          >
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: swatchColor }}
            />
          </span>
          <div className="min-w-0">
            <div className="font-semibold text-slate-900 truncate">
              {budget.category?.name || "Category"}
            </div>
            <div className="text-xs text-slate-500">
              {monthName} {budget.year}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => onEdit?.(budget)}
            className="p-1.5 rounded-md text-slate-400 hover:text-indigo-700 hover:bg-indigo-50 transition shrink-0"
            aria-label="Edit budget"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition shrink-0"
            aria-label="Delete budget"
          >
            <Trash2Icon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Numbers */}
      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="text-xs text-slate-500 font-medium">Spent</div>
          <div
            className={`text-xl font-bold ${
              over ? "text-rose-600" : "text-slate-900"
            }`}
          >
            {formatLKR(used)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500 font-medium">Budget</div>
          <div className="text-sm font-semibold text-slate-600">
            {formatLKR(total)}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5 mb-3">
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span
            className={`font-semibold ${
              over
                ? "text-rose-600"
                : nearLimit
                ? "text-amber-600"
                : "text-emerald-600"
            }`}
          >
            {Math.round(rawPercent)}% used
          </span>
          <span className="text-slate-500">
            {over
              ? `${formatLKR(used - total)} over`
              : `${formatLKR(total - used)} left`}
          </span>
        </div>
      </div>

      {/* Status alert */}
      {over ? (
        <div className="flex items-start gap-2 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700">
          <AlertTriangleIcon className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="font-medium">
            {budget.alert || "You've exceeded this budget."}
          </span>
        </div>
      ) : nearLimit ? (
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
          <AlertTriangleIcon className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="font-medium">Approaching budget limit.</span>
        </div>
      ) : (
        <div className="flex items-start gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700">
          <CheckCircleIcon className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="font-medium">On track</span>
        </div>
      )}
    </div>
  );
}



