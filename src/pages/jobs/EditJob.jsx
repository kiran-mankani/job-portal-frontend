import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getSingleJob,
  updateJob,
  clearJobError,
  clearJobSuccess,
} from "../../store/jobSlice";

function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { token: reduxToken } = useSelector(
    (state) => state.auth
  );

  // store.js mein jobReducer "job" key par registered hai.
  const { job, loading, error, success } = useSelector(
    (state) => state.job
  );

  const token =
    reduxToken ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    null;

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    jobType: "",
    category: "",
    experienceLevel: "",
    experience: "",
    minSalary: "",
    maxSalary: "",
    skills: "",
    description: "",
    status: "active",
  });

  const [toast, setToast] = useState({
    show: false,
    type: "",
    message: "",
  });

  // ======================================================
  // HELPERS
  // ======================================================

  const getErrorMessage = (value) => {
    if (!value) {
      return "";
    }

    if (typeof value === "string") {
      return value;
    }

    return (
      value?.message ||
      value?.error ||
      "Unable to update job. Please try again."
    );
  };

  const hideToast = () => {
    setToast({
      show: false,
      type: "",
      message: "",
    });
  };

  const showToast = (type, message) => {
    setToast({
      show: true,
      type,
      message,
    });
  };

  // ======================================================
  // LOAD JOB
  // ======================================================

  useEffect(() => {
    if (!id) {
      return;
    }

    dispatch(getSingleJob(id));
  }, [dispatch, id]);

  // ======================================================
  // FILL FORM
  // ======================================================
  //
  // Job schema stores ONLY companyId (ObjectId ref).
  // After populateJob(), job.companyId is an object:
  //   { _id, name, description, location, website, logo }
  //
  // We fall back to legacy job.company / job.companyName
  // so old data still displays correctly.
  // ======================================================

  useEffect(() => {
    if (!job) {
      return;
    }

    const companyName =
      (typeof job.companyId === "object" &&
        job.companyId?.name) ||
      job.company ||
      job.companyName ||
      "";

    setFormData({
      title: job.title || "",
      company: companyName,
      location: job.location || "",
      jobType: job.jobType || job.type || "",
      category: job.category || "",
      experienceLevel: job.experienceLevel || "",
      experience: job.experience || "",

      minSalary:
        job.minSalary !== null &&
        job.minSalary !== undefined
          ? job.minSalary
          : "",

      maxSalary:
        job.maxSalary !== null &&
        job.maxSalary !== undefined
          ? job.maxSalary
          : "",

      skills: Array.isArray(job.skills)
        ? job.skills.join(", ")
        : job.skills || "",

      description: job.description || "",
      status: job.status || "active",
    });
  }, [job]);

  // ======================================================
  // SUCCESS TOAST
  // ======================================================

  useEffect(() => {
    if (!success) {
      return undefined;
    }

    const message =
      typeof success === "string"
        ? success
        : success?.message ||
          "Job updated successfully!";

    showToast("success", message);

    const timer = setTimeout(() => {
      hideToast();
    }, 2500);

    return () => clearTimeout(timer);
  }, [success]);

  // ======================================================
  // ERROR TOAST
  // ======================================================

  useEffect(() => {
    if (!error) {
      return undefined;
    }

    showToast("error", getErrorMessage(error));

    const timer = setTimeout(() => {
      hideToast();
      dispatch(clearJobError());
    }, 3500);

    return () => clearTimeout(timer);
  }, [error, dispatch]);

  // ======================================================
  // CHANGE
  // ======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      dispatch(clearJobError());
    }

    if (success) {
      dispatch(clearJobSuccess());
    }
  };

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    hideToast();

    if (!token) {
      showToast("error", "Please login as recruiter.");
      return;
    }

    if (!id) {
      showToast("error", "Invalid job ID.");
      return;
    }

    const title = formData.title.trim();
    const company = formData.company.trim();
    const location = formData.location.trim();
    const description = formData.description.trim();

    if (!title) {
      showToast("error", "Please enter a job title.");
      return;
    }

    if (!company) {
      showToast("error", "Please enter a company name.");
      return;
    }

    if (!location) {
      showToast("error", "Please enter a job location.");
      return;
    }

    if (!formData.jobType) {
      showToast("error", "Please select a job type.");
      return;
    }

    const skills = formData.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (skills.length === 0) {
      showToast("error", "Please enter at least one skill.");
      return;
    }

    if (description.length < 20) {
      showToast(
        "error",
        "Job description must be at least 20 characters."
      );
      return;
    }

    // ====================================================
    // SALARY VALIDATION
    // ====================================================

    const hasMinSalary = formData.minSalary !== "";
    const hasMaxSalary = formData.maxSalary !== "";

    let minSalary = null;
    let maxSalary = null;

    if (hasMinSalary) {
      minSalary = Number(formData.minSalary);

      if (!Number.isFinite(minSalary) || minSalary < 0) {
        showToast(
          "error",
          "Please enter a valid minimum salary."
        );
        return;
      }
    }

    if (hasMaxSalary) {
      maxSalary = Number(formData.maxSalary);

      if (!Number.isFinite(maxSalary) || maxSalary < 0) {
        showToast(
          "error",
          "Please enter a valid maximum salary."
        );
        return;
      }
    }

    if (
      minSalary !== null &&
      maxSalary !== null &&
      maxSalary < minSalary
    ) {
      showToast(
        "error",
        "Maximum salary must be greater than or equal to minimum salary."
      );
      return;
    }

    // ====================================================
    // PAYLOAD
    // ====================================================
    // Backend's updateJob accepts `company` and updates
    // the linked Company document's name.
    // ====================================================

    const jobData = {
      title,
      company,
      location,
      jobType: formData.jobType.trim().toLowerCase(),
      category: formData.category.trim(),
      experienceLevel: formData.experienceLevel.trim(),
      experience: formData.experience.trim(),
      skills,
      description,
      status: formData.status,
      minSalary,
      maxSalary,
    };

    try {
      const result = await dispatch(
        updateJob({
          id,
          jobData,
          token,
        })
      );

      if (updateJob.fulfilled.match(result)) {
        showToast("success", "Job updated successfully!");

        const timer = setTimeout(() => {
          navigate(`/jobs/${id}`);
        }, 1200);

        return () => clearTimeout(timer);
      }

      if (updateJob.rejected.match(result)) {
        const message =
          getErrorMessage(result.payload) ||
          getErrorMessage(result.error) ||
          "Unable to update job.";

        showToast("error", message);
      }
    } catch (err) {
      console.error("UPDATE JOB ERROR:", err);

      showToast("error", getErrorMessage(err));
    }
  };

  // ======================================================
  // INITIAL LOADING
  // ======================================================

  if (loading && !job) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />

          <h2 className="text-lg font-semibold text-slate-800">
            Loading job...
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Please wait while we load the job details.
          </p>
        </div>
      </div>
    );
  }

  // ======================================================
  // JOB NOT FOUND
  // ======================================================

  if (!loading && !job && error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
            !
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            Job Not Found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {getErrorMessage(error)}
          </p>

          <button
            type="button"
            onClick={() => navigate("/jobs/my-jobs")}
            className="mt-6 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Back to My Jobs
          </button>
        </div>
      </div>
    );
  }

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      {/* TOAST */}

      {toast.show && (
        <div className="fixed right-4 top-4 z-50 w-[calc(100%-2rem)] max-w-sm">
          <div
            role="alert"
            className={`flex items-start gap-3 rounded-xl border px-4 py-4 shadow-xl backdrop-blur ${
              toast.type === "success"
                ? "border-emerald-200 bg-white text-emerald-800"
                : "border-red-200 bg-white text-red-800"
            }`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                toast.type === "success"
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {toast.type === "success" ? "✓" : "!"}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                {toast.type === "success" ? "Success" : "Error"}
              </p>

              <p className="mt-1 text-sm text-slate-600">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={hideToast}
              aria-label="Close notification"
              className="text-xl leading-none text-slate-400 hover:text-slate-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}

      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate("/jobs/my-jobs")}
              className="mb-3 text-sm font-medium text-slate-500 transition hover:text-blue-600"
            >
              ← Back to My Jobs
            </button>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Edit Job
            </h1>

            <p className="mt-1 text-sm text-slate-500 sm:text-base">
              Update your job posting details.
            </p>
          </div>

          <div className="hidden rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 sm:block">
            Recruiter
          </div>
        </div>

        {/* FORM CARD */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50 px-5 py-4 sm:px-8">
            <h2 className="font-semibold text-slate-900">
              Job Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Keep your job information accurate and up to date.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="p-5 sm:p-8"
          >
            {/* BASIC INFORMATION */}

            <div className="grid gap-5 md:grid-cols-2">
              {/* TITLE */}

              <div className="md:col-span-2">
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Job Title{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  placeholder="e.g. Frontend Developer"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* COMPANY */}

              <div>
                <label
                  htmlFor="company"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Company{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  id="company"
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  placeholder="e.g. Tech Solution"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* LOCATION */}

              <div>
                <label
                  htmlFor="location"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Location{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  id="location"
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  maxLength={150}
                  placeholder="e.g. Karachi, Pakistan"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* JOB TYPE */}

              <div>
                <label
                  htmlFor="jobType"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Job Type{" "}
                  <span className="text-red-500">*</span>
                </label>

                <select
                  id="jobType"
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">Select job type</option>

                  <option value="full-time">Full Time</option>

                  <option value="part-time">Part Time</option>

                  <option value="internship">Internship</option>

                  <option value="contract">Contract</option>

                  <option value="freelance">Freelance</option>
                </select>
              </div>

              {/* CATEGORY */}

              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Category
                </label>

                <input
                  id="category"
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="e.g. Software Development"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* EXPERIENCE LEVEL */}

              <div>
                <label
                  htmlFor="experienceLevel"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Experience Level
                </label>

                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">
                    Select experience level
                  </option>

                  <option value="Entry Level">Entry Level</option>

                  <option value="Mid Level">Mid Level</option>

                  <option value="Senior Level">
                    Senior Level
                  </option>

                  <option value="Lead">Lead</option>
                </select>
              </div>

              {/* EXPERIENCE */}

              <div>
                <label
                  htmlFor="experience"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Experience
                </label>

                <input
                  id="experience"
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="e.g. 2-3 years"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* SALARY */}

            <div className="mt-8 border-t border-slate-100 pt-8">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">
                Salary
              </h3>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="minSalary"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Minimum Salary
                  </label>

                  <input
                    id="minSalary"
                    type="number"
                    name="minSalary"
                    min="0"
                    step="1"
                    value={formData.minSalary}
                    onChange={handleChange}
                    placeholder="e.g. 10000"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="maxSalary"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Maximum Salary
                  </label>

                  <input
                    id="maxSalary"
                    type="number"
                    name="maxSalary"
                    min="0"
                    step="1"
                    value={formData.maxSalary}
                    onChange={handleChange}
                    placeholder="e.g. 15000"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <p className="mt-2 text-xs text-slate-400">
                Salary will automatically appear as a range when
                both values are provided.
              </p>
            </div>

            {/* SKILLS */}

            <div className="mt-8 border-t border-slate-100 pt-8">
              <label
                htmlFor="skills"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Skills{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                id="skills"
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                required
                placeholder="React, JavaScript, Tailwind CSS, Node.js"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              <p className="mt-2 text-xs text-slate-400">
                Separate skills with commas.
              </p>
            </div>

            {/* DESCRIPTION */}

            <div className="mt-8 border-t border-slate-100 pt-8">
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Job Description{" "}
                <span className="text-red-500">*</span>
              </label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={8}
                maxLength={5000}
                placeholder="Describe the role, responsibilities, team and what the candidate will do..."
                className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              <div className="mt-2 flex justify-between text-xs text-slate-400">
                <span>Minimum 20 characters</span>

                <span>
                  {formData.description.length} characters
                </span>
              </div>
            </div>

            {/* STATUS */}

            <div className="mt-8 border-t border-slate-100 pt-8">
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Job Status
              </label>

              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:max-w-xs"
              >
                <option value="active">Active</option>

                <option value="closed">Closed</option>
              </select>
            </div>

            {/* BUTTONS */}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-8 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/jobs/my-jobs")}
                disabled={loading}
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Updating...
                  </span>
                ) : (
                  "Update Job"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditJob;