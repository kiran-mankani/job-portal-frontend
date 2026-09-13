import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  createJob,
  clearJobError,
  clearJobSuccess,
} from "../../store/jobSlice";

const PostJob = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // store.js mein reducer key "job" hai
  const { loading, error, success } = useSelector((state) => state.job);

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    jobType: "full-time",
    category: "",
    experienceLevel: "",
    experience: "",
    minSalary: "",
    maxSalary: "",
    description: "",
  });

  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [validationError, setValidationError] = useState("");

  const getErrorMessage = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (value?.message) return value.message;
    return "Unable to post job. Please try again.";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setValidationError("");

    if (error) {
      dispatch(clearJobError());
    }
  };

  const addSkill = () => {
    const value = skillInput.trim();

    if (!value) return;

    const alreadyExists = skills.some(
      (skill) => skill.toLowerCase() === value.toLowerCase()
    );

    if (!alreadyExists) {
      setSkills((prev) => [...prev, value]);
    }

    setSkillInput("");
    setValidationError("");

    if (error) {
      dispatch(clearJobError());
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills((prev) =>
      prev.filter((skill) => skill !== skillToRemove)
    );

    setValidationError("");
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setValidationError("");

    const title = formData.title.trim();
    const company = formData.company.trim();
    const location = formData.location.trim();
    const description = formData.description.trim();

    let finalSkills = [...skills];
    const pendingSkill = skillInput.trim();

    if (pendingSkill) {
      const alreadyExists = finalSkills.some(
        (skill) => skill.toLowerCase() === pendingSkill.toLowerCase()
      );

      if (!alreadyExists) {
        finalSkills.push(pendingSkill);
      }
    }

    // =====================================================
    // VALIDATION
    // =====================================================

    if (!title) {
      setValidationError("Please enter job title.");
      return;
    }

    if (!company) {
      setValidationError("Please enter company name.");
      return;
    }

    if (!location) {
      setValidationError("Please enter job location.");
      return;
    }

    if (!formData.jobType) {
      setValidationError("Please select job type.");
      return;
    }

    if (finalSkills.length === 0) {
      setValidationError("Please add at least one required skill.");
      return;
    }

    if (!description) {
      setValidationError("Please enter job description.");
      return;
    }

    if (description.length < 20) {
      setValidationError(
        "Job description must be at least 20 characters."
      );
      return;
    }

    const minSalary =
      formData.minSalary === "" ? null : Number(formData.minSalary);

    const maxSalary =
      formData.maxSalary === "" ? null : Number(formData.maxSalary);

    if (
      minSalary !== null &&
      (Number.isNaN(minSalary) || minSalary < 0)
    ) {
      setValidationError(
        "Minimum salary must be a valid positive number."
      );
      return;
    }

    if (
      maxSalary !== null &&
      (Number.isNaN(maxSalary) || maxSalary < 0)
    ) {
      setValidationError(
        "Maximum salary must be a valid positive number."
      );
      return;
    }

    if (
      minSalary !== null &&
      maxSalary !== null &&
      minSalary > maxSalary
    ) {
      setValidationError(
        "Minimum salary cannot be greater than maximum salary."
      );
      return;
    }

    // =====================================================
    // PAYLOAD
    // =====================================================

    const payload = {
      title,
      company,
      location,
      jobType: formData.jobType.trim().toLowerCase(),
      skills: finalSkills,
      description,
    };

    if (formData.category.trim()) {
      payload.category = formData.category.trim();
    }

    if (formData.experienceLevel.trim()) {
      payload.experienceLevel = formData.experienceLevel.trim();
    }

    // NEW: experience string (e.g. "2-3 years")
    if (formData.experience.trim()) {
      payload.experience = formData.experience.trim();
    }

    if (minSalary !== null) {
      payload.minSalary = minSalary;
    }

    if (maxSalary !== null) {
      payload.maxSalary = maxSalary;
    }

    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");

      if (!token) {
        setValidationError("Please login as recruiter first.");
        return;
      }

      await dispatch(
        createJob({
          jobData: payload,
          token,
        })
      ).unwrap();
    } catch (err) {
      console.error("CREATE JOB ERROR:", err);
      setValidationError(getErrorMessage(err));
    }
  };

  // =====================================================
  // SUCCESS REDIRECT
  // =====================================================

  useEffect(() => {
    if (!success) {
      return undefined;
    }

    const timer = setTimeout(() => {
      dispatch(clearJobSuccess());
      navigate("/jobs/my-jobs", { replace: true });
    }, 1200);

    return () => clearTimeout(timer);
  }, [success, dispatch, navigate]);

  // =====================================================
  // CLEANUP
  // =====================================================

  useEffect(() => {
    return () => {
      dispatch(clearJobError());
      dispatch(clearJobSuccess());
    };
  }, [dispatch]);

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate("/jobs/my-jobs")}
            className="mb-4 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            ← Back to jobs
          </button>

          <h1 className="text-3xl font-bold text-slate-900">
            Post a New Job
          </h1>

          <p className="mt-2 text-slate-500">
            Create a job listing and find the right candidate for your
            company.
          </p>
        </div>

        {/* SUCCESS */}
        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
            Job posted successfully! Redirecting...
          </div>
        )}

        {/* ERROR */}
        {(validationError || error) && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {validationError || getErrorMessage(error)}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
          >
            {/* BASIC DETAILS */}
            <div className="mb-8">
              <div className="mb-5">
                <h2 className="text-xl font-bold text-slate-900">
                  Basic Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter the main information about the job.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {/* JOB TITLE */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="title"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Job Title
                  </label>

                  <input
                    id="title"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Frontend Developer"
                    maxLength={100}
                    autoComplete="off"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* COMPANY */}
                <div>
                  <label
                    htmlFor="company"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Company
                  </label>

                  <input
                    id="company"
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g. Tech Solutions"
                    maxLength={100}
                    autoComplete="organization"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* LOCATION */}
                <div>
                  <label
                    htmlFor="location"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Location
                  </label>

                  <input
                    id="location"
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Lahore, Pakistan"
                    maxLength={150}
                    autoComplete="address-level2"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>
            </div>

            {/* JOB DETAILS */}
            <div className="mb-8 border-t border-slate-100 pt-8">
              <div className="mb-5">
                <h2 className="text-xl font-bold text-slate-900">
                  Job Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Define the type, category, experience and salary.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {/* JOB TYPE */}
                <div>
                  <label
                    htmlFor="jobType"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Job Type
                  </label>

                  <select
                    id="jobType"
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
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
                    placeholder="e.g. Software Development"
                    maxLength={100}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="">Select experience</option>
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Level">Senior Level</option>
                    <option value="Lead">Lead</option>
                  </select>
                </div>

                {/* EXPERIENCE (NEW) */}
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
                    placeholder="e.g. 2-3 years"
                    maxLength={100}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* MIN SALARY */}
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
                    value={formData.minSalary}
                    onChange={handleChange}
                    placeholder="80000"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* MAX SALARY */}
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
                    value={formData.maxSalary}
                    onChange={handleChange}
                    placeholder="150000"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>
            </div>

            {/* SKILLS */}
            <div className="mb-8 border-t border-slate-100 pt-8">
              <div className="mb-5">
                <h2 className="text-xl font-bold text-slate-900">
                  Required Skills
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add the skills candidates should have.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => {
                    setSkillInput(e.target.value);
                    setValidationError("");
                  }}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="e.g. React.js"
                  maxLength={50}
                  autoComplete="off"
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

                <button
                  type="button"
                  onClick={addSkill}
                  className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Add Skill
                </button>
              </div>

              {skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <div
                      key={skill}
                      className="flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700"
                    >
                      <span>{skill}</span>

                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        aria-label={`Remove ${skill}`}
                        className="font-bold text-indigo-500 hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {skills.length === 0 && (
                <p className="mt-3 text-xs text-slate-400">
                  Add at least one skill.
                </p>
              )}
            </div>

            {/* DESCRIPTION */}
            <div className="border-t border-slate-100 pt-8">
              <div className="mb-5">
                <h2 className="text-xl font-bold text-slate-900">
                  Job Description
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Explain the role and what the candidate will do.
                </p>
              </div>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={8}
                maxLength={5000}
                placeholder="Describe the job, responsibilities, expectations and requirements..."
                className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

              <div className="mt-2 flex justify-between text-xs text-slate-400">
                <span>Minimum 20 characters</span>
                <span>{formData.description.length} characters</span>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/recruiter/dashboard")}
                className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || success}
                className="rounded-xl bg-indigo-600 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Posting Job..." : "Post Job"}
              </button>
            </div>
          </form>

          {/* LIVE PREVIEW */}
          <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
            <h2 className="text-lg font-bold text-slate-900">
              Live Preview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              This is how your job listing will look.
            </p>

            <div className="mt-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-slate-900">
                  {formData.title || "Frontend Developer"}
                </h3>

                <p className="mt-1 text-sm font-medium text-slate-600">
                  {formData.company || "Your Company"}
                </p>
              </div>

              <div className="space-y-3 text-sm text-slate-600">
                <div>📍 {formData.location || "Location"}</div>

                <div>
                  💼{" "}
                  {formData.jobType
                    ? formData.jobType.charAt(0).toUpperCase() +
                      formData.jobType.slice(1)
                    : "Full-time"}
                </div>

                {formData.category && (
                  <div>📂 {formData.category}</div>
                )}

                {formData.experienceLevel && (
                  <div>🎯 {formData.experienceLevel}</div>
                )}

                {/* Experience preview */}
                {formData.experience && (
                  <div>🧠 {formData.experience}</div>
                )}

                {(formData.minSalary || formData.maxSalary) && (
                  <div>
                    💰 {formData.minSalary || "0"} -{" "}
                    {formData.maxSalary || "Negotiable"}
                  </div>
                )}
              </div>

              {/* PREVIEW SKILLS */}
              {(skills.length > 0 || skillInput.trim()) && (
                <div className="mt-6">
                  <p className="mb-2 text-sm font-semibold text-slate-800">
                    Skills
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {[...skills, skillInput.trim()]
                      .filter(Boolean)
                      .filter(
                        (skill, index, array) =>
                          array.findIndex(
                            (item) =>
                              item.toLowerCase() === skill.toLowerCase()
                          ) === index
                      )
                      .map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
                        >
                          {skill}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* DESCRIPTION */}
              <div className="mt-6">
                <p className="mb-2 text-sm font-semibold text-slate-800">
                  Description
                </p>

                <p className="whitespace-pre-line text-sm leading-6 text-slate-500">
                  {formData.description ||
                    "Your job description will appear here..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJob;