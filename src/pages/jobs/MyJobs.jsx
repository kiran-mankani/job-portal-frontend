import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getMyJobs,
  deleteJob,
  clearJobError,
  clearJobSuccess,
} from "../../store/jobSlice";

function MyJobs() {
  const dispatch = useDispatch();

  const { token } = useSelector((state) => state.auth);

  const { jobs, loading, error, success } = useSelector(
    (state) => state.jobs
  );

  // ===============================
  // GET RECRUITER'S JOBS
  // ===============================

  useEffect(() => {
    if (token) {
      dispatch(getMyJobs(token));
    }
  }, [dispatch, token]);

  // ===============================
  // DELETE JOB
  // ===============================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmed) return;

    dispatch(
      deleteJob({
        id,
        token,
      })
    );
  };

  // ===============================
  // CLEAR ERROR
  // ===============================

  const handleClearError = () => {
    if (error) {
      dispatch(clearJobError());
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1>My Jobs</h1>
          <p style={styles.subtitle}>
            Manage your posted jobs.
          </p>
        </div>

        <Link
          to="/jobs/post"
          style={styles.postButton}
        >
          + Post New Job
        </Link>
      </div>

      {/* ERROR */}

      {error && (
        <div style={styles.error}>
          <span>{error}</span>

          <button
            onClick={handleClearError}
            style={styles.closeButton}
          >
            ×
          </button>
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div style={styles.success}>
          {success.message || "Operation completed successfully."}
        </div>
      )}

      {/* LOADING */}

      {loading && (
        <div style={styles.message}>
          Loading your jobs...
        </div>
      )}

      {/* NO JOBS */}

      {!loading && jobs.length === 0 && (
        <div style={styles.empty}>
          <h2>No jobs posted yet</h2>

          <p>
            Create your first job posting to start
            receiving applications.
          </p>

          <Link
            to="/jobs/post"
            style={styles.postButton}
          >
            Post a Job
          </Link>
        </div>
      )}

      {/* JOBS */}

      {!loading && jobs.length > 0 && (
        <div style={styles.jobsGrid}>
          {jobs.map((job) => (
            <div
              key={job._id}
              style={styles.jobCard}
            >
              <div style={styles.jobHeader}>
                <h2>{job.title}</h2>

                <span
                  style={{
                    ...styles.status,
                    ...(job.status === "closed"
                      ? styles.closed
                      : styles.active),
                  }}
                >
                  {job.status || "active"}
                </span>
              </div>

              <p>
                <strong>Company:</strong>{" "}
                {job.company ||
                  job.companyName ||
                  "N/A"}
              </p>

              <p>
                <strong>Location:</strong>{" "}
                {job.location || "N/A"}
              </p>

              <p>
                <strong>Job Type:</strong>{" "}
                {job.jobType ||
                  job.type ||
                  "N/A"}
              </p>

              {job.salary && (
                <p>
                  <strong>Salary:</strong>{" "}
                  {job.salary}
                </p>
              )}

              {job.description && (
                <p style={styles.description}>
                  {job.description.length > 180
                    ? `${job.description.substring(
                        0,
                        180
                      )}...`
                    : job.description}
                </p>
              )}

              {/* ACTIONS */}

              <div style={styles.actions}>
                <Link
                  to={`/jobs/${job._id}`}
                  style={styles.viewButton}
                >
                  View
                </Link>

                <Link
                  to={`/jobs/${job._id}/edit`}
                  style={styles.editButton}
                >
                  Edit
                </Link>

                <button
                  onClick={() =>
                    handleDelete(job._id)
                  }
                  disabled={loading}
                  style={styles.deleteButton}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "30px 20px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },

  subtitle: {
    color: "#666",
    marginTop: "5px",
  },

  postButton: {
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
    padding: "12px",
    marginBottom: "20px",
    background: "#ffe5e5",
    color: "#c00",
    borderRadius: "6px",
  },

  closeButton: {
    border: "none",
    background: "transparent",
    fontSize: "20px",
    cursor: "pointer",
    color: "#c00",
  },

  success: {
    padding: "12px",
    marginBottom: "20px",
    background: "#e5ffe9",
    color: "#087a21",
    borderRadius: "6px",
  },

  message: {
    textAlign: "center",
    padding: "40px",
    color: "#666",
  },

  empty: {
    textAlign: "center",
    padding: "50px 20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
  },

  jobsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },

  jobCard: {
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    background: "#fff",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
  },

  jobHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "10px",
    marginBottom: "15px",
  },

  status: {
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    textTransform: "capitalize",
  },

  active: {
    background: "#e5ffe9",
    color: "#087a21",
  },

  closed: {
    background: "#ffe5e5",
    color: "#c00",
  },

  description: {
    color: "#666",
    lineHeight: "1.5",
  },

  actions: {
    display: "flex",
    gap: "8px",
    marginTop: "20px",
    flexWrap: "wrap",
  },

  viewButton: {
    padding: "9px 14px",
    background: "#2563eb",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "5px",
  },

  editButton: {
    padding: "9px 14px",
    background: "#f59e0b",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "5px",
  },

  deleteButton: {
    padding: "9px 14px",
    background: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default MyJobs;