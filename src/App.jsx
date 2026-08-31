import { useState, useEffect } from "react";
import { Route, Routes } from "react-router";

// Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import IsAdmin from "./components/IsAdmin";

// Pages
import SignupPage from "./pages/SignupPage";
import Homepage from "./pages/Homepage";
import SignInPage from "./pages/SigninPage";
import Dashboard from "./pages/Dashboard";
import AdminAttendanceCalendar from "./pages/AdminAttendanceCalendar";
import AddUser from './pages/Users/AddUser'

// Services
import { getCurrentUser, logout } from "./services/authService";

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        {/* Public Routes */}

        <Route path="/" element={<Homepage />} />

        {/* <Route path="/sign-up" element={<SignupPage />} /> */}

        <Route path="/sign-in" element={<SignInPage />} />

        {/* User Protected Routes */}
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
        <Route path='/admin/dashboard' element={
          <IsAdmin>
            <ProtectedRoute requiredRole="admin">
              <AdminAttendanceCalendar />
            </ProtectedRoute>
          </IsAdmin>
        }></Route>

        {/* Admin Routes */}
        <Route path='/user/create' element={
          <IsAdmin>
            <ProtectedRoute requiredRole="admin">
              <AddUser />
            </ProtectedRoute>
          </IsAdmin>
        }>

        </Route>

        <Route
          path="/admin/attendance"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminAttendanceCalendar />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
