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
    jobs,
    loading,
    error,
    success,
  } = useSelector((state) => state.admin);

  const token = useSelector(
    (state) => state.auth.token
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
    dispatch(
      getAdminJobs({
        token,
        status,
      })
    );
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading && jobs.length === 0) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>Manage Jobs</h2>
        <p>Loading jobs...</p>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div style={{ padding: "30px" }}>
      <h1>Manage Jobs</h1>

      {/* ====================================== */}
      {/* STATUS FILTER */}
      {/* ====================================== */}

      <div style={{ marginBottom: "20px" }}>
        <label>
          <strong>Filter by Status: </strong>
        </label>

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
          style={{
            padding: "8px",
            marginLeft: "8px",
          }}
        >
          <option value="">All Jobs</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
          <option value="draft">Draft</option>
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
          {success.message ||
            "Operation successful"}
        </div>
      )}

      {/* ====================================== */}
      {/* JOBS */}
      {/* ====================================== */}

      {jobs.length === 0 ? (
        <p>No jobs found.</p>
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
                <th>Title</th>
                <th>Company</th>
                <th>Location</th>
                <th>Job Type</th>
                <th>Status</th>
                <th>Recruiter</th>
                <th>Created</th>
              </tr>
            </thead>

            <tbody>
              {jobs.map((job) => {
                const recruiter =
                  job.recruiter || {};

                return (
                  <tr key={job._id}>
                    {/* TITLE */}
                    <td>
                      {job.title || "N/A"}
                    </td>

                    {/* COMPANY */}
                    <td>
                      {job.company ||
                        job.companyName ||
                        "N/A"}
                    </td>

                    {/* LOCATION */}
                    <td>
                      {job.location || "N/A"}
                    </td>

                    {/* JOB TYPE */}
                    <td>
                      {job.jobType ||
                        job.type ||
                        "N/A"}
                    </td>

                    {/* STATUS */}
                    <td>
                      {job.status || "N/A"}
                    </td>

                    {/* RECRUITER */}
                    <td>
                      {recruiter.name ||
                        recruiter.email ||
                        "N/A"}
                    </td>

                    {/* CREATED */}
                    <td>
                      {job.createdAt
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

      {/* ====================================== */}
      {/* LOADING */}
      {/* ====================================== */}

      {loading && jobs.length > 0 && (
        <p style={{ marginTop: "15px" }}>
          Loading...
        </p>
      )}
    </div>
  );
}

export default ManageJobs;