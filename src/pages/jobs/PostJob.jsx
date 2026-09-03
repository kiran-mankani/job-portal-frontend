import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  createJob,
  clearJobError,
  clearJobSuccess,
} from "../../store/jobSlice";

function PostJob() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { token } = useSelector((state) => state.auth);
  const { loading, error, success } = useSelector(
    (state) => state.jobs
  );

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    jobType: "",
    salary: "",
    description: "",
    requirements: "",
    responsibilities: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      dispatch(clearJobError());
    }

    if (success) {
      dispatch(clearJobSuccess());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const jobData = {
      ...formData,
      requirements: formData.requirements
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),

      responsibilities: formData.responsibilities
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    const result = await dispatch(
      createJob({
        jobData,
        token,
      })
    );

    if (createJob.fulfilled.match(result)) {
      setTimeout(() => {
        navigate("/jobs/my-jobs");
      }, 1000);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>Post a Job</h1>

        <p style={styles.subtitle}>
          Create a new job vacancy for candidates.
        </p>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {success && (
          <div style={styles.success}>
            {success.message || "Job created successfully!"}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* TITLE */}

          <div style={styles.field}>
            <label>Job Title</label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Frontend Developer"
              required
            />
          </div>

          {/* COMPANY */}

          <div style={styles.field}>
            <label>Company</label>

            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Company name"
              required
            />
          </div>

          {/* LOCATION */}

          <div style={styles.field}>
            <label>Location</label>

            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Lahore / Remote"
              required
            />
          </div>

          {/* JOB TYPE */}

          <div style={styles.field}>
            <label>Job Type</label>

            <select
              name="jobType"
              value={formData.jobType}
              onChange={handleChange}
              required
            >
              <option value="">Select job type</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="remote">Remote</option>
            </select>
          </div>

          {/* SALARY */}

          <div style={styles.field}>
            <label>Salary</label>

            <input
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              placeholder="e.g. 100,000 - 150,000 PKR"
            />
          </div>

          {/* DESCRIPTION */}

          <div style={styles.field}>
            <label>Job Description</label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the job..."
              rows="6"
              required
            />
          </div>

          {/* REQUIREMENTS */}

          <div style={styles.field}>
            <label>
              Requirements
            </label>

            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              placeholder={
                "Enter one requirement per line\n" +
                "React.js\n" +
                "JavaScript\n" +
                "REST APIs"
              }
              rows="6"
            />
          </div>

          {/* RESPONSIBILITIES */}

          <div style={styles.field}>
            <label>
              Responsibilities
            </label>

            <textarea
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleChange}
              placeholder={
                "Enter one responsibility per line\n" +
                "Build UI components\n" +
                "Fix bugs\n" +
                "Work with backend team"
              }
              rows="6"
            />
          </div>

          {/* BUTTON */}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Posting Job..." : "Post Job"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "30px 20px",
    display: "flex",
    justifyContent: "center",
  },

  card: {
    width: "100%",
    maxWidth: "700px",
    padding: "30px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    background: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },

  subtitle: {
    color: "#666",
    marginBottom: "25px",
  },

  field: {
    marginBottom: "20px",
  },

  error: {
    padding: "12px",
    marginBottom: "20px",
    background: "#ffe5e5",
    color: "#c00",
    borderRadius: "6px",
  },

  success: {
    padding: "12px",
    marginBottom: "20px",
    background: "#e5ffe9",
    color: "#087a21",
    borderRadius: "6px",
  },

  button: {
    width: "100%",
    padding: "13px",
    border: "none",
    borderRadius: "6px",
    background: "#2563eb",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default PostJob;