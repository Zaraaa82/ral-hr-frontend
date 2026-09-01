import React, { useState, useEffect } from "react";
import { Users, Edit3, X, Send, Lock } from "lucide-react";
import api from "../../services/api";
import "../../styles/attendance/ManagerTeamAttendance.css";

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

      const res = await api.get(
        `/attendance/team/calendar?year=${selectedYear}&month=${selectedMonth}`,
      );

      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch team attendance.",
      );
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
      log.outTime ? new Date(log.outTime).toISOString().slice(11, 16) : "17:00",
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

      const baseDate = new Date(selectedLog.date).toISOString().slice(0, 10);
      const isoIn = reqInTime ? `${baseDate}T${reqInTime}:00.000Z` : null;
      const isoOut = reqOutTime ? `${baseDate}T${reqOutTime}:00.000Z` : null;

      await api.post(`/attendance/${selectedLog._id}/correction-requests`, {
        requestedInTime: isoIn,
        requestedOutTime: isoOut,
        requestedStatus: reqStatus,
        reason,
      });

      setSelectedLog(null);
      fetchTeamLogs();
    } catch (err) {
      setModalMsg(
        err.response?.data?.message ||
          err.message ||
          "Failed to submit correction request.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (timeIso) => {
    if (!timeIso) return "--:--";
    return new Date(timeIso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Present":
        return "badge-present";
      case "Absent":
        return "badge-absent";
      case "On Leave":
        return "badge-leave";
      default:
        return "badge-default";
    }
  };

  return (
    <div className="attendance-card">
      {/* Header & Controls */}
      <div className="attendance-header">
        <div>
          <h3 className="attendance-title">
            <Users className="title-icon" />
            <span>Team Attendance & Correction Requests</span>
          </h3>
          <p className="attendance-subtitle">
            Review direct reports and request time adjustments for HR approval
          </p>
        </div>

        {/* Month & Year Selectors */}
        <div className="controls-group">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="select-input"
          >
            {MONTH_NAMES.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="year-input"
          />
        </div>
      </div>

      {error && <div className="error-alert">{error}</div>}

      {/* Table */}
      <div className="table-container">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Date</th>
              <th>In / Out Time</th>
              <th>Status</th>
              <th>Exceptions</th>
              <th>Correction Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="7"
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  <div className="spinner" />
                  <span className="text-muted">Loading team logs...</span>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  <span className="text-muted">
                    No attendance logs found for this period.
                  </span>
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
                      <strong className="employee-name">
                        {log.employee?.fullName || "Employee"}
                      </strong>
                      <span className="employee-code">
                        {log.employee?.employeeCode}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: "#1e293b" }}>
                      {new Date(log.date).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="font-mono">
                      {formatTime(log.inTime)} — {formatTime(log.outTime)}
                    </td>
                    <td>
                      <span
                        className={`badge ${getStatusBadgeClass(log.status)}`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td>
                      <div className="flag-group">
                        {log.flags?.map((flag) => (
                          <span
                            key={flag}
                            className={`flag-badge ${
                              flag === "late"
                                ? "flag-late"
                                : flag === "missingTimeOut"
                                  ? "flag-missing"
                                  : "flag-default"
                            }`}
                          >
                            {flag}
                          </span>
                        ))}
                        {(!log.flags || log.flags.length === 0) && (
                          <span className="text-muted">None</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {hasPending ? (
                        <span className="badge status-pending">
                          HR Review Pending
                        </span>
                      ) : log.correctionRequests?.length > 0 ? (
                        <span className="badge status-history">
                          History ({log.correctionRequests.length})
                        </span>
                      ) : (
                        <span className="text-muted">None</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {log.locked ? (
                        <span className="action-locked">
                          <Lock
                            style={{ width: "0.875rem", height: "0.875rem" }}
                          />
                          <span>Locked</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={hasPending}
                          onClick={() => openCorrectionModal(log)}
                          className="btn-action"
                        >
                          <Edit3
                            style={{ width: "0.875rem", height: "0.875rem" }}
                          />
                          <span>
                            {hasPending ? "Pending" : "Request Correction"}
                          </span>
                        </button>
                      )}
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
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Request Attendance Correction</h4>
              <button
                type="button"
                className="btn-close"
                onClick={() => setSelectedLog(null)}
              >
                <X style={{ width: "1.25rem", height: "1.25rem" }} />
              </button>
            </div>

            <form onSubmit={handleCorrectionSubmit} className="modal-form">
              {modalMsg && <div className="error-alert">{modalMsg}</div>}

              <div className="employee-summary">
                <div className="name">{selectedLog.employee?.fullName}</div>
                <div className="shift-date">
                  Shift Date: {new Date(selectedLog.date).toDateString()}
                </div>
              </div>

              <div className="grid-2col">
                <div>
                  <label className="form-label">Corrected Clock-In Time</label>
                  <input
                    type="time"
                    value={reqInTime}
                    onChange={(e) => setReqInTime(e.target.value)}
                    className="form-input font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Corrected Clock-Out Time</label>
                  <input
                    type="time"
                    value={reqOutTime}
                    onChange={(e) => setReqOutTime(e.target.value)}
                    className="form-input font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Attendance Status</label>
                <select
                  value={reqStatus}
                  onChange={(e) => setReqStatus(e.target.value)}
                  className="form-select"
                >
                  <option value="Present">Present</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Absent">Absent</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>

              <div>
                <label className="form-label">
                  Justification Reason (Max 500 chars)
                </label>
                <textarea
                  rows="3"
                  maxLength="500"
                  placeholder="Explain why this correction is required (e.g. badge scanner malfunction)..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="form-textarea"
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setSelectedLog(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={submitting}
                >
                  <Send style={{ width: "0.875rem", height: "0.875rem" }} />
                  <span>{submitting ? "Submitting..." : "Submit to HR"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
