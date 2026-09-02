import React from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

import {
  LayoutDashboard,
  Users,
  Building2,
  Fingerprint,
  History,
  Calendar,
  Inbox,
  CreditCard,
  LogOut,
  LogIn,
  PlaneTakeoff,
  CalendarCheck 
  CheckSquare,
  Shield,
  Clock,
} from "lucide-react";

function Navbar() {
  const { t } = useTranslation();
  const { user, currentUser, logout } = useAuth();
  const activeUser = user || currentUser;
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") {
      return true;
    }

    if (path !== "/" && location.pathname.startsWith(path)) {
      return true;
    }

    return false;
  };

  function handleLogout() {
    logout();
    navigate("/sign-in");
  }

  function linkStyle(path) {
    return `
            flex items-center gap-3 rounded-lg px-4 py-3
            transition duration-200
            ${
              location.pathname === path
                ? "bg-lavender text-ink font-semibold"
                : "text-lavender hover:bg-white/10"
            }
        `;
  }

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col bg-ink">
      <div className="border-b border-white/10 px-6 py-6">
        <Link
          to={user ? "/dashboard" : "/sign-in"}
          className="text-2xl font-bold text-lavender"
        >
          RAL HR
        </Link>

        <p className="mt-1 text-sm text-lavender/60">Human Resources</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <p className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-lavender/60">
          Menu
        </p>

        {user ? (
          <>
            {user.role === "HR Admin" && (
              <>
                <Link to="/dashboard" className={linkStyle("/dashboard")}>
                  <LayoutDashboard size={18} />
                  {t("nav.home")}
                </Link>

                <Link to="/user/all" className={linkStyle("/user/all")}>
                  <Users size={18} />
                  Employees
                </Link>

                <Link to="/dep/all" className={linkStyle("/dep/all")}>
                  <Building2 size={18} />
                  Departments
                </Link>

                <Link
                  to="/admin/calendar"
                  className={linkStyle("/admin/calendar")}
                >
                  <Calendar size={18} />
                  Attendance
                </Link>
                <Link
                  to="/attendance/punch"
                  className={linkStyle("/attendance/punch")}
                >
                  <Fingerprint size={18} />
                  <span>{t("nav.punch", "Punch")}</span>
                </Link>

                <Link
                  to="/attendance/history"
                  className={linkStyle("/attendance/history")}
                >
                  <History className="w-4 h-4" />
                  <span>{t("nav.myAttendance", "My Logs")}</span>
                </Link>

                <Link
                  to="/admin/attendance/corrections"
                  className={linkStyle("/admin/attendance/corrections")}
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>{t("nav.corrections", "Corrections Queue")}</span>
                </Link>
                <Link
                  to="/admin/audit-logs"
                  className={linkStyle("/admin/audit-logs")}
                >
                  <Shield className="w-4 h-4" />
                  <span>
                    {t?.("nav.auditLogs", "Audit Trail") || "Audit Trail"}
                  </span>
                </Link>

                

                <Link
                  to="/leave"
                  className={linkStyle("/leave")}
                >
                  <CalendarCheck  size={18} />
                  My Leave Requests
                </Link>
                <Link
                  to="/leave/all"
                  className={linkStyle("/leave/all")}
                >
                  <Inbox size={18} />
                  Leave Requests Management
                </Link>

                <Link to="/payslips" className={linkStyle("/payslips")}>
                  <CreditCard size={18} />
                  <span>{t("nav.payslips", "Payslips")}</span>
                </Link>
              </>
            )}

            {user.role === "Employee" && (
              <>
                <Link to="/attendance" className={linkStyle("/attendance")}>
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>

                <Link
                  to="/attendance/punch"
                  className={linkStyle("/attendance/punch")}
                >
                  <Fingerprint size={18} />
                  Punch In / Out
                </Link>

                <Link
                  to="/attendance/history"
                  className={linkStyle("/attendance/history")}
                >
                  <History size={18} />
                  My Attendance
                </Link>
                <Link
                  to="/leave"
                  className={linkStyle("/leave")}
                >
                  <CalendarCheck  size={18} />
                  My Leave Requests
                </Link>

                <Link
                  to={`/${user._id}/payslips`}
                  className={linkStyle(`/${user._id}/payslips`)}
                >
                  <CreditCard size={18} />
                  Payslips
                </Link>

              </>
            )}

            {(user.role === "Manager" || user.role === "manager") && (
              <>
                <Link to="/attendance" className={linkStyle("/attendance")}>
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>

                <Link
                  to="/attendance/punch"
                  className={linkStyle("/attendance/punch")}
                >
                  <Fingerprint size={18} />
                  Punch In / Out
                </Link>

                <Link
                  to="/attendance/history"
                  className={linkStyle("/attendance/history")}
                >
                  <History size={18} />
                  My Attendance
                </Link>

                <Link
                  to="/manager/team-attendance"
                  className={linkStyle("/manager/team-attendance")}
                >
                  <Users size={18} />
                  Team Attendance
                </Link>

                <Link
                  to="/leave"
                  className={linkStyle("/leave")}
                >
                  <CalendarCheck  size={18} />
                  My Leave Requests
                </Link>

                <Link
                  to="/leave/team"
                  className={linkStyle("/manager/team-leave-requests")}
                >
                  <Inbox size={18} />
                  Team Leave Requests
                </Link>

                <Link
                  to={`/${user._id}/payslips`}
                  className={linkStyle(`/${user._id}/payslips`)}
                >
                  <CreditCard size={18} />
                  Payslips
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300 font-semibold">
                    {t("nav.teamAttendance", "Team Attendance")}
                  </span>
                </Link>

              
              </>
            )}
          </>
        ) : (
          <Link to="/sign-in" className={linkStyle("/sign-in")}>
            {t("nav.signIn")}
          </Link>

        )}
      </nav>

      <div className="border-t border-white/10 p-4">
        {user && (
          <button
            type="button"
            onClick={handleLogout}
            className="
                            flex w-full items-center gap-3
                            rounded-lg border border-stop/40
                            px-4 py-3
                            text-left font-medium text-red-200
                            transition
                            hover:bg-stop hover:text-white
                        "
          >
            <LogOut size={18} />
            {t("nav.signOut")}
          </button>
        )}
      </div>
    </aside>
  );
}

export default Navbar;
