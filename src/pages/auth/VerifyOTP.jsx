import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  MailCheck,
  ArrowRight,
  BriefcaseBusiness,
} from "lucide-react";

import {
  verifyOTP,
  clearAuthError,
  clearAuthSuccess,
} from "../../store/authSlice";

function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { loading, error, success } = useSelector(
    (state) => state.auth
  );

  const [otp, setOtp] = useState("");

  const email = (
    location.state?.email ||
    localStorage.getItem("resetEmail") ||
    ""
  )
    .trim()
    .toLowerCase();

  useEffect(() => {
    if (email) {
      localStorage.setItem("resetEmail", email);
    }
  }, [email]);

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
      dispatch(clearAuthSuccess());
    };
  }, [dispatch]);

  const handleOTPChange = (e) => {
    const value = e.target.value
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(value);

    if (error) {
      dispatch(clearAuthError());
    }

    if (success) {
      dispatch(clearAuthSuccess());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      return;
    }

    const result = await dispatch(
      verifyOTP({
        email,
        otp,
      })
    );

    if (verifyOTP.fulfilled.match(result)) {
      // Save the verified OTP for the reset-password step.
      localStorage.setItem("resetEmail", email);
      localStorage.setItem("resetOTP", otp);

      navigate("/reset-password", {
        replace: true,
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

  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-10 sm:px-6">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">
          <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl shadow-slate-200/60 sm:p-8">
            <div className="mb-6 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <MailCheck
                  size={27}
                  strokeWidth={2}
                />
              </div>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Verify OTP
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Your reset session has expired or no email
              was found. Please request a new OTP.
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
              Verify OTP
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Enter the 6-digit OTP sent to your email
              address.
            </p>
          </div>

          {/* Email */}
          <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-center">
            <p className="text-xs font-medium text-slate-500">
              OTP sent to
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
                "Invalid OTP. Please try again."
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
                "OTP verified successfully!"
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
                htmlFor="otp"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Verification Code{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                id="otp"
                type="text"
                name="otp"
                value={otp}
                onChange={handleOTPChange}
                placeholder="Enter 6-digit OTP"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                aria-describedby="otp-help"
                className="h-14 w-full rounded-xl border border-slate-300 bg-white px-4 text-center text-xl font-semibold tracking-[0.35em] text-slate-900 outline-none transition placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />

              <p
                id="otp-help"
                className="mt-2 text-center text-xs text-slate-400"
              >
                Enter the 6-digit code from your email.
              </p>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-blue-600/30 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify OTP

                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-7 border-t border-slate-100 pt-6 text-center">
            <p className="text-sm text-slate-500">
              Didn't receive the OTP?{" "}
              <Link
                to="/forgot-password"
                className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
              >
                Send Again
              </Link>
            </p>

            <p className="mt-3 text-sm text-slate-500">
              Remember your password?{" "}
              <Link
                to="/login"
                className="font-semibold text-slate-700 transition hover:text-blue-600 hover:underline"
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

export default VerifyOTP;