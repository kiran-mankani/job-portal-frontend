import React, { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Users,
  UserCheck,
  UserX,
  Clock,
  TrendingUp,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { apiRequest } from "../../services/api";

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("accessToken") ||
  "";

const getArray = (data, keys = []) => {
  if (Array.isArray(data)) {
    return data;
  }

  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

export default function RecruiterReports() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const authToken = getToken();

      if (!authToken) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const [jobsData, applicationsData] = await Promise.all([
        apiRequest(
          "/jobs/my-jobs?page=1&limit=100",
          "GET",
          null,
          authToken
        ),

        apiRequest(
          "/applications/recruiter?page=1&limit=100",
          "GET",
          null,
          authToken
        ),
      ]);

      setJobs(
        getArray(jobsData, ["jobs", "results"])
      );

      setApplications(
        getArray(applicationsData, [
          "applications",
          "results",
        ])
      );
    } catch (err) {
      console.error("Recruiter reports error:", err);

      setError(
        err?.message ||
          "Failed to load recruitment reports."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const stats = useMemo(() => {
    const totalJobs = jobs.length;

    const activeJobs = jobs.filter((job) => {
      const status = String(
        job?.status || ""
      )
        .trim()
        .toLowerCase();

      return (
        job?.isActive === true ||
        status === "active" ||
        status === "open" ||
        status === "published"
      );
    }).length;

    const totalApplications = applications.length;

    const hired = applications.filter((app) => {
      const status = String(
        app?.status ||
          app?.applicationStatus ||
          ""
      )
        .trim()
        .toLowerCase();

      return [
        "hired",
        "accepted",
        "selected",
        "offer accepted",
      ].includes(status);
    }).length;

    const rejected = applications.filter((app) => {
      const status = String(
        app?.status ||
          app?.applicationStatus ||
          ""
      )
        .trim()
        .toLowerCase();

      return [
        "rejected",
        "declined",
        "not selected",
      ].includes(status);
    }).length;

    const pending = Math.max(
      totalApplications - hired - rejected,
      0
    );

    const hireRate =
      totalApplications > 0
        ? Math.round(
            (hired / totalApplications) * 100
          )
        : 0;

    return {
      totalJobs,
      activeJobs,
      totalApplications,
      hired,
      rejected,
      pending,
      hireRate,
    };
  }, [jobs, applications]);

  const jobStats = useMemo(() => {
    const result = {};

    applications.forEach((app) => {
      const job = app?.job || app?.jobId;

      const jobId =
        typeof job === "object"
          ? job?.id || job?._id
          : job;

      const title =
        typeof job === "object"
          ? job?.title || "Unknown Job"
          : app?.jobTitle || "Unknown Job";

      const key = jobId || title;

      if (!result[key]) {
        result[key] = {
          id: jobId || key,
          title,
          count: 0,
        };
      }

      result[key].count += 1;
    });

    return Object.values(result).sort(
      (a, b) => b.count - a.count
    );
  }, [applications]);

  const max = Math.max(
    ...jobStats.map((item) => item.count),
    1
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2
            size={20}
            className="animate-spin"
          />
          Loading reports...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Recruiter Reports
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900 md:text-3xl">
              Recruitment Reports
            </h1>

            <p className="mt-1 text-gray-500">
              Recruitment performance overview.
            </p>
          </div>

          <button
            type="button"
            onClick={loadReports}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card
            title="Total Jobs"
            value={stats.totalJobs}
            icon={<BriefcaseBusiness size={22} />}
          />

          <Card
            title="Active Jobs"
            value={stats.activeJobs}
            icon={<TrendingUp size={22} />}
          />

          <Card
            title="Applications"
            value={stats.totalApplications}
            icon={<Users size={22} />}
          />

          <Card
            title="Hired"
            value={stats.hired}
            icon={<UserCheck size={22} />}
          />
        </div>

        {/* SECOND ROW */}
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
          <Card
            title="Pending"
            value={stats.pending}
            icon={<Clock size={22} />}
          />

          <Card
            title="Rejected"
            value={stats.rejected}
            icon={<UserX size={22} />}
          />

          {/* HIRE RATE */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Hire Rate
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats.hireRate}%
            </p>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-500"
                style={{
                  width: `${Math.min(
                    Math.max(stats.hireRate, 0),
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* APPLICATIONS BY JOB */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">
            Applications by Job
          </h2>

          <p className="mb-6 mt-1 text-sm text-gray-500">
            Applications received for each job.
          </p>

          {jobStats.length === 0 ? (
            <div className="py-10 text-center text-gray-400">
              No application data available.
            </div>
          ) : (
            <div className="space-y-5">
              {jobStats.map((job) => (
                <div
                  key={job.id}
                  className="min-w-0"
                >
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <span className="truncate font-medium text-gray-800">
                      {job.title}
                    </span>

                    <span className="shrink-0 font-semibold text-gray-900">
                      {job.count}
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-500"
                      style={{
                        width: `${
                          (job.count / max) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RECRUITMENT SUMMARY */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">
            Recruitment Summary
          </h2>

          <div className="mt-4 divide-y divide-gray-100">
            <Summary
              label="Total Applications"
              value={stats.totalApplications}
            />

            <Summary
              label="Hired Candidates"
              value={stats.hired}
            />

            <Summary
              label="Rejected Applications"
              value={stats.rejected}
            />

            <Summary
              label="Pending Applications"
              value={stats.pending}
            />

            <Summary
              label="Hire Rate"
              value={`${stats.hireRate}%`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function Summary({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <span className="text-gray-600">
        {label}
      </span>

      <span className="font-bold text-gray-900">
        {value}
      </span>
    </div>
  );
}