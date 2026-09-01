import React, { useState, useEffect } from "react";
import {
  Clock,
  LogIn,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Info,
  Loader2,
} from "lucide-react";
import "../../styles/attendance/AttendancePunch.css";

const API_BASE_URL = import.meta.env.VITE_BACK_END_SERVER_URL;

export default function AttendancePunch({ onPunchSuccess }) {
  const [options, setOptions] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchOptions = async () => {
    try {
      setError("");
      const res = await fetch(`${API_BASE_URL}/attendance/options`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to load attendance options.");
      setOptions(data);
    } catch (err) {
      console.error("fetchOptions error:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  const handlePunch = async (actionType) => {
    try {
      setLoading(true);
      setActiveAction(actionType);
      setError("");
      setSuccessMsg("");

      const endpoint =
        actionType === "in" ? "/attendance/clock-in" : "/attendance/clock-out";
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
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
      setActiveAction(null);
    }
  };

  const formatClock = (dateObj) => {
    return dateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatShortTime = (timeIso) => {
    if (!timeIso) return "--:--";
    return new Date(timeIso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isClockInAllowed = Boolean(options?.actions?.clockIn?.allowed);
  const isClockOutAllowed = Boolean(options?.actions?.clockOut?.allowed);

  const getStatusClass = (hasIn, hasOut) => {
    if (hasOut) return "status-completed";
    if (hasIn) return "status-active";
    return "status-pending";
  };

  return (
    <div className="punch-terminal-wrapper">
      <div className="punch-terminal-card">
        {/* Header & Live Ticker */}
        <div className="punch-header">
          <div>
            <div className="punch-header-title-group">
              <span className="punch-live-dot-container">
                <span className="punch-live-dot-ping" />
                <span className="punch-live-dot" />
              </span>
              <h3 className="punch-title">Attendance Terminal</h3>
            </div>
            <p className="punch-subtitle">
              {options?.current?.dayType
                ? `Shift: ${options.current.dayType}`
                : "Standard Shift (08:00 - 17:00 • 1h Break)"}
            </p>
          </div>

          <div className="punch-clock-badge">
            <Clock className="punch-clock-icon" />
            <div>
              <span className="punch-clock-time">
                {formatClock(currentTime)}
              </span>
              <span className="punch-clock-tz">Asia/Bahrain</span>
            </div>
          </div>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="punch-banner punch-banner-error">
            <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="punch-banner punch-banner-success">
            <CheckCircle2 style={{ width: 16, height: 16, flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Attendance Metrics Grid */}
        <div className="punch-metrics-grid">
          <div className="punch-metric-card">
            <span className="punch-metric-label">Clock In</span>
            <div className="punch-metric-value">
              {formatShortTime(options?.attendance?.inTime)}
            </div>
          </div>

          <div className="punch-metric-card">
            <span className="punch-metric-label">Clock Out</span>
            <div className="punch-metric-value">
              {formatShortTime(options?.attendance?.outTime)}
            </div>
          </div>

          <div className="punch-metric-card">
            <span className="punch-metric-label">Current Status</span>
            <div>
              <span
                className={`punch-status-badge ${getStatusClass(
                  options?.attendance?.inTime,
                  options?.attendance?.outTime,
                )}`}
              >
                {options?.attendance?.status || "Not Clocked"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="punch-actions-grid">
          <button
            type="button"
            disabled={loading || !isClockInAllowed}
            onClick={() => handlePunch("in")}
            className={`punch-btn ${
              isClockInAllowed && !loading
                ? "punch-btn-in-active"
                : "punch-btn-disabled"
            }`}
            title={
              options?.actions?.clockIn?.reason || "Record your entry time"
            }
          >
            {loading && activeAction === "in" ? (
              <Loader2
                className="punch-spinner"
                style={{ width: 16, height: 16 }}
              />
            ) : (
              <LogIn style={{ width: 16, height: 16 }} />
            )}
            <span>
              {loading && activeAction === "in" ? "Clocking In..." : "Clock In"}
            </span>
          </button>

          <button
            type="button"
            disabled={loading || !isClockOutAllowed}
            onClick={() => handlePunch("out")}
            className={`punch-btn ${
              isClockOutAllowed && !loading
                ? "punch-btn-out-active"
                : "punch-btn-disabled"
            }`}
            title={
              options?.actions?.clockOut?.reason || "Record your exit time"
            }
          >
            {loading && activeAction === "out" ? (
              <Loader2
                className="punch-spinner"
                style={{ width: 16, height: 16 }}
              />
            ) : (
              <LogOut style={{ width: 16, height: 16 }} />
            )}
            <span>
              {loading && activeAction === "out"
                ? "Clocking Out..."
                : "Clock Out"}
            </span>
          </button>
        </div>

        {/* Policy Guidelines */}
        {(!isClockInAllowed || !isClockOutAllowed) && (
          <div className="punch-guidelines">
            <div className="punch-guidelines-header">
              <Info style={{ width: 14, height: 14, color: "#4f46e5" }} />
              <span>Policy Guidelines</span>
            </div>
            <div className="punch-guidelines-list">
              {!isClockInAllowed && options?.actions?.clockIn?.reason && (
                <p>• Clock In: {options.actions.clockIn.reason}</p>
              )}
              {!isClockOutAllowed && options?.actions?.clockOut?.reason && (
                <p>• Clock Out: {options.actions.clockOut.reason}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
