import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getSingleJob,
  clearJobError,
  clearSelectedJob,
} from "../../store/jobSlice";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { job, loading, error } = useSelector((state) => state.jobs);

  useEffect(() => {
    dispatch(getSingleJob(id));

    return () => {
      dispatch(clearSelectedJob());
      dispatch(clearJobError());
    };
  }, [dispatch, id]);

  if (loading) {
    return (
      <div style={styles.message}>
        <h2>Loading job...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          {error}
        </div>

        <button
          onClick={() => navigate("/jobs")}
          style={styles.backButton}
        >
          Back to Jobs
        </button>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={styles.message}>
        <h2>Job not found</h2>

        <button
          onClick={() => navigate("/jobs")}
          style={styles.backButton}
        >
          Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Back */}
      <Link to="/jobs" style={styles.backLink}>
        ← Back to Jobs
      </Link>

      {/* Job Header */}
      <div style={styles.card}>
        <h1>{job.title}</h1>

        <p style={styles.company}>
          {job.company ||
            job.companyName ||
            job.recruiter?.companyName ||
            "Company"}
        </p>

        <div style={styles.infoRow}>
          <span>
            📍 {job.location || "Location not specified"}
          </span>

          <span>
            💼 {job.jobType || job.type || "Not specified"}
          </span>

          {job.salary && (
            <span>
              💰 {job.salary}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <div style={styles.card}>
        <h2>Job Description</h2>

        <p style={styles.description}>
          {job.description || "No description available."}
        </p>
      </div>

      {/* Requirements */}
      {job.requirements && (
        <div style={styles.card}>
          <h2>Requirements</h2>

          {Array.isArray(job.requirements) ? (
            <ul>
              {job.requirements.map((requirement, index) => (
                <li key={index}>{requirement}</li>
              ))}
            </ul>
          ) : (
            <p style={styles.description}>
              {job.requirements}
            </p>
          )}
        </div>
      )}

      {/* Responsibilities */}
      {job.responsibilities && (
        <div style={styles.card}>
          <h2>Responsibilities</h2>

          {Array.isArray(job.responsibilities) ? (
            <ul>
              {job.responsibilities.map(
                (responsibility, index) => (
                  <li key={index}>
                    {responsibility}
                  </li>
                )
              )}
            </ul>
          ) : (
            <p style={styles.description}>
              {job.responsibilities}
            </p>
          )}
        </div>
      )}

      {/* Apply */}
      <div style={styles.applySection}>
        <Link
          to={`/jobs/${job._id}/apply`}
          style={styles.applyButton}
        >
          Apply for this Job
        </Link>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "30px 20px",
  },

  card: {
    padding: "25px",
    marginBottom: "20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    background: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },

  company: {
    fontSize: "18px",
    color: "#555",
    marginBottom: "20px",
  },

  infoRow: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
    color: "#555",
  },

  description: {
    lineHeight: "1.7",
    color: "#444",
    whiteSpace: "pre-line",
  },

  backLink: {
    display: "inline-block",
    marginBottom: "20px",
    color: "#2563eb",
    textDecoration: "none",
  },

  applySection: {
    textAlign: "center",
    marginTop: "30px",
  },

  applyButton: {
    display: "inline-block",
    padding: "13px 25px",
    background: "#2563eb",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "6px",
    fontSize: "16px",
  },

  backButton: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "6px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },

  error: {
    padding: "15px",
    marginBottom: "20px",
    background: "#ffe5e5",
    color: "#c00",
    borderRadius: "6px",
  },

  message: {
    textAlign: "center",
    padding: "50px 20px",
  },
};

export default JobDetails;