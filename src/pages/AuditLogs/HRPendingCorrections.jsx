import React, { useState, useEffect } from "react";
import "../../styles/attendance/attendance.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function HRPendingCorrections() {
  const [records, setRecords] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionNote, setActionNote] = useState("");
  const [selectedReq, setSelectedReq] = useState(null);
  const [actionType, setActionType] = useState(null); // 'apply' | 'reject'
  const [processing, setProcessing] = useState(false);

  const fetchPending = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${API_BASE_URL}/attendance/correction-requests/pending`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to load pending corrections.");
      setRecords(data.attendanceRecords || []);
      setCount(data.count || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const openActionModal = (attendance, reqItem, type) => {
    setSelectedReq({ attendance, reqItem });
    setActionType(type);
    setActionNote("");
  };

  const handleActionSubmit = async () => {
    if (actionType === "reject" && !actionNote.trim()) {
      alert("A rejection reason is required.");
      return;
    }

    try {
      setProcessing(true);
      const { attendance, reqItem } = selectedReq;
      const endpoint = `${API_BASE_URL}/attendance/${attendance._id}/correction-requests/${reqItem._id}/${actionType}`;

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ actionNote: actionNote.trim() }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || `Failed to ${actionType} correction.`);

      alert(`Correction request successfully ${actionType}ed!`);
      setSelectedReq(null);
      fetchPending();
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="attendance-card">
      <div className="card-header-bar">
        <div>
          <h3>Pending Correction Approvals ({count})</h3>
          <p className="subtext">
            Review manager-submitted attendance adjustments before final payroll
            lock
          </p>
        </div>
        <button className="btn btn-secondary" onClick={fetchPending}>
          Refresh
        </button>
      </div>

      {error && <div className="alert-box error">{error}</div>}

      <div className="table-responsive">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Date</th>
              <th>Current In/Out</th>
              <th>Requested In/Out</th>
              <th>Reason</th>
              <th>Manager</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  Loading pending queue...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4 text-muted">
                  No pending corrections waiting for HR review.
                </td>
              </tr>
            ) : (
              records.map((rec) =>
                rec.correctionRequests.map((reqItem) => (
                  <tr key={reqItem._id}>
                    <td>
                      <strong>{rec.employee?.fullName}</strong>
                      <span className="code-subtext">
                        {rec.employee?.employeeCode}
                      </span>
                    </td>
                    <td>
                      {new Date(rec.date).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      {rec.inTime
                        ? new Date(rec.inTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "--:--"}
                      {" - "}
                      {rec.outTime
                        ? new Date(rec.outTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "--:--"}
                    </td>
                    <td className="text-primary font-semibold">
                      {reqItem.requestedInTime
                        ? new Date(reqItem.requestedInTime).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" },
                          )
                        : "--:--"}
                      {" - "}
                      {reqItem.requestedOutTime
                        ? new Date(reqItem.requestedOutTime).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" },
                          )
                        : "--:--"}
                    </td>
                    <td>
                      <p className="reason-text">"{reqItem.reason}"</p>
                    </td>
                    <td>{reqItem.requestedBy?.fullName || "Manager"}</td>
                    <td>
                      <div className="btn-group-row">
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => openActionModal(rec, reqItem, "apply")}
                        >
                          Apply
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() =>
                            openActionModal(rec, reqItem, "reject")
                          }
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                )),
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {selectedReq && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h4>
                {actionType === "apply"
                  ? "Apply Correction"
                  : "Reject Correction Request"}
              </h4>
              <button
                className="btn-close"
                onClick={() => setSelectedReq(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-form">
              <p>
                Are you sure you want to <strong>{actionType}</strong> the
                correction for{" "}
                <strong>{selectedReq.attendance.employee?.fullName}</strong>?
              </p>

              <div className="form-group">
                <label>
                  HR Note / Reason {actionType === "reject" && "(Required)"}
                </label>
                <textarea
                  rows="3"
                  placeholder={
                    actionType === "reject"
                      ? "Reason for rejection..."
                      : "Optional approval note..."
                  }
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                ></textarea>
              </div>

              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedReq(null)}
                >
                  Cancel
                </button>
                <button
                  className={`btn ${actionType === "apply" ? "btn-success" : "btn-danger"}`}
                  disabled={processing}
                  onClick={handleActionSubmit}
                >
                  {processing ? "Processing..." : `Confirm ${actionType}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
