import React, { useState, useEffect, useMemo } from "react";
import { io } from "socket.io-client";
import "../../styles/attendance/admin-calendar-overview.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function AdminCalendarOverview() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [logs, setLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Filter States
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedEmp, setSelectedEmp] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // UI & Loading States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeDayModal, setActiveDayModal] = useState(null); // Selected date for day drawer

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  // 1. Fetch Department & Employee Directory
  useEffect(() => {
    const fetchDirectory = async () => {
      try {
        const token = localStorage.getItem("token");
        const empRes = await fetch(`${API_BASE_URL}/employees`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const empData = await empRes.json();
        if (empRes.ok && Array.isArray(empData)) {
          setEmployees(empData);

          // Extract distinct departments
          const deptMap = new Map();
          empData.forEach((emp) => {
            if (emp.department) {
              const id =
                typeof emp.department === "string"
                  ? emp.department
                  : emp.department._id;
              const name =
                typeof emp.department === "string"
                  ? emp.department
                  : emp.department.name;
              if (id && !deptMap.has(id)) {
                deptMap.set(id, { id, name: name || "General" });
              }
            }
          });
          setDepartments(Array.from(deptMap.values()));
        }
      } catch (err) {
        console.error("Directory fetch failed:", err);
      }
    };
    fetchDirectory();
  }, []);

  // 2. Fetch Monthly Attendance Logs
  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        year: year.toString(),
        month: month.toString(),
      });
      if (selectedDept) params.append("department", selectedDept);
      if (selectedEmp) params.append("employeeId", selectedEmp);

      const res = await fetch(
        `${API_BASE_URL}/attendance/admin/calendar?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to fetch attendance logs.");
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [year, month, selectedDept, selectedEmp]);

  // 3. Live Socket Updates
  useEffect(() => {
    const socket = io(API_BASE_URL);
    socket.on("attendance:clockedIn", ({ attendance }) => {
      if (!attendance) return;
      setLogs((prev) => {
        const idx = prev.findIndex((l) => l._id === attendance._id);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = attendance;
          return next;
        }
        return [...prev, attendance];
      });
    });

    socket.on("attendance:clockedOut", ({ attendance }) => {
      if (!attendance) return;
      setLogs((prev) =>
        prev.map((l) => (l._id === attendance._id ? attendance : l)),
      );
    });

    return () => socket.disconnect();
  }, []);

  // 4. Calculate Aggregate Monthly KPIs
  const stats = useMemo(() => {
    let present = 0;
    let late = 0;
    let absent = 0;
    let otMinutes = 0;
    let missingOut = 0;
    let pendingCorrections = 0;

    logs.forEach((log) => {
      if (log.status === "Present") present++;
      if (log.status === "Absent") absent++;
      if (log.flags?.includes("late")) late++;
      if (log.flags?.includes("missingTimeOut")) missingOut++;
      if (log.overtimeMinutes) otMinutes += log.overtimeMinutes;
      if (log.correctionRequests?.some((r) => r.status === "pending")) {
        pendingCorrections++;
      }
    });

    const totalTracked = present + absent;
    const presentRate =
      totalTracked > 0 ? Math.round((present / totalTracked) * 100) : 100;
    const otHours = (otMinutes / 60).toFixed(1);

    return {
      present,
      late,
      absent,
      presentRate,
      otHours,
      missingOut,
      pendingCorrections,
    };
  }, [logs]);

  // 5. Calendar Date Mathematics
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();

  // Index logs by date string (YYYY-MM-DD)
  const logsByDate = useMemo(() => {
    const map = new Map();
    logs.forEach((log) => {
      if (!log.date) return;
      const d = new Date(log.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate(),
      ).padStart(2, "0")}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(log);
    });
    return map;
  }, [logs]);

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 2, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month, 1));

  const formatTime = (iso) => {
    if (!iso) return "--:--";
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="admin-overview-container">
      {/* 1. Header & Title Bar */}
      <div className="overview-header">
        <div>
          <span className="badge-org-overview">Executive HR View</span>
          <h1>Organization Attendance Calendar</h1>
          <p className="subtext">
            Monitor real-time company punch compliance, exception tracking, and
            monthly aggregates.
          </p>
        </div>

        {/* Month Navigation */}
        <div className="month-picker-pill">
          <button className="btn-nav" onClick={handlePrevMonth}>
            &larr;
          </button>
          <span className="current-month-display">
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <button className="btn-nav" onClick={handleNextMonth}>
            &rarr;
          </button>
        </div>
      </div>

      {/* 2. Executive KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card card-present">
          <div className="kpi-label">Attendance Rate</div>
          <div className="kpi-val">{stats.presentRate}%</div>
          <div className="kpi-footer">
            {stats.present} recorded present shifts
          </div>
        </div>

        <div className="kpi-card card-late">
          <div className="kpi-label">Late Arrivals</div>
          <div className="kpi-val">{stats.late}</div>
          <div className="kpi-footer">Shift grace exceeded</div>
        </div>

        <div className="kpi-card card-absent">
          <div className="kpi-label">Unexcused Absences</div>
          <div className="kpi-val">{stats.absent}</div>
          <div className="kpi-footer">Working days with 0 punches</div>
        </div>

        <div className="kpi-card card-overtime">
          <div className="kpi-label">Overtime Logged</div>
          <div className="kpi-val">{stats.otHours} hrs</div>
          <div className="kpi-footer">Eligible for monthly payroll</div>
        </div>

        <div className="kpi-card card-exceptions">
          <div className="kpi-label">Missing Out Punches</div>
          <div className="kpi-val">{stats.missingOut}</div>
          <div className="kpi-footer">Auto-flagged for review</div>
        </div>
      </div>

      {/* 3. Filter Toolbar */}
      <div className="filter-card">
        <div className="filter-item">
          <label>Department</label>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label>Employee</label>
          <select
            value={selectedEmp}
            onChange={(e) => setSelectedEmp(e.target.value)}
          >
            <option value="">All Employees</option>
            {employees.map((e) => (
              <option key={e._id} value={e._id}>
                {e.fullName || e.name} ({e.employeeCode || "EMP"})
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label>Status Filter</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Present">Present Only</option>
            <option value="Absent">Absent Only</option>
            <option value="Late">Late Arrivals</option>
          </select>
        </div>

        <div className="filter-right-actions">
          <button className="btn-refresh" onClick={fetchLogs}>
            {loading ? "Loading..." : "↻ Refresh Data"}
          </button>
        </div>
      </div>

      {error && <div className="overview-error-box">{error}</div>}

      {/* 4. Interactive 7-Day Month Grid */}
      <div className="calendar-grid-card">
        {/* Day Header Row */}
        <div className="grid-days-header">
          {DAYS_OF_WEEK.map((d) => (
            <div key={d} className="header-cell">
              {d}
            </div>
          ))}
        </div>

        {/* Month Cells */}
        <div className="grid-month-body">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="day-cell cell-empty"></div>
          ))}

          {/* Days of Month */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
            const dayLogs = logsByDate.get(dateKey) || [];

            // Daily stats
            const presentCount = dayLogs.filter(
              (l) => l.status === "Present",
            ).length;
            const lateCount = dayLogs.filter((l) =>
              l.flags?.includes("late"),
            ).length;
            const absentCount = dayLogs.filter(
              (l) => l.status === "Absent",
            ).length;
            const missingOutCount = dayLogs.filter((l) =>
              l.flags?.includes("missingTimeOut"),
            ).length;

            const isToday =
              new Date().getDate() === dayNum &&
              new Date().getMonth() + 1 === month &&
              new Date().getFullYear() === year;

            return (
              <div
                key={dayNum}
                className={`day-cell ${isToday ? "cell-today" : ""} ${dayLogs.length > 0 ? "has-records" : ""}`}
                onClick={() =>
                  setActiveDayModal({ dayNum, dateKey, logs: dayLogs })
                }
              >
                <div className="cell-top">
                  <span
                    className={`day-number ${isToday ? "today-badge" : ""}`}
                  >
                    {dayNum}
                  </span>
                  {dayLogs.length > 0 && (
                    <span className="cell-record-count">
                      {dayLogs.length} logged
                    </span>
                  )}
                </div>

                {/* Day Summary Badges */}
                <div className="cell-mini-summary">
                  {presentCount > 0 && (
                    <span className="mini-pill pill-present">
                      {presentCount} Present
                    </span>
                  )}
                  {lateCount > 0 && (
                    <span className="mini-pill pill-late">
                      {lateCount} Late
                    </span>
                  )}
                  {absentCount > 0 && (
                    <span className="mini-pill pill-absent">
                      {absentCount} Absent
                    </span>
                  )}
                  {missingOutCount > 0 && (
                    <span className="mini-pill pill-warn">
                      ⚠️ {missingOutCount} No Out
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Day Inspector Drawer / Modal */}
      {activeDayModal && (
        <div
          className="day-drawer-backdrop"
          onClick={() => setActiveDayModal(null)}
        >
          <div className="day-drawer-card" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <h2>
                  Attendance Details — {MONTH_NAMES[month - 1]}{" "}
                  {activeDayModal.dayNum}, {year}
                </h2>
                <p className="subtext">
                  {activeDayModal.logs.length} employee records for this date
                </p>
              </div>
              <button
                className="btn-drawer-close"
                onClick={() => setActiveDayModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="drawer-body">
              {activeDayModal.logs.length === 0 ? (
                <div className="empty-day-state">
                  <p>No attendance punches recorded on this calendar day.</p>
                </div>
              ) : (
                <table className="drawer-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>In / Out Time</th>
                      <th>Worked / Overtime</th>
                      <th>Status</th>
                      <th>Exceptions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeDayModal.logs.map((log) => (
                      <tr key={log._id}>
                        <td>
                          <strong>
                            {log.employee?.fullName || "Employee"}
                          </strong>
                          <span className="emp-dept-label">
                            {log.employee?.department?.name ||
                              "General Department"}
                          </span>
                        </td>
                        <td>
                          <div className="time-stack">
                            <span>
                              In: <strong>{formatTime(log.inTime)}</strong>
                            </span>
                            <span>
                              Out: <strong>{formatTime(log.outTime)}</strong>
                            </span>
                          </div>
                        </td>
                        <td>
                          <div>
                            {Math.floor((log.workedMinutes || 0) / 60)}h{" "}
                            {(log.workedMinutes || 0) % 60}m
                          </div>
                          {log.overtimeMinutes > 0 && (
                            <span className="drawer-ot-badge">
                              +{log.overtimeMinutes}m OT
                            </span>
                          )}
                        </td>
                        <td>
                          <span
                            className={`status-pill status-${(log.status || "").toLowerCase().replace(" ", "-")}`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td>
                          <div className="flags-flex">
                            {log.flags?.map((f) => (
                              <span key={f} className={`flag-tag flag-${f}`}>
                                {f}
                              </span>
                            ))}
                            {(!log.flags || log.flags.length === 0) && (
                              <span className="text-muted">None</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="drawer-footer">
              <button
                className="btn-drawer-done"
                onClick={() => setActiveDayModal(null)}
              >
                Close Day Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
