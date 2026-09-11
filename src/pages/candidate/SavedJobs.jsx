
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Bookmark,
  BriefcaseBusiness,
  MapPin,
  Trash2,
} from "lucide-react";

import {
  getSavedJobs,
  unsaveJob,
  selectSavedJobs,
  selectSavedJobsLoading,
  selectSavedJobsError,
  selectSavingJobIds,
} from "../../store/jobSlice";

const SavedJobs = () => {
  const dispatch = useDispatch();

  const savedJobs = useSelector(selectSavedJobs);
  const loading = useSelector(selectSavedJobsLoading);
  const error = useSelector(selectSavedJobsError);
  const savingJobIds = useSelector(selectSavingJobIds);

  // ======================================================
  // LOAD SAVED JOBS
  // ======================================================

  useEffect(() => {
    dispatch(getSavedJobs());
  }, [dispatch]);

  // ======================================================
  // REMOVE SAVED JOB
  // ======================================================

  const removeSavedJob = (jobId) => {
    if (!jobId) {
      return;
    }

    dispatch(
      unsaveJob({
        jobId,
      })
    );
  };

  // ======================================================
  // SALARY DISPLAY
  // ======================================================

  const getSalaryText = (job) => {
    if (job?.salary) {
      return String(job.salary);
    }

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

    if (
      minSalary !== undefined &&
      minSalary !== null
    ) {
      return `${minSalary}+`;
    }

    if (
      maxSalary !== undefined &&
      maxSalary !== null
    ) {
      return `Up to ${maxSalary}`;
    }

    return "";
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="border-b bg-white">
          <div className="mx-auto max-w-6xl px-6 py-5">
            <h1 className="text-2xl font-bold text-gray-900">
              Saved Jobs
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Jobs you saved for later
            </p>
          </div>
        </div>

        <main className="mx-auto flex min-h-[450px] max-w-6xl items-center justify-center px-6 py-8">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
              <Bookmark
                size={24}
                className="animate-pulse text-blue-600"
              />
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Loading saved jobs...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="border-b bg-white">
          <div className="mx-auto max-w-6xl px-6 py-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Saved Jobs
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Jobs you saved for later
                </p>
              </div>

              <Link
                to="/jobs"
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Browse Jobs
              </Link>
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-6xl px-6 py-8">
          <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              ⚠️
            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              Something went wrong
            </h2>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() => dispatch(getSavedJobs())}
              className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ======================================================
  // EMPTY STATE
  // ======================================================

  if (savedJobs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="border-b bg-white">
          <div className="mx-auto max-w-6xl px-6 py-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Saved Jobs
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Jobs you saved for later
                </p>
              </div>

              <Link
                to="/jobs"
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Browse Jobs
              </Link>
            </div>
          </div>
        </div>

        <main className="mx-auto flex min-h-[500px] max-w-6xl items-center justify-center px-6 py-8">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <Bookmark
                size={30}
                className="text-blue-600"
              />
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              No Saved Jobs
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              You haven't saved any jobs yet. Browse available
              jobs and save the ones you're interested in.
            </p>

            <Link
              to="/jobs"
              className="mt-6 inline-flex rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Find Jobs
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ======================================================
  // SAVED JOBS
  // ======================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Saved Jobs
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Jobs you saved for later
              </p>
            </div>

            <Link
              to="/jobs"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      </div>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Count */}

        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {savedJobs.length} Saved{" "}
              {savedJobs.length === 1 ? "Job" : "Jobs"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Keep track of opportunities you're interested in.
            </p>
          </div>
        </div>

        {/* ==================================================
            JOB LIST
        ================================================== */}

        <div className="space-y-4">
          {savedJobs.map((job) => {
            const isRemoving =
              savingJobIds?.[job._id] || false;

            const salaryText = getSalaryText(job);

            return (
              <div
                key={job._id}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  {/* ==================================================
                      JOB INFORMATION
                  ================================================== */}

                  <div className="min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                        <BriefcaseBusiness
                          size={20}
                          className="text-blue-600"
                        />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-xl font-bold text-gray-900">
                          {job.title || "Untitled Job"}
                        </h3>

                        <p className="mt-1 text-sm font-medium text-gray-600">
                          {job.company ||
                            job.companyName ||
                            job.recruiter?.companyName ||
                            "Company not specified"}
                        </p>
                      </div>
                    </div>

                    {/* ==================================================
                        JOB META
                    ================================================== */}

                    <div className="mt-4 flex flex-wrap gap-2 text-sm">
                      {job.location && (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1.5 text-gray-600">
                          <MapPin size={14} />
                          {job.location}
                        </span>
                      )}

                      {job.jobType && (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-3 py-1.5 text-blue-700">
                          <BriefcaseBusiness
                            size={14}
                          />
                          {job.jobType}
                        </span>
                      )}

                      {job.category && (
                        <span className="rounded-md bg-gray-100 px-3 py-1.5 text-gray-600">
                          {job.category}
                        </span>
                      )}

                      {job.experienceLevel && (
                        <span className="rounded-md bg-gray-100 px-3 py-1.5 text-gray-600">
                          {job.experienceLevel}
                        </span>
                      )}
                    </div>

                    {/* ==================================================
                        DESCRIPTION
                    ================================================== */}

                    {job.description && (
                      <p className="mt-4 line-clamp-2 max-w-3xl text-sm leading-6 text-gray-500">
                        {job.description}
                      </p>
                    )}

                    {/* ==================================================
                        SALARY
                    ================================================== */}

                    {salaryText && (
                      <p className="mt-3 text-sm font-semibold text-gray-700">
                        💰 {salaryText}
                      </p>
                    )}
                  </div>

                  {/* ==================================================
                      ACTIONS
                  ================================================== */}

                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row md:flex-col">
                    <Link
                      to={`/jobs/${job._id}`}
                      className="rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      View Job
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        removeSavedJob(job._id)
                      }
                      disabled={isRemoving}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 size={16} />

                      {isRemoving
                        ? "Removing..."
                        : "Remove"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default SavedJobs;

