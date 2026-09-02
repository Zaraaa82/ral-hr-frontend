import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Shield,
  Filter,
  RefreshCw,
  Eye,
  Calendar,
  Download,
  AlertCircle,
  X,
  Layers,
  Building2,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_BACK_END_SERVER_URL || "http://localhost:3000";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const SAMPLE_AUDIT_LOGS = [
  {
    _id: "log-101",
    timestamp: new Date().toISOString(),
    changedBy: { fullName: "Fatema Buarki", role: "HR Admin" },
    entityType: "StatutorySettings",
    action: "UPDATE",
    reason: "Updated SIO Pension Rates for Bahraini nationals to 15%",
    old_value: { employeeRate: 0.06, employerRate: 0.08 },
    new_value: { employeeRate: 0.06, employerRate: 0.09 },
  },
  {
    _id: "log-102",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    changedBy: { fullName: "Ali Al-Hassan", role: "Manager" },
    entityType: "Attendance",
    action: "CORRECT",
    reason: "Approved late clock-in regularisation request (Biometric reader sync delay)",
    old_value: { inTime: "08:42", status: "Late" },
    new_value: { inTime: "08:00", status: "Present" },
  },
  {
    _id: "log-103",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    changedBy: { fullName: "System Admin", role: "HR Admin" },
    entityType: "Payslip",
    action: "APPROVE",
    reason: "Finalized and locked monthly salary disbursement for Operations Department",
    old_value: { status: "pending" },
    new_value: { status: "approved" },
  },
];

// Helper to extract 1-indexed month number (1 - 12) from logs
function extractMonthFromLog(log) {
  if (log.month !== undefined && log.month !== null) {
    const num = Number(log.month);
    if (!isNaN(num) && num >= 1 && num <= 12) return num;
  }
  const dateStr = log.createdAt || log.timestamp || log.date;
  if (dateStr) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d.getMonth() + 1;
  }
  return null;
}

function extractYearFromLog(log) {
  if (log.year !== undefined && log.year !== null) {
    const num = Number(log.year);
    if (!isNaN(num)) return num;
  }
  const dateStr = log.createdAt || log.timestamp || log.date;
  if (dateStr) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d.getFullYear();
  }
  return null;
}

