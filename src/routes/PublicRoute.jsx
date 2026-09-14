import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// ==========================================================
// PUBLIC ROUTE
//
// Guards pages that only make sense for a signed-out visitor
// (login, register, admin login, the "/" landing page). If a
// valid session already exists, the visitor is sent straight
// to their dashboard instead of being shown the login form
// again — e.g. typing "/" in the address bar while already
// logged in should not land back on the login screen.
// ==========================================================

function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function PublicRoute({ children }) {
  const { user, token } = useSelector((state) => state.auth || {});

  const authToken = token || localStorage.getItem("token") || null;
  const authUser = user || getStoredUser();

  if (authToken && authUser) {
    const role = String(authUser.role || "").trim().toLowerCase();

    if (role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    if (role === "recruiter") {
      return <Navigate to="/recruiter/dashboard" replace />;
    }

    if (role === "candidate") {
      return <Navigate to="/candidate/dashboard" replace />;
    }
  }

  return children;
}

export default PublicRoute;
