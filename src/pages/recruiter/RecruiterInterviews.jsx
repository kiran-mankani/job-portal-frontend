import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getRecruiterInterviews,
  updateInterview,
  cancelInterview,
  clearInterviewError,
  clearInterviewSuccess,
} from "../../store/interviewSlice";

function RecruiterInterviews() {
  const dispatch = useDispatch();

  const { token } = useSelector((state) => state.auth);

  const {
    interviews,
    loading,
    error,
    success,
  } = useSelector((state) => state.interviews);

  const [editingId, setEditingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const [editForm, setEditForm] = useState({
    date: "",
    duration: 30,
    meetingLink: "",
    notes: "",
  });

  // ==========================================
  // LOAD INTERVIEWS
  // ==========================================

  useEffect(() => {
    if (token) {
      dispatch(getRecruiterInterviews(token));
    }
  }, [dispatch, token]);

  // ==========================================
  // START EDIT
  // ==========================================

  const handleEdit = (interview) => {
    setEditingId(interview._id);

    setEditForm({
      date: interview.date
        ? formatDateTimeLocal(interview.date)
        : "",
      duration: interview.duration || 30,
      meetingLink: interview.meetingLink || "",
      notes: interview.notes || "",
    });

    dispatch(clearInterviewError());
    dispatch(clearInterviewSuccess());
  };

  // ==========================================
  // CANCEL EDIT
  // ==========================================

  const handleCancelEdit = () => {
    setEditingId(null);

    setEditForm({
      date: "",
      duration: 30,
      meetingLink: "",
      notes: "",
    });

    dispatch(clearInterviewError());
  };

  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      dispatch(clearInterviewError());
    }

    if (success) {
      dispatch(clearInterviewSuccess());
    }
  };

  // ==========================================
  // UPDATE INTERVIEW
  // ==========================================

  const handleUpdate = async (e, interview) => {
    e.preventDefault();

    if (!token) {
      return;
    }

    if (!editForm.date) {
      alert("Please select interview date and time.");
      return;
    }

    if (
      interview.mode === "online" &&
      !editForm.meetingLink.trim()
    ) {
      alert("Please enter the meeting link.");
      return;
    }

    const interviewData = {
      scheduledAt: new Date(
        editForm.date
      ).toISOString(),

      duration: Number(editForm.duration),

      meetingLink:
        interview.mode === "online"
          ? editForm.meetingLink.trim()
          : "",

      notes: editForm.notes.trim(),
    };

    setUpdatingId(interview._id);

    const result = await dispatch(
      updateInterview({
        id: interview._id,
        interviewData,
        token,
      })
    );

    setUpdatingId(null);

    if (updateInterview.fulfilled.match(result)) {
      setEditingId(null);
    }
  };

  // ==========================================
  // CANCEL INTERVIEW
  // ==========================================

  const handleCancelInterview = async (
    interviewId
  ) => {
    if (!token || !interviewId) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this interview?"
    );

    if (!confirmed) {
      return;
    }

    setUpdatingId(interviewId);

    await dispatch(
      cancelInterview({
        id: interviewId,
        token,
      })
    );

    setUpdatingId(null);
  };

  // ==========================================
  // RETRY
  // ==========================================

  const handleRetry = () => {
    dispatch(clearInterviewError());

    if (token) {
      dispatch(getRecruiterInterviews(token));
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (
    loading &&
    interviews.length === 0
  ) {
    return (
      <div style={styles.container}>
        <div style={styles.message}>
          Loading recruiter interviews...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* ======================================
          HEADER
      ====================================== */}

      <div style={styles.header}>
        <div>
          <h1>Recruiter Interviews</h1>

          <p style={styles.subtitle}>
            Manage your scheduled candidate interviews.
          </p>
        </div>

        <div style={styles.headerActions}>
          <Link
            to="/recruiter/interviews/schedule"
            style={styles.primaryButton}
          >
            Schedule Interview
          </Link>

          <Link
            to="/recruiter/dashboard"
            style={styles.secondaryButton}
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* ======================================
          SUCCESS
      ====================================== */}

      {success && (
        <div style={styles.success}>
          {success.message ||
            "Interview updated successfully."}
        </div>
      )}

      {/* ======================================
          ERROR
      ====================================== */}

      {error && (
        <div style={styles.error}>
          <span>
            <strong>Error:</strong> {error}
          </span>

          <button
            onClick={handleRetry}
            style={styles.retryButton}
          >
            Retry
          </button>
        </div>
      )}

      {/* ======================================
          EMPTY
      ====================================== */}

      {!loading &&
        !error &&
        interviews.length === 0 && (
          <div style={styles.empty}>
            <h2>No Interviews Scheduled</h2>

            <p>
              You currently have no scheduled interviews.
            </p>

            <Link
              to="/recruiter/interviews/schedule"
              style={styles.primaryButton}
            >
              Schedule Interview
            </Link>
          </div>
        )}

      {/* ======================================
          INTERVIEW LIST
      ====================================== */}

      {interviews.length > 0 && (
        <div style={styles.list}>
          {interviews.map((interview) => {
            const candidate =
              interview.candidate;

            const application =
              interview.application;

            const job =
              application?.job;

            const isEditing =
              editingId === interview._id;

            const isUpdating =
              updatingId === interview._id;

            return (
              <div
                key={interview._id}
                style={styles.card}
              >
                {/* ==================================
                    CARD HEADER
                ================================== */}

                <div style={styles.cardHeader}>
                  <div>
                    <h2 style={styles.jobTitle}>
                      {job?.title ||
                        "Interview"}
                    </h2>

                    <p style={styles.company}>
                      {job?.company ||
                        job?.companyName ||
                        "Company not available"}
                    </p>
                  </div>

                  <span
                    style={{
                      ...styles.status,
                      ...getStatusStyle(
                        interview.status
                      ),
                    }}
                  >
                    {interview.status ||
                      "scheduled"}
                  </span>
                </div>

                {/* ==================================
                    CANDIDATE
                ================================== */}

                <div style={styles.section}>
                  <h3>Candidate</h3>

                  <div style={styles.infoGrid}>
                    <div>
                      <span style={styles.label}>
                        Name
                      </span>

                      <span style={styles.value}>
                        {candidate?.name ||
                          "N/A"}
                      </span>
                    </div>

                    <div>
                      <span style={styles.label}>
                        Email
                      </span>

                      <span style={styles.value}>
                        {candidate?.email ||
                          "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ==================================
                    EDIT FORM
                ================================== */}

                {isEditing ? (
                  <form
                    onSubmit={(e) =>
                      handleUpdate(
                        e,
                        interview
                      )
                    }
                    style={styles.editForm}
                  >
                    <h3>
                      Reschedule Interview
                    </h3>

                    <div style={styles.field}>
                      <label>
                        Date & Time
                      </label>

                      <input
                        type="datetime-local"
                        name="date"
                        value={editForm.date}
                        onChange={handleChange}
                        required
                        style={styles.input}
                      />
                    </div>

                    <div style={styles.field}>
                      <label>
                        Duration
                      </label>

                      <select
                        name="duration"
                        value={
                          editForm.duration
                        }
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

                    {interview.mode ===
                      "online" && (
                      <div style={styles.field}>
                        <label>
                          Meeting Link
                        </label>

                        <input
                          type="url"
                          name="meetingLink"
                          value={
                            editForm.meetingLink
                          }
                          onChange={handleChange}
                          placeholder="https://meet.google.com/..."
                          required
                          style={styles.input}
                        />
                      </div>
                    )}

                    <div style={styles.field}>
                      <label>
                        Notes
                      </label>

                      <textarea
                        name="notes"
                        value={editForm.notes}
                        onChange={handleChange}
                        rows="4"
                        style={styles.textarea}
                      />
                    </div>

                    <div style={styles.actions}>
                      <button
                        type="submit"
                        disabled={isUpdating}
                        style={{
                          ...styles.primaryButton,
                          opacity: isUpdating
                            ? 0.7
                            : 1,
                        }}
                      >
                        {isUpdating
                          ? "Updating..."
                          : "Save Changes"}
                      </button>

                      <button
                        type="button"
                        onClick={
                          handleCancelEdit
                        }
                        style={
                          styles.secondaryButton
                        }
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    {/* ==============================
                        INTERVIEW DETAILS
                    ============================== */}

                    <div style={styles.section}>
                      <h3>
                        Interview Details
                      </h3>

                      <div style={styles.infoGrid}>
                        <div>
                          <span
                            style={styles.label}
                          >
                            Date & Time
                          </span>

                          <span
                            style={styles.value}
                          >
                            {interview.date
                              ? new Date(
                                  interview.date
                                ).toLocaleString()
                              : "N/A"}
                          </span>
                        </div>

                        <div>
                          <span
                            style={styles.label}
                          >
                            Duration
                          </span>

                          <span
                            style={styles.value}
                          >
                            {interview.duration ||
                              30}{" "}
                            minutes
                          </span>
                        </div>

                        <div>
                          <span
                            style={styles.label}
                          >
                            Mode
                          </span>

                          <span
                            style={{
                              ...styles.value,
                              textTransform:
                                "capitalize",
                            }}
                          >
                            {interview.mode ||
                              "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ==============================
                        MEETING LINK
                    ============================== */}

                    {interview.meetingLink && (
                      <div
                        style={styles.section}
                      >
                        <strong>
                          Meeting Link
                        </strong>

                        <div
                          style={{
                            marginTop: "8px",
                          }}
                        >
                          <a
                            href={
                              interview.meetingLink
                            }
                            target="_blank"
                            rel="noreferrer"
                            style={
                              styles.meetingButton
                            }
                          >
                            Open Meeting
                          </a>
                        </div>
                      </div>
                    )}

                    {/* ==============================
                        LOCATION
                    ============================== */}

                    {interview.location && (
                      <div
                        style={styles.section}
                      >
                        <strong>
                          Location
                        </strong>

                        <p
                          style={styles.muted}
                        >
                          {interview.location}
                        </p>
                      </div>
                    )}

                    {/* ==============================
                        NOTES
                    ============================== */}

                    {interview.notes && (
                      <div
                        style={styles.section}
                      >
                        <strong>
                          Notes
                        </strong>

                        <p
                          style={styles.muted}
                        >
                          {interview.notes}
                        </p>
                      </div>
                    )}

                    {/* ==============================
                        ACTIONS
                    ============================== */}

                    {interview.status !==
                      "cancelled" && (
                      <div
                        style={styles.actions}
                      >
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            handleEdit(
                              interview
                            )
                          }
                          style={
                            styles.secondaryButton
                          }
                        >
                          Reschedule / Edit
                        </button>

                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            handleCancelInterview(
                              interview._id
                            )
                          }
                          style={
                            styles.cancelButton
                          }
                        >
                          {isUpdating
                            ? "Cancelling..."
                            : "Cancel Interview"}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==========================================
// FORMAT DATETIME-LOCAL
// ==========================================

function formatDateTimeLocal(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  const hours = String(
    date.getHours()
  ).padStart(2, "0");

  const minutes = String(
    date.getMinutes()
  ).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// ==========================================
// STATUS STYLE
// ==========================================

function getStatusStyle(status) {
  const normalizedStatus =
    String(status).toLowerCase();

  if (normalizedStatus === "scheduled") {
    return {
      background: "#e5f0ff",
      color: "#1557a6",
    };
  }

  if (normalizedStatus === "completed") {
    return {
      background: "#e5ffe9",
      color: "#087a21",
    };
  }

  if (normalizedStatus === "cancelled") {
    return {
      background: "#ffe5e5",
      color: "#c00",
    };
  }

  return {
    background: "#eee",
    color: "#555",
  };
}

// ==========================================
// STYLES
// ==========================================

const styles = {
  container: {
    maxWidth: "1100px",
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

  headerActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  subtitle: {
    color: "#666",
    marginTop: "5px",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  card: {
    padding: "25px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    background: "#fff",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.05)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    flexWrap: "wrap",
  },

  jobTitle: {
    margin: 0,
    marginBottom: "6px",
  },

  company: {
    margin: 0,
    color: "#555",
  },

  status: {
    padding: "7px 13px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    textTransform: "capitalize",
    whiteSpace: "nowrap",
  },

  section: {
    marginTop: "20px",
    paddingTop: "18px",
    borderTop: "1px solid #eee",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "18px",
    marginTop: "12px",
  },

  label: {
    display: "block",
    color: "#777",
    fontSize: "13px",
    marginBottom: "5px",
  },

  value: {
    display: "block",
    color: "#333",
    fontWeight: "500",
  },

  muted: {
    color: "#666",
    lineHeight: "1.5",
  },

  editForm: {
    marginTop: "20px",
    padding: "20px",
    background: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },

  field: {
    marginBottom: "18px",
  },

  input: {
    width: "100%",
    padding: "10px",
    marginTop: "6px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "15px",
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    padding: "10px",
    marginTop: "6px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "15px",
    resize: "vertical",
    boxSizing: "border-box",
  },

  actions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "22px",
  },

  primaryButton: {
    display: "inline-block",
    padding: "10px 16px",
    border: "none",
    borderRadius: "6px",
    background: "#2563eb",
    color: "#fff",
    textDecoration: "none",
    cursor: "pointer",
  },

  secondaryButton: {
    display: "inline-block",
    padding: "9px 16px",
    border: "1px solid #2563eb",
    borderRadius: "6px",
    background: "#fff",
    color: "#2563eb",
    textDecoration: "none",
    cursor: "pointer",
  },

  cancelButton: {
    padding: "9px 16px",
    border: "none",
    borderRadius: "6px",
    background: "#dc2626",
    color: "#fff",
    cursor: "pointer",
  },

  meetingButton: {
    display: "inline-block",
    padding: "9px 15px",
    background: "#16a34a",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "5px",
  },

  success: {
    padding: "12px 15px",
    marginBottom: "20px",
    background: "#e5ffe9",
    color: "#087a21",
    borderRadius: "6px",
  },

  error: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    padding: "15px",
    marginBottom: "20px",
    background: "#ffe5e5",
    color: "#c00",
    borderRadius: "6px",
  },

  retryButton: {
    padding: "8px 14px",
    border: "none",
    borderRadius: "5px",
    background: "#c00",
    color: "#fff",
    cursor: "pointer",
  },

  empty: {
    textAlign: "center",
    padding: "60px 20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    background: "#fff",
  },

  message: {
    textAlign: "center",
    padding: "60px",
    color: "#666",
  },
};

export default RecruiterInterviews;