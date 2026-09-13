import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  getAdminJobs,
  clearAdminError,
  clearAdminSuccess,
} from "../../store/adminSlice";

function ManageJobs() {
  const dispatch = useDispatch();

  const {
    jobs = [],
    loading,
    error,
    success,
  } = useSelector((state) => state.admin);

  const { token } = useSelector(
    (state) => state.auth
  );

  const [status, setStatus] = useState("");

  // ==========================================
  // LOAD JOBS
  // ==========================================

  useEffect(() => {
    if (token) {
      dispatch(
        getAdminJobs({
          token,
          status,
        })
      );
    }
  }, [dispatch, token, status]);

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

    return "Failed to load jobs.";
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
      dispatch(
        getAdminJobs({
          token,
          status,
        })
      );
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading && jobs.length === 0) {
    return (
      <div style={styles.page}>
        <h2>Manage Jobs</h2>

        <p style={styles.loadingText}>
          Loading jobs...
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
        Manage Jobs
      </h1>

      {/* ======================================
          STATUS FILTER
      ====================================== */}

      <div style={styles.filterContainer}>
        <label
          htmlFor="status-filter"
          style={styles.filterLabel}
        >
          Filter by Status:
        </label>

        <select
          id="status-filter"
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
          style={styles.select}
        >
          <option value="">
            All Jobs
          </option>

          <option value="active">
            Active
          </option>

          <option value="closed">
            Closed
          </option>

          <option value="draft">
            Draft
          </option>
        </select>
      </div>

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
          JOBS
      ====================================== */}

      {jobs.length === 0 ? (
        <div style={styles.empty}>
          <p>No jobs found.</p>
        </div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>
                  Title
                </th>

                <th style={styles.th}>
                  Company
                </th>

                <th style={styles.th}>
                  Location
                </th>

                <th style={styles.th}>
                  Job Type
                </th>

                <th style={styles.th}>
                  Status
                </th>

                <th style={styles.th}>
                  Recruiter
                </th>

                <th style={styles.th}>
                  Created
                </th>
              </tr>
            </thead>

            <tbody>
              {jobs.map((job, index) => {
                const recruiter =
                  job?.recruiter || {};

                const jobId =
                  job?._id ||
                  job?.id ||
                  `job-${index}`;

                return (
                  <tr
                    key={jobId}
                    style={styles.tr}
                  >
                    {/* TITLE */}
                    <td style={styles.td}>
                      {job?.title || "N/A"}
                    </td>

                    {/* COMPANY */}
                    <td style={styles.td}>
                      {job?.company ||
                        job?.companyName ||
                        "N/A"}
                    </td>

                    {/* LOCATION */}
                    <td style={styles.td}>
                      {job?.location || "N/A"}
                    </td>

                    {/* JOB TYPE */}
                    <td style={styles.td}>
                      {job?.jobType ||
                        job?.type ||
                        "N/A"}
                    </td>

                    {/* STATUS */}
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.status,
                          ...getStatusStyle(
                            job?.status
                          ),
                        }}
                      >
                        {job?.status || "N/A"}
                      </span>
                    </td>

                    {/* RECRUITER */}
                    <td style={styles.td}>
                      {recruiter?.name ||
                        recruiter?.email ||
                        "N/A"}
                    </td>

                    {/* CREATED */}
                    <td style={styles.td}>
                      {job?.createdAt
                        ? new Date(
                            job.createdAt
                          ).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ======================================
          LOADING
      ====================================== */}

      {loading && jobs.length > 0 && (
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
    normalizedStatus === "active" ||
    normalizedStatus === "approved" ||
    normalizedStatus === "completed"
  ) {
    return {
      background: "#e5ffe9",
      color: "#087a21",
    };
  }

  if (
    normalizedStatus === "closed" ||
    normalizedStatus === "rejected" ||
    normalizedStatus === "cancelled"
  ) {
    return {
      background: "#ffe5e5",
      color: "#c00",
    };
  }

  if (
    normalizedStatus === "draft" ||
    normalizedStatus === "pending"
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

  filterContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },

  filterLabel: {
    fontWeight: "600",
    color: "#334155",
  },

  select: {
    padding: "8px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    background: "#fff",
    color: "#334155",
    cursor: "pointer",
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

  empty: {
    padding: "40px 20px",
    textAlign: "center",
    border: "1px solid #ddd",
    borderRadius: "10px",
    background: "#fff",
    color: "#666",
  },
};

export default ManageJobs;