import React, { useState, useEffect, useMemo } from "react";
import {
  Shield,
  Search,
  Filter,
  RefreshCw,
  Eye,
  FileText,
  User,
  Calendar,
  Clock,
  ArrowRight,
  Download,
  AlertCircle,
  X,
  Layers,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Diff Inspector Modal
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (entityFilter !== "all") params.append("entityType", entityFilter);
      if (actionFilter !== "all") params.append("action", actionFilter);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await fetch(
        `${API_BASE_URL}/audit-logs?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        },
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to load audit trail.");
      setLogs(Array.isArray(data) ? data : data.logs || []);
    } catch (err) {
      console.error("Audit log error:", err);
      setError(err.message || "Failed to fetch audit logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [entityFilter, actionFilter]);

  // Client-side search query matching
  const filteredLogs = useMemo(() => {
    if (!searchTerm.trim()) return logs;
    const term = searchTerm.toLowerCase();

    return logs.filter((log) => {
      const actorName = log.changedBy?.fullName || log.changedBy?.name || "";
      const entity = log.entityType || "";
      const action = log.action || "";
      const reason = log.reason || "";
      const oldStr = JSON.stringify(log.old_value || {}).toLowerCase();
      const newStr = JSON.stringify(log.new_value || {}).toLowerCase();

      return (
        actorName.toLowerCase().includes(term) ||
        entity.toLowerCase().includes(term) ||
        action.toLowerCase().includes(term) ||
        reason.toLowerCase().includes(term) ||
        oldStr.includes(term) ||
        newStr.includes(term)
      );
    });
  }, [logs, searchTerm]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = ["Timestamp", "Entity", "Action", "Changed By", "Reason"];
    const rows = filteredLogs.map((l) => [
      new Date(l.createdAt || l.timestamp).toISOString(),
      l.entityType,
      l.action,
      l.changedBy?.fullName || "System",
      `"${(l.reason || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `RAL_HR_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadgeColor = (action) => {
    const act = (action || "").toUpperCase();
    if (
      act.includes("CREATE") ||
      act.includes("APPROVE") ||
      act.includes("APPLY")
    ) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (act.includes("DELETE") || act.includes("REJECT")) {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    if (act.includes("UPDATE") || act.includes("EDIT")) {
      return "bg-amber-50 text-amber-800 border-amber-200";
    }
    return "bg-purple-50 text-purple-700 border-purple-200";
  };

  const getEntityBadgeColor = (entity) => {
    switch (entity) {
      case "Attendance":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "LeaveRequest":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Document":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "User":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Payroll":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Header & Export */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Compliance & Audit Trail</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            System Audit & Activity Logs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log tracking all modifications across Users, Attendance,
            Leaves, Documents, and Payroll
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchAuditLogs}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition shadow-xs cursor-pointer"
            title="Refresh Audit Logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by actor, reason, record ID, or payload..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 focus:outline-hidden font-medium"
          />
        </div>

        {/* Entity Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="bg-transparent focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Entities</option>
            <option value="Attendance">Attendance</option>
            <option value="LeaveRequest">Leave Requests</option>
            <option value="Document">Documents</option>
            <option value="User">Users / Employees</option>
            <option value="Payroll">Payroll</option>
            <option value="StatutorySettings">Settings</option>
          </select>
        </div>

        {/* Action Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-transparent focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="APPROVE">Approve</option>
            <option value="REJECT">Reject</option>
          </select>
        </div>

        {/* Date Filters */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-semibold cursor-pointer"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-semibold cursor-pointer"
          />
          <button
            type="button"
            onClick={fetchAuditLogs}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
          >
            Apply
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Actor / Changed By</th>
                <th className="px-5 py-3.5">Entity</th>
                <th className="px-5 py-3.5">Action</th>
                <th className="px-5 py-3.5">Reason / Description</th>
                <th className="px-5 py-3.5 text-right">Data Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400">
                    <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading audit trail records...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4 font-mono text-slate-500 whitespace-nowrap">
                      {new Date(
                        log.createdAt || log.timestamp || Date.now(),
                      ).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 font-bold text-xs flex items-center justify-center shrink-0 border border-purple-100">
                          {log.changedBy?.fullName?.charAt(0) || "S"}
                        </div>
                        <div>
                          <strong className="text-slate-900 block font-semibold">
                            {log.changedBy?.fullName || "System Admin"}
                          </strong>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {log.changedBy?.employeeCode || "SYS"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getEntityBadgeColor(
                          log.entityType,
                        )}`}
                      >
                        {log.entityType}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getActionBadgeColor(
                          log.action,
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <p
                        className="text-slate-700 italic truncate"
                        title={log.reason}
                      >
                        {log.reason ? `"${log.reason}"` : "--"}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {(log.old_value || log.new_value) && (
                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-bold transition flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Diff</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side-by-Side Data Diff Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Audit Snapshot Diff ({selectedLog.entityType} •{" "}
                  {selectedLog.action})
                </h3>
              </div>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-700 transition"
                onClick={() => setSelectedLog(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-700 space-y-1">
                <div>
                  <strong>Changed By:</strong>{" "}
                  {selectedLog.changedBy?.fullName || "System Admin"} (
                  {selectedLog.changedBy?.employeeCode || "SYS"})
                </div>
                <div>
                  <strong>Timestamp:</strong>{" "}
                  {new Date(
                    selectedLog.createdAt || selectedLog.timestamp,
                  ).toLocaleString()}
                </div>
                {selectedLog.reason && (
                  <div>
                    <strong>Audit Reason:</strong> "{selectedLog.reason}"
                  </div>
                )}
              </div>

              {/* Old vs New JSON diff containers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Previous State (old_value)</span>
                  </div>
                  <pre className="bg-slate-900 text-rose-300 p-3.5 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-64 border border-slate-800">
                    {selectedLog.old_value
                      ? JSON.stringify(selectedLog.old_value, null, 2)
                      : "(empty)"}
                  </pre>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>New State (new_value)</span>
                  </div>
                  <pre className="bg-slate-900 text-emerald-300 p-3.5 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-64 border border-slate-800">
                    {selectedLog.new_value
                      ? JSON.stringify(selectedLog.new_value, null, 2)
                      : "(empty)"}
                  </pre>
                </div>
              </div>
            </div>

            <div className="flex justify-end px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-xs transition"
                onClick={() => setSelectedLog(null)}
              >
                Close Diff Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
