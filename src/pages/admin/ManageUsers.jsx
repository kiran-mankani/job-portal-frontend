import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  getUsers,
  toggleBlockUser,
  deleteUser,
  clearAdminError,
  clearAdminSuccess,
} from "../../store/adminSlice";

function ManageUsers() {
  const dispatch = useDispatch();

  const {
    users = [],
    loading,
    error,
    success,
  } = useSelector((state) => state.admin);

  const { token: reduxToken } = useSelector(
    (state) => state.auth
  );

  const token =
    reduxToken ||
    localStorage.getItem("token") ||
    null;

  const [role, setRole] = useState("");

  // ==========================================
  // LOAD USERS
  // ==========================================

  useEffect(() => {
    if (token) {
      dispatch(
        getUsers({
          token,
          role,
        })
      );
    }
  }, [dispatch, token, role]);

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

    return "Failed to load users.";
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
  // BLOCK / UNBLOCK
  // ==========================================

  const handleToggleBlock = (id) => {
    if (!id || !token) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to change this user's block status?"
    );

    if (!confirmed) {
      return;
    }

    dispatch(
      toggleBlockUser({
        id,
        token,
      })
    );
  };

  // ==========================================
  // DELETE USER
  // ==========================================

  const handleDelete = (id) => {
    if (!id || !token) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) {
      return;
    }

    dispatch(
      deleteUser({
        id,
        token,
      })
    );
  };

  // ==========================================
  // RETRY
  // ==========================================

  const handleRetry = () => {
    if (!token) {
      return;
    }

    dispatch(
      getUsers({
        token,
        role,
      })
    );
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading && users.length === 0) {
    return (
      <div style={styles.page}>
        <h2>Manage Users</h2>

        <p style={styles.loadingText}>
          Loading users...
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
        Manage Users
      </h1>

      {/* ======================================
          FILTER
      ====================================== */}

      <div style={styles.filterContainer}>
        <label
          htmlFor="role-filter"
          style={styles.filterLabel}
        >
          Filter by Role:
        </label>

        <select
          id="role-filter"
          value={role}
          onChange={(e) =>
            setRole(e.target.value)
          }
          style={styles.select}
        >
          <option value="">
            All Users
          </option>

          <option value="candidate">
            Candidates
          </option>

          <option value="recruiter">
            Recruiters
          </option>

          <option value="admin">
            Admins
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
          USERS TABLE
      ====================================== */}

      {users.length === 0 ? (
        <div style={styles.empty}>
          <p>No users found.</p>
        </div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>
                  Name
                </th>

                <th style={styles.th}>
                  Email
                </th>

                <th style={styles.th}>
                  Role
                </th>

                <th style={styles.th}>
                  Status
                </th>

                <th style={styles.th}>
                  Created
                </th>

                <th style={styles.th}>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {users.map((user, index) => {
                const userId =
                  user?._id ||
                  user?.id ||
                  `user-${index}`;

                const normalizedRole =
                  String(
                    user?.role || ""
                  )
                    .trim()
                    .toLowerCase();

                const isAdmin =
                  normalizedRole === "admin";

                return (
                  <tr
                    key={userId}
                    style={styles.tr}
                  >
                    {/* NAME */}
                    <td style={styles.td}>
                      {user?.name ||
                        user?.fullName ||
                        "N/A"}
                    </td>

                    {/* EMAIL */}
                    <td style={styles.td}>
                      {user?.email || "N/A"}
                    </td>

                    {/* ROLE */}
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.roleBadge,
                          ...getRoleStyle(
                            normalizedRole
                          ),
                        }}
                      >
                        {user?.role || "N/A"}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          ...(user?.isBlocked
                            ? styles.blocked
                            : styles.active),
                        }}
                      >
                        {user?.isBlocked
                          ? "Blocked"
                          : "Active"}
                      </span>
                    </td>

                    {/* CREATED */}
                    <td style={styles.td}>
                      {user?.createdAt
                        ? new Date(
                            user.createdAt
                          ).toLocaleDateString()
                        : "N/A"}
                    </td>

                    {/* ACTIONS */}
                    <td style={styles.td}>
                      {isAdmin ? (
                        <span
                          style={
                            styles.protectedText
                          }
                        >
                          Admin protected
                        </span>
                      ) : (
                        <div
                          style={
                            styles.actions
                          }
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleBlock(
                                userId
                              )
                            }
                            disabled={
                              loading ||
                              !token
                            }
                            style={{
                              ...styles.actionButton,
                              ...(user?.isBlocked
                                ? styles.unblockButton
                                : styles.blockButton),
                            }}
                          >
                            {user?.isBlocked
                              ? "Unblock"
                              : "Block"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                userId
                              )
                            }
                            disabled={
                              loading ||
                              !token
                            }
                            style={{
                              ...styles.actionButton,
                              ...styles.deleteButton,
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ======================================
          LOADING DURING ACTION
      ====================================== */}

      {loading && users.length > 0 && (
        <p style={styles.loadingMore}>
          Processing...
        </p>
      )}
    </div>
  );
}

// ==========================================
// ROLE STYLE
// ==========================================

function getRoleStyle(role) {
  if (role === "admin") {
    return {
      background: "#f3e8ff",
      color: "#7e22ce",
    };
  }

  if (role === "recruiter") {
    return {
      background: "#fff4e5",
      color: "#a15c00",
    };
  }

  if (role === "candidate") {
    return {
      background: "#e5f0ff",
      color: "#1557a6",
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

  roleBadge: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "capitalize",
    whiteSpace: "nowrap",
  },

  statusBadge: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  active: {
    background: "#e5ffe9",
    color: "#087a21",
  },

  blocked: {
    background: "#ffe5e5",
    color: "#c00",
  },

  actions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  actionButton: {
    padding: "7px 11px",
    border: "none",
    borderRadius: "5px",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "12px",
  },

  blockButton: {
    background: "#d97706",
  },

  unblockButton: {
    background: "#16a34a",
  },

  deleteButton: {
    background: "#dc2626",
  },

  protectedText: {
    color: "#7e22ce",
    fontWeight: "600",
    fontSize: "13px",
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

export default ManageUsers;