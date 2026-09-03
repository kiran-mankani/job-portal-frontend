import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getRecruiterApplications,
  updateApplicationStatus,
  clearApplicationError,
  clearApplicationSuccess,
} from "../../store/applicationSlice";

function RecruiterApplications() {
  const dispatch = useDispatch();

  const { token } = useSelector((state) => state.auth);

  const {
    applications,
    loading,
    error,
    success,
  } = useSelector((state) => state.applications);

  const [updatingId, setUpdatingId] = useState(null);

  // ==========================================
  // GET RECRUITER APPLICATIONS
  // ==========================================

  useEffect(() => {
    if (token) {
      dispatch(getRecruiterApplications(token));
    }
  }, [dispatch, token]);

  // ==========================================
  // UPDATE STATUS
  // ==========================================

  const handleStatusChange = async (
    applicationId,
    status
  ) => {
    if (!applicationId || !status || !token) {
      return;
    }

    setUpdatingId(applicationId);

    const result = await dispatch(
      updateApplicationStatus({
        id: applicationId,
        status,
        token,
      })
    );

    setUpdatingId(null);

    if (updateApplicationStatus.fulfilled.match(result)) {
      setTimeout(() => {
        dispatch(clearApplicationSuccess());
      }, 1500);
    }
  };

  // ==========================================
  // RETRY
  // ==========================================

  const handleRetry = () => {
    dispatch(clearApplicationError());

    if (token) {
      dispatch(getRecruiterApplications(token));
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading && applications.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.message}>
          Loading applications...
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
          <h1>Applications</h1>

          <p style={styles.subtitle}>
            Review candidates who applied to your jobs.
          </p>
        </div>

        <Link
          to="/recruiter/dashboard"
          style={styles.backButton}
        >
          Dashboard
        </Link>
      </div>

      {/* ======================================
          SUCCESS
      ====================================== */}

      {success && (
        <div style={styles.success}>
          {success.message ||
            "Application status updated successfully."}
        </div>
      )}

      {/* ======================================
          ERROR
      ====================================== */}

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

      {/* ======================================
          EMPTY
      ====================================== */}

      {!loading &&
        !error &&
        applications.length === 0 && (
          <div style={styles.empty}>
            <h2>No Applications</h2>

            <p>
              No candidates have applied to your jobs yet.
            </p>

            <Link
              to="/jobs/my-jobs"
              style={styles.primaryButton}
            >
              My Jobs
            </Link>
          </div>
        )}

      {/* ======================================
          APPLICATIONS
      ====================================== */}

      {applications.length > 0 && (
        <div style={styles.list}>
          {applications.map((application) => {
            const candidate =
              application.candidate;

            const job = application.job;

            const currentStatus =
              application.status || "pending";

            return (
              <div
                key={application._id}
                style={styles.card}
              >
                {/* ==================================
                    JOB
                ================================== */}

                <div style={styles.jobSection}>
                  <h2 style={styles.jobTitle}>
                    {job?.title ||
                      "Job not available"}
                  </h2>

                  <p style={styles.company}>
                    {job?.company ||
                      job?.companyName ||
                      "Company not available"}
                  </p>

                  {job?.location && (
                    <p style={styles.muted}>
                      Location: {job.location}
                    </p>
                  )}
                </div>

                {/* ==================================
                    CANDIDATE
                ================================== */}

                <div style={styles.section}>
                  <h3>Candidate</h3>

                  <div style={styles.candidateInfo}>
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

                    {candidate?.phone && (
                      <div>
                        <span style={styles.label}>
                          Phone
                        </span>

                        <span style={styles.value}>
                          {candidate.phone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ==================================
                    APPLICATION INFO
                ================================== */}

                <div style={styles.section}>
                  <h3>Application</h3>

                  <div style={styles.infoGrid}>
                    <div>
                      <span style={styles.label}>
                        Applied On
                      </span>

                      <span style={styles.value}>
                        {application.createdAt
                          ? new Date(
                              application.createdAt
                            ).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>

                    <div>
                      <span style={styles.label}>
                        Current Status
                      </span>

                      <span
                        style={{
                          ...styles.status,
                          ...getStatusStyle(
                            currentStatus
                          ),
                        }}
                      >
                        {currentStatus}
                      </span>
                    </div>

                    <div>
                      <span style={styles.label}>
                        CV
                      </span>

                      <span style={styles.value}>
                        {application.cvUrl
                          ? "Uploaded"
                          : "Not uploaded"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ==================================
                    CV
                ================================== */}

                {application.cvUrl && (
                  <div style={styles.section}>
                    <a
                      href={application.cvUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.cvButton}
                    >
                      View Candidate CV
                    </a>
                  </div>
                )}

                {/* ==================================
                    STATUS UPDATE
                ================================== */}

                <div style={styles.section}>
                  <h3>Update Application Status</h3>

                  <div style={styles.statusActions}>
                    {[
                      "pending",
                      "shortlisted",
                      "accepted",
                      "rejected",
                    ].map((status) => (
                      <button
                        key={status}
                        disabled={
                          updatingId ===
                            application._id ||
                          currentStatus === status
                        }
                        onClick={() =>
                          handleStatusChange(
                            application._id,
                            status
                          )
                        }
                        style={{
                          ...styles.statusButton,
                          ...(currentStatus === status
                            ? styles.activeStatusButton
                            : {}),
                          opacity:
                            updatingId ===
                              application._id ||
                            currentStatus === status
                              ? 0.6
                              : 1,
                        }}
                      >
                        {updatingId ===
                        application._id &&
                        currentStatus !== status
                          ? "Updating..."
                          : status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ==================================
                    DETAILS
                ================================== */}

                {application._id && (
                  <div style={styles.actions}>
                    <Link
                      to={`/candidate/applications/${application._id}`}
                      style={styles.secondaryButton}
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

  if (normalizedStatus === "accepted") {
    return {
      background: "#e5ffe9",
      color: "#087a21",
    };
  }

  if (normalizedStatus === "shortlisted") {
    return {
      background: "#e5f0ff",
      color: "#1557a6",
    };
  }

  if (normalizedStatus === "rejected") {
    return {
      background: "#ffe5e5",
      color: "#c00",
    };
  }

  return {
    background: "#fff4d6",
    color: "#946200",
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

  jobSection: {
    paddingBottom: "18px",
    borderBottom: "1px solid #eee",
  },

  jobTitle: {
    margin: 0,
    marginBottom: "6px",
  },

  company: {
    margin: 0,
    color: "#555",
    fontSize: "16px",
  },

  muted: {
    color: "#777",
    marginBottom: 0,
  },

  section: {
    marginTop: "20px",
    paddingTop: "18px",
    borderTop: "1px solid #eee",
  },

  candidateInfo: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "18px",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "18px",
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

  status: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    textTransform: "capitalize",
  },

  statusActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  statusButton: {
    padding: "9px 14px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    background: "#fff",
    cursor: "pointer",
    textTransform: "capitalize",
  },

  activeStatusButton: {
    background: "#2563eb",
    color: "#fff",
    borderColor: "#2563eb",
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

  cvButton: {
    display: "inline-block",
    padding: "10px 16px",
    background: "#16a34a",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "6px",
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

export default RecruiterApplications;