import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Users,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Palmtree,
  TrendingUp,
  UserCheck,
  Search,
  ArrowRight,
  RefreshCw,
  Edit3,
  Check,
  X,
  Building2,
  Mail,
  Phone,
  Briefcase,
  AlertCircle,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_BACK_END_SERVER_UR || "http://localhost:5000";

export default function ManagerDashboard() {
  const { user, currentUser } = useAuth();
  const activeUser = user || currentUser;
  const navigate = useNavigate();

  const [teamMembers, setTeamMembers] = useState([]);
  const [teamAttendance, setTeamAttendance] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  function getAuthHeaders() {
    const token = localStorage.getItem("token") || "";
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  const fetchManagerData = async () => {
    try {
      setLoading(true);
      setError("");

      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      // Parallel fetch: team attendance calendar & direct reports
      const [attRes, teamRes] = await Promise.all([
        fetch(
          `${API_BASE_URL}/attendance/team/calendar?year=${currentYear}&month=${currentMonth}`,
          { headers: getAuthHeaders() },
        ),
        fetch(`${API_BASE_URL}/user`, { headers: getAuthHeaders() }),
      ]);

      const attData = await attRes.json();
      if (attRes.ok) setTeamAttendance(Array.isArray(attData) ? attData : []);

      const userData = await teamRes.json();
      if (teamRes.ok && Array.isArray(userData)) {
        // Filter direct reports in same department or where managerId matches
        const reports = userData.filter((u) => {
          if (u._id === activeUser?._id) return false; // exclude self
          return (
            u.manager === activeUser?._id ||
            u.managerId === activeUser?._id ||
            u.department === activeUser?.department ||
            u.department?._id === activeUser?.department?._id
          );
        });
        setTeamMembers(reports.length > 0 ? reports : userData.slice(0, 8));
      }
    } catch (err) {
      console.error("Manager dashboard fetch error:", err);
      setError(err.message || "Failed to load team data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagerData();
  }, [activeUser]);

  // Today's Date String
  const todayStr = new Date().toISOString().slice(0, 10);

  // Match team members with today's punch records
  const teamTodayStatus = useMemo(() => {
    return teamMembers.map((member) => {
      const todayRecord = teamAttendance.find((rec) => {
        const recEmpId = rec.employee?._id || rec.employee;
        const isSameEmp = recEmpId === member._id;
        const isToday =
          rec.date &&
          new Date(rec.date).toISOString().slice(0, 10) === todayStr;
        return isSameEmp && isToday;
      });

      const isClockedIn = Boolean(
        todayRecord && todayRecord.inTime && !todayRecord.outTime,
      );
      const isCompleted = Boolean(
        todayRecord && todayRecord.inTime && todayRecord.outTime,
      );
      const isLeave = todayRecord?.status === "On Leave";
      const isAbsent = todayRecord?.status === "Absent";

      let status = "Not Clocked";
      if (isClockedIn) status = "Clocked In";
      else if (isCompleted) status = "Completed";
      else if (isLeave) status = "On Leave";
      else if (isAbsent) status = "Absent";

      return {
        ...member,
        todayRecord,
        status,
        inTime: todayRecord?.inTime,
        outTime: todayRecord?.outTime,
        workedMinutes: todayRecord?.workedMinutes || 0,
        flags: todayRecord?.flags || [],
      };
    });
  }, [teamMembers, teamAttendance, todayStr]);

  // KPIs
  const totalTeamCount = teamMembers.length;
  const presentTodayCount = teamTodayStatus.filter(
    (m) => m.status === "Clocked In" || m.status === "Completed",
  ).length;
  const onLeaveCount = teamTodayStatus.filter(
    (m) => m.status === "On Leave",
  ).length;
  const exceptionsCount = teamTodayStatus.filter(
    (m) => m.flags && m.flags.length > 0,
  ).length;

  // Filtered by Search
  const filteredTeam = useMemo(() => {
    if (!searchTerm.trim()) return teamTodayStatus;
    const term = searchTerm.toLowerCase();
    return teamTodayStatus.filter(
      (m) =>
        m.fullName?.toLowerCase().includes(term) ||
        m.employeeCode?.toLowerCase().includes(term) ||
        m.jobTitle?.toLowerCase().includes(term),
    );
  }, [teamTodayStatus, searchTerm]);

  const formatTime = (timeIso) => {
    if (!timeIso) return "--:--";
    return new Date(timeIso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="bg-[#0f172a] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-200 border border-purple-400/30 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Manager Terminal</span>
            </span>
            <span className="text-xs text-slate-400">
              Department:{" "}
              {activeUser?.department?.name ||
                activeUser?.department ||
                "Operations"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Team Management & Shift Overview
          </h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Track daily team shifts, approve leaves, monitor attendance
            exceptions, and submit punch corrections for HR review.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={() => navigate("/manager/team-attendance")}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-purple-600/20 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Team Attendance Grid</span>
          </button>

          <button
            type="button"
            onClick={fetchManagerData}
            disabled={loading}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition cursor-pointer border border-slate-700"
            title="Refresh Live Status"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* 2. Team Shift Live KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">
              Total Direct Reports
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {totalTeamCount} Members
            </div>
            <span className="text-[11px] font-semibold text-purple-600 block mt-0.5">
              Assigned Department
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">
              Present on Shift
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {presentTodayCount} Active
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 block mt-0.5">
              {totalTeamCount > 0
                ? `${Math.round((presentTodayCount / totalTeamCount) * 100)}% attendance rate`
                : "0%"}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Palmtree className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">
              Scheduled on Leave
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {onLeaveCount} Staff
            </div>
            <span className="text-[11px] font-semibold text-amber-600 block mt-0.5">
              Approved Vacations
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">
              Exceptions & Flags
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {exceptionsCount} Flagged
            </div>
            <span className="text-[11px] font-semibold text-rose-600 block mt-0.5">
              Late / Missing Punch
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 3. Direct Reports Live Status Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span>Direct Reports — Today's Shift Status</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time attendance punch status for{" "}
              {new Date().toLocaleDateString([], {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search employee or code..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-hidden font-medium"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Employee</th>
                <th className="px-5 py-3.5">Job Title</th>
                <th className="px-5 py-3.5">Clock In</th>
                <th className="px-5 py-3.5">Clock Out</th>
                <th className="px-5 py-3.5">Hours Worked</th>
                <th className="px-5 py-3.5">Shift Status</th>
                <th className="px-5 py-3.5">Exceptions</th>
                <th className="px-5 py-3.5 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-slate-400">
                    <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading team status...
                  </td>
                </tr>
              ) : filteredTeam.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-slate-400">
                    No team members found matching your search.
                  </td>
                </tr>
              ) : (
                filteredTeam.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 font-bold text-xs flex items-center justify-center border border-purple-100 shrink-0">
                          {emp.fullName?.charAt(0) || "U"}
                        </div>
                        <div>
                          <strong className="text-slate-900 block font-semibold">
                            {emp.fullName}
                          </strong>
                          <span className="text-[11px] font-mono text-slate-400">
                            {emp.employeeCode}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {emp.jobTitle || "Staff"}
                    </td>
                    <td className="px-5 py-4 font-mono font-semibold text-slate-800">
                      {formatTime(emp.inTime)}
                    </td>
                    <td className="px-5 py-4 font-mono font-semibold text-slate-800">
                      {formatTime(emp.outTime)}
                    </td>
                    <td className="px-5 py-4 font-mono">
                      {emp.workedMinutes > 0
                        ? `${Math.floor(emp.workedMinutes / 60)}h ${emp.workedMinutes % 60}m`
                        : "--"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          emp.status === "Clocked In"
                            ? "bg-amber-50 text-amber-800 border-amber-200 animate-pulse"
                            : emp.status === "Completed"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : emp.status === "On Leave"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {emp.flags?.map((f) => (
                          <span
                            key={f}
                            className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200"
                          >
                            {f}
                          </span>
                        ))}
                        {(!emp.flags || emp.flags.length === 0) && (
                          <span className="text-slate-400">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => navigate("/manager/team-attendance")}
                        className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold transition flex items-center gap-1 ml-auto cursor-pointer"
                        title="Open Team Punch Adjustment Terminal"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Adjust / Correct</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
