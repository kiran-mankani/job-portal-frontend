import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  CalendarDays,
  Clock3,
  Video,
  MapPin,
  Mail,
  Pencil,
  XCircle,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  ExternalLink,
  Search,
  ChevronDown,
  BriefcaseBusiness,
} from "lucide-react";

import {
  getRecruiterInterviews,
  updateInterview,
  cancelInterview,
  clearInterviewError,
  clearInterviewSuccess,
} from "../../store/interviewSlice";

function RecruiterInterview() {
  const dispatch = useDispatch();

  // =========================================================
  // AUTH
  // =========================================================

  const auth = useSelector((state) => state.auth || {});

  const token =
    auth.token ||
    auth.accessToken ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    null;

  const recruiter = auth.user || {};

  // =========================================================
  // INTERVIEW STATE
  // =========================================================

  const interviewState = useSelector(
    (state) => state.interviews || {}
  );

  const interviews = Array.isArray(interviewState.interviews)
    ? interviewState.interviews
    : [];

  const loading = Boolean(interviewState.loading);
  const error = interviewState.error || null;
  const success = interviewState.success || null;

  // =========================================================
  // LOCAL STATE
  // =========================================================

  const [editingId, setEditingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modeFilter, setModeFilter] = useState("");

  const [editForm, setEditForm] = useState({
    date: "",
    duration: 30,
    meetingLink: "",
    location: "",
    notes: "",
  });

  // =========================================================
  // LOAD INTERVIEWS
  // =========================================================

  useEffect(() => {
    if (!token) return;

    dispatch(getRecruiterInterviews(token));

    return () => {
      dispatch(clearInterviewError());
      dispatch(clearInterviewSuccess());
    };
  }, [dispatch, token]);

  // =========================================================
  // FILTER INTERVIEWS
  // =========================================================

  const filteredInterviews = useMemo(() => {
    const query = search.trim().toLowerCase();

    return interviews.filter((interview) => {
      const candidate = interview?.candidate || {};
      const application = interview?.application || {};

      const job =
        application?.job ||
        interview?.job ||
        {};

      const candidateName = String(
        candidate?.name || ""
      ).toLowerCase();

      const candidateEmail = String(
        candidate?.email || ""
      ).toLowerCase();

      const jobTitle = String(
        job?.title || ""
      ).toLowerCase();

      const matchesSearch =
        !query ||
        candidateName.includes(query) ||
        candidateEmail.includes(query) ||
        jobTitle.includes(query);

      const matchesStatus =
        !statusFilter ||
        String(interview?.status || "")
          .trim()
          .toLowerCase() ===
          statusFilter.toLowerCase();

      const matchesMode =
        !modeFilter ||
        String(interview?.mode || "")
          .trim()
          .toLowerCase() ===
          modeFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesStatus &&
        matchesMode
      );
    });
  }, [
    interviews,
    search,
    statusFilter,
    modeFilter,
  ]);

  // =========================================================
  // COUNTS
  // =========================================================

  const totalCount = interviews.length;

  const scheduledCount = interviews.filter(
    (item) =>
      String(item?.status || "").trim().toLowerCase() ===
      "scheduled"
  ).length;

  const completedCount = interviews.filter(
    (item) =>
      String(item?.status || "").trim().toLowerCase() ===
      "completed"
  ).length;

  const cancelledCount = interviews.filter(
    (item) =>
      String(item?.status || "").trim().toLowerCase() ===
      "cancelled"
  ).length;

  // =========================================================
  // EDIT INTERVIEW
  // =========================================================

  const handleEdit = (interview) => {
    const interviewId =
      interview?._id ||
      interview?.id ||
      null;

    if (!interviewId) return;

    const mode = String(
      interview?.mode || "online"
    )
      .trim()
      .toLowerCase();

    setEditingId(interviewId);

    setEditForm({
      date: interview?.date
        ? formatDateTimeLocal(interview.date)
        : "",

      duration: Number(interview?.duration) || 30,

      meetingLink:
        mode === "online"
          ? interview?.meetingLink || ""
          : "",

      location:
        mode === "offline"
          ? interview?.location || ""
          : "",

      notes:
        interview?.notes || "",
    });

    dispatch(clearInterviewError());
    dispatch(clearInterviewSuccess());
  };

  // =========================================================
  // CANCEL EDIT
  // =========================================================

  const handleCancelEdit = () => {
    setEditingId(null);

    setEditForm({
      date: "",
      duration: 30,
      meetingLink: "",
      location: "",
      notes: "",
    });

    dispatch(clearInterviewError());
    dispatch(clearInterviewSuccess());
  };

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      dispatch(clearInterviewError());
    }

    if (success) {
      dispatch(clearInterviewSuccess());
    }
  };

  // =========================================================
  // UPDATE / RESCHEDULE
  // =========================================================

  const handleUpdate = async (
    event,
    interview
  ) => {
    event.preventDefault();

    const interviewId =
      interview?._id ||
      interview?.id ||
      null;

    if (!token || !interviewId) {
      return;
    }

    if (!editForm.date) {
      alert(
        "Please select interview date and time."
      );
      return;
    }

    const selectedDate = new Date(
      editForm.date
    );

    if (
      Number.isNaN(
        selectedDate.getTime()
      )
    ) {
      alert(
        "Please select a valid date and time."
      );
      return;
    }

    if (
      selectedDate.getTime() <=
      Date.now()
    ) {
      alert(
        "Interview date and time must be in the future."
      );
      return;
    }

    const duration = Number(
      editForm.duration
    );

    if (
      !Number.isInteger(duration) ||
      duration < 15 ||
      duration > 480
    ) {
      alert(
        "Interview duration must be between 15 and 480 minutes."
      );
      return;
    }

    const mode = String(
      interview?.mode || "online"
    )
      .trim()
      .toLowerCase();

    if (
      mode === "online" &&
      !editForm.meetingLink.trim()
    ) {
      alert(
        "Please enter the meeting link."
      );
      return;
    }

    if (
      mode === "online" &&
      !isValidHttpUrl(
        editForm.meetingLink
      )
    ) {
      alert(
        "Please enter a valid HTTP or HTTPS meeting link."
      );
      return;
    }

    if (
      mode === "offline" &&
      !editForm.location.trim()
    ) {
      alert(
        "Please enter the interview location."
      );
      return;
    }

    const interviewData = {
      date: selectedDate.toISOString(),
      duration,

      meetingLink:
        mode === "online"
          ? editForm.meetingLink.trim()
          : "",

      location:
        mode === "offline"
          ? editForm.location.trim()
          : "",

      notes:
        editForm.notes.trim(),
    };

    dispatch(clearInterviewError());
    dispatch(clearInterviewSuccess());

    setUpdatingId(interviewId);

    try {
      const result = await dispatch(
        updateInterview({
          id: interviewId,
          interviewData,
          token,
        })
      );

      if (
        updateInterview.fulfilled.match(
          result
        )
      ) {
        setEditingId(null);

        setEditForm({
          date: "",
          duration: 30,
          meetingLink: "",
          location: "",
          notes: "",
        });

        dispatch(
          getRecruiterInterviews(token)
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  // =========================================================
  // CANCEL INTERVIEW
  // =========================================================

  const handleCancelInterview = async (
    interviewId
  ) => {
    if (!token || !interviewId) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this interview?"
    );

    if (!confirmed) {
      return;
    }

    dispatch(clearInterviewError());
    dispatch(clearInterviewSuccess());

    setUpdatingId(interviewId);

    try {
      const result = await dispatch(
        cancelInterview({
          id: interviewId,
          token,
        })
      );

      if (
        cancelInterview.fulfilled.match(
          result
        )
      ) {
        dispatch(
          getRecruiterInterviews(token)
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  // =========================================================
  // RETRY
  // =========================================================

  const handleRetry = () => {
    dispatch(clearInterviewError());

    if (!token) return;

    dispatch(
      getRecruiterInterviews(token)
    );
  };

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setModeFilter("");
  };

  const hasFilters = Boolean(
    search.trim() ||
      statusFilter ||
      modeFilter
  );

  // =========================================================
  // LOADING
  // =========================================================

  if (
    loading &&
    interviews.length === 0
  ) {
    return (
      <div className="min-h-screen bg-[#f5f8fc]">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="text-sm font-semibold text-slate-600">
              Loading interviews...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Please wait a moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-[#f5f8fc] text-[#172b4d]">


      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="mx-auto max-w-[1450px] px-4 py-5 sm:px-6 lg:px-8">

        {/* PAGE HEADER */}

        <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">

          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Recruiter Portal
            </p>

            <h2 className="text-[25px] font-bold leading-tight text-[#152b4d] sm:text-[29px]">
              Scheduled Interviews
            </h2>

            <p className="mt-1.5 text-[13px] text-slate-500">
              View, reschedule, and manage your candidate interviews.
            </p>
          </div>

          <Link
            to="/recruiter/interviews/schedule"
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <CalendarDays size={15} />
            Schedule Interview
          </Link>

        </section>

        {/* SUCCESS */}

        {success && (
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">
            <CheckCircle2 size={17} />

            <span>
              {success.message ||
                "Interview updated successfully."}
            </span>
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mt-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-3">

              <XCircle
                size={18}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div>
                <p className="text-xs font-semibold text-red-700">
                  Unable to process interviews
                </p>

                <p className="mt-1 text-[11px] text-red-600">
                  {error}
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
            >
              <RefreshCw size={14} />
              Retry
            </button>

          </div>
        )}

        {/* SUMMARY CARDS */}

        <section className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

          <SummaryCard
            title="Total Interviews"
            value={totalCount}
            icon={<CalendarDays size={20} />}
            box="bg-blue-50 text-blue-600"
          />

          <SummaryCard
            title="Scheduled"
            value={scheduledCount}
            icon={<Clock3 size={20} />}
            box="bg-orange-50 text-orange-600"
          />

          <SummaryCard
            title="Completed"
            value={completedCount}
            icon={<CheckCircle2 size={20} />}
            box="bg-emerald-50 text-emerald-600"
          />

          <SummaryCard
            title="Cancelled"
            value={cancelledCount}
            icon={<XCircle size={20} />}
            box="bg-red-50 text-red-600"
          />

        </section>

        {/* FILTERS */}

        <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

          <div className="flex items-center justify-between gap-3">

            <div>
              <h3 className="text-[14px] font-bold text-[#172b4d]">
                Interviews
              </h3>

              <p className="mt-1 text-[10px] text-slate-400">
                {filteredInterviews.length} of{" "}
                {interviews.length} interviews shown
              </p>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-[10px] font-semibold text-blue-600 hover:text-blue-700"
              >
                Clear filters
              </button>
            )}

          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">

            {/* SEARCH */}

            <div className="relative">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search candidate or job..."
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>

            {/* STATUS */}

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-4 pr-9 text-xs text-slate-700 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
              >
                <option value="">
                  All Status
                </option>

                <option value="scheduled">
                  Scheduled
                </option>

                <option value="completed">
                  Completed
                </option>

                <option value="cancelled">
                  Cancelled
                </option>
              </select>

              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            {/* MODE */}

            <div className="relative">
              <select
                value={modeFilter}
                onChange={(event) =>
                  setModeFilter(event.target.value)
                }
                className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-4 pr-9 text-xs capitalize text-slate-700 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
              >
                <option value="">
                  All Modes
                </option>

                <option value="online">
                  Online
                </option>

                <option value="offline">
                  Offline
                </option>
              </select>

              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

          </div>

        </section>

        {/* EMPTY STATE */}

        {filteredInterviews.length === 0 && (
          <section className="mt-5 rounded-xl border border-slate-200 bg-white px-5 py-14 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
              <CalendarDays size={28} />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-700">
              {interviews.length === 0
                ? "No interviews scheduled"
                : "No matching interviews"}
            </h3>

            <p className="mx-auto mt-1.5 max-w-md text-xs leading-5 text-slate-400">
              {interviews.length === 0
                ? "Scheduled candidate interviews will appear here."
                : "Try changing your search or filters."}
            </p>

            {interviews.length === 0 ? (
              <Link
                to="/recruiter/interviews/schedule"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
              >
                <CalendarDays size={14} />
                Schedule Interview
              </Link>
            ) : (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Clear Filters
              </button>
            )}

          </section>
        )}

        {/* INTERVIEW CARDS */}

        {filteredInterviews.length > 0 && (
          <section className="mt-5 space-y-4">

            {filteredInterviews.map(
              (interview) => {
                const candidate =
                  interview?.candidate || {};

                const application =
                  interview?.application || {};

                const job =
                  application?.job ||
                  interview?.job ||
                  {};

                const interviewId =
                  interview?._id ||
                  interview?.id ||
                  null;

                const jobId =
                  job?._id ||
                  job?.id ||
                  null;

                const isEditing =
                  editingId ===
                  interviewId;

                const isUpdating =
                  updatingId ===
                  interviewId;

                const normalizedStatus =
                  String(
                    interview?.status || ""
                  )
                    .trim()
                    .toLowerCase();

                const normalizedMode =
                  String(
                    interview?.mode || "online"
                  )
                    .trim()
                    .toLowerCase();

                return (
                  <article
                    key={
                      interviewId ||
                      `${candidate?._id || candidate?.id || "candidate"}-${interview?.date || "interview"}`
                    }
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                  >

                    {/* CARD HEADER */}

                    <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                          {getInitials(
                            candidate?.name ||
                              "Candidate"
                          )}
                        </div>

                        <div className="min-w-0">

                          <h3 className="truncate text-[14px] font-bold text-[#172b4d]">
                            {candidate?.name ||
                              "Candidate"}
                          </h3>

                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">

                            {candidate?.email && (
                              <span className="inline-flex items-center gap-1 text-[9px] text-slate-400">
                                <Mail size={10} />
                                {candidate.email}
                              </span>
                            )}

                            {candidate?.phone && (
                              <span className="text-[9px] text-slate-400">
                                {candidate.phone}
                              </span>
                            )}

                          </div>

                        </div>
                      </div>

                      <StatusBadge
                        status={
                          interview?.status ||
                          "scheduled"
                        }
                      />

                    </div>

                    {/* CONTENT */}

                    {!isEditing ? (
                      <>
                        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4 sm:px-5">

                          <InfoItem
                            label="Position"
                            icon={
                              <BriefcaseBusiness
                                size={13}
                              />
                            }
                            value={
                              job?.title ||
                              "Interview"
                            }
                          />

                          <InfoItem
                            label="Date & Time"
                            icon={
                              <CalendarDays
                                size={13}
                              />
                            }
                            value={
                              interview?.date
                                ? formatDateTime(
                                    interview.date
                                  )
                                : "Not available"
                            }
                          />

                          <InfoItem
                            label="Duration"
                            icon={
                              <Clock3
                                size={13}
                              />
                            }
                            value={`${interview?.duration || 30} minutes`}
                          />

                          <InfoItem
                            label="Mode"
                            icon={
                              normalizedMode ===
                              "offline" ? (
                                <MapPin size={13} />
                              ) : (
                                <Video size={13} />
                              )
                            }
                            value={
                              interview?.mode ||
                              "online"
                            }
                            capitalize
                          />

                        </div>

                        {/* MEETING / LOCATION */}

                        {(interview?.meetingLink ||
                          interview?.location) && (
                          <div className="border-t border-slate-100 px-4 py-4 sm:px-5">

                            {interview?.meetingLink && (
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                <div className="min-w-0">
                                  <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                                    Meeting Link
                                  </p>

                                  <p className="mt-1 truncate text-[11px] text-slate-600">
                                    {interview.meetingLink}
                                  </p>
                                </div>

                                {isValidHttpUrl(
                                  interview.meetingLink
                                ) && (
                                  <a
                                    href={
                                      interview.meetingLink
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-[9px] font-semibold text-white hover:bg-blue-700"
                                  >
                                    <Video size={13} />
                                    Open Meeting
                                    <ExternalLink size={10} />
                                  </a>
                                )}

                              </div>
                            )}

                            {interview?.location && (
                              <div
                                className={
                                  interview?.meetingLink
                                    ? "mt-4"
                                    : ""
                                }
                              >
                                <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                                  Location
                                </p>

                                <p className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-600">
                                  <MapPin size={12} />
                                  {interview.location}
                                </p>
                              </div>
                            )}

                          </div>
                        )}

                        {/* NOTES */}

                        {interview?.notes && (
                          <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-4 sm:px-5">

                            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                              Notes
                            </p>

                            <p className="mt-1.5 whitespace-pre-wrap text-xs leading-5 text-slate-600">
                              {interview.notes}
                            </p>

                          </div>
                        )}

                        {/* ACTIONS */}

                        <div className="flex flex-wrap gap-2 border-t border-slate-100 px-4 py-4 sm:px-5">

                          {normalizedStatus !==
                            "cancelled" &&
                            normalizedStatus !==
                              "completed" &&
                            interviewId && (
                              <>
                                <button
                                  type="button"
                                  disabled={
                                    isUpdating
                                  }
                                  onClick={() =>
                                    handleEdit(
                                      interview
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[9px] font-semibold text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <Pencil size={13} />
                                  Reschedule
                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    isUpdating
                                  }
                                  onClick={() =>
                                    handleCancelInterview(
                                      interviewId
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[9px] font-semibold text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <XCircle size={13} />

                                  {isUpdating
                                    ? "Cancelling..."
                                    : "Cancel Interview"}
                                </button>
                              </>
                            )}

                          {jobId && (
                            <Link
                              to={`/jobs/${jobId}`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[9px] font-semibold text-slate-600 hover:border-blue-200 hover:text-blue-600"
                            >
                              <BriefcaseBusiness
                                size={13}
                              />
                              View Job
                            </Link>
                          )}

                        </div>
                      </>
                    ) : (
                      /* =================================================
                         EDIT FORM
                      ================================================== */

                      <form
                        onSubmit={(event) =>
                          handleUpdate(
                            event,
                            interview
                          )
                        }
                        className="border-t border-slate-100 bg-slate-50/60 p-4 sm:p-5"
                      >

                        <div className="mb-4">
                          <h4 className="text-[13px] font-bold text-[#172b4d]">
                            Reschedule Interview
                          </h4>

                          <p className="mt-1 text-[10px] text-slate-400">
                            Update the date, time, duration, or meeting details.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                          <FormField label="Date & Time">
                            <input
                              type="datetime-local"
                              name="date"
                              value={
                                editForm.date
                              }
                              onChange={
                                handleChange
                              }
                              min={getMinDateTime()}
                              required
                              className="form-input"
                            />
                          </FormField>

                          <FormField label="Duration">
                            <select
                              name="duration"
                              value={
                                editForm.duration
                              }
                              onChange={
                                handleChange
                              }
                              className="form-input"
                            >
                              <option value={15}>
                                15 minutes
                              </option>

                              <option value={30}>
                                30 minutes
                              </option>

                              <option value={45}>
                                45 minutes
                              </option>

                              <option value={60}>
                                60 minutes
                              </option>

                              <option value={90}>
                                90 minutes
                              </option>

                              <option value={120}>
                                120 minutes
                              </option>

                              <option value={180}>
                                180 minutes
                              </option>

                              <option value={240}>
                                240 minutes
                              </option>

                              <option value={480}>
                                480 minutes
                              </option>
                            </select>
                          </FormField>

                          {normalizedMode ===
                            "online" && (
                            <FormField label="Meeting Link">
                              <input
                                type="url"
                                name="meetingLink"
                                value={
                                  editForm.meetingLink
                                }
                                onChange={
                                  handleChange
                                }
                                placeholder="https://meet.google.com/..."
                                required
                                className="form-input"
                              />
                            </FormField>
                          )}

                          {normalizedMode ===
                            "offline" && (
                            <FormField label="Location">
                              <input
                                type="text"
                                name="location"
                                value={
                                  editForm.location
                                }
                                onChange={
                                  handleChange
                                }
                                placeholder="Office / interview location"
                                required
                                className="form-input"
                              />
                            </FormField>
                          )}

                          <div className="md:col-span-2">
                            <FormField label="Notes">
                              <textarea
                                name="notes"
                                value={
                                  editForm.notes
                                }
                                onChange={
                                  handleChange
                                }
                                rows={4}
                                placeholder="Add interview notes..."
                                className="form-input resize-y"
                              />
                            </FormField>
                          </div>

                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">

                          <button
                            type="submit"
                            disabled={
                              isUpdating
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isUpdating ? (
                              <>
                                <RefreshCw
                                  size={14}
                                  className="animate-spin"
                                />
                                Updating...
                              </>
                            ) : (
                              <>
                                <CheckCircle2
                                  size={14}
                                />
                                Save Changes
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={
                              handleCancelEdit
                            }
                            disabled={
                              isUpdating
                            }
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Cancel
                          </button>

                        </div>

                      </form>
                    )}

                  </article>
                );
              }
            )}

          </section>
        )}

      </main>
    </div>
  );
}

// =========================================================
// SUMMARY CARD
// =========================================================

function SummaryCard({
  title,
  value,
  icon,
  box,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${box}`}
      >
        {icon}
      </div>

      <p className="mt-3 text-[10px] font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-[24px] font-bold leading-none text-[#172b4d]">
        {value}
      </p>

    </div>
  );
}

// =========================================================
// INFO ITEM
// =========================================================

function InfoItem({
  label,
  icon,
  value,
  capitalize = false,
}) {
  return (
    <div className="min-w-0">

      <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </p>

      <p
        className={`mt-1 truncate text-[11px] font-semibold text-[#304563] ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value}
      </p>

    </div>
  );
}

// =========================================================
// FORM FIELD
// =========================================================

function FormField({
  label,
  children,
}) {
  return (
    <label className="block">

      <span className="mb-1.5 block text-[10px] font-semibold text-slate-600">
        {label}
      </span>

      {children}

    </label>
  );
}

// =========================================================
// STATUS BADGE
// =========================================================

function StatusBadge({
  status,
}) {
  const normalized = String(
    status || ""
  )
    .trim()
    .toLowerCase();

  let classes =
    "bg-slate-100 text-slate-600";

  if (normalized === "scheduled") {
    classes =
      "bg-blue-50 text-blue-600";
  }

  if (normalized === "completed") {
    classes =
      "bg-emerald-50 text-emerald-600";
  }

  if (normalized === "cancelled") {
    classes =
      "bg-red-50 text-red-600";
  }

  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[8px] font-bold capitalize ${classes}`}
    >
      {status || "Unknown"}
    </span>
  );
}

// =========================================================
// INITIALS
// =========================================================

function getInitials(name) {
  if (!name) return "R";

  return (
    String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0)
      )
      .join("")
      .toUpperCase() || "R"
  );
}

// =========================================================
// DATE + TIME
// =========================================================

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleString(
    undefined,
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
}

// =========================================================
// DATETIME LOCAL
// =========================================================

function formatDateTimeLocal(
  dateValue
) {
  const date = new Date(
    dateValue
  );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  const hours = String(
    date.getHours()
  ).padStart(2, "0");

  const minutes = String(
    date.getMinutes()
  ).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// =========================================================
// MIN DATETIME
// =========================================================

function getMinDateTime() {
  const date = new Date(
    Date.now() + 60 * 1000
  );

  return formatDateTimeLocal(
    date
  );
}

// =========================================================
// URL VALIDATION
// =========================================================

function isValidHttpUrl(value) {
  if (!value) return false;

  try {
    const url = new URL(
      String(value).trim()
    );

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}

export default RecruiterInterview;