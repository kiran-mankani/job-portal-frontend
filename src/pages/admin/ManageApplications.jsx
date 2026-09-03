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
    applications,
    loading,
    error,
    success,
  } = useSelector((state) => state.admin);

  const token = useSelector(
    (state) => state.auth.token
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
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearAdminError());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // ==========================================
  // CLEAR SUCCESS
  // ==========================================

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearAdminSuccess());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

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
      <div style={{ padding: "30px" }}>
        <h2>Manage Applications</h2>
        <p>Loading applications...</p>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div style={{ padding: "30px" }}>
      <h1>Manage Applications</h1>

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
          {success.message ||
            "Operation successful"}
        </div>
      )}

      {/* ====================================== */}
      {/* APPLICATIONS */}
      {/* ====================================== */}

      {applications.length === 0 ? (
        <p>No applications found.</p>
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
                <th>Candidate</th>
                <th>Email</th>
                <th>Job</th>
                <th>Recruiter</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th>CV</th>
              </tr>
            </thead>

            <tbody>
              {applications.map((application) => {
                const candidate =
                  application.candidate || {};

                const job =
                  application.job || {};

                const recruiter =
                  application.recruiter || {};

                return (
                  <tr key={application._id}>
                    {/* CANDIDATE */}
                    <td>
                      {candidate.name ||
                        candidate.fullName ||
                        "N/A"}
                    </td>

                    {/* EMAIL */}
                    <td>
                      {candidate.email ||
                        "N/A"}
                    </td>

                    {/* JOB */}
                    <td>
                      {job.title || "N/A"}
                    </td>

                    {/* RECRUITER */}
                    <td>
                      {recruiter.name ||
                        recruiter.email ||
                        "N/A"}
                    </td>

                    {/* STATUS */}
                    <td>
                      {application.status ||
                        "N/A"}
                    </td>

                    {/* APPLIED DATE */}
                    <td>
                      {application.createdAt
                        ? new Date(
                            application.createdAt
                          ).toLocaleDateString()
                        : application.appliedAt
                        ? new Date(
                            application.appliedAt
                          ).toLocaleDateString()
                        : "N/A"}
                    </td>

                    {/* CV */}
                    <td>
                      {application.cvUrl ? (
                        <a
                          href={
                            application.cvUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          View CV
                        </a>
                      ) : (
                        "Not uploaded"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ====================================== */}
      {/* LOADING */}
      {/* ====================================== */}

      {loading && applications.length > 0 && (
        <p style={{ marginTop: "15px" }}>
          Loading...
        </p>
      )}
    </div>
  );
}

export default ManageApplications;