import { useEffect, useState } from "react";
import "../../styles/payslip/payslip.css";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function Payslips() {
  const { user } = useAuth();
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPayslip, setEditingPayslip] = useState(null);

  // Form states for Generate
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1);
  const [genYear, setGenYear] = useState(new Date().getFullYear());
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState("");

  // Form state for Edit
  const [editFields, setEditFields] = useState({
    basicSalaryBHD: 0,
    allowancesBHD: 0,
    overtimeAmountBHD: 0,
    deductionsBHD: 0,
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const isHRAdmin = user?.role === "HR Admin";

  function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  }

  async function fetchPayslips() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/payslips`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch payslips.");
      }

      setPayslips(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to fetch payslips.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchEmployees() {
    if (!isHRAdmin) return;
    try {
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        setEmployees(data);
        if (data.length > 0 && !selectedEmployee) {
          setSelectedEmployee(data[0]._id);
        }
      }
    } catch (err) {
      console.error(
        "Failed to fetch employees list for payslip generation:",
        err,
      );
    }
  }

  useEffect(() => {
    fetchPayslips();
    if (isHRAdmin) {
      fetchEmployees();
    }
  }, [user]);

  function getEmployeeName(payslip) {
    return (
      payslip.employee?.fullName || payslip.employee?.name || "Unknown Employee"
    );
  }

  function getEmployeeCode(payslip) {
    return payslip.employee?.employeeCode || "--";
  }

  function getDepartment(payslip) {
    if (!payslip.employee?.department) return "--";
    return typeof payslip.employee.department === "string"
      ? payslip.employee.department
      : payslip.employee.department.name || "--";
  }

  function getMonthName(month) {
    const months = [
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
    return months[Number(month) - 1] || "--";
  }

  function formatMoney(filsAmount) {
    const bhd = (Number(filsAmount) || 0) / 1000;
    return bhd.toLocaleString("en-BH", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
  }

  // Handle HR Generate Payslip
  async function handleGeneratePayslip(e) {
    e.preventDefault();
    if (!selectedEmployee) {
      setGenError("Please select an employee.");
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
          month: Number(genMonth),
          year: Number(genYear),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to generate payslip.");
      }

      setShowGenerateModal(false);
      await fetchPayslips();
      if (data.payslip) {
        setSelectedPayslip(data.payslip);
      }
    } catch (err) {
      setGenError(err.message || "Failed to generate payslip.");
    } finally {
      setGenLoading(false);
    }
  }

  // Handle HR Edit/Adjust Payslip (Fils conversion)
  function openEditModal(payslip) {
    setEditingPayslip(payslip);
    setEditFields({
      basicSalaryBHD: ((payslip.basicSalary || 0) / 1000).toFixed(3),
      allowancesBHD: ((payslip.allowances || 0) / 1000).toFixed(3),
      overtimeAmountBHD: ((payslip.overtimeAmount || 0) / 1000).toFixed(3),
      deductionsBHD: ((payslip.deductions || 0) / 1000).toFixed(3),
    });
    setEditError("");
    setShowEditModal(true);
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingPayslip) return;

    try {
      setEditLoading(true);
      setEditError("");

      const payload = {
        basicSalary: Math.round(Number(editFields.basicSalaryBHD) * 1000),
        allowances: Math.round(Number(editFields.allowancesBHD) * 1000),
        overtimeAmount: Math.round(Number(editFields.overtimeAmountBHD) * 1000),
        deductions: Math.round(Number(editFields.deductionsBHD) * 1000),
      };

      const response = await fetch(
        `${API_BASE_URL}/payslips/${editingPayslip._id}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update payslip.");
      }

      setPayslips((prev) =>
        prev.map((p) =>
          p._id === editingPayslip._id ? data.payslip || data : p,
        ),
      );

      if (selectedPayslip?._id === editingPayslip._id) {
        setSelectedPayslip(data.payslip || data);
      }

      setShowEditModal(false);
      setEditingPayslip(null);
    } catch (err) {
      setEditError(err.message || "Failed to update payslip.");
    } finally {
      setEditLoading(false);
    }
  }

  // Handle HR Approve Payslip
  async function handleApprove(payslipId) {
    if (
      !window.confirm("Are you sure you want to approve and lock this payslip?")
    )
      return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/payslips/${payslipId}/approve`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to approve payslip.");
      }

      const updated = data.payslip || data;
      setPayslips((prev) =>
        prev.map((p) => (p._id === payslipId ? updated : p)),
      );

      if (selectedPayslip?._id === payslipId) {
        setSelectedPayslip(updated);
      }
    } catch (err) {
      alert(err.message || "Failed to approve payslip.");
    }
  }

  // Handle HR Delete Payslip
  async function handleDelete(payslipId) {
    if (
      !window.confirm("Are you sure you want to delete this pending payslip?")
    )
      return;

    try {
      const response = await fetch(`${API_BASE_URL}/payslips/${payslipId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete payslip.");
      }

      setPayslips((prev) => prev.filter((p) => p._id !== payslipId));
      if (selectedPayslip?._id === payslipId) setSelectedPayslip(null);
    } catch (err) {
      alert(err.message || "Failed to delete payslip.");
    }
  }

  return (
    <div className="payslip-page">
      <div className="payslip-header">
        <div>
          <h2>{isHRAdmin ? "Payroll Management" : "My Payslips"}</h2>
          <p>
            {isHRAdmin
              ? "Generate, adjust, review, and approve employee monthly payslips"
              : "View your verified monthly payslip breakdown and payment history"}
          </p>
        </div>
        <div className="header-actions">
          {isHRAdmin && (
            <button
              type="button"
              className="generate-btn"
              onClick={() => {
                setGenError("");
                setShowGenerateModal(true);
              }}
            >
              + Generate Payslip
            </button>
          )}
          <button
            type="button"
            className="refresh-btn"
            onClick={fetchPayslips}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      {loading && <p className="loading">Loading payslips...</p>}
      {error && <div className="error-message">{error}</div>}

      {!loading && !error && (
        <div className="payslip-table-container">
          {payslips.length === 0 ? (
            <div className="no-payslips">
              <h3>No Payslips Found</h3>
              <p>
                {isHRAdmin
                  ? "Click '+ Generate Payslip' to calculate an employee's monthly payroll."
                  : "No approved payslips have been published for your account yet."}
              </p>
            </div>
          ) : (
            <table className="payslip-table">
              <thead>
                <tr>
                  {isHRAdmin && <th>Employee</th>}
                  {isHRAdmin && <th>Code</th>}
                  <th>Period</th>
                  {isHRAdmin && <th>Department</th>}
                  <th>Basic Salary</th>
                  <th>Gross Salary</th>
                  <th>Deductions</th>
                  <th>Net Salary</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payslips.map((payslip) => (
                  <tr key={payslip._id}>
                    {isHRAdmin && (
                      <td>
                        <strong>{getEmployeeName(payslip)}</strong>
                      </td>
                    )}
                    {isHRAdmin && <td>{getEmployeeCode(payslip)}</td>}
                    <td>
                      <strong>{getMonthName(payslip.month)}</strong>{" "}
                      <span className="year-text">{payslip.year}</span>
                    </td>
                    {isHRAdmin && <td>{getDepartment(payslip)}</td>}
                    <td>{formatMoney(payslip.basicSalary)} BHD</td>
                    <td>{formatMoney(payslip.grossSalary)} BHD</td>
                    <td>{formatMoney(payslip.deductions)} BHD</td>
                    <td className="net-salary">
                      {formatMoney(payslip.netSalary)} BHD
                    </td>
                    <td>
                      <span className={`payslip-status ${payslip.status}`}>
                        {payslip.status}
                      </span>
                    </td>
                    <td>
                      <div className="payslip-actions">
                        <button
                          type="button"
                          className="view-btn"
                          onClick={() => setSelectedPayslip(payslip)}
                        >
                          View
                        </button>
                        {isHRAdmin && payslip.status !== "approved" && (
                          <>
                            <button
                              type="button"
                              className="edit-btn"
                              onClick={() => openEditModal(payslip)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="approve-btn"
                              onClick={() => handleApprove(payslip._id)}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="delete-btn"
                              onClick={() => handleDelete(payslip._id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* VIEW PAYSLIP MODAL */}
      {selectedPayslip && (
        <div className="payslip-modal-overlay">
          <div className="payslip-modal">
            <div className="payslip-modal-header">
              <h2>
                Payslip: {getMonthName(selectedPayslip.month)}{" "}
                {selectedPayslip.year}
              </h2>
              <button
                type="button"
                className="close-btn"
                onClick={() => setSelectedPayslip(null)}
              >
                ×
              </button>
            </div>

            <div className="payslip-document">
              <div className="payslip-company">
                <h1>HR System</h1>
                <p>Official Monthly Salary Statement</p>
                <div className={`status-badge ${selectedPayslip.status}`}>
                  {selectedPayslip.status.toUpperCase()}
                </div>
              </div>

              <div className="employee-information">
                <div>
                  <span>Employee:</span>{" "}
                  <strong>{getEmployeeName(selectedPayslip)}</strong>
                </div>
                <div>
                  <span>Employee Code:</span>{" "}
                  <strong>{getEmployeeCode(selectedPayslip)}</strong>
                </div>
                <div>
                  <span>Department:</span>{" "}
                  <strong>{getDepartment(selectedPayslip)}</strong>
                </div>
                {selectedPayslip.approvedAt && (
                  <div>
                    <span>Approved Date:</span>{" "}
                    <strong>
                      {new Date(
                        selectedPayslip.approvedAt,
                      ).toLocaleDateString()}
                    </strong>
                  </div>
                )}
              </div>

              {/* Attendance snapshot */}
              {selectedPayslip.attendanceSummary && (
                <div className="attendance-summary-box">
                  <h4>Attendance & Activity Summary</h4>
                  <div className="attendance-grid">
                    <div>
                      <span>Worked Hours:</span>{" "}
                      <strong>
                        {(
                          (selectedPayslip.attendanceSummary.workedMinutes ||
                            0) / 60
                        ).toFixed(1)}{" "}
                        hrs
                      </strong>
                    </div>
                    <div>
                      <span>Overtime:</span>{" "}
                      <strong>
                        {(
                          (selectedPayslip.attendanceSummary.overtimeMinutes ||
                            0) / 60
                        ).toFixed(1)}{" "}
                        hrs
                      </strong>
                    </div>
                    <div>
                      <span>Present Days:</span>{" "}
                      <strong>
                        {selectedPayslip.attendanceSummary.presentDays || 0}
                      </strong>
                    </div>
                    <div>
                      <span>Absent Days:</span>{" "}
                      <strong>
                        {selectedPayslip.attendanceSummary.absentDays || 0}
                      </strong>
                    </div>
                    <div>
                      <span>Leave Days:</span>{" "}
                      <strong>
                        {selectedPayslip.attendanceSummary.leaveDays || 0}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Earnings */}
              <div className="salary-section">
                <h3>Earnings Breakdown</h3>
                <div className="salary-row">
                  <span>Basic Salary</span>
                  <strong>
                    {formatMoney(selectedPayslip.basicSalary)} BHD
                  </strong>
                </div>
                <div className="salary-row">
                  <span>Allowances</span>
                  <strong>{formatMoney(selectedPayslip.allowances)} BHD</strong>
                </div>
                <div className="salary-row">
                  <span>Overtime Pay</span>
                  <strong>
                    {formatMoney(selectedPayslip.overtimeAmount)} BHD
                  </strong>
                </div>
                <div className="salary-row total">
                  <span>Gross Salary</span>
                  <strong>
                    {formatMoney(selectedPayslip.grossSalary)} BHD
                  </strong>
                </div>
              </div>

              {/* Deductions Breakdown */}
              <div className="salary-section">
                <h3>Deductions Breakdown</h3>
                {selectedPayslip.deductionBreakdown && (
                  <>
                    <div className="salary-row">
                      <span>Absence Deduction</span>
                      <strong>
                        {formatMoney(
                          selectedPayslip.deductionBreakdown.absenceDeduction,
                        )}{" "}
                        BHD
                      </strong>
                    </div>
                    <div className="salary-row">
                      <span>Leave Deduction</span>
                      <strong>
                        {formatMoney(
                          selectedPayslip.deductionBreakdown.leaveDeduction,
                        )}{" "}
                        BHD
                      </strong>
                    </div>
                    <div className="salary-row">
                      <span>Social Insurance (SIO)</span>
                      <strong>
                        {formatMoney(
                          selectedPayslip.deductionBreakdown.socialInsurance,
                        )}{" "}
                        BHD
                      </strong>
                    </div>
                    {Number(
                      selectedPayslip.deductionBreakdown.otherDeductions,
                    ) > 0 && (
                        <div className="salary-row">
                          <span>Other Deductions</span>
                          <strong>
                            {formatMoney(
                              selectedPayslip.deductionBreakdown.otherDeductions,
                            )}{" "}
                            BHD
                          </strong>
                        </div>
                      )}
                  </>
                )}
                <div className="salary-row total">
                  <span>Total Deductions</span>
                  <strong>{formatMoney(selectedPayslip.deductions)} BHD</strong>
                </div>
              </div>

              {/* Unrecovered Deductions Alert */}
              {selectedPayslip.deductionBreakdown?.unrecoveredDeductions >
                0 && (
                  <div className="unrecovered-notice">
                    Note: Unrecovered deductions exceeding Gross Salary:{" "}
                    <strong>
                      {formatMoney(
                        selectedPayslip.deductionBreakdown.unrecoveredDeductions,
                      )}{" "}
                      BHD
                    </strong>
                  </div>
                )}

              {/* Net Salary Total */}
              <div className="net-salary-box">
                <span>Net Payable Salary</span>
                <strong>{formatMoney(selectedPayslip.netSalary)} BHD</strong>
              </div>
            </div>

            <div className="payslip-modal-actions">
              <button
                type="button"
                className="print-btn"
                onClick={() => window.print()}
              >
                Print Statement
              </button>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setSelectedPayslip(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GENERATE PAYSLIP MODAL (HR ONLY) */}
      {showGenerateModal && (
        <div className="payslip-modal-overlay">
          <div className="payslip-modal form-modal">
            <div className="payslip-modal-header">
              <h2>Generate Monthly Payslip</h2>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowGenerateModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleGeneratePayslip} className="modal-form">
              {genError && <div className="error-message">{genError}</div>}

              <div className="form-group">
                <label>Select Employee:</label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  required
                >
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.fullName || emp.name} (
                      {emp.employeeCode || "No Code"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Month:</label>
                  <select
                    value={genMonth}
                    onChange={(e) => setGenMonth(e.target.value)}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <option key={m} value={m}>
                        {getMonthName(m)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Year:</label>
                  <input
                    type="number"
                    value={genYear}
                    min="2000"
                    max="2100"
                    onChange={(e) => setGenYear(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="payslip-modal-actions">
                <button
                  type="submit"
                  className="generate-btn"
                  disabled={genLoading}
                >
                  {genLoading ? "Calculating..." : "Calculate & Generate"}
                </button>
                <button
                  type="button"
                  className="close-modal-btn"
                  onClick={() => setShowGenerateModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT / ADJUST PAYSLIP MODAL (HR ONLY) */}
      {showEditModal && editingPayslip && (
        <div className="payslip-modal-overlay">
          <div className="payslip-modal form-modal">
            <div className="payslip-modal-header">
              <h2>
                Adjust Payslip: {getEmployeeName(editingPayslip)} (
                {getMonthName(editingPayslip.month)} {editingPayslip.year})
              </h2>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="modal-form">
              {editError && <div className="error-message">{editError}</div>}

              <div className="form-group">
                <label>Basic Salary (BHD):</label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={editFields.basicSalaryBHD}
                  onChange={(e) =>
                    setEditFields({
                      ...editFields,
                      basicSalaryBHD: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Allowances (BHD):</label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={editFields.allowancesBHD}
                  onChange={(e) =>
                    setEditFields({
                      ...editFields,
                      allowancesBHD: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Overtime Amount (BHD):</label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={editFields.overtimeAmountBHD}
                  onChange={(e) =>
                    setEditFields({
                      ...editFields,
                      overtimeAmountBHD: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Total Deductions (BHD):</label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={editFields.deductionsBHD}
                  onChange={(e) =>
                    setEditFields({
                      ...editFields,
                      deductionsBHD: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="payslip-modal-actions">
                <button
                  type="submit"
                  className="approve-btn"
                  disabled={editLoading}
                >
                  {editLoading ? "Saving..." : "Save Adjustments"}
                </button>
                <button
                  type="button"
                  className="close-modal-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payslips;
