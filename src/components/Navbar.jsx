import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";
import "../styles/Navbar.css";

import {
  LayoutDashboard,
  Fingerprint,
  History,
  CreditCard,
  Users,
  Calendar,
  LogOut,
  LogIn,
  Menu,
  X,
} from "lucide-react";

export default function Navbar() {
  const { t } = useTranslation();
  const { user, currentUser, logout } = useAuth();

  const activeUser = user || currentUser;
  const role = activeUser?.role;
  const isAuthenticated = Boolean(activeUser);

  // ================= Role Checks =================
  const isHRAdmin = role === "HR Admin";
  const isManager = role === "Manager";

  // HR Admin goes to admin dashboard
  // Everyone else goes to employee attendance
  const dashboardPath = isHRAdmin ? "/dashboard" : "/attendance";

  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ================= Active Link =================
  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") {
      return true;
    }

    if (path !== "/" && location.pathname.startsWith(path)) {
      return true;
    }

    return false;
  };

  // ================= Logout =================
  const handleLogout = () => {
    logout();
    navigate("/sign-in");
  };

  return (
    <header className="custom-navbar">
      <div className="navbar-container">
        <div className="navbar-row">
          {/* ================= Logo ================= */}
          <div className="flex-shrink-0">
            <Link to={isAuthenticated ? dashboardPath : "/"}>
              <img
                src="/logo hr.png"
                alt="RAL HR Logo"
                className="navbar-logo"
              />
            </Link>
          </div>

          {/* ================= Desktop Nav Links ================= */}
          <nav className="nav-links-desktop">
            {isAuthenticated ? (
              <>
                {/* ================= Dashboard ================= */}
                <Link
                  to={dashboardPath}
                  className={`nav-link-item ${
                    isActive(dashboardPath) ? "active" : ""
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />

                  <span>{t("nav.dashboard", "Dashboard")}</span>
                </Link>

                {/* ================= Punch ================= */}
                <Link
                  to="/attendance/punch"
                  className={`nav-link-item ${
                    isActive("/attendance/punch") ? "active" : ""
                  }`}
                >
                  <Fingerprint className="w-3.5 h-3.5" />

                  <span>{t("nav.punch", "Punch")}</span>
                </Link>

                {/* ================= Attendance Logs ================= */}
                <Link
                  to="/attendance/history"
                  className={`nav-link-item ${
                    isActive("/attendance/history") ? "active" : ""
                  }`}
                >
                  <History className="w-3.5 h-3.5" />

                  <span>{t("nav.myAttendance", "Logs")}</span>
                </Link>

                {/* ================= Payslips ================= */}
                <Link
                  to="/payslips"
                  className={`nav-link-item ${
                    isActive("/payslips") ? "active" : ""
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />

                  <span>{t("nav.payslips", "Payslips")}</span>
                </Link>

                {/* ================================================= */}
                {/* MANAGER ONLY                                      */}
                {/* ================================================= */}

                {isManager && (
                  <Link
                    to="/manager/team-attendance"
                    className={`nav-link-item team-link ${
                      isActive("/manager/team-attendance") ? "active" : ""
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />

                    <span>{t("nav.team", "Team")}</span>
                  </Link>
                )}

                {/* ================================================= */}
                {/* HR ADMIN ONLY                                    */}
                {/* ================================================= */}

                {isHRAdmin && (
                  <Link
                    to="/admin/calendar"
                    className={`nav-link-item ${
                      isActive("/admin/calendar") ? "active" : ""
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />

                    <span>{t("nav.adminCalendar", "Admin Calendar")}</span>
                  </Link>
                )}
              </>
            ) : (
              /* ================= Logged Out ================= */

              <Link
                to="/"
                className={`nav-link-item ${
                  isActive("/") && location.pathname === "/" ? "active" : ""
                }`}
              >
                {t("nav.home", "Home")}
              </Link>
            )}
          </nav>

          {/* ================= Right Controls ================= */}
          <div className="right-controls">
            <LanguageSwitcher />

            {isAuthenticated ? (
              <div className="user-profile-section">
                <div className="flex items-center gap-2">
                  <div className="user-avatar">
                    {activeUser.fullName?.charAt(0) || "U"}
                  </div>

                  <div>
                    <span className="text-xs font-bold text-white block leading-tight">
                      {activeUser.fullName}
                    </span>

                    <span className="text-[10px] text-slate-400 font-semibold block">
                      {activeUser.employeeCode}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="sign-out-btn"
                  title={t("nav.signOut", "Sign Out")}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link to="/sign-in" className="sign-in-btn">
                <LogIn className="w-3.5 h-3.5" />

                <span>{t("nav.signIn", "Sign In")}</span>
              </Link>
            )}

            {/* ================= Mobile Menu Toggle ================= */}
            <div className="mobile-toggle">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="mobile-toggle-btn"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MOBILE DRAWER                                             */}
      {/* ========================================================= */}

      {mobileMenuOpen && (
        <div className="mobile-drawer">
          {isAuthenticated ? (
            <>
              {/* ================= Dashboard ================= */}
              <Link
                to={dashboardPath}
                onClick={() => setMobileMenuOpen(false)}
                className={`mobile-link ${
                  isActive(dashboardPath) ? "active" : ""
                }`}
              >
                {t("nav.dashboard", "Dashboard")}
              </Link>

              {/* ================= Punch ================= */}
              <Link
                to="/attendance/punch"
                onClick={() => setMobileMenuOpen(false)}
                className={`mobile-link ${
                  isActive("/attendance/punch") ? "active" : ""
                }`}
              >
                {t("nav.punch", "Punch In/Out")}
              </Link>

              {/* ================= Attendance Logs ================= */}
              <Link
                to="/attendance/history"
                onClick={() => setMobileMenuOpen(false)}
                className={`mobile-link ${
                  isActive("/attendance/history") ? "active" : ""
                }`}
              >
                {t("nav.myAttendance", "My Logs")}
              </Link>

              {/* ================= Payslips ================= */}
              <Link
                to="/payslips"
                onClick={() => setMobileMenuOpen(false)}
                className={`mobile-link ${
                  isActive("/payslips") ? "active" : ""
                }`}
              >
                {t("nav.payslips", "Payslips")}
              </Link>

              {/* ================================================= */}
              {/* MANAGER MOBILE ONLY                              */}
              {/* ================================================= */}

              {isManager && (
                <Link
                  to="/manager/team-attendance"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`mobile-link team-mobile ${
                    isActive("/manager/team-attendance") ? "active" : ""
                  }`}
                >
                  {t("nav.team", "Team Attendance")}
                </Link>
              )}

              {/* ================================================= */}
              {/* HR ADMIN MOBILE ONLY                            */}
              {/* ================================================= */}

              {isHRAdmin && (
                <Link
                  to="/admin/calendar"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`mobile-link ${
                    isActive("/admin/calendar") ? "active" : ""
                  }`}
                >
                  {t("nav.adminCalendar", "Admin Calendar")}
                </Link>
              )}

              {/* ================= User / Logout ================= */}

              <div className="pt-3 border-t border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">
                    {activeUser.fullName}
                  </span>

                  <span className="text-[10px] text-slate-400 font-medium">
                    {activeUser.employeeCode}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1 bg-rose-500/20 text-rose-300 rounded-lg text-xs font-bold cursor-pointer"
                >
                  {t("nav.signOut", "Sign Out")}
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/sign-in"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center py-2 bg-sky-600 text-white rounded-lg text-xs font-semibold"
            >
              {t("nav.signIn", "Sign In")}
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
