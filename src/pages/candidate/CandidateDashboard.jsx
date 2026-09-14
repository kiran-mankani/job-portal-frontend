import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  Search,
  Briefcase,
  CalendarDays,
  Bookmark,
  FileText,
  User,
  MapPin,
  ArrowRight,
  Upload,
  CheckCircle2,
  Video,
  Star,
  Lightbulb,
  Send,
  Bell,
} from "lucide-react";

import {
  getCandidateDashboard,
  clearDashboardError,
} from "../../store/dashboardSlice";

import { getAllJobs } from "../../store/jobSlice";

import { apiRequest } from "../../services/api";

const CandidateDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // =========================================================
  // AUTH
  // =========================================================

  const auth = useSelector((state) => state.auth || {});
  const user = auth.user || {};
  const token =
    auth.token || localStorage.getItem("token") || null;

  const userName =
    user.name || user.fullName || user.username || "Candidate";

  // =========================================================
  // GREETING
  // =========================================================

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Good Night";
  };

  const greeting = getGreeting();

  // =========================================================
  // DASHBOARD / JOBS / NOTIFICATIONS
  // =========================================================

  const dashboardState = useSelector(
    (state) => state.dashboard || {}
  );

  const dashboard =
    dashboardState.data || dashboardState.dashboard || {};

  const dashboardError = dashboardState.error || null;

  const jobState = useSelector((state) => state.job || {});
  const jobs = Array.isArray(jobState.jobs) ? jobState.jobs : [];
  const jobsLoading = Boolean(jobState.loading);

  const [notifications, setNotifications] = useState([]);
  const [notificationUnreadCount, setNotificationUnreadCount] =
    useState(0);
  const [notificationsLoading, setNotificationsLoading] =
    useState(false);

  // =========================================================
  // LOAD NOTIFICATIONS (used only by the sidebar widget)
  // =========================================================

  const loadNotifications = useCallback(async () => {
    if (!token) return;

    try {
      setNotificationsLoading(true);

      const res = await apiRequest(
        "/notifications?limit=10",
        "GET",
        null,
        token
      );

      if (res && Array.isArray(res.notifications)) {
        setNotifications(res.notifications);
        setNotificationUnreadCount(
          Number(res.unreadCount || 0)
        );
      }
    } catch (err) {
      console.error("Load Notifications Error:", err);
    } finally {
      setNotificationsLoading(false);
    }
  }, [token]);

  // =========================================================
  // LOAD DASHBOARD DATA
  // =========================================================

  useEffect(() => {
    if (!token) return;

    dispatch(getCandidateDashboard());
    dispatch(getAllJobs({ page: 1, limit: 10 }));
    loadNotifications();
  }, [dispatch, token, loadNotifications]);

  // =========================================================
  // HELPERS
  // =========================================================

  const getValue = (object, keys, fallback = 0) => {
    for (const key of keys) {
      if (
        object &&
        object[key] !== undefined &&
        object[key] !== null
      ) {
        return object[key];
      }
    }
    return fallback;
  };

  const getNumericValue = (object, keys, fallback = 0) => {
    const value = getValue(object, keys, fallback);
    const numericValue = Number(value);
    return Number.isFinite(numericValue)
      ? numericValue
      : fallback;
  };

  const getJobTitle = (job) =>
    job?.title || job?.name || "Job Opportunity";

  const getCompanyName = (job) => {
    if (typeof job?.company === "string") return job.company;
    if (typeof job?.company?.name === "string")
      return job.company.name;
    if (typeof job?.companyId?.name === "string")
      return job.companyId.name;
    if (typeof job?.recruiter?.company === "string")
      return job.recruiter.company;
    if (typeof job?.recruiter?.companyId?.name === "string")
      return job.recruiter.companyId.name;
    if (typeof job?.recruiter?.name === "string")
      return job.recruiter.name;
    return "Company";
  };

  const getApplicationCompanyName = (application) => {
    if (typeof application?.job?.company === "string")
      return application.job.company;
    if (typeof application?.job?.company?.name === "string")
      return application.job.company.name;
    if (typeof application?.job?.companyId?.name === "string")
      return application.job.companyId.name;
    if (
      typeof application?.job?.recruiter?.companyId?.name ===
      "string"
    )
      return application.job.recruiter.companyId.name;
    if (typeof application?.company === "string")
      return application.company;
    if (typeof application?.company?.name === "string")
      return application.company.name;
    return "Company";
  };

  const getInterviewCompanyName = (interview) => {
    if (typeof interview?.application?.job?.company === "string")
      return interview.application.job.company;
    if (
      typeof interview?.application?.job?.company?.name ===
      "string"
    )
      return interview.application.job.company.name;
    if (
      typeof interview?.application?.job?.companyId?.name ===
      "string"
    )
      return interview.application.job.companyId.name;
    if (
      typeof interview?.application?.job?.recruiter?.companyId
        ?.name === "string"
    )
      return interview.application.job.recruiter.companyId.name;
    if (typeof interview?.recruiter?.companyId?.name === "string")
      return interview.recruiter.companyId.name;
    if (typeof interview?.company === "string")
      return interview.company;
    if (typeof interview?.company?.name === "string")
      return interview.company.name;
    if (typeof interview?.job?.company === "string")
      return interview.job.company;
    if (typeof interview?.job?.company?.name === "string")
      return interview.job.company.name;
    if (typeof interview?.job?.companyId?.name === "string")
      return interview.job.companyId.name;
    return "Company";
  };

  const getInterviewJobTitle = (interview) => {
    if (typeof interview?.application?.job?.title === "string")
      return interview.application.job.title;
    if (typeof interview?.job?.title === "string")
      return interview.job.title;
    if (typeof interview?.jobTitle === "string")
      return interview.jobTitle;
    return "Interview";
  };

  const getJobLocation = (job) => {
    if (typeof job?.location === "string") return job.location;
    if (typeof job?.city === "string") return job.city;
    if (typeof job?.location?.city === "string")
      return job.location.city;
    return "Remote";
  };

  const getJobType = (job) =>
    job?.jobType || job?.type || "Full-time";

  const normalizeText = (value, fallback = "") => {
    if (value === undefined || value === null) return fallback;
    if (
      typeof value === "string" ||
      typeof value === "number"
    )
      return String(value);
    if (
      typeof value === "object" &&
      typeof value.name === "string"
    )
      return value.name;
    return fallback;
  };

  const normalizeJobType = (value) => {
    const text = normalizeText(value, "Full-time");
    return text
      .replace(/-/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const formatNotificationDate = (notification) => {
    if (!notification?.createdAt) return "Recently";

    const createdAt = new Date(notification.createdAt);
    if (Number.isNaN(createdAt.getTime())) return "Recently";

    const diff = Date.now() - createdAt.getTime();
    if (diff < 0) return "Recently";

    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24)
      return `${hours} hr${hours > 1 ? "s" : ""} ago`;

    const days = Math.floor(hours / 24);
    if (days < 7)
      return `${days} day${days > 1 ? "s" : ""} ago`;

    return createdAt.toLocaleDateString();
  };

  const getNotificationColor = (type, index) => {
    if (type === "application_status") return "bg-purple-500";
    if (type === "interview") return "bg-emerald-500";
    if (type === "message") return "bg-blue-500";
    if (type === "job") return "bg-orange-500";
    if (index === 0) return "bg-emerald-500";
    if (index === 1) return "bg-purple-500";
    return "bg-blue-500";
  };

  const getNotificationPath = (notification) => {
    const type = String(notification?.type || "").toLowerCase();
    const relatedId =
      notification?.relatedId ||
      notification?.relatedJobId ||
      notification?.relatedApplicationId;

    if (type.includes("application") && relatedId)
      return `/candidate/applications/${relatedId}`;
    if (type.includes("interview"))
      return "/candidate/interviews";
    if (type.includes("message"))
      return "/candidate/messages";
    if (type.includes("job")) return "/jobs";
    return "/candidate/notifications";
  };

  // =========================================================
  // DASHBOARD VALUES
  // =========================================================

  const totalApplications = getNumericValue(
    dashboard,
    [
      "totalApplications",
      "applicationsCount",
      "appliedJobs",
      "applicationCount",
    ],
    0
  );

  const interviewsCount = getNumericValue(
    dashboard,
    [
      "scheduledInterviews",
      "interviewsCount",
      "totalInterviews",
      "interviews",
    ],
    0
  );

  const profileViews = getNumericValue(
    dashboard,
    ["profileViews", "views", "profileViewCount"],
    0
  );

  const savedJobs = getNumericValue(
    dashboard,
    ["savedJobs", "savedJobsCount", "bookmarks"],
    Array.isArray(user.savedJobs) ? user.savedJobs.length : 0
  );

  const profileCompletion = getNumericValue(
    dashboard,
    [
      "profileCompletion",
      "profileCompletionPercentage",
      "completion",
    ],
    0
  );

  const safeProfileCompletion = Math.min(
    Math.max(profileCompletion, 0),
    100
  );

  const recentApplications = Array.isArray(
    dashboard.recentApplications
  )
    ? dashboard.recentApplications
    : Array.isArray(dashboard.applications)
    ? dashboard.applications
    : [];

  const upcomingInterviews = Array.isArray(
    dashboard.upcomingInterviews
  )
    ? dashboard.upcomingInterviews
    : Array.isArray(dashboard.interviewsList)
    ? dashboard.interviewsList
    : [];

  const recommendedJobs = useMemo(
    () => jobs.slice(0, 5),
    [jobs]
  );

  const goTo = useCallback(
    (path) => {
      if (!path) return;
      navigate(path);
    },
    [navigate]
  );

  // =========================================================
  // CLEANUP
  // =========================================================

  useEffect(() => {
    return () => {
      dispatch(clearDashboardError());
    };
  }, [dispatch]);

  // =========================================================
  // STATS
  // =========================================================

  const stats = [
    {
      title: "Applied Jobs",
      value: totalApplications,
      icon: Briefcase,
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Interviews Scheduled",
      value: interviewsCount,
      icon: CalendarDays,
      bg: "bg-emerald-50",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      title: "Profile Views",
      value: profileViews,
      icon: FileText,
      bg: "bg-purple-50",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Saved Jobs",
      value: savedJobs,
      icon: Star,
      bg: "bg-orange-50",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-500",
    },
  ];

  const profileItems = [
    {
      label: "Basic Information",
      completed: Boolean(user.name && user.email && user.phone),
    },
    {
      label: "Education",
      completed: Boolean(user.education),
    },
    {
      label: "Work Experience",
      completed: Boolean(user.experience),
    },
    {
      label: "Skills",
      completed:
        Array.isArray(user.skills) && user.skills.length > 0,
    },
    {
      label: "Upload Resume",
      completed: Boolean(user.resume || user.cv),
    },
  ];

  // =========================================================
  // RENDER (dashboard content only)
  // =========================================================

  return (
    <>
      {dashboardError && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>
            {typeof dashboardError === "string"
              ? dashboardError
              : dashboardError?.message ||
                "Unable to load dashboard data."}
          </span>

          <button
            type="button"
            onClick={() => dispatch(clearDashboardError())}
            className="font-bold"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_335px]">
        {/* LEFT */}
        <div className="min-w-0">
          {/* WELCOME */}
          <section className="relative min-h-[180px] overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-r from-[#edf5ff] via-[#f6faff] to-[#e8f2ff] p-5 shadow-sm sm:p-7">
            <div className="relative z-10 max-w-[650px]">
              <h1 className="text-[22px] font-bold leading-tight text-[#132e55] sm:text-[27px]">
                {greeting}, {userName}! 👋
              </h1>

              <p className="mt-2 text-[14px] font-medium text-[#385274] sm:text-[15px]">
                Your next big opportunity is just a step away.
              </p>

              <p className="mt-2 text-[12px] text-[#647792] sm:text-[13px]">
                Keep applying, keep learning, keep growing!
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => goTo("/jobs")}
                  className="flex h-10 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 sm:px-5"
                >
                  <Search size={17} />
                  Explore Jobs
                </button>

                <button
                  type="button"
                  onClick={() => goTo("/candidate/profile")}
                  className="flex h-10 items-center gap-2 rounded-md border border-blue-300 bg-white/70 px-4 text-sm font-semibold text-[#23446e] hover:bg-white sm:px-5"
                >
                  Update Your Profile
                </button>
              </div>
            </div>

            <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-[310px] lg:block">
              <div className="absolute right-[75px] top-7 flex items-center gap-2 rounded-full border border-white bg-white/80 px-5 py-3 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <Briefcase size={20} />
                </div>
                <span className="text-sm font-semibold text-blue-600">
                  Dream Job
                </span>
              </div>

              <div className="absolute bottom-0 right-14 h-[85px] w-[85px] rounded-full bg-green-200/50" />
              <div className="absolute bottom-0 right-20 h-[100px] w-[40px] rounded-t-full bg-green-300/50" />
              <div className="absolute bottom-0 right-0 h-[115px] w-[170px] rounded-t-[80px] bg-blue-100/80" />

              <div className="absolute bottom-[8px] right-[80px] text-6xl">
                🧑🏻‍💻
              </div>

              <div className="absolute right-7 top-5 rotate-[-15deg] text-blue-500">
                <Send size={38} />
              </div>
            </div>
          </section>

          {/* STATS */}
          <section className="mt-5 grid grid-cols-1 gap-4 min-[500px]:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  className={`rounded-xl border border-slate-200/70 ${stat.bg} p-4 shadow-sm sm:p-5`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg}`}
                  >
                    <Icon size={21} className={stat.iconColor} />
                  </div>

                  <p className="mt-3 text-[13px] font-medium text-[#415572]">
                    {stat.title}
                  </p>

                  <p className="mt-1 text-[27px] font-bold leading-none text-[#132e55]">
                    {stat.value}
                  </p>
                </div>
              );
            })}
          </section>

          {/* JOBS + APPLICATIONS */}
          <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(290px,0.9fr)]">
            {/* RECOMMENDED JOBS */}
            <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
                <h2 className="text-[15px] font-bold text-[#172e51] sm:text-[16px]">
                  Recommended Jobs
                </h2>

                <button
                  type="button"
                  onClick={() => goTo("/jobs")}
                  className="flex shrink-0 items-center gap-1 text-[10px] font-medium text-blue-600 sm:text-[11px]"
                >
                  View All Jobs
                  <ArrowRight size={13} />
                </button>
              </div>

              <div>
                {jobsLoading && recommendedJobs.length === 0 ? (
                  <div className="space-y-3 p-5">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <div
                        key={item}
                        className="h-[59px] animate-pulse rounded-lg bg-slate-100"
                      />
                    ))}
                  </div>
                ) : recommendedJobs.length > 0 ? (
                  recommendedJobs.map((job, index) => {
                    const jobId = job?._id || job?.id;

                    return (
                      <div
                        key={jobId || index}
                        className="grid w-full min-w-0 grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-2 border-b border-slate-100 px-3 py-3 last:border-0 hover:bg-slate-50 sm:grid-cols-[40px_minmax(0,1fr)_auto] sm:gap-3 sm:px-4 md:grid-cols-[44px_minmax(130px,1.4fr)_minmax(80px,1fr)_90px_auto]"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 sm:h-9 sm:w-9">
                          <Briefcase size={17} />
                        </div>

                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => {
                              if (jobId) goTo(`/jobs/${jobId}`);
                            }}
                            disabled={!jobId}
                            className="block w-full truncate text-left text-[11px] font-bold text-[#172d50] hover:text-blue-600 disabled:cursor-not-allowed sm:text-[12px]"
                          >
                            {getJobTitle(job)}
                          </button>

                          <p className="mt-0.5 truncate text-[9px] text-slate-500 sm:text-[10px]">
                            {getCompanyName(job)}
                          </p>
                        </div>

                        <div className="hidden min-w-0 items-center gap-1 text-[10px] text-slate-500 md:flex">
                          <MapPin size={12} className="shrink-0" />
                          <span className="truncate">
                            {getJobLocation(job)}
                          </span>
                        </div>

                        <span className="hidden rounded-full bg-emerald-50 px-2 py-1 text-center text-[9px] font-semibold text-emerald-600 md:block">
                          {normalizeJobType(getJobType(job))}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            if (jobId) goTo(`/jobs/${jobId}`);
                          }}
                          disabled={!jobId}
                          className="flex shrink-0 items-center justify-center whitespace-nowrap rounded-md bg-blue-600 px-2.5 py-2 text-[9px] font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-[11px]"
                        >
                          Apply
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-5 py-12 text-center">
                    <Briefcase
                      size={35}
                      className="mx-auto text-slate-300"
                    />
                    <p className="mt-3 text-sm font-semibold text-slate-600">
                      No jobs available
                    </p>
                    <button
                      type="button"
                      onClick={() => goTo("/jobs")}
                      className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
                    >
                      Browse Jobs
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* RECENT APPLICATIONS */}
            <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
                <h2 className="text-[15px] font-bold text-[#172e51] sm:text-[16px]">
                  Recent Applications
                </h2>

                <button
                  type="button"
                  onClick={() =>
                    goTo("/candidate/applications")
                  }
                  className="flex shrink-0 items-center gap-1 text-[10px] font-medium text-blue-600 sm:text-[11px]"
                >
                  View All
                  <ArrowRight size={13} />
                </button>
              </div>

              {recentApplications.length > 0 ? (
                recentApplications.slice(0, 5).map((application, index) => {
                  const status = normalizeText(
                    application?.status,
                    "pending"
                  ).toLowerCase();

                  const statusText = status
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (letter) =>
                      letter.toUpperCase()
                    );

                  return (
                    <div
                      key={application._id || application.id || index}
                      className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-0"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <Briefcase size={15} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-bold text-[#172d50]">
                          {application?.job?.title ||
                            application?.jobTitle ||
                            "Job Application"}
                        </p>

                        <p className="mt-0.5 truncate text-[9px] text-slate-500">
                          {getApplicationCompanyName(application)}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <span
                          className={`rounded-full px-2 py-1 text-[8px] font-semibold ${
                            status === "hired"
                              ? "bg-emerald-50 text-emerald-600"
                              : status === "shortlisted"
                              ? "bg-purple-50 text-purple-600"
                              : status === "rejected"
                              ? "bg-red-50 text-red-500"
                              : status === "reviewing"
                              ? "bg-orange-50 text-orange-600"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {statusText}
                        </span>

                        <p className="mt-1 text-[8px] text-slate-400">
                          {application.createdAt
                            ? new Date(
                                application.createdAt
                              ).toLocaleDateString()
                            : "Recently"}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-5 py-12 text-center">
                  <FileText
                    size={32}
                    className="mx-auto text-slate-300"
                  />
                  <p className="mt-3 text-xs font-semibold text-slate-500">
                    No applications yet
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* INTERVIEWS + PRO TIPS */}
          <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(290px,0.9fr)]">
            {/* INTERVIEWS */}
            <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
                <div className="flex min-w-0 items-center gap-2">
                  <CalendarDays
                    size={19}
                    className="shrink-0 text-blue-600"
                  />
                  <h2 className="truncate text-[15px] font-bold text-[#172e51] sm:text-[16px]">
                    Upcoming Interviews
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    goTo("/candidate/interviews")
                  }
                  className="flex shrink-0 items-center gap-1 text-[10px] font-medium text-blue-600 sm:text-[11px]"
                >
                  View All
                  <ArrowRight size={13} />
                </button>
              </div>

              {upcomingInterviews.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-left">
                        <th className="px-5 py-3 text-[10px] font-semibold text-slate-500">
                          Date & Time
                        </th>
                        <th className="px-3 py-3 text-[10px] font-semibold text-slate-500">
                          Job Title
                        </th>
                        <th className="px-3 py-3 text-[10px] font-semibold text-slate-500">
                          Company
                        </th>
                        <th className="px-3 py-3 text-[10px] font-semibold text-slate-500">
                          Mode
                        </th>
                        <th className="px-3 py-3 text-[10px] font-semibold text-slate-500">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {upcomingInterviews
                        .slice(0, 4)
                        .map((interview, index) => {
                          const interviewDate =
                            interview?.date ||
                            interview?.scheduledAt;

                          const mode = normalizeText(
                            interview?.mode,
                            "online"
                          );

                          const interviewStatus = normalizeText(
                            interview?.status,
                            "scheduled"
                          );

                          return (
                            <tr
                              key={
                                interview._id ||
                                interview.id ||
                                index
                              }
                              className="border-b border-slate-100 last:border-0"
                            >
                              <td className="px-5 py-3 text-[10px] font-medium text-slate-600">
                                {interviewDate
                                  ? new Date(
                                      interviewDate
                                    ).toLocaleString()
                                  : "Upcoming"}
                              </td>
                              <td className="px-3 py-3 text-[10px] font-semibold text-[#213b60]">
                                {getInterviewJobTitle(interview)}
                              </td>
                              <td className="px-3 py-3 text-[10px] text-slate-500">
                                {getInterviewCompanyName(interview)}
                              </td>
                              <td className="px-3 py-3">
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[9px] font-medium text-blue-600">
                                  <Video size={10} />
                                  {normalizeJobType(mode)}
                                </span>
                              </td>
                              <td className="px-3 py-3">
                                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-semibold text-emerald-600">
                                  {interviewStatus
                                    .replace(/-/g, " ")
                                    .replace(
                                      /\b\w/g,
                                      (letter) =>
                                        letter.toUpperCase()
                                    )}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-5 py-10 text-center">
                  <CalendarDays
                    size={32}
                    className="mx-auto text-slate-300"
                  />
                  <p className="mt-3 text-xs font-semibold text-slate-500">
                    No upcoming interviews
                  </p>
                </div>
              )}
            </div>

            {/* PRO TIPS */}
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50">
                  <Lightbulb
                    size={18}
                    className="text-amber-500"
                  />
                </div>
                <h2 className="text-[16px] font-bold text-[#172e51]">
                  Pro Tips
                </h2>
              </div>

              <p className="mt-6 max-w-[220px] text-[12px] leading-6 text-slate-500">
                Keep your profile updated and apply for jobs that match
                your skills.
              </p>

              <button
                type="button"
                onClick={() => goTo("/candidate/profile")}
                className="mt-5 flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600"
              >
                <ArrowRight size={15} />
                Update Profile
              </button>

              <div className="absolute bottom-1 right-3 text-5xl opacity-70">
                🎯
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <aside className="space-y-5">
          {/* PROFILE COMPLETION */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-[16px] font-bold text-[#172e51]">
              Profile Completion
            </h2>

            <div className="mt-4 flex items-center gap-5">
              <div className="relative h-[92px] w-[92px] shrink-0">
                <svg
                  viewBox="0 0 100 100"
                  className="h-full w-full -rotate-90"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#e8eef5"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#1477a8"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="264"
                    strokeDashoffset={
                      264 - (264 * safeProfileCompletion) / 100
                    }
                  />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[21px] font-bold text-[#17466b]">
                    {safeProfileCompletion}%
                  </span>
                </div>
              </div>

              <p className="text-[12px] leading-5 text-slate-500">
                Complete your profile
                <br />
                to get better job matches
                <br />
                and more opportunities.
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {profileItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2.5"
                >
                  {item.completed ? (
                    <CheckCircle2
                      size={16}
                      className="fill-emerald-500 text-white"
                    />
                  ) : (
                    <span className="h-4 w-4 rounded-full border-2 border-slate-300" />
                  )}

                  <span className="text-[12px] font-medium text-[#304563]">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => goTo("/candidate/profile")}
              className="mt-5 h-[38px] w-full rounded-md bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Complete Profile
            </button>
          </section>

          {/* QUICK ACTIONS */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-[16px] font-bold text-[#172e51]">
              Quick Actions
            </h2>

            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={() => goTo("/jobs")}
                className="flex h-[43px] w-full items-center gap-3 rounded-md bg-blue-600 px-4 text-left text-xs font-semibold text-white hover:bg-blue-700"
              >
                <Search size={18} />
                Browse Jobs
              </button>

              <button
                type="button"
                onClick={() => goTo("/candidate/cv")}
                className="flex h-[43px] w-full items-center gap-3 rounded-md border border-slate-200 bg-blue-50/60 px-4 text-left text-xs font-medium text-[#294466] hover:bg-blue-100"
              >
                <Upload size={18} className="text-blue-600" />
                Upload Resume
              </button>

              <button
                type="button"
                onClick={() => goTo("/candidate/saved-jobs")}
                className="flex h-[43px] w-full items-center gap-3 rounded-md border border-slate-200 bg-blue-50/60 px-4 text-left text-xs font-medium text-[#294466] hover:bg-blue-100"
              >
                <Bookmark size={18} className="text-blue-600" />
                View Saved Jobs
              </button>
            </div>
          </section>

          {/* NOTIFICATIONS */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <h2 className="truncate text-[16px] font-bold text-[#172e51]">
                  Latest Notifications
                </h2>

                {notificationUnreadCount > 0 && (
                  <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-bold text-red-500">
                    {notificationUnreadCount} new
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  goTo("/candidate/notifications")
                }
                className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-blue-600"
              >
                View All
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="relative mt-5">
              {notificationsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex gap-4">
                      <div className="h-3 w-3 shrink-0 animate-pulse rounded-full bg-slate-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-3/4 animate-pulse rounded bg-slate-200" />
                        <div className="h-2 w-1/2 animate-pulse rounded bg-slate-100" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length > 0 ? (
                <>
                  <div className="absolute bottom-3 left-[5px] top-3 w-px bg-slate-200" />

                  {notifications.slice(0, 4).map((notification, index) => (
                    <button
                      key={notification._id || notification.id || index}
                      type="button"
                      onClick={() =>
                        goTo(getNotificationPath(notification))
                      }
                      className="relative flex w-full gap-4 pb-5 text-left last:pb-0"
                    >
                      <div
                        className={`relative z-10 mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-white ${getNotificationColor(
                          notification.type,
                          index
                        )}`}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-[11px] leading-4 ${
                              notification.read
                                ? "font-medium text-[#263e60]"
                                : "font-bold text-[#172e51]"
                            }`}
                          >
                            {notification.title || "New notification"}
                          </p>

                          {!notification.read && (
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                          )}
                        </div>

                        <p className="mt-1 line-clamp-2 text-[9px] leading-4 text-slate-400">
                          {notification.message ||
                            notification.description ||
                            "You have a new notification."}
                        </p>

                        <p className="mt-1 text-[8px] font-medium text-slate-400">
                          {formatNotificationDate(notification)}
                        </p>
                      </div>
                    </button>
                  ))}
                </>
              ) : (
                <div className="py-8 text-center">
                  <Bell
                    size={30}
                    className="mx-auto text-slate-300"
                  />
                  <p className="mt-3 text-xs font-semibold text-slate-500">
                    No new notifications
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    Application and interview updates will appear here.
                  </p>
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CandidateDashboard;