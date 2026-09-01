import { Routes, Route, Link } from 'react-router'

// Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import IsAdmin from "./components/IsAdmin";


// Services
import { getCurrentUser, logout } from "./services/authService";


// User
import Homepage from "./pages/Homepage";
import SignInPage from "./pages/SigninPage";
import Dashboard from "./pages/Dashboard";
import AddUser from "./pages/Users/AddUser";
import AllUsers from './pages/Users/AllUsers'
import UserDetails from './pages/Users/UserDetails'

// Attendance Pages
import AttendanceDashboard from "./pages/Attendance/AttendanceDashboard";
import AttendancePunch from "./pages/Attendance/AttendancePunch";
import EmployeeAttendanceHistory from "./pages/Attendance/EmployeeAttendanceHistory";
import ManagerTeamAttendance from "./pages/Attendance/ManagerTeamAttendance";
import HRPendingCorrections from "./pages/AuditLogs/HRPendingCorrections";
import AdminAttendanceCalendar from "./pages/Attendance/AdminAttendanceCalendar";


// Payroll Pages
import Payslips from "./pages/Payslip/Payslips";


// Department
import AddDepartment from './pages/Department/AddDepartment';
import AllDepartments from './pages/Department/AllDepartments';

function App() {
  return (
    <div className="min-h-screen bg-card text-mid">

      <Navbar />

      {/* Main content */}
      <main className="ml-64 min-h-screen">

        <Routes>

          {/* HOME */}
          <Route
            path="/"
            element={<Homepage />}
          />

          {/* AUTH */}
          <Route
            path="/sign-in"
            element={<SignInPage />}
          />

          {/* USERS */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <IsAdmin>
                  <Dashboard />
                </IsAdmin>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <IsAdmin>
                <ProtectedRoute requiredRole="admin">
                  <AdminAttendanceCalendar />
                </ProtectedRoute>
              </IsAdmin>
            }
          />

          <Route
            path="/user/create"
            element={
              <IsAdmin>
                <ProtectedRoute requiredRole="admin">
                  <AddUser />
                </ProtectedRoute>
              </IsAdmin>
            }
          />
          <Route
            path="/user/all"
            element={
              <IsAdmin>
                <ProtectedRoute requiredRole="admin">
                  <AllUsers />
                </ProtectedRoute>
              </IsAdmin>
            }
          />
          <Route
            path="/user/:userId"
            element={
              <ProtectedRoute requiredRole="admin">
                <UserDetails />
              </ProtectedRoute>
            }
          />
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

          {/* PAYSLIPS */}

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

          {/* Department */}

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
          {/* 404 */}

          <Route
            path="*"
            element={
              <div className="flex min-h-screen items-center justify-center px-6">
                <div className="text-center">

                  <h2 className="text-3xl font-bold text-ink">
                    404
                  </h2>

                  <p className="mt-2 text-lg font-medium text-mid">
                    Page Not Found
                  </p>

                  <p className="mt-2 text-sm text-soft">
                    The page you are looking for does not exist.
                  </p>

                  <Link
                    to="/dashboard"
                    className="mt-6 inline-block rounded-lg bg-ink px-5 py-3 font-medium text-lavender transition hover:opacity-90"
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

// function App() {
//   return (
//     <div className="min-h-screen bg-slate-50 text-slate-900">
//       <main>
//         <Navbar />
//         <Routes>
//           <Route path="/" element={<Homepage />} />
//           <Route path="/sign-in" element={<SignInPage />} />

//           {/* ADMIN DASHBOARD */}
//           <Route path="/dashboard" element={<ProtectedRoute> <IsAdmin> <Dashboard /> </IsAdmin> </ProtectedRoute>} />
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


//           {/* ATTENDANCE */}
//           <Route
//             path="/attendance"
//             element={
//               <ProtectedRoute>
//                 <AttendanceDashboard />
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

export default App;
