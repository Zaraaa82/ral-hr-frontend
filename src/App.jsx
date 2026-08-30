import { useState, useEffect } from "react";
import { Route, Routes } from "react-router";
import Navbar from "./components/Navbar";
import SignupPage from "./pages/SignupPage";
import Homepage from "./pages/Homepage";
import SignInPage from "./pages/SigninPage";
import Dashboard from "./pages/Dashboard";
import AdminAttendanceCalendar from "./pages/AdminAttendanceCalendar";
import { getCurrentUser, logout } from "./services/authService";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Homepage />} />
        <Route path="/sign-up" element={<SignupPage />} />
        <Route path="/sign-in" element={<SignInPage />} />

        {/* User Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Attendance Calendar Route */}
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