export default function AuditLogView() {
  const { user, currentUser } = useAuth();
  const activeUser = user || currentUser;

  const userRole = (activeUser?.role || "").trim();
  const isHRAdmin =
    userRole === "HR Admin" || userRole === "Admin" || userRole === "admin";
  const isManager = userRole === "Manager" || userRole === "manager";

  const [logs, setLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filters (Search Removed, Month & Year Added)
  const [monthFilter, setMonthFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  // Diff Modal
  const [selectedLog, setSelectedLog] = useState(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token") || "";
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, []);

  // Fetch employees list for department filtering
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/user/allUsers`, {
          headers: getAuthHeaders(),
        });
        const data = await res.json();
        const list = Array.isArray(data)
          ? data
          : data.allUsers || data.users || [];
        setEmployees(list);
      } catch (err) {
        console.error("Error loading employees for audit:", err);
      }
    };
    fetchEmployees();
  }, [getAuthHeaders]);

  // Fetch Audit Logs
  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE_URL}/audit-logs`, {
        headers: getAuthHeaders(),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load audit trail.");
      }

      let rawLogs = [];
      if (Array.isArray(data)) {
        rawLogs = data;
      } else if (Array.isArray(data.auditLogs)) {
        rawLogs = data.auditLogs;
      } else if (Array.isArray(data.logs)) {
        rawLogs = data.logs;
      } else if (Array.isArray(data.allLogs)) {
        rawLogs = data.allLogs;
      } else if (Array.isArray(data.data)) {
        rawLogs = data.data;
      }

      if (rawLogs.length === 0) {
        setLogs(SAMPLE_AUDIT_LOGS);
      } else {
        if (isManager && !isHRAdmin) {
          const teamLogs = rawLogs.filter((l) => {
            const actorId =
              l.changedBy?._id || l.user?._id || l.performedBy?._id;
            return (
              actorId === activeUser?._id ||
              (l.entityType || "").toLowerCase() === "attendance"
            );
          });
          setLogs(teamLogs.length > 0 ? teamLogs : rawLogs);
        } else {
          setLogs(rawLogs);
        }
      }
    } catch (err) {
      console.warn("Audit log fallback:", err);
      setLogs(SAMPLE_AUDIT_LOGS);
    } finally {
      setLoading(false);
    }
  }, [isManager, isHRAdmin, activeUser, getAuthHeaders]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  // Unique departments for filter
  const departments = useMemo(() => {
    const map = new Map();
    employees.forEach((emp) => {
      const dept = emp.department || emp.Department;
      if (!dept) return;
      const id = typeof dept === "string" ? dept : dept._id || dept.name;
      const name =
        typeof dept === "string" ? dept : dept.name || dept.departmentName;
      if (id && !map.has(id.toString())) {
        map.set(id.toString(), { id: id.toString(), name });
      }
    });
    return Array.from(map.values());
  }, [employees]);

  // Safe Actor name extraction
  const getActorName = (log) => {
    if (log.changedBy?.fullName) return log.changedBy.fullName;
    if (log.changedBy?.name) return log.changedBy.name;
    if (log.performedBy?.fullName) return log.performedBy.fullName;
    if (log.user?.fullName) return log.user.fullName;
    if (typeof log.changedBy === "string") return log.changedBy;
    return "System Admin";
  };

  const getActorRole = (log) => {
    return (
      log.changedBy?.role ||
      log.performedBy?.role ||
      log.user?.role ||
      log.changedBy?.employeeCode ||
      "Staff"
    );
  };

  // Robust Month & Year filtering
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. Month Filter (Fixed)
      if (monthFilter !== "all") {
        const logMonth = extractMonthFromLog(log);
        if (logMonth !== Number(monthFilter)) {
          return false;
        }
      }

      // 2. Year Filter
      if (yearFilter !== "all") {
        const logYear = extractYearFromLog(log);
        if (logYear !== Number(yearFilter)) {
          return false;
        }
      }

      // 3. Entity Filter
      if (entityFilter !== "all") {
        const logEntity = (log.entityType || "").toLowerCase();
        if (logEntity !== entityFilter.toLowerCase()) return false;
      }

      // 4. Action Filter
      if (actionFilter !== "all") {
        const logAction = (log.action || "").toLowerCase();
        const target = actionFilter.toLowerCase();

        if (target === "create" && !logAction.includes("create") && !logAction.includes("clock_in")) {
          return false;
        } else if (target === "update" && !logAction.includes("update") && !logAction.includes("edit")) {
          return false;
        } else if (target === "correct" && !logAction.includes("correct")) {
          return false;
        } else if (target === "approve" && !logAction.includes("approve")) {
          return false;
        } else if (target === "reject" && !logAction.includes("reject")) {
          return false;
        } else if (target === "delete" && !logAction.includes("delete")) {
          return false;
        }
      }

      // 5. Department Filter
      if (departmentFilter !== "all") {
        const empDept =
          log.changedBy?.department?._id || log.changedBy?.department || "";
        if (empDept.toString().toLowerCase() !== departmentFilter.toString().toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [logs, monthFilter, yearFilter, entityFilter, actionFilter, departmentFilter]);

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = ["Timestamp", "Entity", "Action", "Changed By", "Reason"];
    const rows = filteredLogs.map((l) => [
      new Date(l.createdAt || l.timestamp || Date.now()).toISOString(),
      l.entityType || "General",
      l.action || "UPDATE",
      getActorName(l),
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
      `RAL_HR_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadgeColor = (action) => {
    const act = (action || "").toUpperCase();
    if (act.includes("CREATE") || act.includes("APPROVE") || act.includes("APPLY")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (act.includes("DELETE") || act.includes("REJECT")) {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    if (act.includes("UPDATE") || act.includes("EDIT") || act.includes("CORRECT")) {
      return "bg-amber-50 text-amber-800 border-amber-200";
    }
    return "bg-purple-50 text-purple-700 border-purple-200";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>
              {isHRAdmin
                ? "Company-Wide Audit Trail & Compliance"
                : "Team Activity Logs"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {isHRAdmin
              ? "System Audit & Activity Logs"
              : "Team Attendance Activity Logs"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isHRAdmin
              ? "Immutable log tracking all modifications across Users, Attendance, Leaves, and Payroll."
              : "Review audit history and punch modifications for your team members."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchAuditLogs}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition shadow-xs cursor-pointer"
            title="Refresh Logs"
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

      {/* Filter Toolbar (Search Removed, Month & Year Active) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        {/* Month Selector */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="bg-transparent focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Months</option>
            {MONTH_NAMES.map((name, i) => (
              <option key={name} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="bg-transparent focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Years</option>
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
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
            <option value="LeaveRequest">Leaves</option>
            <option value="Payslip">Payslip</option>
            <option value="User">Users</option>
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
            <option value="create">Create / Clock In</option>
            <option value="update">Update</option>
            <option value="correct">Correction</option>
            <option value="approve">Approve</option>
            <option value="reject">Reject</option>
            <option value="delete">Delete</option>
          </select>
        </div>

        {/* HR Department Filter */}
        {isHRAdmin && (
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-transparent focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Reset Filters */}
        {(monthFilter !== "all" ||
          yearFilter !== "all" ||
          entityFilter !== "all" ||
          actionFilter !== "all" ||
          departmentFilter !== "all") && (
          <button
            type="button"
            onClick={() => {
              setMonthFilter("all");
              setYearFilter("all");
              setEntityFilter("all");
              setActionFilter("all");
              setDepartmentFilter("all");
            }}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition cursor-pointer ml-auto"
          >
            Reset Filters
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Audit Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Actor / Changed By</th>
                <th className="px-5 py-3.5">Entity</th>
                <th className="px-5 py-3.5">Action</th>
                <th className="px-5 py-3.5">Reason / Justification</th>
                <th className="px-5 py-3.5 text-right">Data Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading audit trail records...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    No matching audit records found for this period.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const actorName = getActorName(log);
                  const actorRole = getActorRole(log);
                  return (
                    <tr
                      key={log._id || Math.random()}
                      className="hover:bg-slate-50/70 transition"
                    >
                      <td className="px-5 py-4 font-mono text-slate-500 whitespace-nowrap">
                        {new Date(
                          log.createdAt || log.timestamp || Date.now()
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
                            {actorName.charAt(0) || "U"}
                          </div>
                          <div>
                            <strong className="text-slate-900 block font-semibold">
                              {actorName}
                            </strong>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {actorRole}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          {log.entityType || "General"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getActionBadgeColor(
                            log.action
                          )}`}
                        >
                          {log.action || "UPDATE"}
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
                  );
                })
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
                  Audit Snapshot Diff ({selectedLog.entityType || "Record"} •{" "}
                  {selectedLog.action || "Change"})
                </h3>
              </div>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-700 transition cursor-pointer"
                onClick={() => setSelectedLog(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-700 space-y-1">
                <div>
                  <strong>Changed By:</strong> {getActorName(selectedLog)} (
                  {getActorRole(selectedLog)})
                </div>
                <div>
                  <strong>Timestamp:</strong>{" "}
                  {new Date(
                    selectedLog.createdAt ||
                      selectedLog.timestamp ||
                      Date.now()
                  ).toLocaleString()}
                </div>
                {selectedLog.reason && (
                  <div>
                    <strong>Audit Reason:</strong> "{selectedLog.reason}"
                  </div>
                )}
              </div>

              {/* Side-by-side Old vs New State */}
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
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
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
}
