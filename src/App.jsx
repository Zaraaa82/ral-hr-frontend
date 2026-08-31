import React from "react";
import { Route, Routes } from "react-router";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Public Pages
import Homepage from "./pages/Homepage";
import SignupPage from "./pages/SignupPage";
import SignInPage from "./pages/SigninPage";
import Dashboard from "./pages/EmployeePersonalDashboard";

// Attendance Pages
import AttendanceDashboard from "./pages/AttendanceDashboard";
import AdminAttendanceCalendar from "./pages/AdminCalendarOverview";
import AttendancePunch from "./pages/AttendancePunch";
import EmployeeAttendanceHistory from "./pages/EmployeeAttendanceHistory";
import ManagerTeamAttendance from "./pages/ManagerTeamAttendance";
import HRPendingCorrections from "./pages/HRPendingCorrections";

// Payroll Pages
import Payslips from "./pages/Payslips";

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Homepage />} />
          <Route path="/sign-up" element={<SignupPage />} />
          <Route path="/sign-in" element={<SignInPage />} />

          {/* User Protected Routes */}
          <Route
            path="/dashboard"
            element={
              //<ProtectedRoute>
              <Dashboard />
              // </ProtectedRoute>
            }
          />

          <Route
            path="/attendance"
            element={
              //<ProtectedRoute>
              <AttendanceDashboard />
              //</ProtectedRoute>
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
            path="/:id/payslips"
            element={
              <ProtectedRoute>
                <Payslips />
              </ProtectedRoute>
            }
          />

          {/* Manager Protected Routes */}
          <Route
            path="/manager/team-attendance"
            element={
              <ProtectedRoute requiredRole="Manager">
                <ManagerTeamAttendance />
              </ProtectedRoute>
            }
          />

          {/* HR Admin Protected Routes */}
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
