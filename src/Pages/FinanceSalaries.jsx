import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Plus } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../auth/api";
import { toast } from "sonner";
import { CustomToast } from "../components/CustomToast";
import { mediaData } from "../utils/mediaData";
import { ActionButton } from "../components/ActionButton";
import { formatMoney, prettyPeriodLabel, roleLabel, staffNumericId } from "../utils/payrollFormat";

const emptyLine = () => ({ label: "", amount: "" });

function currentYM() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function mapLinesFromPayroll(arr) {
  return (Array.isArray(arr) && arr.length ? arr : [emptyLine()]).map((x) => ({
    label: x.label ?? "",
    amount: x.amount != null ? String(x.amount) : "",
  }));
}

/** Must be declared outside the page component so React does not remount inputs on every keystroke. */
function PayrollLineEditor({ title, rows, setRows }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="font-semibold text-grey text-sm">{title}</label>
        <button
          type="button"
          className="text-xs text-[#1E6B78] font-semibold"
          onClick={() => setRows((prev) => [...prev, emptyLine()])}
        >
          + Add row
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {rows.map((row, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <input
              className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-sm"
              placeholder="Description"
              value={row.label}
              onChange={(e) =>
                setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, label: e.target.value } : r)))
              }
            />
            <input
              className="w-28 rounded-lg bg-gray-100 px-3 py-2 text-sm"
              placeholder="Amount"
              type="number"
              min="0"
              step="0.01"
              value={row.amount}
              onChange={(e) =>
                setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, amount: e.target.value } : r)))
              }
            />
            {rows.length > 1 ? (
              <button
                type="button"
                className="text-xs text-rose-600 px-1"
                onClick={() => setRows((prev) => prev.filter((_, i) => i !== idx))}
              >
                ✕
              </button>
            ) : (
              <span className="w-6" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export const FinanceSalaries = () => {
  const auth = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [manageLoading, setManageLoading] = useState(false);
  const [financePeriods, setFinancePeriods] = useState([]);
  const [selectedKey, setSelectedKey] = useState("");
  const [isAddingNewMonth, setIsAddingNewMonth] = useState(false);
  const [newMonthKey, setNewMonthKey] = useState(() => currentYM());
  const [baseSalary, setBaseSalary] = useState("");
  const [period, setPeriod] = useState("");
  const [bonuses, setBonuses] = useState([emptyLine()]);
  const [deductions, setDeductions] = useState([emptyLine()]);
  const [finesCuts, setFinesCuts] = useState([emptyLine()]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!auth.token) return;
    setLoading(true);
    try {
      const data = await apiRequest("/payroll", { token: auth.token });
      setItems(data.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [auth.token]);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  const resetEmptyPayrollForm = () => {
    setBaseSalary("0");
    setPeriod("");
    setBonuses([emptyLine()]);
    setDeductions([emptyLine()]);
    setFinesCuts([emptyLine()]);
  };

  const applyPayrollToForm = (p) => {
    if (!p) {
      resetEmptyPayrollForm();
      return;
    }
    setBaseSalary(String(p.base_salary ?? 0));
    setPeriod(p.period || "");
    setBonuses(mapLinesFromPayroll(p.bonuses));
    setDeductions(mapLinesFromPayroll(p.deductions));
    setFinesCuts(mapLinesFromPayroll(p.fines_cuts));
  };

  const openEdit = async (row) => {
    const staffId = staffNumericId(row.user);
    if (!Number.isFinite(staffId)) {
      toast.custom((t) => <CustomToast id={t} message="Missing employee id — refresh the page." type="error" />);
      return;
    }
    setEditing(row.user);
    setManageLoading(true);
    setFinancePeriods([]);
    setSelectedKey("");
    setIsAddingNewMonth(false);
    setNewMonthKey(currentYM());
    resetEmptyPayrollForm();
    try {
      const data = await apiRequest(`/payroll/manage/${staffId}`, { token: auth.token });
      const periods = Array.isArray(data?.periods) ? data.periods : [];
      setFinancePeriods(periods);
      if (periods.length > 0) {
        const first = periods[0].payroll;
        setSelectedKey(first.period_key);
        setIsAddingNewMonth(false);
        applyPayrollToForm(first);
      } else {
        setSelectedKey("");
        setIsAddingNewMonth(true);
        setNewMonthKey(currentYM());
        resetEmptyPayrollForm();
      }
    } catch {
      setFinancePeriods([]);
      setSelectedKey("");
      setIsAddingNewMonth(true);
      setNewMonthKey(currentYM());
      resetEmptyPayrollForm();
    } finally {
      setManageLoading(false);
    }
  };

  const onSelectPayrollMonth = (value) => {
    setSelectedKey(value);
    setIsAddingNewMonth(false);
    const entry = financePeriods.find((x) => x.payroll?.period_key === value);
    if (entry?.payroll) applyPayrollToForm(entry.payroll);
  };

  const startAddNewMonth = () => {
    setIsAddingNewMonth(true);
    setNewMonthKey(currentYM());
    resetEmptyPayrollForm();
  };

  const backToSavedMonths = () => {
    if (financePeriods.length === 0) return;
    const first = financePeriods[0].payroll;
    setIsAddingNewMonth(false);
    setSelectedKey(first.period_key);
    applyPayrollToForm(first);
  };

  const closeEdit = () => {
    setEditing(null);
    setSaving(false);
    setManageLoading(false);
    setFinancePeriods([]);
    setSelectedKey("");
    setIsAddingNewMonth(false);
  };

  const parseLines = (rows) =>
    rows
      .map((r) => ({
        label: String(r.label || "").trim() || "Item",
        amount: Math.max(0, Number(r.amount) || 0),
      }))
      .filter((r) => r.amount > 0);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editing || saving) return;
    const staffId = staffNumericId(editing);
    if (!Number.isFinite(staffId)) {
      toast.custom((t) => <CustomToast id={t} message="Missing employee id — refresh the page." type="error" />);
      return;
    }
    const period_key = isAddingNewMonth ? newMonthKey.trim() : selectedKey;
    if (!period_key) {
      toast.custom((t) => <CustomToast id={t} message="Choose a payroll month" type="error" />);
      return;
    }
    if (period_key !== "legacy" && !/^\d{4}-\d{2}$/.test(period_key)) {
      toast.custom((t) => <CustomToast id={t} message="Use the month picker (YYYY-MM)" type="error" />);
      return;
    }
    const periodLabel =
      period.trim() ||
      (period_key !== "legacy" ? prettyPeriodLabel(period_key, "") : "").trim() ||
      null;
    setSaving(true);
    try {
      await apiRequest(`/payroll/${staffId}`, {
        method: "PUT",
        token: auth.token,
        body: {
          period_key,
          period: periodLabel,
          base_salary: Number(baseSalary) || 0,
          bonuses: parseLines(bonuses),
          deductions: parseLines(deductions),
          fines_cuts: parseLines(finesCuts),
        },
      });
      toast.custom((t) => <CustomToast id={t} message="Payroll saved" type="success" />);
      closeEdit();
      await load();
    } catch {
      // apiRequest shows toast
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[240px] text-grey font-montserrat">Loading…</div>
    );
  }

  return (
    <div className="h-full font-montserrat flex flex-col gap-4">
      <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#FAFAFA] text-left text-grey font-semibold">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Base</th>
                <th className="px-4 py-3">Net</th>
                <th className="px-4 py-3">Latest period</th>
                <th className="px-4 py-3 text-center">Months</th>
                <th className="px-4 py-3 w-32 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-nunito">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-grey">
                    <img src={mediaData.Nomeeting} alt="" className="w-24 mx-auto mb-3 opacity-80" />
                    No employees found.
                  </td>
                </tr>
              ) : (
                items.map((row, i) => (
                  <tr key={row.user?.id ?? i} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-black">{row.user?.email}</td>
                    <td className="px-4 py-3">{roleLabel(row.user?.role)}</td>
                    <td className="px-4 py-3">{formatMoney(row.summary?.base_salary)}</td>
                    <td className="px-4 py-3 font-semibold text-[#1E6B78]">{formatMoney(row.summary?.net_salary)}</td>
                    <td className="px-4 py-3">
                      {row.payroll
                        ? prettyPeriodLabel(row.payroll.period_key, row.payroll.period)
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-center text-grey">{row.payroll_month_count ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {Number.isFinite(staffNumericId(row.user)) ? (
                          <Link
                            to={`/layout/finance-employee-payroll/${staffNumericId(row.user)}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-[#1E6B78] hover:bg-[#1E6B780d]"
                            title="View all payroll records"
                            aria-label="View all payroll records for this employee"
                          >
                            <Eye className="h-4 w-4" strokeWidth={2} />
                          </Link>
                        ) : (
                          <span
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-100 text-grey opacity-50"
                            title="Missing employee id"
                          >
                            <Eye className="h-4 w-4" strokeWidth={2} />
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-[#1E6B78] hover:bg-[#1E6B780d] shrink-0"
                          title="Manage payroll"
                          aria-label="Manage or add payroll for this employee"
                        >
                          <Plus className="h-4 w-4" strokeWidth={2} />
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

      {editing ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl">
            <h3 className="font-semibold text-lg text-black mb-1">Payroll for {editing.email}</h3>
            <p className="text-sm text-grey mb-4">{roleLabel(editing.role)}</p>
            {manageLoading ? (
              <div className="py-12 text-center text-grey text-sm">Loading payroll…</div>
            ) : (
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <label className="font-semibold text-grey text-sm">Payroll month</label>
                  {financePeriods.length > 0 && !isAddingNewMonth ? (
                    <button
                      type="button"
                      onClick={startAddNewMonth}
                      className="text-xs font-semibold text-[#1E6B78] hover:underline shrink-0"
                    >
                      New month
                    </button>
                  ) : null}
                </div>
                {financePeriods.length > 0 && !isAddingNewMonth ? (
                  <select
                    className="rounded-lg bg-gray-100 px-3 py-2 text-sm"
                    value={selectedKey}
                    onChange={(e) => onSelectPayrollMonth(e.target.value)}
                  >
                    {financePeriods.map(({ payroll: p }) => (
                      <option key={p.period_key} value={p.period_key}>
                        {prettyPeriodLabel(p.period_key, p.period)}
                      </option>
                    ))}
                  </select>
                ) : null}
                {isAddingNewMonth ? (
                  <div className="flex flex-col gap-2">
                    <input
                      type="month"
                      className="rounded-lg bg-gray-100 px-3 py-2 text-sm"
                      value={newMonthKey}
                      onChange={(e) => setNewMonthKey(e.target.value)}
                      required
                    />
                    {financePeriods.length > 0 ? (
                      <button
                        type="button"
                        onClick={backToSavedMonths}
                        className="text-xs font-semibold text-grey hover:text-black self-start"
                      >
                        ← Saved months
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-grey text-sm">Label (optional)</label>
                <input
                  className="rounded-lg bg-gray-100 px-3 py-2 text-sm"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder="Shown on payslip; defaults to month name if empty"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-grey text-sm">Base salary</label>
                <input
                  className="rounded-lg bg-gray-100 px-3 py-2"
                  type="number"
                  min="0"
                  step="0.01"
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(e.target.value)}
                  required
                />
              </div>
              <PayrollLineEditor title="Bonuses & extra additions" rows={bonuses} setRows={setBonuses} />
              <PayrollLineEditor title="Deductions" rows={deductions} setRows={setDeductions} />
              <PayrollLineEditor title="Fines & salary cuts" rows={finesCuts} setRows={setFinesCuts} />
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={closeEdit} className="px-5 py-2 rounded-full bg-grey text-white text-sm">
                  Cancel
                </button>
                <ActionButton
                  type="submit"
                  loading={saving}
                  className="px-5 py-2 rounded-full bg-[#1E6B78] text-white text-sm font-semibold min-h-[40px]"
                >
                  Save payroll
                </ActionButton>
              </div>
            </form>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
