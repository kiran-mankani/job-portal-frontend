import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getCandidateInterviews,
  clearInterviewError,
  clearSelectedInterview,
} from "../../store/interviewSlice";

function MyInterviews() {
  const dispatch = useDispatch();

  const { token } = useSelector((state) => state.auth);

  const {
    interviews,
    loading,
    error,
  } = useSelector((state) => state.interviews);

  useEffect(() => {
    if (token) {
      dispatch(getCandidateInterviews(token));
    }

    return () => {
      dispatch(clearSelectedInterview());
    };
  }, [dispatch, token]);

  const handleRetry = () => {
    dispatch(clearInterviewError());

    if (token) {
      dispatch(getCandidateInterviews(token));
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.message}>
          Loading interviews...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1>My Interviews</h1>
          <p style={styles.subtitle}>
            View your scheduled interviews.
          </p>
        </div>

        <Link
          to="/candidate/dashboard"
          style={styles.backButton}
        >
          Dashboard
        </Link>
      </div>

      {/* ERROR */}
      {error && (
        <div style={styles.error}>
          <div>
            <strong>Error:</strong> {error}
          </div>

          <button
            onClick={handleRetry}
            style={styles.retryButton}
          >
            Retry
          </button>
        </div>
      )}

      {/* EMPTY */}
      {!error && interviews.length === 0 && (
        <div style={styles.empty}>
          <h2>No Interviews Scheduled</h2>

          <p>
            You currently do not have any scheduled
            interviews.
          </p>

          <Link
            to="/candidate/applications"
            style={styles.primaryButton}
          >
            My Applications
          </Link>
        </div>
      )}

      {/* INTERVIEWS */}
      {!error && interviews.length > 0 && (
        <div style={styles.list}>
          {interviews.map((interview) => {
            const application =
              interview.application;

            const job =
              application?.job;

            const recruiter =
              interview.recruiter;

            return (
              <div
                key={interview._id}
                style={styles.card}
              >
                {/* TOP */}
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

                {/* DETAILS */}
                <div style={styles.details}>
                  <div style={styles.detailItem}>
                    <strong>Date & Time</strong>

                    <span>
                      {interview.date
                        ? new Date(
                            interview.date
                          ).toLocaleString()
                        : "N/A"}
                    </span>
                  </div>

                  <div style={styles.detailItem}>
                    <strong>Duration</strong>

                    <span>
                      {interview.duration
                        ? `${interview.duration} minutes`
                        : "30 minutes"}
                    </span>
                  </div>

                  <div style={styles.detailItem}>
                    <strong>Mode</strong>

                    <span
                      style={{
                        textTransform:
                          "capitalize",
                      }}
                    >
                      {interview.mode ||
                        "N/A"}
                    </span>
                  </div>

                  {recruiter && (
                    <div style={styles.detailItem}>
                      <strong>Recruiter</strong>

                      <span>
                        {recruiter.name ||
                          recruiter.email ||
                          "N/A"}
                      </span>
                    </div>
                  )}
                </div>

                {/* ONLINE */}
                {interview.meetingLink && (
                  <div style={styles.section}>
                    <strong>
                      Meeting Link
                    </strong>

                    <div style={styles.linkBox}>
                      <a
                        href={
                          interview.meetingLink
                        }
                        target="_blank"
                        rel="noreferrer"
                        style={styles.meetingLink}
                      >
                        Join Interview
                      </a>
                    </div>
                  </div>
                )}

                {/* OFFLINE */}
                {interview.location && (
                  <div style={styles.section}>
                    <strong>Location</strong>

                    <p style={styles.text}>
                      {interview.location}
                    </p>
                  </div>
                )}

                {/* NOTES */}
                {interview.notes && (
                  <div style={styles.section}>
                    <strong>Notes</strong>

                    <p style={styles.text}>
                      {interview.notes}
                    </p>
                  </div>
                )}

                {/* APPLICATION */}
                {application?._id && (
                  <div style={styles.actions}>
                    <Link
                      to={`/candidate/applications/${application._id}`}
                      style={styles.primaryButton}
                    >
                      View Application
                    </Link>

                    {job?._id && (
                      <Link
                        to={`/jobs/${job._id}`}
                        style={styles.secondaryButton}
                      >
                        View Job
                      </Link>
                    )}
                  </div>
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
    marginBottom: "20px",
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

  details: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "18px",
    marginBottom: "20px",
  },

  detailItem: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    color: "#444",
  },

  section: {
    marginTop: "18px",
    paddingTop: "15px",
    borderTop: "1px solid #eee",
  },

  text: {
    color: "#555",
    lineHeight: "1.5",
  },

  linkBox: {
    marginTop: "8px",
  },

  meetingLink: {
    display: "inline-block",
    padding: "9px 15px",
    background: "#2563eb",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "5px",
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
    background: "#2563eb",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "6px",
  },

  secondaryButton: {
    display: "inline-block",
    padding: "10px 16px",
    background: "#fff",
    color: "#2563eb",
    border: "1px solid #2563eb",
    textDecoration: "none",
    borderRadius: "6px",
  },

  backButton: {
    display: "inline-block",
    padding: "10px 16px",
    background: "#fff",
    color: "#2563eb",
    border: "1px solid #2563eb",
    textDecoration: "none",
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

export default MyInterviews;