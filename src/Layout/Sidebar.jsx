import { NavLink, useNavigate } from "react-router-dom";
import {
  Calculator,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  MessageSquareWarning,
  Receipt,
  School,
  Table2,
  UserCircle,
  Wallet,
  Building2,
  Users,
  UserCheck,
  GraduationCap,
  BriefcaseBusiness,
  Cpu,
  DollarSign,
} from "lucide-react";
import { mediaData } from "../utils/mediaData";
import { useAuth } from "../auth/AuthContext";

const staffPayrollRoles = [
  "director",
  "principal",
  "vice_principal",
  "teacher",
  "tech_staff",
  "employee",
  "finance",
];

/** Admin role: sidebar entries */
const adminPages = [
  { name: "Dashboard", route: "/layout/admin-dashboard", LucideIcon: LayoutDashboard },
  { name: "Institute", route: "/layout/admin-institute", LucideIcon: Building2 },
  { name: "Directors", route: "/layout/admin-directors", LucideIcon: UserCheck },
  { name: "Principals", route: "/layout/admin-principals", LucideIcon: Users },
  { name: "Vice Principals", route: "/layout/admin-vice-principals", LucideIcon: UserCheck },
  { name: "Students", route: "/layout/admin-students", LucideIcon: GraduationCap },
  { name: "Teachers", route: "/layout/admin-teachers", LucideIcon: BriefcaseBusiness },
  { name: "Tech Staff", route: "/layout/admin-tech-staff", LucideIcon: Cpu },
  { name: "Finance", route: "/layout/admin-finance", LucideIcon: DollarSign },
  { name: "Profile", route: "/layout/admin", LucideIcon: UserCircle },
];

/** Student role: sidebar entries (same chrome as staff). */
const studentPages = [
  { name: "My account", route: "/layout/student-home", LucideIcon: LayoutDashboard },
  { name: "Complaints", route: "/layout/complaints", LucideIcon: MessageSquareWarning },
  { name: "FAQ", route: "/layout/faq", icon: mediaData.Faq },
  { name: "Vouchers", route: "/layout/student-vouchers", LucideIcon: Receipt },
  { name: "CGPA calculator", route: "/layout/student-cgpa", LucideIcon: Calculator },
  { name: "Profile", route: "/layout/admin", LucideIcon: UserCircle },
];

const staffPages = [
  { name: "Dashboard", route: "/layout/dashboard", icon: mediaData.Dashboard },
  { name: "Complaints", route: "/layout/complaints", LucideIcon: MessageSquareWarning },
  { name: "Meetings", route: "/layout/meetings", icon: mediaData.Meetings },
  { name: "Vote", route: "/layout/vote", icon: mediaData.Vote },
  { name: "News & Updates", route: "/layout/news", icon: mediaData.News },
  { name: "Emp. Benefits", route: "/layout/benefits", icon: mediaData.Empbenefits },
  { name: "Payroll", route: "/layout/payroll", LucideIcon: Wallet, roles: staffPayrollRoles },
  { name: "Timetable", route: "/layout/tech-timetable", LucideIcon: CalendarDays, roles: ["tech_staff"] },
  { name: "Salary management", route: "/layout/finance-salaries", LucideIcon: Table2, roles: ["finance"] },
  { name: "Fee management", route: "/layout/finance-fees", LucideIcon: Receipt, roles: ["finance"] },
  { name: "Students", route: "/layout/students", LucideIcon: School, roles: ["director", "principal", "vice_principal"] },
  { name: "Manage FAQ's", route: "/layout/faq", icon: mediaData.Faq },
  { name: "Notifications", route: "/layout/notifications", icon: mediaData.Notification, roles: ["director", "principal", "vice_principal"] },
  { name: "Employees", route: "/layout/employees", icon: mediaData.Employees, roles: ["director", "principal", "vice_principal"] },
];

export const Sidebar = ({ isOpen, setIsOpen }) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const role = auth.user?.role;
  const visiblePages =
    role === "admin"
      ? adminPages
      : role === "student"
      ? studentPages
      : staffPages.filter((p) => !p.roles || (role && p.roles.includes(role)));

  const handleLogout = () => {
    auth.logout();
    navigate("/");
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          isOpen
            ? "fixed top-0 left-0 translate-x-0"
            : "fixed top-0 left-0 -translate-x-full"
        } lg:translate-x-0 lg:relative
        flex flex-col h-screen lg:h-full w-[215px] bg-[#FAFAFA] z-50 transition-transform duration-300`}
      >
        {/* Logo & heading */}
        <div className="flex flex-col items-center py-4 mb-2">
          <img src={mediaData.Logo} alt="Logo" className="w-14 h-14 mb-1 mix-blend-multiply" />
          <h1 className="text-center font-montserrat font-semibold text-[18px] text-[#1E6B78]">
            Union Hub
          </h1>
        </div>

        {/* Scrollable Pages list */}
        <div className="flex-1 overflow-y-auto flex flex-col bg-[#FAFAFA]">
          {visiblePages.map((page) => (
            <NavLink
              key={page.route}
              to={page.route}
              onClick={() => setIsOpen && setIsOpen(false)}
              className="w-full"
            >
              {({ isActive }) => (
                <div
                  className={`flex items-center gap-3 px-3 py-1.5 mx-2 mb-1 rounded-r-lg cursor-pointer transition-colors ${
                    isActive
                      ? "bg-[#33669926] text-[#1E6B78]"
                      : "text-black hover:bg-[#E8E8E8]"
                  }`}
                >
                  {page.LucideIcon ? (
                    <page.LucideIcon className="w-5 h-5 shrink-0" strokeWidth={2} aria-hidden />
                  ) : page.icon ? (
                    <img src={page.icon} alt="" className="w-5 h-5 shrink-0" />
                  ) : (
                    <div className="w-5 h-5 shrink-0" />
                  )}
                  <span className="text-sm">{page.name}</span>
                </div>
              )}
            </NavLink>
          ))}
        </div>

        <button onClick={handleLogout} className="w-full mb-4">
          <div className="flex items-center gap-2 px-3 py-2 mx-2 rounded-r-lg cursor-pointer transition-colors text-black hover:bg-[#E8E8E8]">
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Logout</span>
          </div>
        </button>
      </div>
    </>
  );
};
