import { Routes, Route, Link, useLocation } from "react-router";
// Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import IsAdmin from "./components/IsAdmin";
import AuditLogsPage from "./pages/AuditLogs/AuditLogView";
// User
import Homepage from "./pages/Homepage";
import SignInPage from "./pages/SigninPage";
import Dashboard from "./pages/Dashboard";
import AddUser from "./pages/Users/AddUser";
import AllUsers from "./pages/Users/AllUsers";
import UserDetails from "./pages/Users/UserDetails";
import EditUser from './pages/Users/EditUser'

// Attendance
import EmployeePersonalDashboard from "./pages/Dashboards/EmployeePersonalDashboard";
import AttendancePunch from "./pages/Attendance/AttendancePunch";
import EmployeeAttendanceHistory from "./pages/Attendance/EmployeeAttendanceHistory";
import ManagerTeamAttendance from "./pages/Attendance/ManagerTeamAttendance";
import AdminAttendanceCalendar from "./pages/Attendance/AdminAttendanceCalendar";
import HRPendingCorrections from "./pages/AuditLogs/HRPendingCorrections";

// Payroll
import Payslips from "./pages/Payslip/Payslips";

// Department
import AddDepartment from "./pages/Department/AddDepartment";
import AllDepartments from "./pages/Department/AllDepartments";

// Leave
import MyLeave from "./pages/Leave/MyLeave";
import ManagerLeaveRequests from "./pages/Leave/ManagerLeaveRequests";
import HRLeaveManagement from "./pages/Leave/HRLeaveManagement";




function App() {
  const location = useLocation();

    const hideNavbar = location.pathname === "/sign-in" || location.pathname === "/";
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      {!hideNavbar && <Navbar />}


      {/* Main content */}
      <main className={hideNavbar ? "min-h-screen" : "ml-64 min-h-screen"}>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Homepage />} />

          <Route path="/sign-in" element={<SignInPage />} />


          {/* HR ADMIN CALENDAR */}
          <Route
            path="/admin/calendar"
            element={
              <ProtectedRoute requiredRole="HR Admin">
                <AdminAttendanceCalendar />
              </ProtectedRoute>
            }
          />

          {/* USERS */}
          <Route
            path="/user/create"
            element={
              <ProtectedRoute requiredRole="HR Admin">
                <AddUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/edit/:userId"
            element={
              <ProtectedRoute requiredRole="HR Admin">
                <IsAdmin>
                  <EditUser />
                </ IsAdmin>
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/all"
            element={
              <IsAdmin>
                <ProtectedRoute requiredRole="HR Admin">
                  <AllUsers />
                </ProtectedRoute>
              </IsAdmin>
            }
          />

          <Route
            path="/user/:userId"
            element={
              <ProtectedRoute requiredRole="HR Admin">
                <UserDetails />
              </ProtectedRoute>
            }
          />

          {/* ATTENDANCE CORRECTIONS */}
          <Route
            path="/admin/attendance/corrections"
            element={
              <ProtectedRoute requiredRole="HR Admin">
                <HRPendingCorrections />
              </ProtectedRoute>
            }
          />

          {/* HR ADMIN PAYSLIPS */}
          <Route
            path="/admin/payslips"
            element={
              <ProtectedRoute requiredRole="HR Admin">
                <Payslips managementMode={true}/>
              </ProtectedRoute>
            }
          />

          {/* DASHBOARD */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <EmployeePersonalDashboard />
              </ProtectedRoute>
            }
          />

          {/* PUNCH IN / OUT */}
          <Route
            path="/attendance/punch"
            element={
              <ProtectedRoute>
                <AttendancePunch />
              </ProtectedRoute>
            }
          />

          {/* ATTENDANCE HISTORY */}
          <Route
            path="/attendance/history"
            element={
              <ProtectedRoute>
                <EmployeeAttendanceHistory />
              </ProtectedRoute>
            }
          />

          {/* MANAGER */}
          <Route
            path="/manager/team-attendance"
            element={
              <ProtectedRoute requiredRole="Manager">
                <ManagerTeamAttendance />
              </ProtectedRoute>
            }
          />

          {/* EMPLOYEE PAYSLIPS */}
          <Route
            path="/payslips"
            element={
              <ProtectedRoute>
                <Payslips managementMode={false} />
              </ProtectedRoute>
            }
          />

          {/* DEPARTMENT */}
          <Route
            path="/dep/create"
            element={
              <ProtectedRoute>
                <IsAdmin>
                  <AddDepartment />
                </IsAdmin>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dep/all"
            element={
              <ProtectedRoute>
                <IsAdmin>
                  <AllDepartments />
                </IsAdmin>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedRoute>
                <AuditLogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit-trail"
            element={
              <ProtectedRoute>
                <AuditLogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit"
            element={
              <ProtectedRoute>
                <AuditLogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute>
                <AuditLogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit-trail"
            element={
              <ProtectedRoute>
                <AuditLogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/audit-logs"
            element={
              <ProtectedRoute>
                <AuditLogsPage />
              </ProtectedRoute>
            }
          />

          {/* LEAVE */}
          <Route
            path="/leave"
            element={
              <ProtectedRoute>
                <MyLeave />
              </ProtectedRoute>}
          />

          {/* Team Leave Requests */}
          <Route
            path="/leave/team"
            element={
              <ProtectedRoute>
                <ManagerLeaveRequests/>
              </ProtectedRoute>
            }
          />

          <Route
            path="/leave/all"
            element={
              <ProtectedRoute>
                <HRLeaveManagement />
              </ProtectedRoute>
            }
          />
          
          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="flex min-h-screen items-center justify-center px-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold">404</h2>

                  <p className="mt-2 text-lg font-medium">Page Not Found</p>

                  <p className="mt-2 text-sm text-slate-500">
                    The page you are looking for does not exist.
                  </p>

                  <Link
                    to="/dashboard"
                    className="mt-6 inline-block rounded-lg bg-slate-900 px-5 py-3 font-medium text-white transition hover:opacity-90"
                  >
                    Back to Dashboard
                  </Link>
                </div>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
