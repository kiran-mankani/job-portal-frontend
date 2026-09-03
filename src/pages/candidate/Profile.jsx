import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateProfile,
  clearAuthError,
  clearAuthSuccess,
} from "../../store/authSlice";

function Profile() {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const loading = useSelector((state) => state.auth.loading);
  const authError = useSelector((state) => state.auth.error);
  const authSuccess = useSelector((state) => state.auth.success);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    skills: "",
  });

  useEffect(() => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
      skills: Array.isArray(user?.skills)
        ? user.skills.join(", ")
        : user?.skills || "",
    });
  }, [user]);

  useEffect(() => {
    if (authError) {
      const timer = setTimeout(() => {
        dispatch(clearAuthError());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [authError, dispatch]);

  useEffect(() => {
    if (authSuccess) {
      const timer = setTimeout(() => {
        dispatch(clearAuthSuccess());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [authSuccess, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      return;
    }

    const skillsArray = formData.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    dispatch(
      updateProfile({
        profileData: {
          name: formData.name,
          phone: formData.phone,
          bio: formData.bio,
          skills: skillsArray,
        },
        token,
      })
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>My Profile</h1>

        <p style={styles.subtitle}>
          View and update your profile information.
        </p>

        {authSuccess && (
          <div style={styles.success}>
            {typeof authSuccess === "string"
              ? authSuccess
              : authSuccess?.message ||
                "Profile updated successfully!"}
          </div>
        )}

        {authError && (
          <div style={styles.error}>
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* NAME */}
          <div style={styles.field}>
            <label style={styles.label}>Name</label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
              style={styles.input}
            />
          </div>

          {/* EMAIL */}
          <div style={styles.field}>
            <label style={styles.label}>Email</label>

            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              style={styles.inputDisabled}
            />

            <small style={styles.helpText}>
              Email cannot be changed from this page.
            </small>
          </div>

          {/* PHONE */}
          <div style={styles.field}>
            <label style={styles.label}>Phone</label>

            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              style={styles.input}
            />
          </div>

          {/* SKILLS */}
          <div style={styles.field}>
            <label style={styles.label}>Skills</label>

            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="React, Node.js, MongoDB"
              style={styles.input}
            />

            <small style={styles.helpText}>
              Separate skills with commas.
            </small>
          </div>

          {/* BIO */}
          <div style={styles.field}>
            <label style={styles.label}>Bio</label>

            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              rows="5"
              style={styles.textarea}
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
            {loading
              ? "Updating..."
              : "Update Profile"}
          </button>
        </form>
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
    background: "#f8fafc",
  },

  card: {
    width: "100%",
    maxWidth: "600px",
    padding: "30px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    background: "#fff",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  },

  subtitle: {
    color: "#666",
    marginBottom: "25px",
  },

  field: {
    marginBottom: "20px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
  },

  input: {
    width: "100%",
    padding: "11px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    boxSizing: "border-box",
    fontSize: "15px",
  },

  inputDisabled: {
    width: "100%",
    padding: "11px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    boxSizing: "border-box",
    fontSize: "15px",
    background: "#f1f5f9",
    color: "#666",
  },

  textarea: {
    width: "100%",
    padding: "11px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    boxSizing: "border-box",
    fontSize: "15px",
    resize: "vertical",
  },

  helpText: {
    display: "block",
    marginTop: "6px",
    color: "#777",
  },

  success: {
    padding: "10px",
    marginBottom: "20px",
    background: "#e5ffe9",
    color: "#087a21",
    borderRadius: "5px",
  },

  error: {
    padding: "10px",
    marginBottom: "20px",
    background: "#ffe5e5",
    color: "#c00",
    borderRadius: "5px",
  },

  button: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "6px",
    background: "#2563eb",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default Profile;