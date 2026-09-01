


import { useEffect, useState } from "react";
import {
  createLeaveRequest,
  getLeaveRequestOptions,
  getMyLeaveRequests,
  cancelLeaveRequest,
} from "../../services/leaveRequestService";

import { createDocument } from "../../services/documentService";

import {
  Plus,
  Search,
  X,
  Upload,
  FileText,
} from "lucide-react";

function MyLeave() {
  const [leaves, setLeaves] = useState([]);
  const [canRequest, setCanRequest] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState({});

  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedLeave, setSelectedLeave] = useState(null);

  const initialForm = {
    leaveType: "",
    startDate: "",
    endDate: "",
    note: "",
    document: null,
  };

  const [formData, setFormData] = useState(initialForm);

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function loadMyLeaves() {
    try {
      setError(null);
      setLoading(true);

      const { leaveRequests, canRequestLeave } =
        await getMyLeaveRequests();

      setLeaves(leaveRequests || []);
      setCanRequest(canRequestLeave);

      const leaveOptions = await getLeaveRequestOptions();

      setOptions(leaveOptions || {});
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load leave requests.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMyLeaves();
  }, []);

  function resetRequestForm() {
    setFormData(initialForm);
    setSubmitError(null);
  }

  function handleRequestDialogChange(open) {
    setRequestDialogOpen(open);

    if (!open) {
      resetRequestForm();
    }
  }

  const selectedLeaveType = options.leaveTypes?.find(
    (type) => type._id === formData.leaveType,
  );

  function validateForm() {
    if (!formData.leaveType) {
      return "Please select a leave type.";
    }

    if (!formData.startDate || !formData.endDate) {
      return "Please select a leave period.";
    }

    if (
      new Date(formData.endDate) <
      new Date(formData.startDate)
    ) {
      return "End date cannot be before start date.";
    }

    if (formData.note.length > 500) {
      return "Note cannot exceed 500 characters.";
    }

    if (!selectedLeaveType) {
      return "Please select an eligible leave type.";
    }

    if (
      selectedLeaveType?.restrictions?.requiresDocument &&
      !formData.document
    ) {
      return "A supporting document is required for this leave type.";
    }

    return null;
  }

  async function handleSubmitLeave(event) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    try {
      setSubmitError(null);
      setSubmitting(true);

      let documentId = null;

      if (formData.document) {
        const documentData = new FormData();

        const expiryDate = new Date();
        expiryDate.setFullYear(
          expiryDate.getFullYear() + 1,
        );

        documentData.append(
          "document",
          formData.document,
        );

        documentData.append("type", "Health");

        documentData.append(
          "expiryDate",
          expiryDate.toISOString().split("T")[0],
        );

        const { createdDoc } =
          await createDocument(documentData);

        documentId = createdDoc._id;
      }

      await createLeaveRequest({
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        note: formData.note,
        document: documentId,
      });

      await loadMyLeaves();

      resetRequestForm();

      setRequestDialogOpen(false);
    } catch (error) {
      setSubmitError(
        error.response?.data?.message ||
          error.message ||
          "Failed to submit leave request.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancelLeave() {
    if (!selectedLeave) return;

    try {
      setCancelling(true);
      setCancelError(null);

      await cancelLeaveRequest(selectedLeave._id);

      await loadMyLeaves();

      setCancelDialogOpen(false);
      setSelectedLeave(null);
    } catch (error) {
      setCancelError(
        error.response?.data?.message ||
          error.message ||
          "Failed to cancel leave request.",
      );
    } finally {
      setCancelling(false);
    }
  }

  const canCancelSelectedLeave =
    selectedLeave &&
    ["pending", "approved"].includes(
      selectedLeave.status,
    ) &&
    new Date() < new Date(selectedLeave.startDate);

  const filteredLeaves = leaves.filter((leave) => {
    const leaveType = String(
      leave.leaveType?.type || "",
    ).toLowerCase();

    const matchesSearch = leaveType.includes(
      search.toLowerCase(),
    );

    const matchesStatus =
      statusFilter === "all" ||
      leave.status === statusFilter;

    const matchesLeaveType =
      leaveTypeFilter === "all" ||
      leave.leaveType?._id === leaveTypeFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesLeaveType
    );
  });

  function getStatusStyle(status) {
    switch (status) {
      case "approved":
        return "bg-green-50 text-green-700 border-green-200";

      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";

      case "rejected":
        return "bg-red-50 text-red-700 border-red-200";

      case "cancelled":
        return "bg-gray-100 text-gray-600 border-gray-200";

      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  }

  const leaveTypeFilterOptions = [
    ...new Map(
      leaves.map((leave) => [
        leave.leaveType?._id,
        leave.leaveType,
      ]),
    ).values(),
  ].filter(Boolean);

  return (
    <main className="mx-auto max-w-[1380px] p-6 text-ral-mid">

      {/* ================= HEADER ================= */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-semibold text-ral-ink">
            My Leave
          </h1>

          <p className="mt-1 text-ral-mid">
            View your leave balances and manage your leave requests.
          </p>
        </div>

        <button
          type="button"
          disabled={!canRequest}
          onClick={() => setRequestDialogOpen(true)}
          className="
            flex items-center justify-center gap-2
            rounded-lg bg-ink px-5 py-3
            font-semibold text-lavender
            transition hover:opacity-90
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <Plus size={18} />

          Request Leave
        </button>

      </div>


      {/* ================= LEAVE BALANCES ================= */}

      <section className="mb-10">

        <div className="mb-4">

          <h2 className="text-lg font-semibold text-ral-ink">
            Leave Balances
          </h2>

          <p className="text-sm text-ral-soft">
            Your available leave balances for{" "}
            {options.requestedYear || new Date().getFullYear()}.
          </p>

        </div>


        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {options.leaveTypes?.length > 0 ? (

            options.leaveTypes.map((leaveType) => (

              <div
                key={leaveType._id}
                className="
                  rounded-xl border border-ral-rule
                  bg-white p-6 shadow-sm
                "
              >

                <p className="text-sm font-semibold text-ral-soft">
                  {leaveType.displayName}
                </p>

                <div className="mt-3 flex items-baseline gap-2">

                  <span className="text-3xl font-bold text-ral-ink">

                    {leaveType.totalRemainingDays}

                  </span>

                  <span className="text-sm text-ral-soft">
                    days remaining
                  </span>

                </div>

              </div>

            ))

          ) : (

            <p className="text-sm text-ral-soft">
              No leave balances available.
            </p>

          )}

        </div>

      </section>


      {/* ================= LEAVE REQUESTS ================= */}

      <section>

        <div className="mb-4">

          <h2 className="text-lg font-semibold text-ral-ink">
            My Leave Requests
          </h2>

          <p className="text-sm text-ral-soft">
            Track and manage your submitted leave requests.
          </p>

        </div>


        {/* STATUS FILTER */}

        <div className="mb-4 flex flex-wrap gap-2">

          {[
            "all",
            "pending",
            "approved",
            "rejected",
            "cancelled",
          ].map((status) => (

            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`
                rounded-lg px-4 py-2 text-sm font-semibold
                transition
                ${
                  statusFilter === status
                    ? "bg-ink text-lavender"
                    : "border border-ral-rule bg-white text-ral-mid hover:bg-gray-50"
                }
              `}
            >

              {status === "all"
                ? "All"
                : status.charAt(0).toUpperCase() +
                  status.slice(1)}

            </button>

          ))}

        </div>


        {/* SEARCH + FILTER */}

        <div
          className="
            mb-6 flex flex-col gap-3
            rounded-xl border border-ral-rule
            bg-white p-4 shadow-sm
            sm:flex-row sm:items-center sm:justify-between
          "
        >

          <div className="relative w-full sm:max-w-sm">

            <Search
              size={18}
              className="
                absolute left-3 top-1/2
                -translate-y-1/2
                text-ral-soft
              "
            />

            <input
              type="text"
              placeholder="Search leave requests..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              className="
                w-full rounded-lg
                border border-ral-rule
                bg-white py-2.5 pl-10 pr-4
                outline-none
                focus:ring-2 focus:ring-lavender
              "
            />

          </div>


          <select
            value={leaveTypeFilter}
            onChange={(event) =>
              setLeaveTypeFilter(event.target.value)
            }
            className="
              w-full rounded-lg
              border border-ral-rule
              bg-white px-4 py-2.5
              outline-none
              sm:w-[220px]
              focus:ring-2 focus:ring-lavender
            "
          >

            <option value="all">
              All leave types
            </option>

            {leaveTypeFilterOptions.map((leaveType) => (

              <option
                key={leaveType._id}
                value={leaveType._id}
              >
                {leaveType.type}
              </option>

            ))}

          </select>

        </div>


        {/* ================= TABLE ================= */}

        <div
          className="
            overflow-x-auto rounded-xl
            border border-ral-rule
            bg-white shadow-sm
          "
        >

          <table className="w-full min-w-[850px]">

            <thead className="bg-gray-50">

              <tr>

                {[
                  "Leave Type",
                  "Start Date",
                  "End Date",
                  "Days",
                  "Status",
                  "Submitted",
                  "Action",
                ].map((heading) => (

                  <th
                    key={heading}
                    className="
                      px-5 py-4 text-left
                      text-xs font-bold uppercase
                      tracking-wide text-ral-soft
                    "
                  >
                    {heading}
                  </th>

                ))}

              </tr>

            </thead>


            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan={7}
                    className="
                      h-32 text-center
                      text-sm text-ral-soft
                    "
                  >
                    Loading leave requests...
                  </td>

                </tr>

              ) : error ? (

                <tr>

                  <td
                    colSpan={7}
                    className="
                      h-32 text-center
                      text-sm text-red-600
                    "
                  >
                    {error}
                  </td>

                </tr>

              ) : filteredLeaves.length === 0 ? (

                <tr>

                  <td
                    colSpan={7}
                    className="
                      h-32 text-center
                      text-sm text-ral-soft
                    "
                  >
                    No leave requests found.
                  </td>

                </tr>

              ) : (

                filteredLeaves.map((leave) => (

                  <tr
                    key={leave._id}
                    className="
                      border-t border-ral-rule
                      transition hover:bg-gray-50
                    "
                  >

                    <td className="px-5 py-4 font-medium text-ral-ink">

                      {leave.leaveType?.type || "N/A"}

                    </td>


                    <td className="px-5 py-4">

                      {new Date(
                        leave.startDate,
                      ).toLocaleDateString()}

                    </td>


                    <td className="px-5 py-4">

                      {new Date(
                        leave.endDate,
                      ).toLocaleDateString()}

                    </td>


                    <td className="px-5 py-4">

                      {leave.totalDays}

                    </td>


                    <td className="px-5 py-4">

                      <span
                        className={`
                          inline-flex rounded-full
                          border px-3 py-1
                          text-xs font-semibold capitalize
                          ${getStatusStyle(leave.status)}
                        `}
                      >
                        {leave.status}
                      </span>

                    </td>


                    <td className="px-5 py-4">

                      {new Date(
                        leave.createdAt,
                      ).toLocaleDateString()}

                    </td>


                    <td className="px-5 py-4">

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedLeave(leave)
                        }
                        className="
                          rounded-lg px-3 py-2
                          text-sm font-semibold text-ral-ink
                          transition hover:bg-gray-100
                        "
                      >
                        View
                      </button>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </section>


      {/* ================= VIEW LEAVE MODAL ================= */}

      {selectedLeave && (

        <div
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-black/40 p-4
          "
        >

          <div
            className="
              w-full max-w-lg
              rounded-2xl bg-white
              p-6 shadow-xl
            "
          >

            <div className="mb-5 flex items-start justify-between">

              <div>

                <h2 className="text-xl font-semibold text-ral-ink">
                  Leave Request Details
                </h2>

                <p className="mt-1 text-sm text-ral-soft">
                  Review the details of your leave request.
                </p>

              </div>


              <button
                type="button"
                onClick={() => setSelectedLeave(null)}
                className="
                  rounded-lg p-2
                  text-ral-soft
                  hover:bg-gray-100
                "
              >
                <X size={20} />
              </button>

            </div>


            <div
              className="
                mb-5 flex items-center
                justify-between border-b
                border-ral-rule pb-4
              "
            >

              <div>

                <p className="text-sm text-ral-soft">
                  Leave Type
                </p>

                <p className="font-medium text-ral-ink">

                  {selectedLeave.leaveType?.type}

                </p>

              </div>


              <span
                className={`
                  rounded-full border px-3 py-1
                  text-xs font-semibold capitalize
                  ${getStatusStyle(selectedLeave.status)}
                `}
              >
                {selectedLeave.status}
              </span>

            </div>


            <div className="grid grid-cols-2 gap-5">

              <div>

                <p className="text-xs font-medium uppercase text-ral-soft">
                  Start Date
                </p>

                <p className="mt-1 font-semibold text-ral-ink">

                  {new Date(
                    selectedLeave.startDate,
                  ).toLocaleDateString()}

                </p>

              </div>


              <div>

                <p className="text-xs font-medium uppercase text-ral-soft">
                  End Date
                </p>

                <p className="mt-1 font-semibold text-ral-ink">

                  {new Date(
                    selectedLeave.endDate,
                  ).toLocaleDateString()}

                </p>

              </div>


              <div>

                <p className="text-xs font-medium uppercase text-ral-soft">
                  Total Days
                </p>

                <p className="mt-1 font-semibold text-ral-ink">

                  {selectedLeave.totalDays} days

                </p>

              </div>


              <div>

                <p className="text-xs font-medium uppercase text-ral-soft">
                  Submitted
                </p>

                <p className="mt-1 font-semibold text-ral-ink">

                  {new Date(
                    selectedLeave.createdAt,
                  ).toLocaleDateString()}

                </p>

              </div>

            </div>


            <div className="mt-5 border-t border-ral-rule pt-5">

              <p className="text-sm text-ral-soft">
                Note
              </p>

              <p className="mt-1 text-sm text-ral-mid">

                {selectedLeave.note || "No note provided."}

              </p>

            </div>


            {cancelError && (

              <p className="mt-4 text-sm text-red-600">
                {cancelError}
              </p>

            )}


            {canCancelSelectedLeave && (

              <div className="mt-6 flex justify-end">

                <button
                  type="button"
                  disabled={cancelling}
                  onClick={() =>
                    setCancelDialogOpen(true)
                  }
                  className="
                    rounded-lg bg-red-600
                    px-4 py-2.5
                    text-sm font-semibold text-white
                    transition hover:bg-red-700
                    disabled:opacity-50
                  "
                >

                  Cancel Leave

                </button>

              </div>

            )}

          </div>

        </div>

      )}


      {/* ================= CANCEL CONFIRMATION ================= */}

      {cancelDialogOpen && (

        <div
          className="
            fixed inset-0 z-[60]
            flex items-center justify-center
            bg-black/50 p-4
          "
        >

          <div
            className="
              w-full max-w-md
              rounded-2xl bg-white
              p-6 shadow-xl
            "
          >

            <h2 className="text-xl font-semibold text-ral-ink">
              Cancel Leave Request?
            </h2>

            <p className="mt-3 text-sm text-ral-soft">

              Are you sure you want to cancel this leave request?
              This action cannot be undone.

            </p>


            {cancelError && (

              <p className="mt-3 text-sm text-red-600">
                {cancelError}
              </p>

            )}


            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                disabled={cancelling}
                onClick={() =>
                  setCancelDialogOpen(false)
                }
                className="
                  rounded-lg border border-ral-rule
                  px-4 py-2.5
                  font-semibold text-ral-mid
                  hover:bg-gray-50
                "
              >
                Keep Request
              </button>


              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelLeave}
                className="
                  rounded-lg bg-red-600
                  px-4 py-2.5
                  font-semibold text-white
                  hover:bg-red-700
                  disabled:opacity-50
                "
              >

                {cancelling
                  ? "Cancelling..."
                  : "Yes, Cancel Leave"}

              </button>

            </div>

          </div>

        </div>

      )}


      {/* ================= REQUEST LEAVE MODAL ================= */}

      {requestDialogOpen && (

        <div
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            overflow-y-auto
            bg-black/40 p-4
          "
        >

          <div
            className="
              my-8 w-full max-w-lg
              rounded-2xl bg-white
              p-6 shadow-xl
            "
          >

            <div className="mb-6 flex justify-between">

              <div>

                <h2 className="text-xl font-semibold text-ral-ink">
                  Request Leave
                </h2>

                <p className="mt-1 text-sm text-ral-soft">
                  Submit a new leave request for approval.
                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  handleRequestDialogChange(false)
                }
                className="
                  rounded-lg p-2
                  text-ral-soft
                  hover:bg-gray-100
                "
              >
                <X size={20} />
              </button>

            </div>


            <form
              onSubmit={handleSubmitLeave}
              className="space-y-5"
            >

              {/* LEAVE TYPE */}

              <div>

                <label className="mb-2 block text-sm font-medium text-ral-mid">
                  Leave Type
                </label>


                <select
                  value={formData.leaveType}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      leaveType: event.target.value,
                    })
                  }
                  className="
                    w-full rounded-lg
                    border border-ral-rule
                    bg-white px-4 py-3
                    outline-none
                    focus:ring-2 focus:ring-lavender
                  "
                >

                  <option value="">
                    Select leave type
                  </option>


                  {options.leaveTypes?.map((type) => (

                    <option
                      key={type._id}
                      value={type._id}
                    >

                      {type.displayName} —{" "}
                      {type.totalRemainingDays} days

                    </option>

                  ))}

                </select>

              </div>


              {/* START DATE */}

              <div>

                <label className="mb-2 block text-sm font-medium text-ral-mid">
                  Start Date
                </label>

                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  min={
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                  onChange={handleInputChange}
                  className="
                    w-full rounded-lg
                    border border-ral-rule
                    px-4 py-3
                    outline-none
                    focus:ring-2 focus:ring-lavender
                  "
                />

              </div>


              {/* END DATE */}

              <div>

                <label className="mb-2 block text-sm font-medium text-ral-mid">
                  End Date
                </label>

                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  min={
                    formData.startDate ||
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                  onChange={handleInputChange}
                  className="
                    w-full rounded-lg
                    border border-ral-rule
                    px-4 py-3
                    outline-none
                    focus:ring-2 focus:ring-lavender
                  "
                />

              </div>


              {/* DOCUMENT */}

              {selectedLeaveType?.restrictions
                ?.requiresDocument && (

                <div>

                  <label className="mb-2 block text-sm font-medium text-ral-mid">

                    Supporting Document{" "}

                    <span className="text-red-600">
                      *
                    </span>

                  </label>


                  {!formData.document ? (

                    <label
                      htmlFor="document"
                      className="
                        flex cursor-pointer
                        flex-col items-center
                        justify-center gap-2
                        rounded-xl border-2
                        border-dashed border-ral-rule
                        p-6 text-center
                        transition hover:bg-gray-50
                      "
                    >

                      <Upload
                        size={24}
                        className="text-ral-ink"
                      />

                      <div>

                        <p className="text-sm font-medium text-ral-ink">
                          Upload supporting document
                        </p>

                        <p className="mt-1 text-xs text-ral-soft">
                          Click to choose a file
                        </p>

                      </div>


                      <input
                        id="document"
                        type="file"
                        className="hidden"
                        onChange={(event) =>
                          setFormData({
                            ...formData,
                            document:
                              event.target.files?.[0] ||
                              null,
                          })
                        }
                      />

                    </label>

                  ) : (

                    <div
                      className="
                        flex items-center
                        justify-between rounded-xl
                        border border-ral-rule
                        bg-gray-50 p-4
                      "
                    >

                      <div className="flex min-w-0 items-center gap-3">

                        <FileText
                          size={20}
                          className="shrink-0 text-ral-ink"
                        />

                        <div className="min-w-0">

                          <p className="truncate text-sm font-medium text-ral-ink">

                            {formData.document.name}

                          </p>

                          <p className="text-xs text-ral-soft">

                            {(
                              formData.document.size / 1024
                            ).toFixed(1)}{" "}
                            KB

                          </p>

                        </div>

                      </div>


                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            document: null,
                          })
                        }
                        className="
                          rounded-lg p-2
                          hover:bg-gray-200
                        "
                      >
                        <X size={18} />
                      </button>

                    </div>

                  )}

                </div>

              )}


              {/* NOTE */}

              <div>

                <label
                  htmlFor="note"
                  className="mb-2 block text-sm font-medium text-ral-mid"
                >
                  Note
                </label>


                <textarea
                  id="note"
                  name="note"
                  rows={4}
                  maxLength={500}
                  value={formData.note}
                  onChange={handleInputChange}
                  placeholder="Add a note..."
                  className="
                    w-full resize-none
                    rounded-lg border border-ral-rule
                    px-4 py-3
                    outline-none
                    focus:ring-2 focus:ring-lavender
                  "
                />

              </div>


              {submitError && (

                <p className="text-sm text-red-600">
                  {submitError}
                </p>

              )}


              {/* ACTIONS */}

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={() =>
                    handleRequestDialogChange(false)
                  }
                  className="
                    rounded-lg border border-ral-rule
                    px-5 py-3
                    font-semibold text-ral-mid
                    transition hover:bg-gray-50
                  "
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={
                    submitting ||
                    !formData.leaveType ||
                    !formData.startDate ||
                    !formData.endDate
                  }
                  className="
                    rounded-lg bg-ink
                    px-5 py-3
                    font-semibold text-lavender
                    transition hover:opacity-90
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >

                  {submitting
                    ? "Submitting..."
                    : "Submit Request"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </main>
  );
}

