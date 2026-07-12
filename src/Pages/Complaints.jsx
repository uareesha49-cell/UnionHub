import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../auth/api";
import { toast } from "sonner";
import { CustomToast } from "../components/CustomToast";
import { ActionButton } from "../components/ActionButton";

function formatWhen(iso) {
  if (!iso) return "—";
  const t = Date.parse(String(iso));
  return Number.isFinite(t) ? new Date(t).toLocaleString() : "—";
}

function truncate(s, max) {
  const str = String(s || "");
  return str.length <= max ? str : `${str.slice(0, max)}…`;
}

const RECIPIENT_ROLES = ["director", "principal", "vice_principal", "tech_staff"];

export const Complaints = () => {
  const auth = useAuth();
  const userRole = auth.user?.role;
  const canSubmit = userRole !== "director";
  const canReceive = RECIPIENT_ROLES.includes(userRole);
  
  const [viewMode, setViewMode] = useState(canReceive ? "received" : "sent");
  const [complaints, setComplaints] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completingId, setCompletingId] = useState(null);

  const loadRecipients = useCallback(async () => {
    if (!canSubmit) return;
    setLoadingRecipients(true);
    try {
      const data = await apiRequest("/director/users/complaint-recipients", { token: auth.token });
      setRecipients(data.recipients || []);
    } catch {
      setRecipients([]);
    } finally {
      setLoadingRecipients(false);
    }
  }, [auth.token, canSubmit]);

  const loadComplaints = useCallback(async () => {
    if (!auth.token) return;
    setLoadingList(true);
    try {
      let data;
      if (viewMode === "received" && canReceive) {
        data = await apiRequest("/director/users/my-received-complaints", { token: auth.token });
      } else {
        data = await apiRequest("/director/users/my-complaints", { token: auth.token });
      }
      setComplaints(data.complaints || []);
    } catch {
      setComplaints([]);
    } finally {
      setLoadingList(false);
    }
  }, [auth.token, viewMode, canReceive]);

  useEffect(() => {
    loadRecipients().catch(() => {});
  }, [loadRecipients]);

  useEffect(() => {
    loadComplaints().catch(() => {});
  }, [loadComplaints]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const subj = String(subject).trim();
    const det = String(details).trim();
    const recipientId = Number(selectedRecipient);
    if (!subj || !det || !Number.isFinite(recipientId)) {
      toast.custom((t) => <CustomToast id={t} message="Please fill all fields" type="error" />);
      return;
    }
    setSubmitting(true);
    try {
      await apiRequest("/director/users/complaints", {
        method: "POST",
        token: auth.token,
        body: { subject: subj, details: det, assigned_to: recipientId },
      });
      await loadComplaints();
      setSubject("");
      setDetails("");
      setSelectedRecipient("");
      toast.custom((t) => <CustomToast id={t} message="Complaint submitted" type="success" />);
    } catch {
      // errors toasts from apiRequest
    } finally {
      setSubmitting(false);
    }
  };

  const markComplete = async (id) => {
    if (completingId) return;
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

  const getDisplayName = (user) => {
    if (!user) return "—";
    if (user.name) return user.name;
    return user.email;
  };

  const getRoleDisplay = (role) => {
    if (!role) return "—";
    return role.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-6 font-montserrat">
      {/* View Toggle */}
      {canSubmit && canReceive && (
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("sent")}
            className={`px-4 py-2 rounded-lg border ${viewMode === "sent" ? "bg-[#1E6B78] text-white" : "bg-white text-gray-700"}`}
          >
            Sent Complaints
          </button>
          <button
            onClick={() => setViewMode("received")}
            className={`px-4 py-2 rounded-lg border ${viewMode === "received" ? "bg-[#1E6B78] text-white" : "bg-white text-gray-700"}`}
          >
            Received Complaints
          </button>
        </div>
      )}

      {/* Submit Form */}
      {canSubmit && viewMode === "sent" && (
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="font-semibold text-lg text-[#1E6B78] mb-2">Submit a complaint</h2>
          <p className="text-sm text-gray-600 mb-4">
            Describe your issue and choose who to send it to.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">To</label>
              <select
                className="rounded-lg bg-gray-100 px-3 py-2 text-sm border-0"
                value={selectedRecipient}
                onChange={(e) => setSelectedRecipient(e.target.value)}
                disabled={loadingRecipients}
              >
                <option value="">Select recipient</option>
                {recipients.map((r) => (
                  <option key={r.id} value={r.id}>
                    {getDisplayName(r)} ({getRoleDisplay(r.role)})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Subject</label>
              <input
                className="rounded-lg bg-gray-100 px-3 py-2 text-sm border-0"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Short summary"
                maxLength={200}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Details</label>
              <textarea
                className="rounded-lg bg-gray-100 px-3 py-2 text-sm border-0 min-h-[120px] resize-y"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="What happened? What do you need?"
                maxLength={8000}
              />
            </div>
            <ActionButton
              type="submit"
              loading={submitting}
              className="self-start rounded-lg bg-[#1E6B78] text-white px-5 py-2 text-sm font-semibold min-h-[40px]"
            >
              Submit complaint
            </ActionButton>
          </form>
        </div>
      )}

      {/* Complaints List */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b font-semibold text-[#1E6B78]">
          {viewMode === "received" ? "Received Complaints" : "Your Complaints"}
        </div>
        {loadingList ? (
          <div className="p-8 text-center text-gray-500 text-sm">Loading…</div>
        ) : complaints.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            {viewMode === "received" ? "No complaints received yet." : "No complaints submitted yet."}
          </div>
        ) : viewMode === "received" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
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
                    <td className="px-4 py-3 text-gray-600 max-w-[240px] whitespace-pre-wrap">{truncate(c.details, 160)}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{getDisplayName(c.submitter)}</div>
                      <div className="text-xs text-gray-500 break-all">{c.submitter?.email || "—"}</div>
                    </td>
                    <td className="px-4 py-3 text-xs capitalize">{getRoleDisplay(c.submitter?.role)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatWhen(c.created_at)}</td>
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
                        <div className="text-[11px] text-gray-500 mt-1">Resolved {formatWhen(c.resolved_at)}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      {c.status === "open" ? (
                        <ActionButton
                          type="button"
                          loading={completingId === c.id}
                          onClick={() => markComplete(c.id)}
                          className="rounded-lg border border-emerald-700 text-emerald-800 px-2 py-1 text-xs font-semibold hover:bg-emerald-50 min-h-[32px]"
                        >
                          Mark complete
                        </ActionButton>
                      ) : (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Details</th>
                  <th className="px-4 py-3 font-medium">To</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id} className="border-t border-gray-100 align-top">
                    <td className="px-4 py-3 font-medium max-w-[200px]">{c.subject}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-md whitespace-pre-wrap break-words">{c.details}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{getDisplayName(c.assignee)}</div>
                      <div className="text-xs text-gray-500 capitalize">{getRoleDisplay(c.assignee?.role)}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatWhen(c.created_at)}</td>
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
                        <div className="text-[11px] text-gray-500 mt-1">Resolved {formatWhen(c.resolved_at)}</div>
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
