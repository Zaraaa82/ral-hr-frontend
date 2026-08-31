import React, { useState, useEffect } from "react";
import "../../styles/attendance/attendance.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function AttendancePunch({ onPunchSuccess }) {
  const [options, setOptions] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Live digital clock ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchOptions = async () => {
    try {
      setError("");
      const res = await fetch(`${API_BASE_URL}/attendance/options`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to load attendance options.");
      setOptions(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  const handlePunch = async (actionType) => {
    try {
      setLoading(true);
      setError("");
      setSuccessMsg("");

      const endpoint =
        actionType === "in" ? "/attendance/clock-in" : "/attendance/clock-out";
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || `Failed to clock ${actionType}.`);

      setSuccessMsg(data.message || `Successfully clocked ${actionType}!`);
      await fetchOptions();
      if (onPunchSuccess) onPunchSuccess(data.attendance);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateObj) => {
    return dateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="attendance-card punch-card">
      <div className="punch-header">
        <div>
          <h3>Daily Attendance Punch</h3>
          <p className="subtext">
            {options?.current?.dayType
              ? `Today: ${options.current.dayType}`
              : "Company Shift Tracker"}
          </p>
        </div>
        <div className="live-clock">{formatTime(currentTime)}</div>
      </div>

      {error && <div className="alert-box error">{error}</div>}
      {successMsg && <div className="alert-box success">{successMsg}</div>}

      {/* Current Attendance State */}
      <div className="punch-status-grid">
        <div className="status-pill-box">
          <span className="label">Clock In</span>
          <strong>
            {options?.attendance?.inTime
              ? new Date(options.attendance.inTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "--:--"}
          </strong>
        </div>
        <div className="status-pill-box">
          <span className="label">Clock Out</span>
          <strong>
            {options?.attendance?.outTime
              ? new Date(options.attendance.outTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "--:--"}
          </strong>
        </div>
        <div className="status-pill-box">
          <span className="label">Status</span>
          <span
            className={`status-badge ${(options?.attendance?.status || "Pending").toLowerCase().replace(" ", "-")}`}
          >
            {options?.attendance?.status || "Not Clocked"}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="punch-actions">
        <button
          className="btn btn-clock-in"
          disabled={loading || !options?.actions?.clockIn?.allowed}
          title={options?.actions?.clockIn?.reason || "Record your entry time"}
          onClick={() => handlePunch("in")}
        >
          {loading ? "Processing..." : "Clock In"}
        </button>

        <button
          className="btn btn-clock-out"
          disabled={loading || !options?.actions?.clockOut?.allowed}
          title={options?.actions?.clockOut?.reason || "Record your exit time"}
          onClick={() => handlePunch("out")}
        >
          {loading ? "Processing..." : "Clock Out"}
        </button>
      </div>

      {/* Disabling Reasons Tooltip */}
      {(!options?.actions?.clockIn?.allowed ||
        !options?.actions?.clockOut?.allowed) && (
        <div className="punch-hints">
          {!options?.actions?.clockIn?.allowed &&
            options?.actions?.clockIn?.reason && (
              <p>💡 {options.actions.clockIn.reason}</p>
            )}
          {!options?.actions?.clockOut?.allowed &&
            options?.actions?.clockOut?.reason && (
              <p>💡 {options.actions.clockOut.reason}</p>
            )}
        </div>
      )}
    </div>
  );
}
