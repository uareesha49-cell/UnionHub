import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Eye } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../auth/api";
import { formatMoney, prettyPeriodLabel, roleLabel } from "../utils/payrollFormat";

export function FinanceEmployeePayroll() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const [head, setHead] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);

  const numericId = Number(userId);

  useEffect(() => {
    if (!auth.token || !Number.isFinite(numericId)) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    apiRequest(`/payroll/manage/${numericId}`, { token: auth.token })
      .then((data) => {
        if (cancelled) return;
        setHead(data?.user ?? null);
        setPeriods(Array.isArray(data?.periods) ? data.periods : []);
      })
      .catch(() => {
        if (!cancelled) {
          setHead(null);
          setPeriods([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [auth.token, numericId]);

  const backPath = "/layout/finance-salaries";

  if (!Number.isFinite(numericId)) {
    return (
      <div className="font-montserrat p-6">
        <p className="text-grey font-nunito">Invalid employee id.</p>
        <Link to={backPath} className="mt-4 inline-block text-[#1E6B78] font-semibold underline text-sm">
          Back to salary management
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full font-montserrat flex flex-col gap-4">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => navigate(backPath)}
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-[#1E6B78] hover:bg-[#1E6B780d]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Salary management
        </button>
        <span className="text-grey text-sm font-nunito hidden sm:inline">Payroll history</span>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1E6B7814] text-[#1E6B78]">
              <Eye className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <h1 className="font-semibold text-xl text-black">Payroll records</h1>
              {head ? (
                <p className="text-sm text-grey mt-1 font-nunito">
                  {head.email}
                  <span className="mx-2">·</span>
                  {roleLabel(head.role)}
                </p>
              ) : loading ? null : (
                <p className="text-sm text-grey mt-1 font-nunito">Employee #{numericId}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {loading ? (
            <div className="py-16 text-center text-grey text-sm font-nunito">Loading records…</div>
          ) : periods.length === 0 ? (
            <p className="text-center text-grey text-sm py-12 font-nunito">
              No payroll has been saved for this employee yet.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-sm font-nunito">
                <thead className="bg-[#FAFAFA] text-left text-grey font-semibold">
                  <tr>
                    <th className="px-4 py-3">Period</th>
                    <th className="px-4 py-3 text-right">Base</th>
                    <th className="px-4 py-3 text-right hidden sm:table-cell">Bonuses</th>
                    <th className="px-4 py-3 text-right hidden sm:table-cell">Deductions</th>
                    <th className="px-4 py-3 text-right hidden md:table-cell">Fines / cuts</th>
                    <th className="px-4 py-3 text-right">Net paid</th>
                    <th className="px-4 py-3 text-grey font-medium hidden lg:table-cell">Last updated</th>
                  </tr>
                </thead>
                <tbody>
                  {periods.map(({ payroll: p, summary: s }) => (
                    <tr key={p.period_key} className="border-t border-gray-100">
                      <td className="px-4 py-3 text-black font-medium">
                        {prettyPeriodLabel(p.period_key, p.period)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatMoney(s?.base_salary)}</td>
                      <td className="px-4 py-3 text-right tabular-nums hidden sm:table-cell">
                        {formatMoney(s?.total_bonuses)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums hidden sm:table-cell">
                        {formatMoney(s?.total_deductions)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums hidden md:table-cell">
                        {formatMoney(s?.total_fines_cuts)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[#1E6B78] tabular-nums">
                        {formatMoney(s?.net_salary)}
                      </td>
                      <td className="px-4 py-3 text-grey text-xs hidden lg:table-cell">
                        {p.updated_at ? new Date(p.updated_at).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
