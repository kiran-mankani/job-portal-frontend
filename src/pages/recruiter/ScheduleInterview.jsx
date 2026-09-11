import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  CalendarDays,
  Clock3,
  Video,
  MapPin,
  UserRound,
  Mail,
  FileText,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

import { getRecruiterApplications } from "../../store/applicationSlice";

import {
  scheduleInterview,
  clearInterviewError,
  clearInterviewSuccess,
} from "../../store/interviewSlice";

function ScheduleInterview() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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

  // =========================================================
  // APPLICATION STATE
  // =========================================================

  const applicationState = useSelector(
    (state) => state.applications || {}
  );

  const applications = Array.isArray(applicationState.applications)
    ? applicationState.applications
    : [];

  const applicationsLoading = Boolean(applicationState.loading);

  const applicationError = applicationState.error || null;

  // =========================================================
  // INTERVIEW STATE
  // =========================================================

  const interviewState = useSelector(
    (state) => state.interviews || {}
  );

  const interviewLoading = Boolean(interviewState.loading);

  const interviewError = interviewState.error || null;

  const success = interviewState.success || null;

  const loading = applicationsLoading || interviewLoading;

  const error = interviewError || applicationError;

  // =========================================================
  // FORM
  // =========================================================

  const [formData, setFormData] = useState({
    applicationId: searchParams.get("applicationId") || "",
    candidateId: searchParams.get("candidateId") || "",
    date: "",
    duration: 30,
    mode: "online",
    meetingLink: "",
    location: "",
    notes: "",
  });

  const [submitAttempted, setSubmitAttempted] = useState(false);

  // =========================================================
  // LOAD RECRUITER APPLICATIONS
  // =========================================================

  useEffect(() => {
    if (!token) return;

    dispatch(getRecruiterApplications(token));
  }, [dispatch, token]);

  // =========================================================
  // SELECTED APPLICATION
  // =========================================================

  const selectedApplication = useMemo(() => {
    if (!formData.applicationId) {
      return null;
    }

    return (
      applications.find(
        (application) =>
          String(application?._id || application?.id || "") ===
          String(formData.applicationId)
      ) || null
    );
  }, [applications, formData.applicationId]);

  const selectedCandidate = selectedApplication?.candidate || null;

  const selectedJob = selectedApplication?.job || null;

  // =========================================================
  // AUTO SELECT CANDIDATE
  // =========================================================

  useEffect(() => {
    if (!selectedApplication) return;

    const candidateId =
      selectedApplication?.candidate?._id ||
      selectedApplication?.candidateId ||
      "";

    if (
      candidateId &&
      candidateId !== formData.candidateId
    ) {
      setFormData((previous) => ({
        ...previous,
        candidateId,
      }));
    }
  }, [selectedApplication, formData.candidateId]);

  // =========================================================
  // SUCCESS MESSAGE
  // =========================================================

  const successMessage = useMemo(() => {
    if (!success) return "";

    if (typeof success === "string") {
      return success;
    }

    if (typeof success === "object") {
      return (
        success.message ||
        success.data?.message ||
        "Interview scheduled successfully."
      );
    }

    return "Interview scheduled successfully.";
  }, [success]);

  // =========================================================
  // ERROR MESSAGE
  // =========================================================

  const errorMessage = useMemo(() => {
    if (!error) return "";

    if (typeof error === "string") {
      return error;
    }

    if (typeof error === "object") {
      return (
        error.message ||
        error.error ||
        error.data?.message ||
        "Something went wrong. Please try again."
      );
    }

    return "Something went wrong. Please try again.";
  }, [error]);

  // =========================================================
  // HANDLE CHANGE
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "applicationId") {
      const application = applications.find(
        (item) =>
          String(item?._id || item?.id || "") === String(value)
      );

      const candidateId =
        application?.candidate?._id ||
        application?.candidateId ||
        "";

      setFormData((previous) => ({
        ...previous,
        applicationId: value,
        candidateId,
      }));
    } else if (name === "mode") {
      setFormData((previous) => ({
        ...previous,
        mode: value,
        meetingLink:
          value === "online" ? previous.meetingLink : "",
        location:
          value === "offline" ? previous.location : "",
      }));
    } else {
      setFormData((previous) => ({
        ...previous,
        [name]: value,
      }));
    }

    setSubmitAttempted(false);

    if (interviewError) {
      dispatch(clearInterviewError());
    }

    if (success) {
      dispatch(clearInterviewSuccess());
    }
  };

  // =========================================================
  // MODE CHANGE
  // =========================================================

  const handleModeChange = (mode) => {
    setFormData((previous) => ({
      ...previous,
      mode,
      meetingLink:
        mode === "online" ? previous.meetingLink : "",
      location:
        mode === "offline" ? previous.location : "",
    }));

    setSubmitAttempted(false);
    dispatch(clearInterviewError());
    dispatch(clearInterviewSuccess());
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitAttempted(true);

    if (loading) {
      return;
    }

    if (!token) {
      alert("Please login as recruiter.");
      navigate("/login");
      return;
    }

    if (!formData.applicationId) {
      alert("Please select an application.");
      return;
    }

    if (!selectedApplication) {
      alert("Selected application could not be found.");
      return;
    }

    const candidateId =
      selectedApplication?.candidate?._id ||
      selectedApplication?.candidateId ||
      formData.candidateId ||
      "";

    if (!candidateId) {
      alert("Candidate information is missing.");
      return;
    }

    if (!formData.date) {
      alert("Please select interview date and time.");
      return;
    }

    const selectedDate = new Date(formData.date);

    if (Number.isNaN(selectedDate.getTime())) {
      alert("Please select a valid interview date and time.");
      return;
    }

    if (selectedDate.getTime() <= Date.now()) {
      alert("Please select a future interview date and time.");
      return;
    }

    const duration = Number(formData.duration);

    if (
      !Number.isFinite(duration) ||
      duration < 15 ||
      duration > 480
    ) {
      alert(
        "Interview duration must be between 15 and 480 minutes."
      );
      return;
    }

    if (
      formData.mode !== "online" &&
      formData.mode !== "offline"
    ) {
      alert("Please select a valid interview mode.");
      return;
    }

    const meetingLink = formData.meetingLink.trim();
    const location = formData.location.trim();
    const notes = formData.notes.trim();

    if (formData.mode === "online" && !meetingLink) {
      alert("Please enter the meeting link.");
      return;
    }

    if (formData.mode === "offline" && !location) {
      alert("Please enter the interview location.");
      return;
    }

    if (
      formData.mode === "online" &&
      meetingLink &&
      !isValidUrl(meetingLink)
    ) {
      alert("Please enter a valid meeting URL.");
      return;
    }

    const interviewData = {
      applicationId:
        selectedApplication?._id ||
        selectedApplication?.id ||
        formData.applicationId,

      candidateId,

      date: selectedDate.toISOString(),

      duration,

      mode: formData.mode,

      meetingLink:
        formData.mode === "online"
          ? meetingLink
          : "",

      location:
        formData.mode === "offline"
          ? location
          : "",

      notes,
    };

    const result = await dispatch(
      scheduleInterview({
        interviewData,
        token,
      })
    );

    if (scheduleInterview.fulfilled.match(result)) {
      setSubmitAttempted(false);

      setTimeout(() => {
        navigate("/recruiter/interviews", {
          replace: true,
        });
      }, 900);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-[#f5f8fc] text-[#172b4d]">
      {/* HEADER */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-[70px] max-w-[1180px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/recruiter/interviews"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              aria-label="Back to interviews"
            >
              <ArrowLeft size={17} />
            </Link>

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
              <CalendarDays size={18} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-[18px] font-bold text-[#172b4d]">
                Schedule Interview
              </h1>

              <p className="hidden text-[10px] text-slate-400 sm:block">
                Create a new candidate interview
              </p>
            </div>
          </div>

          <Link
            to="/recruiter/interviews"
            className="hidden rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-600 sm:inline-flex"
          >
            All Interviews
          </Link>
        </div>
      </header>

      {/* MAIN */}

      <main className="mx-auto max-w-[1180px] px-4 py-5 sm:px-6 lg:px-8">
        {/* INTRO */}

        <section className="mb-5">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Recruiter Portal
          </p>

          <h2 className="text-[25px] font-bold leading-tight text-[#152b4d] sm:text-[29px]">
            Schedule a New Interview
          </h2>

          <p className="mt-1.5 max-w-2xl text-[13px] text-slate-500">
            Select an application, choose a time, and send the
            interview details to the candidate.
          </p>
        </section>

        {/* SUCCESS */}

        {successMessage && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">
            <CheckCircle2 size={17} className="shrink-0" />

            <span>{successMessage}</span>
          </div>
        )}

        {/* ERROR */}

        {errorMessage && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
            <AlertCircle
              size={17}
              className="mt-0.5 shrink-0"
            />

            <div className="min-w-0">
              <p className="font-semibold">
                Unable to schedule interview
              </p>

              <p className="mt-1 break-words">
                {errorMessage}
              </p>
            </div>
          </div>
        )}

        {/* FORM + SIDE PANEL */}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
          {/* FORM CARD */}

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h3 className="text-[15px] font-bold text-[#172b4d]">
                Interview Details
              </h3>

              <p className="mt-1 text-[10px] text-slate-400">
                Complete the required information below.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-5"
            >
              {/* APPLICATION */}

              <FieldGroup
                label="Application"
                required
              >
                <div className="relative">
                  <FileText
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    name="applicationId"
                    value={formData.applicationId}
                    onChange={handleChange}
                    required
                    disabled={
                      applicationsLoading ||
                      interviewLoading
                    }
                    className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-9 text-xs text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      {applicationsLoading
                        ? "Loading applications..."
                        : applications.length === 0
                        ? "No applications available"
                        : "Select an application"}
                    </option>

                    {applications.map((application) => {
                      const applicationId =
                        application?._id ||
                        application?.id ||
                        "";

                      return (
                        <option
                          key={applicationId}
                          value={applicationId}
                        >
                          {application?.candidate?.name ||
                            application?.candidate?.email ||
                            "Candidate"}{" "}
                          —{" "}
                          {application?.job?.title ||
                            "Job"}
                        </option>
                      );
                    })}
                  </select>

                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                {submitAttempted &&
                  !formData.applicationId && (
                    <p className="mt-1.5 text-[9px] text-red-500">
                      Please select an application.
                    </p>
                  )}
              </FieldGroup>

              {/* SELECTED CANDIDATE */}

              {selectedCandidate && (
                <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                      {getInitials(
                        selectedCandidate?.name ||
                          "Candidate"
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-[12px] font-bold text-[#263d5d]">
                        {selectedCandidate?.name ||
                          "Candidate"}
                      </p>

                      {selectedCandidate?.email && (
                        <p className="mt-1 flex items-center gap-1.5 truncate text-[9px] text-slate-500">
                          <Mail size={11} />

                          {selectedCandidate.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {selectedJob && (
                    <div className="mt-3 border-t border-blue-100 pt-3">
                      <p className="text-[9px] font-bold uppercase tracking-wide text-blue-500">
                        Applying For
                      </p>

                      <p className="mt-1 text-[11px] font-semibold text-[#304563]">
                        {selectedJob.title || "Job"}
                      </p>

                      {selectedJob.location && (
                        <p className="mt-1 flex items-center gap-1 text-[9px] text-slate-400">
                          <MapPin size={10} />

                          {selectedJob.location}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* DATE + DURATION */}

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FieldGroup
                  label="Interview Date & Time"
                  required
                >
                  <div className="relative">
                    <CalendarDays
                      size={16}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="datetime-local"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      min={getMinDateTime()}
                      disabled={interviewLoading}
                      className="form-input pl-10 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </FieldGroup>

                <FieldGroup
                  label="Duration"
                  required
                >
                  <div className="relative">
                    <Clock3
                      size={16}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      disabled={interviewLoading}
                      className="form-input appearance-none pl-10 pr-9 disabled:cursor-not-allowed disabled:opacity-60"
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

                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                </FieldGroup>
              </div>

              {/* MODE */}

              <FieldGroup
                label="Interview Mode"
                required
                className="mt-5"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <ModeButton
                    active={formData.mode === "online"}
                    icon={<Video size={18} />}
                    title="Online"
                    description="Video meeting"
                    onClick={() =>
                      handleModeChange("online")
                    }
                  />

                  <ModeButton
                    active={formData.mode === "offline"}
                    icon={<MapPin size={18} />}
                    title="Offline"
                    description="In-person meeting"
                    onClick={() =>
                      handleModeChange("offline")
                    }
                  />
                </div>
              </FieldGroup>

              {/* ONLINE LINK */}

              {formData.mode === "online" && (
                <FieldGroup
                  label="Meeting Link"
                  required
                  className="mt-5"
                >
                  <div className="relative">
                    <Video
                      size={16}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="url"
                      name="meetingLink"
                      value={formData.meetingLink}
                      onChange={handleChange}
                      placeholder="https://meet.google.com/..."
                      required
                      disabled={interviewLoading}
                      className="form-input pl-10 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </FieldGroup>
              )}

              {/* OFFLINE LOCATION */}

              {formData.mode === "offline" && (
                <FieldGroup
                  label="Interview Location"
                  required
                  className="mt-5"
                >
                  <div className="relative">
                    <MapPin
                      size={16}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Office address / interview location"
                      required
                      disabled={interviewLoading}
                      className="form-input pl-10 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </FieldGroup>
              )}

              {/* NOTES */}

              <FieldGroup
                label="Notes"
                className="mt-5"
              >
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={5}
                  maxLength={2000}
                  placeholder="Add interview instructions, preparation notes, or any other details..."
                  disabled={interviewLoading}
                  className="form-input resize-y py-3 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <p className="mt-1 text-right text-[9px] text-slate-400">
                  {formData.notes.length}/2000
                </p>
              </FieldGroup>

              {/* ACTIONS */}

              <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      Scheduling...
                    </>
                  ) : (
                    <>
                      <CalendarDays size={15} />

                      Schedule Interview
                    </>
                  )}
                </button>

                <Link
                  to="/recruiter/interviews"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </section>

          {/* SIDE PANEL */}

          <aside className="space-y-4">
            {/* CANDIDATE PREVIEW */}

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <UserRound size={16} />
                </div>

                <h3 className="text-[14px] font-bold text-[#172b4d]">
                  Candidate Preview
                </h3>
              </div>

              {selectedCandidate ? (
                <div className="mt-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                      {getInitials(
                        selectedCandidate?.name ||
                          "Candidate"
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-bold text-[#263d5d]">
                        {selectedCandidate?.name ||
                          "Candidate"}
                      </p>

                      <p className="mt-1 truncate text-[9px] text-slate-400">
                        {selectedCandidate?.email ||
                          "Email unavailable"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    {selectedCandidate?.email && (
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <Mail
                          size={12}
                          className="text-blue-500"
                        />

                        <span className="truncate">
                          {selectedCandidate.email}
                        </span>
                      </div>
                    )}

                    {selectedCandidate?.phone && (
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span className="text-blue-500">
                          #
                        </span>

                        <span>
                          {selectedCandidate.phone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-lg bg-slate-50 px-4 py-8 text-center">
                  <UserRound
                    size={28}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    No candidate selected
                  </p>

                  <p className="mt-1 text-[9px] text-slate-400">
                    Select an application to see candidate
                    information.
                  </p>
                </div>
              )}
            </section>

            {/* INTERVIEW SUMMARY */}

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-[14px] font-bold text-[#172b4d]">
                Interview Summary
              </h3>

              <div className="mt-4 space-y-3">
                <SummaryRow
                  icon={<CalendarDays size={14} />}
                  label="Date & Time"
                  value={
                    formData.date
                      ? formatDateTime(formData.date)
                      : "Not selected"
                  }
                />

                <SummaryRow
                  icon={<Clock3 size={14} />}
                  label="Duration"
                  value={`${formData.duration} minutes`}
                />

                <SummaryRow
                  icon={
                    formData.mode === "online" ? (
                      <Video size={14} />
                    ) : (
                      <MapPin size={14} />
                    )
                  }
                  label="Mode"
                  value={formData.mode}
                  capitalize
                />

                {formData.mode === "online" &&
                  formData.meetingLink && (
                    <SummaryRow
                      icon={<Video size={14} />}
                      label="Meeting"
                      value={formData.meetingLink}
                    />
                  )}

                {formData.mode === "offline" &&
                  formData.location && (
                    <SummaryRow
                      icon={<MapPin size={14} />}
                      label="Location"
                      value={formData.location}
                    />
                  )}
              </div>
            </section>

            {/* TIP */}

            <section className="rounded-xl border border-blue-100 bg-blue-50/60 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
                  <CalendarDays size={15} />
                </div>

                <div>
                  <h3 className="text-[12px] font-bold text-[#25476e]">
                    Interview Tip
                  </h3>

                  <p className="mt-1.5 text-[10px] leading-5 text-slate-500">
                    Make sure the date, time, meeting link, and
                    candidate details are correct before
                    scheduling.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

// =========================================================
// FIELD GROUP
// =========================================================

function FieldGroup({
  label,
  required = false,
  children,
  className = "",
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[10px] font-semibold text-slate-600">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

// =========================================================
// MODE BUTTON
// =========================================================

function ModeButton({
  active,
  icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
        active
          ? "border-blue-300 bg-blue-50 text-blue-700"
          : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/50"
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          active
            ? "bg-blue-100 text-blue-600"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-bold">
          {title}
        </p>

        <p className="mt-0.5 text-[9px] text-slate-400">
          {description}
        </p>
      </div>
    </button>
  );
}

// =========================================================
// SUMMARY ROW
// =========================================================

function SummaryRow({
  icon,
  label,
  value,
  capitalize = false,
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[8px] uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p
          title={String(value)}
          className={`mt-0.5 truncate text-[10px] font-semibold text-[#304563] ${
            capitalize ? "capitalize" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// =========================================================
// MIN DATETIME FOR INPUT
// =========================================================

function getMinDateTime() {
  const now = new Date();

  // Add one minute and let Date handle hour/day/month/year rollover.
  now.setMinutes(now.getMinutes() + 1);

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(
    2,
    "0"
  );

  const day = String(now.getDate()).padStart(2, "0");

  const hours = String(now.getHours()).padStart(
    2,
    "0"
  );

  const minutes = String(now.getMinutes()).padStart(
    2,
    "0"
  );

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// =========================================================
// FORMAT DATE + TIME
// =========================================================

function formatDateTime(value) {
  if (!value) {
    return "Not selected";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// =========================================================
// URL VALIDATION
// =========================================================

function isValidUrl(value) {
  try {
    const url = new URL(value);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}

// =========================================================
// INITIALS
// =========================================================

function getInitials(name) {
  if (!name) {
    return "C";
  }

  return (
    String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase()
      )
      .join("") || "C"
  );
}

export default ScheduleInterview;