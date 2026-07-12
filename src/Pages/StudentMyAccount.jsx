import { Link } from "react-router-dom";
import { Calculator, CircleHelp, LayoutDashboard, Receipt, UserCircle } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useStudentMe } from "../hooks/useStudentMe";

/** Student home: overview with links to vouchers and profile (same card styling as portal). */
export const StudentMyAccount = () => {
  const auth = useAuth();
  const { payload, loading } = useStudentMe(auth.token);
  const displayName = auth.user?.name || auth.user?.email || "Student";
  const feeCount = payload?.fees?.length ?? 0;

  const tiles = [
    {
      to: "/layout/student-vouchers",
      label: "Vouchers",
      sub: feeCount ? `${feeCount} fee record${feeCount === 1 ? "" : "s"}` : "View fee vouchers",
      Icon: Receipt,
    },
    {
      to: "/layout/admin",
      label: "Profile",
      sub: "Account & password",
      Icon: UserCircle,
    },
    {
      to: "/layout/faq",
      label: "FAQ",
      sub: "Questions and answers",
      Icon: CircleHelp,
    },
    {
      to: "/layout/student-cgpa",
      label: "CGPA calculator",
      sub: "Live CGPA tool",
      Icon: Calculator,
    },
  ];

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <div className="flex items-start gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#1E6B7814] flex items-center justify-center text-[#1E6B78]">
            <LayoutDashboard className="w-5 h-5" strokeWidth={2} aria-hidden />
          </div>
          <div>
            <h2 className="font-montserrat font-semibold text-lg text-[#1E6B78]">My account</h2>
            <p className="text-sm text-grey font-montserrat mt-1">
              Hello, <span className="text-black font-semibold">{displayName}</span>. Use the shortcuts below or the
              sidebar for vouchers, the CGPA calculator, profile, and FAQs.
            </p>
          </div>
        </div>
        {loading ? (
          <p className="text-sm text-grey font-montserrat mt-4">Loading…</p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {tiles.map(({ to, label, sub, Icon }) => (
          <Link
            key={to}
            to={to}
            className="group bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition-shadow font-montserrat"
          >
            <div className="w-10 h-10 rounded-xl bg-[#05B9B914] flex items-center justify-center text-[#1E6B78] mb-3 group-hover:bg-[#05B9B926]">
              <Icon className="w-5 h-5" strokeWidth={2} aria-hidden />
            </div>
            <div className="font-semibold text-black text-sm">{label}</div>
            <div className="text-xs text-grey mt-1">{sub}</div>
          </Link>
        ))}
      </div>
    </div>
  );
};
