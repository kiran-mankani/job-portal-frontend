import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getSingleJob,
  updateJob,
  clearJobError,
  clearJobSuccess,
} from "../../store/jobSlice";

function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { token } = useSelector((state) => state.auth);
  const { job, loading, error, success } = useSelector(
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

  // ===============================
  // GET JOB
  // ===============================

  useEffect(() => {
    dispatch(getSingleJob(id));
  }, [dispatch, id]);

  // ===============================
  // FILL FORM
  // ===============================

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || "",
        company: job.company || job.companyName || "",
        location: job.location || "",
        jobType: job.jobType || job.type || "",
        salary: job.salary || "",
        description: job.description || "",

        requirements: Array.isArray(job.requirements)
          ? job.requirements.join("\n")
          : job.requirements || "",

        responsibilities: Array.isArray(job.responsibilities)
          ? job.responsibilities.join("\n")
          : job.responsibilities || "",
      });
    }
  }, [job]);

  // ===============================
  // CHANGE
  // ===============================

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

  // ===============================
  // SUBMIT
  // ===============================

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
      updateJob({
        id,
        jobData,
        token,
      })
    );

    if (updateJob.fulfilled.match(result)) {
      setTimeout(() => {
        navigate(`/jobs/${id}`);
      }, 1000);
    }
  };

  // ===============================
  // LOADING INITIAL JOB
  // ===============================

  if (loading && !job) {
    return (
      <div style={styles.message}>
        <h2>Loading job...</h2>
      </div>
    );
  }

  // ===============================
  // JOB NOT FOUND
  // ===============================

  if (!loading && !job && error) {
    return (
      <div style={styles.message}>
        <div style={styles.error}>
          {error}
        </div>

        <button
          onClick={() => navigate("/jobs/my-jobs")}
          style={styles.backButton}
        >
          Back to My Jobs
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>Edit Job</h1>

        <p style={styles.subtitle}>
          Update your job posting.
        </p>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {success && (
          <div style={styles.success}>
            {success.message || "Job updated successfully!"}
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
              rows="6"
              required
            />
          </div>

          {/* REQUIREMENTS */}

          <div style={styles.field}>
            <label>Requirements</label>

            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              rows="6"
              placeholder={
                "Enter one requirement per line"
              }
            />
          </div>

          {/* RESPONSIBILITIES */}

          <div style={styles.field}>
            <label>Responsibilities</label>

            <textarea
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleChange}
              rows="6"
              placeholder={
                "Enter one responsibility per line"
              }
            />
          </div>

          {/* BUTTONS */}

          <div style={styles.buttons}>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.updateButton,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Updating..." : "Update Job"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/jobs/my-jobs")}
              style={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
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

  buttons: {
    display: "flex",
    gap: "10px",
    marginTop: "25px",
  },

  updateButton: {
    flex: 1,
    padding: "13px",
    border: "none",
    borderRadius: "6px",
    background: "#2563eb",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
  },

  cancelButton: {
    flex: 1,
    padding: "13px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    background: "#fff",
    fontSize: "16px",
    cursor: "pointer",
  },

  backButton: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "6px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },

  message: {
    textAlign: "center",
    padding: "50px 20px",
  },
};

export default EditJob;