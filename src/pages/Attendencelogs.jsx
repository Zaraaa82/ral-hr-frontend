import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "../style/attendance.css";

const socket = io("http://localhost:5000");

function AttendanceLogs({ employeeId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const queryString = params.toString() ? `?${params.toString()}` : "";

      const response = await fetch(
        `http://localhost:5000/api/attendance/logs${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch logs");
      setLogs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [startDate, endDate]);

  useEffect(() => {
    socket.emit("join_attendance", employeeId);

    socket.on("attendance:clockedIn", ({ attendance: newRecord }) => {
      setLogs((prevLogs) => [
        newRecord,
        ...prevLogs.filter((log) => log._id !== newRecord._id),
      ]);
    });

    socket.on("attendance:clockedOut", ({ attendance: updatedRecord }) => {
      setLogs((prevLogs) =>
        prevLogs.map((log) =>
          log._id === updatedRecord._id ? updatedRecord : log,
        ),
      );
    });

    return () => {
      socket.off("attendance:clockedIn");
      socket.off("attendance:clockedOut");
    };
  }, [employeeId]);

  const handleClearFilter = () => {
    setStartDate("");
    setEndDate("");
  };

  const formatTime = (timeString) => {
    if (!timeString) return "--:--";
    return new Date(timeString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="endDate">To:</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {(startDate || endDate) && (
          <button className="clear-filter-btn" onClick={handleClearFilter}>
            Clear Filter
          </button>
        )}
      </div>

      {loading && <p className="loading">Loading logs...</p>}
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

                <div className="log-status">
                  <span className={`status-tag ${log.status?.toLowerCase()}`}>
                    {log.status}
                  </span>
                  {log.flags?.includes("late") && (
                    <span className="late-flag">Late</span>
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
