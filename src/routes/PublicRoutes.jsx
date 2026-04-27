import { Login } from "../Pages/Login"
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
import { Students } from "../Pages/Students"
import { Payroll } from "../Pages/Payroll"
import { FinanceSalaries } from "../Pages/FinanceSalaries"
import { FinanceFees } from "../Pages/FinanceFees"
import { FinanceEmployeePayroll } from "../Pages/FinanceEmployeePayroll"
import { Navigate } from "react-router-dom"
import { StudentMyAccount } from "../Pages/StudentMyAccount"
import { StudentVouchers } from "../Pages/StudentVouchers"
import { Complaints } from "../Pages/Complaints"
import { RequireAuth } from "../auth/RequireAuth"
import { RequireRole } from "../auth/RequireRole"
export const publicRoutes = 
[
    {path:"/",element:<Login/>},
    {path:"/login",element:<Login/>},
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
        {path:"admin",element:<Admin/>}
    ]
}
]
