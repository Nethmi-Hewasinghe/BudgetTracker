import "./summaryCards.css";

export function SummaryCards({ totalIncome, totalExpense, balance }) {
  return (
    <div className="summaryGrid">
      <div className="card summaryCard">
        <div className="summaryLabel">Total income</div>
        <div className="summaryValue income">${(totalIncome || 0).toFixed(2)}</div>
      </div>
      <div className="card summaryCard">
        <div className="summaryLabel">Total expenses</div>
        <div className="summaryValue expense">${(totalExpense || 0).toFixed(2)}</div>
      </div>
      <div className="card summaryCard">
        <div className="summaryLabel">Current balance</div>
        <div className="summaryValue">${(balance || 0).toFixed(2)}</div>
      </div>
    </div>
  );
}

