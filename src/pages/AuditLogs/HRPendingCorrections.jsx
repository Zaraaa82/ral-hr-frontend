import React, { useState, useEffect, useMemo } from "react";
import {
  CheckSquare,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  AlertCircle,
  X,
  Send,
  CheckCheck,
  Building2,
  Calendar,
  FileText,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_BACK_END_SERVER_URL || "http://localhost:3000";

export default function HRPendingCorrections() {
  const [records, setRecords] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionNote, setActionNote] = useState("");
  const [selectedReq, setSelectedReq] = useState(null);
  const [actionType, setActionType] = useState(null); // 'apply' | 'reject'
  const [processing, setProcessing] = useState(false);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || "";
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchPending = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${API_BASE_URL}/attendance/correction-requests/pending`,
        {
          headers: getAuthHeaders(),
        },
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to load pending corrections.");

      setRecords(data.attendanceRecords || []);
      setCount(data.count || 0);
    } catch (err) {
      setError(err.message || "Error fetching pending queue.");
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
    setFeedbackMsg("");
  };

  const handleActionSubmit = async () => {
    if (actionType === "reject" && !actionNote.trim()) {
      setFeedbackMsg("A rejection reason is required for compliance.");
      return;
    }

    try {
      setProcessing(true);
      const { attendance, reqItem } = selectedReq;
      const endpoint = `${API_BASE_URL}/attendance/${attendance._id}/correction-requests/${reqItem._id}/${actionType}`;

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ actionNote: actionNote.trim() }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || `Failed to ${actionType} correction.`);

      setSelectedReq(null);
      await fetchPending();
    } catch (err) {
      setFeedbackMsg(err.message || "Action processing failed.");
    } finally {
      setProcessing(false);
    }
  };

  // Bulk Approve All Pending
  const handleApproveAll = async () => {
    if (count === 0) return;

    if (
      !window.confirm(
        `Approve all ${count} pending attendance corrections submitted by managers?`,
      )
    ) {
      return;
    }

    try {
      setBatchProcessing(true);

      for (const rec of records) {
        const pendingItems =
          rec.correctionRequests?.filter((r) => r.status === "pending") || [];

        for (const reqItem of pendingItems) {
          await fetch(
            `${API_BASE_URL}/attendance/${rec._id}/correction-requests/${reqItem._id}/apply`,
            {
              method: "PATCH",
              headers: getAuthHeaders(),
              body: JSON.stringify({
                actionNote: "Bulk approved by HR Admin",
              }),
            },
          );
        }
      }

      await fetchPending();
    } catch (err) {
      alert("Bulk approval error: " + err.message);
    } finally {
      setBatchProcessing(false);
    }
  };

  const formatTime = (timeIso) => {
    if (!timeIso) return "--:--";
    const d = new Date(timeIso);
    if (Number.isNaN(d.getTime())) {
      return timeIso; // If already a string like "08:30"
    }
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 mb-2">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>HR Authorization Queue</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Pending Attendance Corrections</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
              {count}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Review and approve manager-submitted attendance adjustments before
            monthly payroll calculation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
          {count > 0 && (
            <button
              type="button"
              onClick={handleApproveAll}
              disabled={batchProcessing || loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>
                {batchProcessing ? "Approving..." : `Approve All (${count})`}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={fetchPending}
            disabled={loading}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
            <span>{loading ? "Refreshing..." : "Refresh Queue"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Corrections Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-700 font-bold uppercase text-[10px]">
            <tr>
              <th className="px-5 py-3.5">Employee</th>
              <th className="px-5 py-3.5">Shift Date</th>
              <th className="px-5 py-3.5">Recorded Punch</th>
              <th className="px-5 py-3.5">Requested Override</th>
              <th className="px-5 py-3.5">Manager Justification</th>
              <th className="px-5 py-3.5">Submitted By</th>
              <th className="px-5 py-3.5 text-right">HR Decision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-10 text-slate-400">
                  <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Loading pending correction queue...
                </td>
              </tr>
            ) : count === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-10 text-slate-400 font-medium"
                >
                  🎉 All attendance records verified. No pending corrections
                  waiting for HR review.
                </td>
              </tr>
            ) : (
              records.map((rec) =>
                rec.correctionRequests
                  ?.filter((r) => r.status === "pending")
                  .map((reqItem) => (
                    <tr
                      key={reqItem._id}
                      className="hover:bg-slate-50/70 transition"
                    >
                      <td className="px-5 py-4">
                        <strong className="text-slate-900 block font-semibold">
                          {rec.employee?.fullName || "Employee"}
                        </strong>
                        <span className="text-[11px] font-mono text-slate-400">
                          {rec.employee?.employeeCode}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {new Date(rec.date).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-4 font-mono text-slate-500">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">
                            In / Out
                          </span>
                          {formatTime(rec.inTime)} — {formatTime(rec.outTime)}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-purple-700">
                        <div>
                          <span className="text-[10px] text-purple-400 block uppercase font-sans">
                            New Times
                          </span>
                          {formatTime(reqItem.requestedInTime)} —{" "}
                          {formatTime(reqItem.requestedOutTime)}
                        </div>
                        {reqItem.requestedStatus && (
                          <span className="inline-block mt-0.5 px-2 py-0.2 rounded-md text-[10px] uppercase font-sans bg-purple-50 text-purple-700 border border-purple-200">
                            Status: {reqItem.requestedStatus}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 max-w-[200px]">
                        <p
                          className="text-slate-700 italic truncate"
                          title={reqItem.reason}
                        >
                          "{reqItem.reason}"
                        </p>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {reqItem.requestedBy?.fullName || "Manager"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              openActionModal(rec, reqItem, "apply")
                            }
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Apply</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              openActionModal(rec, reqItem, "reject")
                            }
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition border border-rose-200 cursor-pointer flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
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

      {/* Confirmation & Audit Modal */}
      {selectedReq && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedReq(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-base">
                {actionType === "apply"
                  ? "Apply Attendance Correction"
                  : "Reject Correction Request"}
              </h4>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-700 transition cursor-pointer"
                onClick={() => setSelectedReq(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {feedbackMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold">
                  {feedbackMsg}
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5">
                <div className="font-bold text-slate-900 text-sm">
                  {selectedReq.attendance.employee?.fullName}
                </div>
                <div className="text-slate-500">
                  Date: {new Date(selectedReq.attendance.date).toDateString()}
                </div>
                <div className="text-purple-700 font-semibold pt-1 font-mono">
                  Requested Shift:{" "}
                  {formatTime(selectedReq.reqItem.requestedInTime)} —{" "}
                  {formatTime(selectedReq.reqItem.requestedOutTime)}
                </div>
                {selectedReq.reqItem.reason && (
                  <div className="text-slate-600 italic pt-1 text-[11px]">
                    Manager note: "{selectedReq.reqItem.reason}"
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  HR Audit Note {actionType === "reject" && "(Required)"}
                </label>
                <textarea
                  rows="3"
                  maxLength="500"
                  placeholder={
                    actionType === "reject"
                      ? "State reason for rejection for audit records..."
                      : "Optional approval comment for audit trail..."
                  }
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
                  onClick={() => setSelectedReq(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={processing}
                  onClick={handleActionSubmit}
                  className={`px-4 py-2 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer ${
                    actionType === "apply"
                      ? "bg-emerald-600 hover:bg-emerald-500"
                      : "bg-rose-600 hover:bg-rose-500"
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {processing
                      ? "Processing..."
                      : `Confirm ${actionType === "apply" ? "Approval" : "Rejection"}`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
