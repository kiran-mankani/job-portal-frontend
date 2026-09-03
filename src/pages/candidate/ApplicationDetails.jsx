import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getApplicationDetails,
  clearApplicationError,
  clearSelectedApplication,
} from "../../store/applicationSlice";

function ApplicationDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { token } = useSelector((state) => state.auth);

  const {
    application,
    loading,
    error,
  } = useSelector((state) => state.applications);

  useEffect(() => {
    if (token && id) {
      dispatch(
        getApplicationDetails({
          id,
          token,
        })
      );
    }

    return () => {
      dispatch(clearSelectedApplication());
    };
  }, [dispatch, id, token]);

  const handleRetry = () => {
    dispatch(clearApplicationError());

    if (token && id) {
      dispatch(
        getApplicationDetails({
          id,
          token,
        })
      );
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.message}>
          Loading application details...
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <h2>Unable to load application</h2>

          <p>{error}</p>

          <button
            onClick={handleRetry}
            style={styles.retryButton}
          >
            Retry
          </button>
        </div>

        <Link
          to="/candidate/applications"
          style={styles.backButton}
        >
          Back to Applications
        </Link>
      </div>
    );
  }

  // ==========================================
  // APPLICATION NOT FOUND
  // ==========================================

  if (!application) {
    return (
      <div style={styles.container}>
        <div style={styles.empty}>
          <h2>Application Not Found</h2>

          <p>
            The requested application could not be found.
          </p>

          <Link
            to="/candidate/applications"
            style={styles.backButton}
          >
            Back to Applications
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // DATA
  // ==========================================

  const job = application.job;

  const status =
    application.status || "pending";

  return (
    <div style={styles.container}>
      {/* ======================================
          HEADER
      ====================================== */}

      <div style={styles.header}>
        <div>
          <h1>Application Details</h1>

          <p style={styles.subtitle}>
            View the details and current status of your
            application.
          </p>
        </div>

        <Link
          to="/candidate/applications"
          style={styles.backButton}
        >
          ← My Applications
        </Link>
      </div>

      {/* ======================================
          APPLICATION STATUS
      ====================================== */}

      <div style={styles.statusCard}>
        <div>
          <p style={styles.label}>
            Application Status
          </p>

          <h2
            style={{
              ...styles.status,
              ...getStatusStyle(status),
            }}
          >
            {status}
          </h2>
        </div>

        {application.createdAt && (
          <div>
            <p style={styles.label}>
              Applied On
            </p>

            <p style={styles.value}>
              {new Date(
                application.createdAt
              ).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {/* ======================================
          JOB DETAILS
      ====================================== */}

      <div style={styles.card}>
        <h2>Job Details</h2>

        <div style={styles.grid}>
          <div>
            <p style={styles.label}>
              Job Title
            </p>

            <p style={styles.value}>
              {job?.title || "N/A"}
            </p>
          </div>

          <div>
            <p style={styles.label}>
              Company
            </p>

            <p style={styles.value}>
              {job?.company ||
                job?.companyName ||
                "N/A"}
            </p>
          </div>

          <div>
            <p style={styles.label}>
              Location
            </p>

            <p style={styles.value}>
              {job?.location || "N/A"}
            </p>
          </div>

          <div>
            <p style={styles.label}>
              Job Type
            </p>

            <p style={styles.value}>
              {job?.jobType ||
                job?.type ||
                "N/A"}
            </p>
          </div>

          <div>
            <p style={styles.label}>
              Salary
            </p>

            <p style={styles.value}>
              {formatSalary(job?.salary)}
            </p>
          </div>
        </div>

        {job?.description && (
          <div style={styles.section}>
            <h3>Description</h3>

            <p style={styles.description}>
              {job.description}
            </p>
          </div>
        )}

        {job?.requirements?.length > 0 && (
          <div style={styles.section}>
            <h3>Requirements</h3>

            <ul style={styles.list}>
              {job.requirements.map(
                (requirement, index) => (
                  <li key={index}>
                    {requirement}
                  </li>
                )
              )}
            </ul>
          </div>
        )}

        {job?.responsibilities?.length > 0 && (
          <div style={styles.section}>
            <h3>Responsibilities</h3>

            <ul style={styles.list}>
              {job.responsibilities.map(
                (responsibility, index) => (
                  <li key={index}>
                    {responsibility}
                  </li>
                )
              )}
            </ul>
          </div>
        )}
      </div>

      {/* ======================================
          CV DETAILS
      ====================================== */}

      <div style={styles.card}>
        <h2>CV / Resume</h2>

        {application.cvUrl ? (
          <div>
            <p style={styles.success}>
              ✓ CV uploaded successfully
            </p>

            <a
              href={application.cvUrl}
              target="_blank"
              rel="noreferrer"
              style={styles.cvButton}
            >
              View CV
            </a>
          </div>
        ) : (
          <p style={styles.muted}>
            No CV has been uploaded for this
            application.
          </p>
        )}
      </div>

      {/* ======================================
          ACTIONS
      ====================================== */}

      <div style={styles.actions}>
        {job?._id && (
          <Link
            to={`/jobs/${job._id}`}
            style={styles.jobButton}
          >
            View Job
          </Link>
        )}

        <Link
          to="/candidate/applications"
          style={styles.backButton}
        >
          Back to Applications
        </Link>
      </div>
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
    normalizedStatus === "approved"
  ) {
    return {
      background: "#e5ffe9",
      color: "#087a21",
    };
  }

  if (
    normalizedStatus === "shortlisted"
  ) {
    return {
      background: "#e5f0ff",
      color: "#1557a6",
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
// SALARY FORMAT
// ==========================================

function formatSalary(salary) {
  if (!salary) return "N/A";

  if (
    typeof salary === "object"
  ) {
    const min =
      salary.min ??
      salary.minimum;

    const max =
      salary.max ??
      salary.maximum;

    if (min && max) {
      return `${min} - ${max}`;
    }

    if (min) {
      return `${min}+`;
    }

    return "N/A";
  }

  return String(salary);
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

  card: {
    padding: "25px",
    marginBottom: "20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    background: "#fff",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.05)",
  },

  statusCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    padding: "22px",
    marginBottom: "20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    background: "#fff",
  },

  status: {
    display: "inline-block",
    padding: "7px 14px",
    borderRadius: "20px",
    fontSize: "14px",
    textTransform: "capitalize",
  },

  label: {
    margin: "0 0 5px",
    color: "#777",
    fontSize: "14px",
  },

  value: {
    margin: 0,
    fontWeight: "500",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },

  section: {
    marginTop: "25px",
  },

  description: {
    lineHeight: "1.6",
    color: "#444",
  },

  list: {
    paddingLeft: "20px",
    lineHeight: "1.8",
    color: "#444",
  },

  success: {
    color: "#087a21",
    fontWeight: "500",
  },

  muted: {
    color: "#777",
  },

  actions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  cvButton: {
    display: "inline-block",
    padding: "10px 16px",
    background: "#2563eb",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "6px",
  },

  jobButton: {
    display: "inline-block",
    padding: "10px 16px",
    background: "#2563eb",
    color: "#fff",
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
    padding: "25px",
    marginBottom: "20px",
    background: "#ffe5e5",
    color: "#c00",
    borderRadius: "8px",
  },

  retryButton: {
    padding: "9px 15px",
    border: "none",
    borderRadius: "5px",
    background: "#c00",
    color: "#fff",
    cursor: "pointer",
  },

  empty: {
    textAlign: "center",
    padding: "50px 20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
  },

  message: {
    textAlign: "center",
    padding: "60px",
    color: "#666",
  },
};

export default ApplicationDetails;