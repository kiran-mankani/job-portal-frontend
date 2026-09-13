import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Mail,
  ArrowRight,
  BriefcaseBusiness,
} from "lucide-react";

import {
  forgotPassword,
  clearAuthError,
  clearAuthSuccess,
} from "../../store/authSlice";

function ForgotPassword() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, success } = useSelector(
    (state) => state.auth
  );

  const [email, setEmail] = useState("");

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
      dispatch(clearAuthSuccess());
    };
  }, [dispatch]);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);

    if (error) {
      dispatch(clearAuthError());
    }

    if (success) {
      dispatch(clearAuthSuccess());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanedEmail = email.trim();

    const result = await dispatch(
      forgotPassword({
        email: cleanedEmail,
      })
    );

    if (forgotPassword.fulfilled.match(result)) {
      localStorage.setItem("resetEmail", cleanedEmail);

      navigate("/verify-otp", {
        replace: true,
        state: {
          email: cleanedEmail,
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
              Forgot Password?
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Enter your email address and we'll send you
              an OTP to reset your password.
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
                "Something went wrong. Please try again."
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
                "OTP sent successfully. Please check your email."
              )}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email Address{" "}
                <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-blue-600/30 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Sending OTP...
                </>
              ) : (
                <>
                  Send OTP
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
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

export default ForgotPassword;