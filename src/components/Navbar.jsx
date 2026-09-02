import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

import {
  LayoutDashboard,
  Users,
  Building2,
  Fingerprint,
  Calendar,
  Inbox,
  CreditCard,
  LogOut,
  CalendarCheck, 
  Shield,
  ChevronDown,
  
} from "lucide-react";

function Navbar() {
  const { t } = useTranslation();
  const { user, currentUser, logout } = useAuth();
  const activeUser = user || currentUser;
  const location = useLocation();
  const navigate = useNavigate();

  const [leaveMenuOpen, setLeaveMenuOpen] = useState(location.pathname.startsWith("/leave"));
  const [attendanceMenuOpen, setAttendanceMenuOpen] = useState(location.pathname.startsWith("/attendance"));
  const [payslipsMenuOpen, setPayslipsMenuOpen] = useState(location.pathname.includes("payslip"));

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
  function subLinkStyle(path) {
    return `
      flex items-center gap-2 rounded-lg px-3 py-2
      text-sm whitespace-nowrap transition duration-200
      ${
        location.pathname === path
          ? "bg-lavender text-ink font-semibold"
          : "text-lavender hover:bg-white/10"
      }
    `;
  }

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col bg-ink">
      <div className="border-b border-white/10 px-6 py-4">
        <Link
          to={user ? "/dashboard" : "/sign-in"}
          className="text-2xl font-bold text-lavender"
        >
          <img
            src="/RAL-logo.png"
            alt="RAL"
            className="h-20 w-auto object-contain"
          />
        </Link>

      </div>

      <nav className="sidebar-nav flex-1 overflow-y-auto px-4 py-6">
        <p className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-lavender/60">
          Menu
        </p>

        {user ? (
          <>
                <Link to="/dashboard" className={linkStyle("/dashboard")}>
                  <LayoutDashboard size={18} />
                  {t("DashBoard")}
                </Link>
                <Link
                  to="/attendance/punch"
                  className={linkStyle("/attendance/punch")}
                >
                  <Fingerprint size={18} />
                  <span>{t("nav.punch", "Punch")}</span>
                </Link>         

            {user.role === "HR Admin" && (
              <>
                <Link to="/user/all" className={linkStyle("/user/all")}>
                  <Users size={18} />
                  Employees
                </Link>

                <Link to="/dep/all" className={linkStyle("/dep/all")}>
                  <Building2 size={18} />
                  Departments
                </Link>
              </>
            )}

            {user.role === 'Employee' ?
              <>
                <Link to="/attendance/history" className={linkStyle("/attendance/history")}>
                  <LayoutDashboard size={18} />
                  Attendance
                </Link>
              </>
               :
               <>                  
                  <div>
                    <button
                      type="button"
                      onClick={() => setAttendanceMenuOpen((current) => !current)}
                      className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-lavender transition duration-200 hover:bg-white/10"
                    >
                      <span className="flex items-center gap-3">
                        <Calendar size={18} />
                        Attendance
                      </span>

                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${attendanceMenuOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {attendanceMenuOpen && (
                      <div className="ml-5 mt-1 space-y-1 border-l border-white/20 pl-3">
                        <Link
                          to="/attendance/history"
                          className={subLinkStyle("/attendance/history")}
                        >
                          My Attendance
                        </Link>

                        {user.role === 'Manager' ?
                          <>
                            <Link
                              to="/manager/team-attendance"
                              className={subLinkStyle("/manager/attendance")}
                            >
                              Team Attendance
                            </Link>

                          </> 
                          :
                          <>
                            <Link
                              to="/admin/calendar"
                              className={subLinkStyle("/admin/calendar")}
                            >
                              Attendance Calendar
                            </Link>
                            <Link
                              to="/admin/attendance/corrections"
                              className={subLinkStyle("/admin/attendance/corrections")}
                            >
                              <span>{t("nav.corrections", "Corrections Queue")}</span>
                            </Link>
                            
                          </>
                        }
                      </div>
                    )}
                  </div>
               </>
            }

            {user.role === 'Employee' ? 
              <>
                <Link
                  to="/leave"
                  className={linkStyle("/leave")}
                >
                  <CalendarCheck  size={18} />
                  Leave Requests
                </Link>
              </>
              :
              <>
                <div>
                  <button
                    type="button"
                    onClick={() => setLeaveMenuOpen((current) => !current)}
                    className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-lavender transition duration-200 hover:bg-white/10"
                  >
                    <span className="flex items-center gap-3">
                      <Inbox size={18} />
                      Leave Requests
                    </span>

                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${leaveMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {leaveMenuOpen && (
                    <div className="ml-5 mt-1 space-y-1 border-l border-white/20 pl-3">
                      <Link to="/leave" className={subLinkStyle("/leave")}>
                        My Requests
                      </Link>

                      {user.role === 'Manager'? 
                        <>
                          <Link to="/leave/team" className={subLinkStyle("/leave/team")}>
                            Team Leaves
                          </Link>
                        </>
                        :
                        <>
                          <Link
                            to="/leave/all"
                            className={subLinkStyle("/leave/all")}
                          >
                            Leave Management
                          </Link>

                        </>
                      }

                    </div>
                  )}
                </div>
              </>
            }

            {user.role !== 'HR Admin'? 
              <>
                <Link
                  to={`/payslips`}
                  className={linkStyle(`/payslips`)}
                >
                  <CreditCard size={18} />
                  Payslips
                </Link>

              </>
              : 
              <>
                <div>
                  <button
                    type="button"
                    onClick={() => setPayslipsMenuOpen((current) => !current)}
                    className="
                      flex w-full items-center justify-between rounded-lg px-4 py-3
                      text-lavender transition duration-200 hover:bg-white/10
                    "
                  >
                    <span className="flex items-center gap-3">
                      <CreditCard size={18} />
                      Payslips
                    </span>

                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${
                        payslipsMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {payslipsMenuOpen && (
                    <div className="ml-5 mt-1 space-y-1 border-l border-white/20 pl-3">
                      <Link
                        to={`/payslips`}
                        className={subLinkStyle(`/payslips`)}
                        >
                        My Payslips
                      </Link>

                      <Link
                        to="/admin/payslips"
                        className={subLinkStyle("/admin/payslips")}
                      >
                        Employee Payslips
                      </Link>
                    </div>
                  )}
                </div>
              </>
            }

            {user.role === 'HR Admin' && 
              <Link
                to="/admin/audit-logs"
                className={linkStyle("/admin/audit-logs")}
              >
                <Shield className="w-4 h-4" />
                <span>
                  {t?.("nav.auditLogs", "Audit Trail") || "Audit Trail"}
                </span>
              </Link>
            }







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
