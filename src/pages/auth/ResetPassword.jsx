import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  BriefcaseBusiness,
} from "lucide-react";

import {
  resetPassword,
  clearAuthError,
  clearAuthSuccess,
} from "../../store/authSlice";

function ResetPassword() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, success } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const email = (
    localStorage.getItem("resetEmail") || ""
  )
    .trim()
    .toLowerCase();

  const otp = (
    localStorage.getItem("resetOTP") || ""
  ).trim();

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
      dispatch(clearAuthSuccess());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      dispatch(clearAuthError());
    }

    if (success) {
      dispatch(clearAuthSuccess());
    }
  };

  const passwordHasLetter = /[A-Za-z]/.test(
    formData.password
  );

  const passwordHasNumber = /\d/.test(
    formData.password
  );

  const passwordIsValid =
    formData.password.length >= 8 &&
    passwordHasLetter &&
    passwordHasNumber;

  const passwordsMatch =
    formData.password === formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !otp) {
      return;
    }

    if (!passwordIsValid) {
      return;
    }

    if (!passwordsMatch) {
      return;
    }

    const result = await dispatch(
      resetPassword({
        email,
        otp,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      })
    );

    if (resetPassword.fulfilled.match(result)) {
      localStorage.removeItem("resetEmail");
      localStorage.removeItem("resetOTP");
      localStorage.removeItem("resetToken");

      navigate("/login", {
        replace: true,
        state: {
          message:
            result.payload?.message ||
            "Password reset successfully. Please login.",
        },
      });
    }
  };

  const getMessage = (value, fallback) => {
    if (typeof value === "string") {
      return value;
    }

    if (value?.message) {
      return value.message;
    }

    return fallback;
  };

  if (!email || !otp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-10 sm:px-6">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">
          <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl shadow-slate-200/60 sm:p-8">
            <div className="mb-6 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <Lock
                  size={27}
                  strokeWidth={2}
                />
              </div>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Reset Password
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Your password reset session is missing or
              has expired. Please request a new OTP.
            </p>

            <Link
              to="/forgot-password"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              Request New OTP
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-10 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
          {/* Logo */}
          <div className="mb-7 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <BriefcaseBusiness
                size={27}
                strokeWidth={2}
              />
            </div>
          </div>

          {/* Heading */}
          <div className="mb-7 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Reset Password
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Create a new secure password for your account.
            </p>
          </div>

          {/* Email */}
          <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-center">
            <p className="text-xs font-medium text-slate-500">
              Resetting password for
            </p>

            <p className="mt-1 break-all text-sm font-semibold text-blue-700">
              {email}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              {getMessage(
                error,
                "Password reset failed. Please try again."
              )}
            </div>
          )}

          {/* Success */}
          {success && (
            <div
              role="status"
              className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
            >
              {getMessage(
                success,
                "Password reset successfully!"
              )}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* New Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                New Password{" "}
                <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <Lock
                  size={19}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  aria-describedby="password-help"
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (previous) => !previous
                    )
                  }
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
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

              <p
                id="password-help"
                className="mt-2 text-xs leading-5 text-slate-400"
              >
                At least 8 characters with at least one
                letter and one number.
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Confirm Password{" "}
                <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <Lock
                  size={19}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  aria-describedby="confirm-password-help"
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (previous) => !previous
                    )
                  }
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>

              {formData.confirmPassword &&
                !passwordsMatch && (
                  <p
                    id="confirm-password-help"
                    className="mt-2 text-xs font-medium text-red-500"
                  >
                    Passwords do not match.
                  </p>
                )}
            </div>

            {/* Password Requirements */}
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="mb-2 text-xs font-semibold text-slate-600">
                Password requirements
              </p>

              <div className="space-y-1">
                <p
                  className={`text-xs ${
                    formData.password.length >= 8
                      ? "text-emerald-600"
                      : "text-slate-400"
                  }`}
                >
                  {formData.password.length >= 8
                    ? "✓"
                    : "•"}{" "}
                  At least 8 characters
                </p>

                <p
                  className={`text-xs ${
                    passwordHasLetter
                      ? "text-emerald-600"
                      : "text-slate-400"
                  }`}
                >
                  {passwordHasLetter ? "✓" : "•"}{" "}
                  At least one letter
                </p>

                <p
                  className={`text-xs ${
                    passwordHasNumber
                      ? "text-emerald-600"
                      : "text-slate-400"
                  }`}
                >
                  {passwordHasNumber ? "✓" : "•"}{" "}
                  At least one number
                </p>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={
                loading ||
                !passwordIsValid ||
                !formData.confirmPassword ||
                !passwordsMatch
              }
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-blue-600/30 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Resetting...
                </>
              ) : (
                <>
                  Reset Password

                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>

          {/* Login */}
          <div className="mt-7 border-t border-slate-100 pt-6 text-center">
            <p className="text-sm text-slate-500">
              Remember your password?{" "}
              <Link
                to="/login"
                className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;