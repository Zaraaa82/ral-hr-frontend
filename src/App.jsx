import { Route, Routes } from "react-router";

// Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import IsAdmin from "./components/IsAdmin";


// Services
import { getCurrentUser, logout } from "./services/authService";


// Pages
import Homepage from "./pages/Homepage";
import SignInPage from "./pages/SigninPage";
import Dashboard from "./pages/Dashboard";
import AdminAttendanceCalendar from "./pages/Attendance/AdminAttendanceCalendar";
import AddUser from "./pages/Users/AddUser";


// Attendance Pages
import AttendanceDashboard from "./pages/Attendance/AttendanceDashboard";
import AttendancePunch from "./pages/Attendance/AttendancePunch";
import EmployeeAttendanceHistory from "./pages/Attendance/EmployeeAttendanceHistory";
import ManagerTeamAttendance from "./pages/Attendance/ManagerTeamAttendance";
import HRPendingCorrections from "./pages/AuditLogs/HRPendingCorrections";


// Payroll Pages
import Payslips from "./pages/Payslip/Payslips";


function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main>
        <Navbar />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/sign-in" element={<SignInPage />} />

          {/* ADMIN DASHBOARD */}
          <Route path="/dashboard" element={<ProtectedRoute> <IsAdmin> <Dashboard /> </IsAdmin> </ProtectedRoute>} />
          <Route
            path="/admin/dashboard"
            element={
              <IsAdmin>
                <ProtectedRoute requiredRole="admin">
                  <AdminAttendanceCalendar />
                </ProtectedRoute>
              </IsAdmin>
            }
          ></Route>
          <Route
            path="/user/create"
            element={
              <IsAdmin>
                <ProtectedRoute requiredRole="admin">
                  <AddUser />
                </ProtectedRoute>
              </IsAdmin>
            }
          ></Route>


          {/* ATTENDANCE */}
          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <AttendanceDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/attendance/punch"
            element={
              <ProtectedRoute>
                <AttendancePunch />
              </ProtectedRoute>
            }
          />

          <Route
            path="/attendance/history"
            element={
              <ProtectedRoute>
                <EmployeeAttendanceHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manager/team-attendance"
            element={
              <ProtectedRoute requiredRole="Manager">
                <ManagerTeamAttendance />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/attendance"
            element={
              <ProtectedRoute requiredRole="HR Admin">
                <AdminAttendanceCalendar />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/attendance/corrections"
            element={
              <ProtectedRoute requiredRole="HR Admin">
                <HRPendingCorrections />
              </ProtectedRoute>
            }
          />


          {/* PAYSLIP */}
          <Route
            path="/:id/payslips"
            element={
              <ProtectedRoute>
                <Payslips />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/payslips"
            element={
              <ProtectedRoute requiredRole="HR Admin">
                <Payslips />
              </ProtectedRoute>
            }
          />

          {/* 404 Fallback */}
          <Route
            path="*"
            element={
              <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-slate-800">
                  404 - Page Not Found
                </h2>
                <p className="text-slate-500 mt-2">
                  The page you are looking for does not exist.
                </p>
              </div>
            }
          />


        </Routes>
      </main>
    </div>
  );
}

export default App;
