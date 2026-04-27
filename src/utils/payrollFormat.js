export function formatMoney(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "—";
  return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function prettyPeriodLabel(periodKey, period) {
  if (period && String(period).trim()) return String(period).trim();
  if (!periodKey || periodKey === "legacy") return "Earlier record";
  const [y, m] = periodKey.split("-").map(Number);
  if (!y || !m) return periodKey;
  return new Date(y, m - 1, 1).toLocaleString(undefined, { month: "long", year: "numeric" });
}

export function roleLabel(r) {
  if (!r) return "";
  return String(r)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function staffNumericId(user) {
  const n = Number(user?.id);
  return Number.isFinite(n) ? n : NaN;
}
