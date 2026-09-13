import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  BriefcaseBusiness,
  Users,
  CalendarDays,
  Plus,
  ArrowRight,
  Search,
  FileText,
  RefreshCw,
  BarChart3,
  ChevronDown,
  MoreVertical,
  UserRound,
  Video,
  TrendingUp,
  Clock3,
} from "lucide-react";

import {
  getRecruiterDashboard,
  clearDashboardError,
} from "../../store/dashboardSlice";

import { logout } from "../../store/authSlice";

function RecruiterDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  // =========================================================
  // AUTH
  // =========================================================

  const auth = useSelector((state) => state.auth || {});
  const token =
    auth.token ||
    auth.accessToken ||
    localStorage.getItem("token") ||
    null;

  const user = auth.user || {};
  const recruiterName =
    user.name ||
    user.fullName ||
    user.username ||
    user.email ||
    "Recruiter";

  // =========================================================
  // DASHBOARD
  // =========================================================

  const dashboardState = useSelector(
    (state) => state.dashboard || {}
  );

  const dashboard =
    dashboardState.data || dashboardState.dashboard || {};

  const loading = Boolean(dashboardState.loading);
  const rawError = dashboardState.error || null;

  const errorMessage =
    typeof rawError === "string"
      ? rawError
      : rawError?.message ||
        rawError?.error ||
        "Unable to load recruiter dashboard.";

  const hasError = Boolean(rawError);

  // =========================================================
  // LOAD
  // =========================================================

  useEffect(() => {
    if (!token) return;
    dispatch(getRecruiterDashboard({ token }));
  }, [dispatch, token]);

  // =========================================================
  // HELPERS (same as before — kept identical)
  // =========================================================

  const getNumber = (object, keys, fallback = 0) => {
    for (const key of keys) {
      const value = object?.[key];

      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        Number.isFinite(Number(value))
      ) {
        return Number(value);
      }
    }
    return fallback;
  };

  const getJobId = (job) => String(job?._id || job?.id || "");
  const getApplicationId = (application) =>
    String(application?._id || application?.id || "");
  const getInterviewId = (interview) =>
    String(interview?._id || interview?.id || "");

  const getCompanyName = (job = {}) => {
    const company = job?.company;

    if (typeof company === "string") return company;
    if (company && typeof company === "object") {
      return String(company.companyName || company.name || "Company");
    }

    return String(
      job?.companyName ||
        job?.recruiter?.companyName ||
        job?.recruiter?.company?.name ||
        "Company"
    );
  };

  const getLocation = (job = {}) => {
    const location = job?.location;

    if (typeof location === "string") return location;
    if (location && typeof location === "object") {
      return String(
        location.city || location.name || location.address || "Location"
      );
    }

    return String(job?.companyLocation || "Location");
  };

  const getInitials = (name = "") => {
    const value = String(name).trim();
    if (!value) return "R";

    return (
      value
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((item) => item.charAt(0).toUpperCase())
        .join("") || "R"
    );
  };

  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatShortDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
    });
  };

  const formatDateTime = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // =========================================================
  // BACKEND DATA
  // =========================================================

  const statistics =
    dashboard?.statistics && typeof dashboard.statistics === "object"
      ? dashboard.statistics
      : {};

  const jobCounts =
    dashboard?.jobCounts && typeof dashboard.jobCounts === "object"
      ? dashboard.jobCounts
      : dashboard?.jobsCount && typeof dashboard.jobsCount === "object"
      ? dashboard.jobsCount
      : {};

  const applicationCounts =
    dashboard?.applicationCounts &&
    typeof dashboard.applicationCounts === "object"
      ? dashboard.applicationCounts
      : dashboard?.applicationsCount &&
        typeof dashboard.applicationsCount === "object"
      ? dashboard.applicationsCount
      : {};

  const interviewCounts =
    dashboard?.interviewCounts &&
    typeof dashboard.interviewCounts === "object"
      ? dashboard.interviewCounts
      : dashboard?.interviewsCount &&
        typeof dashboard.interviewsCount === "object"
      ? dashboard.interviewsCount
      : {};

  const recentJobs = Array.isArray(dashboard?.recentJobs)
    ? dashboard.recentJobs
    : [];

  const recentApplications = Array.isArray(
    dashboard?.recentApplications
  )
    ? dashboard.recentApplications
    : [];

  const upcomingInterviews = Array.isArray(
    dashboard?.upcomingInterviews
  )
    ? dashboard.upcomingInterviews
    : [];

  // =========================================================
  // COUNTS
  // =========================================================

  const totalJobs = getNumber(
    dashboard,
    ["totalJobs"],
    getNumber(
      statistics,
      ["totalJobs"],
      getNumber(jobCounts, ["total", "count"], 0)
    )
  );

  const activeJobs = getNumber(
    dashboard,
    ["activeJobs"],
    getNumber(jobCounts, ["active"], 0)
  );

  const totalApplications = getNumber(
    dashboard,
    ["totalApplications"],
    getNumber(
      statistics,
      ["totalApplications"],
      getNumber(applicationCounts, ["total", "count"], 0)
    )
  );

  const pendingCount = getNumber(
    dashboard,
    ["pendingApplications"],
    getNumber(applicationCounts, ["pending"], 0)
  );

  const reviewingCount = getNumber(
    dashboard,
    ["reviewingApplications"],
    getNumber(applicationCounts, ["reviewing", "screening"], 0)
  );

  const shortlistedCount = getNumber(
    dashboard,
    ["shortlistedApplications"],
    getNumber(applicationCounts, ["shortlisted"], 0)
  );

  const rejectedCount = getNumber(
    dashboard,
    ["rejectedApplications"],
    getNumber(applicationCounts, ["rejected"], 0)
  );

  const hiredCount = getNumber(
    dashboard,
    ["hired", "hiredApplications"],
    getNumber(
      statistics,
      ["hired"],
      getNumber(applicationCounts, ["hired"], 0)
    )
  );

  const totalInterviews = getNumber(
    dashboard,
    ["totalInterviews", "scheduledInterviews"],
    getNumber(
      statistics,
      ["totalInterviews", "scheduledInterviews"],
      getNumber(interviewCounts, ["total", "count"], 0)
    )
  );

  const interviewApplicationCount = getNumber(
    applicationCounts,
    ["interview", "interviewed"],
    getNumber(dashboard, ["interviewApplications"], 0)
  );

  const statusItems = [
    { label: "Applied", value: pendingCount, dot: "bg-blue-500" },
    { label: "Screening", value: reviewingCount, dot: "bg-amber-400" },
    { label: "Interview", value: interviewApplicationCount, dot: "bg-emerald-500" },
    { label: "Shortlisted", value: shortlistedCount, dot: "bg-purple-500" },
    { label: "Hired", value: hiredCount, dot: "bg-cyan-500" },
    { label: "Rejected", value: rejectedCount, dot: "bg-red-500" },
  ];

  // =========================================================
  // SEARCHED JOBS
  // =========================================================

  const displayedJobs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return recentJobs.slice(0, 5);

    return recentJobs
      .filter((job) => {
        const title = String(job?.title || "").toLowerCase();
        const company = getCompanyName(job).toLowerCase();
        const location = getLocation(job).toLowerCase();
        const category =
          typeof job?.category === "object"
            ? String(job?.category?.name || job?.category?.title || "")
            : String(job?.category || "");
        const department =
          typeof job?.department === "object"
            ? String(job?.department?.name || job?.department?.title || "")
            : String(job?.department || "");
        const skills = Array.isArray(job?.skills)
          ? job.skills
              .map((skill) =>
                typeof skill === "object"
                  ? skill?.name || skill?.title || ""
                  : String(skill)
              )
              .join(" ")
              .toLowerCase()
          : String(job?.skills || "").toLowerCase();

        return (
          title.includes(query) ||
          company.includes(query) ||
          location.includes(query) ||
          category.toLowerCase().includes(query) ||
          department.toLowerCase().includes(query) ||
          skills.includes(query)
        );
      })
      .slice(0, 5);
  }, [recentJobs, search]);

  // =========================================================
  // ACTIVITY
  // =========================================================

  const activities = useMemo(() => {
    const list = [];

    recentApplications.forEach((application) => {
      const candidate = application?.candidate || {};
      const job = application?.job || {};
      const date = application?.createdAt || application?.updatedAt;
      if (!date) return;

      const applicationId = getApplicationId(application);
      list.push({
        id: `application-${applicationId || `${date}-${candidate.name || "candidate"}`}`,
        icon: Users,
        bg: "bg-emerald-50",
        color: "text-emerald-600",
        text: `${candidate.name || candidate.fullName || "Candidate"} applied for ${job.title || "your job"}`,
        date,
      });
    });

    upcomingInterviews.forEach((interview) => {
      const candidate = interview?.candidate || {};
      const date = interview?.date || interview?.scheduledAt;
      if (!date) return;

      const interviewId = getInterviewId(interview);
      list.push({
        id: `interview-${interviewId || date}`,
        icon: CalendarDays,
        bg: "bg-purple-50",
        color: "text-purple-600",
        text: `Interview scheduled with ${candidate.name || candidate.fullName || "candidate"}`,
        date,
      });
    });

    recentJobs.forEach((job) => {
      const date = job?.createdAt || job?.updatedAt;
      if (!date) return;

      const jobId = getJobId(job);
      list.push({
        id: `job-${jobId || `${date}-${job.title || "job"}`}`,
        icon: BriefcaseBusiness,
        bg: "bg-blue-50",
        color: "text-blue-600",
        text: `New job posted: ${job.title || "Untitled Job"}`,
        date,
      });
    });

    return list
      .filter(
        (item) =>
          item.id &&
          item.date &&
          !Number.isNaN(new Date(item.date).getTime())
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [recentApplications, upcomingInterviews, recentJobs]);

  // =========================================================
  // RETRY
  // =========================================================

  const handleRetry = () => {
    dispatch(clearDashboardError());
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    dispatch(getRecruiterDashboard({ token }));
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (
    loading &&
    !dashboardState.data &&
    !dashboardState.dashboard
  ) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="text-sm font-medium text-slate-500">
            Loading recruiter dashboard...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER (content only — layout is in RecruiterLayout)
  // =========================================================

  return (
    <>
      {/* ERROR */}
      {hasError && (
        <div className="mb-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-red-700">
              Unable to load dashboard
            </p>
            <p className="mt-1 text-xs text-red-600">{errorMessage}</p>
          </div>

          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
          >
            <RefreshCw size={15} />
            Retry
          </button>
        </div>
      </header>

      {/* =====================================================
          MOBILE MENU
      ====================================================== */}

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">

          <button
            type="button"
            className="absolute inset-0 h-full w-full bg-black/40"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            aria-label="Close menu"
          />

          <aside className="relative h-full w-[270px] bg-[#0d203d] p-4 text-white shadow-2xl">

            <div className="mb-8 flex items-center gap-3 px-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                <Users size={21} />
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  TalentHub
                </h2>

                <p className="text-[10px] text-slate-300">
                  Recruiter
                </p>
              </div>
            </div>

            <nav className="space-y-1.5">
              <MobileItem
                active
                icon={<BarChart3 size={18} />}
                label="Dashboard"
                onClick={() =>
                  openMobilePage(
                    "/recruiter/dashboard"
                  )
                }
              />

              <MobileItem
                icon={
                  <BriefcaseBusiness size={18} />
                }
                label="Jobs"
                onClick={() =>
                  openMobilePage(
                    "/jobs/my-jobs"
                  )
                }
              />

              <MobileItem
                icon={<Users size={18} />}
                label="Candidates"
                onClick={() =>
                  openMobilePage(
                    "/recruiter/applications"
                  )
                }
              />

              <MobileItem
                icon={
                  <CalendarDays size={18} />
                }
                label="Interviews"
                onClick={() =>
                  openMobilePage(
                    "/recruiter/interviews"
                  )
                }
              />

              <MobileItem
                icon={
                  <MessageCircle size={18} />
                }
                label="Messages"
                onClick={() =>
                  openMobilePage(
                    "/recruiter/messages"
                  )
                }
              />

              <MobileItem
                icon={<BarChart3 size={18} />}
                label="Reports"
                onClick={() =>
                  openMobilePage(
                    "/recruiter/reports"
                  )
                }
              />

              <MobileItem
                icon={<Settings size={18} />}
                label="Settings"
                onClick={() =>
                  openMobilePage(
                    "/recruiter/settings"
                  )
                }
              />
            </nav>

            <button
              type="button"
              onClick={handleLogout}
              className="absolute bottom-7 left-4 flex w-[calc(100%-32px)] items-center gap-3 rounded-lg px-4 py-3 text-sm text-slate-300 hover:bg-white/10"
            >
              <LogOut size={18} />
              Logout
            </button>
          </aside>
        </div>
      )}

      {/* WELCOME */}
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-[25px] font-bold leading-tight text-[#152b4d]">
            Welcome back, {recruiterName}! 👋
          </h1>
          <p className="mt-1.5 text-[14px] text-slate-500">
            Discover great talent and build your team with confidence.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <CalendarDays size={16} />
          {formatDate(new Date())}
        </div>
      </section>

      {/* STATS */}
      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Jobs"
          value={totalJobs}
          icon={<BriefcaseBusiness size={22} />}
          iconClass="bg-blue-50 text-blue-600"
          subText={`${activeJobs} active`}
        />
        <StatCard
          title="Total Applications"
          value={totalApplications}
          icon={<Users size={22} />}
          iconClass="bg-emerald-50 text-emerald-600"
          subText={`${pendingCount} pending`}
        />
        <StatCard
          title="Interviews Scheduled"
          value={totalInterviews}
          icon={<CalendarDays size={22} />}
          iconClass="bg-orange-50 text-orange-600"
          subText={`${upcomingInterviews.length} upcoming`}
        />
        <StatCard
          title="Hired"
          value={hiredCount}
          icon={<UserRound size={22} />}
          iconClass="bg-purple-50 text-purple-600"
          subText={`${shortlistedCount} shortlisted`}
        />
      </section>

      {/* OVERVIEW */}
      <section className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(285px,0.85fr)_245px]">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5">
            <h2 className="text-[15px] font-bold text-[#172b4d]">
              Application Overview
            </h2>
            <span className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-medium text-slate-600">
              Last 7 Days
              <ChevronDown size={13} />
            </span>
          </div>

          <div className="p-4 sm:p-5">
            <ApplicationChart applications={recentApplications} />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-[15px] font-bold text-[#172b4d]">
              Application Status
            </h2>
          </div>

          <div className="flex flex-col items-center gap-5 p-5 sm:flex-row">
            <StatusDonut total={totalApplications} items={statusItems} />

            <div className="min-w-0 w-full flex-1 space-y-3">
              {statusItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.dot}`}
                    />
                    <span className="truncate text-[10px] text-slate-600">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-700">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-[15px] font-bold text-[#172b4d]">
            Quick Actions
          </h2>

          <div className="mt-4 space-y-2.5">
            <QuickAction
              to="/jobs/post"
              label="Post New Job"
              icon={<Plus size={18} />}
              primary
            />
            <QuickAction
              to="/recruiter/applications"
              label="View All Candidates"
              icon={<Users size={18} />}
            />
            <QuickAction
              to="/recruiter/interviews/schedule"
              label="Schedule Interview"
              icon={<CalendarDays size={18} />}
            />
          </div>
        </div>
      </section>

      {/* RECENT JOB POSTINGS */}
      <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5">
          <h2 className="text-[15px] font-bold text-[#172b4d]">
            Recent Job Postings
          </h2>
          <Link
            to="/jobs/my-jobs"
            className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-700 sm:text-[11px]"
          >
            View All Jobs
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="px-5 py-3 text-left text-[10px] font-semibold text-slate-500">
                  Job Title
                </th>
                <th className="px-3 py-3 text-left text-[10px] font-semibold text-slate-500">
                  Department
                </th>
                <th className="px-3 py-3 text-left text-[10px] font-semibold text-slate-500">
                  Applications
                </th>
                <th className="px-3 py-3 text-left text-[10px] font-semibold text-slate-500">
                  Status
                </th>
                <th className="px-3 py-3 text-left text-[10px] font-semibold text-slate-500">
                  Posted On
                </th>
                <th className="px-5 py-3 text-right text-[10px] font-semibold text-slate-500">
                  More
                </th>
              </tr>
            </thead>

            <tbody>
              {displayedJobs.map((job, index) => {
                const jobId = getJobId(job);

                const applicationCount = getNumber(
                  job,
                  ["applicationCount", "applicationsCount"],
                  Array.isArray(job?.applications)
                    ? job.applications.length
                    : 0
                );

                const department =
                  typeof job?.department === "object"
                    ? job?.department?.name ||
                      job?.department?.title ||
                      "General"
                    : job?.department || job?.category || "General";

                return (
                  <tr
                    key={jobId || `job-row-${index}`}
                    className="border-t border-slate-100 transition hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <BriefcaseBusiness size={15} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[10px] font-semibold text-[#263b59] sm:text-[11px]">
                            {job?.title || "Untitled Job"}
                          </p>
                          <p className="mt-0.5 truncate text-[8px] text-slate-400">
                            {getCompanyName(job)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3 text-[10px] text-slate-500">
                      {department}
                    </td>

                    <td className="px-3 py-3 text-[10px] font-semibold text-slate-700">
                      {applicationCount}
                    </td>

                    <td className="px-3 py-3">
                      <StatusBadge status={job?.status || "active"} />
                    </td>

                    <td className="px-3 py-3 text-[10px] text-slate-500">
                      {formatShortDate(job?.createdAt)}
                    </td>

                    <td className="px-5 py-3 text-right">
                      {jobId ? (
                        <Link
                          to={`/jobs/${jobId}`}
                          className="inline-flex rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                          aria-label={`View ${job?.title || "job"}`}
                        >
                          <MoreVertical size={15} />
                        </Link>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {displayedJobs.length === 0 && (
            <div className="px-5 py-12 text-center">
              <BriefcaseBusiness
                size={32}
                className="mx-auto text-slate-300"
              />
              <p className="mt-2 text-xs font-semibold text-slate-500">
                No job postings found
              </p>
              <p className="mt-1 text-[10px] text-slate-400">
                Start by posting your first job
              </p>
              <Link
                to="/jobs/post"
                className="mt-4 inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-[10px] font-semibold text-white hover:bg-blue-700"
              >
                <Plus size={13} />
                Post New Job
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* BOTTOM SECTIONS */}
      <section className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_245px]">
        {/* LATEST APPLICATIONS */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-[15px] font-bold text-[#172b4d]">
              Latest Applications
            </h2>
            <Link
              to="/recruiter/applications"
              className="flex items-center gap-1 text-[10px] font-semibold text-blue-600"
            >
              View All
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentApplications.slice(0, 5).map((application, index) => {
              const candidate = application?.candidate || {};
              const job = application?.job || {};
              const applicationId = getApplicationId(application);

              return (
                <button
                  type="button"
                  key={applicationId || `application-${index}`}
                  onClick={() => navigate("/recruiter/applications")}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                    {getInitials(candidate.name || candidate.fullName || "Candidate")}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-semibold text-[#263b59]">
                      {candidate.name || candidate.fullName || "Candidate"}
                    </p>
                    <p className="truncate text-[9px] text-slate-400">
                      {job.title || "Job"}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <StatusBadge status={application?.status || "pending"} />
                    <p className="mt-1 text-[8px] text-slate-400">
                      {formatShortDate(application?.createdAt)}
                    </p>
                  </div>
                </button>
              );
            })}

            {recentApplications.length === 0 && (
              <EmptySmall icon={<FileText size={28} />} text="No applications yet" />
            )}
          </div>
        </div>

        {/* UPCOMING INTERVIEWS */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-[15px] font-bold text-[#172b4d]">
              Upcoming Interviews
            </h2>
            <Link
              to="/recruiter/interviews"
              className="flex items-center gap-1 text-[10px] font-semibold text-blue-600"
            >
              View All
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {upcomingInterviews.slice(0, 5).map((interview, index) => {
              const candidate = interview?.candidate || {};
              const application = interview?.application || {};
              const job = application?.job || interview?.job || {};
              const interviewDate = interview?.date || interview?.scheduledAt;
              const interviewId = getInterviewId(interview);

              return (
                <button
                  type="button"
                  key={interviewId || `interview-${index}`}
                  onClick={() => navigate("/recruiter/interviews")}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                    <CalendarDays size={15} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-semibold text-[#263b59]">
                      {candidate.name || candidate.fullName || "Candidate"}
                    </p>
                    <p className="truncate text-[9px] text-slate-400">
                      {job.title || "Interview"}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-[9px] font-semibold text-slate-600">
                      {formatDateTime(interviewDate)}
                    </p>
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[8px] font-semibold capitalize text-blue-600">
                      <Video size={9} />
                      {interview?.mode || "Online"}
                    </span>
                  </div>
                </button>
              );
            })}

            {upcomingInterviews.length === 0 && (
              <EmptySmall
                icon={<CalendarDays size={28} />}
                text="No upcoming interviews"
              />
            )}
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-[15px] font-bold text-[#172b4d]">
              Recent Activity
            </h2>
          </div>

          <div className="p-5">
            {activities.length > 0 ? (
              <div className="relative">
                <div className="absolute bottom-4 left-4 top-4 w-px bg-slate-200" />

                <div className="space-y-5">
                  {activities.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div key={activity.id} className="relative flex gap-3">
                        <div
                          className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${activity.bg} ${activity.color}`}
                        >
                          <Icon size={14} />
                        </div>

                        <div className="min-w-0 pt-0.5">
                          <p className="text-[9px] font-semibold leading-4 text-[#263b59]">
                            {activity.text}
                          </p>
                          <p className="mt-1 text-[8px] text-slate-400">
                            {formatDateTime(activity.date)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <Clock3 size={28} className="mx-auto text-slate-300" />
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  No recent activity
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

// =========================================================
// SHARED SUBCOMPONENTS (copied from original file)
// =========================================================

function StatCard({ title, value, icon, iconClass, subText }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>

      <p className="mt-4 text-[12px] font-medium text-slate-500">{title}</p>

      <p className="mt-1 text-[29px] font-bold leading-none text-[#152b4d]">
        {value}
      </p>

      <p className="mt-3 flex items-center gap-1 text-[10px] font-medium text-emerald-600">
        <TrendingUp size={12} />
        {subText}
      </p>
    </div>
  );
}

function QuickAction({ to, icon, label, primary = false }) {
  return (
    <Link
      to={to}
      className={`flex min-h-[44px] items-center gap-3 rounded-lg px-3.5 py-2.5 text-[10px] font-semibold transition ${
        primary
          ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
          : "border border-slate-200 bg-blue-50/50 text-[#294466] hover:bg-blue-100"
      }`}
    >
      <span className={primary ? "text-white" : "text-blue-600"}>{icon}</span>
      {label}
    </Link>
  );
}

function StatusBadge({ status }) {
  const value = String(status || "").trim().toLowerCase();

  let classes = "bg-slate-100 text-slate-600";

  if (
    ["active", "hired", "shortlisted", "scheduled", "completed", "approved"].includes(
      value
    )
  ) {
    classes = "bg-emerald-50 text-emerald-600";
  }

  if (
    ["pending", "reviewing", "screening", "interview", "applied"].includes(value)
  ) {
    classes = "bg-amber-50 text-amber-600";
  }

  if (
    ["rejected", "closed", "cancelled", "withdrawn", "inactive"].includes(value)
  ) {
    classes = "bg-red-50 text-red-500";
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[8px] font-semibold capitalize ${classes}`}
    >
      {status || "Unknown"}
    </span>
  );
}

function StatusDonut({ total, items }) {
  const size = 120;
  const radius = 42;
  const stroke = 15;
  const circumference = 2 * Math.PI * radius;

  const totalValue = items.reduce(
    (sum, item) => sum + Number(item.value || 0),
    0
  );

  const colors = ["#2563eb", "#f59e0b", "#10b981", "#8b5cf6", "#06b6d4", "#ef4444"];

  let offset = 0;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        role="img"
        aria-label="Application status chart"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#edf2f7"
          strokeWidth={stroke}
        />

        {totalValue > 0 &&
          items.map((item, index) => {
            const value = Number(item.value) || 0;
            if (value <= 0) return null;

            const length = (value / totalValue) * circumference;
            const dashOffset = -offset;
            offset += length;

            return (
              <circle
                key={item.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={colors[index % colors.length]}
                strokeWidth={stroke}
                strokeDasharray={`${length} ${circumference}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="butt"
              />
            );
          })}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[21px] font-bold text-[#172b4d]">{total}</span>
        <span className="text-[9px] text-slate-400">Total</span>
      </div>
    </div>
  );
}

function ApplicationChart({ applications }) {
  const today = new Date();

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(today.getDate() - (6 - index));
    return date;
  });

  const getDateKey = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;

  const grouped = {};

  applications.forEach((application) => {
    const dateValue = application?.createdAt || application?.updatedAt;
    if (!dateValue) return;

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return;

    const key = getDateKey(date);
    grouped[key] = grouped[key] ? grouped[key] + 1 : 1;
  });

  const points = days.map((date) => ({
    date,
    value: grouped[getDateKey(date)] || 0,
  }));

  const width = 600;
  const height = 190;
  const left = 25;
  const right = 10;
  const top = 15;
  const bottom = 28;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;

  const maxValue = Math.max(1, ...points.map((p) => p.value));

  const coords = points.map((point, index) => {
    const x = left + (index / 6) * chartWidth;
    const y = top + chartHeight - (point.value / maxValue) * chartHeight;
    return { ...point, x, y };
  });

  const line = coords
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const last = coords[coords.length - 1];
  const first = coords[0];

  const area = `${line} L ${last.x} ${top + chartHeight} L ${first.x} ${
    top + chartHeight
  } Z`;

  const gradientId = "recruiterApplicationChartFill";

  return (
    <div className="h-[190px] w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full overflow-visible"
        preserveAspectRatio="none"
        role="img"
        aria-label="Applications over the last seven days"
      >
        {[0, 1, 2, 3, 4].map((index) => {
          const y = top + (index / 4) * chartHeight;
          return (
            <line
              key={`horizontal-${index}`}
              x1={left}
              x2={width - right}
              y1={y}
              y2={y}
              stroke="#e7edf4"
              strokeWidth="1"
            />
          );
        })}

        {coords.map((point, index) => (
          <line
            key={`vertical-${index}`}
            x1={point.x}
            x2={point.x}
            y1={top}
            y2={top + chartHeight}
            stroke="#eef2f7"
            strokeWidth="1"
          />
        ))}

        <path d={area} fill={`url(#${gradientId})`} />
        <path
          d={line}
          fill="none"
          stroke="#2563eb"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {coords.map((point, index) => (
          <circle
            key={`point-${index}`}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#2563eb"
            stroke="#fff"
            strokeWidth="2"
          />
        ))}

        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.01" />
          </linearGradient>
        </defs>
      </svg>

      <div className="mt-[-22px] flex justify-between pl-4 pr-2">
        {points.map((point, index) => (
          <span key={`date-${index}`} className="text-[8px] text-slate-400">
            {point.date.toLocaleDateString(undefined, {
              day: "2-digit",
              month: "short",
            })}
          </span>
        ))}
      </div>
    </div>
  );
}

function EmptySmall({ icon, text }) {
  return (
    <div className="px-5 py-10 text-center text-slate-400">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
        {icon}
      </div>
      <p className="mt-2 text-xs font-semibold text-slate-500">{text}</p>
    </div>
  );
}

export default RecruiterDashboard;