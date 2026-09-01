import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../styles/payslip/payslip.css";

import {
  CreditCard,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit3,
  Trash2,
  Printer,
  Calendar,
  CheckCheck,
  X,
  FileText,
  Send,
} from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
).replace(/\/+$/, "");

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

const HR_ROLES = ["HR Admin", "Admin", "HR"];

function getStoredToken() {
  return (
    localStorage.getItem("token") || localStorage.getItem("accessToken") || ""
  );
}

function getAuthHeaders() {
  const token = getStoredToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json().catch(() => ({}));
  }

  const text = await response.text().catch(() => "");

  return {
    message: text || `Server returned ${response.status}`,
  };
}

function getPayslipArray(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.payslips)) {
    return data.payslips;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

function getEmployeeArray(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.users)) {
    return data.users;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.employees)) {
    return data.employees;
  }

  return [];
}

function formatMoney(filsAmount) {
  const bhd = (Number(filsAmount) || 0) / 1000;

  return bhd.toLocaleString("en-BH", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
}

function filsFromBhd(value) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return null;
  }

  return Math.round(number * 1000);
}

function isReleasedForEmployee(payslip) {
  if (!payslip || payslip.status !== "approved") {
    return false;
  }

  const today = new Date();

  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  const payrollYear = Number(payslip.year);
  const payrollMonth = Number(payslip.month);

  if (!Number.isInteger(payrollYear) || !Number.isInteger(payrollMonth)) {
    return false;
  }

  if (payrollYear < currentYear) {
    return true;
  }

  if (payrollYear > currentYear) {
    return false;
  }

  if (payrollMonth < currentMonth) {
    return true;
  }

  if (payrollMonth > currentMonth) {
    return false;
  }

  return currentDay >= 25;
}