export default MyLeave;



// import { useEffect, useState } from "react";
// import {
//   createLeaveRequest,
//   getLeaveRequestOptions,
//   getMyLeaveRequests,
//   cancelLeaveRequest
// } from "../../services/leaveRequestService";
// import { createDocument } from "../../services/documentService";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

// import {
//   Tabs,
//   TabsList,
//   TabsTrigger,
// } from "@/components/ui/tabs";

// import { Input } from "@/components/ui/input";

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// import {
//     Table,
//     TableBody,
//     TableCell,
//     TableHead,
//     TableHeader,
//     TableRow,
// } from "@/components/ui/table";

// import { Badge } from "@/components/ui/badge";

// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";

// import { Calendar } from "@/components/ui/calendar";

// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";

// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";

// import {
//   Plus,
//   Search,
//   CalendarIcon,
  
// } from "lucide-react";
// import {
//   Upload,
//   FileText,
//   X,
//   Info,
// } from "lucide-react";



// function MyLeave(){
//     const [leaves, setLeaves] = useState([]);
//     const [canRequest, setCanRequest] = useState(false);
//     const [error, setError] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [options, setOptions] = useState({});

//     const [submitError, setSubmitError] = useState(null);
//     const [submitting, setSubmitting] = useState(false);

//     const [cancelling, setCancelling] = useState(false);
//     const [cancelError, setCancelError] = useState(null);

    
//     const [requestDialogOpen, setRequestDialogOpen] = useState(false);
//     const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

