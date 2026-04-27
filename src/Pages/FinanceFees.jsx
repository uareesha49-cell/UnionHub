import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { apiRequest, apiFetchBlob } from "../auth/api";
import { toast } from "sonner";
import { CustomToast } from "../components/CustomToast";
import { mediaData } from "../utils/mediaData";
import { Download } from "lucide-react";
import { ActionButton } from "../components/ActionButton";

export const FinanceFees = () => {
  const auth = useAuth();
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState("");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!auth.token) return;
    setLoading(true);
    try {
      const [sRes, fRes] = await Promise.all([
        apiRequest("/fees/students", { token: auth.token }),
        apiRequest("/fees", { token: auth.token }),
      ]);
      setStudents(sRes.students || []);
      setFees(fRes.fees || []);
    } catch {
      setStudents([]);
      setFees([]);
    } finally {
      setLoading(false);
    }
  }, [auth.token]);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  const studentOptions = useMemo(
    () =>
      [...students].sort((a, b) =>
        String(a.email || "").localeCompare(String(b.email || ""), undefined, { sensitivity: "base" })
      ),
    [students]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sid = Number(studentId);
    if (!Number.isFinite(sid) || sid <= 0) {
      toast.custom((t) => <CustomToast id={t} message="Select a student" type="error" />);
      return;
    }
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.custom((t) => <CustomToast id={t} message="Enter a valid amount" type="error" />);
      return;
    }
    if (!String(title || "").trim()) {
      toast.custom((t) => <CustomToast id={t} message="Fee title is required" type="error" />);
      return;
    }
    setSaving(true);
    try {
      await apiRequest("/fees", {
        method: "POST",
        token: auth.token,
        body: {
          student_user_id: sid,
          fee_title: String(title).trim(),
          amount: amt,
          notes: String(notes || "").trim(),
        },
      });
      toast.custom((t) => <CustomToast id={t} message="Fee added" type="success" />);
      setTitle("");
      setAmount("");
      setNotes("");
      await load();
    } catch {
      // toast in apiRequest
    } finally {
      setSaving(false);
    }
  };

  const downloadVoucher = async (feeId) => {
    try {
      const { blob, filename } = await apiFetchBlob(`/fees/${feeId}/voucher`, { token: auth.token });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // handled
    }
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h2 className="font-montserrat font-semibold text-lg text-[#1E6B78] mb-4">Add fee for a student</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-grey font-medium">Student</label>
            <select
              className="rounded-lg bg-gray-100 px-3 py-2 text-sm border-0"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            >
              <option value="">Select student…</option>
              {studentOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {(s.name || s.email || `ID ${s.id}`) + (s.email ? ` — ${s.email}` : "")}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-grey font-medium">Fee title</label>
            <input
              className="rounded-lg bg-gray-100 px-3 py-2 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Term 1 tuition"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-grey font-medium">Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="rounded-lg bg-gray-100 px-3 py-2 text-sm"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-sm text-grey font-medium">Notes (optional)</label>
            <input
              className="rounded-lg bg-gray-100 px-3 py-2 text-sm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional details"
            />
          </div>
          <div className="md:col-span-2">
            <ActionButton
              type="submit"
              loading={saving}
              disabled={loading}
              className="rounded-lg bg-[#1E6B78] text-white px-5 py-2 text-sm font-semibold min-h-[40px]"
            >
              Save fee
            </ActionButton>
          </div>
        </form>
        {!loading && studentOptions.length === 0 ? (
          <p className="text-sm text-grey mt-4">
            No student accounts yet. Add students on the Students page.
          </p>
        ) : null}
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b font-montserrat font-semibold text-[#1E6B78]">All fee records</div>
        {loading ? (
          <div className="p-8 text-center text-grey text-sm">Loading…</div>
        ) : fees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <img src={mediaData.Nomeeting} alt="" className="w-24 h-24 opacity-80 mb-4" />
            <p className="text-grey text-sm font-montserrat">No fees recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-grey">
                <tr>
                  <th className="px-4 py-3 font-medium">Voucher</th>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Fee</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium">Issued</th>
                  <th className="px-4 py-3 font-medium w-28"> </th>
                </tr>
              </thead>
              <tbody>
                {fees.map((f) => (
                  <tr key={f.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-mono text-xs">{f.voucher_code}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{f.student?.name || "—"}</div>
                      <div className="text-xs text-grey">{f.student?.email || ""}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{f.fee_title}</div>
                      {f.notes ? <div className="text-xs text-grey mt-0.5">{f.notes}</div> : null}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{Number(f.amount).toFixed(2)}</td>
                    <td className="px-4 py-3 text-grey text-xs whitespace-nowrap">
                      {f.created_at ? new Date(f.created_at).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => downloadVoucher(f.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E6B78] hover:underline"
                      >
                        <Download className="w-4 h-4" aria-hidden />
                        Voucher
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
