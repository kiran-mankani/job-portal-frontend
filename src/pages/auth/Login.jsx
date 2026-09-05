import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  BriefcaseBusiness,
  ArrowRight,
  UserPlus,
  Building2,
} from "lucide-react";

import {
  loginUser,
  clearAuthError,
} from "../../store/authSlice";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (error) {
      dispatch(clearAuthError());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await dispatch(loginUser(formData));

    if (loginUser.fulfilled.match(result)) {
      const user = result.payload.user;

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* ================= NAVBAR ================= */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center gap-2.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 transition group-hover:shadow-blue-500/40">
              <BriefcaseBusiness size={21} strokeWidth={2.2} />
            </div>

            <span className="text-[22px] font-bold tracking-tight text-slate-900">
              Job<span className="text-blue-600">Portal</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-3 sm:gap-7">
            <Link
              to="/jobs"
              className="hidden text-sm font-medium text-slate-600 transition hover:text-blue-600 sm:block"
            >
              Find Jobs
            </Link>

            <Link
              to="/login"
              className="text-sm font-semibold text-blue-600"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition hover:shadow-blue-500/35 hover:scale-[1.02]"
            >
              Register
            </Link>
          </nav>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4 py-8 sm:py-10">
        <div className="w-full max-w-[440px]">
          {/* ================= LOGIN CARD ================= */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm px-6 py-8 shadow-2xl shadow-blue-100/50 sm:px-8 sm:py-9 transition-all duration-300 hover:shadow-blue-200/40">

            {/* Heading */}
            <div className="mb-7 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
                <BriefcaseBusiness size={30} strokeWidth={2} />
              </div>

              <h1 className="text-[30px] font-bold tracking-tight text-slate-900 sm:text-[32px]">
                Welcome Back
              </h1>

              <p className="mt-1.5 text-sm leading-6 text-slate-500">
                Sign in to continue your journey
              </p>
            </div>

            {/* ================= ERROR ================= */}
            {error && (
              <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm font-medium leading-5 text-red-600 backdrop-blur-sm">
                <span className="text-red-400 mt-0.5">⚠️</span>
                {error}
              </div>
            )}

            {/* ================= FORM ================= */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Email Address
                </label>

                <div className="relative group">
                  <Mail
                    size={18}
                    strokeWidth={2}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition group-hover:text-blue-500"
                  />

                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white/50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-sm font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative group">
                  <Lock
                    size={18}
                    strokeWidth={2}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition group-hover:text-blue-500"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white/50 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* ================= SIGN IN BUTTON (ENHANCED) ================= */}
              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
              >
                <span className="flex items-center justify-center">
                  {loading ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight
                        size={17}
                        className="ml-2 transition group-hover:translate-x-1"
                      />
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* ================= DIVIDER (ENHANCED) ================= */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              <span className="bg-white px-2 text-xs font-semibold text-slate-400">
                OR
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            </div>

            {/* ================= CANDIDATE REGISTER (ENHANCED WITH ICON) ================= */}
            <div className="group rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-4 text-center transition hover:border-blue-200 hover:bg-blue-50/30">
              <p className="text-sm text-slate-600">
                Don't have an account?
              </p>

              <Link
                to="/register"
                className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition group-hover:text-blue-700"
              >
                <UserPlus size={16} className="transition group-hover:scale-110" />
                Register as Candidate
                <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* ================= RECRUITER REGISTER (ENHANCED WITH ICON) ================= */}
            <div className="mt-3 group rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-4 text-center transition hover:border-indigo-200 hover:bg-indigo-50/30">
              <p className="text-sm text-slate-600">
                Are you a recruiter?
              </p>

              <Link
                to="/recruiter-register"
                className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition group-hover:text-indigo-700"
              >
                <Building2 size={16} className="transition group-hover:scale-110" />
                Register as Recruiter
                <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-6 pb-4 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} JobPortal. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}

export default Login;