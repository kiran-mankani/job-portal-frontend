import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  applyForJob,
  uploadCV,
  clearApplicationError,
  clearApplicationSuccess,
} from "../../store/applicationSlice";

function ApplyJob() {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { token } = useSelector((state) => state.auth);

  const { loading, error, success } = useSelector(
    (state) => state.applications
  );

  const [file, setFile] = useState(null);
  const [applicationId, setApplicationId] = useState(null);

  // ===============================
  // FILE CHANGE
  // ===============================

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // CV file validation
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setFile(null);

      dispatch(
        clearApplicationError()
      );

      alert("Please select a PDF or Word document.");
      return;
    }

    // 5 MB limit
    if (selectedFile.size > 5 * 1024 * 1024) {
      setFile(null);

      alert("CV file size must be less than 5 MB.");
      return;
    }

    setFile(selectedFile);

    if (error) {
      dispatch(clearApplicationError());
    }

    if (success) {
      dispatch(clearApplicationSuccess());
    }
  };

  // ===============================
  // SUBMIT
  // ===============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Please login before applying.");
      navigate("/login");
      return;
    }

    if (!jobId) {
      alert("Job ID is missing.");
      return;
    }

    // ===============================
    // APPLY
    // ===============================

    const applicationResult = await dispatch(
      applyForJob({
        jobId,
        token,
      })
    );

    if (!applyForJob.fulfilled.match(applicationResult)) {
      return;
    }

    const createdApplication =
      applicationResult.payload?.application ||
      applicationResult.payload?.data;

    const newApplicationId =
      createdApplication?._id ||
      createdApplication?.id;

    setApplicationId(newApplicationId);

    // ===============================
    // UPLOAD CV
    // ===============================

    if (file && newApplicationId) {
      const cvResult = await dispatch(
        uploadCV({
          applicationId: newApplicationId,
          file,
          token,
        })
      );

      if (uploadCV.fulfilled.match(cvResult)) {
        setTimeout(() => {
          navigate("/candidate/applications");
        }, 1200);
      }

      return;
    }

    // If CV is optional
    setTimeout(() => {
      navigate("/candidate/applications");
    }, 1200);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <Link
          to={`/jobs/${jobId}`}
          style={styles.backLink}
        >
          ← Back to Job
        </Link>

        <h1>Apply for Job</h1>

        <p style={styles.subtitle}>
          Submit your application and upload your CV.
        </p>

        {/* ERROR */}

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div style={styles.success}>
            {success.message ||
              "Application submitted successfully!"}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* CV */}

          <div style={styles.field}>
            <label>
              Upload CV
            </label>
            <br/>

            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />

            <p style={styles.helpText}>
              Accepted formats: PDF, DOC, DOCX.
              Maximum size: 5 MB.
            </p>

            {file && (
              <p style={styles.fileName}>
                Selected: {file.name}
              </p>
            )}
          </div>

          {/* APPLICATION BUTTON */}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? "Submitting..."
              : "Submit Application"}
          </button>
        </form>

        {applicationId && (
          <p style={styles.applicationInfo}>
            Application created successfully.
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "40px 20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  },

  card: {
    width: "100%",
    maxWidth: "600px",
    padding: "30px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    background: "#fff",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
  },

  backLink: {
    display: "inline-block",
    marginBottom: "20px",
    color: "#2563eb",
    textDecoration: "none",
  },

  subtitle: {
    color: "#666",
    marginBottom: "25px",
  },

  field: {
    marginBottom: "25px",
  },

  helpText: {
    marginTop: "8px",
    color: "#777",
    fontSize: "13px",
  },

  fileName: {
    marginTop: "10px",
    color: "#087a21",
    fontWeight: "500",
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

  applicationInfo: {
    marginTop: "15px",
    color: "#087a21",
  },
};

export default ApplyJob;