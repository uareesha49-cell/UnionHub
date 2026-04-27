import { useAuth } from "../auth/AuthContext";
import { apiFetchBlob } from "../auth/api";
import { useStudentMe } from "../hooks/useStudentMe";
import { Download } from "lucide-react";

export const StudentVouchers = () => {
  const auth = useAuth();
  const { payload, loading } = useStudentMe(auth.token);
  const fees = payload?.fees || [];

  const downloadVoucher = async (feeId) => {
    try {
      const { blob, filename } = await apiFetchBlob(`/auth/student/fees/${feeId}/voucher`, {
        token: auth.token,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // handled in apiFetchBlob
    }
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b font-montserrat font-semibold text-[#1E6B78]">Vouchers</div>
        {loading ? (
          <div className="p-8 text-center text-grey text-sm">Loading…</div>
        ) : fees.length === 0 ? (
          <div className="p-8 text-center text-grey text-sm font-montserrat">
            No fee records yet. When finance adds a fee to your account, it will appear here with a downloadable
            voucher.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-grey">
                <tr>
                  <th className="px-4 py-3 font-medium">Voucher</th>
                  <th className="px-4 py-3 font-medium">Fee</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium">Issued</th>
                  <th className="px-4 py-3 font-medium w-32"> </th>
                </tr>
              </thead>
              <tbody>
                {fees.map((f) => (
                  <tr key={f.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-mono text-xs">{f.voucher_code}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{f.fee_title}</div>
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
                        className="inline-flex items-center gap-1 rounded-lg border border-[#1E6B78] text-[#1E6B78] px-3 py-1.5 text-xs font-semibold hover:bg-[#1E6B7808]"
                      >
                        <Download className="w-4 h-4" aria-hidden />
                        Download
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