//     const [search, setSearch] = useState("");
//     const [leaveTypeFilter, setLeaveTypeFilter] = useState("all");
//     const [statusFilter, setStatusFilter] = useState("all");

//     const [selectedLeave, setSelectedLeave] = useState(null);

//     const initialForm = {
//         leaveType: '',
//         startDate: '',
//         endDate: '',
//         note: '',
//         document: ''
//     };
//     const initialRange = {
//         from: null,
//         to: null
//     };

    
//     const [formData, setFormData] = useState(initialForm);
//     const [dateRange, setDateRange] = useState(initialRange);



//     function handelInputChange(event){
//         const {name, value} = event.target;
//         setFormData({...formData, [name]: value});
//     }

//     async function handleSubmitLeave(event){
//         event.preventDefault();

//         const validationError = validateForm();

//         if(validationError){
//             setSubmitError(validationError);
//             return;
//         }
        
//         try{
//             setSubmitError(null);
//             setSubmitting(true);

//             let documentId = null;

//             if (formData.document){
//                 const documentData = new FormData();

//                 const expiryDate = new Date();
//                 expiryDate.setFullYear(expiryDate.getFullYear() + 1);

//                 documentData.append("document", formData.document);
//                 documentData.append("type", "Health");
//                 documentData.append(
//                     "expiryDate",
//                     expiryDate.toISOString().split("T")[0]
//                 );

