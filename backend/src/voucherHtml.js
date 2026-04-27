export function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildVoucherHtml({ fee, studentName, studentEmail, issuerEmail }) {
  const amount = Number(fee.amount);
  const amtStr = Number.isFinite(amount) ? amount.toFixed(2) : escapeHtml(fee.amount);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Fee voucher ${escapeHtml(fee.voucher_code)}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 640px; margin: 40px auto; padding: 24px; color: #111; }
    h1 { font-size: 1.25rem; color: #1E6B78; margin: 0 0 8px; }
    .code { font-size: 1.1rem; font-weight: 700; letter-spacing: 0.05em; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; }
    th, td { text-align: left; padding: 10px 0; border-bottom: 1px solid #e5e5e5; }
    .amount { font-size: 1.35rem; font-weight: 700; }
    footer { margin-top: 32px; font-size: 0.85rem; color: #666; }
  </style>
</head>
<body>
  <h1>Union Hub — Fee voucher</h1>
  <p class="code">${escapeHtml(fee.voucher_code)}</p>
  <table>
    <tr><th>Student</th><td>${escapeHtml(studentName || studentEmail || "—")}</td></tr>
    <tr><th>Email</th><td>${escapeHtml(studentEmail || "—")}</td></tr>
    <tr><th>Fee</th><td>${escapeHtml(fee.fee_title)}</td></tr>
    <tr><th>Amount</th><td class="amount">${amtStr}</td></tr>
    ${fee.notes ? `<tr><th>Notes</th><td>${escapeHtml(fee.notes)}</td></tr>` : ""}
    <tr><th>Issued</th><td>${escapeHtml(fee.created_at || "—")}</td></tr>
    <tr><th>Recorded by</th><td>${escapeHtml(issuerEmail || "—")}</td></tr>
  </table>
  <footer>This document was generated from Union Hub fee records.</footer>
</body>
</html>`;
}
