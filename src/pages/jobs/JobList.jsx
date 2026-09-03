import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getAllJobs,
  searchJobs,
  clearJobError,
} from "../../store/jobSlice";

function JobList() {
  const dispatch = useDispatch();

  const { jobs, loading, error } = useSelector((state) => state.jobs);

  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");

  // ===============================
  // LOAD ALL JOBS
  // ===============================

  useEffect(() => {
    dispatch(getAllJobs());
  }, [dispatch]);

  // ===============================
  // SEARCH JOBS
  // ===============================

  const handleSearch = (e) => {
    e.preventDefault();

    dispatch(
      searchJobs({
        keyword,
        location,
      })
    );
  };

  // ===============================
  // CLEAR SEARCH
  // ===============================

  const handleClear = () => {
    setKeyword("");
    setLocation("");

    dispatch(clearJobError());
    dispatch(getAllJobs());
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Find Jobs</h1>
        <p>Search for your next opportunity</p>
      </div>

      {/* ===============================
          SEARCH
      =============================== */}

      <form onSubmit={handleSearch} style={styles.searchBox}>
        <input
          type="text"
          placeholder="Job title, keyword..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={styles.input}
        />

        <input
          type="text"
          placeholder="Location..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={styles.input}
        />

        <button type="submit" style={styles.searchButton}>
          Search
        </button>

        <button
          type="button"
          onClick={handleClear}
          style={styles.clearButton}
        >
          Clear
        </button>
      </form>

      {/* ===============================
          ERROR
      =============================== */}

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {/* ===============================
          LOADING
      =============================== */}

      {loading && (
        <div style={styles.message}>
          Loading jobs...
        </div>
      )}

      {/* ===============================
          JOB LIST
      =============================== */}

      {!loading && jobs.length === 0 && (
        <div style={styles.message}>
          No jobs found.
        </div>
      )}

      <div style={styles.jobsGrid}>
        {jobs.map((job) => (
          <div key={job._id} style={styles.jobCard}>
            <h2 style={styles.jobTitle}>
              {job.title}
            </h2>

            <p>
              <strong>Company:</strong>{" "}
              {job.company || job.companyName || "N/A"}
            </p>

            <p>
              <strong>Location:</strong>{" "}
              {job.location || "N/A"}
            </p>

            <p>
              <strong>Job Type:</strong>{" "}
              {job.jobType || job.type || "N/A"}
            </p>

            {job.salary && (
              <p>
                <strong>Salary:</strong>{" "}
                {job.salary}
              </p>
            )}

            {job.description && (
              <p style={styles.description}>
                {job.description.length > 150
                  ? `${job.description.substring(0, 150)}...`
                  : job.description}
              </p>
            )}

            <Link
              to={`/jobs/${job._id}`}
              style={styles.detailsButton}
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}


// ===============================
// STYLES
// ===============================

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "30px 20px",
  },

  header: {
    textAlign: "center",
    marginBottom: "30px",
  },

  searchBox: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "30px",
  },

  input: {
    flex: "1",
    minWidth: "220px",
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "15px",
  },

  searchButton: {
    padding: "12px 20px",
    border: "none",
    borderRadius: "6px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },

  clearButton: {
    padding: "12px 20px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    background: "#fff",
    cursor: "pointer",
  },

  error: {
    padding: "12px",
    marginBottom: "20px",
    background: "#ffe5e5",
    color: "#c00",
    borderRadius: "6px",
  },

  message: {
    textAlign: "center",
    padding: "30px",
    color: "#666",
  },

  jobsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },

  jobCard: {
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    background: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },

  jobTitle: {
    marginBottom: "15px",
  },

  description: {
    color: "#666",
    lineHeight: "1.5",
  },

  detailsButton: {
    display: "inline-block",
    marginTop: "15px",
    padding: "10px 16px",
    background: "#2563eb",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "6px",
  },
};

export default JobList;