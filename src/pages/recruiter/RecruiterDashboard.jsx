import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getRecruiterDashboard,
  clearDashboardError,
} from "../../store/dashboardSlice";

function RecruiterDashboard() {
  const dispatch = useDispatch();

  const { token, user } = useSelector(
    (state) => state.auth
  );

  const {
    recruiter,
    loading,
    error,
  } = useSelector(
    (state) => state.dashboard
  );

  // ==========================================
  // LOAD RECRUITER DASHBOARD
  // ==========================================

  useEffect(() => {
    if (token) {
      dispatch(getRecruiterDashboard(token));
    }
  }, [dispatch, token]);

  // ==========================================
  // RETRY
  // ==========================================

  const handleRetry = () => {
    dispatch(clearDashboardError());

    if (token) {
      dispatch(getRecruiterDashboard(token));
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading && !recruiter) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          Loading recruiter dashboard...
        </div>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD DATA
  // ==========================================

  const dashboard =
    recruiter?.dashboard ||
    recruiter ||
    {};

  const stats =
    dashboard?.stats ||
    dashboard?.statistics ||
    {};

  const jobs =
    dashboard?.jobs ||
    dashboard?.recentJobs ||
    [];

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

  const totalJobs =
    stats.totalJobs ??
    dashboard.totalJobs ??
    jobs.length ??
    0;

  const activeJobs =
    stats.activeJobs ??
    dashboard.activeJobs ??
    0;

  const totalApplications =
    stats.totalApplications ??
    dashboard.totalApplications ??
    applications.length ??
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
            Recruiter Dashboard
          </h1>

          <p style={styles.subtitle}>
            Welcome back,{" "}
            <strong>
              {user?.name || "Recruiter"}
            </strong>
            !
          </p>
        </div>

        <div style={styles.headerActions}>
          <Link
            to="/jobs/post"
            style={styles.primaryButton}
          >
            Post New Job
          </Link>

          <Link
            to="/candidate/profile"
            style={styles.secondaryButton}
          >
            Profile
          </Link>
        </div>
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
          title="Total Jobs"
          value={totalJobs}
        />

        <StatCard
          title="Active Jobs"
          value={activeJobs}
        />

        <StatCard
          title="Applications"
          value={totalApplications}
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
            to="/jobs/post"
            style={styles.actionCard}
          >
            <h3>Post Job</h3>

            <p>
              Create a new job opportunity
              for candidates.
            </p>
          </Link>

          <Link
            to="/jobs/my-jobs"
            style={styles.actionCard}
          >
            <h3>My Jobs</h3>

            <p>
              View and manage your posted
              jobs.
            </p>
          </Link>

          <Link
            to="/recruiter/applications"
            style={styles.actionCard}
          >
            <h3>Applications</h3>

            <p>
              Review candidate applications
              and update their status.
            </p>
          </Link>

          <Link
            to="/recruiter/interviews"
            style={styles.actionCard}
          >
            <h3>Interviews</h3>

            <p>
              Manage scheduled candidate
              interviews.
            </p>
          </Link>

        </div>
      </div>

      {/* ======================================
          RECENT JOBS
      ====================================== */}

      <div style={styles.section}>

        <div style={styles.sectionHeader}>
          <h2>
            Recent Jobs
          </h2>

          <Link
            to="/jobs/my-jobs"
            style={styles.viewAll}
          >
            View All
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div style={styles.empty}>
            <p>
              No jobs found.
            </p>

            <Link
              to="/jobs/post"
              style={styles.primaryButton}
            >
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div style={styles.list}>
            {jobs
              .slice(0, 5)
              .map((job, index) => {

                const jobId =
                  job?._id ||
                  job?.id;

                return (
                  <div
                    key={
                      jobId ||
                      index
                    }
                    style={styles.listItem}
                  >
                    <div>
                      <h3>
                        {job?.title ||
                          "Job"}
                      </h3>

                      <p
                        style={
                          styles.muted
                        }
                      >
                        {job?.company ||
                          job?.companyName ||
                          "Company"}
                      </p>

                      {job?.location && (
                        <small
                          style={
                            styles.muted
                          }
                        >
                          Location:{" "}
                          {job.location}
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
                            job?.status ||
                              (job?.isActive
                                ? "active"
                                : "inactive")
                          ),
                        }}
                      >
                        {job?.status ||
                          (job?.isActive
                            ? "Active"
                            : "Inactive")}
                      </span>

                      {jobId && (
                        <Link
                          to={`/jobs/${jobId}`}
                          style={
                            styles.smallButton
                          }
                        >
                          View
                        </Link>
                      )}

                      {jobId && (
                        <Link
                          to={`/jobs/${jobId}/edit`}
                          style={
                            styles.editButton
                          }
                        >
                          Edit
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
          RECENT APPLICATIONS
      ====================================== */}

      <div style={styles.section}>

        <div style={styles.sectionHeader}>
          <h2>
            Recent Applications
          </h2>

          <Link
            to="/recruiter/applications"
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
          </div>
        ) : (
          <div style={styles.list}>
            {applications
              .slice(0, 5)
              .map(
                (
                  application,
                  index
                ) => {

                  const applicationId =
                    application?._id ||
                    application?.id;

                  const candidate =
                    application?.candidate ||
                    {};

                  const job =
                    application?.job ||
                    {};

                  return (
                    <div
                      key={
                        applicationId ||
                        index
                      }
                      style={
                        styles.listItem
                      }
                    >
                      <div>
                        <h3>
                          {candidate?.name ||
                            "Candidate"}
                        </h3>

                        <p
                          style={
                            styles.muted
                          }
                        >
                          {candidate?.email ||
                            "Email not available"}
                        </p>

                        <p
                          style={
                            styles.muted
                          }
                        >
                          Job:{" "}
                          {job?.title ||
                            application?.jobTitle ||
                            "Job"}
                        </p>
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
                            to="/recruiter/applications"
                            style={
                              styles.smallButton
                            }
                          >
                            Manage
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
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
            to="/recruiter/interviews"
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

            <Link
              to="/recruiter/interviews/schedule"
              style={styles.primaryButton}
            >
              Schedule Interview
            </Link>
          </div>
        ) : (
          <div style={styles.list}>
            {interviews
              .slice(0, 5)
              .map(
                (
                  interview,
                  index
                ) => {

                  const candidate =
                    interview?.candidate ||
                    {};

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
                      style={
                        styles.listItem
                      }
                    >
                      <div>
                        <h3>
                          {candidate?.name ||
                            "Candidate"}
                        </h3>

                        <p
                          style={
                            styles.muted
                          }
                        >
                          Job:{" "}
                          {job?.title ||
                            interview?.jobTitle ||
                            "Job"}
                        </p>

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
                              interview?.status ||
                                "scheduled"
                            ),
                          }}
                        >
                          {interview?.status ||
                            "Scheduled"}
                        </span>

                        <Link
                          to="/recruiter/interviews"
                          style={
                            styles.smallButton
                          }
                        >
                          Manage
                        </Link>
                      </div>
                    </div>
                  );
                }
              )}
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
    String(status || "").toLowerCase();

  if (
    normalizedStatus === "active" ||
    normalizedStatus === "approved" ||
    normalizedStatus === "shortlisted" ||
    normalizedStatus === "scheduled" ||
    normalizedStatus === "completed"
  ) {
    return {
      background: "#e5ffe9",
      color: "#087a21",
    };
  }

  if (
    normalizedStatus === "inactive" ||
    normalizedStatus === "rejected" ||
    normalizedStatus === "cancelled" ||
    normalizedStatus === "closed"
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

  headerActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  subtitle: {
    color: "#666",
    marginTop: "5px",
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

  editButton: {
    padding: "7px 12px",
    borderRadius: "5px",
    background: "#fff",
    color: "#2563eb",
    border: "1px solid #2563eb",
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

  secondaryButton: {
    display: "inline-block",
    padding: "9px 16px",
    borderRadius: "6px",
    background: "#fff",
    color: "#2563eb",
    border: "1px solid #2563eb",
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

export default RecruiterDashboard;