export default function Payslips() {
  const { user, currentUser } = useAuth();

  const activeUser = user || currentUser;

  const userRole = activeUser?.role || activeUser?.userRole || "";

  const isHRAdmin = HR_ROLES.includes(userRole);

  const [payslips, setPayslips] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedPayslip, setSelectedPayslip] = useState(null);

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1);
  const [genYear, setGenYear] = useState(new Date().getFullYear());

  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState("");

  const [editingPayslip, setEditingPayslip] = useState(null);

  const [editFields, setEditFields] = useState({
    basicSalaryBHD: "0.000",
    allowancesBHD: "0.000",
    overtimeAmountBHD: "0.000",
    deductionsBHD: "0.000",
  });

  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const [batchLoading, setBatchLoading] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // =====================================================
  // FETCH PAYSLIPS
  // =====================================================

  async function fetchPayslips() {
    if (!activeUser) return;

    try {
      setLoading(true);
      setError("");

      const endpoint = isHRAdmin
        ? `${API_BASE_URL}/payslips`
        : `${API_BASE_URL}/payslips/my`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to fetch payslips. Server returned ${response.status}.`,
        );
      }

      setPayslips(getPayslipArray(data));
    } catch (err) {
      console.error("FETCH PAYSLIPS ERROR:", err);

      setPayslips([]);

      setError(
        err?.message ||
          "Unable to load payslips. Please check your server connection.",
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // FETCH EMPLOYEES
  // =====================================================

  async function fetchEmployees() {
    if (!isHRAdmin) return;

    try {
      const response = await fetch(`${API_BASE_URL}/user/allUsers`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await parseResponse(response);

      console.log("EMPLOYEES RESPONSE:", data);

      if (!response.ok) {
        console.error("FETCH EMPLOYEES ERROR:", data);
        setEmployees([]);
        return;
      }

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.allUsers)
          ? data.allUsers
          : Array.isArray(data?.users)
            ? data.users
            : Array.isArray(data?.employees)
              ? data.employees
              : Array.isArray(data?.data)
                ? data.data
                : [];

      console.log("EMPLOYEES FETCHED:", list);

      setEmployees(list);

      if (list.length > 0) {
        setSelectedEmployee((current) => current || list[0]._id);
      }
    } catch (err) {
      console.error("FETCH EMPLOYEES ERROR:", err);
      setEmployees([]);
    }
  }

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    if (!activeUser) return;

    fetchPayslips();

    if (isHRAdmin) {
      fetchEmployees();
    }
  }, [activeUser?._id, activeUser?.id, isHRAdmin]);

  // =====================================================
  // VISIBLE PAYSLIPS
  // =====================================================

  const visiblePayslips = useMemo(() => {
    if (isHRAdmin) {
      return payslips;
    }

    return payslips.filter(isReleasedForEmployee);
  }, [payslips, isHRAdmin]);

  // =====================================================
  // PENDING APPROVALS
  // =====================================================

  const pendingApprovalsCount = useMemo(() => {
    return payslips.filter((p) => p.status !== "approved").length;
  }, [payslips]);

  // =====================================================
  // GENERATE
  // =====================================================

  async function handleGeneratePayslip(event) {
    event.preventDefault();

    if (!selectedEmployee) {
      setGenError("Please select an employee.");
      return;
    }

    const month = Number(genMonth);
    const year = Number(genYear);

    if (!Number.isInteger(month) || month < 1 || month > 12) {
      setGenError("Please select a valid month.");
      return;
    }

    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      setGenError("Year must be between 2000 and 2100.");
      return;
    }

    try {
      setGenLoading(true);
      setGenError("");

      const response = await fetch(`${API_BASE_URL}/payslips`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          employee: selectedEmployee,
          month,
          year,
        }),
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to generate payslip. Server returned ${response.status}.`,
        );
      }

      setShowGenerateModal(false);
      setGenError("");

      await fetchPayslips();
    } catch (err) {
      console.error("GENERATE PAYSLIP ERROR:", err);

      setGenError(err?.message || "Failed to generate payslip.");
    } finally {
      setGenLoading(false);
    }
  }

  // =====================================================
  // OPEN EDIT
  // =====================================================

  function openEditModal(payslip) {
    if (!payslip?._id) return;

    if (payslip.status === "approved" || payslip.locked === true) {
      alert("Approved or locked payslips cannot be edited.");
      return;
    }

    setEditingPayslip(payslip);

    setEditFields({
      basicSalaryBHD: ((Number(payslip.basicSalary) || 0) / 1000).toFixed(3),

      allowancesBHD: ((Number(payslip.allowances) || 0) / 1000).toFixed(3),

      overtimeAmountBHD: ((Number(payslip.overtimeAmount) || 0) / 1000).toFixed(
        3,
      ),

      deductionsBHD: ((Number(payslip.deductions) || 0) / 1000).toFixed(3),
    });

    setEditError("");
  }

  // =====================================================
  // SAVE EDIT
  // =====================================================

  async function handleSaveEdit(event) {
    event.preventDefault();

    console.log(payslips);
    if (!editingPayslip?._id) {
      setEditError("Invalid payslip.");
      return;
    }

    const basicSalary = filsFromBhd(editFields.basicSalaryBHD);
    const allowances = filsFromBhd(editFields.allowancesBHD);
    const overtimeAmount = filsFromBhd(editFields.overtimeAmountBHD);
    const deductions = filsFromBhd(editFields.deductionsBHD);

    if (
      basicSalary === null ||
      allowances === null ||
      overtimeAmount === null ||
      deductions === null
    ) {
      setEditError("All salary values must be valid non-negative numbers.");
      return;
    }

    try {
      setEditLoading(true);
      setEditError("");

      const response = await fetch(
        `${API_BASE_URL}/payslips/${editingPayslip._id}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            basicSalary,
            allowances,
            overtimeAmount,
            deductions,
          }),
        },
      );

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to update payslip. Server returned ${response.status}.`,
        );
      }

      setEditingPayslip(null);
      setEditError("");

      await fetchPayslips();
    } catch (err) {
      console.error("UPDATE PAYSLIP ERROR:", err);

      setEditError(err?.message || "Failed to update payslip.");
    } finally {
      setEditLoading(false);
    }
  }

  // =====================================================
  // APPROVE ONE
  // =====================================================

  async function handleApprove(id) {
    if (!id) {
      alert("Invalid payslip ID.");
      return;
    }

    const payslip = payslips.find((p) => p._id === id);

    if (!payslip) {
      alert("Payslip not found.");
      return;
    }

    if (payslip.status === "approved" || payslip.locked === true) {
      alert("This payslip is already approved and locked.");
      return;
    }

    const confirmed = window.confirm(
      "Approve this payslip?\n\nOnce approved, it will be locked and cannot be edited or deleted.",
    );

    if (!confirmed) return;

    try {
      setApprovingId(id);
      setError("");

      const response = await fetch(`${API_BASE_URL}/payslips/${id}/approve`, {
        method: "PATCH",
        headers: getAuthHeaders(),
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to approve payslip. Server returned ${response.status}.`,
        );
      }

      await fetchPayslips();
    } catch (err) {
      console.error("APPROVE PAYSLIP ERROR:", err);

      alert(`Approval error:\n\n${err?.message || "Unknown error"}`);
    } finally {
      setApprovingId(null);
    }
  }

  // =====================================================
  // APPROVE ALL
  // =====================================================

  async function handleApproveAll() {
    const pending = payslips.filter(
      (p) => p.status !== "approved" && p.locked !== true,
    );

    if (pending.length === 0) {
      alert("All current payslips are already approved.");
      return;
    }

    const confirmed = window.confirm(
      `Approve all ${pending.length} pending payslips?\n\nAll approved payslips will be locked.`,
    );

    if (!confirmed) return;

    try {
      setBatchLoading(true);
      setError("");

      for (const payslip of pending) {
        const response = await fetch(
          `${API_BASE_URL}/payslips/${payslip._id}/approve`,
          {
            method: "PATCH",
            headers: getAuthHeaders(),
          },
        );

        const data = await parseResponse(response);

        if (!response.ok) {
          throw new Error(
            data?.message || `Failed to approve payslip ${payslip._id}.`,
          );
        }
      }

      await fetchPayslips();

      alert("All pending payslips have been approved successfully.");
    } catch (err) {
      console.error("BULK APPROVAL ERROR:", err);

      alert(`Bulk approval error:\n\n${err?.message || "Unknown error"}`);

      await fetchPayslips();
    } finally {
      setBatchLoading(false);
    }
  }

  // =====================================================
  // DELETE
  // =====================================================

  async function handleDelete(id) {
    if (!id) {
      alert("Invalid payslip ID.");
      return;
    }

    const payslip = payslips.find((p) => p._id === id);

    if (!payslip) {
      alert("Payslip not found.");
      return;
    }

    if (payslip.status === "approved" || payslip.locked === true) {
      alert("Approved or locked payslips cannot be deleted.");
      return;
    }

    if (!window.confirm("Delete this draft payslip?")) {
      return;
    }

    try {
      setDeletingId(id);

      const response = await fetch(`${API_BASE_URL}/payslips/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to delete payslip. Server returned ${response.status}.`,
        );
      }

      await fetchPayslips();
    } catch (err) {
      console.error("DELETE PAYSLIP ERROR:", err);

      alert(`Deletion error:\n\n${err?.message || "Unknown error"}`);
    } finally {
      setDeletingId(null);
    }
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-300">
      {/* HEADER */}

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 mb-2">
            <CreditCard className="w-3.5 h-3.5" />

            <span>
              {isHRAdmin ? "Payroll Management" : "Salary Statements"}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {isHRAdmin ? "Payroll & Payslip Management" : "My Monthly Payslips"}
          </h1>

          <p className="text-xs text-slate-500 mt-0.5">
            {isHRAdmin
              ? "Generate, adjust, review, and approve employee monthly payslips."
              : "Official salary statements released after HR approval on the 25th of each month."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isHRAdmin && (
            <>
              <button
                type="button"
                onClick={handleApproveAll}
                disabled={batchLoading || pendingApprovalsCount === 0}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCheck className="w-4 h-4" />

                <span>
                  {batchLoading
                    ? "Approving..."
                    : `Approve All Pending (${pendingApprovalsCount})`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setGenError("");
                  setShowGenerateModal(true);
                }}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />

                <span>Generate Payslip</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={fetchPayslips}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
            title="Refresh Payslips"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* EMPLOYEE POLICY */}

      {!isHRAdmin && (
        <div className="bg-purple-50/70 rounded-2xl p-4 border border-purple-100 flex items-start gap-3 text-xs text-purple-900">
          <Calendar className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />

          <div>
            <span className="font-bold block">
              Monthly Payslip Release Policy:
            </span>

            <span>
              Approved payslips are published for employee access on the{" "}
              <strong>25th of each month</strong>.
            </span>
          </div>
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />

          <span>{error}</span>
        </div>
      )}

      {/* TABLE */}

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                {isHRAdmin && <th className="px-5 py-3.5">Employee</th>}

                {isHRAdmin && <th className="px-5 py-3.5">Code</th>}

                <th className="px-5 py-3.5">Period</th>

                {isHRAdmin && <th className="px-5 py-3.5">Department</th>}

                <th className="px-5 py-3.5">Basic Salary</th>

                <th className="px-5 py-3.5">Gross Salary</th>

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
                    colSpan={isHRAdmin ? 10 : 6}
                    className="text-center py-10 text-slate-400"
                  >
                    <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading payslips...
                  </td>
                </tr>
              ) : visiblePayslips.length === 0 ? (
                <tr>
                  <td
                    colSpan={isHRAdmin ? 10 : 6}
                    className="text-center py-10 text-slate-400"
                  >
                    {isHRAdmin
                      ? "No payslips generated yet. Click '+ Generate Payslip' to start payroll calculation."
                      : "No approved payslips have been released for your account yet."}
                  </td>
                </tr>
              ) : (
                visiblePayslips.map((payslip) => (
                  <tr
                    key={payslip._id}
                    className="hover:bg-slate-50/70 transition"
                  >
                    {isHRAdmin && (
                      <td className="px-5 py-4">
                        <strong className="text-slate-900 block font-semibold">
                          {payslip.employee?.fullName ||
                            payslip.employee?.name ||
                            "Employee"}
                        </strong>
                      </td>
                    )}

                    {isHRAdmin && (
                      <td className="px-5 py-4 font-mono text-slate-400">
                        {payslip.employee?.employeeCode || "--"}
                      </td>
                    )}

                    <td className="px-5 py-4 font-bold text-slate-900">
                      {MONTH_NAMES[Number(payslip.month) - 1] || "Unknown"}{" "}
                      <span className="font-normal text-slate-400 font-mono">
                        {payslip.year}
                      </span>
                    </td>

                    {isHRAdmin && (
                      <td className="px-5 py-4 text-slate-500">
                        {payslip.employee?.department?.departmentName ||
                          payslip.employee?.department?.name ||
                          "General"}
                      </td>
                    )}

                    <td className="px-5 py-4 font-mono">
                      {formatMoney(payslip.basicSalary)} BHD
                    </td>

                    <td className="px-5 py-4 font-mono font-semibold text-slate-800">
                      {formatMoney(payslip.grossSalary)} BHD
                    </td>

                    <td className="px-5 py-4 font-mono text-rose-600">
                      -{formatMoney(payslip.deductions)} BHD
                    </td>

                    <td className="px-5 py-4 font-mono font-extrabold text-emerald-700 text-sm">
                      {formatMoney(payslip.netSalary)} BHD
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          payslip.status === "approved"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {payslip.status || "draft"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          onClick={() => setSelectedPayslip(payslip)}
                        >
                          <Eye className="w-3.5 h-3.5" />

                          <span>View</span>
                        </button>

                        {isHRAdmin &&
                          payslip.status !== "approved" &&
                          !payslip.locked && (
                            <>
                              <button
                                type="button"
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                onClick={() => openEditModal(payslip)}
                              >
                                <Edit3 className="w-3.5 h-3.5" />

                                <span>Edit</span>
                              </button>

                              <button
                                type="button"
                                disabled={approvingId === payslip._id}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => handleApprove(payslip._id)}
                              >
                                {approvingId === payslip._id ? (
                                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                )}

                                <span>
                                  {approvingId === payslip._id
                                    ? "Approving..."
                                    : "Approve"}
                                </span>
                              </button>

                              <button
                                type="button"
                                disabled={deletingId === payslip._id}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer disabled:opacity-50"
                                onClick={() => handleDelete(payslip._id)}
                                title="Delete Draft"
                              >
                                {deletingId === payslip._id ? (
                                  <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================
          VIEW MODAL
      ===================================================== */}

      {selectedPayslip && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
          onClick={() => setSelectedPayslip(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />

                <h2 className="font-bold text-slate-900 text-base">
                  Salary Statement —{" "}
                  {MONTH_NAMES[Number(selectedPayslip.month) - 1] || "Unknown"}{" "}
                  {selectedPayslip.year}
                </h2>
              </div>

              <button
                type="button"
                className="text-slate-400 hover:text-slate-700 transition cursor-pointer"
                onClick={() => setSelectedPayslip(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    RAL BAHRAIN HR
                  </h1>

                  <p className="text-xs text-slate-400">
                    Kingdom of Bahrain • SIO Registered Payroll
                  </p>
                </div>

                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                    selectedPayslip.status === "approved"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}
                >
                  {selectedPayslip.status || "draft"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block font-medium">
                    Employee Name
                  </span>

                  <strong className="text-slate-900 text-sm">
                    {selectedPayslip.employee?.fullName ||
                      activeUser?.fullName ||
                      "Employee"}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">
                    Employee Code
                  </span>

                  <strong className="text-slate-900 font-mono">
                    {selectedPayslip.employee?.employeeCode ||
                      activeUser?.employeeCode ||
                      "--"}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">
                    Department
                  </span>

                  <strong className="text-slate-900">
                    {selectedPayslip.employee?.department?.departmentName ||
                      selectedPayslip.employee?.department?.name ||
                      "General"}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">
                    Approval Date
                  </span>

                  <strong className="text-slate-900">
                    {selectedPayslip.approvedAt
                      ? new Date(
                          selectedPayslip.approvedAt,
                        ).toLocaleDateString()
                      : "Not approved"}
                  </strong>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Earnings Breakdown
                </h3>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Basic Wage</span>

                  <span className="font-mono font-bold text-slate-900">
                    {formatMoney(selectedPayslip.basicSalary)} BHD
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Allowances</span>

                  <span className="font-mono font-bold text-slate-900">
                    {formatMoney(selectedPayslip.allowances)} BHD
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Overtime Pay</span>

                  <span className="font-mono font-bold text-slate-900">
                    {formatMoney(selectedPayslip.overtimeAmount)} BHD
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-200 font-bold bg-slate-50/70 px-2 rounded-lg">
                  <span className="text-slate-800">Gross Salary</span>

                  <span className="font-mono text-slate-900">
                    {formatMoney(selectedPayslip.grossSalary)} BHD
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Deductions & Statutory Contributions
                </h3>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">
                    Social Insurance / Deductions
                  </span>

                  <span className="font-mono font-bold text-rose-600">
                    -{formatMoney(selectedPayslip.deductions)} BHD
                  </span>
                </div>

                {Number(selectedPayslip.deductionBreakdown?.absenceDeduction) >
                  0 && (
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-600">Absence Deductions</span>

                    <span className="font-mono font-bold text-rose-600">
                      -
                      {formatMoney(
                        selectedPayslip.deductionBreakdown.absenceDeduction,
                      )}{" "}
                      BHD
                    </span>
                  </div>
                )}

                <div className="flex justify-between py-2 border-b border-slate-200 font-bold bg-rose-50/50 px-2 rounded-lg">
                  <span className="text-rose-900">Total Deductions</span>

                  <span className="font-mono text-rose-700">
                    -{formatMoney(selectedPayslip.deductions)} BHD
                  </span>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-900 block">
                    Net Payable Salary
                  </span>

                  <span className="text-[11px] text-emerald-700">
                    Final payable salary
                  </span>
                </div>

                <div className="text-2xl font-black text-emerald-800 font-mono">
                  {formatMoney(selectedPayslip.netSalary)} BHD
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />

                <span>Print Statement</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPayslip(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          GENERATE MODAL
      ===================================================== */}

      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                Generate Monthly Payslip
              </h3>

              <button
                type="button"
                className="text-slate-400 hover:text-slate-700 transition cursor-pointer"
                onClick={() => setShowGenerateModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleGeneratePayslip}
              className="p-6 space-y-4 text-xs"
            >
              {genError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold">
                  {genError}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Select Employee:
                </label>

                <select
                  value={selectedEmployee}
                  onChange={(event) => setSelectedEmployee(event.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                  required
                >
                  {employees.length === 0 ? (
                    <option value="">No employees found</option>
                  ) : (
                    employees.map((employee) => (
                      <option key={employee._id} value={employee._id}>
                        {employee.fullName ||
                          employee.name ||
                          employee.username ||
                          "Employee"}{" "}
                        ({employee.employeeCode || "EMP"})
                      </option>
                    ))
                  )}
                </select>

                {employees.length === 0 && (
                  <p className="text-[10px] text-rose-500 mt-1">
                    No employees were returned from the server.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Month:
                  </label>

                  <select
                    value={genMonth}
                    onChange={(event) =>
                      setGenMonth(Number(event.target.value))
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                  >
                    {MONTH_NAMES.map((month, index) => (
                      <option key={month} value={index + 1}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Year:
                  </label>

                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    value={genYear}
                    onChange={(event) => setGenYear(Number(event.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={genLoading || !selectedEmployee}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />

                  <span>
                    {genLoading ? "Calculating..." : "Calculate & Generate"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {editingPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                Adjust Wage Breakdown:{" "}
                {editingPayslip.employee?.fullName || "Employee"}
              </h3>

              <button
                type="button"
                className="text-slate-400 hover:text-slate-700 transition cursor-pointer"
                onClick={() => setEditingPayslip(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              {editError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold">
                  {editError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Basic Salary (BHD):
                  </label>

                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={editFields.basicSalaryBHD}
                    onChange={(event) =>
                      setEditFields((current) => ({
                        ...current,
                        basicSalaryBHD: event.target.value,
                      }))
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Allowances (BHD):
                  </label>

                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={editFields.allowancesBHD}
                    onChange={(event) =>
                      setEditFields((current) => ({
                        ...current,
                        allowancesBHD: event.target.value,
                      }))
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Overtime (BHD):
                  </label>

                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={editFields.overtimeAmountBHD}
                    onChange={(event) =>
                      setEditFields((current) => ({
                        ...current,
                        overtimeAmountBHD: event.target.value,
                      }))
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Deductions (BHD):
                  </label>

                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={editFields.deductionsBHD}
                    onChange={(event) =>
                      setEditFields((current) => ({
                        ...current,
                        deductionsBHD: event.target.value,
                      }))
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPayslip(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />

                  <span>{editLoading ? "Saving..." : "Save Adjustments"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
