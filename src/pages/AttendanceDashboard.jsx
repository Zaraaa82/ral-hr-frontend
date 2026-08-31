import React, { useState } from "react";
import AttendancePunch from "./AttendancePunch";
import EmployeeAttendanceHistory from "./EmployeeAttendanceHistory";
import ManagerTeamAttendance from "./ManagerTeamAttendance";
import HRPendingCorrections from "./HRPendingCorrections";
import AdminAttendanceCalendar from "./AdminCalendarOverview";
import "../styles/attendance.css";

export default function AttendanceDashboard({ userRole = "HR Admin" }) {
  const [activeTab, setActiveTab] = useState("punch");

  return (
    <div className="attendance-module-container">
      {/* Navigation Tabs */}
      <div className="nav-tabs-bar">
        <button
          className={`tab-item ${activeTab === "punch" ? "active" : ""}`}
          onClick={() => setActiveTab("punch")}
        >
          ⏱️ Punch & My Logs
        </button>

        {(userRole === "Manager" || userRole === "HR Admin") && (
          <button
            className={`tab-item ${activeTab === "team" ? "active" : ""}`}
            onClick={() => setActiveTab("team")}
          >
            👥 Team Attendance
          </button>
        )}

        {userRole === "HR Admin" && (
          <>
            <button
              className={`tab-item ${activeTab === "calendar" ? "active" : ""}`}
              onClick={() => setActiveTab("calendar")}
            >
              📅 Organization Calendar
            </button>
            <button
              className={`tab-item ${activeTab === "corrections" ? "active" : ""}`}
              onClick={() => setActiveTab("corrections")}
            >
              📝 Correction Approvals
            </button>
          </>
        )}
      </div>

      {/* Tab Panels */}
      <div className="tab-body">
        {activeTab === "punch" && (
          <div className="punch-tab-layout">
            <AttendancePunch />
            <EmployeeAttendanceHistory />
          </div>
        )}

        {activeTab === "team" && <ManagerTeamAttendance />}
        {activeTab === "calendar" && <AdminAttendanceCalendar />}
        {activeTab === "corrections" && <HRPendingCorrections />}
      </div>
    </div>
  );
}
