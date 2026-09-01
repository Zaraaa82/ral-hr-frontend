import React, { useState, useEffect } from "react";
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
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function HRPendingCorrections() {
  const [records, setRecords] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionNote, setActionNote] = useState("");
  const [selectedReq, setSelectedReq] = useState(null);
  const [actionType, setActionType] = useState(null); // 'apply' | 'reject'
  const [processing, setProcessing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const fetchPending = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${API_BASE_URL}/attendance/correction-requests/pending`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
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
    setFeedbackMsg("");
  };

  const handleActionSubmit = async () => {
    if (actionType === "reject" && !actionNote.trim()) {
      setFeedbackMsg("A rejection reason is required.");
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
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ actionNote: actionNote.trim() }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || `Failed to ${actionType} correction.`);

      setSelectedReq(null);
      fetchPending();
    } catch (err) {
      setFeedbackMsg(err.message || "Action processing failed.");
    } finally {
      setProcessing(false);
    }
  };

  const formatTime = (timeIso) => {
    if (!timeIso) return "--:--";
    return new Date(timeIso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-purple-600" />
            <span>Pending Attendance Corrections</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
              {count}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Review manager-submitted attendance adjustments before monthly
            payroll lock
          </p>
        </div>

        <button
          type="button"
          onClick={fetchPending}
          disabled={loading}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-center disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
          <span>{loading ? "Refreshing..." : "Refresh Queue"}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-700 font-bold uppercase text-[10px]">
            <tr>
              <th className="px-5 py-3.5">Employee</th>
              <th className="px-5 py-3.5">Date</th>
              <th className="px-5 py-3.5">Current Punch</th>
              <th className="px-5 py-3.5">Requested Punch</th>
              <th className="px-5 py-3.5">Reason</th>
              <th className="px-5 py-3.5">Requested By</th>
              <th className="px-5 py-3.5 text-right">Decision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-slate-400">
                  <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Loading pending queue...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-8 text-slate-400 font-medium"
                >
                  🎉 No pending corrections waiting for HR review.
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
                        {formatTime(rec.inTime)} — {formatTime(rec.outTime)}
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-purple-700">
                        {formatTime(reqItem.requestedInTime)} —{" "}
                        {formatTime(reqItem.requestedOutTime)}
                        {reqItem.requestedStatus && (
                          <span className="block text-[10px] uppercase font-sans text-purple-500">
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

      {/* Confirmation Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-base">
                {actionType === "apply"
                  ? "Apply Attendance Correction"
                  : "Reject Correction Request"}
              </h4>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-700 transition"
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

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                <div className="font-bold text-slate-900 text-sm">
                  {selectedReq.attendance.employee?.fullName}
                </div>
                <div className="text-slate-500">
                  Date: {new Date(selectedReq.attendance.date).toDateString()}
                </div>
                <div className="text-purple-700 font-semibold pt-1">
                  Requested Shift:{" "}
                  {formatTime(selectedReq.reqItem.requestedInTime)} —{" "}
                  {formatTime(selectedReq.reqItem.requestedOutTime)}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  HR Audit Note {actionType === "reject" && "(Required)"}
                </label>
                <textarea
                  rows="3"
                  placeholder={
                    actionType === "reject"
                      ? "State reason for rejection..."
                      : "Optional approval note for audit logs..."
                  }
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
                  onClick={() => setSelectedReq(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={processing}
                  onClick={handleActionSubmit}
                  className={`px-4 py-2 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50 ${
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