//                 const { createdDoc } = await createDocument(documentData);
//                 documentId = createdDoc._id;
//             }

//             await createLeaveRequest({
//                 leaveType: formData.leaveType,
//                 startDate: formData.startDate,
//                 endDate: formData.endDate,
//                 note: formData.note,
//                 document: documentId
//             });

//             const { leaveRequests, canRequestLeave } = await getMyLeaveRequests();
            
//             setLeaves(leaveRequests);
//             setCanRequest(canRequestLeave);
//             setOptions(await getLeaveRequestOptions());
//             resetRequestForm();

//             setRequestDialogOpen(false);

//         }catch(error){
//             setSubmitError(error.message);
//         }finally{
//             setSubmitting(false);
//         }
//     }
//     async function handleCancelLeave(){
//         if (!selectedLeave) return;

//         try {
//             setCancelling(true);
//             setCancelError(null);

//             await cancelLeaveRequest(selectedLeave._id);

//             const { leaveRequests, canRequestLeave } = await getMyLeaveRequests();

//             setLeaves(leaveRequests);
//             setCanRequest(canRequestLeave);
//             setOptions(await getLeaveRequestOptions());

//             setCancelDialogOpen(false);
//             setSelectedLeave(null);

//         } catch (error){
//             setCancelError(error.message);
//         } finally {
//             setCancelling(false);
//         }
//     }

