import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  registerRecruiter,
  clearAuthError,
  clearAuthSuccess,
} from "../../store/authSlice";

function RecruiterRegister() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, success } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (error) {
      dispatch(clearAuthError());
    }

    if (success) {
      dispatch(clearAuthSuccess());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await dispatch(
      registerRecruiter(formData)
    );

    if (registerRecruiter.fulfilled.match(result)) {
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>Recruiter Registration</h1>

        <p style={styles.subtitle}>
          Create your recruiter account
        </p>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {success && (
          <div style={styles.success}>
            {success.message ||
              "Recruiter registered successfully!"}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label>Full Name</label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div style={styles.field}>
            <label>Company Name</label>

            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Enter company name"
              required
            />
          </div>

          <div style={styles.field}>
            <label>Email</label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div style={styles.field}>
            <label>Password</label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              minLength="8"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? "Creating Account..."
              : "Register"}
          </button>
        </form>

        <p style={styles.text}>
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>

        <p style={styles.text}>
          Register as candidate?{" "}
          <Link to="/register">
            Candidate Registration
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },

  card: {
    width: "100%",
    maxWidth: "450px",
    padding: "30px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    background: "#fff",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
  },

  subtitle: {
    color: "#666",
    marginBottom: "25px",
  },

  field: {
    marginBottom: "18px",
  },

  error: {
    padding: "10px",
    marginBottom: "15px",
    background: "#ffe5e5",
    color: "#c00",
    borderRadius: "5px",
  },

  success: {
    padding: "10px",
    marginBottom: "15px",
    background: "#e5ffe9",
    color: "#087a21",
    borderRadius: "5px",
  },

  button: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    background: "#2563eb",
    color: "#fff",
    fontSize: "16px",
  },

  text: {
    marginTop: "15px",
  },
};

export default RecruiterRegister;