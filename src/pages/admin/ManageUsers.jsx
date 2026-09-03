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
    users,
    loading,
    error,
    success,
  } = useSelector((state) => state.admin);

  const token = useSelector(
    (state) => state.auth.token
  );

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
  // CLEAR MESSAGES
  // ==========================================

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearAdminError());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearAdminSuccess());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  // ==========================================
  // BLOCK / UNBLOCK
  // ==========================================

  const handleToggleBlock = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to change this user's block status?"
    );

    if (!confirmed) return;

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
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) return;

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
      <div style={{ padding: "30px" }}>
        <h2>Manage Users</h2>
        <p>Loading users...</p>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div style={{ padding: "30px" }}>
      <h1>Manage Users</h1>

      {/* ====================================== */}
      {/* FILTER */}
      {/* ====================================== */}

      <div style={{ marginBottom: "20px" }}>
        <label>
          <strong>Filter by Role: </strong>
        </label>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{
            padding: "8px",
            marginLeft: "8px",
          }}
        >
          <option value="">All Users</option>
          <option value="candidate">Candidates</option>
          <option value="recruiter">Recruiters</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* ====================================== */}
      {/* ERROR */}
      {/* ====================================== */}

      {error && (
        <div
          style={{
            padding: "10px",
            marginBottom: "15px",
            border: "1px solid red",
          }}
        >
          <strong>Error:</strong> {error}

          <button
            onClick={handleRetry}
            style={{ marginLeft: "10px" }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ====================================== */}
      {/* SUCCESS */}
      {/* ====================================== */}

      {success && (
        <div
          style={{
            padding: "10px",
            marginBottom: "15px",
            border: "1px solid green",
          }}
        >
          {success.message || "Operation successful"}
        </div>
      )}

      {/* ====================================== */}
      {/* USERS TABLE */}
      {/* ====================================== */}

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            border="1"
            cellPadding="10"
            cellSpacing="0"
            width="100%"
          >
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  {/* NAME */}
                  <td>
                    {user.name ||
                      user.fullName ||
                      "N/A"}
                  </td>

                  {/* EMAIL */}
                  <td>
                    {user.email || "N/A"}
                  </td>

                  {/* ROLE */}
                  <td>
                    {user.role || "N/A"}
                  </td>

                  {/* STATUS */}
                  <td>
                    {user.isBlocked
                      ? "Blocked"
                      : "Active"}
                  </td>

                  {/* CREATED */}
                  <td>
                    {user.createdAt
                      ? new Date(
                          user.createdAt
                        ).toLocaleDateString()
                      : "N/A"}
                  </td>

                  {/* ACTIONS */}
                  <td>
                    {/* ADMIN KO BLOCK NAHI KARENGE */}
                    {user.role !== "admin" && (
                      <>
                        <button
                          onClick={() =>
                            handleToggleBlock(
                              user._id
                            )
                          }
                          disabled={loading}
                          style={{
                            marginRight: "8px",
                          }}
                        >
                          {user.isBlocked
                            ? "Unblock"
                            : "Block"}
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(
                              user._id
                            )
                          }
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </>
                    )}

                    {user.role === "admin" && (
                      <span>
                        Admin protected
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ====================================== */}
      {/* LOADING DURING ACTION */}
      {/* ====================================== */}

      {loading && users.length > 0 && (
        <p style={{ marginTop: "15px" }}>
          Processing...
        </p>
      )}
    </div>
  );
}

export default ManageUsers;