//     const canCancelSelectedLeave = selectedLeave && ["pending", "approved"].includes(selectedLeave.status) && new Date() < new Date(selectedLeave.startDate);

//     function validateForm(){
//         if(!formData.leaveType){
//             return 'Please select a leave type.';
//         }

//         if(!formData.startDate || !formData.endDate){
//             return 'Please select a leave period.';
//         }

//         if(formData.endDate < formData.startDate){
//             return 'End date cannot be before start date.';
//         }

//         if(formData.note.length > 500){
//             return 'Note cannot exceed 500 characters.';
//         }

//         if(!selectedLeaveType){
//             return 'Please select an eligible leave type.';
//         }

//         if(selectedLeaveType?.restrictions?.requiresDocument && !formData.document){
//             return 'A supporting document is required for this leave type.';
//         }

//         return null;
//     }

//     useEffect(()=>{
//         async function loadMyLeaves(){
//             try{
//                 setError(null);
//                 setLoading(true);

//                 const {leaveRequests, canRequestLeave} = await getMyLeaveRequests();

//                 setLeaves(leaveRequests);
//                 setCanRequest(canRequestLeave);

//                 setOptions(await getLeaveRequestOptions());
    
//             }catch(error){
//                 setError(error.message);
//             }finally{
//                 setLoading(false);
//             }
//         }
//         loadMyLeaves();
//     },[]);

//     function resetRequestForm(){
//         setFormData(initialForm);
//         setDateRange(initialRange);
//         setSubmitError(null);
//     }
//     function handleRequestDialogChange(open){
//         setRequestDialogOpen(open);

//         if(!open){
//             resetRequestForm();
//         }
//     }

//     const reservedRanges = options.reservedDateRanges?.map((range) => ({
//         from: new Date(range.startDate), to: new Date(range.endDate)
//     })) || [];
//     const selectedLeaveType = options.leaveTypes?.find((type) => type._id === formData.leaveType);
    

//     const filteredLeaves = leaves.filter(leave=>{

//         let leaveType = String(leave.leaveType.type).toLocaleLowerCase();
//         const matchesSearch = leaveType.includes(search.toLocaleLowerCase());
//         const matchesSatatus = statusFilter === 'all' || leave.status === statusFilter;
//         const matchesLeaveType = leaveTypeFilter === 'all' || leave.leaveType._id === leaveTypeFilter;

//         return matchesSearch && matchesSatatus && matchesLeaveType;

//     });

//     function getStatusStyle(status){
//         let className = '';
//         switch(status){
//             case 'approved':
//                 className = 'text-ral-good border-ral-good bg-green-50';
//                 break;

//             case 'pending':
//                 className = 'text-ral-warn border-ral-warn bg-amber-50';
//             break;

//             case 'rejected':
//                 className = 'text-ral-stop border-ral-stop bg-red-50';
//             break;

//             case 'cancelled':
//                 className = 'text-ral-soft border-ral-rule bg-ral-card';
//                 break;
//             default: 
//                 className = 'text-ral-soft border-ral-rule bg-ral-card';
//             break;
    
//         }
//         return className;
//     }

