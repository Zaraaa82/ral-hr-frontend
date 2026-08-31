import React, { useState, useEffect } from "react";
import "../Style/attendance.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function ManagerTeamAttendance() {
  const [logs, setLogs] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Correction Modal State
  const [selectedLog, setSelectedLog] = useState(null);
  const [reqInTime, setReqInTime] = useState("");
  const [reqOutTime, setReqOutTime] = useState("");
  const [reqStatus, setReqStatus] = useState("Present");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modalMsg, setModalMsg] = useState("");

  const fetchTeamLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${API_BASE_URL}/attendance/team/calendar?year=${selectedYear}&month=${selectedMonth}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to fetch team attendance.");
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamLogs();
  }, [selectedMonth, selectedYear]);

  const openCorrectionModal = (log) => {
    setSelectedLog(log);
    setReqInTime(
      log.inTime ? new Date(log.inTime).toISOString().slice(11, 16) : "08:00",
    );
    setReqOutTime(
      log.outTime ? new Date(log.outTime).toISOString().slice(11, 16) : "16:00",
    );
    setReqStatus(log.status || "Present");
    setReason("");
    setModalMsg("");
  };

  const handleCorrectionSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setModalMsg("A justification reason is required.");
      return;
    }

    try {
      setSubmitting(true);
      setModalMsg("");

      // Combine log date with hours
      const baseDate = new Date(selectedLog.date).toISOString().slice(0, 10);
      const isoIn = reqInTime ? `${baseDate}T${reqInTime}:00.000Z` : null;
      const isoOut = reqOutTime ? `${baseDate}T${reqOutTime}:00.000Z` : null;

      const res = await fetch(
        `${API_BASE_URL}/attendance/${selectedLog._id}/correction-requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            requestedInTime: isoIn,
            requestedOutTime: isoOut,
            requestedStatus: reqStatus,
            reason,
          }),
        },
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to submit correction request.");

      alert("Correction request submitted for HR review!");
      setSelectedLog(null);
      fetchTeamLogs();
    } catch (err) {
      setModalMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="attendance-card">
      <div className="card-header-bar">
        <div>
          <h3>Team Attendance & Correction Requests</h3>
          <p className="subtext">
            Review direct reports and request time adjustments
          </p>
        </div>

        <div className="filter-row">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {[
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ].map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="input-number"
          />
        </div>
      </div>

      {error && <div className="alert-box error">{error}</div>}

      <div className="table-responsive">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Date</th>
              <th>In / Out</th>
              <th>Status</th>
              <th>Exceptions</th>
              <th>Correction Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  Loading team logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4 text-muted">
                  No attendance logs found for this period.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const hasPending = log.correctionRequests?.some(
                  (r) => r.status === "pending",
                );
                return (
                  <tr key={log._id}>
                    <td>
                      <strong>{log.employee?.fullName || "Employee"}</strong>
                      <span className="code-subtext">
                        {log.employee?.employeeCode}
                      </span>
                    </td>
                    <td>
                      {new Date(log.date).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td>
                      {log.inTime
                        ? new Date(log.inTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "--:--"}
                      {" - "}
                      {log.outTime
                        ? new Date(log.outTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "--:--"}
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
                      </div>
                    </td>
                    <td>
                      {hasPending ? (
                        <span className="badge-warning">HR Review Pending</span>
                      ) : log.correctionRequests?.length > 0 ? (
                        <span className="badge-applied">
                          History ({log.correctionRequests.length})
                        </span>
                      ) : (
                        <span className="text-muted">None</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline"
                        disabled={log.locked || hasPending}
                        onClick={() => openCorrectionModal(log)}
                      >
                        {hasPending ? "Pending" : "Request Correction"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Requesting Correction */}
      {selectedLog && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h4>Request Attendance Correction</h4>
              <button
                className="btn-close"
                onClick={() => setSelectedLog(null)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCorrectionSubmit} className="modal-form">
              {modalMsg && <div className="alert-box error">{modalMsg}</div>}

              <div className="form-info-banner">
                <strong>{selectedLog.employee?.fullName}</strong> —{" "}
                {new Date(selectedLog.date).toDateString()}
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Corrected Clock-In Time</label>
                  <input
                    type="time"
                    value={reqInTime}
                    onChange={(e) => setReqInTime(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Corrected Clock-Out Time</label>
                  <input
                    type="time"
                    value={reqOutTime}
                    onChange={(e) => setReqOutTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Attendance Status</label>
                <select
                  value={reqStatus}
                  onChange={(e) => setReqStatus(e.target.value)}
                >
                  <option value="Present">Present</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Absent">Absent</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>

              <div className="form-group">
                <label>Justification Reason (Max 500 chars)</label>
                <textarea
                  rows="3"
                  maxLength="500"
                  placeholder="Explain why this correction is required (e.g. badge scanner malfunction)..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedLog(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit to HR"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
