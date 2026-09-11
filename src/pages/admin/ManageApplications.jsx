import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  getAdminApplications,
  clearAdminError,
  clearAdminSuccess,
} from "../../store/adminSlice";

function ManageApplications() {
  const dispatch = useDispatch();

  const {
    applications = [],
    loading,
    error,
    success,
  } = useSelector((state) => state.admin);

  const { token } = useSelector(
    (state) => state.auth
  );

  // ==========================================
  // LOAD APPLICATIONS
  // ==========================================

  useEffect(() => {
    if (token) {
      dispatch(getAdminApplications(token));
    }
  }, [dispatch, token]);

  // ==========================================
  // CLEAR ERROR
  // ==========================================

  useEffect(() => {
    if (!error) {
      return undefined;
    }

    const timer = setTimeout(() => {
      dispatch(clearAdminError());
    }, 3000);

    return () => clearTimeout(timer);
  }, [error, dispatch]);

  // ==========================================
  // CLEAR SUCCESS
  // ==========================================

  useEffect(() => {
    if (!success) {
      return undefined;
    }

    const timer = setTimeout(() => {
      dispatch(clearAdminSuccess());
    }, 3000);

    return () => clearTimeout(timer);
  }, [success, dispatch]);

  // ==========================================
  // ERROR MESSAGE
  // ==========================================

  const getErrorMessage = (value) => {
    if (typeof value === "string") {
      return value;
    }

    if (value?.message) {
      return value.message;
    }

    return "Failed to load applications.";
  };

  // ==========================================
  // SUCCESS MESSAGE
  // ==========================================

  const getSuccessMessage = (value) => {
    if (typeof value === "string") {
      return value;
    }

    if (value?.message) {
      return value.message;
    }

    return "Operation successful.";
  };

  // ==========================================
  // RETRY
  // ==========================================

  const handleRetry = () => {
    if (token) {
      dispatch(getAdminApplications(token));
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading && applications.length === 0) {
    return (
      <div style={styles.page}>
        <h2>Manage Applications</h2>

        <p style={styles.loadingText}>
          Loading applications...
        </p>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>
        Manage Applications
      </h1>

      {/* ======================================
          ERROR
      ====================================== */}

      {error && (
        <div
          role="alert"
          style={styles.error}
        >
          <span>
            <strong>Error:</strong>{" "}
            {getErrorMessage(error)}
          </span>

          <button
            type="button"
            onClick={handleRetry}
            style={styles.retryButton}
          >
            Retry
          </button>
        </div>
      )}

      {/* ======================================
          SUCCESS
      ====================================== */}

      {success && (
        <div
          role="status"
          style={styles.success}
        >
          {getSuccessMessage(success)}
        </div>
      )}

      {/* ======================================
          APPLICATIONS
      ====================================== */}

      {applications.length === 0 ? (
        <div style={styles.empty}>
          <p>No applications found.</p>
        </div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>
                  Candidate
                </th>

                <th style={styles.th}>
                  Email
                </th>

                <th style={styles.th}>
                  Job
                </th>

                <th style={styles.th}>
                  Recruiter
                </th>

                <th style={styles.th}>
                  Status
                </th>

                <th style={styles.th}>
                  Applied Date
                </th>

                <th style={styles.th}>
                  CV
                </th>
              </tr>
            </thead>

            <tbody>
              {applications.map(
                (application, index) => {
                  const candidate =
                    application?.candidate ||
                    {};

                  const job =
                    application?.job ||
                    {};

                  const recruiter =
                    application?.recruiter ||
                    {};

                  const applicationId =
                    application?._id ||
                    application?.id ||
                    `application-${index}`;

                  const appliedDate =
                    application?.createdAt ||
                    application?.appliedAt;

                  return (
                    <tr
                      key={applicationId}
                      style={styles.tr}
                    >
                      {/* CANDIDATE */}
                      <td style={styles.td}>
                        {candidate?.name ||
                          candidate?.fullName ||
                          "N/A"}
                      </td>

                      {/* EMAIL */}
                      <td style={styles.td}>
                        {candidate?.email ||
                          "N/A"}
                      </td>

                      {/* JOB */}
                      <td style={styles.td}>
                        {job?.title ||
                          application?.jobTitle ||
                          "N/A"}
                      </td>

                      {/* RECRUITER */}
                      <td style={styles.td}>
                        {recruiter?.name ||
                          recruiter?.email ||
                          "N/A"}
                      </td>

                      {/* STATUS */}
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.status,
                            ...getStatusStyle(
                              application?.status
                            ),
                          }}
                        >
                          {application?.status ||
                            "N/A"}
                        </span>
                      </td>

                      {/* APPLIED DATE */}
                      <td style={styles.td}>
                        {appliedDate
                          ? new Date(
                              appliedDate
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>

                      {/* CV */}
                      <td style={styles.td}>
                        {application?.cvUrl ? (
                          <a
                            href={
                              application.cvUrl
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.cvLink}
                          >
                            View CV
                          </a>
                        ) : (
                          <span
                            style={
                              styles.muted
                            }
                          >
                            Not uploaded
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ======================================
          LOADING
      ====================================== */}

      {loading &&
        applications.length > 0 && (
          <p style={styles.loadingMore}>
            Loading...
          </p>
        )}
    </div>
  );
}

// ==========================================
// STATUS STYLE
// ==========================================

function getStatusStyle(status) {
  const normalizedStatus = String(
    status || ""
  )
    .trim()
    .toLowerCase();

  if (
    normalizedStatus === "approved" ||
    normalizedStatus === "accepted" ||
    normalizedStatus === "hired" ||
    normalizedStatus === "completed"
  ) {
    return {
      background: "#e5ffe9",
      color: "#087a21",
    };
  }

  if (
    normalizedStatus === "rejected" ||
    normalizedStatus === "cancelled"
  ) {
    return {
      background: "#ffe5e5",
      color: "#c00",
    };
  }

  if (
    normalizedStatus === "pending" ||
    normalizedStatus === "shortlisted" ||
    normalizedStatus === "review"
  ) {
    return {
      background: "#fff4e5",
      color: "#a15c00",
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
  page: {
    padding: "30px",
    maxWidth: "1400px",
    margin: "0 auto",
  },

  heading: {
    marginBottom: "25px",
  },

  loadingText: {
    color: "#666",
  },

  loadingMore: {
    marginTop: "15px",
    color: "#666",
    textAlign: "center",
  },

  error: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    padding: "12px 15px",
    marginBottom: "20px",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    background: "#fef2f2",
    color: "#b91c1c",
  },

  retryButton: {
    padding: "7px 13px",
    border: "none",
    borderRadius: "6px",
    background: "#dc2626",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },

  success: {
    padding: "12px 15px",
    marginBottom: "20px",
    border: "1px solid #bbf7d0",
    borderRadius: "8px",
    background: "#f0fdf4",
    color: "#15803d",
    fontWeight: "500",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
    border: "1px solid #ddd",
    borderRadius: "10px",
    background: "#fff",
  },

  table: {
    width: "100%",
    minWidth: "900px",
    borderCollapse: "collapse",
  },

  th: {
    padding: "12px 10px",
    borderBottom: "1px solid #ddd",
    background: "#f8fafc",
    color: "#334155",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "12px 10px",
    borderBottom: "1px solid #eee",
    color: "#334155",
    fontSize: "14px",
    verticalAlign: "middle",
  },

  tr: {
    background: "#fff",
  },

  status: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "capitalize",
    whiteSpace: "nowrap",
  },

  cvLink: {
    color: "#2563eb",
    fontWeight: "600",
    textDecoration: "none",
  },

  muted: {
    color: "#777",
  },

  empty: {
    padding: "40px 20px",
    textAlign: "center",
    border: "1px solid #ddd",
    borderRadius: "10px",
    background: "#fff",
    color: "#666",
  },
};

export default ManageApplications;