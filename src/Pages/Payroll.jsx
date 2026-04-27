import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronDown, Clock, Wallet } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../auth/api";

function formatMoney(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "—";
  return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function periodHeading(payroll) {
  if (!payroll) return "—";
  if (payroll.period && String(payroll.period).trim()) return String(payroll.period).trim();
  const pk = payroll.period_key;
  if (!pk || pk === "legacy") return "Earlier record";
  const [y, m] = pk.split("-").map(Number);
  if (!y || !m) return pk;
  return new Date(y, m - 1, 1).toLocaleString(undefined, { month: "long", year: "numeric" });
}

function buildLineRows(payroll) {
  if (!payroll) return [];
  const out = [];
  const add = (section, arr) => {
    if (!Array.isArray(arr)) return;
    for (const row of arr) {
      out.push({
        section,
        description: String(row?.label ?? "").trim() || "—",
        amount: row?.amount,
      });
    }
  };
  add("Bonus & additions", payroll.bonuses);
  add("Deductions", payroll.deductions);
  add("Fines / cuts", payroll.fines_cuts);
  return out;
}

const tableWrap = "overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm";
const theadRow = "bg-[#FAFAFA] text-left text-xs font-semibold uppercase tracking-wide text-grey";
const th = "px-4 py-3 font-nunito";
const td = "px-4 py-3 font-nunito text-black";
const tdNum = "px-4 py-3 text-right font-nunito tabular-nums text-black";

export const Payroll = () => {
  const auth = useAuth();
  const [records, setRecords] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.token) return;
    let cancelled = false;
    setLoading(true);
    apiRequest("/payroll/me", { token: auth.token })
      .then((data) => {
        if (cancelled) return;
        const items = Array.isArray(data.items) ? data.items : [];
        setRecords(items);
        const firstKey = items[0]?.payroll?.period_key ?? null;
        setSelectedKey((prev) => {
          if (!items.length) return null;
          if (prev && items.some((it) => it.payroll?.period_key === prev)) return prev;
          return firstKey;
        });
      })
      .catch(() => {
        if (!cancelled) {
          setRecords([]);
          setSelectedKey(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [auth.token]);

  const current =
    records.find((r) => r.payroll && r.payroll.period_key === selectedKey) || records[0] || null;
  const payroll = current?.payroll ?? null;
  const summary = current?.summary ?? null;

  const lineRows = useMemo(() => buildLineRows(payroll), [payroll]);

  if (loading) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 font-montserrat">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-gray-600"
          aria-hidden
        />
        <p className="text-sm text-grey font-nunito">Loading payroll…</p>
      </div>
    );
  }

  const period = periodHeading(payroll);
  const updated = payroll?.updated_at ? new Date(payroll.updated_at).toLocaleString() : "—";

  return (
    <div className="flex w-full min-w-0 flex-col gap-8 pb-4 font-montserrat">
      <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-5 sm:px-8 sm:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-black">
                <Wallet className="h-6 w-6" strokeWidth={2} aria-hidden />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-black sm:text-2xl">My payroll</h1>
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-nunito text-sm text-grey">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0 text-black opacity-35" aria-hidden />
                    <span>
                      Period: <span className="font-medium text-black">{period}</span>
                    </span>
                  </span>
                  <span className="hidden text-gray-300 sm:inline">|</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-black opacity-35" aria-hidden />
                    <span>
                      Updated <span className="font-medium text-black">{updated}</span>
                    </span>
                  </span>
                </p>
              </div>
            </div>
            {records.length > 1 ? (
              <div className="flex w-full flex-col gap-1.5 sm:max-w-xs sm:shrink-0">
                <label
                  htmlFor="payroll-month-select"
                  className="text-[11px] font-bold uppercase tracking-wider text-grey font-nunito"
                >
                  Month
                </label>
                <div className="relative">
                  <select
                    id="payroll-month-select"
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-10 font-nunito text-sm font-medium text-black transition-colors hover:border-gray-300 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10"
                    value={selectedKey || ""}
                    onChange={(e) => setSelectedKey(e.target.value)}
                  >
                    {records.map(({ payroll: p }) => (
                      <option key={p.period_key} value={p.period_key}>
                        {periodHeading(p)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grey"
                    aria-hidden
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {payroll ? (
          <div className="flex flex-col gap-8 px-6 py-6 sm:px-8">
            <div>
              <h2 className="mb-3 font-montserrat text-sm font-semibold text-black">Summary</h2>
              <div className={tableWrap}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[320px] text-sm">
                    <thead>
                      <tr className={theadRow}>
                        <th className={th}>Category</th>
                        <th className={`${th} text-right`}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-gray-100">
                        <td className={td}>Base salary</td>
                        <td className={`${tdNum} font-medium`}>{formatMoney(summary?.base_salary)}</td>
                      </tr>
                      <tr className="border-t border-gray-100">
                        <td className={td}>Bonuses & additions</td>
                        <td className={`${tdNum} font-medium`}>{formatMoney(summary?.total_bonuses)}</td>
                      </tr>
                      <tr className="border-t border-gray-100">
                        <td className={td}>Deductions</td>
                        <td className={`${tdNum} font-medium`}>{formatMoney(summary?.total_deductions)}</td>
                      </tr>
                      <tr className="border-t border-gray-100">
                        <td className={td}>Fines / cuts</td>
                        <td className={`${tdNum} font-medium`}>{formatMoney(summary?.total_fines_cuts)}</td>
                      </tr>
                      <tr className="border-t-2 border-gray-200 bg-gray-50">
                        <td className={`${td} font-semibold`}>Net pay</td>
                        <td className={`${tdNum} text-lg font-bold text-[#1E6B78]`}>
                          {formatMoney(summary?.net_salary)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-3 font-montserrat text-sm font-semibold text-black">Line items</h2>
              <div className={tableWrap}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] text-sm">
                    <thead>
                      <tr className={theadRow}>
                        <th className={th}>Section</th>
                        <th className={th}>Description</th>
                        <th className={`${th} text-right`}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineRows.length ? (
                        lineRows.map((row, i) => (
                          <tr key={`${row.section}-${row.description}-${i}`} className="border-t border-gray-100">
                            <td className={`${td} text-grey`}>{row.section}</td>
                            <td className={td}>{row.description}</td>
                            <td className={`${tdNum} font-medium`}>{formatMoney(row.amount)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr className="border-t border-gray-100">
                          <td colSpan={3} className="px-4 py-10 text-center font-nunito text-sm text-grey">
                            No line items for this period.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {!payroll && (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-black opacity-60">
            <Wallet className="h-6 w-6" strokeWidth={1.5} aria-hidden />
          </div>
          <p className="mx-auto max-w-md font-nunito text-sm leading-relaxed text-grey">
            No payroll has been posted for your account yet. When finance saves your payroll for a month, it will show
            up here.
          </p>
        </div>
      )}
    </div>
  );
};
