import React from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";

import {
    LayoutDashboard,
    Users,
    Building2,
    Fingerprint,
    History,
    Calendar,
    CreditCard,
    LogOut,
    LogIn,
} from "lucide-react";

function Navbar() {
    const { t } = useTranslation();
    const { user, currentUser, logout } = useAuth();

    const location = useLocation();
    const navigate = useNavigate();

    const activeUser = user || currentUser;
    const role = activeUser?.role;

    const isAuthenticated = Boolean(activeUser);
    const isHRAdmin = role === "HR Admin";
    const isManager = role === "Manager";

    // Dashboard path based on role
    const dashboardPath = isHRAdmin ? "/dashboard" : "/attendance";

    function handleLogout() {
        logout();
        navigate("/sign-in");
    }

    function isActive(path) {
        return location.pathname === path;
    }

    function linkStyle(path) {
        return `
            flex items-center gap-3 rounded-lg px-4 py-3
            transition duration-200
            ${isActive(path)
                ? "bg-lavender text-ink font-semibold"
                : "text-lavender hover:bg-white/10"
            }
        `;
    }

    return (
        <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col bg-ink">

            {/* ================= LOGO ================= */}

            <div className="border-b border-white/10 px-6 py-6">

                <Link
                    to={isAuthenticated ? dashboardPath : "/"}
                    className="text-2xl font-bold text-lavender"
                >
                    RAL HR
                </Link>

                <p className="mt-1 text-sm text-lavender/60">
                    Human Resources
                </p>

            </div>


            {/* ================= NAVIGATION ================= */}

            <nav className="flex-1 overflow-y-auto px-4 py-6">

                <p className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-lavender/60">
                    Menu
                </p>


                {/* ================= NOT LOGGED IN ================= */}

                {!isAuthenticated && (

                    <Link
                        to="/sign-in"
                        className={linkStyle("/sign-in")}
                    >
                        <LogIn size={18} />

                        {t("nav.signIn", "Sign In")}
                    </Link>

                )}


                {/* ================= LOGGED IN ================= */}

                {isAuthenticated && (

                    <>

                        {/* Dashboard */}

                        <Link
                            to={dashboardPath}
                            className={linkStyle(dashboardPath)}
                        >
                            <LayoutDashboard size={18} />

                            {t("nav.dashboard", "Dashboard")}
                        </Link>


                        {/* ================= HR ADMIN ================= */}

                        {isHRAdmin && (

                            <>

                                {/* Employees */}

                                <Link
                                    to="/user/all"
                                    className={linkStyle("/user/all")}
                                >
                                    <Users size={18} />

                                    Employees
                                </Link>


                                {/* Departments */}

                                <Link
                                    to="/dep/all"
                                    className={linkStyle("/dep/all")}
                                >
                                    <Building2 size={18} />

                                    Departments
                                </Link>


                                {/* Admin Attendance */}

                                <Link
                                    to="/admin/attendance"
                                    className={linkStyle("/admin/attendance")}
                                >
                                    <Calendar size={18} />

                                    Attendance
                                </Link>

                            </>

                        )}


                        {/* ================= EMPLOYEE / MANAGER ================= */}

                        {!isHRAdmin && (

                            <>

                                {/* Punch */}

                                <Link
                                    to="/attendance/punch"
                                    className={linkStyle("/attendance/punch")}
                                >
                                    <Fingerprint size={18} />

                                    {t("nav.punch", "Punch In / Out")}
                                </Link>


                                {/* Attendance History */}

                                <Link
                                    to="/attendance/history"
                                    className={linkStyle("/attendance/history")}
                                >
                                    <History size={18} />

                                    {t("nav.myAttendance", "My Attendance")}
                                </Link>


                                {/* Payslips */}

                                <Link
                                    to={`/${activeUser?._id}/payslips`}
                                    className={linkStyle(
                                        `/${activeUser?._id}/payslips`
                                    )}
                                >
                                    <CreditCard size={18} />

                                    {t("nav.payslips", "Payslips")}
                                </Link>

                            </>

                        )}


                        {/* ================= MANAGER ================= */}

                        {isManager && (

                            <>

                                <p className="mb-3 mt-6 px-4 text-xs font-semibold uppercase tracking-wider text-lavender/60">
                                    Manager
                                </p>


                                <Link
                                    to="/manager/team-attendance"
                                    className={linkStyle(
                                        "/manager/team-attendance"
                                    )}
                                >
                                    <Users size={18} />

                                    Team Attendance
                                </Link>

                            </>

                        )}

                    </>

                )}

            </nav>


            {/* ================= USER / FOOTER ================= */}

            <div className="border-t border-white/10 p-4">

                {/* User Information */}

                {isAuthenticated && (

                    <div className="mb-4 rounded-lg bg-white/5 p-3">

                        <p className="truncate text-sm font-semibold text-white">
                            {activeUser?.fullName}
                        </p>

                        <p className="mt-1 text-xs text-lavender/60">
                            {activeUser?.employeeCode}
                        </p>

                        <p className="mt-1 text-xs text-lavender/80">
                            {activeUser?.role}
                        </p>

                    </div>

                )}


               