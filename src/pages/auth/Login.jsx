import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  loginUser,
  clearAuthError,
} from "../../store/authSlice";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Old error clear
    if (error) {
      dispatch(clearAuthError());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await dispatch(loginUser(formData));

    if (loginUser.fulfilled.match(result)) {
      const user = result.payload.user;

      // Redirect according to role
      if (user?.role === "recruiter") {
        navigate("/recruiter/dashboard");
      } else if (user?.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/candidate/dashboard");
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>Login</h1>

        <p style={styles.subtitle}>
          Login to your Job Portal account
        </p>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
              placeholder="Enter your password"
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
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div style={styles.links}>
          <Link to="/forgot-password">
            Forgot Password?
          </Link>
        </div>

        <p>
          Don't have an account?{" "}
          <Link to="/register">
            Register as Candidate
          </Link>
        </p>

        <p>
          Are you a recruiter?{" "}
          <Link to="/recruiter-register">
            Register as Recruiter
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
    background: "#f5f7fb",
  },

  card: {
    width: "100%",
    maxWidth: "420px",
    padding: "30px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    background: "#fff",
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

  links: {
    margin: "15px 0",
  },
};

export default Login;