//     const leaveTypeFilterOptions = [...new Map(leaves.map((leave) => [leave.leaveType._id, leave.leaveType])).values()];

    

    
//   return (
//     <div className="mx-auto max-w-[1380px] p-6 text-ral-mid">
//         <div className="space-y-6">
//             <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//                 <div>
//                     <h1 className="text-2xl font-semibold text-ral-ink">My Leave</h1>
//                     <p className="mt-1 text-ral-mid">View your leave balances and manage your leave requests.</p>
//                 </div>
//                 <Button 
//                     disabled={!canRequest}
//                     onClick={() => setRequestDialogOpen(true)}
//                 > <Plus /> Request Leave </Button>

//             </div>


//             <section className="space-y-4">
//                 <div>
//                     <h2 className="text-lg font-semibold text-ral-ink">Leave Balances</h2>
//                     <p className="text-sm text-ral-soft">Your available leave balances for {options.requestedYear}.</p>
//                 </div>

//                 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//                     {options.leaveTypes?.map((leaveType) => (

//                         <Card  key={leaveType._id} className="rounded-2xl border border-ral-rule bg-white shadow-sm">

//                             <CardHeader className="pb-2">
//                                 <CardTitle className="text-sm font-semibold text-ral-soft">{leaveType.displayName}</CardTitle>
//                             </CardHeader>

//                             <CardContent >
//                                 <div className="flex items-baseline gap-2">
//                                     <span className="text-3xl font-bold text-ral-ink tabular-nums">{leaveType.totalRemainingDays}</span>

//                                     <span className="text-sm text-ral-soft">days remaining</span>
//                                 </div>
//                             </CardContent>

//                         </Card>

//                     ))}
//                 </div>
//             </section>


//             <section className="space-y-4">
//                 <div>
//                     <h2 className="text-lg font-semibold text-ral-ink">My Leave Requests</h2>

//                     <p className="text-sm text-ral-soft">Track and manage your submitted leave requests.</p>
//                 </div>

//                 <Tabs value={statusFilter} onValueChange={setStatusFilter}>
//                     <TabsList className="h-auto rounded-xl border border-ral-rule bg-white p-1 shadow-sm">
//                         <TabsTrigger value="all" className="rounded-lg px-4 py-2 text-sm font-semibold">All</TabsTrigger>
//                         <TabsTrigger value="pending" className="rounded-lg px-4 py-2 text-sm font-semibold">Pending</TabsTrigger>
//                         <TabsTrigger value="approved" className="rounded-lg px-4 py-2 text-sm font-semibold">Approved</TabsTrigger>
//                         <TabsTrigger value="rejected" className="rounded-lg px-4 py-2 text-sm font-semibold">Rejected</TabsTrigger>
//                         <TabsTrigger value="cancelled" className="rounded-lg px-4 py-2 text-sm font-semibold">Cancelled</TabsTrigger>
//                     </TabsList>
//                 </Tabs>

//                 <div className="flex flex-col gap-3 rounded-2xl border border-ral-rule bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">

//                     <div className="relative w-full sm:max-w-sm">
//                         <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ral-soft" />

//                         <Input
//                             placeholder="Search leave requests..."
//                             value={search}
//                             onChange={(event) => setSearch(event.target.value)}
//                             className="rounded-xl border-ral-rule bg-white pl-9"
//                         />
//                     </div>

//                     <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
//                         <SelectTrigger className="w-full rounded-xl border-ral-rule bg-white sm:w-[200px]">
//                             <SelectValue placeholder="Leave type" />
//                         </SelectTrigger>

//                         <SelectContent>
//                             <SelectItem value="all">All leave types</SelectItem>

//                             {leaveTypeFilterOptions?.map((leaveType) => (
//                                 <SelectItem key={leaveType._id} value={leaveType._id}>
//                                     {leaveType.type}
//                                 </SelectItem>
//                             ))}

//                         </SelectContent>
//                     </Select>

//                 </div>
//             </section>

//             <div className="overflow-hidden rounded-2xl border border-ral-rule bg-white shadow-sm">
//                 <Table>
//                     <TableHeader className="bg-slate-50">
//                         <TableRow>
//                             <TableHead className="text-xs font-bold uppercase tracking-wide text-ral-soft">Leave Type</TableHead>
//                             <TableHead className="text-xs font-bold uppercase tracking-wide text-ral-soft">Start Date</TableHead>
//                             <TableHead className="text-xs font-bold uppercase tracking-wide text-ral-soft">End Date</TableHead>
//                             <TableHead className="text-xs font-bold uppercase tracking-wide text-ral-soft">Days</TableHead>
//                             <TableHead className="text-xs font-bold uppercase tracking-wide text-ral-soft">Status</TableHead>
//                             <TableHead className="text-xs font-bold uppercase tracking-wide text-ral-soft">Submitted</TableHead>
//                             <TableHead className="text-xs font-bold uppercase tracking-wide text-ral-soft">Action</TableHead>
//                         </TableRow>
//                     </TableHeader>

//                     <TableBody>
//                         {loading ? (
//                             <TableRow>
//                                 <TableCell
//                                     colSpan={7}
//                                     className="h-32 text-center text-sm text-ral-soft"
//                                 >
//                                     Loading leave requests...
//                                 </TableCell>
//                             </TableRow>
//                         ) : error ? (
//                             <TableRow>
//                                 <TableCell
//                                     colSpan={7}
//                                     className="h-32 text-center text-sm text-ral-stop"
//                                 >
//                                     {error}
//                             </TableCell>
//                             </TableRow>
//                         ) : filteredLeaves.length === 0 ? (
//                             <TableRow>
//                                 <TableCell
//                                     colSpan={7}
//                                     className="h-32 text-center text-sm text-ral-soft"
//                                 >
//                                     No leave requests found.
//                                 </TableCell>
//                             </TableRow>
//                         ) : (
//                             filteredLeaves.map((leave) => (
//                                 <TableRow
//                                     key={leave._id}
//                                     className="transition-colors hover:bg-slate-50/70"
//                                 >
//                                     <TableCell className="font-medium text-ral-ink">
//                                         {leave.leaveType.type}
//                                     </TableCell>

