import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "../style/attendance.css";

const socket = io("http://localhost:5000");

function AttendanceControl({ employeeId }) {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    socket.emit("join_attendance", employeeId);

    socket.on("attendance:clockedIn", ({ attendance: updatedRecord }) => {
      setAttendance(updatedRecord);
    });

    socket.on("attendance:clockedOut", ({ attendance: updatedRecord }) => {
      setAttendance(updatedRecord);
    });

    return () => {
      socket.off("attendance:clockedIn");
      socket.off("attendance:clockedOut");
    };
  }, [employeeId]);

  const handleClockIn = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(
        "http://localhost:5000/attendance/clock-in",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setAttendance(data.attendance);
      setMessage("Clocked in successfully!");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(
        "http://localhost:5000/attendance/clock-out",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setAttendance(data.attendance);
      setMessage("Clocked out successfully!");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isClockedIn = Boolean(attendance?.inTime);
  const isClockedOut = Boolean(attendance?.outTime);

  return (
    <div className="attendance-card">
      <h3>Daily Attendance</h3>

      {message && <p className="status-message">{message}</p>}

      <div className="attendance-details">
        <p>
          Status: <strong>{attendance?.status || "Not Clocked In"}</strong>
        </p>
        {attendance?.flags?.includes("late") && (
          <span className="late-flag">Late</span>
        )}
      </div>

      <div className="action-buttons">
        <button
          onClick={handleClockIn}
          disabled={loading || isClockedIn || attendance?.locked}
        >
          {isClockedIn ? "Clocked In" : "Clock In"}
        </button>

        <button
          onClick={handleClockOut}
          disabled={
            loading || !isClockedIn || isClockedOut || attendance?.locked
          }
        >
          {isClockedOut ? "Clocked Out" : "Clock Out"}
        </button>
      </div>
    </div>
  );
}

export default AttendanceControl;
