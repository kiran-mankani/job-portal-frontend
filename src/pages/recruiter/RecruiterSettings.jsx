import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Globe,
  Camera,
  Save,
  Lock,
  Bell,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../services/api";

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("accessToken") ||
  "";

const getStoredUser = () => {
  try {
    return JSON.parse(
      localStorage.getItem("user") ||
        localStorage.getItem("currentUser") ||
        "{}"
    );
  } catch {
    return {};
  }
};

const defaultSettings = {
  emailNotifications: true,
  applicationUpdates: true,
  interviewReminders: true,
  jobAlerts: true,
  messageNotifications: true,
  profileVisibility: true,
};

// ======================================================
// GET COMPANY VALUE
// ======================================================
// Company is stored on user.companyId (populated object).
// Also supports legacy nested/flat shapes.
// ======================================================

const getCompanyValue = (user, key, fallbackKeys = []) => {
  if (
    user?.companyId &&
    typeof user.companyId === "object" &&
    !Array.isArray(user.companyId)
  ) {
    const value = user.companyId?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  if (
    user?.company &&
    typeof user.company === "object" &&
    !Array.isArray(user.company)
  ) {
    const value = user.company?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  for (const fallbackKey of fallbackKeys) {
    const value = user?.[fallbackKey];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return "";
};

// ======================================================
// GET PROFILE VALUE  (NEW)
// ======================================================
// Profile fields (profileImage, designation, bio, etc.)
// live inside user.profile per the User schema.
// Falls back to flat fields and legacy keys.
// ======================================================

const getProfileValue = (user, key, fallbackKeys = []) => {
  if (user?.profile && typeof user.profile === "object") {
    const value = user.profile[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  if (user?.[key] !== undefined && user?.[key] !== null && user?.[key] !== "") {
    return user[key];
  }

  for (const fallbackKey of fallbackKeys) {
    const value = user?.[fallbackKey];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return "";
};

const normalizeSettings = (settings) => ({
  ...defaultSettings,
  ...(settings && typeof settings === "object" ? settings : {}),
});

const getUserFromResponse = (data) =>
  data?.user || data?.data?.user || data?.data || data;

const getWebsiteUrl = (website) => {
  const value = String(website || "").trim();

  if (!value) return "";

  try {
    const normalizedValue = /^https?:\/\//i.test(value)
      ? value
      : `https://${value}`;

    const parsedUrl = new URL(normalizedValue);

    if (
      parsedUrl.protocol !== "http:" &&
      parsedUrl.protocol !== "https:"
    ) {
      return "";
    }

    return parsedUrl.href;
  } catch {
    return "";
  }
};

export default function RecruiterSettings() {
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    designation: "",
    companyName: "",
    companyDescription: "",
    companyLocation: "",
    companyWebsite: "",
  });

  const [settings, setSettings] = useState(defaultSettings);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ======================================================
  // LOAD PROFILE
  // ======================================================

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        if (mounted) {
          setLoading(true);
          setError("");
        }

        const token = getToken();

        if (!token) {
          throw new Error(
            "Authentication token not found. Please login again."
          );
        }

        const data = await apiRequest("/auth/me", "GET", null, token);
        const currentUser = getUserFromResponse(data);

        if (!currentUser || typeof currentUser !== "object") {
          throw new Error("Unable to load recruiter profile.");
        }

        if (!mounted) return;

        setUser(currentUser);

        const companyName = getCompanyValue(currentUser, "name", [
          "companyName",
        ]);

        const companyDescription = getCompanyValue(
          currentUser,
          "description",
          ["companyDescription", "description"]
        );

        const companyLocation = getCompanyValue(currentUser, "location", [
          "companyLocation",
          "location",
        ]);

        const companyWebsite = getCompanyValue(currentUser, "website", [
          "companyWebsite",
          "website",
        ]);

        setForm({
          name: currentUser?.name || "",
          phone: currentUser?.phone || "",

          // Reads user.profile.designation first
          designation: getProfileValue(currentUser, "designation", [
            "position",
          ]),

          companyName,
          companyDescription,
          companyLocation,
          companyWebsite,
        });

        setSettings(normalizeSettings(currentUser?.settings));

        localStorage.setItem("user", JSON.stringify(currentUser));
      } catch (err) {
        console.error("Recruiter settings load error:", err);

        if (mounted) {
          setError(
            err?.message || "Failed to load recruiter settings."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  // ======================================================
  // CHANGE HANDLERS
  // ======================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSuccess("");
    setError("");
  };

  const handleSettingChange = (name) => {
    setSettings((previous) => ({
      ...previous,
      [name]: !previous[name],
    }));

    setSuccess("");
    setError("");
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSuccess("");
    setError("");
  };

  // ======================================================
  // BUILD PAYLOAD
  // ======================================================

  const buildProfilePayload = () => {
    const name = form.name.trim();
    const phone = form.phone.trim();
    const designation = form.designation.trim();
    const companyName = form.companyName.trim();
    const companyDescription = form.companyDescription.trim();
    const companyLocation = form.companyLocation.trim();
    const companyWebsite = form.companyWebsite.trim();

    if (!name) throw new Error("Full name is required.");
    if (name.length < 2 || name.length > 50) {
      throw new Error("Full name must be between 2 and 50 characters.");
    }

    if (phone && !/^(?:\+92|0)3\d{9}$/.test(phone)) {
      throw new Error("Please enter a valid Pakistani phone number.");
    }

    if (companyName && (companyName.length < 2 || companyName.length > 100)) {
      throw new Error("Company name must be between 2 and 100 characters.");
    }

    if (companyWebsite) {
      const websiteUrl = getWebsiteUrl(companyWebsite);
      if (!websiteUrl) {
        throw new Error("Please enter a valid company website.");
      }
    }

    return {
      name,
      phone,
      designation,
      company: companyName,
      companyDescription,
      companyLocation,
      companyWebsite,
      settings: normalizeSettings(settings),
    };
  };

  // ======================================================
  // SAVE PROFILE
  // ======================================================

  const saveProfileData = async (payload, successMessage) => {
    const token = getToken();
    if (!token) throw new Error("Please login again.");

    const data = await apiRequest("/auth/profile", "PUT", payload, token);
    const updatedUser = getUserFromResponse(data);

    if (updatedUser && typeof updatedUser === "object") {
      setUser(updatedUser);

      setSettings(
        normalizeSettings(updatedUser?.settings || payload.settings)
      );

      const companyName = getCompanyValue(updatedUser, "name", [
        "companyName",
      ]);

      const companyDescription = getCompanyValue(
        updatedUser,
        "description",
        ["companyDescription", "description"]
      );

      const companyLocation = getCompanyValue(updatedUser, "location", [
        "companyLocation",
        "location",
      ]);

      const companyWebsite = getCompanyValue(updatedUser, "website", [
        "companyWebsite",
        "website",
      ]);

      setForm((prev) => ({
        ...prev,
        name: updatedUser?.name || prev.name,
        phone: updatedUser?.phone || prev.phone,

        // NEW: read from profile.designation
        designation:
          getProfileValue(updatedUser, "designation", ["position"]) ||
          prev.designation,

        companyName: companyName || prev.companyName,
        companyDescription: companyDescription || prev.companyDescription,
        companyLocation: companyLocation || prev.companyLocation,
        companyWebsite: companyWebsite || prev.companyWebsite,
      }));

      localStorage.setItem("user", JSON.stringify(updatedUser));
    } else {
      const updatedLocalUser = {
        ...user,
        ...payload,
        settings: normalizeSettings(payload.settings),
      };

      setUser(updatedLocalUser);
      localStorage.setItem("user", JSON.stringify(updatedLocalUser));
    }

    setSuccess(successMessage);
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    setSaving(true);
    setSuccess("");
    setError("");

    try {
      const payload = buildProfilePayload();

      await saveProfileData(payload, "Profile settings updated successfully.");
    } catch (err) {
      console.error("Recruiter profile update error:", err);
      setError(err?.message || "Failed to update recruiter profile.");
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // SAVE NOTIFICATIONS
  // ======================================================

  const handleSaveNotifications = async () => {
    setSaving(true);
    setSuccess("");
    setError("");

    try {
      const token = getToken();
      if (!token) throw new Error("Please login again.");

      const updatedSettings = normalizeSettings(settings);

      const data = await apiRequest(
        "/auth/profile",
        "PUT",
        { settings: updatedSettings },
        token
      );

      const updatedUser = getUserFromResponse(data);

      if (updatedUser && typeof updatedUser === "object") {
        setUser(updatedUser);
        setSettings(
          normalizeSettings(updatedUser?.settings || updatedSettings)
        );
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        const updatedLocalUser = { ...user, settings: updatedSettings };
        setUser(updatedLocalUser);
        localStorage.setItem("user", JSON.stringify(updatedLocalUser));
      }

      setSuccess("Notification settings updated successfully.");
    } catch (err) {
      console.error("Notification settings update error:", err);
      setError(err?.message || "Failed to update notification settings.");
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // IMAGE UPLOAD
  // ======================================================

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setUploadingImage(true);
    setSuccess("");
    setError("");

    try {
      const token = getToken();
      if (!token) throw new Error("Please login again.");

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error("Only JPG, PNG, WEBP and GIF images are allowed.");
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Profile image must be smaller than 5MB.");
      }

      const formData = new FormData();
      formData.append("profileImage", file);

      const data = await apiRequest(
        "/auth/profile/image",
        "POST",
        formData,
        token
      );

      const updatedUser = getUserFromResponse(data);

      if (updatedUser && typeof updatedUser === "object") {
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else if (data?.profileImage) {
        const updatedLocalUser = {
          ...user,
          profile: {
            ...(user?.profile || {}),
            profileImage: data.profileImage,
          },
        };

        setUser(updatedLocalUser);
        localStorage.setItem("user", JSON.stringify(updatedLocalUser));
      } else {
        throw new Error(
          "Profile image was uploaded, but the updated image could not be read."
        );
      }

      setSuccess("Profile image updated successfully.");
    } catch (err) {
      console.error("Profile image upload error:", err);
      setError(err?.message || "Failed to upload profile image.");
    } finally {
      setUploadingImage(false);
    }
  };

  // ======================================================
  // CHANGE PASSWORD
  // ======================================================

  const handleChangePassword = async (event) => {
    event.preventDefault();

    setSaving(true);
    setSuccess("");
    setError("");

    try {
      const token = getToken();
      if (!token) throw new Error("Please login again.");

      const { currentPassword, newPassword, confirmPassword } = passwordForm;

      if (!currentPassword) {
        throw new Error("Current password is required.");
      }

      if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(newPassword)) {
        throw new Error(
          "New password must be at least 8 characters and contain at least one letter and one number."
        );
      }

      if (newPassword !== confirmPassword) {
        throw new Error("New password and confirmation password do not match.");
      }

      await apiRequest(
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

      setSuccess("Password changed successfully.");
    } catch (err) {
      console.error("Change password error:", err);
      setError(err?.message || "Failed to change password.");
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // INITIALS
  // ======================================================

  const initials =
    (user?.name || "Recruiter")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "R";

  // ======================================================
  // DISPLAYED PROFILE IMAGE
  // ======================================================
  // Reads user.profile.profileImage first, falls back to
  // a flat user.profileImage if present.
  // ======================================================

  const displayedProfileImage = getProfileValue(
    user,
    "profileImage"
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="mt-3 text-sm text-gray-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-5xl">
        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Recruiter Settings
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900 md:text-3xl">
              Account Settings
            </h1>

            <p className="mt-1 text-gray-500">
              Manage your recruiter profile, company information,
              notifications and password.
            </p>
          </div>

          <Link
            to="/recruiter/profile"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <ArrowLeft size={18} />
            Back to Profile
          </Link>
        </div>

        {/* ALERTS */}
        {success && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* PROFILE IMAGE */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="relative w-fit">
                {displayedProfileImage ? (
                  <img
                    src={displayedProfileImage}
                    alt={user?.name || "Recruiter"}
                    className="h-28 w-28 rounded-full border-4 border-gray-100 object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-700">
                    {initials}
                  </div>
                )}

                <label
                  htmlFor="profileImage"
                  className={`absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-blue-600 text-white shadow-md transition hover:bg-blue-700 ${
                    uploadingImage ? "pointer-events-none opacity-60" : ""
                  }`}
                  title="Change profile image"
                >
                  <Camera size={17} />

                  <input
                    id="profileImage"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                </label>
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Profile Photo
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Upload a professional profile photo.
                </p>

                <p className="mt-2 text-xs text-gray-400">
                  JPG, PNG, WEBP or GIF • Maximum 5MB
                </p>

                {uploadingImage && (
                  <p className="mt-2 text-sm font-medium text-blue-600">
                    Uploading image...
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* PROFILE & COMPANY */}
          <form onSubmit={handleSaveProfile}>
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <User size={22} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Profile Information
                  </h2>

                  <p className="text-sm text-gray-500">
                    Update your recruiter information.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* NAME */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Full Name
                  </label>

                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-3 top-3.5 text-gray-400"
                    />

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      maxLength={50}
                      autoComplete="name"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3 top-3.5 text-gray-400"
                    />

                    <input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 py-3 pl-10 pr-4 text-sm text-gray-500 outline-none"
                    />
                  </div>

                  <p className="mt-1 text-xs text-gray-400">
                    Email cannot be changed from settings.
                  </p>
                </div>

                {/* PHONE */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Phone
                  </label>

                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-3 top-3.5 text-gray-400"
                    />

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                      className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder="03XXXXXXXXX"
                    />
                  </div>
                </div>

                {/* DESIGNATION */}
                <div>
                  <label
                    htmlFor="designation"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Designation
                  </label>

                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-3 top-3.5 text-gray-400"
                    />

                    <input
                      id="designation"
                      name="designation"
                      type="text"
                      value={form.designation}
                      onChange={handleChange}
                      maxLength={100}
                      autoComplete="organization-title"
                      className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder="HR Manager / Recruiter"
                    />
                  </div>
                </div>
              </div>

              {/* COMPANY SECTION */}
              <div className="mt-8 border-t border-gray-100 pt-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    <Building2 size={22} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Company Information
                    </h2>

                    <p className="text-sm text-gray-500">
                      Update information displayed with your job postings.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                  {/* COMPANY NAME */}
                  <div>
                    <label
                      htmlFor="companyName"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Company Name
                    </label>

                    <div className="relative">
                      <Building2
                        size={18}
                        className="absolute left-3 top-3.5 text-gray-400"
                      />

                      <input
                        id="companyName"
                        name="companyName"
                        type="text"
                        value={form.companyName}
                        onChange={handleChange}
                        maxLength={100}
                        autoComplete="organization"
                        className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Company name"
                      />
                    </div>
                  </div>

                  {/* LOCATION */}
                  <div>
                    <label
                      htmlFor="companyLocation"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Company Location
                    </label>

                    <div className="relative">
                      <MapPin
                        size={18}
                        className="absolute left-3 top-3.5 text-gray-400"
                      />

                      <input
                        id="companyLocation"
                        name="companyLocation"
                        type="text"
                        value={form.companyLocation}
                        onChange={handleChange}
                        maxLength={150}
                        autoComplete="street-address"
                        className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>

                  {/* WEBSITE */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="companyWebsite"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Company Website
                    </label>

                    <div className="relative">
                      <Globe
                        size={18}
                        className="absolute left-3 top-3.5 text-gray-400"
                      />

                      <input
                        id="companyWebsite"
                        name="companyWebsite"
                        type="url"
                        value={form.companyWebsite}
                        onChange={handleChange}
                        maxLength={200}
                        autoComplete="url"
                        className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="https://example.com"
                      />
                    </div>

                    <p className="mt-1 text-xs text-gray-400">
                      Example: https://example.com
                    </p>
                  </div>

                  {/* DESCRIPTION */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="companyDescription"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Company Description
                    </label>

                    <textarea
                      id="companyDescription"
                      name="companyDescription"
                      value={form.companyDescription}
                      onChange={handleChange}
                      rows={5}
                      maxLength={2000}
                      className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder="Tell candidates about your company..."
                    />

                    <p className="mt-1 text-right text-xs text-gray-400">
                      {form.companyDescription.length}/2000
                    </p>
                  </div>
                </div>
              </div>

              {/* SAVE PROFILE */}
              <div className="mt-7 flex justify-end border-t border-gray-100 pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={18} />
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </section>
          </form>

          {/* NOTIFICATION SETTINGS */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <Bell size={22} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Notification Settings
                </h2>

                <p className="text-sm text-gray-500">
                  Choose which notifications you want to receive.
                </p>
              </div>
            </div>

            <div className="mt-6 divide-y divide-gray-100">
              {[
                {
                  key: "emailNotifications",
                  title: "Email Notifications",
                  description:
                    "Receive important account notifications by email.",
                },
                {
                  key: "applicationUpdates",
                  title: "Application Updates",
                  description:
                    "Get notified when candidates apply or application status changes.",
                },
                {
                  key: "interviewReminders",
                  title: "Interview Reminders",
                  description:
                    "Receive reminders about scheduled interviews.",
                },
                {
                  key: "jobAlerts",
                  title: "Job Alerts",
                  description:
                    "Receive notifications related to your posted jobs.",
                },
                {
                  key: "messageNotifications",
                  title: "Message Notifications",
                  description:
                    "Get notified when you receive recruiter messages.",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      {item.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={Boolean(settings[item.key])}
                    aria-label={`Toggle ${item.title}`}
                    onClick={() => handleSettingChange(item.key)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                      settings[item.key] ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                        settings[item.key] ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              ))}

              {/* PROFILE VISIBILITY */}
              <div className="flex items-center justify-between gap-4 py-4">
                <div className="flex items-start gap-3">
                  <Eye
                    size={18}
                    className="mt-0.5 shrink-0 text-gray-400"
                  />

                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">
                      Profile Visibility
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Allow candidates to view your recruiter profile.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={Boolean(settings.profileVisibility)}
                  aria-label="Toggle Profile Visibility"
                  onClick={() => handleSettingChange("profileVisibility")}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    settings.profileVisibility ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                      settings.profileVisibility ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* SAVE NOTIFICATIONS */}
            <div className="mt-5 flex justify-end border-t border-gray-100 pt-5">
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveNotifications}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={17} />
                {saving ? "Saving..." : "Save Notifications"}
              </button>
            </div>
          </section>

          {/* PASSWORD */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Lock size={22} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Change Password
                </h2>

                <p className="text-sm text-gray-500">
                  Keep your recruiter account secure.
                </p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="mt-6 space-y-5">
              {/* CURRENT PASSWORD */}
              <div>
                <label
                  htmlFor="currentPassword"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Current Password
                </label>

                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter current password"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* NEW PASSWORD */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    New Password
                  </label>

                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter new password"
                  />

                  <p className="mt-1 text-xs text-gray-400">
                    Minimum 8 characters, including a letter and number.
                  </p>
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Confirm New Password
                  </label>

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="flex justify-end border-t border-gray-100 pt-5">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Lock size={17} />
                  {saving ? "Updating..." : "Change Password"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}