//                                     <TableCell className="text-ral-mid">
//                                         {new Date(leave.startDate).toLocaleDateString()}
//                                     </TableCell>

//                                     <TableCell className="text-ral-mid">
//                                         {new Date(leave.endDate).toLocaleDateString()}
//                                     </TableCell>

//                                     <TableCell className="text-ral-mid tabular-nums">
//                                         {leave.totalDays}
//                                     </TableCell>

//                                     <TableCell>
//                                         <Badge
//                                             variant="outline"
//                                             className={`${getStatusStyle(
//                                             leave.status
//                                             )} rounded-full px-2.5 py-1 text-xs font-semibold capitalize`}
//                                         >
//                                             {leave.status}
//                                         </Badge>
//                                     </TableCell>

//                                     <TableCell className="text-ral-mid">
//                                         {new Date(leave.createdAt).toLocaleDateString()}
//                                     </TableCell>

//                                     <TableCell className="text-right">
//                                         <Button
//                                             variant="ghost"
//                                             size="sm"
//                                             className="font-semibold text-ral-ink hover:bg-slate-100"
//                                             onClick={() => setSelectedLeave(leave)}
//                                         >
//                                             View
//                                         </Button>
//                                     </TableCell>
//                                 </TableRow>
//                             ))
//                         )}
//                     </TableBody>
//                 </Table>
//             </div>
//         </div>


//         <Dialog 
//             open={selectedLeave !== null}
//             onOpenChange={(open) => {
//                 if(!open){
//                     setSelectedLeave(null);
//                 }
//             }}
//         >
//             <DialogContent className="rounded-2xl border border-ral-rule bg-white p-6 shadow-lg sm:max-w-lg">
//                 {selectedLeave && (
//                 <>
//                     <DialogHeader>
//                         <DialogTitle className="text-ral-ink">Leave Request Details</DialogTitle>
//                         <DialogDescription className="text-ral-soft">Review the details of your leave request.</DialogDescription>
//                     </DialogHeader>

//                         <div className="flex items-center justify-between border-b border-ral-rule pb-4">
//                             <div>
//                             <p className="text-sm text-ral-soft">Leave Type</p>
//                             <p className="font-medium text-ral-ink">{selectedLeave.leaveType.type}</p>
//                             </div>

//                             <Badge
//                                 variant="outline"
//                                 className={`${getStatusStyle(selectedLeave.status)} rounded-full px-2.5 py-1 text-xs font-semibold capitalize`}
//                             >
//                                 {selectedLeave.status}
//                             </Badge>
//                         </div>

//                         <div className="grid grid-cols-2 gap-x-6 gap-y-5">
//                             <div>
//                                 <p className="text-xs font-medium uppercase tracking-wide text-ral-soft">Start Date</p>
//                                 <p className="mt-1 text-sm font-semibold text-ral-ink">{new Date(selectedLeave.startDate).toLocaleDateString()}</p>
//                             </div>

//                             <div>
//                                 <p className="text-xs font-medium uppercase tracking-wide text-ral-soft">End Date</p>
//                                 <p className="mt-1 text-sm font-semibold text-ral-ink">{new Date(selectedLeave.endDate).toLocaleDateString()}</p>
//                             </div>

//                             <div>
//                                 <p className="text-xs font-medium uppercase tracking-wide text-ral-soft">Total Days</p>
//                                 <p className="mt-1 text-sm font-semibold text-ral-ink tabular-nums">{selectedLeave.totalDays} days</p>
//                             </div>

//                             <div>
//                                 <p className="text-xs font-medium uppercase tracking-wide text-ral-soft">Submitted</p>
//                                 <p className="mt-1 text-sm font-semibold text-ral-ink">{new Date(selectedLeave.createdAt).toLocaleDateString()}</p>
//                             </div>
//                             </div>


//                         <div className="border-t border-ral-rule pt-4">
//                             <p className="text-sm text-ral-soft">Note</p>
//                             <p className="mt-1 text-sm text-ral-mid">{selectedLeave.note || "No note provided."}</p>
//                         </div>
//                         {cancelError && (
//                             <p className="text-sm text-ral-stop">
//                                 {cancelError}
//                             </p>
//                             )}

//                             {canCancelSelectedLeave && (
//                                 <div className="flex justify-end border-t border-ral-rule pt-4">
//                                     <Button
//                                     type="button"
//                                     variant="destructive"
//                                     onClick={() => setCancelDialogOpen(true)}
//                                     disabled={cancelling}
//                                     >
//                                         {cancelling ? "Cancelling..." : "Cancel Leave"}
//                                     </Button>
//                                 </div>
//                         )}
//                 </>
//                 )}
//             </DialogContent>
//         </Dialog>

//         <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
//                 <AlertDialogContent>
//                     <AlertDialogHeader>
//                         <AlertDialogTitle>Cancel Leave Request?</AlertDialogTitle>

//                         <AlertDialogDescription>
//                             Are you sure you want to cancel this leave request?
//                             This action cannot be undone.
//                         </AlertDialogDescription>
//                     </AlertDialogHeader>

//                     {cancelError && (<p className="text-sm text-ral-stop">{cancelError}</p>)}

//                     <AlertDialogFooter>
//                         <AlertDialogCancel disabled={cancelling}>Keep Request</AlertDialogCancel>

//                         <AlertDialogAction 
//                             onClick={(event) => {
//                                 event.preventDefault();
//                                 handleCancelLeave();
//                             }} disabled={cancelling}>
//                             {cancelling ? "Cancelling..." : "Yes, Cancel Leave"}
//                         </AlertDialogAction>
//                     </AlertDialogFooter>
//                 </AlertDialogContent>
//         </AlertDialog>


