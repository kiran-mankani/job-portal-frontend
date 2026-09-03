import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function VerifyOTP() {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const email = localStorage.getItem("resetEmail");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    if (!email) {
      setError(
        "Email not found. Please request a new OTP."
      );
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid OTP"
        );
      }

      setSuccess(
        data.message ||
          "OTP verified successfully!"
      );

      // Save reset token if backend returns one
      if (data.resetToken) {
        localStorage.setItem(
          "resetToken",
          data.resetToken
        );
      }

      setTimeout(() => {
        navigate("/reset-password");
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>Verify OTP</h1>

        <p style={styles.subtitle}>
          Enter the OTP sent to your email.
        </p>

        {email && (
          <p style={styles.email}>
            Email: <strong>{email}</strong>
          </p>
        )}

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {success && (
          <div style={styles.success}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label>OTP</label>

            <input
              type="text"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value)
              }
              placeholder="Enter OTP"
              maxLength="6"
              inputMode="numeric"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading
              ? "Verifying..."
              : "Verify OTP"}
          </button>
        </form>

        <p style={styles.text}>
          Didn't receive OTP?{" "}
          <Link to="/forgot-password">
            Send Again
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
    maxWidth: "420px",
    padding: "30px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    background: "#fff",
  },

  subtitle: {
    color: "#666",
    marginBottom: "20px",
  },

  email: {
    marginBottom: "20px",
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
    background: "#2563eb",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
  },

  text: {
    marginTop: "20px",
  },
};

export default VerifyOTP;