import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Ban,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  Eye,
  FileText,
  Filter,
  Hash,
  ListChecks,
  Mail,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react';
import {
  approveLeaveRequest,
  getAllLeaveRequests,
  getLeaveRequestById,
  rejectLeaveRequest,
  overrideLeaveRequest,
} from '../../services/leaveRequestService';
import { getAllDepartments } from '../../services/departmentService';
import '../../styles/leave/Leave.css';

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
];

function getEmployeeName(request) {
  return request?.employee?.fullName || 'Employee';
}

function getEmployeeCode(request) {
  return request?.employee?.employeeCode || '—';
}

function getLeaveTypeName(request) {
  const leaveType = request?.leaveType?.type || 'Leave';

  return leaveType.startsWith('Sick (')
    ? leaveType.split('(')[0].trim()
    : leaveType;
}

function getDepartmentArray(data) {
  if (Array.isArray(data)) return data;

  const possibleArrays = [
    data?.departments,
    data?.allDepartments,
    data?.allDeps,
    data?.allDep,
    data?.foundDepartments,
    data?.foundDeps,
    data?.data,
  ];

  return possibleArrays.find(Array.isArray) || [];
}

function getDepartmentId(department) {
  if (!department) return '';

  if (typeof department === 'object') {
    return String(department._id || department.id || '');
  }

  return String(department);
}

function getDepartmentLabel(department) {
  return department?.departmentName || department?.name || 'Department';
}

function formatDate(value) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('en-BH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function formatDateTime(value) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleString('en-BH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Bahrain',
  });
}

function getStatusClass(status) {
  const normalizedStatus = String(status || '').toLowerCase();

  if (['pending', 'approved', 'rejected', 'cancelled'].includes(normalizedStatus)) {
    return `manager-leave-status--${normalizedStatus}`;
  }

  return 'manager-leave-status--default';
}

function getDocumentUrl(document) {
  if (!document || typeof document === 'string') return '';
  return document.fileUrl || document.url || '';
}

