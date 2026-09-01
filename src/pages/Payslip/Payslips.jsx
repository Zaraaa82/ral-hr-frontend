import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  FileText,
  Search,
  Filter,
  Printer,
  RefreshCw,
  Calendar,
  DollarSign,
  AlertCircle,
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

export default function Payslips() {
  const { user, currentUser } = useAuth();
  const activeUser = user || currentUser;

  const userRole = (activeUser?.role || "").trim();
  const isHRAdmin =
    userRole === "HR Admin" || userRole === "Admin" || userRole === "admin";

  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || "";
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE_URL}/payroll/all-payslips`, {
        headers: getAuthHeaders(),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load payslips.");

      const rawList = Array.isArray(data)
        ? data
        : data.payslips || data.data || [];
      setPayslips(rawList);
    } catch (err) {
      console.error("Error loading payslips:", err);
      setError(err.message || "Could not fetch payslip records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayslips();
  }, []);

  // Filter & Search Logic
  const filteredPayslips = useMemo(() => {
    return payslips.filter((slip) => {
      // Role permission check
      if (!isHRAdmin) {
        const empId = slip.employeeId?._id || slip.employeeId || slip.employee;
        const myId = activeUser?._id || activeUser?.id;
        if (empId?.toString() !== myId?.toString()) return false;
        if (slip.status !== "approved") return false;
      }

      // Month Filter
      if (monthFilter !== "all" && Number(slip.month) !== Number(monthFilter)) {
        return false;
      }

      // Year Filter
      if (yearFilter !== "all" && Number(slip.year) !== Number(yearFilter)) {
        return false;
      }

      // Status Filter
      if (
        statusFilter !== "all" &&
        (slip.status || "pending").toLowerCase() !== statusFilter.toLowerCase()
      ) {
        return false;
      }

      // Department Filter
      if (departmentFilter !== "all") {
        const dept =
          slip.department ||
          slip.employeeId?.department?.name ||
          slip.employeeId?.department;
        if (
          (dept || "").toString().toLowerCase() !==
          departmentFilter.toLowerCase()
        ) {
          return false;
        }
      }

      // Text Search Query
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        const empName = (
          slip.employeeName ||
          slip.employeeId?.fullName ||
          ""
        ).toLowerCase();
        const empCode = (
          slip.employeeCode ||
          slip.employeeId?.employeeCode ||
          ""
        ).toLowerCase();
        const dept = (
          slip.department ||
          slip.employeeId?.department?.name ||
          ""
        ).toLowerCase();
        const monthName = (
          MONTH_NAMES[Number(slip.month) - 1] || ""
        ).toLowerCase();
        const yearStr = String(slip.year || "");
        const statusStr = (slip.status || "").toLowerCase();

        const matches =
          empName.includes(term) ||
          empCode.includes(term) ||
          dept.includes(term) ||
          monthName.includes(term) ||
          yearStr.includes(term) ||
          statusStr.includes(term);

        if (!matches) return false;
      }

      return true;
    });
  }, [
    payslips,
    isHRAdmin,
    activeUser,
    monthFilter,
    yearFilter,
    statusFilter,
    departmentFilter,
    searchTerm,
  ]);

  const formatBHD = (amountFils) => {
    const val = (Number(amountFils) || 0) / 1000;
    return val.toLocaleString("en-BH", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 mb-2">
            <DollarSign className="w-3.5 h-3.5" />
            <span>
              {isHRAdmin ? "Payroll Statements" : "Personal Payslips"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {isHRAdmin ? "Employee Payslips Management" : "My Monthly Payslips"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isHRAdmin
              ? "Search, verify, calculate, and approve monthly payroll records."
              : "Review your official monthly salary disbursements, deductions, and earnings."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchPayslips}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition shadow-xs cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by employee name, code, month, or department..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 focus:outline-hidden font-medium"
          />
        </div>

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

        {/* Status Filter */}
        {isHRAdmin && (
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved & Locked</option>
            </select>
          </div>
        )}

        {/* Reset Filters */}
        {(searchTerm ||
          monthFilter !== "all" ||
          yearFilter !== "all" ||
          statusFilter !== "all") && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setMonthFilter("all");
              setYearFilter("all");
              setStatusFilter("all");
              setDepartmentFilter("all");
            }}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition cursor-pointer"
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

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                {isHRAdmin && <th className="px-5 py-3.5">Employee</th>}
                <th className="px-5 py-3.5">Period</th>
                <th className="px-5 py-3.5">Basic Salary</th>
                <th className="px-5 py-3.5">Allowances</th>
                <th className="px-5 py-3.5">Deductions</th>
                <th className="px-5 py-3.5">Net Payable</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td
                    colSpan={isHRAdmin ? 8 : 7}
                    className="text-center py-10 text-slate-400"
                  >
                    <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading payslip records...
                  </td>
                </tr>
              ) : filteredPayslips.length === 0 ? (
                <tr>
                  <td
                    colSpan={isHRAdmin ? 8 : 7}
                    className="text-center py-12 text-slate-400"
                  >
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
                      <FileText className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-slate-700 text-sm">
                      No Payslips Found
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      {!isHRAdmin
                        ? "You have no approved payslips published for this period. Pending records are awaiting HR verification."
                        : "No payslip records match the active search and filter criteria."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPayslips.map((slip) => (
                  <tr
                    key={slip._id}
                    className="hover:bg-slate-50/70 transition"
                  >
                    {isHRAdmin && (
                      <td className="px-5 py-4">
                        <strong className="text-slate-900 block font-semibold">
                          {slip.employeeName ||
                            slip.employeeId?.fullName ||
                            "Employee"}
                        </strong>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {slip.employeeCode ||
                            slip.employeeId?.employeeCode ||
                            "--"}
                        </span>
                      </td>
                    )}

                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-bold text-slate-900">
                        {MONTH_NAMES[Number(slip.month) - 1] || slip.month}
                      </span>{" "}
                      <span className="text-slate-400 font-mono text-[11px]">
                        {slip.year}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-mono font-semibold text-slate-800">
                      {formatBHD(slip.basicSalary)} BHD
                    </td>

                    <td className="px-5 py-4 font-mono text-emerald-700 font-semibold">
                      +{formatBHD(slip.allowances)} BHD
                    </td>

                    <td className="px-5 py-4 font-mono text-rose-600 font-semibold">
                      -{formatBHD(slip.deductions)} BHD
                    </td>

                    <td className="px-5 py-4 font-mono font-bold text-purple-700 text-sm">
                      {formatBHD(slip.netSalary)} BHD
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          slip.status === "approved"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {slip.status || "pending"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print</span>
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
