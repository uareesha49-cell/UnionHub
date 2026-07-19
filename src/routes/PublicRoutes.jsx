import { Login } from "../Pages/Login"
import { Landing } from "../Pages/Landing"
import { InstituteSignup } from "../Pages/InstituteSignup"
import { HowItWorks } from "../Pages/HowItWorks"
import { Pricing } from "../Pages/Pricing"
import { Resetpassword } from "../Pages/Resetpassword"
import {Otp} from "../Pages/Otp"
import { Confirmpassword } from "../Pages/Confirmpassword"
import {Dashboard} from "../Pages/Dashboard"
import {Layout} from "../Layout/Layout"
import {Meetings} from "../Pages/Meetings"
import {Benefits} from "../Pages/Benefits"
import {Employees} from "../Pages/Employees"
import {News} from "../Pages/News"
import {Notifications} from "../Pages/Notifications"
import {Vote} from "../Pages/Vote"
import {Faq} from "../Pages/Faq"
import {Bell} from "../Pages/Bell"
import {Admin} from "../Pages/Admin"
import {AdminDashboard} from "../Pages/AdminDashboard"
import {AdminInstitute} from "../Pages/AdminInstitute"
import {AdminDirectors} from "../Pages/AdminDirectors"
import {AdminPrincipals} from "../Pages/AdminPrincipals"
import {AdminVicePrincipals} from "../Pages/AdminVicePrincipals"
import {AdminStudents} from "../Pages/AdminStudents"
import {AdminTeachers} from "../Pages/AdminTeachers"
import {AdminTechStaff} from "../Pages/AdminTechStaff"
import {AdminFinance} from "../Pages/AdminFinance"
import { Students } from "../Pages/Students"
import { Payroll } from "../Pages/Payroll"
import { FinanceSalaries } from "../Pages/FinanceSalaries"
import { FinanceFees } from "../Pages/FinanceFees"
import { FinanceEmployeePayroll } from "../Pages/FinanceEmployeePayroll"
import { Navigate } from "react-router-dom"
import { StudentMyAccount } from "../Pages/StudentMyAccount"
import { StudentVouchers } from "../Pages/StudentVouchers"
import { StudentCgpa } from "../Pages/StudentCgpa"
import { TechStaffTimetable } from "../Pages/TechStaffTimetable"
import { Complaints } from "../Pages/Complaints"
import { RequireAuth } from "../auth/RequireAuth"
import { RequireRole } from "../auth/RequireRole"
export const publicRoutes = 
[
    {path:"/",element:<Landing/>},
    {path:"/login",element:<Login/>},
    {path:"/signup",element:<InstituteSignup/>},
    {path:"/how-it-works",element:<HowItWorks/>},
    {path:"/pricing",element:<Pricing/>},
    {path:"/resetpassword",element:<Resetpassword/>},
    {path:"/otp",element:<Otp/>},
    {path:"/confirmpassword",element:<Confirmpassword/>},
    // Sidebar layout with nested pages
  {
    path: "/layout",
    element: (
      <RequireAuth>
        <Layout />
      </RequireAuth>
    ),
    children: [
        {path:"dashboard",element:<Dashboard/>},
        {path:"complaints",element:<Complaints/>},
        {path:"meetings",element:<Meetings/>},
        {path:"benefits",element:<Benefits/>},
        {path:"news",element:<News/>},
        {path:"vote",element:<Vote/>},
        {path:"notifications",element:<Notifications/>},
        {path:"faq",element:<Faq/>},
        {path:"bell",element:<Bell/>},
        {path:"employees",element:(<RequireRole roles={["director","principal","vice_principal"]}><Employees/></RequireRole>)},
        {path:"students",element:(<RequireRole roles={["director","principal","vice_principal"]}><Students/></RequireRole>)},
        {
          path: "payroll",
          element: (
            <RequireRole roles={["director", "principal", "vice_principal", "teacher", "tech_staff", "employee", "finance"]}>
              <Payroll />
            </RequireRole>
          ),
        },
        {path:"finance-salaries",element:(<RequireRole roles={["finance"]}><FinanceSalaries/></RequireRole>)},
        {path:"finance-fees",element:(<RequireRole roles={["finance"]}><FinanceFees/></RequireRole>)},
        {path:"student-home",element:(<RequireRole roles={["student"]}><StudentMyAccount/></RequireRole>)},
        {path:"student-vouchers",element:(<RequireRole roles={["student"]}><StudentVouchers/></RequireRole>)},
        {path:"student-cgpa",element:(<RequireRole roles={["student"]}><StudentCgpa/></RequireRole>)},
        {
          path: "tech-timetable",
          element: (
            <RequireRole roles={["tech_staff"]}>
              <TechStaffTimetable />
            </RequireRole>
          ),
        },
        {
          path: "student-portal",
          element: (
            <RequireRole roles={["student"]}>
              <Navigate to="/layout/student-home" replace />
            </RequireRole>
          ),
        },
        {
          path: "finance-employee-payroll/:userId",
          element: (
            <RequireRole roles={["finance"]}>
              <FinanceEmployeePayroll />
            </RequireRole>
          ),
        },
        {path:"admin",element:<Admin/>},
        {path:"admin-dashboard",element:(<RequireRole roles={["admin"]}><AdminDashboard/></RequireRole>)},
        {path:"admin-institute",element:(<RequireRole roles={["admin"]}><AdminInstitute/></RequireRole>)},
        {path:"admin-directors",element:(<RequireRole roles={["admin"]}><AdminDirectors/></RequireRole>)},
        {path:"admin-principals",element:(<RequireRole roles={["admin"]}><AdminPrincipals/></RequireRole>)},
        {path:"admin-vice-principals",element:(<RequireRole roles={["admin"]}><AdminVicePrincipals/></RequireRole>)},
        {path:"admin-students",element:(<RequireRole roles={["admin"]}><AdminStudents/></RequireRole>)},
        {path:"admin-teachers",element:(<RequireRole roles={["admin"]}><AdminTeachers/></RequireRole>)},
        {path:"admin-tech-staff",element:(<RequireRole roles={["admin"]}><AdminTechStaff/></RequireRole>)},
        {path:"admin-finance",element:(<RequireRole roles={["admin"]}><AdminFinance/></RequireRole>)}
    ]
}
]
