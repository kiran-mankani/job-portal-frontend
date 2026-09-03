import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoute({ children, allowedRoles }) {
  const {
    user,
    token,
    loading,
  } = useSelector((state) => state.auth);

  // ==========================================
  // AUTH LOADING
  // ==========================================

  if (loading) {
    return <h2>Loading...</h2>;
  }

  // ==========================================
  // NOT LOGGED IN
  // ==========================================

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // ==========================================
  // ROLE CHECK
  // ==========================================

  if (
    allowedRoles &&
    !allowedRoles.includes(user?.role)
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  // ==========================================
  // AUTHORIZED
  // ==========================================

  return children;
}

export default ProtectedRoute;