import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Filter, Edit3, X, Send } from "lucide-react";
import "../../styles/attendance/EmployeeAttendanceHistory.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function EmployeeAttendanceHistory() {
  const [logs, setLogs] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // CORRECTION REQUEST MODAL
  // =====================================================

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [reqInTime, setReqInTime] = useState("");
  const [reqOutTime, setReqOutTime] = useState("");
  const [reqStatus, setReqStatus] = useState("Present");
  const [reqReason, setReqReason] = useState("");
  const [submittingCorrection, setSubmittingCorrection] = useState(false);
  const [correctionMsg, setCorrectionMsg] = useState("");

  // =====================================================
  // GET AUTH HEADERS
  // =====================================================

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // =====================================================
  // FETCH ATTENDANCE LOGS
  // =====================================================

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (startDate) {
        params.append("startDate", startDate);
      }

      if (endDate) {
        params.append("endDate", endDate);
      }

      const queryString = params.toString();

      const requestUrl = `${API_BASE_URL}/attendance/logs${
        queryString ? `?${queryString}` : ""
      }`;

      const res = await fetch(requestUrl, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      let data = {};

      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        throw new Error(
          data.message ||
            `Failed to fetch attendance history. Server returned ${res.status}.`,
        );
      }

      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch attendance logs:", err);

      setError(err.message || "Failed to fetch attendance history.");

      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // =====================================================
  // FORMAT HOURS
  // =====================================================

  const formatHours = (minutes) => {
    const numericMinutes = Number(minutes || 0);

    if (!Number.isFinite(numericMinutes) || numericMinutes <= 0) {
      return "0h 0m";
    }

    const h = Math.floor(numericMinutes / 60);
    const m = numericMinutes % 60;

    return `${h}h ${m}m`;
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (timeIso) => {
    if (!timeIso) {
      return "--:--";
    }

    const date = new Date(timeIso);

    if (Number.isNaN(date.getTime())) {
      return "--:--";
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =====================================================
  // OPEN CORRECTION MODAL
  // =====================================================

  const openCorrectionModal = (record) => {
    setSelectedRecord(record);

    setCorrectionMsg("");
    setReqReason("");

    setReqStatus(record.status || "Present");

    // ---------------------------------------------------
    // IN TIME
    // ---------------------------------------------------

    if (record.inTime) {
      const inDate = new Date(record.inTime);

      if (!Number.isNaN(inDate.getTime())) {
        setReqInTime(
          `${String(inDate.getHours()).padStart(2, "0")}:${String(
            inDate.getMinutes(),
          ).padStart(2, "0")}`,
        );
      } else {
        setReqInTime("08:00");
      }
    } else {
      setReqInTime("08:00");
    }

    // ---------------------------------------------------
    // OUT TIME
    // ---------------------------------------------------

    if (record.outTime) {
      const outDate = new Date(record.outTime);

      if (!Number.isNaN(outDate.getTime())) {
        setReqOutTime(
          `${String(outDate.getHours()).padStart(2, "0")}:${String(
            outDate.getMinutes(),
          ).padStart(2, "0")}`,
        );
      } else {
        setReqOutTime("17:00");
      }
    } else {
      setReqOutTime("17:00");
    }
  };

  // =====================================================
  // CLOSE CORRECTION MODAL
  // =====================================================

  const closeCorrectionModal = () => {
    if (submittingCorrection) {
      return;
    }

    setSelectedRecord(null);
    setReqInTime("");
    setReqOutTime("");
    setReqStatus("Present");
    setReqReason("");
    setCorrectionMsg("");
  };

  // =====================================================
  // SUBMIT CORRECTION REQUEST
  // =====================================================

  const handleCorrectionSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRecord) {
      return;
    }

    // ---------------------------------------------------
    // VALIDATE REASON
    // ---------------------------------------------------

    if (!reqReason.trim()) {
      setCorrectionMsg("Please provide a reason for the correction.");
      return;
    }

    // ---------------------------------------------------
    // VALIDATE TIMES
    // ---------------------------------------------------

    if (!reqInTime || !reqOutTime) {
      setCorrectionMsg(
        "Please provide both requested clock-in and clock-out times.",
      );
      return;
    }

    try {
      setSubmittingCorrection(true);
      setCorrectionMsg("");

      // -------------------------------------------------
      // RECORD DATE
      // -------------------------------------------------

      const recordDate = new Date(selectedRecord.date);

      if (Number.isNaN(recordDate.getTime())) {
        throw new Error("Invalid attendance record date.");
      }

      // -------------------------------------------------
      // PARSE TIMES
      // -------------------------------------------------

      const [inH, inM] = reqInTime.split(":").map(Number);
      const [outH, outM] = reqOutTime.split(":").map(Number);

      if (
        !Number.isInteger(inH) ||
        !Number.isInteger(inM) ||
        !Number.isInteger(outH) ||
        !Number.isInteger(outM)
      ) {
        throw new Error("Invalid requested attendance time.");
      }

      // -------------------------------------------------
      // CREATE REQUESTED IN TIME
      // -------------------------------------------------

      const requestedInTime = new Date(recordDate);

      requestedInTime.setHours(inH, inM, 0, 0);

      // -------------------------------------------------
      // CREATE REQUESTED OUT TIME
      // -------------------------------------------------

      const requestedOutTime = new Date(recordDate);

      requestedOutTime.setHours(outH, outM, 0, 0);

      // -------------------------------------------------
      // PAYLOAD
      // -------------------------------------------------

      const payload = {
        requestedInTime: requestedInTime.toISOString(),
        requestedOutTime: requestedOutTime.toISOString(),
        requestedStatus: reqStatus,
        reason: reqReason.trim(),
      };

      // -------------------------------------------------
      // API REQUEST
      // -------------------------------------------------

      const res = await fetch(
        `${API_BASE_URL}/attendance/${selectedRecord._id}/correction`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        },
      );

      let data = {};

      try {
        data = await res.json();
      } catch {
        data = {};
      }

      // -------------------------------------------------
      // ERROR HANDLING
      // -------------------------------------------------

      if (!res.ok) {
        throw new Error(
          data.message ||
            `Failed to submit correction request. Server returned ${res.status}.`,
        );
      }

      // -------------------------------------------------
      // SUCCESS
      // -------------------------------------------------

      setCorrectionMsg("Correction request submitted for HR review!");

      // Refresh attendance records
      await fetchLogs();

      // Close modal after short delay
      setTimeout(() => {
        setSelectedRecord(null);
        setReqInTime("");
        setReqOutTime("");
        setReqStatus("Present");
        setReqReason("");
        setCorrectionMsg("");
      }, 1200);
    } catch (err) {
      console.error("Correction request error:", err);

      setCorrectionMsg(err.message || "Error submitting correction request.");
    } finally {
      setSubmittingCorrection(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="att-history-container">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="att-history-header">
        <div>
          <h3 className="att-history-title">
            <Calendar className="att-title-icon" />

            <span>My Attendance History</span>
          </h3>

          <p className="att-history-subtitle">
            View your daily worked hours, overtime, and submit punch corrections
          </p>
        </div>

        {/* =================================================
            DATE FILTER BAR
        ================================================= */}

        <div className="att-filter-bar">
          {/* FROM */}

          <div className="att-filter-input-group">
            <span className="att-filter-label">From:</span>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="att-date-input"
            />
          </div>

          {/* TO */}

          <div className="att-filter-input-group">
            <span className="att-filter-label">To:</span>

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="att-date-input"
            />
          </div>

          {/* FILTER */}

          <button
            type="button"
            onClick={fetchLogs}
            disabled={loading}
            className="att-btn-filter"
          >
            <Filter
              style={{
                width: 14,
                height: 14,
              }}
            />

            <span>{loading ? "Filtering..." : "Filter"}</span>
          </button>
        </div>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && <div className="att-alert-error">{error}</div>}

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="att-table-wrapper">
        <table className="att-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Clock In</th>
              <th>Clock Out</th>
              <th>Worked</th>
              <th>Overtime</th>
              <th>Status</th>
              <th>Exceptions / Flags</th>
              <th className="att-text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (
              <tr>
                <td colSpan="8" className="att-cell-loading">
                  <div className="att-spinner" />
                  Loading records...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              /* =================================================
                  EMPTY
              ================================================= */

              <tr>
                <td colSpan="8" className="att-cell-empty">
                  No attendance logs found for the selected period.
                </td>
              </tr>
            ) : (
              /* =================================================
                  RECORDS
              ================================================= */

              logs.map((log) => {
                const hasPendingCorrection =
                  Array.isArray(log.correctionRequests) &&
                  log.correctionRequests.some(
                    (request) => request.status === "pending",
                  );

                return (
                  <tr key={log._id}>
                    {/* DATE */}

                    <td className="att-cell-bold">
                      {new Date(log.date).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* CLOCK IN */}

                    <td className="att-cell-mono">{formatTime(log.inTime)}</td>

                    {/* CLOCK OUT */}

                    <td className="att-cell-mono">{formatTime(log.outTime)}</td>

                    {/* WORKED */}

                    <td className="att-cell-mono att-text-dark">
                      {formatHours(log.workedMinutes)}
                    </td>

                    {/* OVERTIME */}

                    <td className="att-cell-mono">
                      {Number(log.overtimeMinutes || 0) > 0 ? (
                        <span className="att-badge-overtime">
                          +{formatHours(log.overtimeMinutes)}
                        </span>
                      ) : (
                        "--"
                      )}
                    </td>

                    {/* STATUS */}

                    <td>
                      <span
                        className={`att-badge-status ${
                          log.status === "Present"
                            ? "status-present"
                            : log.status === "Absent"
                              ? "status-absent"
                              : log.status === "On Leave"
                                ? "status-leave"
                                : "status-default"
                        }`}
                      >
                        {log.status || "Unknown"}
                      </span>
                    </td>

                    {/* FLAGS */}

                    <td>
                      <div className="att-flags-group">
                        {Array.isArray(log.flags) && log.flags.length > 0
                          ? log.flags.map((flag) => (
                              <span
                                key={flag}
                                className={`att-badge-flag ${
                                  flag === "late"
                                    ? "flag-late"
                                    : flag === "missingTimeOut"
                                      ? "flag-missing"
                                      : "flag-default"
                                }`}
                              >
                                {flag}
                              </span>
                            ))
                          : "--"}
                      </div>
                    </td>

                    {/* ACTIONS */}

                    <td className="att-text-right">
                      {hasPendingCorrection ? (
                        <span className="att-badge-pending">
                          Correction Pending
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openCorrectionModal(log)}
                          className="att-btn-correct"
                        >
                          <Edit3
                            style={{
                              width: 14,
                              height: 14,
                            }}
                          />

                          <span>Correct</span>
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

      {/* =================================================
          CORRECTION REQUEST MODAL
      ================================================= */}

      {selectedRecord && (
        <div className="att-modal-overlay">
          <div className="att-modal-card">
            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="att-modal-header">
              <h3>Request Attendance Correction</h3>

              <button
                type="button"
                onClick={closeCorrectionModal}
                disabled={submittingCorrection}
                className="att-modal-close"
              >
                <X
                  style={{
                    width: 20,
                    height: 20,
                  }}
                />
              </button>
            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <form onSubmit={handleCorrectionSubmit} className="att-modal-form">
              {/* =================================================
                  RECORD SUMMARY
              ================================================= */}

              <div className="att-summary-box">
                <div>
                  <strong>Record Date:</strong>{" "}
                  {new Date(selectedRecord.date).toLocaleDateString()}
                </div>

                <div>
                  <strong>Original Punch:</strong> In:{" "}
                  {formatTime(selectedRecord.inTime)} | Out:{" "}
                  {formatTime(selectedRecord.outTime)}
                </div>
              </div>

              {/* =================================================
                  MESSAGE
              ================================================= */}

              {correctionMsg && (
                <div
                  className={`att-banner-msg ${
                    correctionMsg.includes("submitted")
                      ? "banner-success"
                      : "banner-error"
                  }`}
                >
                  {correctionMsg}
                </div>
              )}

              {/* =================================================
                  TIME FIELDS
              ================================================= */}

              <div className="att-form-grid">
                {/* IN */}

                <div>
                  <label className="att-form-label">Requested In Time:</label>

                  <input
                    type="time"
                    value={reqInTime}
                    onChange={(e) => setReqInTime(e.target.value)}
                    className="att-input att-input-mono"
                    required
                  />
                </div>

                {/* OUT */}

                <div>
                  <label className="att-form-label">Requested Out Time:</label>

                  <input
                    type="time"
                    value={reqOutTime}
                    onChange={(e) => setReqOutTime(e.target.value)}
                    className="att-input att-input-mono"
                    required
                  />
                </div>
              </div>

              {/* =================================================
                  STATUS
              ================================================= */}

              <div>
                <label className="att-form-label">Requested Status:</label>

                <select
                  value={reqStatus}
                  onChange={(e) => setReqStatus(e.target.value)}
                  className="att-input"
                >
                  <option value="Present">Present</option>

                  <option value="Half Day">Half Day</option>

                  <option value="On Leave">On Leave</option>
                </select>
              </div>

              {/* =================================================
                  REASON
              ================================================= */}

              <div>
                <label className="att-form-label">Reason for Adjustment:</label>

                <textarea
                  rows={3}
                  value={reqReason}
                  onChange={(e) => setReqReason(e.target.value)}
                  placeholder="e.g. Card scanner was offline upon arrival..."
                  className="att-input att-textarea"
                  required
                />
              </div>

              {/* =================================================
                  FOOTER
              ================================================= */}

              <div className="att-modal-footer">
                {/* CANCEL */}

                <button
                  type="button"
                  onClick={closeCorrectionModal}
                  disabled={submittingCorrection}
                  className="att-btn-cancel"
                >
                  Cancel
                </button>

                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={submittingCorrection}
                  className="att-btn-submit"
                >
                  <Send
                    style={{
                      width: 14,
                      height: 14,
                    }}
                  />

                  <span>
                    {submittingCorrection ? "Submitting..." : "Send Request"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
