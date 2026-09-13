import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Menu,
  Search,
  UserRound,
  X,
} from "lucide-react";

import {
  loginUser,
  clearAuthError,
  setAuthError,
  logout,
} from "../../store/authSlice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error } = useSelector(
    (state) => state.auth
  );

  const [selectedRole, setSelectedRole] = useState("candidate");
  const [showPassword, setShowPassword] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      dispatch(clearAuthError());
    }
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);

    if (error) {
      dispatch(clearAuthError());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      dispatch(
        setAuthError(
          "Please enter your email and password."
        )
      );
      return;
    }

    const result = await dispatch(
      loginUser({
        email,
        password,
      })
    );

    if (!loginUser.fulfilled.match(result)) {
      return;
    }

    const user = result.payload?.user;
    const userRole = String(user?.role || "")
      .trim()
      .toLowerCase();

    const selectedAccountRole = String(selectedRole)
      .trim()
      .toLowerCase();

    if (!userRole) {
      dispatch(logout());
      dispatch(
        setAuthError(
          "Your account does not have a valid role. Please contact support."
        )
      );
      return;
    }

    if (
      userRole !== "admin" &&
      userRole !== selectedAccountRole
    ) {
      dispatch(logout());

      dispatch(
        setAuthError(
          `This account is registered as ${userRole}. Please select ${userRole} to continue.`
        )
      );

      return;
    }

    if (userRole === "admin") {
      navigate("/admin/dashboard", {
        replace: true,
      });
      return;
    }

    if (userRole === "recruiter") {
      navigate("/recruiter/dashboard", {
        replace: true,
      });
      return;
    }

    if (userRole === "candidate") {
      navigate("/candidate/dashboard", {
        replace: true,
      });
      return;
    }

    dispatch(logout());
    dispatch(
      setAuthError(
        "Unable to determine your account type. Please contact support."
      )
    );
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const getErrorMessage = (value) => {
    if (typeof value === "string") {
      return value;
    }

    if (value?.message) {
      return value.message;
    }

    return "Something went wrong. Please try again.";
  };

  return (
    <div className="min-h-screen bg-white text-slate-950">
      {/* ================================================== */}
      {/* NAVBAR                                             */}
      {/* ================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-[70px] max-w-[1240px] items-center justify-between px-5 lg:px-8">
          {/* LOGO */}
          <Link
            to="/"
            className="flex items-center gap-2.5"
            onClick={closeMobileMenu}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
              <BriefcaseBusiness
                size={20}
                strokeWidth={2.2}
              />
            </div>

            <div>
              <div className="text-[20px] font-extrabold leading-none tracking-tight">
                Job<span className="text-blue-600">Portal</span>
              </div>

              <div className="mt-1 text-[9px] font-medium tracking-wide text-slate-400">
                FIND JOBS. BUILD FUTURE.
              </div>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              to="/jobs"
              className="text-[14px] font-medium text-slate-600 transition hover:text-blue-600"
            >
              Find Jobs
            </Link>

            <Link
              to="/companies"
              className="text-[14px] font-medium text-slate-600 transition hover:text-blue-600"
            >
              Companies
            </Link>

            <Link
              to="/about"
              className="text-[14px] font-medium text-slate-600 transition hover:text-blue-600"
            >
              About Us
            </Link>

            <Link
              to="/resources"
              className="text-[14px] font-medium text-slate-600 transition hover:text-blue-600"
            >
              Resources
            </Link>

            <Link
              to="/register"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-blue-700"
            >
              Register
            </Link>
          </nav>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(
                (previous) => !previous
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 md:hidden"
            aria-label={
              mobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X size={20} />
            ) : (
              <Menu size={20} />
            )}
          </button>
        </div>

        {/* MOBILE NAV */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-100 bg-white px-5 py-4 md:hidden">
            <div className="flex flex-col gap-1">
              <Link
                to="/jobs"
                onClick={closeMobileMenu}
                className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Find Jobs
              </Link>

              <Link
                to="/companies"
                onClick={closeMobileMenu}
                className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Companies
              </Link>

              <Link
                to="/about"
                onClick={closeMobileMenu}
                className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                About Us
              </Link>

              <Link
                to="/resources"
                onClick={closeMobileMenu}
                className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Resources
              </Link>

              <Link
                to="/register"
                onClick={closeMobileMenu}
                className="mt-2 rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Register
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ================================================== */}
      {/* MAIN                                               */}
      {/* ================================================== */}

      <main className="relative min-h-[calc(100vh-70px)] overflow-hidden bg-slate-50">
        {/* BACKGROUND DECORATION */}
        <div className="pointer-events-none absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-blue-100/50 blur-3xl" />

        <div className="pointer-events-none absolute right-[-160px] top-[-100px] h-[500px] w-[500px] rounded-full bg-indigo-100/50 blur-3xl" />

        <div className="relative mx-auto max-w-[1240px] px-5 py-8 sm:py-10 lg:px-8 lg:py-14">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_430px] xl:gap-20">
            {/* ================================================== */}
            {/* LEFT SIDE                                           */}
            {/* ================================================== */}

            <section className="hidden lg:block">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-xs font-semibold text-blue-600 shadow-sm">
                <Search size={14} />
                Your next opportunity starts here
              </div>

              <h1 className="max-w-[650px] text-[52px] font-extrabold leading-[1.05] tracking-[-2px] xl:text-[60px]">
                Find work that
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  moves you forward.
                </span>
              </h1>

              <p className="mt-6 max-w-[570px] text-[17px] leading-8 text-slate-600">
                Discover opportunities from trusted
                companies, connect with the right employers,
                and take the next step in your career.
              </p>

              <div className="mt-9 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Check
                      size={15}
                      strokeWidth={3}
                    />
                  </div>

                  <span className="text-sm font-medium text-slate-700">
                    Thousands of career opportunities
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <Check
                      size={15}
                      strokeWidth={3}
                    />
                  </div>

                  <span className="text-sm font-medium text-slate-700">
                    Connect with trusted companies
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                    <Check
                      size={15}
                      strokeWidth={3}
                    />
                  </div>

                  <span className="text-sm font-medium text-slate-700">
                    Track applications in one place
                  </span>
                </div>
              </div>

              <div className="mt-12 flex items-center gap-10 border-t border-slate-200 pt-7">
                <div>
                  <p className="text-2xl font-extrabold text-slate-900">
                    10K+
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Job opportunities
                  </p>
                </div>

                <div className="h-9 w-px bg-slate-200" />

                <div>
                  <p className="text-2xl font-extrabold text-slate-900">
                    2K+
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Companies
                  </p>
                </div>

                <div className="h-9 w-px bg-slate-200" />

                <div>
                  <p className="text-2xl font-extrabold text-slate-900">
                    5K+
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Professionals
                  </p>
                </div>
              </div>
            </section>

            {/* ================================================== */}
            {/* LOGIN PANEL                                         */}
            {/* ================================================== */}

            <section className="w-full">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
                {/* LOGIN HEADER */}
                <div className="mb-7">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <BriefcaseBusiness size={21} />
                  </div>

                  <h2 className="text-[27px] font-extrabold tracking-tight text-slate-950">
                    Sign in to JobPortal
                  </h2>

                  <p className="mt-1.5 text-sm text-slate-500">
                    Access your account and continue your
                    journey.
                  </p>
                </div>

                {/* ERROR */}
                {error && (
                  <div
                    role="alert"
                    className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-xs font-medium leading-5 text-red-600"
                  >
                    {getErrorMessage(error)}
                  </div>
                )}

                {/* ROLE SELECTOR */}
                <div className="mb-6">
                  <div className="mb-2.5 flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-800">
                      Login as
                    </label>

                    <span className="text-xs text-slate-400">
                      Select account type
                    </span>
                  </div>

                  <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
                    {/* CANDIDATE */}
                    <button
                      type="button"
                      onClick={() =>
                        handleRoleChange("candidate")
                      }
                      className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold transition ${
                        selectedRole === "candidate"
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                      aria-pressed={
                        selectedRole === "candidate"
                      }
                    >
                      <UserRound size={17} />
                      Candidate
                    </button>

                    {/* RECRUITER */}
                    <button
                      type="button"
                      onClick={() =>
                        handleRoleChange("recruiter")
                      }
                      className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold transition ${
                        selectedRole === "recruiter"
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                      aria-pressed={
                        selectedRole === "recruiter"
                      }
                    >
                      <Building2 size={17} />
                      Recruiter
                    </button>
                  </div>
                </div>

                {/* FORM */}
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  {/* EMAIL */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-slate-800"
                    >
                      Email address
                    </label>

                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="text-sm font-semibold text-slate-800"
                      >
                        Password
                      </label>

                      <Link
                        to="/forgot-password"
                        className="text-xs font-semibold text-blue-600 transition hover:text-blue-700"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <div className="relative">
                      <Lock
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="password"
                        name="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        required
                        className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (previous) => !previous
                          )
                        }
                        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                        aria-label={
                          showPassword
                            ? "Show password"
                            : "Hide password"
                        }
                      >
                        {showPassword ? (
                       <Eye size={18} />
                        ) : (
  <EyeOff size={18} />
                         )}
                      </button>
                    </div>
                  </div>

                  {/* SUBMIT */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex h-12 w-full items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {loading ? (
                      <>
                        <span className="mr-2.5 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight
                          size={18}
                          className="ml-2 transition-transform group-hover:translate-x-1"
                        />
                      </>
                    )}
                  </button>
                </form>

                {/* SIGNUP */}
                <div className="mt-7 border-t border-slate-100 pt-6">
                  <p className="text-center text-sm text-slate-500">
                    Don't have an account?
                  </p>

                  <div className="mt-3 flex flex-col items-center justify-center gap-2 text-sm sm:flex-row sm:gap-3">
                    <Link
                      to="/register"
                      className="font-semibold text-blue-600 transition hover:text-blue-700"
                    >
                      Create Candidate Account
                    </Link>

                    <span className="hidden text-slate-300 sm:inline">
                      |
                    </span>

                    <Link
                      to="/recruiter-register"
                      className="font-semibold text-blue-600 transition hover:text-blue-700"
                    >
                      Create Recruiter Account
                    </Link>
                  </div>
                </div>
              </div>

              {/* SECURITY NOTE */}
              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <Lock size={12} />
                Your account information is securely protected.
              </div>
            </section>
          </div>
        </div>

        {/* MOBILE INTRO */}
        <section className="mx-5 mb-8 rounded-xl border border-blue-100 bg-blue-50 p-5 lg:hidden">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
              <BriefcaseBusiness size={17} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Find your next opportunity
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Discover jobs, connect with companies and
                build your career.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ================================================== */}
      {/* FOOTER                                             */}
      {/* ================================================== */}

      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-3 px-5 py-5 text-xs text-slate-400 sm:flex-row lg:px-8">
          <p>
            © {new Date().getFullYear()} JobPortal. All
            rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <Link
              to="/privacy"
              className="transition hover:text-slate-600"
            >
              Privacy
            </Link>

            <Link
              to="/terms"
              className="transition hover:text-slate-600"
            >
              Terms
            </Link>

            <Link
              to="/contact"
              className="transition hover:text-slate-600"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;