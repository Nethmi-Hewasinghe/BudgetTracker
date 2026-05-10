import "./budgetCard.css";

export function BudgetCard({ budget, onDelete }) {
  const used = Number(budget.actualSpent || 0);
  const total = Number(budget.amount || 0);
  const percent = total === 0 ? 0 : Math.min(100, (used / total) * 100);
  const over = Boolean(budget.isOverBudget);

  return (
    <div className="card budgetCard">
      <div className="budgetTop">
        <div>
          <div className="budgetName">{budget.category?.name || "Category"}</div>
          <div className="muted" style={{ fontSize: 12 }}>
            {budget.month}/{budget.year}
          </div>
        </div>
        <button className="btn btnDanger" onClick={onDelete} type="button">
          Delete
        </button>
      </div>

      <div className="budgetNumbers">
        <div>
          <div className="muted" style={{ fontSize: 12 }}>
            Budget
          </div>
          <div style={{ fontWeight: 900 }}>${total.toFixed(2)}</div>
        </div>
        <div>
          <div className="muted" style={{ fontSize: 12 }}>
            Actual
          </div>
          <div style={{ fontWeight: 900, color: over ? "#b91c1c" : "inherit" }}>
            ${used.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="bar">
        <div className="barFill" style={{ width: `${percent}%`, background: over ? "#ef4444" : "#6366f1" }} />
      </div>

      {budget.alert ? (
        <div className="budgetAlert">{budget.alert}</div>
      ) : (
        <div className="muted" style={{ fontSize: 12 }}>
          Remaining: ${(Number(budget.remaining || 0)).toFixed(2)}
        </div>
      )}
    </div>
  );
}

