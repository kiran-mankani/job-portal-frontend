import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  MapPin,
  Clock3,
  Tags,
  UserRound,
  WalletCards,
  FileText,
  Plus,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
} from "lucide-react";

import {
  createJob,
  clearJobError,
  clearJobSuccess,
} from "../../store/jobSlice";

const initialForm = {
  title: "",
  company: "",
  location: "",
  jobType: "full-time",
  category: "",
  experienceLevel: "",
  minSalary: "",
  maxSalary: "",
  description: "",
  skills: [],
  skillInput: "",
};

const inputBase =
  "h-12 w-full rounded-xl border bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50";

function PostJob() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const auth = useSelector((state) => state.auth || {});
  const job = useSelector((state) => state.job || {});

  const token = auth.token || localStorage.getItem("token");

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const loading = Boolean(job.loading);

  useEffect(() => {
    return () => {
      dispatch(clearJobError());
      dispatch(clearJobSuccess());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    if (job.error) {
      dispatch(clearJobError());
    }

    if (job.success) {
      dispatch(clearJobSuccess());
    }
  };

  const addSkill = () => {
    const skill = form.skillInput.trim();

    if (!skill) return;

    const exists = form.skills.some(
      (item) => item.toLowerCase() === skill.toLowerCase()
    );

    if (exists) {
      setForm((prev) => ({
        ...prev,
        skillInput: "",
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      skills: [...prev.skills, skill],
      skillInput: "",
    }));

    setErrors((prev) => ({
      ...prev,
      skills: "",
    }));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
  };

  const removeSkill = (skill) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((item) => item !== skill),
    }));
  };

  const validate = () => {
    const next = {};

    const title = form.title.trim();
    const company = form.company.trim();
    const location = form.location.trim();
    const description = form.description.trim();

    if (!title) {
      next.title = "Job title is required.";
    } else if (title.length < 2) {
      next.title = "Job title should be at least 2 characters.";
    }

    if (!company) {
      next.company = "Company name is required.";
    } else if (company.length < 2) {
      next.company = "Company name should be at least 2 characters.";
    }

    if (!location) {
      next.location = "Location is required.";
    }

    if (!form.jobType) {
      next.jobType = "Please select a job type.";
    }

    if (form.skills.length === 0) {
      next.skills = "Add at least one skill.";
    }

    if (!description) {
      next.description = "Job description is required.";
    } else if (description.length < 20) {
      next.description =
        "Description should be at least 20 characters.";
    }

    const min =
      form.minSalary === ""
        ? null
        : Number(form.minSalary);

    const max =
      form.maxSalary === ""
        ? null
        : Number(form.maxSalary);

    if (
      min !== null &&
      (!Number.isFinite(min) || min < 0)
    ) {
      next.minSalary = "Enter a valid minimum salary.";
    }

    if (
      max !== null &&
      (!Number.isFinite(max) || max < 0)
    ) {
      next.maxSalary = "Enter a valid maximum salary.";
    }

    if (
      min !== null &&
      max !== null &&
      Number.isFinite(min) &&
      Number.isFinite(max) &&
      max < min
    ) {
      next.maxSalary =
        "Maximum salary cannot be lower than minimum.";
    }

    setErrors(next);

    return {
      valid: Object.keys(next).length === 0,
      min,
      max,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!token) {
      setErrors({
        auth: "Please login as recruiter first.",
      });

      navigate("/login", { replace: true });
      return;
    }

    const result = validate();

    if (!result.valid) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    const payload = {
      title: form.title.trim(),
      company: form.company.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      skills: form.skills.map((skill) => skill.trim()),
      jobType: form.jobType.toLowerCase(),
    };

    if (form.category.trim()) {
      payload.category = form.category.trim();
    }

    if (form.experienceLevel) {
      payload.experienceLevel = form.experienceLevel;
    }

    if (result.min !== null) {
      payload.minSalary = result.min;
    }

    if (result.max !== null) {
      payload.maxSalary = result.max;
    }

    const response = await dispatch(
      createJob({
        jobData: payload,
        token,
      })
    );

    if (createJob.fulfilled.match(response)) {
      const timer = window.setTimeout(() => {
        navigate("/jobs/my-jobs", { replace: true });
      }, 800);

      window.setTimeout(() => {
        window.clearTimeout(timer);
      }, 1000);
    }
  };

  const errorMessage =
    typeof job.error === "string"
      ? job.error
      : job.error?.message || "Unable to create job.";

  const successMessage =
    typeof job.success === "string"
      ? job.success
      : job.success?.message || "Job created successfully.";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              to="/recruiter/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
              aria-label="Back to recruiter dashboard"
            >
              <ArrowLeft size={18} />
            </Link>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-100">
              <BriefcaseBusiness size={19} />
            </div>

            <div>
              <h1 className="text-base font-bold text-slate-900 sm:text-lg">
                Post a New Job
              </h1>
              <p className="hidden text-xs text-slate-400 sm:block">
                Create a new opportunity
              </p>
            </div>
          </div>

          <Link
            to="/jobs/my-jobs"
            className="hidden items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 sm:flex"
          >
            My Jobs
            <ChevronRight size={14} />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-7">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-600">
            <Sparkles size={12} />
            Recruiter Portal
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Create Job Posting
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Add clear job information, required skills and
            expectations to attract the right candidates.
          </p>
        </div>

        {errors.auth && (
          <MessageBox
            type="error"
            title="Authentication Required"
            message={errors.auth}
          />
        )}

        {job.success && (
          <MessageBox
            type="success"
            title="Job Published Successfully"
            message={successMessage}
          />
        )}

        {job.error && (
          <MessageBox
            type="error"
            title="Unable to Create Job"
            message={errorMessage}
          />
        )}

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-gradient-to-r from-white to-blue-50/40 px-5 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <FileText size={19} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    Job Information
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Fields marked with * are required.
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="p-5 sm:p-7"
            >
              <Section
                number="01"
                title="Basic Details"
                text="Tell candidates what this opportunity is about."
              >
                <div className="space-y-5">
                  <Field
                    label="Job Title"
                    required
                    icon={<BriefcaseBusiness size={16} />}
                    error={errors.title}
                  >
                    <input
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="e.g. Frontend Developer"
                      disabled={loading}
                      maxLength={100}
                      className={getInputClass(errors.title)}
                    />
                  </Field>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Field
                      label="Company"
                      required
                      icon={<Building2 size={16} />}
                      error={errors.company}
                    >
                      <input
                        name="company"
                        value={form.company}
                        onChange={handleChange}
                        placeholder="e.g. Tech Solutions"
                        disabled={loading}
                        maxLength={100}
                        className={getInputClass(errors.company)}
                      />
                    </Field>

                    <Field
                      label="Location"
                      required
                      icon={<MapPin size={16} />}
                      error={errors.location}
                    >
                      <input
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        placeholder="e.g. Lahore, Pakistan / Remote"
                        disabled={loading}
                        maxLength={150}
                        className={getInputClass(errors.location)}
                      />
                    </Field>
                  </div>
                </div>
              </Section>

              <Section
                number="02"
                title="Job Details"
                text="Define the type, category, experience and salary."
              >
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Field
                      label="Job Type"
                      required
                      icon={<Clock3 size={16} />}
                      error={errors.jobType}
                    >
                      <select
                        name="jobType"
                        value={form.jobType}
                        onChange={handleChange}
                        disabled={loading}
                        className={`${getInputClass(
                          errors.jobType
                        )} cursor-pointer`}
                      >
                        <option value="full-time">
                          Full-time
                        </option>
                        <option value="part-time">
                          Part-time
                        </option>
                        <option value="contract">
                          Contract
                        </option>
                        <option value="internship">
                          Internship
                        </option>
                        <option value="freelance">
                          Freelance
                        </option>
                      </select>
                    </Field>

                    <Field
                      label="Category"
                      icon={<Tags size={16} />}
                    >
                      <input
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        placeholder="e.g. Software Development"
                        disabled={loading}
                        maxLength={100}
                        className={
                          inputBase + " border-slate-200"
                        }
                      />
                    </Field>
                  </div>

                  <Field
                    label="Experience Level"
                    icon={<UserRound size={16} />}
                  >
                    <select
                      name="experienceLevel"
                      value={form.experienceLevel}
                      onChange={handleChange}
                      disabled={loading}
                      className={`${inputBase} cursor-pointer border-slate-200`}
                    >
                      <option value="">
                        Select experience level
                      </option>
                      <option value="Entry Level">
                        Entry Level
                      </option>
                      <option value="Mid Level">
                        Mid Level
                      </option>
                      <option value="Senior Level">
                        Senior Level
                      </option>
                      <option value="Lead">
                        Lead
                      </option>
                    </select>
                  </Field>

                  <div>
                    <div className="mb-2.5 flex items-center gap-2">
                      <WalletCards
                        size={16}
                        className="text-slate-400"
                      />
                      <span className="text-xs font-bold">
                        Salary Range
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-400">
                        OPTIONAL
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <SalaryField
                        name="minSalary"
                        value={form.minSalary}
                        onChange={handleChange}
                        placeholder="Minimum salary"
                        error={errors.minSalary}
                        disabled={loading}
                      />

                      <SalaryField
                        name="maxSalary"
                        value={form.maxSalary}
                        onChange={handleChange}
                        placeholder="Maximum salary"
                        error={errors.maxSalary}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </Section>

              <Section
                number="03"
                title="Required Skills"
                text="Add the main skills candidates should have."
                required
              >
                <div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                      <Tags
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        name="skillInput"
                        value={form.skillInput}
                        onChange={handleChange}
                        onKeyDown={handleSkillKeyDown}
                        placeholder="e.g. React.js, Node.js, MongoDB"
                        disabled={loading}
                        maxLength={50}
                        className={`${getInputClass(
                          errors.skills
                        )} pl-11`}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={addSkill}
                      disabled={
                        loading ||
                        !form.skillInput.trim()
                      }
                      className="flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-md shadow-blue-100 transition hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Plus size={16} />
                      Add Skill
                    </button>
                  </div>

                  {errors.skills && (
                    <p className="mt-2 text-[10px] font-semibold text-red-500">
                      {errors.skills}
                    </p>
                  )}

                  {form.skills.length > 0 && (
                    <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                      <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-blue-500">
                        Selected Skills
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {form.skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-blue-700 shadow-sm"
                          >
                            {skill}

                            <button
                              type="button"
                              onClick={() =>
                                removeSkill(skill)
                              }
                              aria-label={`Remove ${skill}`}
                              className="text-blue-400 hover:text-red-500"
                            >
                              <X size={13} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Section>

              <Section
                number="04"
                title="Job Description"
                text="Clearly explain responsibilities and expectations."
                required
              >
                <Field
                  label="Description"
                  required
                  icon={<FileText size={16} />}
                  error={errors.description}
                >
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={9}
                    disabled={loading}
                    maxLength={5000}
                    placeholder="Describe the role, responsibilities, day-to-day work, requirements and expectations..."
                    className={`${getInputClass(
                      errors.description
                    )} h-auto resize-y py-3.5`}
                  />

                  <div className="mt-2 flex justify-between text-[10px] text-slate-400">
                    <span>
                      Write a clear and detailed description.
                    </span>
                    <span>
                      {form.description.length} / 5000
                    </span>
                  </div>
                </Field>
              </Section>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                <Link
                  to="/recruiter/dashboard"
                  className="flex h-12 items-center justify-center rounded-xl border border-slate-200 px-6 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 text-xs font-bold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Publish Job
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          <aside className="space-y-5 xl:sticky xl:top-[92px]">
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <BriefcaseBusiness size={17} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Live Preview
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Candidate view
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-600">
                  PREVIEW
                </span>
              </div>

              <div className="p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                  <Building2 size={21} />
                </div>

                <h4 className="mt-4 text-lg font-bold text-slate-900">
                  {form.title || "Your Job Title"}
                </h4>

                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {form.company || "Company Name"}
                </p>

                <div className="mt-5 space-y-3">
                  <PreviewRow
                    icon={<MapPin size={13} />}
                    value={form.location || "Location"}
                  />

                  <PreviewRow
                    icon={<Clock3 size={13} />}
                    value={formatJobType(form.jobType)}
                  />

                  {form.category && (
                    <PreviewRow
                      icon={<Tags size={13} />}
                      value={form.category}
                    />
                  )}

                  {form.experienceLevel && (
                    <PreviewRow
                      icon={<UserRound size={13} />}
                      value={form.experienceLevel}
                    />
                  )}

                  {(form.minSalary || form.maxSalary) && (
                    <PreviewRow
                      icon={<WalletCards size={13} />}
                      value={`PKR ${
                        form.minSalary || "—"
                      } - ${
                        form.maxSalary || "—"
                      }`}
                    />
                  )}
                </div>

                {form.skills.length > 0 && (
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Skills
                    </p>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {form.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold text-slate-600"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {form.description && (
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Description
                    </p>

                    <p className="mt-2 line-clamp-6 whitespace-pre-line text-[10px] leading-5 text-slate-500">
                      {form.description}
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-blue-100 bg-blue-50/70 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                  <Sparkles size={17} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-blue-950">
                    Better Job Post
                  </h3>
                  <p className="text-[10px] text-blue-600/70">
                    Get more qualified applications
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <Tip text="Use a clear job title." />
                <Tip text="Add relevant skills." />
                <Tip text="Explain responsibilities clearly." />
                <Tip text="Add salary when possible." />
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Section({
  number,
  title,
  text,
  required,
  children,
}) {
  return (
    <section className="border-b border-slate-100 py-7 first:pt-0 last:border-b-0">
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-500">
          {number}
        </div>

        <div>
          <div className="flex items-center gap-1">
            <h3 className="text-sm font-bold text-slate-900 sm:text-base">
              {title}
            </h3>

            {required && (
              <span className="text-red-500">*</span>
            )}
          </div>

          <p className="mt-1 text-[11px] text-slate-400">
            {text}
          </p>
        </div>
      </div>

      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  icon,
  error,
  children,
}) {
  return (
    <div>
      <label className="mb-2.5 flex items-center gap-2 text-xs font-bold text-slate-700">
        <span className="text-slate-400">{icon}</span>

        {label}

        {required && (
          <span className="text-red-500">*</span>
        )}
      </label>

      {children}

      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-red-500">
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}

function SalaryField({
  name,
  value,
  onChange,
  placeholder,
  error,
  disabled,
}) {
  return (
    <div>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
          PKR
        </span>

        <input
          type="number"
          min="0"
          step="1"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`${getInputClass(error)} pl-12`}
        />
      </div>

      {error && (
        <p className="mt-1.5 text-[10px] font-semibold text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

function PreviewRow({ icon, value }) {
  return (
    <div className="flex items-center gap-2.5 text-[11px] text-slate-500">
      <span className="text-blue-500">{icon}</span>
      <span className="truncate">{value}</span>
    </div>
  );
}

function Tip({ text }) {
  return (
    <div className="flex items-start gap-2.5">
      <CheckCircle2
        size={14}
        className="mt-0.5 shrink-0 text-blue-600"
      />
      <p className="text-[10px] leading-5 text-slate-500">
        {text}
      </p>
    </div>
  );
}

function MessageBox({
  type,
  title,
  message,
}) {
  const success = type === "success";

  return (
    <div
      className={`mb-5 flex items-start gap-3 rounded-2xl border px-4 py-3.5 ${
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {success ? (
        <CheckCircle2
          size={19}
          className="mt-0.5 shrink-0"
        />
      ) : (
        <AlertCircle
          size={19}
          className="mt-0.5 shrink-0"
        />
      )}

      <div>
        <p className="text-sm font-bold">{title}</p>
        <p className="mt-0.5 text-xs">{message}</p>
      </div>
    </div>
  );
}

function getInputClass(error) {
  return `${inputBase} ${
    error
      ? "border-red-300 focus:border-red-400 focus:ring-red-50"
      : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
  }`;
}

function formatJobType(value) {
  if (!value) return "Job Type";

  return value
    .split("-")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1)
    )
    .join("-");
}

export default PostJob;