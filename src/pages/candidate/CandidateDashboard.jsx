import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getCandidateDashboard,
  clearDashboardError,
} from "../../store/dashboardSlice";

function CandidateDashboard() {
  const dispatch = useDispatch();

  const { token, user } = useSelector(
    (state) => state.auth
  );

  const {
    candidate,
    loading,
    error,
  } = useSelector(
    (state) => state.dashboard
  );

  // ==========================================
  // LOAD DASHBOARD
  // ==========================================

  useEffect(() => {
    if (token) {
      dispatch(getCandidateDashboard(token));
    }
  }, [dispatch, token]);

  // ==========================================
  // RETRY
  // ==========================================

  const handleRetry = () => {
    dispatch(clearDashboardError());

    if (token) {
      dispatch(getCandidateDashboard(token));
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading && !candidate) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          Loading candidate dashboard...
        </div>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD DATA
  // ==========================================

  const dashboard =
    candidate?.dashboard ||
    candidate ||
    {};

  const stats =
    dashboard?.stats ||
    dashboard?.statistics ||
    {};

  const applications =
    dashboard?.applications ||
    dashboard?.recentApplications ||
    [];

  const interviews =
    dashboard?.interviews ||
    dashboard?.upcomingInterviews ||
    [];

  // ==========================================
  // STATS
  // ==========================================

  const totalApplications =
    stats.totalApplications ??
    dashboard.totalApplications ??
    applications.length ??
    0;

  const pendingApplications =
    stats.pendingApplications ??
    dashboard.pendingApplications ??
    0;

  const shortlistedApplications =
    stats.shortlistedApplications ??
    dashboard.shortlistedApplications ??
    0;

  const interviewsCount =
    stats.interviews ??
    stats.totalInterviews ??
    dashboard.interviewsCount ??
    interviews.length ??
    0;

  return (
    <div style={styles.container}>

      {/* ======================================
          HEADER
      ====================================== */}

      <div style={styles.header}>
        <div>
          <h1>
            Candidate Dashboard
          </h1>

          <p style={styles.subtitle}>
            Welcome back,{" "}
            <strong>
              {user?.name || "Candidate"}
            </strong>
            !
          </p>
        </div>

        <Link
          to="/candidate/profile"
          style={styles.profileButton}
        >
          My Profile
        </Link>
      </div>

      {/* ======================================
          ERROR
      ====================================== */}

      {error && (
        <div style={styles.error}>
          <span>
            <strong>Error:</strong>{" "}
            {error}
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
          STATS
      ====================================== */}

      <div style={styles.statsGrid}>

        <StatCard
          title="Total Applications"
          value={totalApplications}
        />

        <StatCard
          title="Pending Applications"
          value={pendingApplications}
        />

        <StatCard
          title="Shortlisted"
          value={shortlistedApplications}
        />

        <StatCard
          title="Interviews"
          value={interviewsCount}
        />

      </div>

      {/* ======================================
          QUICK ACTIONS
      ====================================== */}

      <div style={styles.section}>
        <h2>Quick Actions</h2>

        <div style={styles.actionGrid}>

          <Link
            to="/jobs"
            style={styles.actionCard}
          >
            <h3>Find Jobs</h3>

            <p>
              Search and explore available
              job opportunities.
            </p>
          </Link>

          <Link
            to="/candidate/applications"
            style={styles.actionCard}
          >
            <h3>My Applications</h3>

            <p>
              Track the status of your
              submitted applications.
            </p>
          </Link>

          <Link
            to="/candidate/interviews"
            style={styles.actionCard}
          >
            <h3>My Interviews</h3>

            <p>
              View your upcoming and
              scheduled interviews.
            </p>
          </Link>

          <Link
            to="/candidate/profile"
            style={styles.actionCard}
          >
            <h3>Update Profile</h3>

            <p>
              Keep your candidate profile
              up to date.
            </p>
          </Link>

        </div>
      </div>

      {/* ======================================
          RECENT APPLICATIONS
      ====================================== */}

      <div style={styles.section}>

        <div style={styles.sectionHeader}>
          <h2>
            Recent Applications
          </h2>

          <Link
            to="/candidate/applications"
            style={styles.viewAll}
          >
            View All
          </Link>
        </div>

        {applications.length === 0 ? (
          <div style={styles.empty}>
            <p>
              No applications found.
            </p>

            <Link
              to="/jobs"
              style={styles.primaryButton}
            >
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div style={styles.list}>
            {applications
              .slice(0, 5)
              .map((application, index) => {

                const job =
                  application?.job ||
                  {};

                const applicationId =
                  application?._id ||
                  application?.id;

                return (
                  <div
                    key={
                      applicationId ||
                      index
                    }
                    style={styles.listItem}
                  >
                    <div>
                      <h3>
                        {job?.title ||
                          application?.jobTitle ||
                          "Job Application"}
                      </h3>

                      <p
                        style={
                          styles.muted
                        }
                      >
                        {job?.company ||
                          job?.companyName ||
                          application?.company ||
                          "Company not available"}
                      </p>

                      {application?.appliedAt && (
                        <small
                          style={
                            styles.muted
                          }
                        >
                          Applied:{" "}
                          {formatDate(
                            application.appliedAt
                          )}
                        </small>
                      )}
                    </div>

                    <div
                      style={
                        styles.itemRight
                      }
                    >
                      <span
                        style={{
                          ...styles.status,
                          ...getStatusStyle(
                            application?.status
                          ),
                        }}
                      >
                        {application?.status ||
                          "Pending"}
                      </span>

                      {applicationId && (
                        <Link
                          to={`/candidate/applications/${applicationId}`}
                          style={
                            styles.smallButton
                          }
                        >
                          View
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}

      </div>

      {/* ======================================
          UPCOMING INTERVIEWS
      ====================================== */}

      <div style={styles.section}>

        <div style={styles.sectionHeader}>
          <h2>
            Upcoming Interviews
          </h2>

          <Link
            to="/candidate/interviews"
            style={styles.viewAll}
          >
            View All
          </Link>
        </div>

        {interviews.length === 0 ? (
          <div style={styles.empty}>
            <p>
              No upcoming interviews.
            </p>
          </div>
        ) : (
          <div style={styles.list}>
            {interviews
              .slice(0, 5)
              .map((interview, index) => {

                const application =
                  interview?.application ||
                  {};

                const job =
                  application?.job ||
                  {};

                return (
                  <div
                    key={
                      interview?._id ||
                      index
                    }
                    style={styles.listItem}
                  >
                    <div>
                      <h3>
                        {job?.title ||
                          interview?.jobTitle ||
                          "Interview"}
                      </h3>

                      <p
                        style={
                          styles.muted
                        }
                      >
                        {interview?.date
                          ? formatDate(
                              interview.date
                            )
                          : "Date not available"}
                      </p>

                      <p
                        style={
                          styles.muted
                        }
                      >
                        Mode:{" "}
                        {interview?.mode ||
                          "N/A"}
                      </p>
                    </div>

                    <span
                      style={{
                        ...styles.status,
                        ...getStatusStyle(
                          interview?.status ||
                            "scheduled"
                        ),
                      }}
                    >
                      {interview?.status ||
                        "Scheduled"}
                    </span>
                  </div>
                );
              })}
          </div>
        )}

      </div>

    </div>
  );
}

// ==========================================
// STAT CARD
// ==========================================

function StatCard({
  title,
  value,
}) {
  return (
    <div style={styles.statCard}>
      <p style={styles.statTitle}>
        {title}
      </p>

      <h2 style={styles.statValue}>
        {value}
      </h2>
    </div>
  );
}

// ==========================================
// DATE FORMAT
// ==========================================

function formatDate(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleString();
}

// ==========================================
// STATUS STYLE
// ==========================================

function getStatusStyle(status) {
  const normalizedStatus =
    String(status || "")
      .toLowerCase();

  if (
    normalizedStatus ===
      "shortlisted" ||
    normalizedStatus ===
      "approved" ||
    normalizedStatus ===
      "selected" ||
    normalizedStatus ===
      "completed"
  ) {
    return {
      background: "#e5ffe9",
      color: "#087a21",
    };
  }

  if (
    normalizedStatus ===
      "rejected" ||
    normalizedStatus ===
      "cancelled"
  ) {
    return {
      background: "#ffe5e5",
      color: "#c00",
    };
  }

  return {
    background: "#e5f0ff",
    color: "#1557a6",
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

  profileButton: {
    padding: "10px 16px",
    borderRadius: "6px",
    background: "#2563eb",
    color: "#fff",
    textDecoration: "none",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "18px",
    marginBottom: "35px",
  },

  statCard: {
    padding: "22px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    background: "#fff",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.05)",
  },

  statTitle: {
    color: "#666",
    margin: 0,
  },

  statValue: {
    fontSize: "32px",
    margin: "10px 0 0",
  },

  section: {
    marginBottom: "35px",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },

  viewAll: {
    color: "#2563eb",
    textDecoration: "none",
  },

  actionGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
  },

  actionCard: {
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    background: "#fff",
    color: "#222",
    textDecoration: "none",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    padding: "18px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "#fff",
    flexWrap: "wrap",
  },

  itemRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },

  status: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    textTransform: "capitalize",
    whiteSpace: "nowrap",
  },

  smallButton: {
    padding: "7px 12px",
    borderRadius: "5px",
    background: "#2563eb",
    color: "#fff",
    textDecoration: "none",
    fontSize: "14px",
  },

  primaryButton: {
    display: "inline-block",
    padding: "10px 16px",
    borderRadius: "6px",
    background: "#2563eb",
    color: "#fff",
    textDecoration: "none",
  },

  muted: {
    color: "#666",
  },

  empty: {
    padding: "30px",
    textAlign: "center",
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "#fff",
  },

  loading: {
    textAlign: "center",
    padding: "60px",
    color: "#666",
  },

  error: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    padding: "15px",
    marginBottom: "25px",
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
};

export default CandidateDashboard;