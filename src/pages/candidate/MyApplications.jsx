import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getMyApplications,
  clearApplicationError,
  clearSelectedApplication,
} from "../../store/applicationSlice";

function MyApplications() {
  const dispatch = useDispatch();

  const { token } = useSelector((state) => state.auth);

  const {
    applications,
    loading,
    error,
  } = useSelector((state) => state.applications);

  // ==========================================
  // GET MY APPLICATIONS
  // ==========================================

  useEffect(() => {
    if (token) {
      dispatch(getMyApplications(token));
    }

    return () => {
      dispatch(clearSelectedApplication());
    };
  }, [dispatch, token]);

  // ==========================================
  // RETRY
  // ==========================================

  const handleRetry = () => {
    dispatch(clearApplicationError());

    if (token) {
      dispatch(getMyApplications(token));
    }
  };

  return (
    <div style={styles.container}>
      {/* ======================================
          HEADER
      ====================================== */}

      <div style={styles.header}>
        <div>
          <h1>My Applications</h1>

          <p style={styles.subtitle}>
            Track the jobs you have applied for.
          </p>
        </div>

        <Link
          to="/jobs"
          style={styles.jobsButton}
        >
          Browse Jobs
        </Link>
      </div>

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
          LOADING
      ====================================== */}

      {loading && (
        <div style={styles.message}>
          Loading applications...
        </div>
      )}

      {/* ======================================
          EMPTY
      ====================================== */}

      {!loading &&
        !error &&
        applications.length === 0 && (
          <div style={styles.empty}>
            <h2>No Applications Yet</h2>

            <p>
              You have not applied for any jobs yet.
            </p>

            <Link
              to="/jobs"
              style={styles.jobsButton}
            >
              Find Jobs
            </Link>
          </div>
        )}

      {/* ======================================
          APPLICATIONS
      ====================================== */}

      {!loading &&
        applications.length > 0 && (
          <div style={styles.list}>
            {applications.map((application) => {
              const job = application.job;

              return (
                <div
                  key={application._id}
                  style={styles.card}
                >
                  {/* JOB INFO */}

                  <div style={styles.cardHeader}>
                    <div>
                      <h2 style={styles.jobTitle}>
                        {job?.title ||
                          "Job Title Not Available"}
                      </h2>

                      <p style={styles.company}>
                        {job?.company ||
                          job?.companyName ||
                          "Company not available"}
                      </p>
                    </div>

                    {/* STATUS */}

                    <span
                      style={{
                        ...styles.status,
                        ...(application.status
                          ? getStatusStyle(
                              application.status
                            )
                          : {}),
                      }}
                    >
                      {application.status ||
                        "pending"}
                    </span>
                  </div>

                  {/* DETAILS */}

                  <div style={styles.details}>
                    <p>
                      <strong>Location:</strong>{" "}
                      {job?.location || "N/A"}
                    </p>

                    <p>
                      <strong>Job Type:</strong>{" "}
                      {job?.jobType ||
                        job?.type ||
                        "N/A"}
                    </p>

                    <p>
                      <strong>Applied:</strong>{" "}
                      {application.createdAt
                        ? new Date(
                            application.createdAt
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>

                    {application.cvUrl && (
                      <p>
                        <strong>CV:</strong>{" "}
                        Uploaded
                      </p>
                    )}
                  </div>

                  {/* ACTIONS */}

                  <div style={styles.actions}>
                    {application._id && (
                      <Link
                        to={`/candidate/applications/${application._id}`}
                        style={styles.viewButton}
                      >
                        View Application
                      </Link>
                    )}

                    {job?._id && (
                      <Link
                        to={`/jobs/${job._id}`}
                        style={styles.jobButton}
                      >
                        View Job
                      </Link>
                    )}
                  </div>
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

  if (
    normalizedStatus === "accepted" ||
    normalizedStatus === "approved" ||
    normalizedStatus === "shortlisted"
  ) {
    return {
      background: "#e5ffe9",
      color: "#087a21",
    };
  }

  if (
    normalizedStatus === "rejected" ||
    normalizedStatus === "declined"
  ) {
    return {
      background: "#ffe5e5",
      color: "#c00",
    };
  }

  if (
    normalizedStatus === "withdrawn" ||
    normalizedStatus === "cancelled"
  ) {
    return {
      background: "#eee",
      color: "#555",
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

  jobsButton: {
    display: "inline-block",
    padding: "11px 18px",
    background: "#2563eb",
    color: "#fff",
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

  message: {
    textAlign: "center",
    padding: "50px",
    color: "#666",
  },

  empty: {
    textAlign: "center",
    padding: "60px 20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    background: "#fff",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  card: {
    padding: "22px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    background: "#fff",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.06)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "18px",
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

  status: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    textTransform: "capitalize",
    whiteSpace: "nowrap",
  },

  details: {
    color: "#555",
    lineHeight: "1.5",
  },

  actions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "20px",
  },

  viewButton: {
    display: "inline-block",
    padding: "9px 15px",
    background: "#2563eb",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "5px",
  },

  jobButton: {
    display: "inline-block",
    padding: "9px 15px",
    background: "#fff",
    color: "#2563eb",
    border: "1px solid #2563eb",
    textDecoration: "none",
    borderRadius: "5px",
  },
};

export default MyApplications;