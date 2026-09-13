import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getMyJobs,
  deleteJob,
  clearJobError,
  clearJobSuccess,
} from "../../store/jobSlice";

function MyJobs() {
  const dispatch = useDispatch();

  const { token: reduxToken } = useSelector((state) => state.auth);

  const token =
    reduxToken || localStorage.getItem("token") || null;

  const {
    jobs = [],
    loading,
    error,
    success,
    pagination,
  } = useSelector((state) => state.job);

  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const limit = pagination?.limit || 10;
  const totalJobs = pagination?.total ?? jobs.length;

  // ======================================================
  // LOCAL UI STATES
  // ======================================================

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [toast, setToast] = useState({
    show: false,
    type: "",
    message: "",
  });

  // Refs for debounce & stale-dispatch protection
  const isFirstRender = useRef(true);
  const lastDispatchedKeyword = useRef("");
  const lastDispatchedStatus = useRef("");

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    if (!token) return;

    dispatch(
      getMyJobs({
        page: 1,
        limit,
        search: "",
        status: "",
        token,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, token, limit]);

  // ======================================================
  // DEBOUNCED SEARCH + STATUS FILTER
  // ======================================================

  useEffect(() => {
    if (!token) return;

    // Skip the very first render so we don't double-fetch
    // on mount (the initial effect above already fetches).
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const trimmedKeyword = keyword.trim();

    // Skip if nothing changed since last dispatch.
    if (
      trimmedKeyword === lastDispatchedKeyword.current &&
      statusFilter === lastDispatchedStatus.current
    ) {
      return;
    }

    const timer = setTimeout(() => {
      lastDispatchedKeyword.current = trimmedKeyword;
      lastDispatchedStatus.current = statusFilter;

      dispatch(clearJobError());

      dispatch(
        getMyJobs({
          page: 1,
          limit,
          search: trimmedKeyword,
          status: statusFilter,
          token,
        })
      );
    }, 400);

    return () => clearTimeout(timer);
  }, [keyword, statusFilter, dispatch, token, limit]);

  // ======================================================
  // TOAST HELPER
  // ======================================================

  const showToast = (type, message) => {
    setToast({ show: true, type, message });

    setTimeout(() => {
      setToast({ show: false, type: "", message: "" });
    }, 3500);
  };

  // ======================================================
  // CLEAR SEARCH / FILTERS
  // ======================================================

  const handleClearFilters = () => {
    setKeyword("");
    setStatusFilter("");

    lastDispatchedKeyword.current = "";
    lastDispatchedStatus.current = "";

    dispatch(clearJobError());

    if (token) {
      dispatch(
        getMyJobs({
          page: 1,
          limit,
          search: "",
          status: "",
          token,
        })
      );
    }
  };

  // ======================================================
  // PAGINATION
  // ======================================================

  const loadPage = (page) => {
    if (
      loading ||
      page < 1 ||
      page > totalPages ||
      page === currentPage ||
      !token
    ) {
      return;
    }

    dispatch(clearJobError());

    dispatch(
      getMyJobs({
        page,
        limit,
        search: keyword.trim(),
        status: statusFilter,
        token,
      })
    );
  };

  const handlePrevious = () => loadPage(currentPage - 1);
  const handleNext = () => loadPage(currentPage + 1);

  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let page = 1; page <= totalPages; page += 1) {
        pages.push(page);
      }
      return pages;
    }

    pages.push(1);

    if (currentPage > 3) pages.push("...");

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let page = startPage; page <= endPage; page += 1) {
      if (!pages.includes(page)) pages.push(page);
    }

    if (currentPage < totalPages - 2) pages.push("...");
    if (!pages.includes(totalPages)) pages.push(totalPages);

    return pages;
  };

  // ======================================================
  // OPEN DELETE MODAL
  // ======================================================

  const openDeleteModal = (job) => {
    if (deletingId) return;
    setSelectedJob(job);
    setDeleteModalOpen(true);
  };

  // ======================================================
  // CLOSE DELETE MODAL
  // ======================================================

  const closeDeleteModal = () => {
    if (deletingId) return;
    setDeleteModalOpen(false);
    setSelectedJob(null);
  };

  // ======================================================
  // CONFIRM DELETE
  // ======================================================

  const handleConfirmDelete = async () => {
    if (!selectedJob?._id || !token) {
      showToast(
        "error",
        "Unable to delete this job. Please login again."
      );
      return;
    }

    const jobId = selectedJob._id;

    try {
      setDeletingId(jobId);

      await dispatch(deleteJob({ id: jobId, token })).unwrap();

      setDeleteModalOpen(false);
      setSelectedJob(null);

      showToast("success", "Job deleted successfully.");

      // Refresh with current filters preserved.
      await dispatch(
        getMyJobs({
          page: currentPage,
          limit,
          search: keyword.trim(),
          status: statusFilter,
          token,
        })
      );

      dispatch(clearJobSuccess());
    } catch (err) {
      const message =
        typeof err === "string"
          ? err
          : err?.message || "Failed to delete job.";

      showToast("error", message);
    } finally {
      setDeletingId(null);
    }
  };

  // ======================================================
  // CLEAR REDUX ERROR
  // ======================================================

  const handleClearError = () => {
    dispatch(clearJobError());
  };

  // ======================================================
  // CLEAN SUCCESS MESSAGE
  // ======================================================

  useEffect(() => {
    if (success) {
      dispatch(clearJobSuccess());
    }
  }, [success, dispatch]);

  // ======================================================
  // FORMAT DATE
  // ======================================================

  const formatDate = (date) => {
    if (!date) return "";

    try {
      const parsedDate = new Date(date);
      if (Number.isNaN(parsedDate.getTime())) return "";

      return parsedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  // ======================================================
  // SALARY FORMAT
  // ======================================================

  const getSalaryText = (job) => {
    const minSalary = job?.minSalary;
    const maxSalary = job?.maxSalary;

    if (
      minSalary !== undefined &&
      minSalary !== null &&
      maxSalary !== undefined &&
      maxSalary !== null
    ) {
      return `${minSalary} - ${maxSalary}`;
    }

    if (minSalary !== undefined && minSalary !== null) {
      return `${minSalary}+`;
    }

    if (maxSalary !== undefined && maxSalary !== null) {
      return `Up to ${maxSalary}`;
    }

    if (job?.salary) return String(job.salary);

    return "";
  };

  const hasActiveFilters =
    keyword.trim().length > 0 || statusFilter.length > 0;

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="min-h-screen bg-slate-50">
      {/* TOAST */}
      {toast.show && (
        <div className="fixed right-4 top-4 z-[100] w-[calc(100%-2rem)] max-w-sm">
          <div
            className={`flex items-start gap-3 rounded-xl border bg-white px-4 py-4 shadow-xl ${
              toast.type === "success"
                ? "border-emerald-200"
                : "border-red-200"
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                toast.type === "success"
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {toast.type === "success" ? (
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m5 12 4 4L19 6"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-semibold ${
                  toast.type === "success"
                    ? "text-emerald-700"
                    : "text-red-700"
                }`}
              >
                {toast.type === "success" ? "Success" : "Error"}
              </p>

              <p className="mt-0.5 text-sm text-slate-600">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setToast({ show: false, type: "", message: "" })
              }
              className="shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close notification"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* MAIN */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="16"
                    rx="2"
                  />
                  <path d="M8 4V2m8 2V2M3 9h18" />
                  <path d="M7 13h4M7 17h7" />
                </svg>
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  My Jobs
                </h1>
                <p className="mt-1 text-sm text-slate-500 sm:text-base">
                  Manage your posted jobs and track your openings.
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/jobs/post"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md sm:w-auto"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 5v14M5 12h14"
              />
            </svg>
            Post New Job
          </Link>
        </div>

        {/* SEARCH + FILTERS */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </span>

            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by job title..."
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              maxLength={100}
              autoComplete="off"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              disabled={loading}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Clear
            </button>
          )}
        </div>

        {/* SEARCH INFO */}
        {hasActiveFilters && (
          <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            {keyword.trim() && (
              <span>
                Title:{" "}
                <strong className="text-slate-800">
                  {keyword.trim()}
                </strong>
              </span>
            )}

            {statusFilter && (
              <span className="capitalize">
                Status:{" "}
                <strong className="text-slate-800">
                  {statusFilter}
                </strong>
              </span>
            )}

            {loading ? (
              <span className="text-slate-400">Searching…</span>
            ) : (
              <span className="ml-auto rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {totalJobs}{" "}
                {totalJobs === 1 ? "result" : "results"}
              </span>
            )}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-red-700 shadow-sm">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v4m0 4h.01M10.3 3.6 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z"
                />
              </svg>
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold">
                Something went wrong
              </p>
              <p className="mt-1 text-sm text-red-600">{error}</p>
            </div>

            <button
              type="button"
              onClick={handleClearError}
              className="rounded-lg p-1 text-red-400 transition hover:bg-red-100 hover:text-red-600"
              aria-label="Close error"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* JOB COUNT */}
        {!loading && jobs.length > 0 && (
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">
              {hasActiveFilters
                ? "Matching job postings"
                : "Your job postings"}
            </p>

            <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              {totalJobs} {totalJobs === 1 ? "Job" : "Jobs"}
            </div>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="grid gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="h-6 w-2/3 rounded bg-slate-200" />
                  <div className="h-7 w-16 rounded-full bg-slate-200" />
                </div>

                <div className="space-y-3">
                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                  <div className="h-4 w-2/3 rounded bg-slate-200" />
                  <div className="h-4 w-1/2 rounded bg-slate-200" />
                  <div className="h-16 w-full rounded bg-slate-200" />
                </div>

                <div className="mt-6 flex gap-2">
                  <div className="h-10 w-20 rounded-lg bg-slate-200" />
                  <div className="h-10 w-20 rounded-lg bg-slate-200" />
                  <div className="h-10 w-20 rounded-lg bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY */}
        {!loading && jobs.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm sm:px-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <svg
                className="h-8 w-8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="14"
                  rx="2"
                />
                <path d="M8 5V3h8v2M3 10h18M9 14h6" />
              </svg>
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              {hasActiveFilters
                ? "No jobs match your filters"
                : "No jobs posted yet"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
              {hasActiveFilters
                ? "Try a different search term or clear the filters."
                : "Create your first job posting and start receiving applications from qualified candidates."}
            </p>

            {hasActiveFilters ? (
              <button
                type="button"
                onClick={handleClearFilters}
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
              >
                Clear filters
              </button>
            ) : (
              <Link
                to="/jobs/post"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 5v14M5 12h14"
                  />
                </svg>
                Post Your First Job
              </Link>
            )}
          </div>
        )}

        {/* JOB GRID */}
        {!loading && jobs.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2">
            {jobs.map((job) => {
              const isClosed = job.status === "closed";
              const isDeleting = deletingId === job._id;
              const salaryText = getSalaryText(job);

              return (
                <div
                  key={job._id}
                  className={`group rounded-2xl border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:p-6 ${
                    isDeleting
                      ? "border-red-200 opacity-70"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-xl font-bold text-slate-900">
                        {job.title || "Untitled Job"}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Posted {formatDate(job.createdAt)}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                        isClosed
                          ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                          : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                      }`}
                    >
                      {job.status || "active"}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path d="M3 21h18M5 21V6a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v15M15 10h4a1 1 0 0 1 1 1v10M8 9h4M8 13h4M8 17h4" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Company
                        </p>
                        <p className="text-sm font-semibold text-slate-800">
                          {job.companyId?.name ||
                            job.company ||
                            job.companyName ||
                            "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z"
                          />
                          <circle cx="12" cy="10" r="2.3" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Location
                        </p>
                        <p className="text-sm font-semibold text-slate-800">
                          {job.location || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <rect
                            x="3"
                            y="5"
                            width="18"
                            height="14"
                            rx="2"
                          />
                          <path d="M8 5V3h8v2M8 11h8M8 15h5" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Job Type
                        </p>
                        <p className="text-sm font-semibold capitalize text-slate-800">
                          {job.jobType || job.type || "N/A"}
                        </p>
                      </div>
                    </div>

                    {salaryText && (
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                          <svg
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <circle cx="12" cy="12" r="8.5" />
                            <path d="M14.5 9.5c-.6-.8-1.5-1.2-2.6-1.2-1.5 0-2.5.7-2.5 1.8 0 2.8 5.2 1 5.2 3.8 0 1.2-1.1 2-2.7 2-1.2 0-2.2-.5-2.8-1.3M12 6.8v10.4" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Salary
                          </p>
                          <p className="text-sm font-semibold text-slate-800">
                            {salaryText}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {job.description && (
                    <div className="mt-5 border-t border-slate-100 pt-5">
                      <p className="text-sm leading-6 text-slate-600">
                        {String(job.description).length > 180
                          ? `${String(job.description).substring(0, 180)}...`
                          : job.description}
                      </p>
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap gap-2">
                    {/* <Link
                      to={`/jobs/${job._id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      View
                    </Link> */}

                    <Link
                      to={`/jobs/${job._id}/edit`}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
                    >
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() => openDeleteModal(job)}
                      disabled={loading || Boolean(deletingId)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PAGINATION */}
        {!loading && jobs.length > 0 && totalPages > 1 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={loading || currentPage <= 1}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ← Previous
            </button>

            <div className="flex items-center gap-1.5">
              {getPageNumbers().map((page, index) =>
                page === "..." ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 text-slate-500"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    type="button"
                    onClick={() => loadPage(page)}
                    disabled={loading || page === currentPage}
                    className={`min-w-[38px] rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                      page === currentPage
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    } disabled:cursor-not-allowed`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={loading || currentPage >= totalPages}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        )}

        {/* PAGE INFO */}
        {!loading && jobs.length > 0 && totalPages > 1 && (
          <p className="mt-3 text-center text-xs text-slate-500">
            Showing page {currentPage} of {totalPages} •{" "}
            {totalJobs} total {totalJobs === 1 ? "job" : "jobs"}
          </p>
        )}
      </div>

      {/* DELETE MODAL */}
      {deleteModalOpen && selectedJob && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M4 7h16M10 11v5M14 11v5M6 7l1 13h10l1-13M9 7V4h6v3" />
              </svg>
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Delete this job?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-700">
                "{selectedJob.title}"
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={Boolean(deletingId)}
                className="w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={Boolean(deletingId)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {deletingId ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyJobs;