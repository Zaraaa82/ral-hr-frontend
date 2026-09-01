// import { Route, Routes } from "react-router";

// // Components
// import Navbar from "./components/Navbar";
// import ProtectedRoute from "./components/ProtectedRoute";
// // import { useAuth } from "./context/AuthContext";
// import IsAdmin from "./components/IsAdmin";

// // Services
// // import { getCurrentUser, logout } from "./services/authService";

// // Pages
// import Homepage from "./pages/Homepage";
// import SignInPage from "./pages/SigninPage";
// import Dashboard from "./pages/Dashboard";
// import AdminAttendanceCalendar from "./pages/Attendance/AdminAttendanceCalendar";
// import AddUser from "./pages/Users/AddUser";

// // Attendance Pages
// import EmployeePersonalDashboard from "./pages/Dashboards/EmployeePersonalDashboard";
// import AttendancePunch from "./pages/Attendance/AttendancePunch";
// import EmployeeAttendanceHistory from "./pages/Attendance/EmployeeAttendanceHistory";
// import ManagerTeamAttendance from "./pages/Attendance/ManagerTeamAttendance";
// import HRPendingCorrections from "./pages/AuditLogs/HRPendingCorrections";

// // Payroll Pages
// import Payslips from "./pages/Payslip/Payslips";

// function App() {
//   return (
//     <div className="min-h-screen bg-slate-50 text-slate-900">
//       <main>
//         <Navbar />
//         <Routes>
//           <Route path="/" element={<Homepage />} />
//           <Route path="/sign-in" element={<SignInPage />} />
//           {/* ADMIN DASHBOARD */}
//           <Route
//             path="/dashboard"
//             element={
//               <ProtectedRoute>
//                 {" "}
//                 <IsAdmin>
//                   {" "}
//                   <Dashboard />{" "}
//                 </IsAdmin>{" "}
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/admin/dashboard"
//             element={
//               <IsAdmin>
//                 <ProtectedRoute requiredRole="admin">
//                   <AdminAttendanceCalendar />
//                 </ProtectedRoute>
//               </IsAdmin>
//             }
//           ></Route>
//           <Route
//             path="/user/create"
//             element={
//               <IsAdmin>
//                 <ProtectedRoute requiredRole="admin">
//                   <AddUser />
//                 </ProtectedRoute>
//               </IsAdmin>
//             }
//           ></Route>
//           {/* Employee Attendance Routes */}
//           <Route
//             path="/attendance"
//             element={
//               <ProtectedRoute>
//                 <EmployeePersonalDashboard />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/attendance/punch"
//             element={
//               <ProtectedRoute>
//                 <AttendancePunch />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/attendance/history"
//             element={
//               <ProtectedRoute>
//                 <EmployeeAttendanceHistory />
//               </ProtectedRoute>
//             }
//           />
//           {/* Manager & HR Attendance Routes */}
//           <Route
//             path="/manager/team-attendance"
//             element={
//               <ProtectedRoute requiredRole="Manager">
//                 <ManagerTeamAttendance />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/admin/attendance"
//             element={
//               <ProtectedRoute requiredRole="HR Admin">
//                 <AdminAttendanceCalendar />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/admin/attendance/corrections"
//             element={
//               <ProtectedRoute requiredRole="HR Admin">
//                 <HRPendingCorrections />
//               </ProtectedRoute>
//             }
//           />
//           {/* PAYSLIP */}
//           <Route
//             path="/:id/payslips"
//             element={
//               <ProtectedRoute>
//                 <Payslips />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/admin/payslips"
//             element={
//               <ProtectedRoute requiredRole="HR Admin">
//                 <Payslips />
//               </ProtectedRoute>
//             }
//           />
//           {/* ===================================================== */}{" "}
//           {/* ADMIN CALENDAR */}{" "}
//           {/* ===================================================== */}{" "}
//           <Route
//             path="/admin/calendar"
//             element={
//               <ProtectedRoute requiredRole="HR Admin">
//                 {" "}
//                 <AdminAttendanceCalendar />{" "}
//               </ProtectedRoute>
//             }
//           />
//           {/* 404 Fallback */}
//           <Route
//             path="*"
//             element={
//               <div className="text-center py-20">
//                 <h2 className="text-2xl font-bold text-slate-800">
//                   404 - Page Not Found
//                 </h2>
//                 <p className="text-slate-500 mt-2">
//                   The page you are looking for does not exist.
//                 </p>
//               </div>
//             }
//           />
//         </Routes>
//       </main>
//     </div>
//   );
// }

