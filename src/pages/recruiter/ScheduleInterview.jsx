import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getRecruiterApplications,
} from "../../store/applicationSlice";

import {
  scheduleInterview,
  clearInterviewError,
  clearInterviewSuccess,
} from "../../store/interviewSlice";

function ScheduleInterview() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { token } = useSelector((state) => state.auth);

  const {
    applications,
    loading: applicationsLoading,
    error: applicationError,
  } = useSelector((state) => state.applications);

  const {
    loading: interviewLoading,
    error: interviewError,
    success,
  } = useSelector((state) => state.interviews);

  const loading =
    applicationsLoading || interviewLoading;

  const error =
    interviewError || applicationError;

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

  // ==========================================
  // LOAD RECRUITER APPLICATIONS
  // ==========================================

  useEffect(() => {
    if (token) {
      dispatch(getRecruiterApplications(token));
    }
  }, [dispatch, token]);

  // ==========================================
  // AUTO SELECT APPLICATION
  // ==========================================

  useEffect(() => {
    if (
      formData.applicationId &&
      applications.length > 0
    ) {
      const selectedApplication =
        applications.find(
          (application) =>
            application._id ===
            formData.applicationId
        );

      if (
        selectedApplication?.candidate?._id
      ) {
        setFormData((previous) => ({
          ...previous,
          candidateId:
            selectedApplication.candidate._id,
        }));
      }
    }
  }, [
    applications,
    formData.applicationId,
  ]);

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "applicationId") {
      const selectedApplication =
        applications.find(
          (application) =>
            application._id === value
        );

      setFormData((previous) => ({
        ...previous,
        applicationId: value,
        candidateId:
          selectedApplication?.candidate?._id ||
          "",
      }));
    } else {
      setFormData((previous) => ({
        ...previous,
        [name]: value,
      }));
    }

    if (interviewError) {
      dispatch(clearInterviewError());
    }

    if (success) {
      dispatch(clearInterviewSuccess());
    }
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Please login as recruiter.");
      navigate("/login");
      return;
    }

    if (!formData.applicationId) {
      alert("Please select an application.");
      return;
    }

    if (!formData.candidateId) {
      alert("Candidate information is missing.");
      return;
    }

    if (!formData.date) {
      alert("Please select interview date and time.");
      return;
    }

    if (!formData.mode) {
      alert("Please select interview mode.");
      return;
    }

    if (
      formData.mode === "online" &&
      !formData.meetingLink.trim()
    ) {
      alert("Please enter the meeting link.");
      return;
    }

    if (
      formData.mode === "offline" &&
      !formData.location.trim()
    ) {
      alert("Please enter the interview location.");
      return;
    }

    const interviewData = {
      applicationId: formData.applicationId,
      candidateId: formData.candidateId,
      date: new Date(formData.date).toISOString(),
      duration: Number(formData.duration),
      mode: formData.mode,
      meetingLink:
        formData.mode === "online"
          ? formData.meetingLink.trim()
          : "",
      location:
        formData.mode === "offline"
          ? formData.location.trim()
          : "",
      notes: formData.notes.trim(),
    };

    const result = await dispatch(
      scheduleInterview({
        interviewData,
        token,
      })
    );

    if (
      scheduleInterview.fulfilled.match(result)
    ) {
      setTimeout(() => {
        navigate("/recruiter/interviews");
      }, 1200);
    }
  };

  // ==========================================
  // SELECTED APPLICATION
  // ==========================================

  const selectedApplication =
    applications.find(
      (application) =>
        application._id ===
        formData.applicationId
    );

  const selectedCandidate =
    selectedApplication?.candidate;

  // ==========================================
  // UI
  // ==========================================

  return (
    <div style={styles.container}>
      {/* HEADER */}

      <div style={styles.header}>
        <div>
          <h1>Schedule Interview</h1>

          <p style={styles.subtitle}>
            Schedule an interview with a candidate.
          </p>
        </div>

        <Link
          to="/recruiter/interviews"
          style={styles.backButton}
        >
          Interviews
        </Link>
      </div>

      {/* SUCCESS */}

      {success && (
        <div style={styles.success}>
          {success.message ||
            "Interview scheduled successfully."}
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {/* FORM */}

      <div style={styles.card}>
        <form onSubmit={handleSubmit}>
          {/* APPLICATION */}

          <div style={styles.field}>
            <label style={styles.label}>
              Application
            </label>

            <select
              name="applicationId"
              value={formData.applicationId}
              onChange={handleChange}
              required
              style={styles.input}
            >
              <option value="">
                Select an application
              </option>

              {applications.map(
                (application) => (
                  <option
                    key={application._id}
                    value={application._id}
                  >
                    {application.candidate?.name ||
                      application.candidate?.email ||
                      "Candidate"}{" "}
                    -{" "}
                    {application.job?.title ||
                      "Job"}
                  </option>
                )
              )}
            </select>
          </div>

          {/* CANDIDATE INFO */}

          {selectedCandidate && (
            <div style={styles.candidateBox}>
              <h3>Candidate</h3>

              <p>
                <strong>Name:</strong>{" "}
                {selectedCandidate.name ||
                  "N/A"}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {selectedCandidate.email ||
                  "N/A"}
              </p>
            </div>
          )}

          {/* DATE */}

          <div style={styles.field}>
            <label style={styles.label}>
              Interview Date & Time
            </label>

            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          {/* DURATION */}

          <div style={styles.field}>
            <label style={styles.label}>
              Duration
            </label>

            <select
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              style={styles.input}
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
            </select>
          </div>

          {/* MODE */}

          <div style={styles.field}>
            <label style={styles.label}>
              Interview Mode
            </label>

            <select
              name="mode"
              value={formData.mode}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="online">
                Online
              </option>

              <option value="offline">
                Offline
              </option>
            </select>
          </div>

          {/* ONLINE LINK */}

          {formData.mode === "online" && (
            <div style={styles.field}>
              <label style={styles.label}>
                Meeting Link
              </label>

              <input
                type="url"
                name="meetingLink"
                value={formData.meetingLink}
                onChange={handleChange}
                placeholder="https://meet.google.com/..."
                required
                style={styles.input}
              />
            </div>
          )}

          {/* OFFLINE LOCATION */}

          {formData.mode === "offline" && (
            <div style={styles.field}>
              <label style={styles.label}>
                Interview Location
              </label>

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Office address / location"
                required
                style={styles.input}
              />
            </div>
          )}

          {/* NOTES */}

          <div style={styles.field}>
            <label style={styles.label}>
              Notes
            </label>

            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional instructions or notes..."
              rows="5"
              style={styles.textarea}
            />
          </div>

          {/* BUTTONS */}

          <div style={styles.actions}>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.primaryButton,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? "Scheduling..."
                : "Schedule Interview"}
            </button>

            <Link
              to="/recruiter/interviews"
              style={styles.secondaryButton}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "30px 20px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "30px",
  },

  subtitle: {
    color: "#666",
    marginTop: "5px",
  },

  card: {
    padding: "30px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    background: "#fff",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.05)",
  },

  field: {
    marginBottom: "20px",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    fontWeight: "600",
    color: "#333",
  },

  input: {
    width: "100%",
    padding: "11px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "15px",
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    padding: "11px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "15px",
    resize: "vertical",
    boxSizing: "border-box",
  },

  candidateBox: {
    padding: "15px",
    marginBottom: "20px",
    background: "#f5f8ff",
    border: "1px solid #dbe5ff",
    borderRadius: "7px",
  },

  success: {
    padding: "12px 15px",
    marginBottom: "20px",
    background: "#e5ffe9",
    color: "#087a21",
    borderRadius: "6px",
  },

  error: {
    padding: "12px 15px",
    marginBottom: "20px",
    background: "#ffe5e5",
    color: "#c00",
    borderRadius: "6px",
  },

  actions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "25px",
  },

  primaryButton: {
    padding: "11px 18px",
    border: "none",
    borderRadius: "6px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontSize: "15px",
  },

  secondaryButton: {
    display: "inline-block",
    padding: "10px 18px",
    border: "1px solid #2563eb",
    borderRadius: "6px",
    background: "#fff",
    color: "#2563eb",
    textDecoration: "none",
  },

  backButton: {
    display: "inline-block",
    padding: "10px 16px",
    border: "1px solid #2563eb",
    borderRadius: "6px",
    background: "#fff",
    color: "#2563eb",
    textDecoration: "none",
  },
};

export default ScheduleInterview;