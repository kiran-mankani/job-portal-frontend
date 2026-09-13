import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();

  const { user, token } = useSelector((state) => state.auth);

  const storedToken = localStorage.getItem("token");
  const authToken = token || storedToken || null;

  // ==========================================
  // NOT AUTHENTICATED
  // ==========================================

  if (!authToken || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  // ==========================================
  // ROLE CHECK
  // ==========================================

  const normalizedAllowedRoles = Array.isArray(allowedRoles)
    ? allowedRoles
        .filter(Boolean)
        .map((role) =>
          String(role).trim().toLowerCase()
        )
    : [];

  if (normalizedAllowedRoles.length > 0) {
    const userRole = String(user.role || "")
      .trim()
      .toLowerCase();

    const hasPermission =
      normalizedAllowedRoles.includes(userRole);

    if (!hasPermission) {
      // Admin
      if (userRole === "admin") {
        return (
          <Navigate
            to="/admin/dashboard"
            replace
          />
        );
      }

      // Recruiter
      if (userRole === "recruiter") {
        return (
          <Navigate
            to="/recruiter/dashboard"
            replace
          />
        );
      }

      // Candidate
      if (userRole === "candidate") {
        return (
          <Navigate
            to="/candidate/dashboard"
            replace
          />
        );
      }

      return (
        <Navigate
          to="/login"
          replace
        />
      );
    }
  }

  // ==========================================
  // AUTHORIZED
  // ==========================================

  return children;
}

export default ProtectedRoute;