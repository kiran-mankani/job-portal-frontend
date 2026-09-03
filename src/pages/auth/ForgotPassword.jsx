import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  forgotPassword,
  clearAuthError,
  clearAuthSuccess,
} from "../../store/authSlice";

function ForgotPassword() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, success } = useSelector(
    (state) => state.auth
  );

  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await dispatch(
      forgotPassword({ email })
    );

    if (forgotPassword.fulfilled.match(result)) {
      // Save email for OTP verification
      localStorage.setItem("resetEmail", email);

      setTimeout(() => {
        navigate("/verify-otp");
      }, 1500);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);

    if (error) {
      dispatch(clearAuthError());
    }

    if (success) {
      dispatch(clearAuthSuccess());
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>Forgot Password</h1>

        <p style={styles.subtitle}>
          Enter your email to receive an OTP
        </p>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {success && (
          <div style={styles.success}>
            {success.message ||
              "OTP sent successfully. Please check your email."}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
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
              ? "Sending OTP..."
              : "Send OTP"}
          </button>
        </form>

        <p style={styles.text}>
          Remember your password?{" "}
          <Link to="/login">Login</Link>
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
    marginBottom: "20px",
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
    marginTop: "20px",
  },
};

export default ForgotPassword;