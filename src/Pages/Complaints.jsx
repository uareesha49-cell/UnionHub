import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../auth/api";
import { toast } from "sonner";
import { CustomToast } from "../components/CustomToast";
import { CheckCircle2 } from "lucide-react";

function formatWhen(iso) {
  if (!iso) return "—";
  const t = Date.parse(String(iso));
  return Number.isFinite(t) ? new Date(t).toLocaleString() : "—";
}

function truncate(s, max) {
  const str = String(s || "");
  return str.length <= max ? str : `${str.slice(0, max)}…`;
}

export const Complaints = () => {
  const auth = useAuth();
  const isDirector = auth.user?.role === "director";

  const [complaints, setComplaints] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completingId, setCompletingId] = useState(null);

  const loadComplaints = useCallback(async () => {
    if (!auth.token) return;
    const path = isDirector
      ? "/director/users/complaints"
      : "/director/users/my-complaints";
    setLoadingList(true);
    try {
      const data = await apiRequest(path, { token: auth.token });
      setComplaints(data.complaints || []);
    } catch {
      setComplaints([]);
    } finally {
      setLoadingList(false);
    }
  }, [auth.token, isDirector]);

  useEffect(() => {
    loadComplaints().catch(() => {});
  }, [loadComplaints]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const subj = String(subject).trim();
    const det = String(details).trim();
    if (!subj || !det) {
      toast.custom((t) => <CustomToast id={t} message="Please enter a subject and details" type="error" />);
      return;
    }
    setSubmitting(true);
    try {
      await apiRequest("/director/users/complaints", {
        method: "POST",
        token: auth.token,
        body: { subject: subj, details: det },
      });
      await loadComplaints();
      setSubject("");
      setDetails("");
      toast.custom((t) => <CustomToast id={t} message="Complaint submitted" type="success" />);
    } catch {
      // errors toasts from apiRequest
    } finally {
      setSubmitting(false);
    }
  };

  const markComplete = async (id) => {
    if (!isDirector || completingId) return;
    setCompletingId(id);
    try {
      await apiRequest(`/director/users/complaints/${id}/complete`, { method: "PATCH", token: auth.token });
      toast.custom((t) => <CustomToast id={t} message="Marked as complete" type="success" />);
      await loadComplaints();
    } catch {
      // toast in apiRequest
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-6 font-montserrat">
      {!isDirector ? (
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="font-semibold text-lg text-[#1E6B78] mb-2">Submit a complaint</h2>
          <p className="text-sm text-grey mb-4">
            Describe your issue below. It is sent to the director. You can review your own submissions below; they
            cannot be edited or deleted from here.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-grey">Subject</label>
              <input
                className="rounded-lg bg-gray-100 px-3 py-2 text-sm border-0"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Short summary"
                maxLength={200}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-grey">Details</label>
              <textarea
                className="rounded-lg bg-gray-100 px-3 py-2 text-sm border-0 min-h-[120px] resize-y"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="What happened? What do you need?"
                maxLength={8000}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="self-start rounded-lg bg-[#1E6B78] text-white px-5 py-2 text-sm font-semibold disabled:opacity-50"
            >
              {submitting ? "Sending…" : "Submit complaint"}
            </button>
          </form>
        </div>
      ) : null}

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b font-semibold text-[#1E6B78]">
          {isDirector ? "All complaints" : "Your complaints"}
        </div>
        {loadingList ? (
          <div className="p-8 text-center text-grey text-sm">Loading…</div>
        ) : complaints.length === 0 ? (
          <div className="p-8 text-center text-grey text-sm">
            {isDirector ? "No complaints yet." : "You have not submitted any complaints yet."}
          </div>
        ) : isDirector ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-grey">
                <tr>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Details</th>
                  <th className="px-4 py-3 font-medium">From</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium w-36"> </th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id} className="border-t border-gray-100 align-top">
                    <td className="px-4 py-3 font-medium max-w-[160px]">{truncate(c.subject, 80)}</td>
                    <td className="px-4 py-3 text-grey max-w-[240px] whitespace-pre-wrap">{truncate(c.details, 160)}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{c.submitter?.name || "—"}</div>
                      <div className="text-xs text-grey break-all">{c.submitter?.email || "—"}</div>
                    </td>
                    <td className="px-4 py-3 text-xs capitalize">{c.submitter?.role?.replace(/_/g, " ") || "—"}</td>
                    <td className="px-4 py-3 text-xs text-grey whitespace-nowrap">{formatWhen(c.created_at)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          c.status === "resolved"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {c.status === "resolved" ? "Complete" : "Open"}
                      </span>
                      {c.resolved_at ? (
                        <div className="text-[11px] text-grey mt-1">Resolved {formatWhen(c.resolved_at)}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      {c.status === "open" ? (
                        <button
                          type="button"
                          disabled={completingId === c.id}
                          onClick={() => markComplete(c.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-700 text-emerald-800 px-2 py-1 text-xs font-semibold hover:bg-emerald-50 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" aria-hidden />
                          {completingId === c.id ? "…" : "Mark complete"}
                        </button>
                      ) : (
                        <span className="text-xs text-grey">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <p className="px-6 pt-4 pb-2 text-xs text-grey">
              Read-only. Contact the director if you need to add more information (submit a new complaint).
            </p>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-grey">
                <tr>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Details</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id} className="border-t border-gray-100 align-top">
                    <td className="px-4 py-3 font-medium max-w-[200px]">{c.subject}</td>
                    <td className="px-4 py-3 text-grey max-w-md whitespace-pre-wrap break-words">{c.details}</td>
                    <td className="px-4 py-3 text-xs text-grey whitespace-nowrap">{formatWhen(c.created_at)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          c.status === "resolved"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {c.status === "resolved" ? "Complete" : "Open"}
                      </span>
                      {c.resolved_at ? (
                        <div className="text-[11px] text-grey mt-1">Resolved {formatWhen(c.resolved_at)}</div>
                      ) : null}
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
