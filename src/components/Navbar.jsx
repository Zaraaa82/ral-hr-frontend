import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
// import { CompanyLogo } from "./CompanyLogo";
import {
  Users,
  Clock,
  CreditCard,
  LayoutDashboard,
  Calendar,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  Fingerprint,
  History,
  CheckSquare,
  Shield,
} from "lucide-react";

export default function Navbar() {
  const { currentUser, role, isAuthenticated, logout, users, loginAsUser } =
    useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleLogout = () => {
    logout();
    navigate("/sign-in");
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0d1424] text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center">
              {/* <CompanyLogo /> */}
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                isActive("/") && location.pathname === "/"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/70"
              }`}
            >
              Home
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    isActive("/dashboard")
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/attendance"
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    isActive("/attendance") &&
                    !location.pathname.includes("/admin") &&
                    !location.pathname.includes("/manager")
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Attendance</span>
                </Link>

                <Link
                  to="/attendance/punch"
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    isActive("/attendance/punch")
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                  }`}
                >
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span>Punch In/Out</span>
                </Link>

                <Link
                  to="/attendance/history"
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    isActive("/attendance/history")
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>My Logs</span>
                </Link>

                <Link
                  to={`/${currentUser?._id || "usr_000"}/payslips`}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    location.pathname.includes("/payslips") &&
                    !location.pathname.includes("/admin")
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Payslips</span>
                </Link>

                {(role === "Manager" || role === "HR Admin") && (
                  <Link
                    to="/manager/team-attendance"
                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                      isActive("/manager/team-attendance")
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Team (Mgr)</span>
                  </Link>
                )}

                {role === "HR Admin" && (
                  <>
                    <Link
                      to="/admin/attendance"
                      className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                        isActive("/admin/attendance") &&
                        !location.pathname.includes("/corrections")
                          ? "bg-purple-600 text-white shadow-xs"
                          : "text-purple-300 hover:bg-purple-950/40 hover:text-purple-200"
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Admin Calendar</span>
                    </Link>

                    <Link
                      to="/admin/attendance/corrections"
                      className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                        isActive("/admin/attendance/corrections")
                          ? "bg-purple-600 text-white shadow-xs"
                          : "text-purple-300 hover:bg-purple-950/40 hover:text-purple-200"
                      }`}
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Corrections</span>
                    </Link>

                    <Link
                      to="/admin/audit-logs"
                      className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                        isActive("/admin/audit-logs")
                          ? "bg-purple-600 text-white shadow-xs"
                          : "text-purple-300 hover:bg-purple-950/40 hover:text-purple-200"
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Audit Trail</span>
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>

          {/* Right User & Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && currentUser ? (
              <div className="flex items-center gap-3">
                <select
                  value={currentUser._id}
                  onChange={(e) => loginAsUser(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-200 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                >
                  {users.map((u) => (
                    <option
                      key={u._id}
                      value={u._id}
                      className="bg-slate-900 text-white"
                    >
                      {u.fullName} ({u.role})
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                  <img
                    src={
                      currentUser.avatar ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                    }
                    alt={currentUser.fullName}
                    className="w-8 h-8 rounded-full object-cover border border-indigo-500/40"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block leading-tight">
                      {currentUser.fullName}
                    </span>
                    <span className="text-[10px] text-indigo-400 font-semibold block">
                      {currentUser.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/sign-in"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/sign-up"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0f1d] border-b border-slate-800 px-4 pt-2 pb-6 space-y-2 animate-in slide-in-from-top duration-200">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800"
          >
            Home
          </Link>
          {isAuthenticated && (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800"
              >
                Dashboard
              </Link>
              <Link
                to="/attendance"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800"
              >
                Attendance
              </Link>
              <Link
                to="/attendance/punch"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800"
              >
                Punch In / Out
              </Link>
              <Link
                to="/attendance/history"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800"
              >
                My Logs
              </Link>
              <Link
                to={`/${currentUser?._id || "usr_000"}/payslips`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800"
              >
                Payslips
              </Link>
              {(role === "Manager" || role === "HR Admin") && (
                <Link
                  to="/manager/team-attendance"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-semibold text-emerald-400 hover:bg-slate-800"
                >
                  Team (Mgr)
                </Link>
              )}
              {role === "HR Admin" && (
                <>
                  <Link
                    to="/admin/attendance"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-semibold text-purple-300 hover:bg-slate-800"
                  >
                    Admin Calendar
                  </Link>
                  <Link
                    to="/admin/attendance/corrections"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-semibold text-purple-300 hover:bg-slate-800"
                  >
                    Corrections
                  </Link>
                  <Link
                    to="/admin/audit-logs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-semibold text-purple-300 hover:bg-slate-800"
                  >
                    Audit Trail & Compliance
                  </Link>
                </>
              )}
            </>
          )}

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            {isAuthenticated && currentUser ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <img
                    src={
                      currentUser.avatar ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                    }
                    alt={currentUser.fullName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {currentUser.fullName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {currentUser.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 bg-rose-500/20 text-rose-300 rounded-xl text-xs font-bold"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-2 w-full">
                <Link
                  to="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold"
                >
                  Sign In
                </Link>
                <Link
                  to="/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
