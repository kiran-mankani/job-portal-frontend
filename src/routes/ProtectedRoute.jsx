import { BrowserRouter, Routes, Route } from "react-router-dom";

// Protected Route
import ProtectedRoute from "./ProtectedRoute";

// Auth
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import RecruiterRegister from "../pages/auth/RecruiterRegister";
import ForgotPassword from "../pages/auth/ForgotPassword";
import VerifyOTP from "../pages/auth/VerifyOTP";
import ResetPassword from "../pages/auth/ResetPassword";

// Candidate
import CandidateDashboard from "../pages/candidate/CandidateDashboard";
import Profile from "../pages/candidate/Profile";
import MyApplications from "../pages/candidate/MyApplications";
import ApplicationDetails from "../pages/candidate/ApplicationDetails";
import MyInterviews from "../pages/candidate/MyInterviews";

// Jobs
import JobList from "../pages/jobs/JobList";
import JobDetails from "../pages/jobs/JobDetails";
import ApplyJob from "../pages/jobs/ApplyJob";
import PostJob from "../pages/jobs/PostJob";
import EditJob from "../pages/jobs/EditJob";
import MyJobs from "../pages/jobs/MyJobs";

// Recruiter
import RecruiterDashboard from "../pages/recruiter/RecruiterDashboard";
import RecruiterApplications from "../pages/recruiter/RecruiterApplications";
import ScheduleInterview from "../pages/recruiter/ScheduleInterview";
import RecruiterInterviews from "../pages/recruiter/RecruiterInterviews";

// Admin
import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageUsers from "../pages/admin/ManageUsers";
import ManageJobs from "../pages/admin/ManageJobs";
import ManageApplications from "../pages/admin/ManageApplications";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ==================== PUBLIC ==================== */}

        <Route path="/" element={<Login />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/recruiter-register"
          element={<RecruiterRegister />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/verify-otp"
          element={<VerifyOTP />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* ==================== PUBLIC JOBS ==================== */}

        <Route
          path="/jobs"
          element={<JobList />}
        />

        <Route
          path="/jobs/:id"
          element={<JobDetails />}
        />

        {/* ==================== CANDIDATE ==================== */}

        <Route
          path="/candidate/dashboard"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <CandidateDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/candidate/profile"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/candidate/applications"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <MyApplications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/candidate/applications/:id"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <ApplicationDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/candidate/interviews"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <MyInterviews />
            </ProtectedRoute>
          }
        />

        <Route
          path="/jobs/:id/apply"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <ApplyJob />
            </ProtectedRoute>
          }
        />

        {/* ==================== RECRUITER ==================== */}

        <Route
          path="/recruiter/dashboard"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <RecruiterDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/applications"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <RecruiterApplications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/interviews/schedule"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <ScheduleInterview />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/interviews"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <RecruiterInterviews />
            </ProtectedRoute>
          }
        />

        <Route
          path="/jobs/post"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <PostJob />
            </ProtectedRoute>
          }
        />

        <Route
          path="/jobs/my-jobs"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <MyJobs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/jobs/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <EditJob />
            </ProtectedRoute>
          }
        />

        {/* ==================== ADMIN ==================== */}

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageUsers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/jobs"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageJobs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/applications"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageApplications />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;