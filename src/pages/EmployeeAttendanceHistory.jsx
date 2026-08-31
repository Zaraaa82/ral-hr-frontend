import React, { useState, useEffect } from "react";
import "../Style/attendance.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function EmployeeAttendanceHistory() {
  const [logs, setLogs] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await fetch(
        `${API_BASE_URL}/attendance/logs?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to fetch attendance history.");
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatHours = (minutes) => {
    if (!minutes || minutes <= 0) return "0h 0m";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="attendance-card">
      <div className="card-header-bar">
        <div>
          <h3>My Attendance Log</h3>
          <p className="subtext">
            View your daily worked hours, overtime, and punch records
          </p>
        </div>

        {/* Date Filter Bar */}
        <div className="filter-row">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input-date"
          />
          <span>to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input-date"
          />
          <button className="btn btn-primary" onClick={fetchLogs}>
            Filter
          </button>
        </div>
      </div>

      {error && <div className="alert-box error">{error}</div>}

      <div className="table-responsive">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Clock In</th>
              <th>Clock Out</th>
              <th>Worked Time</th>
              <th>Overtime</th>
              <th>Status</th>
              <th>Flags</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  Loading records...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4 text-muted">
                  No attendance logs found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id}>
                  <td className="font-semibold">
                    {new Date(log.date).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    {log.inTime
                      ? new Date(log.inTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "--:--"}
                  </td>
                  <td>
                    {log.outTime
                      ? new Date(log.outTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "--:--"}
                  </td>
                  <td>{formatHours(log.workedMinutes)}</td>
                  <td>
                    {log.overtimeMinutes > 0 ? (
                      <span className="badge-ot">
                        +{formatHours(log.overtimeMinutes)}
                      </span>
                    ) : (
                      "--"
                    )}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${(log.status || "").toLowerCase().replace(" ", "-")}`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td>
                    <div className="flags-wrap">
                      {log.flags?.map((flag) => (
                        <span key={flag} className={`flag-chip ${flag}`}>
                          {flag}
                        </span>
                      ))}
                      {(!log.flags || log.flags.length === 0) && "--"}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
