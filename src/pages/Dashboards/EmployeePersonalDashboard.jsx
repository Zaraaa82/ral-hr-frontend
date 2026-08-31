import React from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import {
  Clock,
  CreditCard,
  Building2,
  Mail,
  Briefcase,
  CheckCircle2,
  TrendingUp,
  User,
  FileText,
  ArrowRight,
} from "lucide-react";

export default function EmployeePersonalDashboard() {
  const { currentUser, attendanceRecords = [], payslips = [] } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) return null;

  // Filter current user's attendance records & payslips
  const myAttendance = attendanceRecords.filter(
    (r) => r.employeeId === currentUser._id,
  );
  const myPayslips = payslips.filter((p) => p.employeeId === currentUser._id);

  // Today's attendance status
  const todayStr = "2026-08-31";
  const todayRecord = myAttendance.find((r) => r.date === todayStr);
  const isClockedIn = Boolean(
    todayRecord && todayRecord.clockIn && !todayRecord.clockOut,
  );
  const isCompletedToday = Boolean(todayRecord && todayRecord.clockOut);

  // Monthly stats for current employee
  const totalDaysPresent = myAttendance.filter(
    (r) => r.status === "Present",
  ).length;
  const totalWorkedMinutes = myAttendance.reduce(
    (acc, r) => acc + (r.workedMinutes || 0),
    0,
  );
  const totalWorkedHours = (totalWorkedMinutes / 60).toFixed(1);
  const totalOvertimeMinutes = myAttendance.reduce(
    (acc, r) => acc + (r.overtimeMinutes || 0),
    0,
  );
  const totalOvertimeHours = (totalOvertimeMinutes / 60).toFixed(1);

  // Latest payslip
  const latestPayslip = myPayslips[0] || null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Employee Profile Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <img
              src={
                currentUser.avatar ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              }
              alt={currentUser.fullName}
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-indigo-400/40 shadow-lg shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {currentUser.fullName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  {currentUser.role}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {currentUser.employeeCode}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-300 pt-1">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                  {currentUser.jobTitle || "Team Member"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  {currentUser.department} Department
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  {currentUser.workEmail}
                </span>
              </div>
            </div>
          </div>

          {/* Clock In / Out Trigger */}
          <div className="flex items-center gap-3 self-start md:self-center">
            <button
              onClick={() => navigate("/attendance/punch")}
              className={`px-5 py-3 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md ${
                isClockedIn
                  ? "bg-rose-500 hover:bg-rose-600 text-white"
                  : isCompletedToday
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>
                {isClockedIn
                  ? "Currently Clocked IN (Punch Out)"
                  : isCompletedToday
                    ? "Day Completed (View Log)"
                    : "Punch In Now"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid for Logged-In Employee */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">
              Days Present (Aug)
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {totalDaysPresent} Days
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 block mt-0.5">
              100% Attendance Rate
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">
              Total Hours Logged
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {totalWorkedHours} hrs
            </div>
            <span className="text-[11px] font-semibold text-indigo-600 block mt-0.5">
              Standard shift (8h/day)
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">
              Overtime Accumulated
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {totalOvertimeHours} hrs
            </div>
            <span className="text-[11px] font-semibold text-amber-600 block mt-0.5">
              Approved for Payroll
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">
              Monthly Base Salary
            </span>
            <div className="text-2xl font-bold text-slate-900 font-mono mt-0.5">
              {((currentUser.basicSalaryFils || 0) / 1000).toFixed(3)} BHD
            </div>
            <span className="text-[11px] font-semibold text-purple-600 block mt-0.5">
              + {((currentUser.allowancesFils || 0) / 1000).toFixed(3)}{" "}
              Allowances
            </span>
          </div>
        </div>
      </div>

      {/* 3. Personal Profile (Left) + Recent Attendance & Payslips (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Employment Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" />
                <span>My Employment Details</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {currentUser.employmentStatus || "Active"}
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Employee ID</span>
                <span className="font-mono font-bold text-slate-900">
                  {currentUser.employeeCode}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Department</span>
                <span className="font-semibold text-slate-900">
                  {currentUser.department}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Job Title</span>
                <span className="font-semibold text-slate-900">
                  {currentUser.jobTitle || "Staff"}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">
                  Date of Joining
                </span>
                <span className="font-semibold text-slate-900">
                  {currentUser.joinDateFormatted ||
                    currentUser.dateOfJoining ||
                    "2023-01-15"}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Work Email</span>
                <span className="font-semibold text-slate-900">
                  {currentUser.workEmail}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Phone Number</span>
                <span className="font-semibold text-slate-900">
                  {currentUser.phone || "+973 3900 0000"}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">
                  Nationality / SIO
                </span>
                <span className="font-semibold text-slate-900">
                  {currentUser.isBahraini
                    ? "Bahraini Citizen (8% SIO)"
                    : "Expatriate (1% SIO)"}
                </span>
              </div>
            </div>

            {/* Compensation Summary */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Salary Breakdown
              </h3>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Basic Wage:</span>
                <span className="font-mono font-bold text-slate-900">
                  {((currentUser.basicSalaryFils || 0) / 1000).toFixed(3)} BHD
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Allowances:</span>
                <span className="font-mono font-bold text-slate-900">
                  {((currentUser.allowancesFils || 0) / 1000).toFixed(3)} BHD
                </span>
              </div>
              <div className="flex justify-between text-xs pt-2 border-t border-slate-200">
                <span className="text-indigo-900 font-bold">Total Gross:</span>
                <span className="font-mono font-extrabold text-indigo-600">
                  {(
                    ((currentUser.basicSalaryFils || 0) +
                      (currentUser.allowancesFils || 0)) /
                    1000
                  ).toFixed(3)}{" "}
                  BHD
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Attendance History & Payslip */}
        <div className="lg:col-span-7 space-y-6">
          {/* Attendance Activity */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Recent Attendance Log</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Your clock-in records for August 2026
                </p>
              </div>

              <Link
                to="/attendance/history"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>Full History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {myAttendance.slice(0, 5).map((rec) => (
                <div
                  key={rec._id}
                  className="py-3 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-[11px]">
                      {rec.date.split("-")[2]}
                    </div>
                    <div>
                      <strong className="text-slate-900 block font-semibold">
                        {rec.date}
                      </strong>
                      <span className="text-slate-400 text-[11px]">
                        In:{" "}
                        <span className="font-mono text-slate-700">
                          {rec.clockIn}
                        </span>{" "}
                        | Out:{" "}
                        <span className="font-mono text-slate-700">
                          {rec.clockOut || "Active"}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {rec.workedMinutes
                        ? `${Math.floor(rec.workedMinutes / 60)}h ${
                            rec.workedMinutes % 60
                          }m`
                        : "In Progress"}
                    </span>
                    {rec.overtimeMinutes ? (
                      <span className="block text-[10px] text-amber-600 font-semibold mt-0.5">
                        +{rec.overtimeMinutes}m OT
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Latest Payslip */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  <span>My Latest Payslip</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  August 2026 Monthly Statement
                </p>
              </div>

              <Link
                to={`/${currentUser._id}/payslips`}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>All Payslips</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {latestPayslip ? (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-purple-950">
                      Period: {latestPayslip.period || "August 2026"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      {latestPayslip.status || "Approved"}
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 font-mono">
                    {(latestPayslip.netSalaryFils / 1000).toFixed(3)} BHD
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Net Take-Home Pay after SIO deduction
                  </span>
                </div>

                <button
                  onClick={() => navigate(`/${currentUser._id}/payslips`)}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <FileText className="w-4 h-4" />
                  <span>Download / View Slip</span>
                </button>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs text-slate-500">
                No payslips issued yet for this month.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
