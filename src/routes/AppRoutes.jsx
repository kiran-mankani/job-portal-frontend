import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Protected Route
import ProtectedRoute from "./ProtectedRoute";

// Auth
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import RecruiterRegister from "../pages/auth/RecruiterRegister";
import ForgotPassword from "../pages/auth/ForgotPassword";
import VerifyOTP from "../pages/auth/VerifyOTP";
import ResetPassword from "../pages/auth/ResetPassword";

// Layouts
import CandidateLayout from "../pages/candidate/CandidateLayout";
import RecruiterLayout from "../pages/recruiter/RecruiterLayout";

// Candidate
import CandidateDashboard from "../pages/candidate/CandidateDashboard";
import Profile from "../pages/candidate/Profile";
import MyApplications from "../pages/candidate/MyApplications";
import ApplicationDetails from "../pages/candidate/ApplicationDetails";
import MyInterviews from "../pages/candidate/MyInterviews";
import MyCV from "../pages/candidate/MyCV";
import Messages from "../pages/candidate/Messages";
import Settings from "../pages/candidate/Settings";
import SavedJobs from "../pages/candidate/SavedJobs";
import Notifications from "../pages/candidate/Notifications";

// Jobs
import JobList from "../pages/jobs/JobList";
import JobDetails from "../pages/jobs/JobDetails";
import ApplyJob from "../pages/jobs/ApplyJob";
import PostJob from "../pages/jobs/PostJob";
import EditJob from "../pages/jobs/EditJob";
import MyJobs from "../pages/jobs/MyJobs";

// Recruiter
import RecruiterDashboard from "../pages/recruiter/RecruiterDashboard";
import RecruiterProfile from "../pages/recruiter/RecruiterProfile";
import RecruiterApplications from "../pages/recruiter/RecruiterApplications";
import ScheduleInterview from "../pages/recruiter/ScheduleInterview";
import RecruiterInterview from "../pages/recruiter/RecruiterInterview";
import RecruiterMessages from "../pages/recruiter/RecruiterMessages";
import RecruiterReports from "../pages/recruiter/RecruiterReports";
import RecruiterSettings from "../pages/recruiter/RecruiterSettings";

// Admin
import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageUsers from "../pages/admin/ManageUsers";
import ManageJobs from "../pages/admin/ManageJobs";
import ManageApplications from "../pages/admin/ManageApplications";
import AdminLogin from "../pages/admin/AdminLogin";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =====================================================
            AUTH / PUBLIC (no layout)
        ===================================================== */}

        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recruiter-register" element={<RecruiterRegister />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* =====================================================
            CANDIDATE LAYOUT
            — public jobs, candidate pages, apply for job
        ===================================================== */}

        <Route element={<CandidateLayout />}>
          {/* PUBLIC JOBS */}
          <Route path="/jobs" element={<JobList />} />
          <Route path="/jobs/:id" element={<JobDetails />} />

          {/* CANDIDATE PAGES */}
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
              <ProtectedRoute
                allowedRoles={["candidate", "recruiter", "admin"]}
              >
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
            path="/candidate/cv"
            element={
              <ProtectedRoute allowedRoles={["candidate"]}>
                <MyCV />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/resume"
            element={
              <ProtectedRoute allowedRoles={["candidate"]}>
                <MyCV />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/messages"
            element={
              <ProtectedRoute allowedRoles={["candidate"]}>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/settings"
            element={
              <ProtectedRoute allowedRoles={["candidate"]}>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/saved-jobs"
            element={
              <ProtectedRoute allowedRoles={["candidate"]}>
                <SavedJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/notifications"
            element={
              <ProtectedRoute allowedRoles={["candidate"]}>
                <Notifications />
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
        </Route>

        {/* =====================================================
            RECRUITER LAYOUT
            — recruiter pages, job management
        ===================================================== */}

        <Route element={<RecruiterLayout />}>
          {/* RECRUITER DASHBOARD + PAGES */}
          <Route
            path="/recruiter/dashboard"
            element={
              <ProtectedRoute allowedRoles={["recruiter"]}>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/profile"
            element={
              <ProtectedRoute allowedRoles={["recruiter"]}>
                <RecruiterProfile />
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
                <RecruiterInterview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/messages"
            element={
              <ProtectedRoute allowedRoles={["recruiter"]}>
                <RecruiterMessages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/reports"
            element={
              <ProtectedRoute allowedRoles={["recruiter"]}>
                <RecruiterReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/settings"
            element={
              <ProtectedRoute allowedRoles={["recruiter"]}>
                <RecruiterSettings />
              </ProtectedRoute>
            }
          />

          {/* RECRUITER JOB MANAGEMENT */}
          <Route
            path="/jobs/post"
            element={
              <ProtectedRoute allowedRoles={["recruiter"]}>
                <PostJob />
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
          <Route
            path="/jobs/my-jobs"
            element={
              <ProtectedRoute allowedRoles={["recruiter"]}>
                <MyJobs />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* =====================================================
            ADMIN (no layout — could add AdminLayout later)
        ===================================================== */}

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

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;