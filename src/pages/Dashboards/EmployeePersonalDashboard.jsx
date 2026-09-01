import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
// import api from "@/services/api";

import {
  Clock,
  CreditCard,
  Building2,
  Mail,
  Briefcase,
  CheckCircle2,
  TrendingUp,
  User,
  FileText,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import "../../styles/Dashboard/EmployeePersonalDashboard.css";

const API_BASE_URL = import.meta.env.VITE_BACK_END_SERVER_URL;

export default function EmployeePersonalDashboard() {
  const { user, currentUser } = useAuth();
  const activeUser = user || currentUser;
  const navigate = useNavigate();

  const [myAttendance, setMyAttendance] = useState([]);
  const [myPayslips, setMyPayslips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Safely extract user ID supporting both _id and id properties
  const employeeId = activeUser?._id || activeUser?.id;

  useEffect(() => {
    if (!employeeId) return;

    const fetchMyData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token") || "";

        // 1. Fetch Attendance Logs (using query parameter or adjusting to match backend)
        const attRes = await fetch(
          `${API_BASE_URL}/attendance/logs?employeeId=${employeeId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (attRes.ok) {
          const attData = await attRes.json();
          setMyAttendance(
            Array.isArray(attData) ? attData : attData.logs || [],
          );
        }

        // Fetch Payslips securely via the self-service route
        const payRes = await fetch(
          `${API_BASE_URL}/payslips/my-payslips`, // or /payslips/me depending on your routes file
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (payRes.ok) {
          const payData = await payRes.json();
          setMyPayslips(
            Array.isArray(payData) ? payData : payData.payslips || [],
          );
        } else {
          console.warn(
            `Failed to fetch payslips: Server returned status ${payRes.status}`,
          );
        }
      } catch (err) {
        console.error("Error fetching personal dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyData();
  }, [employeeId]);

  if (!activeUser) {
    return (
      <div className="auth-warning-card">
        <AlertCircle className="auth-warning-icon" />
        <p className="auth-warning-text">
          Please sign in to view your personal dashboard.
        </p>
      </div>
    );
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayRecord = myAttendance.find((r) => {
    if (!r.date) return false;
    return new Date(r.date).toISOString().slice(0, 10) === todayStr;
  });

  const isClockedIn = Boolean(
    todayRecord && todayRecord.inTime && !todayRecord.outTime,
  );
  const isCompletedToday = Boolean(
    todayRecord && todayRecord.inTime && todayRecord.outTime,
  );

  const totalDaysPresent = myAttendance.filter(
    (r) => r.status === "Present",
  ).length;

  const totalWorkedMinutes = myAttendance.reduce(
    (acc, r) => acc + (r.workedMinutes || 0),
    0,
  );
  const totalWorkedHours = (totalWorkedMinutes / 60).toFixed(1);

  const totalOvertimeMinutes = myAttendance.reduce(
    (acc, r) => acc + (r.overtimeMinutes || 0),
    0,
  );
  const totalOvertimeHours = (totalOvertimeMinutes / 60).toFixed(1);

  const latestPayslip = myPayslips[0] || null;

  const basicSalaryFils = activeUser.basicSalaryFils || 0;
  const allowancesFils = latestPayslip?.allowances || 0;

  const basicSalaryBHD = (basicSalaryFils / 1000).toFixed(3);
  const allowancesBHD = (allowancesFils / 1000).toFixed(3);

  const grossSalaryBHD = latestPayslip
    ? ((latestPayslip.grossSalary || 0) / 1000).toFixed(3)
    : (basicSalaryFils / 1000).toFixed(3);

  const formatTime = (timeIso) => {
    if (!timeIso) return "--:--";
    return new Date(timeIso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getClockBtnClass = () => {
    if (isClockedIn) return "clock-btn clock-btn-active";
    if (isCompletedToday) return "clock-btn clock-btn-completed";
    return "clock-btn clock-btn-default";
  };

  return (
    <div className="dashboard-container">
      {/* 1. Employee Profile Header Banner */}
      <div className="profile-banner">
        <div className="banner-ambient-glow" />

        <div className="banner-content">
          <div className="user-meta-group">
            <div className="avatar-circle">
              {activeUser.fullName?.charAt(0) || "U"}
            </div>

            <div className="user-identity">
              <div className="name-role-row">
                <h1 className="user-fullname">{activeUser.fullName}</h1>
                <span className="role-badge">{activeUser.role}</span>
                <span className="employee-code-tag">
                  {activeUser.employeeCode}
                </span>
              </div>

              <div className="meta-details-row">
                <span className="meta-item">
                  <Briefcase className="meta-icon" />
                  {activeUser.jobTitle || "Team Member"}
                </span>
                <span className="meta-item">
                  <Building2 className="meta-icon" />
                  {activeUser.department?.departmentName ||
                    activeUser.department?.name ||
                    activeUser.department ||
                    "General"}
                </span>
                <span className="meta-item">
                  <Mail className="meta-icon" />
                  {activeUser.workEmail}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/attendance/punch")}
            className={getClockBtnClass()}
          >
            <Clock className="btn-icon-sm" />
            <span>
              {isClockedIn
                ? "Currently Clocked IN (Clock Out)"
                : isCompletedToday
                  ? "Shift Completed (View Log)"
                  : "Clock In Now"}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Key Personal KPIs Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-box emerald">
            <CheckCircle2 className="kpi-icon" />
          </div>
          <div>
            <span className="kpi-label">Days Present</span>
            <div className="kpi-value">{totalDaysPresent} Days</div>
            <span className="kpi-subtext emerald">Active Shift Log</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box purple">
            <Clock className="kpi-icon" />
          </div>
          <div>
            <span className="kpi-label">Total Hours Logged</span>
            <div className="kpi-value">
              {totalWorkedHours} <span className="kpi-value-unit">hrs</span>
            </div>
            <span className="kpi-subtext purple">Standard shift (8h/day)</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box amber">
            <TrendingUp className="kpi-icon" />
          </div>
          <div>
            <span className="kpi-label">Overtime Logged</span>
            <div className="kpi-value">
              {totalOvertimeHours} <span className="kpi-value-unit">hrs</span>
            </div>
            <span className="kpi-subtext amber">Eligible for Payroll</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box indigo">
            <CreditCard className="kpi-icon" />
          </div>
          <div>
            <span className="kpi-label">Monthly Base Salary</span>
            <div className="kpi-value font-mono">{basicSalaryBHD} BHD</div>
            <span className="kpi-subtext indigo">
              + {allowancesBHD} Allowances
            </span>
          </div>
        </div>
      </div>

      {/* 3. Personal Employment Profile & Recent Records */}
      <div className="dashboard-main-grid">
        {/* Left Column: Employment Information */}
        <div className="column-left">
          <div className="section-card">
            <div className="section-card-header">
              <h2 className="section-card-title">
                <User className="section-title-icon purple" />
                <span>My Employment Profile</span>
              </h2>
              <span className="badge badge-emerald">
                {activeUser.status || "Active"}
              </span>
            </div>

            <div className="profile-details-list">
              <div className="profile-detail-row">
                <span className="profile-label">Employee Code</span>
                <span className="profile-value font-mono">
                  {activeUser.employeeCode}
                </span>
              </div>

              <div className="profile-detail-row">
                <span className="profile-label">CPR Number</span>
                <span className="profile-value font-mono">
                  {activeUser.cprNumber || "--"}
                </span>
              </div>

              <div className="profile-detail-row">
                <span className="profile-label">Department</span>
                <span className="profile-value">
                  {activeUser.department?.departmentName ||
                    activeUser.department?.name ||
                    activeUser.department ||
                    "General"}
                </span>
              </div>

              <div className="profile-detail-row">
                <span className="profile-label">Job Title</span>
                <span className="profile-value">
                  {activeUser.jobTitle || "Team Member"}
                </span>
              </div>

              <div className="profile-detail-row">
                <span className="profile-label">Date of Joining</span>
                <span className="profile-value">
                  {activeUser.dateOfJoining
                    ? new Date(activeUser.dateOfJoining).toLocaleDateString()
                    : "2026-01-01"}
                </span>
              </div>

              <div className="profile-detail-row">
                <span className="profile-label">Phone Number</span>
                <span className="profile-value">
                  {activeUser.phoneNumber || "+973 3600 0000"}
                </span>
              </div>

              <div className="profile-detail-row">
                <span className="profile-label">Nationality / SIO</span>
                <span className="profile-value">
                  {activeUser.isBahraini
                    ? "Bahraini Citizen (8% SIO)"
                    : "Expatriate (1% SIO)"}
                </span>
              </div>
            </div>

            <div className="salary-structure-box">
              <h3 className="salary-structure-title">Salary Structure (BHD)</h3>
              <div className="salary-row">
                <span className="profile-label">Basic Monthly Wage:</span>
                <span className="profile-value font-mono">
                  {basicSalaryBHD} BHD
                </span>
              </div>
              <div className="salary-row">
                <span className="profile-label">Allowances:</span>
                <span className="profile-value font-mono">
                  {allowancesBHD} BHD
                </span>
              </div>
              <div className="salary-total-row">
                <span className="salary-total-label">Total Gross:</span>
                <span className="salary-total-value">{grossSalaryBHD} BHD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Attendance Activity & Payslip */}
        <div className="column-right">
          {/* Recent Attendance Activity */}
          <div className="section-card">
            <div className="section-card-header">
              <div>
                <h2 className="section-card-title">
                  <Clock className="section-title-icon purple" />
                  <span>My Recent Attendance</span>
                </h2>
                <p className="section-card-subtitle">
                  Your most recent clock-in & clock-out records
                </p>
              </div>

              <Link to="/attendance/history" className="header-link">
                <span>View Full Log</span>
                <ArrowRight style={{ width: "0.875rem", height: "0.875rem" }} />
              </Link>
            </div>

            {loading ? (
              <div className="empty-state-text">
                <div className="spinner" />
                Loading your logs...
              </div>
            ) : myAttendance.length === 0 ? (
              <div className="empty-state-text">
                No attendance logs found. Use the Punch terminal to record
                today's shift.
              </div>
            ) : (
              <div className="attendance-list">
                {myAttendance.slice(0, 5).map((rec) => (
                  <div key={rec._id} className="attendance-item">
                    <div className="attendance-info">
                      <div className="attendance-date-box">
                        {new Date(rec.date).getDate()}
                      </div>
                      <div>
                        <strong className="attendance-date-text">
                          {new Date(rec.date).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </strong>
                        <span className="attendance-time-text">
                          In: {formatTime(rec.inTime)} | Out:{" "}
                          {formatTime(rec.outTime)}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span
                        className={`badge ${
                          rec.status === "Present"
                            ? "badge-emerald"
                            : rec.status === "Absent"
                              ? "badge-rose"
                              : "badge-purple"
                        }`}
                      >
                        {rec.status}
                      </span>
                      {rec.overtimeMinutes > 0 && (
                        <span className="overtime-text">
                          +{rec.overtimeMinutes}m OT
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Latest Payslip Summary */}
          <div className="section-card">
            <div className="section-card-header">
              <div>
                <h2 className="section-card-title">
                  <CreditCard className="section-title-icon emerald" />
                  <span>My Monthly Payslip</span>
                </h2>
                <p className="section-card-subtitle">
                  Official salary statement & take-home earnings
                </p>
              </div>

              <Link to="/payslips" className="header-link">
                <span>View All Payslips</span>
                <ArrowRight style={{ width: "0.875rem", height: "0.875rem" }} />
              </Link>
            </div>

            {latestPayslip ? (
              <div className="payslip-summary-box">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span className="payslip-period-title">
                      Period:{" "}
                      {latestPayslip.period ||
                        `Month ${latestPayslip.month}, ${latestPayslip.year}`}
                    </span>
                    <span className="badge badge-emerald">
                      {latestPayslip.status || "Approved"}
                    </span>
                  </div>
                  <div className="payslip-amount">
                    {((latestPayslip.netSalary || 0) / 1000).toFixed(3)} BHD
                  </div>
                  <span className="section-card-subtitle">
                    Net take-home pay after statutory SIO contributions
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/payslips")}
                  className="btn-payslip"
                >
                  <FileText style={{ width: "1rem", height: "1rem" }} />
                  <span>View Statement</span>
                </button>
              </div>
            ) : (
              <div
                className="empty-state-text"
                style={{ backgroundColor: "#f8fafc", borderRadius: "1rem" }}
              >
                No payslips issued yet for this period.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
