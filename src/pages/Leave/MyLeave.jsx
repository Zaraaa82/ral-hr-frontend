import React, { useEffect, useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';
import {
  AlertTriangle,
  Ban,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Filter,
  ListChecks,
  Plus,
  RefreshCw,
  Send,
  WalletCards,
  X,
  XCircle,
  Upload
} from 'lucide-react';
import {
  cancelLeaveRequest,
  createLeaveRequest,
  getLeaveRequestById,
  getLeaveRequestOptions,
  getMyLeaveRequests,
} from '../../services/leaveRequestService';
import 'react-datepicker/dist/react-datepicker.css';
import '../../styles/leave/Leave.css';
import '../../styles/leave/MyLeave.css';
import { createDocument } from "../../services/documentService";

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
];

const EMPTY_FORM = {
  leaveType: "",
  startDate: "",
  endDate: "",
  note: "",
  document: "",
  documentFile: null
};

function getLeaveTypeName(request){
  const leaveType = request?.leaveType?.type || request?.type || 'Leave';

  return leaveType.startsWith('Sick (')
    ? leaveType.split('(')[0].trim()
    : leaveType;
}

function normalizeLeaveTypeOption(option){
  const populatedLeaveType =
    option?.leaveType && typeof option.leaveType === 'object'
      ? option.leaveType
      : null;
  const leaveType = populatedLeaveType || option || {};
  const restrictions = option?.restrictions || leaveType.restrictions || {};

  return {
    id: String(
      populatedLeaveType?._id ||
        (typeof option?.leaveType === 'string' ? option.leaveType : '') ||
        option?._id ||
        option?.id ||
        '',
    ),
    name: getLeaveTypeName(leaveType),
    remainingDays:
      option?.totalRemainingDays ??
      option?.availableDays ??
      option?.balance?.remainingDays ??
      leaveType?.remainingDays ??
      null,
    requiresDocument: Boolean(
      option?.requiresDocument ??
        restrictions.requiresDocument ??
        leaveType.requiresDocument,
    ),
  };
}

function getStatusClass(status){
  const normalizedStatus = String(status || '').toLowerCase();

  if(['pending', 'approved', 'rejected', 'cancelled'].includes(normalizedStatus)){
    return `manager-leave-status--${normalizedStatus}`;
  }

  return 'manager-leave-status--default';
}

