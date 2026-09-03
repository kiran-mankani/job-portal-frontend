import { BrowserRouter, Routes, Route } from "react-router-dom";

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

        {/* ==================== AUTH ==================== */}

        <Route path="/" element={<Login />} />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

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


        {/* ==================== CANDIDATE ==================== */}

        <Route
          path="/candidate/dashboard"
          element={<CandidateDashboard />}
        />

        <Route
          path="/candidate/profile"
          element={<Profile />}
        />

        <Route
          path="/candidate/applications"
          element={<MyApplications />}
        />

        <Route
          path="/candidate/applications/:id"
          element={<ApplicationDetails />}
        />

        <Route
          path="/candidate/interviews"
          element={<MyInterviews />}
        />


        {/* ==================== JOBS ==================== */}

        <Route
          path="/jobs"
          element={<JobList />}
        />

        <Route
          path="/jobs/:id"
          element={<JobDetails />}
        />

        <Route
          path="/jobs/:id/apply"
          element={<ApplyJob />}
        />

        <Route
          path="/jobs/post"
          element={<PostJob />}
        />

        <Route
          path="/jobs/:id/edit"
          element={<EditJob />}
        />

        <Route
          path="/jobs/my-jobs"
          element={<MyJobs />}
        />


        {/* ==================== RECRUITER ==================== */}

        <Route
          path="/recruiter/dashboard"
          element={<RecruiterDashboard />}
        />

        <Route
          path="/recruiter/applications"
          element={<RecruiterApplications />}
        />

        <Route
          path="/recruiter/interviews/schedule"
          element={<ScheduleInterview />}
        />

        <Route
          path="/recruiter/interviews"
          element={<RecruiterInterviews />}
        />


        {/* ==================== ADMIN ==================== */}

        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/users"
          element={<ManageUsers />}
        />

        <Route
          path="/admin/jobs"
          element={<ManageJobs />}
        />

        <Route
          path="/admin/applications"
          element={<ManageApplications />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;