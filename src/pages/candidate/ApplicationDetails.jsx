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

  const { token } = useSelector(
    (state) => state.auth || {}
  );

  const {
    application,
    loading,
    error,
  } = useSelector(
    (state) => state.applications || {}
  );

  const authToken =
    token || localStorage.getItem("token") || null;

  useEffect(() => {
    if (authToken && id) {
      dispatch(
        getApplicationDetails({
          id,
          token: authToken,
        })
      );
    }

    return () => {
      dispatch(clearSelectedApplication());
    };
  }, [dispatch, id, authToken]);

  const getErrorMessage = (value) => {
    if (!value) {
      return "Unable to load application details.";
    }

    if (typeof value === "string") {
      return value;
    }

    return (
      value?.message ||
      value?.error ||
      "Unable to load application details."
    );
  };

  const handleRetry = () => {
    dispatch(clearApplicationError());

    if (authToken && id) {
      dispatch(
        getApplicationDetails({
          id,
          token: authToken,
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

          <p>{getErrorMessage(error)}</p>

          <button
            type="button"
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

  const job =
    application.job &&
    typeof application.job === "object"
      ? application.job
      : null;

  const status =
    application.status || "pending";

  const jobId =
    job?._id ||
    job?.id ||
    application.jobId ||
    null;

  const jobTitle =
    job?.title ||
    application.jobTitle ||
    "N/A";

  const companyName =
    typeof job?.company === "string"
      ? job.company
      : job?.company?.name ||
        job?.companyName ||
        application.company ||
        "N/A";

  const location =
    job?.location ||
    application.location ||
    "N/A";

  const jobType =
    job?.jobType ||
    job?.type ||
    application.jobType ||
    "N/A";

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
            {formatStatus(status)}
          </h2>
        </div>

        {application.createdAt && (
          <div>
            <p style={styles.label}>
              Applied On
            </p>

            <p style={styles.value}>
              {formatDate(application.createdAt)}
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
              {jobTitle}
            </p>
          </div>

          <div>
            <p style={styles.label}>
              Company
            </p>

            <p style={styles.value}>
              {companyName}
            </p>
          </div>

          <div>
            <p style={styles.label}>
              Location
            </p>

            <p style={styles.value}>
              {location}
            </p>
          </div>

          <div>
            <p style={styles.label}>
              Job Type
            </p>

            <p style={styles.value}>
              {formatStatus(jobType)}
            </p>
          </div>

          <div>
            <p style={styles.label}>
              Salary
            </p>

            <p style={styles.value}>
              {formatSalary(job)}
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

        {renderListSection(
          "Requirements",
          job?.requirements
        )}

        {renderListSection(
          "Responsibilities",
          job?.responsibilities
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
              rel="noopener noreferrer"
              style={styles.cvButton}
            >
              View CV
            </a>
          </div>
        ) : (
          <p style={styles.muted}>
            No CV has been uploaded for this application.
          </p>
        )}
      </div>

      {/* ======================================
          ACTIONS
      ====================================== */}

      <div style={styles.actions}>
        {jobId && (
          <Link
            to={`/jobs/${jobId}`}
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
// FORMAT STATUS
// ==========================================

function formatStatus(value) {
  if (!value) {
    return "N/A";
  }

  return String(value)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString();
}

// ==========================================
// STATUS STYLE
// ==========================================

function getStatusStyle(status) {
  const normalizedStatus =
    String(status || "")
      .trim()
      .toLowerCase();

  if (
    normalizedStatus === "accepted" ||
    normalizedStatus === "approved" ||
    normalizedStatus === "hired"
  ) {
    return {
      background: "#e5ffe9",
      color: "#087a21",
    };
  }

  if (
    normalizedStatus === "shortlisted" ||
    normalizedStatus === "interview"
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

function formatSalary(job) {
  if (!job) {
    return "N/A";
  }

  const minSalary =
    job.minSalary ??
    job.minimumSalary ??
    job.salary?.min ??
    job.salary?.minimum ??
    null;

  const maxSalary =
    job.maxSalary ??
    job.maximumSalary ??
    job.salary?.max ??
    job.salary?.maximum ??
    null;

  if (
    minSalary !== null &&
    minSalary !== undefined &&
    minSalary !== "" &&
    maxSalary !== null &&
    maxSalary !== undefined &&
    maxSalary !== ""
  ) {
    return `${formatNumber(minSalary)} - ${formatNumber(
      maxSalary
    )}`;
  }

  if (
    minSalary !== null &&
    minSalary !== undefined &&
    minSalary !== ""
  ) {
    return `${formatNumber(minSalary)}+`;
  }

  if (
    maxSalary !== null &&
    maxSalary !== undefined &&
    maxSalary !== ""
  ) {
    return `Up to ${formatNumber(maxSalary)}`;
  }

  if (
    job.salary !== null &&
    job.salary !== undefined &&
    typeof job.salary !== "object"
  ) {
    return String(job.salary);
  }

  return "N/A";
}

function formatNumber(value) {
  const number = Number(value);

  if (!Number.isNaN(number)) {
    return number.toLocaleString();
  }

  return String(value);
}

// ==========================================
// LIST SECTION
// ==========================================

function renderListSection(title, value) {
  if (!value) {
    return null;
  }

  const items = Array.isArray(value)
    ? value
    : typeof value === "string"
    ? value
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  if (items.length === 0) {
    return null;
  }

  return (
    <div style={styles.section}>
      <h3>{title}</h3>

      <ul style={styles.list}>
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>
            {typeof item === "string"
              ? item
              : item?.text ||
                item?.description ||
                String(item)}
          </li>
        ))}
      </ul>
    </div>
  );
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
    whiteSpace: "pre-wrap",
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