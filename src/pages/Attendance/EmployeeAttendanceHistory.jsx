import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  History,
  Calendar,
  Clock,
  Filter,
  RefreshCw,
  AlertCircle,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_BACK_END_SERVER_URL || "http://localhost:3000";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function EmployeeAttendanceHistory() {
  const { user, currentUser } = useAuth();
  const activeUser = user || currentUser;

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || "";
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchAttendanceHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        year: selectedYear.toString(),
        month: selectedMonth.toString(),
      });

      const res = await fetch(
        `${API_BASE_URL}/attendance/logs?${params.toString()}`,
        {
          headers: getAuthHeaders(),
        },
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to load attendance logs.");

      const rawLogs = Array.isArray(data) ? data : data.logs || data.data || [];
      setLogs(rawLogs);
    } catch (err) {
      console.error("Attendance history error:", err);
      setError(err.message || "Failed to load your attendance history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceHistory();
  }, [selectedMonth, selectedYear]);

  // Filtered attendance logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Status filter
      if (statusFilter !== "all" && log.status !== statusFilter) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const dateStr = new Date(log.date).toLocaleDateString().toLowerCase();
        const statusStr = (log.status || "").toLowerCase();
        const flagsStr = (log.flags || []).join(" ").toLowerCase();
        return (
          dateStr.includes(term) ||
          statusStr.includes(term) ||
          flagsStr.includes(term)
        );
      }

      return true;
    });
  }, [logs, statusFilter, searchTerm]);

  // KPIs
  const stats = useMemo(() => {
    let presentCount = 0;
    let lateCount = 0;
    let leaveCount = 0;
    let totalMinutes = 0;

    logs.forEach((log) => {
      if (log.status === "Present" || log.status === "Half Day") {
        presentCount += 1;
        totalMinutes += Number(log.workedMinutes) || 0;
      }
      if (log.status === "On Leave") {
        leaveCount += 1;
      }
      if (log.flags && log.flags.includes("late")) {
        lateCount += 1;
      }
    });

    return {
      presentCount,
      lateCount,
      leaveCount,
      totalHours: (totalMinutes / 60).toFixed(1),
    };
  }, [logs]);

  const formatTime = (timeIso) => {
    if (!timeIso) return "--:--";
    const date = new Date(timeIso);
    if (Number.isNaN(date.getTime())) return timeIso;
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Present":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Absent":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Half Day":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "On Leave":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Holiday":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Weekly Off":
        return "bg-slate-100 text-slate-600 border-slate-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = [
      "Date",
      "Clock In",
      "Clock Out",
      "Worked Minutes",
      "Status",
      "Flags",
    ];
    const rows = filteredLogs.map((l) => [
      new Date(l.date).toISOString().slice(0, 10),
      l.inTime ? formatTime(l.inTime) : "--",
      l.outTime ? formatTime(l.outTime) : "--",
      l.workedMinutes || 0,
      l.status || "Absent",
      `"${(l.flags || []).join(", ")}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `My_Attendance_${selectedYear}_${selectedMonth}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 mb-2">
            <History className="w-3.5 h-3.5" />
            <span>Personal Attendance Trail</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            My Attendance History
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified shift timestamps, work durations, and monthly summary logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchAttendanceHistory}
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

      {/* Monthly KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Days Present
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {stats.presentCount}{" "}
            <span className="text-xs font-medium text-slate-400">days</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Hours
          </span>
          <div className="text-2xl font-black text-purple-700 font-mono mt-1">
            {stats.totalHours}{" "}
            <span className="text-xs font-medium text-slate-400">hrs</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Approved Leaves
          </span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {stats.leaveCount}{" "}
            <span className="text-xs font-medium text-slate-400">days</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Late Flags
          </span>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {stats.lateCount}{" "}
            <span className="text-xs font-medium text-slate-400">times</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Month Selector */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-transparent focus:outline-hidden cursor-pointer"
          >
            {MONTH_NAMES.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-transparent focus:outline-hidden cursor-pointer"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Half Day">Half Day</option>
            <option value="On Leave">On Leave</option>
            <option value="Holiday">Holiday</option>
            <option value="Weekly Off">Weekly Off</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search dates, flags..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 focus:outline-hidden font-medium"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* History Table (Read-Only) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Day</th>
                <th className="px-5 py-3.5">Clock In</th>
                <th className="px-5 py-3.5">Clock Out</th>
                <th className="px-5 py-3.5">Duration</th>
                <th className="px-5 py-3.5">Attendance Status</th>
                <th className="px-5 py-3.5 text-right">Flags / Exceptions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading attendance records...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    No attendance records found for{" "}
                    {MONTH_NAMES[selectedMonth - 1]} {selectedYear}.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const logDate = new Date(log.date);
                  const dayName = logDate.toLocaleDateString([], {
                    weekday: "short",
                  });
                  const workedHours = log.workedMinutes
                    ? `${Math.floor(log.workedMinutes / 60)}h ${log.workedMinutes % 60}m`
                    : "--";

                  return (
                    <tr
                      key={log._id}
                      className="hover:bg-slate-50/70 transition"
                    >
                      <td className="px-5 py-4 font-bold text-slate-900 whitespace-nowrap">
                        {logDate.toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-4 text-slate-500 font-medium">
                        {dayName}
                      </td>
                      <td className="px-5 py-4 font-mono font-semibold text-slate-800">
                        {formatTime(log.inTime)}
                      </td>
                      <td className="px-5 py-4 font-mono font-semibold text-slate-800">
                        {formatTime(log.outTime)}
                      </td>
                      <td className="px-5 py-4 font-mono text-purple-700 font-semibold">
                        {workedHours}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(
                            log.status,
                          )}`}
                        >
                          {log.status || "Absent"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex flex-wrap items-center justify-end gap-1">
                          {log.flags && log.flags.length > 0 ? (
                            log.flags.map((flag) => (
                              <span
                                key={flag}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                  flag === "late"
                                    ? "bg-rose-50 text-rose-700 border-rose-200"
                                    : flag === "earlyExit"
                                      ? "bg-amber-50 text-amber-800 border-amber-200"
                                      : "bg-purple-50 text-purple-700 border-purple-200"
                                }`}
                              >
                                {flag === "late"
                                  ? "Late In"
                                  : flag === "earlyExit"
                                    ? "Early Exit"
                                    : flag === "missingTimeOut"
                                      ? "Missing Out"
                                      : flag}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[11px]">
                              Regular
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
