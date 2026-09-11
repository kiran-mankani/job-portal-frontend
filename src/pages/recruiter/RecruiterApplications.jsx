import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  Search,
  Filter,
  Users,
  BriefcaseBusiness,
  MapPin,
  Mail,
  Phone,
  FileText,
  Eye,
  CheckCircle2,
  XCircle,
  Clock3,
  UserRound,
  RefreshCw,
  ArrowLeft,
  ChevronDown,
  ExternalLink,
} from "lucide-react";

import {
  getRecruiterApplications,
  updateApplicationStatus,
  clearApplicationError,
  clearApplicationSuccess,
} from "../../store/applicationSlice";

function RecruiterApplications() {
  const dispatch = useDispatch();

  const auth = useSelector((state) => state.auth || {});

  const token =
    auth.token ||
    auth.accessToken ||
    localStorage.getItem("token");

  const recruiter = auth.user || {};

  const applicationState = useSelector(
    (state) => state.applications || {}
  );

  const applications = Array.isArray(
    applicationState.applications
  )
    ? applicationState.applications
    : [];

  const loading = Boolean(applicationState.loading);
  const error = applicationState.error || null;
  const success = applicationState.success || null;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [jobFilter, setJobFilter] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (!token) return;

    dispatch(getRecruiterApplications(token));
  }, [dispatch, token]);

  const jobOptions = useMemo(() => {
    const map = new Map();

    applications.forEach((application) => {
      const job = application?.job || {};

      const id = job?._id || job?.id;
      const title = job?.title || "Job";

      if (id && !map.has(String(id))) {
        map.set(String(id), title);
      }
    });

    return Array.from(map.entries()).map(([id, title]) => ({
      id,
      title,
    }));
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applications.filter((application) => {
      const candidate = application?.candidate || {};
      const job = application?.job || {};

      const companyName = getCompanyName(job);

      const matchesSearch =
        !query ||
        String(candidate?.name || "")
          .toLowerCase()
          .includes(query) ||
        String(candidate?.email || "")
          .toLowerCase()
          .includes(query) ||
        String(job?.title || "")
          .toLowerCase()
          .includes(query) ||
        String(companyName || "")
          .toLowerCase()
          .includes(query);

      const currentStatus = String(
        application?.status || ""
      ).toLowerCase();

      const matchesStatus =
        !statusFilter ||
        currentStatus === statusFilter.toLowerCase();

      const applicationJobId =
        job?._id ||
        job?.id ||
        "";

      const matchesJob =
        !jobFilter ||
        String(applicationJobId) === String(jobFilter);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesJob
      );
    });
  }, [
    applications,
    search,
    statusFilter,
    jobFilter,
  ]);

  const totalCount = applications.length;

  const pendingCount = applications.filter(
    (item) =>
      String(item?.status || "").toLowerCase() ===
      "pending"
  ).length;

  const reviewingCount = applications.filter(
    (item) =>
      String(item?.status || "").toLowerCase() ===
      "reviewing"
  ).length;

  const shortlistedCount = applications.filter(
    (item) =>
      String(item?.status || "").toLowerCase() ===
      "shortlisted"
  ).length;

  const hiredCount = applications.filter(
    (item) =>
      String(item?.status || "").toLowerCase() ===
      "hired"
  ).length;

  const handleStatusChange = async (
    applicationId,
    status
  ) => {
    if (!applicationId || !status || !token) {
      return;
    }

    setUpdatingId(applicationId);

    const result = await dispatch(
      updateApplicationStatus({
        id: applicationId,
        status,
        token,
      })
    );

    setUpdatingId(null);

    if (
      updateApplicationStatus.fulfilled.match(
        result
      )
    ) {
      dispatch(getRecruiterApplications(token));

      window.setTimeout(() => {
        dispatch(clearApplicationSuccess());
      }, 1800);
    }
  };

  const handleRetry = () => {
    dispatch(clearApplicationError());

    if (!token) return;

    dispatch(getRecruiterApplications(token));
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setJobFilter("");
  };

  const hasFilters = Boolean(
    search ||
      statusFilter ||
      jobFilter
  );

  const successMessage =
    typeof success === "string"
      ? success
      : success?.message ||
        "Application status updated successfully.";

  const errorMessage =
    typeof error === "string"
      ? error
      : error?.message ||
        "Unable to load applications.";

  if (
    loading &&
    applications.length === 0
  ) {
    return (
      <div className="min-h-screen bg-[#f5f8fc]">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="text-sm font-semibold text-slate-600">
              Loading applications...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Please wait a moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f8fc] text-[#172b4d]">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-[70px] max-w-[1450px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/recruiter/dashboard"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              aria-label="Back to recruiter dashboard"
            >
              <ArrowLeft size={17} />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Users size={17} />
                </div>

                <h1 className="truncate text-[18px] font-bold text-[#172b4d]">
                  Applications
                </h1>
              </div>

              <p className="mt-0.5 hidden text-[10px] text-slate-400 sm:block">
                Review and manage candidate applications
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-[12px] font-semibold text-[#172b4d]">
                {recruiter.name ||
                  recruiter.fullName ||
                  "Recruiter"}
              </p>

              <p className="text-[9px] text-slate-400">
                Recruiter
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
              {getInitials(
                recruiter.name ||
                  recruiter.fullName ||
                  "Recruiter"
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1450px] px-4 py-5 sm:px-6 lg:px-8">
        <section className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Recruiter Portal
            </p>

            <h2 className="text-[25px] font-bold leading-tight text-[#152b4d] sm:text-[29px]">
              Candidate Applications
            </h2>

            <p className="mt-1.5 text-[13px] text-slate-500">
              Review candidates and update their application status.
            </p>
          </div>

          <Link
            to="/recruiter/dashboard"
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600"
          >
            Dashboard
          </Link>
        </section>

        {success && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">
            <CheckCircle2 size={17} />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="mb-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <XCircle
                size={18}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div>
                <p className="text-xs font-semibold text-red-700">
                  Unable to load applications
                </p>

                <p className="mt-1 text-[11px] text-red-600">
                  {errorMessage}
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

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryCard
            title="Total Applications"
            value={totalCount}
            icon={<Users size={20} />}
            box="bg-blue-50 text-blue-600"
          />

          <SummaryCard
            title="Pending"
            value={pendingCount}
            icon={<Clock3 size={20} />}
            box="bg-amber-50 text-amber-600"
          />

          <SummaryCard
            title="Reviewing"
            value={reviewingCount}
            icon={<FileText size={20} />}
            box="bg-orange-50 text-orange-600"
          />

          <SummaryCard
            title="Shortlisted"
            value={shortlistedCount}
            icon={<CheckCircle2 size={20} />}
            box="bg-purple-50 text-purple-600"
          />

          <SummaryCard
            title="Hired"
            value={hiredCount}
            icon={<UserRound size={20} />}
            box="bg-emerald-50 text-emerald-600"
          />
        </section>

        <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h3 className="text-[14px] font-bold text-[#172b4d]">
                Applications
              </h3>

              <p className="mt-1 text-[10px] text-slate-400">
                {filteredApplications.length} of{" "}
                {applications.length} applications shown
              </p>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-left text-[10px] font-semibold text-blue-600 hover:text-blue-700"
              >
                Clear all filters
              </button>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_180px_220px]">
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
                placeholder="Search candidate, job, or email..."
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div className="relative">
              <Filter
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-8 text-xs text-slate-700 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewing">Reviewing</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
                <option value="hired">Hired</option>
              </select>

              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="relative">
              <BriefcaseBusiness
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={jobFilter}
                onChange={(event) =>
                  setJobFilter(event.target.value)
                }
                className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-8 text-xs text-slate-700 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
              >
                <option value="">All Jobs</option>

                {jobOptions.map((job) => (
                  <option
                    key={job.id}
                    value={job.id}
                  >
                    {job.title}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>
        </section>

        <section className="mt-5">
          {filteredApplications.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white px-5 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                <Users size={28} />
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-700">
                {applications.length === 0
                  ? "No applications yet"
                  : "No matching applications"}
              </h3>

              <p className="mx-auto mt-1.5 max-w-md text-xs leading-5 text-slate-400">
                {applications.length === 0
                  ? "Candidate applications will appear here when someone applies to your jobs."
                  : "Try changing your search or filters to find the application you need."}
              </p>

              {applications.length > 0 &&
                hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-4 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Clear Filters
                  </button>
                )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map(
                (application) => {
                  const candidate =
                    application?.candidate || {};

                  const job =
                    application?.job || {};

                  const applicationId =
                    application?._id ||
                    application?.id;

                  const currentStatus =
                    String(
                      application?.status ||
                        "pending"
                    ).toLowerCase();

                  const candidateInitial =
                    getInitials(
                      candidate?.name ||
                        "Candidate"
                    );

                  const isUpdating =
                    updatingId ===
                    applicationId;

                  return (
                    <ApplicationCard
                      key={
                        applicationId ||
                        `${candidate?.email || "candidate"}-${job?._id || job?.id || "job"}`
                      }
                      application={application}
                      candidate={candidate}
                      job={job}
                      currentStatus={currentStatus}
                      candidateInitial={candidateInitial}
                      isUpdating={isUpdating}
                      onStatusChange={
                        handleStatusChange
                      }
                    />
                  );
                }
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

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

function ApplicationCard({
  application,
  candidate,
  job,
  currentStatus,
  candidateInitial,
  isUpdating,
  onStatusChange,
}) {
  const applicationId =
    application?._id ||
    application?.id;

  const jobId =
    job?._id ||
    job?.id;

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
            {candidateInitial}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-[14px] font-bold text-[#172b4d]">
              {candidate?.name || "Candidate"}
            </h3>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-slate-400">
              {candidate?.email && (
                <span className="inline-flex items-center gap-1">
                  <Mail size={11} />
                  {candidate.email}
                </span>
              )}

              {candidate?.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone size={11} />
                  {candidate.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge status={currentStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:px-5 lg:grid-cols-4">
        <InfoItem
          label="Applied For"
          icon={<BriefcaseBusiness size={13} />}
          value={job?.title || "Job not available"}
        />

        <InfoItem
          label="Company"
          icon={<Users size={13} />}
          value={getCompanyName(job)}
        />

        <InfoItem
          label="Location"
          icon={<MapPin size={13} />}
          value={job?.location || "Not specified"}
        />

        <InfoItem
          label="Applied On"
          icon={<Clock3 size={13} />}
          value={
            application?.createdAt
              ? formatDate(application.createdAt)
              : "Not available"
          }
        />
      </div>

      {application?.coverLetter && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-4 sm:px-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Cover Letter
          </p>

          <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-600">
            {application.coverLetter}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4 border-t border-slate-100 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="mb-2 text-[10px] font-semibold text-slate-500">
            Update Status
          </p>

          <div className="flex flex-wrap gap-2">
            {[
              "pending",
              "reviewing",
              "shortlisted",
              "rejected",
              "hired",
            ].map((status) => {
              const active =
                currentStatus === status;

              return (
                <button
                  key={status}
                  type="button"
                  disabled={
                    isUpdating ||
                    active
                  }
                  onClick={() =>
                    onStatusChange(
                      applicationId,
                      status
                    )
                  }
                  className={`rounded-lg px-3 py-2 text-[9px] font-semibold capitalize transition ${
                    active
                      ? getActiveStatusButton(status)
                      : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  } ${
                    isUpdating || active
                      ? "cursor-not-allowed opacity-70"
                      : ""
                  }`}
                >
                  {isUpdating && !active
                    ? "Updating..."
                    : status}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(application?.cvUrl ||
            application?.cv ||
            application?.resume) && (
            <a
              href={
                application.cvUrl ||
                application.cv ||
                application.resume
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[9px] font-semibold text-slate-600 hover:border-emerald-200 hover:text-emerald-600"
            >
              <FileText size={13} />
              View CV
              <ExternalLink size={10} />
            </a>
          )}

          {jobId && (
            <Link
              to={`/jobs/${jobId}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[9px] font-semibold text-slate-600 hover:border-blue-200 hover:text-blue-600"
            >
              <BriefcaseBusiness size={13} />
              View Job
            </Link>
          )}

          <Link
            to={
              applicationId
                ? `/recruiter/applications/${applicationId}`
                : "/recruiter/applications"
            }
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-[9px] font-semibold text-white hover:bg-blue-700"
          >
            <Eye size={13} />
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}

function InfoItem({
  label,
  icon,
  value,
}) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </p>

      <p className="mt-1 truncate text-[11px] font-semibold text-[#304563]">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = String(
    status || ""
  ).toLowerCase();

  let classes =
    "bg-slate-100 text-slate-600";

  if (normalized === "pending") {
    classes = "bg-amber-50 text-amber-700";
  }

  if (normalized === "reviewing") {
    classes = "bg-orange-50 text-orange-600";
  }

  if (normalized === "shortlisted") {
    classes = "bg-purple-50 text-purple-600";
  }

  if (normalized === "hired") {
    classes = "bg-emerald-50 text-emerald-600";
  }

  if (normalized === "rejected") {
    classes = "bg-red-50 text-red-600";
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[8px] font-bold capitalize ${classes}`}
    >
      {status || "Unknown"}
    </span>
  );
}

function getActiveStatusButton(status) {
  switch (status) {
    case "pending":
      return "border border-amber-200 bg-amber-50 text-amber-700";

    case "reviewing":
      return "border border-orange-200 bg-orange-50 text-orange-600";

    case "shortlisted":
      return "border border-purple-200 bg-purple-50 text-purple-600";

    case "rejected":
      return "border border-red-200 bg-red-50 text-red-600";

    case "hired":
      return "border border-emerald-200 bg-emerald-50 text-emerald-600";

    default:
      return "border border-blue-200 bg-blue-50 text-blue-600";
  }
}

function getCompanyName(job) {
  if (typeof job?.company === "string") {
    return job.company;
  }

  return (
    job?.company?.name ||
    job?.companyName ||
    job?.recruiter?.company ||
    job?.recruiter?.companyName ||
    "Company"
  );
}

function getInitials(name) {
  if (!name) return "C";

  return (
    String(name)
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "C"
  );
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default RecruiterApplications;