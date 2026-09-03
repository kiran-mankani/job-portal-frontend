import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getAdminDashboard,
  clearDashboardError,
} from "../../store/dashboardSlice";

function AdminDashboard() {
  const dispatch = useDispatch();

  const { token, user } = useSelector(
    (state) => state.auth
  );

  const {
    admin,
    loading,
    error,
  } = useSelector(
    (state) => state.dashboard
  );

  // ==========================================
  // LOAD ADMIN DASHBOARD
  // ==========================================

  useEffect(() => {
    if (token) {
      dispatch(getAdminDashboard(token));
    }
  }, [dispatch, token]);

  // ==========================================
  // RETRY
  // ==========================================

  const handleRetry = () => {
    dispatch(clearDashboardError());

    if (token) {
      dispatch(getAdminDashboard(token));
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading && !admin) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          Loading admin dashboard...
        </div>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD DATA
  // ==========================================

  const dashboard =
    admin?.dashboard ||
    admin ||
    {};

  const stats =
    dashboard?.stats ||
    dashboard?.statistics ||
    {};

  const users =
    dashboard?.users ||
    dashboard?.recentUsers ||
    [];

  const jobs =
    dashboard?.jobs ||
    dashboard?.recentJobs ||
    [];

  const applications =
    dashboard?.applications ||
    dashboard?.recentApplications ||
    [];

  // ==========================================
  // STATS
  // ==========================================

  const totalUsers =
    stats.totalUsers ??
    dashboard.totalUsers ??
    users.length ??
    0;

  const totalCandidates =
    stats.totalCandidates ??
    dashboard.totalCandidates ??
    0;

  const totalRecruiters =
    stats.totalRecruiters ??
    dashboard.totalRecruiters ??
    0;

  const totalJobs =
    stats.totalJobs ??
    dashboard.totalJobs ??
    jobs.length ??
    0;

  const totalApplications =
    stats.totalApplications ??
    dashboard.totalApplications ??
    applications.length ??
    0;

  return (
    <div style={styles.container}>

      {/* ======================================
          HEADER
      ====================================== */}

      <div style={styles.header}>
        <div>
          <h1>
            Admin Dashboard
          </h1>

          <p style={styles.subtitle}>
            Welcome back,{" "}
            <strong>
              {user?.name || "Admin"}
            </strong>
            !
          </p>
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
          title="Total Users"
          value={totalUsers}
        />

        <StatCard
          title="Candidates"
          value={totalCandidates}
        />

        <StatCard
          title="Recruiters"
          value={totalRecruiters}
        />

        <StatCard
          title="Total Jobs"
          value={totalJobs}
        />

        <StatCard
          title="Applications"
          value={totalApplications}
        />

      </div>

      {/* ======================================
          ADMIN MANAGEMENT
      ====================================== */}

      <div style={styles.section}>
        <h2>
          Management
        </h2>

        <div style={styles.actionGrid}>

          <Link
            to="/admin/users"
            style={styles.actionCard}
          >
            <h3>
              Manage Users
            </h3>

            <p>
              View, block, unblock and
              delete users.
            </p>
          </Link>

          <Link
            to="/admin/jobs"
            style={styles.actionCard}
          >
            <h3>
              Manage Jobs
            </h3>

            <p>
              Review and manage all jobs
              posted on the platform.
            </p>
          </Link>

          <Link
            to="/admin/applications"
            style={styles.actionCard}
          >
            <h3>
              Manage Applications
            </h3>

            <p>
              View all candidate applications
              and their details.
            </p>
          </Link>

        </div>
      </div>

      {/* ======================================
          RECENT USERS
      ====================================== */}

      <div style={styles.section}>

        <div style={styles.sectionHeader}>
          <h2>
            Recent Users
          </h2>

          <Link
            to="/admin/users"
            style={styles.viewAll}
          >
            View All
          </Link>
        </div>

        {users.length === 0 ? (
          <div style={styles.empty}>
            <p>
              No users found.
            </p>
          </div>
        ) : (
          <div style={styles.list}>
            {users
              .slice(0, 5)
              .map((item, index) => {

                const currentUser =
                  item?.user ||
                  item;

                return (
                  <div
                    key={
                      currentUser?._id ||
                      currentUser?.id ||
                      index
                    }
                    style={styles.listItem}
                  >
                    <div>
                      <h3>
                        {currentUser?.name ||
                          "User"}
                      </h3>

                      <p
                        style={
                          styles.muted
                        }
                      >
                        {currentUser?.email ||
                          "Email not available"}
                      </p>
                    </div>

                    <span
                      style={{
                        ...styles.status,
                        ...getStatusStyle(
                          currentUser?.role
                        ),
                      }}
                    >
                      {currentUser?.role ||
                        "User"}
                    </span>
                  </div>
                );
              })}
          </div>
        )}

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
            to="/admin/jobs"
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

                    <span
                      style={{
                        ...styles.status,
                        ...getStatusStyle(
                          job?.status
                        ),
                      }}
                    >
                      {job?.status ||
                        "Active"}
                    </span>
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
            to="/admin/applications"
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

                  const candidate =
                    application?.candidate ||
                    {};

                  const job =
                    application?.job ||
                    {};

                  return (
                    <div
                      key={
                        application?._id ||
                        application?.id ||
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
// STATUS STYLE
// ==========================================

function getStatusStyle(status) {
  const normalizedStatus =
    String(status || "")
      .toLowerCase();

  if (
    normalizedStatus === "admin" ||
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
    normalizedStatus === "blocked" ||
    normalizedStatus === "rejected" ||
    normalizedStatus === "cancelled" ||
    normalizedStatus === "closed"
  ) {
    return {
      background: "#ffe5e5",
      color: "#c00",
    };
  }

  if (
    normalizedStatus === "candidate"
  ) {
    return {
      background: "#e5f0ff",
      color: "#1557a6",
    };
  }

  if (
    normalizedStatus === "recruiter"
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
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "30px 20px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },

  subtitle: {
    color: "#666",
    marginTop: "5px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(190px, 1fr))",
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
      "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "18px",
  },

  actionCard: {
    padding: "22px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    background: "#fff",
    color: "#222",
    textDecoration: "none",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.04)",
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

  status: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    textTransform: "capitalize",
    whiteSpace: "nowrap",
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

export default AdminDashboard;