function formatDate(value){
  if(!value) return '—';

  const date = new Date(value);
  if(Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('en-BH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function formatDateTime(value){
  if(!value) return '—';

  const date = new Date(value);
  if(Number.isNaN(date.getTime())) return '—';

  return date.toLocaleString('en-BH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Bahrain',
  });
}

function getDocumentUrl(document){
  if(!document || typeof document === 'string') return '';
  return document.fileUrl || document.url || '';
}

function getDocumentLabel(document){
  const type = document?.type || 'Supporting document';
  const status = document?.status ? ` · ${document.status}` : '';
  return `${type}${status}`;
}

function getTodayInputValue(){
  const today = new Date();
  return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
    .toISOString()
    .slice(0, 10);
}

function toDatePickerDate(value){
  if(!value) return null;

  const [year, month, day] = String(value).slice(0, 10).split('-').map(Number);

  if(!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function toInputDateValue(value){
  if(!(value instanceof Date) || Number.isNaN(value.getTime())) return '';

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function toReservedDateInterval(range){
  const startDate = new Date(range?.startDate);
  const endDate = new Date(range?.endDate);

  if(Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())){
    return null;
  }

  return {
    start: new Date(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      startDate.getUTCDate(),
    ),
    end: new Date(
      endDate.getUTCFullYear(),
      endDate.getUTCMonth(),
      endDate.getUTCDate(),
    ),
  };
}

function canCancelRequest(request){
  if(!['pending', 'approved'].includes(request?.status)) return false;
  if(!request?.startDate) return false;

  const today = new Date(`${getTodayInputValue()}T00:00:00.000Z`);
  const startDate = new Date(request.startDate);

  return !Number.isNaN(startDate.getTime()) && today < startDate;
}

function rangesOverlap(startDate, endDate, reservedRange){
  const selectedStart = new Date(`${startDate}T00:00:00.000Z`);
  const selectedEnd = new Date(`${endDate}T23:59:59.999Z`);
  const reservedStart = new Date(reservedRange?.startDate);
  const reservedEnd = new Date(reservedRange?.endDate);

  if(
    [selectedStart, selectedEnd, reservedStart, reservedEnd].some((date) =>
      Number.isNaN(date.getTime()),
    )
  ){
    return false;
  }

  return selectedStart <= reservedEnd && selectedEnd >= reservedStart;
}

export default function MyLeave(){
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [options, setOptions] = useState({});
  const [canRequestLeave, setCanRequestLeave] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [activeStatus, setActiveStatus] = useState('all');
  const [selectedLeaveType, setSelectedLeaveType] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [cancelConfirmation, setCancelConfirmation] = useState(null);
  const [cancelError, setCancelError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const [datePickerOpen, setDatePickerOpen] = useState(false);

  async function fetchPageData(){
    setLoading(true);
    setError('');

    const [requestsResult, optionsResult] = await Promise.allSettled([
      getMyLeaveRequests(),
      getLeaveRequestOptions(),
    ]);

    if(requestsResult.status === 'fulfilled'){
      const requestsData = requestsResult.value;
      setLeaveRequests(
        Array.isArray(requestsData)
          ? requestsData
          : Array.isArray(requestsData?.leaveRequests)
            ? requestsData.leaveRequests
            : [],
      );
      setCanRequestLeave(
        typeof requestsData?.canRequestLeave === 'boolean'
          ? requestsData.canRequestLeave
          : true,
      );
    } else {
      setLeaveRequests([]);
      setCanRequestLeave(false);
      setError(
        requestsResult.reason?.message || 'Failed to load your leave requests.',
      );
    }

    if(optionsResult.status === 'fulfilled'){
      setOptions(optionsResult.value || {});
    } else {
      setOptions({});
      setError((currentError) =>
        [
          currentError,
          optionsResult.reason?.message || 'Failed to load leave request options.',
        ]
          .filter(Boolean)
          .join(' '),
      );
    }
    console.log(
  'LEAVE TYPE OPTIONS:',
  JSON.stringify(optionsResult.value?.leaveTypes, null, 2)
);
    setLoading(false);
  }

  useEffect(() => {
    fetchPageData();
  }, []);

  const summary = useMemo(() => {
    return leaveRequests.reduce(
      (counts, request) => {
        const status = String(request.status || '').toLowerCase();

        if(Object.prototype.hasOwnProperty.call(counts, status)){
          counts[status] += 1;
        }

        return counts;
      },
      { pending: 0, approved: 0, rejected: 0, cancelled: 0 },
    );
  }, [leaveRequests]);

  const leaveTypeOptions = useMemo(() => {
    const source = Array.isArray(options?.leaveTypes) ? options.leaveTypes : [];
    return source.map(normalizeLeaveTypeOption).filter((leaveType) => leaveType.id);
  }, [options]);


  const requestLeaveTypes = useMemo(() => {
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
    return leaveRequests
      .filter((request) => {
        const status = String(request.status || '').toLowerCase();
        const leaveType = getLeaveTypeName(request);
        const requestDate = new Date(request.startDate);

        const matchesStatus = activeStatus === 'all' || status === activeStatus;
        const matchesLeaveType =
          selectedLeaveType === 'all' || leaveType === selectedLeaveType;
        const matchesYear =
          selectedYear === 'all' ||
          (!Number.isNaN(requestDate.getTime()) &&
            requestDate.getUTCFullYear() === Number(selectedYear));

        return matchesStatus && matchesLeaveType && matchesYear;
      })
      .sort(
        (first, second) =>
          new Date(second.createdAt || 0) - new Date(first.createdAt || 0),
      );
  }, [activeStatus, leaveRequests, selectedLeaveType, selectedYear]);

  const selectedFormLeaveType = useMemo(() => {
    return leaveTypeOptions.find(
      (leaveType) => leaveType.id === formData.leaveType,
    );
  }, [formData.leaveType, leaveTypeOptions]);

  const reservedDateIntervals = useMemo(() => {
    const ranges = Array.isArray(options?.reservedDateRanges)
      ? options.reservedDateRanges
      : [];

    return ranges.map(toReservedDateInterval).filter(Boolean);
  }, [options]);

  const canOpenRequestDialog =
    canRequestLeave &&
    options?.canRequestForYear !== false &&
    leaveTypeOptions.length > 0;

  function openRequestDialog(){
    if(!canOpenRequestDialog) return;
    setFormData(EMPTY_FORM);
    setFormError('');
    setRequestDialogOpen(true);
  }

  function closeRequestDialog(){
    if(submitting) return;
    setRequestDialogOpen(false);
    setFormData(EMPTY_FORM);
    setFormError('');
  }

  function validateRequestForm(){
    if(!formData.leaveType) return 'Select a leave type.';
    if(!formData.startDate || !formData.endDate){
      return 'Select both the start and end dates.';
    }
    if(formData.endDate < formData.startDate){
      return 'The end date cannot be before the start date.';
    }

    const overlapsReservedRange = (options?.reservedDateRanges || []).some(
      (range) => rangesOverlap(formData.startDate, formData.endDate, range),
    );

    if(overlapsReservedRange){
      return 'The selected period overlaps another pending or approved request.';
    }
    if(formData.note.trim().length > 500){
      return 'The note cannot exceed 500 characters.';
    }

    if (selectedFormLeaveType?.requiresDocument && !formData.document && !formData.documentFile){
      return "Upload a supporting PDF.";
    }

    if(formData.documentFile &&
      formData.documentFile.type !== "application/pdf" &&
      !formData.documentFile.name.toLowerCase().endsWith(".pdf")
    ){
      return "The supporting document must be a PDF.";
    }


      return '';
    }

  async function handleSubmitRequest(event){
    event.preventDefault();

    const validationError = validateRequestForm();
    if(validationError){
      setFormError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');
      setSuccessMessage('');

      let supportingDocumentId = formData.document;

      if (selectedFormLeaveType?.requiresDocument && !supportingDocumentId) {
        const documentData = new FormData();

        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        documentData.append("expiryDate", expiryDate.toISOString().slice(0, 10));
        documentData.append("type", "Health");
        documentData.append("document", formData.documentFile);

        const documentResponse = await createDocument(documentData);

        supportingDocumentId = documentResponse?.createdDoc?._id;

        if (!supportingDocumentId) {
          throw new Error("The supporting document was not created correctly.");
        }

        setFormData((current) => ({
          ...current,
          document: supportingDocumentId,
        }));
      }

      await createLeaveRequest({
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        note: formData.note.trim() || undefined,
        document: supportingDocumentId || undefined,
      });


      setRequestDialogOpen(false);
      setFormData(EMPTY_FORM);
      setSuccessMessage('Your leave request was submitted successfully.');
      await fetchPageData();
    } catch (requestError){
      setFormError(requestError.message || 'Failed to submit your leave request.');
    } finally {
      setSubmitting(false);
    }
  }

  async function openRequestDetails(request){
    setSelectedRequest(request);
    setDetailsLoading(true);
    setDetailsError('');

    try {
      const requestDetails = await getLeaveRequestById(request._id);
      setSelectedRequest(requestDetails);
    } catch (requestError){
      setDetailsError(
        requestError.message || 'Failed to load the leave request details.',
      );
    } finally {
      setDetailsLoading(false);
    }
  }

  function closeDetails(){
    if(cancelling) return;
    setSelectedRequest(null);
    setDetailsError('');
  }

  function openCancelConfirmation(request){
    setCancelConfirmation(request);
    setCancelError('');
  }

  function closeCancelConfirmation(){
    if(cancelling) return;
    setCancelConfirmation(null);
    setCancelError('');
  }

  async function handleCancelRequest(){
    if(!cancelConfirmation) return;

    try {
      setCancelling(true);
      setCancelError('');
      setSuccessMessage('');

      const cancelledRequest = await cancelLeaveRequest(cancelConfirmation._id);

      setLeaveRequests((currentRequests) =>
        currentRequests.map((request) =>
          request._id === cancelConfirmation._id
            ? {
                ...request,
                ...cancelledRequest,
                status: cancelledRequest?.status || 'cancelled',
              }
            : request,
        ),
      );

      setSelectedRequest((request) =>
        request?._id === cancelConfirmation._id
          ? {
              ...request,
              ...cancelledRequest,
              status: cancelledRequest?.status || 'cancelled',
            }
          : request,
      );

      setCancelConfirmation(null);
      setSuccessMessage('Your leave request was cancelled successfully.');
      await fetchPageData();
    } catch (requestError){
      setCancelError(requestError.message || 'Failed to cancel this request.');
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className='manager-leave-page my-leave-page'>
      <header className='manager-leave-header'>
        <div>
          <h1 className='manager-leave-title'>
            <CalendarDays className='manager-leave-title-icon' />
            <span>My Leave</span>
          </h1>
          <p className='manager-leave-subtitle'>
            Review your balances, submit requests, and track their status.
          </p>
        </div>

        <div className='my-leave-header-actions'>
          <button
            type='button'
            className='manager-leave-refresh-button'
            onClick={fetchPageData}
            disabled={loading}
          >
            <RefreshCw className={loading ? 'manager-leave-spin' : ''} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            type='button'
            className='my-leave-new-button'
            onClick={openRequestDialog}
            disabled={!canOpenRequestDialog || loading}
          >
            <Plus />
            <span>New Request</span>
          </button>
        </div>
      </header>

      {!canOpenRequestDialog && !loading && (
        <div className='my-leave-request-restriction'>
          <AlertTriangle />
          <span>
            {options?.message ||
              'A new leave request is not currently available for your account.'}
          </span>
        </div>
      )}

      <section className='my-leave-balance-section' aria-labelledby='leave-balances-title'>
        <div className='my-leave-section-heading'>
          <div>
            <h2 id='leave-balances-title'>Leave Balances</h2>
            <p>Available balances for {options?.requestedYear || new Date().getUTCFullYear()}.</p>
          </div>
          <WalletCards />
        </div>

        <div className='my-leave-balance-grid'>
          {leaveTypeOptions.length > 0 ? (
            leaveTypeOptions.map((leaveType) => (
              <article key={leaveType.id} className='my-leave-balance-card'>
                <span>{leaveType.name}</span>
                <strong>
                  {leaveType.remainingDays ?? '—'}
                  <small> days</small>
                </strong>
                <p>
                  {leaveType.requiresDocument
                    ? 'Supporting document required'
                    : 'Available to request'}
                </p>
              </article>
            ))
          ) : (
            <div className='my-leave-no-balances'>
              No leave balances are currently available.
            </div>
          )}
        </div>
      </section>

      <section className='manager-leave-summary-grid' aria-label='Request summary'>
        <article className='manager-leave-summary-card manager-leave-summary-card--pending'>
          <div className='manager-leave-summary-icon'><ListChecks /></div>
          <div>
            <span className='manager-leave-summary-label'>Pending</span>
            <strong className='manager-leave-summary-value'>{summary.pending}</strong>
            <span className='manager-leave-summary-note'>Awaiting review</span>
          </div>
        </article>

        <article className='manager-leave-summary-card manager-leave-summary-card--approved'>
          <div className='manager-leave-summary-icon'><CheckCircle2 /></div>
          <div>
            <span className='manager-leave-summary-label'>Approved</span>
            <strong className='manager-leave-summary-value'>{summary.approved}</strong>
            <span className='manager-leave-summary-note'>Approved requests</span>
          </div>
        </article>

        <article className='manager-leave-summary-card manager-leave-summary-card--rejected'>
          <div className='manager-leave-summary-icon'><XCircle /></div>
          <div>
            <span className='manager-leave-summary-label'>Rejected</span>
            <strong className='manager-leave-summary-value'>{summary.rejected}</strong>
            <span className='manager-leave-summary-note'>Rejected requests</span>
          </div>
        </article>

        <article className='manager-leave-summary-card manager-leave-summary-card--cancelled'>
          <div className='manager-leave-summary-icon'><Ban /></div>
          <div>
            <span className='manager-leave-summary-label'>Cancelled</span>
            <strong className='manager-leave-summary-value'>{summary.cancelled}</strong>
            <span className='manager-leave-summary-note'>Cancelled requests</span>
          </div>
        </article>
      </section>

      {error && (
        <div className='manager-leave-alert manager-leave-alert--error' role='alert'>
          <AlertTriangle />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className='manager-leave-alert manager-leave-alert--success' role='status'>
          <CheckCircle2 />
          <span>{successMessage}</span>
          <button type='button' onClick={() => setSuccessMessage('')} aria-label='Dismiss message'>
            <X />
          </button>
        </div>
      )}

      <section className='manager-leave-content-card'>
        <div className='manager-leave-tabs' role='tablist' aria-label='Request status'>
          {STATUS_TABS.map((tab) => {
            const count = tab.value === 'all' ? leaveRequests.length : summary[tab.value];

            return (
              <button
                key={tab.value}
                type='button'
                role='tab'
                aria-selected={activeStatus === tab.value}
                className={`manager-leave-tab ${activeStatus === tab.value ? 'manager-leave-tab--active' : ''}`}
                onClick={() => setActiveStatus(tab.value)}
              >
                <span>{tab.label}</span>
                <span className='manager-leave-tab-count'>{count}</span>
              </button>
            );
          })}
        </div>

        <div className='manager-leave-filters my-leave-filters'>
          <div className='manager-leave-filter-field'>
            <label htmlFor='my-leave-type-filter'>Leave Type</label>
            <select
              id='my-leave-type-filter'
              value={selectedLeaveType}
              onChange={(event) => setSelectedLeaveType(event.target.value)}
            >
              <option value='all'>All types</option>
              {requestLeaveTypes.map((leaveType) => (
                <option key={leaveType} value={leaveType}>{leaveType}</option>
              ))}
            </select>
          </div>

          <div className='manager-leave-filter-field'>
            <label htmlFor='my-leave-year-filter'>Year</label>
            <select
              id='my-leave-year-filter'
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
            >
              <option value='all'>All years</option>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {(selectedLeaveType !== 'all' || selectedYear !== 'all') && (
            <button
              type='button'
              className='manager-leave-clear-button'
              onClick={() => {
                setSelectedLeaveType('all');
                setSelectedYear('all');
              }}
            >
              <X />
              <span>Clear</span>
            </button>
          )}
        </div>

        <div className='manager-leave-results-bar'>
          <div>
            <Filter />
            <span>
              Showing <strong>{filteredRequests.length}</strong> of{' '}
              <strong>{leaveRequests.length}</strong> requests
            </span>
          </div>
        </div>

        <div className='manager-leave-table-wrapper'>
          <table className='manager-leave-table my-leave-table'>
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Period</th>
                <th>Days</th>
                <th>Submitted</th>
                <th>Status</th>
                <th className='manager-leave-text-right'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan='6' className='manager-leave-state-cell'>
                    <div className='manager-leave-spinner' />
                    <span>Loading your leave requests...</span>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan='6' className='manager-leave-state-cell'>
                    <CalendarDays className='manager-leave-empty-icon' />
                    <strong>No leave requests found</strong>
                    <span>Try changing the selected status or filters.</span>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request._id}>
                    <td><span className='manager-leave-type-name'>{getLeaveTypeName(request)}</span></td>
                    <td>
                      <span className='manager-leave-period'>
                        <CalendarDays />
                        <span>{formatDate(request.startDate)} — {formatDate(request.endDate)}</span>
                      </span>
                    </td>
                    <td><strong className='manager-leave-days'>{request.totalDays ?? '—'}</strong></td>
                    <td>{formatDate(request.createdAt)}</td>
                    <td>
                      <span className={`manager-leave-status ${getStatusClass(request.status)}`}>
                        {request.status || 'Unknown'}
                      </span>
                    </td>
                    <td className='manager-leave-text-right'>
                      <div className='manager-leave-row-actions'>
                        <button
                          type='button'
                          className='manager-leave-button manager-leave-button--view'
                          onClick={() => openRequestDetails(request)}
                        >
                          <Eye />
                          <span>View</span>
                        </button>
                        {canCancelRequest(request) && (
                          <button
                            type='button'
                            className='manager-leave-button manager-leave-button--reject'
                            onClick={() => openCancelConfirmation(request)}
                          >
                            <Ban />
                            <span>Cancel</span>
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

      {requestDialogOpen && (
        <div className='manager-leave-modal-overlay' role='presentation' onMouseDown={closeRequestDialog}>
          <section
            className='manager-leave-modal my-leave-request-modal'
            role='dialog'
            aria-modal='true'
            aria-labelledby='my-leave-request-title'
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className='manager-leave-modal-header'>
              <div>
                <h2 id='my-leave-request-title'>Request Leave</h2>
                <p>Submit a new leave request for manager approval.</p>
              </div>
              <button type='button' className='manager-leave-modal-close' onClick={closeRequestDialog} aria-label='Close request form'>
                <X />
              </button>
            </header>

            <form onSubmit={handleSubmitRequest}>
              <div className='manager-leave-modal-body my-leave-form'>
                <div className='my-leave-form-field my-leave-form-field--full'>
                  <label htmlFor='my-leave-request-type'>Leave Type</label>
                  <select
                    id='my-leave-request-type'
                    value={formData.leaveType}
                    onChange={(event) => setFormData((current) => ({ ...current, leaveType: event.target.value, document: '' }))}
                    disabled={submitting}
                  >
                    <option value=''>Select leave type</option>
                    {leaveTypeOptions.map((leaveType) => (
                      <option key={leaveType.id} value={leaveType.id}>
                        {leaveType.name}{leaveType.remainingDays !== null ? ` — ${leaveType.remainingDays} days available` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='my-leave-form-field my-leave-form-field--full'>
                  <label htmlFor='my-leave-period'>Leave Period</label>
                  <div className='my-leave-date-range'>
                    <CalendarDays />
                    <DatePicker
                      id="my-leave-period"
                      selectsRange
                      startDate={toDatePickerDate(formData.startDate)}
                      endDate={toDatePickerDate(formData.endDate)}
                      open={datePickerOpen}
                      onInputClick={() => setDatePickerOpen(true)}
                      onClickOutside={() => setDatePickerOpen(false)}
                      onChange={(dates) => {
                        const [startDate, endDate] = dates;

                        setFormData((current) => ({
                          ...current,
                          startDate: toInputDateValue(startDate),
                          endDate: toInputDateValue(endDate),
                        }));

                        if (startDate && endDate){
                          setDatePickerOpen(false);
                        }
                      }}
                      minDate={toDatePickerDate(getTodayInputValue())}
                      excludeDateIntervals={reservedDateIntervals}
                      monthsShown={2}
                      dateFormat="MMM d, yyyy"
                      placeholderText="Select start and end dates"
                      isClearable
                      disabled={submitting}
                      calendarClassName="my-leave-range-calendar"
                    />
                  </div>
                  <small>
                    Select the first day and last day of your leave. Reserved
                    request dates are disabled.
                  </small>
                </div>

                <div className='my-leave-form-field my-leave-form-field--full'>
                  <label htmlFor='my-leave-note'>Note <span>Optional</span></label>
                  <textarea
                    id='my-leave-note'
                    rows='4'
                    maxLength='500'
                    value={formData.note}
                    onChange={(event) => setFormData((current) => ({ ...current, note: event.target.value }))}
                    placeholder='Add any information your manager should know.'
                    disabled={submitting}
                  />
                  <small>{formData.note.length}/500 characters</small>
                </div>

                {selectedFormLeaveType?.requiresDocument && (
                  <div className="my-leave-form-field my-leave-form-field--full">
                    <label>Supporting PDF</label>

                    <label
                      htmlFor="my-leave-document"
                      className={`my-leave-file-upload ${
                        formData.documentFile ? "my-leave-file-upload--selected" : ""
                      }`}
                    >
                      <span className="my-leave-file-icon">
                        <Upload />
                      </span>

                      <span className="my-leave-file-content">
                        <strong>
                          {formData.documentFile?.name || "Choose supporting document"}
                        </strong>

                        <small>
                          {formData.documentFile
                            ? "PDF selected successfully"
                            : "Upload a PDF file"}
                        </small>
                      </span>

                      <span className="my-leave-file-button">
                        {formData.documentFile ? "Change file" : "Browse"}
                      </span>
                    </label>

                    <input
                      id="my-leave-document"
                      className="my-leave-file-input"
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          document: "",
                          documentFile: event.target.files?.[0] || null,
                        }))
                      }
                      disabled={submitting}
                    />
                  </div>
                )}

                {formError && (
                  <div className='manager-leave-alert manager-leave-alert--error my-leave-form-error'>
                    <AlertTriangle />
                    <span>{formError}</span>
                  </div>
                )}
              </div>

              <footer className='manager-leave-modal-footer'>
                <button type='button' className='manager-leave-modal-button manager-leave-modal-button--secondary' onClick={closeRequestDialog} disabled={submitting}>
                  Cancel
                </button>
                <button type='submit' className='manager-leave-modal-button my-leave-submit-button' disabled={submitting}>
                  {submitting ? <div className='manager-leave-button-spinner' /> : <Send />}
                  <span>{submitting ? 'Submitting...' : 'Submit Request'}</span>
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}

      {selectedRequest && (
        <div className='manager-leave-modal-overlay' role='presentation' onMouseDown={closeDetails}>
          <section
            className='manager-leave-modal manager-leave-details-modal'
            role='dialog'
            aria-modal='true'
            aria-labelledby='my-leave-details-title'
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className='manager-leave-modal-header'>
              <div>
                <h2 id='my-leave-details-title'>Leave Request Details</h2>
                <p>Review your submitted request information.</p>
              </div>
              <button type='button' className='manager-leave-modal-close' onClick={closeDetails} aria-label='Close details'>
                <X />
              </button>
            </header>

            <div className='manager-leave-modal-body'>
              {detailsError && (
                <div className='manager-leave-alert manager-leave-alert--error'>
                  <AlertTriangle />
                  <span>{detailsError}</span>
                </div>
              )}

              {detailsLoading ? (
                <div className='manager-leave-details-loading'>
                  <div className='manager-leave-spinner' />
                  <span>Loading request details...</span>
                </div>
              ) : (
                <>
                  <div className='my-leave-details-summary'>
                    <div className='my-leave-details-summary-icon'><Clock3 /></div>
                    <div>
                      <h3>{getLeaveTypeName(selectedRequest)}</h3>
                      <p>{formatDate(selectedRequest.startDate)} — {formatDate(selectedRequest.endDate)}</p>
                    </div>
                    <span className={`manager-leave-status ${getStatusClass(selectedRequest.status)}`}>
                      {selectedRequest.status}
                    </span>
                  </div>

                  <div className='manager-leave-details-grid'>
                    <div className='manager-leave-detail-item'><span>Leave Type</span><strong>{getLeaveTypeName(selectedRequest)}</strong></div>
                    <div className='manager-leave-detail-item'><span>Total Days</span><strong>{selectedRequest.totalDays ?? '—'} days</strong></div>
                    <div className='manager-leave-detail-item'><span>Submitted</span><strong>{formatDateTime(selectedRequest.createdAt)}</strong></div>
                    <div className='manager-leave-detail-item'><span>Start Date</span><strong>{formatDate(selectedRequest.startDate)}</strong></div>
                    <div className='manager-leave-detail-item'><span>End Date</span><strong>{formatDate(selectedRequest.endDate)}</strong></div>
                    <div className='manager-leave-detail-item'><span>Last Action</span><strong>{formatDateTime(selectedRequest.actionedAt)}</strong></div>
                  </div>

                  <div className='manager-leave-detail-section'>
                    <h3>Your Note</h3>
                    <p>{selectedRequest.note || 'No note was provided.'}</p>
                  </div>

                  <div className='manager-leave-detail-section'>
                    <h3>Supporting Document</h3>
                    {getDocumentUrl(selectedRequest.document) ? (
                      <a className='manager-leave-document-link' href={getDocumentUrl(selectedRequest.document)} target='_blank' rel='noreferrer'>
                        <FileText />
                        <span>View supporting document</span>
                      </a>
                    ) : selectedRequest.document ? (
                      <div className='manager-leave-document-attached'><FileText /><span>Supporting document attached</span></div>
                    ) : (
                      <p>No supporting document was attached.</p>
                    )}
                  </div>
                </>
              )}
            </div>

            <footer className='manager-leave-modal-footer'>
              <button type='button' className='manager-leave-modal-button manager-leave-modal-button--secondary' onClick={closeDetails}>Close</button>
              {!detailsLoading && canCancelRequest(selectedRequest) && (
                <button type='button' className='manager-leave-modal-button manager-leave-modal-button--reject' onClick={() => openCancelConfirmation(selectedRequest)}>
                  <Ban />
                  Cancel Request
                </button>
              )}
            </footer>
          </section>
        </div>
      )}

      {cancelConfirmation && (
        <div className='manager-leave-modal-overlay manager-leave-modal-overlay--confirm' role='presentation' onMouseDown={closeCancelConfirmation}>
          <section
            className='manager-leave-modal manager-leave-confirm-modal'
            role='alertdialog'
            aria-modal='true'
            aria-labelledby='my-leave-cancel-title'
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className='manager-leave-confirm-icon manager-leave-confirm-icon--reject'><Ban /></div>
            <h2 id='my-leave-cancel-title'>Cancel Leave Request?</h2>
            <p>
              You are about to cancel your {getLeaveTypeName(cancelConfirmation)} request for{' '}
              <strong>{cancelConfirmation.totalDays} days</strong>.
            </p>
            {cancelConfirmation.status === 'approved' && (
              <div className='manager-leave-confirm-note'>
                The deducted leave days will be returned and the generated attendance records will be removed.
              </div>
            )}
            {cancelError && (
              <div className='manager-leave-alert manager-leave-alert--error'>
                <AlertTriangle />
                <span>{cancelError}</span>
              </div>
            )}
            <div className='manager-leave-confirm-actions'>
              <button type='button' className='manager-leave-modal-button manager-leave-modal-button--secondary' onClick={closeCancelConfirmation} disabled={cancelling}>Keep Request</button>
              <button type='button' className='manager-leave-modal-button manager-leave-modal-button--reject' onClick={handleCancelRequest} disabled={cancelling}>
                {cancelling ? <div className='manager-leave-button-spinner' /> : <Ban />}
                <span>{cancelling ? 'Cancelling...' : 'Confirm Cancellation'}</span>
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