export default function HRLeaveManagement() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [departmentError, setDepartmentError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [activeStatus, setActiveStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedLeaveType, setSelectedLeaveType] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  const [confirmation, setConfirmation] = useState(null);
  const [confirmationError, setConfirmationError] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  async function fetchPageData() {
    setLoading(true);
    setError('');
    setDepartmentError('');

    const [requestsResult, departmentsResult] = await Promise.allSettled([
      getAllLeaveRequests(),
      getAllDepartments(),
    ]);

    if (requestsResult.status === 'fulfilled') {
      setLeaveRequests(
        Array.isArray(requestsResult.value) ? requestsResult.value : [],
      );
    } else {
      setLeaveRequests([]);
      setError(
        requestsResult.reason?.message || 'Failed to load company leave requests.',
      );
    }

    if (departmentsResult.status === 'fulfilled') {
      setDepartments(getDepartmentArray(departmentsResult.value));
    } else {
      setDepartments([]);
      setDepartmentError(
        departmentsResult.reason?.message ||
          'Departments could not be loaded. Other filters still work.',
      );
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchPageData();
  }, []);

  const departmentMap = useMemo(() => {
    return new Map(
      departments.map((department) => [
        getDepartmentId(department),
        getDepartmentLabel(department),
      ]),
    );
  }, [departments]);

  function getRequestDepartmentName(request) {
    const department = request?.employee?.department;

    if (department && typeof department === 'object') {
      return (
        department.departmentName ||
        department.name ||
        departmentMap.get(getDepartmentId(department)) ||
        'Unassigned'
      );
    }

    return departmentMap.get(getDepartmentId(department)) || 'Unassigned';
  }

  const summary = useMemo(() => {
    return leaveRequests.reduce(
      (counts, request) => {
        const status = String(request.status || '').toLowerCase();

        if (Object.prototype.hasOwnProperty.call(counts, status)) {
          counts[status] += 1;
        }

        return counts;
      },
      { pending: 0, approved: 0, rejected: 0, cancelled: 0 },
    );
  }, [leaveRequests]);

  const leaveTypes = useMemo(() => {
    return [
      ...new Set(leaveRequests.map(getLeaveTypeName).filter(Boolean)),
    ].sort((first, second) => first.localeCompare(second));
  }, [leaveRequests]);

  const years = useMemo(() => {
    return [
      ...new Set(
        leaveRequests
          .map((request) => {
            const date = new Date(request.startDate);
            return Number.isNaN(date.getTime()) ? null : date.getUTCFullYear();
          })
          .filter(Boolean),
      ),
    ].sort((first, second) => second - first);
  }, [leaveRequests]);

  const filteredRequests = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return leaveRequests
      .filter((request) => {
        const status = String(request.status || '').toLowerCase();
        const employeeName = getEmployeeName(request).toLowerCase();
        const employeeCode = getEmployeeCode(request).toLowerCase();
        const leaveType = getLeaveTypeName(request);
        const departmentId = getDepartmentId(request?.employee?.department);
        const requestStartDate = request.startDate
          ? new Date(request.startDate)
          : null;
        const requestEndDate = request.endDate ? new Date(request.endDate) : null;

        const matchesStatus = activeStatus === 'all' || status === activeStatus;
        const matchesSearch =
          !normalizedSearch ||
          employeeName.includes(normalizedSearch) ||
          employeeCode.includes(normalizedSearch);
        const matchesDepartment =
          selectedDepartment === 'all' || departmentId === selectedDepartment;
        const matchesLeaveType =
          selectedLeaveType === 'all' || leaveType === selectedLeaveType;
        const matchesYear =
          selectedYear === 'all' ||
          requestStartDate?.getUTCFullYear() === Number(selectedYear);
        const matchesStartDate =
          !startDate ||
          (requestEndDate &&
            requestEndDate >= new Date(`${startDate}T00:00:00.000Z`));
        const matchesEndDate =
          !endDate ||
          (requestStartDate &&
            requestStartDate <= new Date(`${endDate}T23:59:59.999Z`));

        return (
          matchesStatus &&
          matchesSearch &&
          matchesDepartment &&
          matchesLeaveType &&
          matchesYear &&
          matchesStartDate &&
          matchesEndDate
        );
      })
      .sort((first, second) => {
        const firstPending = first.status === 'pending' ? 1 : 0;
        const secondPending = second.status === 'pending' ? 1 : 0;

        if (firstPending !== secondPending) {
          return secondPending - firstPending;
        }

        return new Date(second.createdAt || 0) - new Date(first.createdAt || 0);
      });
  }, [
    activeStatus,
    endDate,
    leaveRequests,
    searchTerm,
    selectedDepartment,
    selectedLeaveType,
    selectedYear,
    startDate,
  ]);

  const hasActiveFilters =
    searchTerm ||
    selectedDepartment !== 'all' ||
    selectedLeaveType !== 'all' ||
    selectedYear !== 'all' ||
    startDate ||
    endDate;

  function clearFilters() {
    setSearchTerm('');
    setSelectedDepartment('all');
    setSelectedLeaveType('all');
    setSelectedYear('all');
    setStartDate('');
    setEndDate('');
  }

  async function openRequestDetails(request) {
    setSelectedRequest(request);
    setDetailsLoading(true);
    setDetailsError('');

    try {
      const requestDetails = await getLeaveRequestById(request._id);

      setSelectedRequest({
        ...request,
        ...requestDetails,
        employee: {
          ...request.employee,
          ...requestDetails.employee,
        },
      });
    } catch (requestError) {
      setDetailsError(
        requestError.message || 'Failed to load the leave request details.',
      );
    } finally {
      setDetailsLoading(false);
    }
  }

  function closeDetails() {
    if (processingAction) return;
    setSelectedRequest(null);
    setDetailsError('');
  }

  function openConfirmation(action, request) {
    setConfirmation({ action, request });
    setConfirmationError('');
  }

  function closeConfirmation() {
    if (processingAction) return;
    setConfirmation(null);
    setConfirmationError('');
  }

  async function handleConfirmedAction() {
    if (!confirmation) return;

    const { action, request } = confirmation;

    const isOverride = action.startsWith('override-');
    const isApproval =
      action === 'approve' || action === 'override-approve';

    try {
      setProcessingAction(true);
      setConfirmationError('');
      setSuccessMessage('');

      let updatedRequest;

      if (isOverride) {
        updatedRequest = await overrideLeaveRequest(
          request._id,
          isApproval ? 'approved' : 'rejected',
        );
      } else if (isApproval) {
        updatedRequest = await approveLeaveRequest(request._id);
      } else {
        updatedRequest = await rejectLeaveRequest(request._id);
      }

      const nextStatus =
        updatedRequest?.status ||
        (isApproval ? 'approved' : 'rejected');

      const nextActionedAt =
        updatedRequest?.actionedAt || new Date().toISOString();

      setLeaveRequests((currentRequests) =>
        currentRequests.map((currentRequest) =>
          currentRequest._id === request._id
            ? {
                ...currentRequest,
                status: nextStatus,
                actionedAt: nextActionedAt,
                actionedBy: updatedRequest?.actionedBy,
                totalDays:
                  updatedRequest?.totalDays ??
                  currentRequest.totalDays,
              }
            : currentRequest,
        ),
      );

      setSelectedRequest((currentRequest) =>
        currentRequest?._id === request._id
          ? {
              ...currentRequest,
              status: nextStatus,
              actionedAt: nextActionedAt,
              actionedBy: updatedRequest?.actionedBy,
              totalDays:
                updatedRequest?.totalDays ??
                currentRequest.totalDays,
            }
          : currentRequest,
      );

      setSuccessMessage(
        `${getEmployeeName(request)}'s leave request was ${nextStatus}.`,
      );

      setConfirmation(null);
    } catch (requestError) {
      setConfirmationError(
        requestError.message || 'Failed to update this leave request.',
      );
    } finally {
      setProcessingAction(false);
    }
  }

  return (
    <div className="manager-leave-page hr-leave-page">
      <header className="manager-leave-header">
        <div>
          <h1 className="manager-leave-title">
            <ShieldCheck className="manager-leave-title-icon" />
            <span>Leave Management</span>
          </h1>
          <p className="manager-leave-subtitle">
            Review leave requests submitted across all departments.
          </p>
        </div>

        <button
          type="button"
          className="manager-leave-refresh-button"
          onClick={fetchPageData}
          disabled={loading}
        >
          <RefreshCw className={loading ? 'manager-leave-spin' : ''} />
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </header>

      <section className="manager-leave-summary-grid" aria-label="Leave summary">
        <article className="manager-leave-summary-card manager-leave-summary-card--pending">
          <div className="manager-leave-summary-icon">
            <ListChecks />
          </div>
          <div>
            <span className="manager-leave-summary-label">Pending</span>
            <strong className="manager-leave-summary-value">{summary.pending}</strong>
            <span className="manager-leave-summary-note">Awaiting review</span>
          </div>
        </article>

        <article className="manager-leave-summary-card manager-leave-summary-card--approved">
          <div className="manager-leave-summary-icon">
            <CheckCircle2 />
          </div>
          <div>
            <span className="manager-leave-summary-label">Approved</span>
            <strong className="manager-leave-summary-value">{summary.approved}</strong>
            <span className="manager-leave-summary-note">Approved requests</span>
          </div>
        </article>

        <article className="manager-leave-summary-card manager-leave-summary-card--rejected">
          <div className="manager-leave-summary-icon">
            <XCircle />
          </div>
          <div>
            <span className="manager-leave-summary-label">Rejected</span>
            <strong className="manager-leave-summary-value">{summary.rejected}</strong>
            <span className="manager-leave-summary-note">Rejected requests</span>
          </div>
        </article>

        <article className="manager-leave-summary-card manager-leave-summary-card--cancelled">
          <div className="manager-leave-summary-icon">
            <Ban />
          </div>
          <div>
            <span className="manager-leave-summary-label">Cancelled</span>
            <strong className="manager-leave-summary-value">{summary.cancelled}</strong>
            <span className="manager-leave-summary-note">Cancelled requests</span>
          </div>
        </article>
      </section>

      {error && (
        <div className="manager-leave-alert manager-leave-alert--error" role="alert">
          <AlertTriangle />
          <span>{error}</span>
        </div>
      )}

      {departmentError && (
        <div className="manager-leave-alert manager-leave-alert--error" role="alert">
          <Building2 />
          <span>{departmentError}</span>
        </div>
      )}

      {successMessage && (
        <div
          className="manager-leave-alert manager-leave-alert--success"
          role="status"
        >
          <CheckCircle2 />
          <span>{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage('')}
            aria-label="Dismiss success message"
          >
            <X />
          </button>
        </div>
      )}

      <section className="manager-leave-content-card">
        <div className="manager-leave-tabs" role="tablist" aria-label="Request status">
          {STATUS_TABS.map((tab) => {
            const count =
              tab.value === 'all' ? leaveRequests.length : summary[tab.value];

            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={activeStatus === tab.value}
                className={`manager-leave-tab ${
                  activeStatus === tab.value ? 'manager-leave-tab--active' : ''
                }`}
                onClick={() => setActiveStatus(tab.value)}
              >
                <span>{tab.label}</span>
                <span className="manager-leave-tab-count">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="manager-leave-filters">
          <div className="manager-leave-search">
            <Search />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search employee name or code"
              aria-label="Search employee name or code"
            />
          </div>

          <div className="manager-leave-filter-field">
            <label htmlFor="hr-leave-department">Department</label>
            <select
              id="hr-leave-department"
              value={selectedDepartment}
              onChange={(event) => setSelectedDepartment(event.target.value)}
              disabled={departments.length === 0}
            >
              <option value="all">All departments</option>
              {departments.map((department) => {
                const departmentId = getDepartmentId(department);

                return (
                  <option key={departmentId} value={departmentId}>
                    {getDepartmentLabel(department)}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="manager-leave-filter-field">
            <label htmlFor="hr-leave-type">Leave Type</label>
            <select
              id="hr-leave-type"
              value={selectedLeaveType}
              onChange={(event) => setSelectedLeaveType(event.target.value)}
            >
              <option value="all">All types</option>
              {leaveTypes.map((leaveType) => (
                <option key={leaveType} value={leaveType}>
                  {leaveType}
                </option>
              ))}
            </select>
          </div>

          <div className="manager-leave-filter-field manager-leave-filter-field--year">
            <label htmlFor="hr-leave-year">Year</label>
            <select
              id="hr-leave-year"
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
            >
              <option value="all">All years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="manager-leave-filter-field">
            <label htmlFor="hr-leave-from">From</label>
            <input
              id="hr-leave-from"
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>

          <div className="manager-leave-filter-field">
            <label htmlFor="hr-leave-to">To</label>
            <input
              id="hr-leave-to"
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="manager-leave-clear-button"
              onClick={clearFilters}
            >
              <X />
              <span>Clear</span>
            </button>
          )}
        </div>

        <div className="manager-leave-results-bar">
          <div>
            <Filter />
            <span>
              Showing <strong>{filteredRequests.length}</strong> of{' '}
              <strong>{leaveRequests.length}</strong> requests
            </span>
          </div>
        </div>

        <div className="manager-leave-table-wrapper">
          <table className="manager-leave-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Leave Type</th>
                <th>Period</th>
                <th>Days</th>
                <th>Submitted</th>
                <th>Status</th>
                <th className="manager-leave-text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="manager-leave-state-cell">
                    <div className="manager-leave-spinner" />
                    <span>Loading company leave requests...</span>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="manager-leave-state-cell">
                    <CalendarDays className="manager-leave-empty-icon" />
                    <strong>No leave requests found</strong>
                    <span>Try changing the selected status or filters.</span>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request._id}>
                    <td>
                      <strong className="manager-leave-employee-name">
                        {getEmployeeName(request)}
                      </strong>
                      <span className="manager-leave-employee-code">
                        {getEmployeeCode(request)}
                      </span>
                    </td>

                    <td>
                      <span className="manager-leave-type-name">
                        {getRequestDepartmentName(request)}
                      </span>
                    </td>

                    <td>
                      <span className="manager-leave-type-name">
                        {getLeaveTypeName(request)}
                      </span>
                    </td>

                    <td>
                      <span className="manager-leave-period">
                        <CalendarDays />
                        <span>
                          {formatDate(request.startDate)} — {formatDate(request.endDate)}
                        </span>
                      </span>
                    </td>

                    <td>
                      <strong className="manager-leave-days">
                        {request.totalDays ?? '—'}
                      </strong>
                    </td>

                    <td>{formatDate(request.createdAt)}</td>

                    <td>
                      <span
                        className={`manager-leave-status ${getStatusClass(
                          request.status,
                        )}`}
                      >
                        {request.status || 'Unknown'}
                      </span>
                    </td>

                    <td className="manager-leave-text-right">
                      <div className="manager-leave-row-actions">
                        <button
                          type="button"
                          className="manager-leave-button manager-leave-button--view"
                          onClick={() => openRequestDetails(request)}
                        >
                          <Eye />
                          <span>View</span>
                        </button>

                        {request.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              className="manager-leave-button manager-leave-button--approve"
                              onClick={() => openConfirmation('approve', request)}
                            >
                              <CheckCircle2 />
                              <span>Approve</span>
                            </button>

                            <button
                              type="button"
                              className="manager-leave-button manager-leave-button--reject"
                              onClick={() => openConfirmation('reject', request)}
                            >
                              <XCircle />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                        {request.status === 'approved' && (
                          <button
                            type="button"
                            className="manager-leave-button manager-leave-button--reject"
                            onClick={() =>
                              openConfirmation('override-reject', request)
                            }
                          >
                            <XCircle />
                            <span>Override</span>
                          </button>
                        )}

                        {request.status === 'rejected' && (
                          <button
                            type="button"
                            className="manager-leave-button manager-leave-button--approve"
                            onClick={() =>
                              openConfirmation('override-approve', request)
                            }
                          >
                            <CheckCircle2 />
                            <span>Override</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedRequest && (
        <div
          className="manager-leave-modal-overlay"
          role="presentation"
          onMouseDown={closeDetails}
        >
          <section
            className="manager-leave-modal manager-leave-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="hr-leave-details-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="manager-leave-modal-header">
              <div>
                <h2 id="hr-leave-details-title">Leave Request Details</h2>
                <p>Review the employee and request information.</p>
              </div>

              <button
                type="button"
                className="manager-leave-modal-close"
                onClick={closeDetails}
                aria-label="Close leave request details"
              >
                <X />
              </button>
            </header>

            <div className="manager-leave-modal-body">
              {detailsError && (
                <div className="manager-leave-alert manager-leave-alert--error">
                  <AlertTriangle />
                  <span>{detailsError}</span>
                </div>
              )}

              {detailsLoading ? (
                <div className="manager-leave-details-loading">
                  <div className="manager-leave-spinner" />
                  <span>Loading request details...</span>
                </div>
              ) : (
                <>
                  <div className="manager-leave-employee-summary">
                    <div className="manager-leave-avatar">
                      {getEmployeeName(selectedRequest).charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h3>{getEmployeeName(selectedRequest)}</h3>
                      <div className="manager-leave-employee-meta">
                        <span>
                          <Hash />
                          {getEmployeeCode(selectedRequest)}
                        </span>
                        <span>
                          <Building2 />
                          {getRequestDepartmentName(selectedRequest)}
                        </span>
                        {selectedRequest.employee?.jobTitle && (
                          <span>
                            <Briefcase />
                            {selectedRequest.employee.jobTitle}
                          </span>
                        )}
                        {selectedRequest.employee?.workEmail && (
                          <span>
                            <Mail />
                            {selectedRequest.employee.workEmail}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`manager-leave-status ${getStatusClass(
                        selectedRequest.status,
                      )}`}
                    >
                      {selectedRequest.status}
                    </span>
                  </div>

                  <div className="manager-leave-details-grid">
                    <div className="manager-leave-detail-item">
                      <span>Leave Type</span>
                      <strong>{getLeaveTypeName(selectedRequest)}</strong>
                    </div>
                    <div className="manager-leave-detail-item">
                      <span>Total Days</span>
                      <strong>{selectedRequest.totalDays ?? '—'} days</strong>
                    </div>
                    <div className="manager-leave-detail-item">
                      <span>Submitted</span>
                      <strong>{formatDateTime(selectedRequest.createdAt)}</strong>
                    </div>
                    <div className="manager-leave-detail-item">
                      <span>Start Date</span>
                      <strong>{formatDate(selectedRequest.startDate)}</strong>
                    </div>
                    <div className="manager-leave-detail-item">
                      <span>End Date</span>
                      <strong>{formatDate(selectedRequest.endDate)}</strong>
                    </div>
                    <div className="manager-leave-detail-item">
                      <span>Last Action</span>
                      <strong>{formatDateTime(selectedRequest.actionedAt)}</strong>
                    </div>
                  </div>

                  <div className="manager-leave-detail-section">
                    <h3>Employee Note</h3>
                    <p>{selectedRequest.note || 'No note was provided.'}</p>
                  </div>

                  <div className="manager-leave-detail-section">
                    <h3>Supporting Document</h3>
                    {getDocumentUrl(selectedRequest.document) ? (
                      <a
                        className="manager-leave-document-link"
                        href={getDocumentUrl(selectedRequest.document)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <FileText />
                        <span>View supporting document</span>
                      </a>
                    ) : selectedRequest.document ? (
                      <div className="manager-leave-document-attached">
                        <FileText />
                        <span>Supporting document attached</span>
                      </div>
                    ) : (
                      <p>No supporting document was attached.</p>
                    )}
                  </div>
                </>
              )}
            </div>

            <footer className="manager-leave-modal-footer">
              <button
                type="button"
                className="manager-leave-modal-button manager-leave-modal-button--secondary"
                onClick={closeDetails}
              >
                Close
              </button>

              {!detailsLoading && selectedRequest.status === 'pending' && (
                <>
                  <button
                    type="button"
                    className="manager-leave-modal-button manager-leave-modal-button--reject"
                    onClick={() => openConfirmation('reject', selectedRequest)}
                  >
                    <XCircle />
                    Reject
                  </button>
                  <button
                    type="button"
                    className="manager-leave-modal-button manager-leave-modal-button--approve"
                    onClick={() => openConfirmation('approve', selectedRequest)}
                  >
                    <CheckCircle2 />
                    Approve
                  </button>
                </>
              )}
            </footer>
          </section>
        </div>
      )}

      {confirmation && (
        <div
          className="manager-leave-modal-overlay manager-leave-modal-overlay--confirm"
          role="presentation"
          onMouseDown={closeConfirmation}
        >
          <section
            className="manager-leave-modal manager-leave-confirm-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="hr-leave-confirm-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div
              className={`manager-leave-confirm-icon manager-leave-confirm-icon--${confirmation.action}`}
            >
              {confirmation.action === 'approve' ? (
                <CheckCircle2 />
              ) : (
                <XCircle />
              )}
            </div>

            <h2 id="hr-leave-confirm-title">
              {confirmation.action === 'approve'
                ? 'Approve Leave Request?'
                : 'Reject Leave Request?'}
            </h2>

            <p>
              You are about to {confirmation.action}{' '}
              <strong>{getEmployeeName(confirmation.request)}</strong>&apos;s{' '}
              {getLeaveTypeName(confirmation.request)} request for{' '}
              <strong>{confirmation.request.totalDays} days</strong>.
            </p>

            {confirmation.action === 'approve' && (
              <div className="manager-leave-confirm-note">
                Approval deducts leave days and creates the employee&apos;s On Leave
                attendance records.
              </div>
            )}

            {confirmationError && (
              <div className="manager-leave-alert manager-leave-alert--error">
                <AlertTriangle />
                <span>{confirmationError}</span>
              </div>
            )}

            <div className="manager-leave-confirm-actions">
              <button
                type="button"
                className="manager-leave-modal-button manager-leave-modal-button--secondary"
                onClick={closeConfirmation}
                disabled={processingAction}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`manager-leave-modal-button manager-leave-modal-button--${confirmation.action}`}
                onClick={handleConfirmedAction}
                disabled={processingAction}
              >
                {processingAction ? (
                  <div className="manager-leave-button-spinner" />
                ) : confirmation.action === 'approve' ? (
                  <CheckCircle2 />
                ) : (
                  <XCircle />
                )}
                <span>
                  {processingAction
                    ? 'Processing...'
                    : confirmation.action === 'approve'
                      ? 'Confirm Approval'
                      : 'Confirm Rejection'}
                </span>
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
