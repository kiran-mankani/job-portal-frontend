import React, { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { apiRequest } from "../../services/api";

const DEFAULT_SETTINGS = {
  emailNotifications: true,
  applicationUpdates: true,
  interviewReminders: true,
  jobAlerts: true,
  messageNotifications: true,
  profileVisibility: true,
};

// ==========================================
// GET STORED USER
// ==========================================

const getStoredUser = () => {
  try {
    const raw =
      localStorage.getItem("user") ||
      localStorage.getItem("currentUser");

    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error("User parse error:", error);
    return {};
  }
};

// ==========================================
// GET TOKEN
// ==========================================

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    ""
  );
};

// ==========================================
// NORMALIZE API USER RESPONSE
// ==========================================

const normalizeUser = (response) => {
  if (!response) return null;

  return (
    response.user ||
    response.data?.user ||
    response.data ||
    response
  );
};

// ==========================================
// SYNC USER TO LOCAL STORAGE
// ==========================================

const saveUserToStorage = (user) => {
  if (!user) return;

  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("currentUser", JSON.stringify(user));

  window.dispatchEvent(
    new CustomEvent("profileUpdated", {
      detail: user,
    })
  );
};

// ==========================================
// SETTINGS COMPONENT
// ==========================================

function Settings() {
  const [user, setUser] = useState(getStoredUser);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // ==========================================
  // PASSWORD FORM
  // ==========================================

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ==========================================
  // PASSWORD VISIBILITY
  // ==========================================

  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const togglePasswordVisibility = (field) => {
    setShowPasswords((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  // ==========================================
  // LOADING STATES
  // ==========================================

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // ==========================================
  // MESSAGE
  // ==========================================

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const token = getToken();

  // ==========================================
  // LOAD CURRENT USER
  // ==========================================

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await apiRequest(
          "/auth/me",
          "GET",
          null,
          token
        );

        const freshUser = normalizeUser(response);

        if (freshUser) {
          setUser(freshUser);
          saveUserToStorage(freshUser);

          if (freshUser.settings) {
            setSettings({
              ...DEFAULT_SETTINGS,
              ...freshUser.settings,
            });
          } else {
            setSettings(DEFAULT_SETTINGS);
          }
        }
      } catch (error) {
        console.error("Failed to load settings:", error);

        setMessage({
          type: "error",
          text:
            error.message ||
            "Failed to load account settings.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // ==========================================
  // PASSWORD INPUT
  // ==========================================

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // TOGGLE SETTINGS
  // ==========================================

  const handleSettingToggle = async (key) => {
    if (!token) {
      setMessage({
        type: "error",
        text: "You are not logged in.",
      });

      return;
    }

    const previousSettings = { ...settings };

    const nextSettings = {
      ...settings,
      [key]: !settings[key],
    };

    setSettings(nextSettings);
    setSavingSettings(true);

    setMessage({ type: "", text: "" });

    try {
      const response = await apiRequest(
        "/auth/profile",
        "PUT",
        { settings: nextSettings },
        token
      );

      const updatedUser = normalizeUser(response);

      if (updatedUser) {
        const finalUser = { ...user, ...updatedUser };

        setUser(finalUser);
        saveUserToStorage(finalUser);

        if (finalUser.settings) {
          setSettings({
            ...DEFAULT_SETTINGS,
            ...finalUser.settings,
          });
        }
      }

      setMessage({
        type: "success",
        text: "Settings saved successfully.",
      });
    } catch (error) {
      console.error("Settings update error:", error);

      setSettings(previousSettings);

      setMessage({
        type: "error",
        text: error.message || "Failed to save setting.",
      });
    } finally {
      setSavingSettings(false);
    }
  };

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setMessage({
        type: "error",
        text: "You are not logged in.",
      });

      return;
    }

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = passwordForm;

    setMessage({ type: "", text: "" });

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({
        type: "error",
        text: "Please fill all password fields.",
      });

      return;
    }

    if (newPassword.length < 8) {
      setMessage({
        type: "error",
        text: "New password must be at least 8 characters.",
      });

      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({
        type: "error",
        text: "New password and confirm password do not match.",
      });

      return;
    }

    try {
      setChangingPassword(true);

      const response = await apiRequest(
        "/auth/change-password",
        "PUT",
        { currentPassword, newPassword },
        token
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowPasswords({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
      });

      setMessage({
        type: "success",
        text:
          response?.message ||
          "Password changed successfully.",
      });
    } catch (error) {
      console.error("Password change error:", error);

      setMessage({
        type: "error",
        text: error.message || "Failed to change password.",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = async () => {
    try {
      if (token) {
        await apiRequest("/auth/logout", "POST", null, token);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      localStorage.removeItem("currentUser");

      window.location.href = "/login";
    }
  };

  // ==========================================
  // PASSWORD FIELD COMPONENT
  // ==========================================

  const PasswordField = ({
    label,
    name,
    value,
    placeholder,
    autoComplete,
  }) => {
    const isVisible = showPasswords[name];

    return (
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          {label}
        </label>

        <div className="relative">
          <input
            type={isVisible ? "text" : "password"}
            name={name}
            value={value}
            onChange={handlePasswordChange}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <button
            type="button"
            onClick={() => togglePasswordVisibility(name)}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 transition hover:text-slate-700"
            aria-label={isVisible ? "Show password" : "Hide password"}
            title={isVisible ? "Show password" : "Hide password"}
          >
            {isVisible ? (
              <Eye className="h-5 w-5" />
            ) : (
              <EyeOff className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    );
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // INITIALS
  // ==========================================

  const initials = (user?.name || "U")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // ==========================================
  // SETTING ROW
  // ==========================================

  const SettingRow = ({
    settingKey,
    title,
    description,
  }) => (
    <div className="flex items-center justify-between gap-5 rounded-xl border border-slate-200 bg-white px-5 py-4">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-slate-900">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() => handleSettingToggle(settingKey)}
        disabled={savingSettings}
        aria-label={`Toggle ${title}`}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          settings[settingKey] ? "bg-blue-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
            settings[settingKey] ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold text-blue-600">
                Account
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Settings
              </h1>

              <p className="mt-2 text-slate-500">
                Manage your account preferences and security.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Account Active
            </div>
          </div>
        </div>

        {/* MESSAGE */}
        {message.text && (
          <div
            className={`mb-6 flex items-start gap-3 rounded-xl border px-4 py-4 ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <div className="mt-0.5">
              {message.type === "success" ? (
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
            </div>

            <div>
              <p
                className={`text-sm font-semibold ${
                  message.type === "success"
                    ? "text-emerald-800"
                    : "text-red-800"
                }`}
              >
                {message.type === "success"
                  ? "Success"
                  : "Something went wrong"}
              </p>

              <p
                className={`mt-1 text-sm ${
                  message.type === "success"
                    ? "text-emerald-700"
                    : "text-red-700"
                }`}
              >
                {message.text}
              </p>
            </div>
          </div>
        )}

        {/* ACCOUNT OVERVIEW */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative w-fit">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user?.name || "User"}
                  className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-md"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                  {initials}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <h2 className="text-xl font-bold text-slate-900">
                {user?.name || "User"}
              </h2>

              <p className="mt-1 break-all text-sm text-slate-500">
                {user?.email || "Email not available"}
              </p>

              <p className="mt-1 text-sm capitalize text-slate-500">
                {user?.role || "candidate"}
              </p>
            </div>
          </div>
        </section>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* LEFT */}
          <div className="space-y-6 xl:col-span-2">
            {/* NOTIFICATIONS */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900">
                  Notifications
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Choose the notifications you want to receive.
                </p>
              </div>

              <div className="space-y-3">
                <SettingRow
                  settingKey="emailNotifications"
                  title="Email Notifications"
                  description="Receive important account updates by email."
                />

                <SettingRow
                  settingKey="applicationUpdates"
                  title="Application Updates"
                  description="Get notified when your application status changes."
                />

                <SettingRow
                  settingKey="interviewReminders"
                  title="Interview Reminders"
                  description="Receive reminders about upcoming interviews."
                />

                <SettingRow
                  settingKey="jobAlerts"
                  title="Job Alerts"
                  description="Receive relevant job opportunities."
                />

                <SettingRow
                  settingKey="messageNotifications"
                  title="Message Notifications"
                  description="Get notified when someone sends you a message."
                />
              </div>
            </section>

            {/* PRIVACY */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-5">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Profile Visibility
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Allow recruiters to discover your profile.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleSettingToggle("profileVisibility")
                  }
                  disabled={savingSettings}
                  aria-label="Toggle Profile Visibility"
                  className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                    settings.profileVisibility
                      ? "bg-blue-600"
                      : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                      settings.profileVisibility
                        ? "left-6"
                        : "left-1"
                    }`}
                  />
                </button>
              </div>
            </section>

            {/* PASSWORD */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900">
                  Change Password
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update your password using your current password.
                </p>
              </div>

              <form
                onSubmit={handlePasswordSubmit}
                className="space-y-5"
              >
                {/* CURRENT PASSWORD */}
                <PasswordField
                  label="Current Password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  placeholder="Current password"
                  autoComplete="current-password"
                />

                {/* NEW + CONFIRM */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <PasswordField
                    label="New Password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    placeholder="New password"
                    autoComplete="new-password"
                  />

                  <PasswordField
                    label="Confirm Password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                  />
                </div>

                {/* CHANGE PASSWORD */}
                <div className="flex justify-end border-t border-slate-200 pt-5">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {changingPassword
                      ? "Changing..."
                      : "Change Password"}
                  </button>
                </div>
              </form>
            </section>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-4">
            {/* QUICK ACCOUNT */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user?.name || "User"}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                    {initials}
                  </div>
                )}

                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-slate-900">
                    {user?.name || "User"}
                  </h3>

                  <p className="truncate text-sm text-slate-500">
                    {user?.email || "No email"}
                  </p>
                </div>
              </div>
            </section>

            {/* ACCOUNT DETAILS */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Account Details
              </h2>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Name
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {user?.name || "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Email
                  </p>

                  <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                    {user?.email || "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Role
                  </p>

                  <p className="mt-1 text-sm font-semibold capitalize text-slate-800">
                    {user?.role || "candidate"}
                  </p>
                </div>
              </div>
            </section>

            {/* SECURITY */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg">
                  🔒
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Account Security
                  </h2>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Your account is protected by password authentication.
                  </p>
                </div>
              </div>
            </section>

            {/* LOGOUT */}
            <section className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Sign Out
              </h2>

              <p className="mt-1 text-sm leading-5 text-slate-500">
                Sign out from this device.
              </p>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-4 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
              >
                Logout
              </button>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Settings;