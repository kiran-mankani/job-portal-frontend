import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getSingleJob,
  clearJobError,
  clearSelectedJob,
} from "../../store/jobSlice";

import { apiRequest } from "../../services/api";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { job, loading, error } = useSelector((state) => state.job);

  const { token: reduxToken } = useSelector((state) => state.auth);

  const token = reduxToken || localStorage.getItem("token") || null;

  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // ======================================================
  // GET JOB
  // ======================================================

  useEffect(() => {
    if (!id) return;

    dispatch(getSingleJob(id));

    return () => {
      dispatch(clearSelectedJob());
      dispatch(clearJobError());
    };
  }, [dispatch, id]);

  // ======================================================
  // CHECK IF JOB IS ALREADY SAVED
  // ======================================================

  useEffect(() => {
    let cancelled = false;

    const checkSavedJob = async () => {
      if (!token || !job?._id) {
        if (!cancelled) {
          setIsSaved(false);
        }
        return;
      }

      try {
        const response = await apiRequest(
          "/auth/me",
          "GET",
          null,
          token
        );

        const user =
          response?.user ||
          response?.data?.user ||
          response?.data ||
          response;

        const savedJobs = Array.isArray(user?.savedJobs)
          ? user.savedJobs
          : [];

        const alreadySaved = savedJobs.some(
          (savedJob) =>
            String(savedJob?._id || savedJob) === String(job._id)
        );

        if (!cancelled) {
          setIsSaved(alreadySaved);
        }
      } catch (err) {
        if (!cancelled) {
          setIsSaved(false);
        }

        console.error("Check Saved Job Error:", err);
      }
    };

    checkSavedJob();

    return () => {
      cancelled = true;
    };
  }, [job, token]);

  // ======================================================
  // SAVE / UNSAVE JOB
  // ======================================================

  const handleSaveJob = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (!job?._id || saving) {
      return;
    }

    try {
      setSaving(true);
      setSaveError("");

      if (isSaved) {
        await apiRequest(
          `/jobs/${job._id}/save`,
          "DELETE",
          null,
          token
        );

        setIsSaved(false);
      } else {
        await apiRequest(
          `/jobs/${job._id}/save`,
          "POST",
          null,
          token
        );

        setIsSaved(true);
      }
    } catch (err) {
      console.error("Save Job Error:", err);

      setSaveError(
        err?.message || "Unable to update saved job."
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // SALARY DISPLAY
  // ======================================================

  const getSalaryText = () => {
    const minSalary = job?.minSalary;
    const maxSalary = job?.maxSalary;

    if (
      minSalary !== undefined &&
      minSalary !== null &&
      maxSalary !== undefined &&
      maxSalary !== null
    ) {
      return `${minSalary} - ${maxSalary}`;
    }

    if (minSalary !== undefined && minSalary !== null) {
      return `${minSalary}+`;
    }

    if (maxSalary !== undefined && maxSalary !== null) {
      return `Up to ${maxSalary}`;
    }

    if (job?.salary) {
      return String(job.salary);
    }

    return "";
  };

  const salaryText = getSalaryText();

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div style={styles.message}>
        <h2>Loading job...</h2>
      </div>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>

        <button
          onClick={() => navigate("/jobs")}
          style={styles.backButton}
          type="button"
        >
          Back to Jobs
        </button>
      </div>
    );
  }

  // ======================================================
  // JOB NOT FOUND
  // ======================================================

  if (!job) {
    return (
      <div style={styles.message}>
        <h2>Job not found</h2>

        <button
          onClick={() => navigate("/jobs")}
          style={styles.backButton}
          type="button"
        >
          Back to Jobs
        </button>
      </div>
    );
  }

  // ======================================================
  // JOB DETAILS
  // ======================================================

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Back */}
        <Link to="/jobs" style={styles.backLink}>
          ← Back to Jobs
        </Link>

        {/* ==================================================
            JOB HEADER
        ================================================== */}

        <div style={styles.card}>
          <div style={styles.headerTop}>
            <div>
              <h1 style={styles.title}>{job.title}</h1>

              <p style={styles.company}>
                {job.company ||
                  job.companyName ||
                  job.recruiter?.companyName ||
                  "Company"}
              </p>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveJob}
              disabled={saving}
              style={{
                ...styles.saveButton,
                ...(isSaved ? styles.savedButton : {}),
                ...(saving ? styles.disabledButton : {}),
              }}
              type="button"
            >
              {saving
                ? "Saving..."
                : isSaved
                ? "🔖 Saved"
                : "🔖 Save Job"}
            </button>
          </div>

          {/* Job Info */}
          <div style={styles.infoRow}>
            <span>
              📍 {job.location || "Location not specified"}
            </span>

            <span>
              💼 {job.jobType || job.type || "Not specified"}
            </span>

            {job.category && (
              <span>📂 {job.category}</span>
            )}

            {job.experienceLevel && (
              <span>🎯 {job.experienceLevel}</span>
            )}

            {salaryText && (
              <span>💰 {salaryText}</span>
            )}
          </div>

          {/* Save Error */}
          {saveError && (
            <div style={styles.saveError}>{saveError}</div>
          )}
        </div>

        {/* ==================================================
            DESCRIPTION
        ================================================== */}

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>
            Job Description
          </h2>

          <p style={styles.description}>
            {job.description || "No description available."}
          </p>
        </div>

        {/* ==================================================
            REQUIREMENTS
        ================================================== */}

        {job.requirements &&
          ((Array.isArray(job.requirements) &&
            job.requirements.length > 0) ||
            (!Array.isArray(job.requirements) &&
              String(job.requirements).trim())) && (
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>
                Requirements
              </h2>

              {Array.isArray(job.requirements) ? (
                <ul style={styles.list}>
                  {job.requirements.map(
                    (requirement, index) => (
                      <li key={`${requirement}-${index}`}>
                        {requirement}
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p style={styles.description}>
                  {job.requirements}
                </p>
              )}
            </div>
          )}

        {/* ==================================================
            SKILLS
        ================================================== */}

        {Array.isArray(job.skills) &&
          job.skills.length > 0 && (
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>
                Required Skills
              </h2>

              <div style={styles.skills}>
                {job.skills.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    style={styles.skill}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

        {/* ==================================================
            RESPONSIBILITIES
        ================================================== */}

        {job.responsibilities &&
          ((Array.isArray(job.responsibilities) &&
            job.responsibilities.length > 0) ||
            (!Array.isArray(job.responsibilities) &&
              String(job.responsibilities).trim())) && (
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>
                Responsibilities
              </h2>

              {Array.isArray(job.responsibilities) ? (
                <ul style={styles.list}>
                  {job.responsibilities.map(
                    (responsibility, index) => (
                      <li
                        key={`${responsibility}-${index}`}
                      >
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

        {/* ==================================================
            APPLY
        ================================================== */}

        <div style={styles.applySection}>
          <Link
            to={`/jobs/${job._id}/apply`}
            style={styles.applyButton}
          >
            Apply for this Job
          </Link>
        </div>
      </div>
    </div>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
  },

  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "30px 20px 60px",
  },

  card: {
    padding: "25px",
    marginBottom: "20px",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    background: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },

  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    flexWrap: "wrap",
  },

  title: {
    margin: "0 0 8px",
    fontSize: "30px",
    color: "#0f172a",
  },

  company: {
    fontSize: "18px",
    color: "#64748b",
    margin: 0,
  },

  infoRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "22px",
    color: "#475569",
    fontSize: "14px",
  },

  saveButton: {
    padding: "11px 18px",
    border: "1px solid #2563eb",
    borderRadius: "8px",
    background: "#fff",
    color: "#2563eb",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  savedButton: {
    background: "#eff6ff",
    color: "#1d4ed8",
  },

  disabledButton: {
    opacity: 0.7,
    cursor: "not-allowed",
  },

  saveError: {
    marginTop: "15px",
    padding: "10px 12px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "7px",
    color: "#dc2626",
    fontSize: "14px",
  },

  sectionTitle: {
    marginTop: 0,
    marginBottom: "15px",
    color: "#0f172a",
    fontSize: "21px",
  },

  description: {
    lineHeight: "1.8",
    color: "#475569",
    whiteSpace: "pre-line",
    margin: 0,
  },

  list: {
    paddingLeft: "22px",
    lineHeight: "1.9",
    color: "#475569",
  },

  skills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },

  skill: {
    padding: "7px 12px",
    borderRadius: "20px",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontSize: "14px",
    fontWeight: "500",
  },

  backLink: {
    display: "inline-block",
    marginBottom: "20px",
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "500",
  },

  applySection: {
    textAlign: "center",
    marginTop: "30px",
  },

  applyButton: {
    display: "inline-block",
    padding: "14px 30px",
    background: "#2563eb",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
  },

  backButton: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "7px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },

  error: {
    padding: "15px",
    marginBottom: "20px",
    background: "#fee2e2",
    color: "#b91c1c",
    borderRadius: "7px",
  },

  message: {
    textAlign: "center",
    padding: "80px 20px",
  },
};

export default JobDetails;