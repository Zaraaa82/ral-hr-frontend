import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "../styles/attendance.css";

const socket = io("http://localhost:5000");

function AttendanceLogs({ employeeId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  async function fetchLogs() {
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

      if (employeeId) {
        params.append("employeeId", employeeId);
      }

      const queryString = params.toString() ? `?${params.toString()}` : "";

      const response = await fetch(
        `http://localhost:5000/attendance/logs${queryString}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch attendance logs.");
      }

      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchLogs:", err);

      setError(err.message || "Failed to fetch attendance logs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
  }, [employeeId, startDate, endDate]);

  // SOCKET.IO

  useEffect(() => {
    function handleClockedIn({ attendance: newRecord }) {
      if (!newRecord) {
        return;
      }

      // If employeeId is provided,
      // only accept that employee's record.
      if (
        employeeId &&
        newRecord.employee?._id?.toString() !== employeeId.toString()
      ) {
        return;
      }

      setLogs((previousLogs) => {
        return [
          newRecord,
          ...previousLogs.filter((log) => log._id !== newRecord._id),
        ];
      });
    }

    function handleClockedOut({ attendance: updatedRecord }) {
      if (!updatedRecord) {
        return;
      }

      if (
        employeeId &&
        updatedRecord.employee?._id?.toString() !== employeeId.toString()
      ) {
        return;
      }

      setLogs((previousLogs) => {
        const exists = previousLogs.some(
          (log) => log._id === updatedRecord._id,
        );

        if (!exists) {
          return [updatedRecord, ...previousLogs];
        }

        return previousLogs.map((log) =>
          log._id === updatedRecord._id ? updatedRecord : log,
        );
      });
    }

    socket.on("attendance:clockedIn", handleClockedIn);

    socket.on("attendance:clockedOut", handleClockedOut);

    return () => {
      socket.off("attendance:clockedIn", handleClockedIn);

      socket.off("attendance:clockedOut", handleClockedOut);
    };
  }, [employeeId]);

  function handleClearFilter() {
    setStartDate("");
    setEndDate("");
  }

  // FORMAT TIME

  function formatTime(timeString) {
    if (!timeString) {
      return "--:--";
    }

    const date = new Date(timeString);

    if (Number.isNaN(date.getTime())) {
      return "--:--";
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // FORMAT DATE

  function formatDate(dateString) {
    if (!dateString) {
      return "--";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "--";
    }

    return date.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // FORMAT MINUTES

  function formatMinutes(minutes) {
    if (
      minutes === undefined ||
      minutes === null ||
      Number.isNaN(Number(minutes))
    ) {
      return "0h 0m";
    }

    const totalMinutes = Math.max(0, Number(minutes));

    const hours = Math.floor(totalMinutes / 60);

    const remainingMinutes = totalMinutes % 60;

    return `${hours}h ${remainingMinutes}m`;
  }

  // STATUS CLASS

  function getStatusClass(status) {
    if (!status) {
      return "";
    }

    return status.toLowerCase().replace(/\s+/g, "-");
  }

  return (
    <div className="attendance-logs">
      <h3>Attendance History</h3>

      <div className="filter-controls">
        <div className="filter-group">
          <label htmlFor="startDate">From:</label>

          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="endDate">To:</label>

          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>

        {(startDate || endDate) && (
          <button
            type="button"
            className="clear-filter-btn"
            onClick={handleClearFilter}
          >
            Clear Filter
          </button>
        )}
      </div>

      {loading && <p className="loading">Loading attendance logs...</p>}

      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <ul className="logs-list">
          {logs.length === 0 ? (
            <li className="no-logs">No attendance records found.</li>
          ) : (
            logs.map((log) => (
              <li key={log._id} className="log-item">
                <div className="log-date">
                  <strong>{formatDate(log.date)}</strong>
                </div>

                <div className="log-times">
                  <span>In: {formatTime(log.inTime)}</span>

                  <span>Out: {formatTime(log.outTime)}</span>
                </div>

                <div className="log-duration">
                  <span>Worked: {formatMinutes(log.workedMinutes)}</span>

                  {Number(log.overtimeMinutes) > 0 && (
                    <span className="overtime-text">
                      OT: {formatMinutes(log.overtimeMinutes)}
                    </span>
                  )}
                </div>

                <div className="log-status">
                  <span className={`status-tag ${getStatusClass(log.status)}`}>
                    {log.status || "Unknown"}
                  </span>

                  {log.flags?.includes("late") && (
                    <span className="late-flag">Late</span>
                  )}

                  {log.flags?.includes("missingTimeOut") && (
                    <span className="missing-timeout-flag">
                      Missing Checkout
                    </span>
                  )}

                  {log.overtimeApproved && (
                    <span className="overtime-approved">OT Approved</span>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default AttendanceLogs;