//         <Dialog open={requestDialogOpen} onOpenChange={handleRequestDialogChange}>
//             <DialogContent className="sm:max-w-lg">
//                 <DialogHeader>
//                     <DialogTitle className="text-ral-ink">Request Leave</DialogTitle>

//                     <DialogDescription className="text-ral-soft">Submit a new leave request for approval.</DialogDescription>
//                 </DialogHeader>

//                 <form onSubmit={handleSubmitLeave} className="space-y-5">
//                     <div className="space-y-2">
//                         <label className="text-sm font-medium text-ral-mid">Leave Type</label>

//                         <Select 
//                             value={formData.leaveType}  
//                             onValueChange={(value) => setFormData({...formData, leaveType: value})}
//                         >
//                             <SelectTrigger className="w-full">
//                                 <SelectValue placeholder="Select leave type" />
//                             </SelectTrigger>

//                             <SelectContent>
//                                 {options.leaveTypes?.map((type) => (
//                                     <SelectItem key={type._id} value={type._id}>
//                                         {type.displayName} — {type.totalRemainingDays} days
//                                     </SelectItem>
//                                 ))}
//                             </SelectContent>
//                         </Select>
//                     </div>

//                     <div className="space-y-2">
//                         <label className="text-sm font-medium text-ral-mid">Leave Period</label>

//                         <Popover>
//                             <PopoverTrigger asChild>
//                                 <Button
//                                     type="button"
//                                     variant="outline"
//                                     className="w-full justify-start text-left font-normal"
//                                 >
//                                     <CalendarIcon className="mr-2 size-4" />

//                                     {
//                                         dateRange.from && dateRange.to ? 
//                                             `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
//                                         : dateRange.from ? 
//                                             dateRange.from.toLocaleDateString()
//                                         : "Select leave period"
//                                     }
//                                 </Button>
//                             </PopoverTrigger>

//                             <PopoverContent className="w-auto p-0" align="center">
//                                 <Calendar
//                                     mode="range"
//                                     selected={dateRange}
//                                     disabled={[
//                                         { before: new Date() },
//                                         ...reservedRanges
//                                     ]}
//                                     onSelect={(range) => {
//                                         setDateRange(range || {
//                                             from: undefined,
//                                             to: undefined,
//                                         });

//                                         setFormData({
//                                             ...formData,
//                                             startDate: range?.from  ? range.from.toISOString().split("T")[0] : "",
//                                             endDate: range?.to ? range.to.toISOString().split("T")[0] : "",
//                                         });
//                                     }}
//                                     numberOfMonths={1}
//                                 />
//                             </PopoverContent>
//                         </Popover>
//                     </div>

// {selectedLeaveType?.restrictions?.requiresDocument && (
//   <div className="space-y-2">
//     <label className="text-sm font-medium text-ral-mid">
//       Supporting Document <span className="text-ral-stop">*</span>
//     </label>

//     {!formData.document ? (
//       <label
//         htmlFor="document"
//         className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ral-rule bg-ral-card/40 px-6 py-6 transition hover:border-ral-lavender hover:bg-ral-card"
//       >
//         <div className="flex size-10 items-center justify-center rounded-full bg-ral-lavender/40">
//           <Upload className="size-5 text-ral-ink" />
//         </div>

//         <div className="text-center">
//           <p className="text-sm font-medium text-ral-ink">
//             Upload supporting document
//           </p>
//           <p className="mt-1 text-xs text-ral-soft">
//             Click to choose a file
//           </p>
//         </div>

//         <input
//           id="document"
//           name="document"
//           type="file"
//           className="hidden"
//           onChange={(event) =>
//             setFormData({
//               ...formData,
//               document: event.target.files?.[0] || null,
//             })
//           }
//         />
//       </label>
//     ) : (
//       <div className="flex items-center justify-between rounded-xl border border-ral-rule bg-ral-card/40 p-3">
//         <div className="flex min-w-0 items-center gap-3">
//           <FileText className="size-5 shrink-0 text-ral-ink" />

//           <div className="min-w-0">
//             <p className="truncate text-sm font-medium text-ral-ink">
//               {formData.document.name}
//             </p>

//             <p className="text-xs text-ral-soft">
//               {(formData.document.size / 1024).toFixed(1)} KB
//             </p>
//           </div>
//         </div>

//         <Button
//           type="button"
//           variant="ghost"
//           size="icon"
//           onClick={() =>
//             setFormData({
//               ...formData,
//               document: null,
//             })
//           }
//         >
//           <X className="size-4" />
//         </Button>
//       </div>
//     )}

//     <p className="text-xs text-ral-soft">
//       A supporting document is required for this leave type.
//     </p>
//   </div>
// )}

//                     <div className="space-y-2">
//                         <label htmlFor="note" className="text-sm font-medium text-ral-mid">Note</label>

//                         <textarea
//                             id="note"
//                             name='note'
//                             rows={4}
//                             maxLength={500}
//                             value={formData.note}
//                             onChange={handelInputChange}
//                             placeholder="Add a note..."
//                             className="w-full resize-none rounded-md border border-ral-rule bg-white px-3 py-2 text-sm text-ral-mid outline-none focus:ring-2 focus:ring-ral-lavender"
//                         />
//                     </div>

//                     {submitError && (<p className="text-sm text-ral-stop">{submitError}</p>)}

//                     <div className="flex justify-end gap-3">
//                         <Button
//                             type="button"
//                             variant="outline"
//                             onClick={() => handleRequestDialogChange(false)}
//                         >
//                             Cancel
//                         </Button>

//                         <Button
//                             type="submit"
//                             disabled={submitting || !formData.leaveType || !formData.startDate || !formData.endDate}
//                         >
//                             {submitting ? "Submitting..." : "Submit Request"}
//                         </Button>
//                     </div>
//                 </form>
//             </DialogContent>
//         </Dialog>







//     </div>

    

      
//   )
// }

// export default MyLeave
