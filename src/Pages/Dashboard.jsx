import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircleHelp, LayoutDashboard, MessageSquareWarning, Receipt } from "lucide-react";
import { Box } from "../components/Box";
import { mediaData } from "../utils/mediaData";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../auth/api";
import { useStudentMe } from "../hooks/useStudentMe";
export const Dashboard = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const role = auth.user?.role;
  const isStudent = role === "student";
  const isDirectorOrPrincipal = role === "director" || role === "principal" || role === "vice_principal";
  const { payload: studentPayload, loading: studentLoading } = useStudentMe(isStudent ? auth.token : null);
  const [meetings, setMeetings] = useState([]);
  const [news, setNews] = useState([]);
  const [polls, setPolls] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [directorUsers, setDirectorUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth.token) return;
    let cancelled = false;
    setIsLoading(true);

    Promise.allSettled([
      apiRequest("/content/meetings", { token: auth.token }),
      apiRequest("/content/news", { token: auth.token }),
      apiRequest("/content/votes", { token: auth.token }),
      apiRequest("/content/notifications", { token: auth.token }),
      isDirectorOrPrincipal ? apiRequest("/director/users", { token: auth.token }) : Promise.resolve({ users: [] }),
      isDirectorOrPrincipal ? apiRequest("/director/users/students", { token: auth.token }) : Promise.resolve({ students: [] }),
    ])
      .then((results) => {
        if (cancelled) return;
        const getValue = (idx, fallback) =>
          results[idx]?.status === "fulfilled" ? results[idx].value : fallback;

        const meetingsRes = getValue(0, { items: [] });
        const newsRes = getValue(1, { items: [] });
        const votesRes = getValue(2, { items: [] });
        const notificationsRes = getValue(3, { items: [] });
        const directorUsersRes = getValue(4, { users: [] });
        const studentsRes = getValue(5, { students: [] });

        setMeetings((meetingsRes.items || []).map((i) => ({ id: i.id, ...(i.data || {}) })));
        setNews(
          (newsRes.items || []).map((i) => ({
            id: i.id,
            created_at: i.created_at,
            updated_at: i.updated_at,
            ...(i.data || {}),
          }))
        );
        setPolls((votesRes.items || []).map((i) => ({ id: i.id, ...(i.data || {}) })));

        setNotifications(
          (notificationsRes.items || []).map((i) => ({
            id: i.id,
            created_at: i.created_at,
            updated_at: i.updated_at,
            ...(i.data || {}),
          }))
        );
        setDirectorUsers(Array.isArray(directorUsersRes.users) ? directorUsersRes.users : []);
        setStudents(Array.isArray(studentsRes.students) ? studentsRes.students : []);
      })
      .catch(() => {})
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [auth.token, isDirectorOrPrincipal]);

  const meetingStats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const withTime = meetings
      .map((m) => {
        const dateStr = m.date ? String(m.date) : "";
        const startStr = m.startTime ? String(m.startTime) : "00:00";
        const t = Date.parse(`${dateStr}T${startStr}`);
        return { m, time: Number.isFinite(t) ? t : null };
      })
      .filter((x) => x.time !== null);

    const upcoming = withTime.filter((x) => x.time >= today).sort((a, b) => a.time - b.time);
    const next = upcoming[0]?.m || null;

    const formatDate = (dateStr) => {
      const t = Date.parse(String(dateStr));
      if (!Number.isFinite(t)) return "—";
      return new Date(t).toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" });
    };

    return {
      total: meetings.length,
      upcomingCount: upcoming.length,
      nextTitle: next?.title || "—",
      nextWhen: next?.date ? formatDate(next.date) : "—",
    };
  }, [meetings]);

  const voteStats = useMemo(() => {
    const totalCandidates = polls.reduce((sum, p) => sum + (Array.isArray(p.candidates) ? p.candidates.length : 0), 0);
    const totalVotes = polls.reduce((sum, p) => {
      if (!Array.isArray(p.candidates)) return sum;
      return (
        sum +
        p.candidates.reduce((s, c) => {
          const v = Number(c?.votes);
          return s + (Number.isFinite(v) ? v : 0);
        }, 0)
      );
    }, 0);
    return { totalPolls: polls.length, totalCandidates, totalVotes };
  }, [polls]);

  const newsStats = useMemo(() => {
    const sorted = news
      .slice()
      .sort((a, b) => Date.parse(b.updated_at || b.created_at || 0) - Date.parse(a.updated_at || a.created_at || 0));
    const latest = sorted[0] || null;
    const formatDateTime = (iso) => {
      const t = Date.parse(String(iso));
      if (!Number.isFinite(t)) return "—";
      return new Date(t).toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
    };
    return {
      total: news.length,
      latestTitle: latest?.title || "—",
      latestWhen: latest?.updated_at || latest?.created_at ? formatDateTime(latest.updated_at || latest.created_at) : "—",
    };
  }, [news]);

  const employeeStats = useMemo(() => {
    const allowedRoles = new Set(["employee", "teacher", "tech_staff", "principal", "vice_principal"]);
    const rows = (Array.isArray(directorUsers) ? directorUsers : []).filter((u) => allowedRoles.has(u?.role));

    const counts = rows.reduce(
      (acc, u) => {
        acc.total += 1;
        if (u.role === "employee") acc.employees += 1;
        if (u.role === "teacher") acc.teachers += 1;
        if (u.role === "tech_staff") acc.techStaff += 1;
        if (u.role === "principal") acc.principals += 1;
        if (u.role === "vice_principal") acc.vicePrincipals += 1;
        return acc;
      },
      { total: 0, employees: 0, teachers: 0, techStaff: 0, principals: 0, vicePrincipals: 0 }
    );

    const sorted = rows
      .slice()
      .sort((a, b) => Date.parse(b.created_at || 0) - Date.parse(a.created_at || 0));
    const latest = sorted[0] || null;

    const formatDateTime = (iso) => {
      const t = Date.parse(String(iso));
      if (!Number.isFinite(t)) return "—";
      return new Date(t).toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
    };

    return {
      ...counts,
      latestEmail: latest?.email || "—",
      latestWhen: latest?.created_at ? formatDateTime(latest.created_at) : "—",
    };
  }, [directorUsers]);

  const studentStats = useMemo(() => {
    const rows = Array.isArray(students) ? students : [];
    const sorted = rows
      .slice()
      .sort((a, b) => Date.parse(b.created_at || 0) - Date.parse(a.created_at || 0));
    const latest = sorted[0] || null;

    const formatDateTime = (iso) => {
      const t = Date.parse(String(iso));
      if (!Number.isFinite(t)) return "—";
      return new Date(t).toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
    };

    return {
      total: rows.length,
      latestEmail: latest?.email || "—",
      latestWhen: latest?.created_at ? formatDateTime(latest.created_at) : "—",
    };
  }, [students]);

  const notificationStats = useMemo(() => {
    const sorted = notifications
      .slice()
      .sort((a, b) => Date.parse(b.updated_at || b.created_at || 0) - Date.parse(a.updated_at || a.created_at || 0));
    const latest = sorted[0] || null;

    const settingsSorted = sorted.filter((n) => n?.kind === "reminder_settings");
    const latestSettings = settingsSorted[0] || null;

    const formatDateTime = (iso) => {
      const t = Date.parse(String(iso));
      if (!Number.isFinite(t)) return "—";
      return new Date(t).toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
    };

    const enabled = Boolean(latestSettings?.enabled);
    const time = latestSettings?.selectedTime ?? null;

    return {
      total: notifications.length,
      enabled,
      time: time ? String(time) : "—",
      latestTitle: latest?.title || "—",
      latestWhen: latest?.updated_at || latest?.created_at ? formatDateTime(latest.updated_at || latest.created_at) : "—",
    };
  }, [notifications]);

  const studentPortalStats = useMemo(() => {
    const fees = Array.isArray(studentPayload?.fees) ? studentPayload.fees : [];
    const latestFee = fees
      .slice()
      .sort((a, b) => Date.parse(b.created_at || 0) - Date.parse(a.created_at || 0))[0];
    const feeTotal = fees.reduce((sum, fee) => {
      const amount = Number(fee?.amount);
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);
    return {
      feeCount: fees.length,
      feeTotal,
      latestVoucher: latestFee?.voucher_code || "—",
    };
  }, [studentPayload]);

  const StatCard = ({ title, icon, accent, headline, rows, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-grey font-montserrat font-semibold text-[13px] tracking-wide">
            {title}
          </div>
          <div
            className={`text-black font-montserrat font-semibold leading-tight mt-1 truncate ${
              headline === "No upcoming meetings" ? "text-[18px]" : "text-[22px]"
            }`}
          >
            {headline}
          </div>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
          <img src={icon} alt="" className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 grid gap-1">
        {rows.map((r) => (
          <div key={r.label} className="text-[12px] text-grey font-montserrat flex justify-between gap-3">
            <span className="truncate">{r.label}</span>
            <span className="text-black font-semibold">{r.value}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 text-[12px] text-grey font-montserrat">
        {isLoading ? "Loading…" : "Click to open"}
      </div>
    </button>
  );

  const StudentCard = ({ title, Icon, accent, headline, rows, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-grey font-montserrat font-semibold text-[13px] tracking-wide">{title}</div>
          <div className="text-black font-montserrat font-semibold text-[22px] leading-tight mt-1 truncate">{headline}</div>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
          <Icon className="w-5 h-5 text-[#1E6B78]" strokeWidth={2} aria-hidden />
        </div>
      </div>

      <div className="mt-4 grid gap-1">
        {rows.map((r) => (
          <div key={r.label} className="text-[12px] text-grey font-montserrat flex justify-between gap-3">
            <span className="truncate">{r.label}</span>
            <span className="text-black font-semibold">{r.value}</span>
          </div>
        ))}
      </div>
    </button>
  );

  return (
    <div className="flex flex-col gap-6">
      {isStudent ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <StudentCard
            title="My Account"
            Icon={LayoutDashboard}
            accent="bg-[#05B9B926]"
            headline={studentLoading ? "—" : "Student portal"}
            rows={[
              { label: "Profile", value: auth.user?.email || "—" },
              { label: "Quick links", value: "Profile, FAQ" },
              { label: "Status", value: studentLoading ? "Loading…" : "Ready" },
            ]}
            onClick={() => navigate("/layout/student-home")}
          />

          <StudentCard
            title="Vouchers"
            Icon={Receipt}
            accent="bg-[#007FFF26]"
            headline={studentLoading ? "—" : `${studentPortalStats.feeCount} ${studentPortalStats.feeCount === 1 ? "record" : "records"}`}
            rows={[
              { label: "Latest voucher", value: studentLoading ? "—" : studentPortalStats.latestVoucher },
              { label: "Total amount", value: studentLoading ? "—" : studentPortalStats.feeTotal.toFixed(2) },
              { label: "Action", value: "Open vouchers" },
            ]}
            onClick={() => navigate("/layout/student-vouchers")}
          />

          <StudentCard
            title="Support"
            Icon={MessageSquareWarning}
            accent="bg-[#FF8A1426]"
            headline="Complaints & FAQ"
            rows={[
              { label: "Complaints", value: "Raise issue" },
              { label: "FAQ", value: "View answers" },
              { label: "Account", value: "Update profile" },
            ]}
            onClick={() => navigate("/layout/complaints")}
          />

          <StudentCard
            title="FAQ"
            Icon={CircleHelp}
            accent="bg-[#9B05B926]"
            headline="Questions"
            rows={[
              { label: "Guides", value: "Policies & help" },
              { label: "Common issues", value: "Available" },
              { label: "Open", value: "Go to FAQ" },
            ]}
            onClick={() => navigate("/layout/faq")}
          />
        </div>
      ) : null}

      {!isStudent ? (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <StatCard
          title="Meetings"
          icon={mediaData.Meetings}
          accent="bg-[#05B9B926]"
          headline={
            isLoading ? "—" : meetingStats.upcomingCount > 0 ? `${meetingStats.upcomingCount} upcoming` : "No upcoming meetings"
          }
          rows={
            isLoading
              ? [
                  { label: "Total meetings", value: "—" },
                  { label: "Next meeting", value: "—" },
                  { label: "Next date", value: "—" },
                ]
              : meetingStats.upcomingCount > 0
                ? [
                    { label: "Total meetings", value: meetingStats.total },
                    { label: "Next meeting", value: meetingStats.nextTitle },
                    { label: "Next date", value: meetingStats.nextWhen },
                  ]
                : [
                    { label: "Total meetings", value: meetingStats.total },
                    { label: "Upcoming", value: 0 },
                    { label: "Status", value: "No upcoming meetings" },
                  ]
          }
          onClick={() => navigate("/layout/meetings")}
        />

        <StatCard
          title="Vote"
          icon={mediaData.Vote}
          accent="bg-[#FF8A1426]"
          headline={
            isLoading
              ? "—"
              : `${voteStats.totalPolls} ${voteStats.totalPolls === 1 ? "poll" : "polls"}`
          }
          rows={[
            { label: "Candidates", value: isLoading ? "—" : voteStats.totalCandidates },
            { label: "Votes cast", value: isLoading ? "—" : voteStats.totalVotes },
            { label: "Total polls", value: isLoading ? "—" : voteStats.totalPolls },
          ]}
          onClick={() => navigate("/layout/vote")}
        />

        <StatCard
          title="News & Updates"
          icon={mediaData.News}
          accent="bg-[#9B05B926]"
          headline={
            isLoading
              ? "—"
              : `${newsStats.total} ${newsStats.total === 1 ? "post" : "posts"}`
          }
          rows={[
            { label: "Latest", value: isLoading ? "—" : newsStats.latestTitle },
            { label: "Updated", value: isLoading ? "—" : newsStats.latestWhen },
            { label: "Total posts", value: isLoading ? "—" : newsStats.total },
          ]}
          onClick={() => navigate("/layout/news")}
        />

        {isDirectorOrPrincipal ? (
          <StatCard
            title="Employees"
            icon={mediaData.Employees}
            accent="bg-[#007FFF26]"
            headline={
              isLoading
                ? "—"
                : `${employeeStats.total} ${employeeStats.total === 1 ? "account" : "accounts"}`
            }
            rows={[
              { label: "Principals", value: isLoading ? "—" : employeeStats.principals },
              { label: "Vice Principals", value: isLoading ? "—" : employeeStats.vicePrincipals > 0 ? employeeStats.vicePrincipals : "N/A" },
              { label: "Teachers", value: isLoading ? "—" : employeeStats.teachers },
              { label: "Tech Staff", value: isLoading ? "—" : employeeStats.techStaff },
            ]}
            onClick={() => navigate("/layout/employees")}
          />
        ) : null}

        {isDirectorOrPrincipal ? (
          <StatCard
            title="Students"
            icon={mediaData.Students}
            accent="bg-[#22C55E26]"
            headline={
              isLoading
                ? "—"
                : `${studentStats.total} ${studentStats.total === 1 ? "student" : "students"}`
            }
            rows={[
              { label: "Latest account", value: isLoading ? "—" : studentStats.latestEmail },
              { label: "Added", value: isLoading ? "—" : studentStats.latestWhen },
              { label: "Total students", value: isLoading ? "—" : studentStats.total },
            ]}
            onClick={() => navigate("/layout/students")}
          />
        ) : null}

        {isDirectorOrPrincipal ? (
          <StatCard
            title="Notifications"
            icon={mediaData.Notification}
            accent="bg-[#8B5CF626]"
            headline={isLoading ? "—" : notificationStats.enabled ? "Reminders ON" : "Reminders OFF"}
            rows={[
              { label: "Reminder time", value: isLoading ? "—" : notificationStats.time },
              { label: "Latest", value: isLoading ? "—" : notificationStats.latestTitle },
              { label: "Total notifications", value: isLoading ? "—" : notificationStats.total },
            ]}
            onClick={() => navigate("/layout/notifications")}
          />
        ) : null}
      </div>
      ) : null}
    </div>
  );
};
