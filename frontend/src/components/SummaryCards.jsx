import { TrendingUpIcon, TrendingDownIcon, WalletIcon } from "lucide-react";
import { formatLKR } from "../utils/formatMoney.js";

const fmt = (val) => formatLKR(val);

export function SummaryCards({ totalIncome, totalExpense, balance }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
      <Card
        label="Total income"
        amount={fmt(totalIncome)}
        icon={<TrendingUpIcon className="h-5 w-5 text-emerald-600" />}
        iconBg="bg-emerald-100"
        valueClass="text-emerald-600"
        delta="+12.5% vs last month"
      />
      <Card
        label="Total expenses"
        amount={fmt(totalExpense)}
        icon={<TrendingDownIcon className="h-5 w-5 text-rose-600" />}
        iconBg="bg-rose-100"
        valueClass="text-rose-600"
        delta="-2.4% vs last month"
      />
      <Card
        label="Current balance"
        amount={fmt(balance)}
        icon={<WalletIcon className="h-5 w-5 text-blue-600" />}
        iconBg="bg-blue-100"
        valueClass="text-slate-900"
        delta="+5.2% vs last month"
      />
    </div>
  );
}

function Card({ label, amount, icon, iconBg, valueClass, delta }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${valueClass}`}>{amount}</div>
      <div className="text-xs font-medium text-emerald-600 mt-2">{delta}</div>
    </div>
  );
}