// export default App;

import { Route, Routes } from "react-router";

// Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Homepage from "./pages/Homepage";
import SignInPage from "./pages/SigninPage";
import Dashboard from "./pages/Dashboard";
import AddUser from "./pages/Users/AddUser";

// Attendance Pages
import EmployeePersonalDashboard from "./pages/Dashboards/EmployeePersonalDashboard";
import AttendancePunch from "./pages/Attendance/AttendancePunch";
import EmployeeAttendanceHistory from "./pages/Attendance/EmployeeAttendanceHistory";
import ManagerTeamAttendance from "./pages/Attendance/ManagerTeamAttendance";
import AdminAttendanceCalendar from "./pages/Attendance/AdminAttendanceCalendar";
import HRPendingCorrections from "./pages/AuditLogs/HRPendingCorrections";

// Payroll
import Payslips from "./pages/Payslip/Payslips";

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main>
        <Navbar />

        <Routes>
          {/* ===================================================== */}
          {/* PUBLIC ROUTES */}
          {/* ===================================================== */}

          <Route path="/" element={<Homepage />} />

          <Route path="/sign-in" element={<SignInPage />} />

          {/* ===================================================== */}
          {/* HR ADMIN */}
          {/* ===================================================== */}

          {/* HR Admin Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="HR Admin">
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* HR Admin Calendar */}
          <Route
            path="/admin/calendar"
            element={
              <ProtectedRoute requiredRole="HR Admin">
                <AdminAttendanceCalendar />
              </ProtectedRoute>
            }
          />

          {/* Create User */}
          <Route
            path="/user/create"
            element={
              <ProtectedRoute requiredRole="HR Admin">
                <AddUser />
              </ProtectedRoute>
            }
          />

          {/* HR Attendance Corrections */}
          <Route
            path="/admin/attendance/corrections"
            element={
              <ProtectedRoute requiredRole="HR Admin">
                <HRPendingCorrections />
              </ProtectedRoute>
            }
          />

          {/* ===================================================== */}
          {/* PAYROLL - HR ADMIN */}
          {/* ===================================================== */}

          <Route
            path="/admin/payslips"
            element={
              <ProtectedRoute requiredRole="HR Admin">
                <Payslips />
              </ProtectedRoute>
            }
          />

          {/* ===================================================== */}
          {/* EMPLOYEE */}
          {/* ===================================================== */}

          {/* Employee Dashboard */}
          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <EmployeePersonalDashboard />
              </ProtectedRoute>
            }
          />

          {/* Punch In / Out */}
          <Route
            path="/attendance/punch"
            element={
              <ProtectedRoute>
                <AttendancePunch />
              </ProtectedRoute>
            }
          />

          {/* Attendance History */}
          <Route
            path="/attendance/history"
            element={
              <ProtectedRoute>
                <EmployeeAttendanceHistory />
              </ProtectedRoute>
            }
          />

          {/* ===================================================== */}
          {/* MANAGER */}
          {/* ===================================================== */}

          <Route
            path="/manager/team-attendance"
            element={
              <ProtectedRoute requiredRole="Manager">
                <ManagerTeamAttendance />
              </ProtectedRoute>
            }
          />

          {/* ===================================================== */}
          {/* EMPLOYEE PAYSLIPS */}
          {/* ===================================================== */}

          {/* IMPORTANT:
              This replaces /:id/payslips
          */}

          <Route
            path="/payslips"
            element={
              <ProtectedRoute>
                <Payslips />
              </ProtectedRoute>
            }
          />

          {/* Optional:
              Keep this only if some existing link in your system
              uses /employeeId/payslips
          */}

          <Route
            path="/:id/payslips"
            element={
              <ProtectedRoute>
                <Payslips />
              </ProtectedRoute>
            }
          />

          {/* ===================================================== */}
          {/* 404 */}
          {/* ===================================================== */}

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
