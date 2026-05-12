/** Sri Lankan Rupee (LKR) formatting for display only — amounts are still stored as numbers. */

const lkr = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const lkrCompact = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatLKR(value) {
  return lkr.format(Number(value) || 0);
}

/** For chart axes / tight spaces */
export function formatLKRCompact(value) {
  return lkrCompact.format(Number(value) || 0);
}

/** Prefix +/− for transaction-style rows (amounts are stored positive). */
export function formatSignedLKR(amount, type) {
  const abs = Math.abs(Number(amount) || 0);
  const formatted = formatLKR(abs);
  if (type === "Expense") return `−${formatted}`;
  return `+${formatted}`;
}
