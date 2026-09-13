import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  updateProfile,
  setCredentials,
  clearAuthError,
  clearAuthSuccess,
} from "../../store/authSlice";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

function Profile() {
  const dispatch = useDispatch();

  const reduxUser = useSelector((state) => state.auth.user);
  const reduxToken = useSelector((state) => state.auth.token);
  const loading = useSelector((state) => state.auth.loading);
  const authError = useSelector((state) => state.auth.error);
  const authSuccess = useSelector((state) => state.auth.success);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    headline: "",
    bio: "",
    skills: "",
    education: "",
    experience: "",
  });

  const [storedUser, setStoredUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Tracks the URL of an image that was just uploaded.
  // This takes priority over the user object until the user
  // object actually catches up (or the user navigates away).
  const uploadedImageRef = useRef("");

  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [imageSuccess, setImageSuccess] = useState("");

  const token =
    reduxToken ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    "";

  const user = reduxUser || storedUser;

  // ======================================================
  // LOAD USER FROM LOCAL STORAGE
  // ======================================================

  useEffect(() => {
    try {
      const rawUser =
        localStorage.getItem("user") ||
        localStorage.getItem("currentUser");

      if (rawUser) {
        const parsedUser = JSON.parse(rawUser);
        setStoredUser(parsedUser);
      }
    } catch (error) {
      console.error("Failed to read stored user:", error);
    }
  }, []);

  // ======================================================
  // LOAD USER INTO FORM
  // ======================================================

  useEffect(() => {
    if (!user) return;

    const currentProfile = user.profile || {};

    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      location: currentProfile.location || user.location || "",
      headline: currentProfile.headline || user.headline || "",
      bio: currentProfile.bio || user.bio || "",
      skills: Array.isArray(currentProfile.skills)
        ? currentProfile.skills.join(", ")
        : Array.isArray(user.skills)
        ? user.skills.join(", ")
        : currentProfile.skills || user.skills || "",
      education: currentProfile.education || user.education || "",
      experience: currentProfile.experience || user.experience || "",
    });

    // ======================================================
    // IMAGE PREVIEW SYNC
    // ======================================================
    //
    // Only sync the preview from the user object when:
    //   - no local file is selected, AND
    //   - we haven't just uploaded an image
    //
    // This prevents the upload flow from being overwritten
    // with the stale user.profileImage right after upload.
    // ======================================================

    if (selectedImage) {
      return;
    }

    if (uploadedImageRef.current) {
      return;
    }

    setImagePreview(
      currentProfile.profileImage || user.profileImage || ""
    );
  }, [user, selectedImage]);

  // ======================================================
  // AUTO CLEAR AUTH ERROR
  // ======================================================

  useEffect(() => {
    if (!authError) return;

    const timer = setTimeout(() => {
      dispatch(clearAuthError());
    }, 3500);

    return () => clearTimeout(timer);
  }, [authError, dispatch]);

  // ======================================================
  // AUTO CLEAR SUCCESS
  // ======================================================

  useEffect(() => {
    if (!authSuccess) return;

    const timer = setTimeout(() => {
      dispatch(clearAuthSuccess());
    }, 3500);

    return () => clearTimeout(timer);
  }, [authSuccess, dispatch]);

  // ======================================================
  // CLEANUP BLOB URL
  // ======================================================

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // ======================================================
  // FORM CHANGE
  // ======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ======================================================
  // IMAGE CHANGE (local preview only)
  // ======================================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    setImageError("");
    setImageSuccess("");

    if (!file) {
      setSelectedImage(null);
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError(
        "Please select a JPG, JPEG, PNG, WEBP, or GIF image."
      );

      e.target.value = "";
      setSelectedImage(null);
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError("Profile image must be 5MB or smaller.");

      e.target.value = "";
      setSelectedImage(null);
      return;
    }

    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setSelectedImage(file);
    setImagePreview(previewUrl);
  };

  // ======================================================
  // IMAGE UPLOAD
  // ======================================================

  const handleImageUpload = async () => {
    if (!selectedImage || !token) {
      if (!token) setImageError("You are not authenticated.");
      return;
    }

    setImageLoading(true);
    setImageError("");
    setImageSuccess("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("profileImage", selectedImage);

      const response = await fetch(
        `${API_URL}/auth/profile/image`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formDataToSend,
        }
      );

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Failed to upload profile image."
        );
      }

      const updatedUser = data.user || data.data || null;

      if (updatedUser) {
        // ======================================================
        // SYNC REDUX + LOCAL STORAGE + LOCAL STATE
        // ======================================================

        setStoredUser(updatedUser);

        localStorage.setItem(
          "user",
          JSON.stringify(updatedUser)
        );

        // Keep Redux in sync so `reduxUser` reflects the new image.
        dispatch(
          setCredentials({
            user: updatedUser,
            token,
          })
        );

        const updatedProfile = updatedUser.profile || {};

        const updatedImage =
          updatedProfile.profileImage ||
          updatedUser.profileImage ||
          "";

        if (updatedImage) {
          // Revoke old blob URL (no longer needed).
          if (imagePreview && imagePreview.startsWith("blob:")) {
            URL.revokeObjectURL(imagePreview);
          }

          // Mark that we just uploaded so the sync effect
          // doesn't overwrite the preview with stale data.
          uploadedImageRef.current = updatedImage;

          setImagePreview(updatedImage);
        }
      }

      // Clear the pending file (the preview now points to the
      // permanent uploaded URL, not the local blob).
      setSelectedImage(null);

      setImageSuccess(
        data.message || "Profile image updated successfully."
      );
    } catch (error) {
      console.error("Profile image upload error:", error);

      setImageError(
        error.message || "Failed to upload profile image."
      );
    } finally {
      setImageLoading(false);
    }
  };

  // ======================================================
  // SUBMIT PROFILE
  // ======================================================

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!token) {
      dispatch(clearAuthError());
      return;
    }

    const skillsArray = formData.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    dispatch(
      updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        profile: {
          location: formData.location.trim(),
          headline: formData.headline.trim(),
          bio: formData.bio.trim(),
          skills: skillsArray,
          education: formData.education.trim(),
          experience: formData.experience.trim(),
        },
      })
    );
  };


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
  
  // ======================================================
  // SKILL LIST
  // ======================================================

  const skillList = useMemo(() => {
    return formData.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  }, [formData.skills]);

  // ======================================================
  // PROFILE DATA
  // ======================================================

  const initials = (user?.name || "U")
    .trim()
    .charAt(0)
    .toUpperCase();

  const successMessage =
    typeof authSuccess === "string"
      ? authSuccess
      : authSuccess?.message || "Profile updated successfully.";

  const currentProfile = user?.profile || {};

  const profileFields = [
    currentProfile.profileImage || user?.profileImage,
    user?.name,
    user?.phone,
    currentProfile.location || user?.location,
    currentProfile.headline || user?.headline,
    currentProfile.bio || user?.bio,
    Array.isArray(currentProfile.skills) &&
    currentProfile.skills.length > 0
      ? currentProfile.skills
      : Array.isArray(user?.skills) && user.skills.length > 0
      ? user.skills
      : "",
    currentProfile.education || user?.education,
    currentProfile.experience || user?.experience,
    currentProfile.resume || user?.resume || user?.cv,
  ];

  const completedFields = profileFields.filter(Boolean).length;

  const profilePercentage = Math.round(
    (completedFields / profileFields.length) * 100
  );

  // ======================================================
  // DISPLAYED IMAGE — PRIORITY ORDER
  // ======================================================
  //
  // 1. Local blob preview (user just picked a new file)
  // 2. Freshly uploaded URL (uploadedImageRef)
  // 3. User profile from Redux/localStorage
  // ======================================================

  const displayedImage =
    imagePreview ||
    uploadedImageRef.current ||
    currentProfile.profileImage ||
    user?.profileImage ||
    "";

  const displayedSkills = Array.isArray(currentProfile.skills)
    ? currentProfile.skills
    : Array.isArray(user?.skills)
    ? user.skills
    : [];

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
                Candidate Profile
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                My Profile
              </h1>

              <p className="mt-2 text-slate-500">
                View and update your profile information.
              </p>
            </div>

            <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Active Profile
            </div>
          </div>
        </div>

        {/* SUCCESS */}
        {authSuccess && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                ✓
              </div>
              <div>
                <p className="font-semibold text-emerald-800">Success</p>
                <p className="mt-1 text-sm text-emerald-700">
                  {successMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ERROR */}
        {authError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-700">
                !
              </div>
              <div>
                <p className="font-semibold text-red-800">Update failed</p>
                <p className="mt-1 text-sm text-red-700">
                  {typeof authError === "string"
                    ? authError
                    : authError?.message || "Failed to update profile."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* LEFT */}
          <div className="xl:col-span-2">
            {/* PROFILE PHOTO */}
            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="relative h-36 w-36 shrink-0">
                  <div className="h-36 w-36 overflow-hidden rounded-full bg-blue-100">
                    {displayedImage ? (
                      <img
                        src={displayedImage}
                        alt={user?.name || "Profile"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-blue-700">
                        {initials}
                      </div>
                    )}
                  </div>

                  <label
                    htmlFor="candidate-profile-image"
                    title="Change profile image"
                    className="absolute bottom-0 right-0 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-blue-600 text-white shadow-lg transition hover:bg-blue-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-6 w-6"
                    >
                      <path d="M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" />
                      <circle cx="12" cy="13" r="3.5" />
                    </svg>

                    <input
                      id="candidate-profile-image"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Profile Photo
                  </h2>

                  <p className="mt-1 text-base text-slate-500">
                    Upload a professional profile photo.
                  </p>

                  <p className="mt-3 text-sm text-slate-500">
                    JPG, PNG, WEBP or GIF • Maximum 5MB
                  </p>

                  {selectedImage && (
                    <button
                      type="button"
                      onClick={handleImageUpload}
                      disabled={imageLoading || !token}
                      className="mt-3 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {imageLoading ? (
                        <>
                          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Uploading...
                        </>
                      ) : (
                        "Upload Photo"
                      )}
                    </button>
                  )}

                  {imageError && (
                    <p className="mt-2 text-sm font-medium text-red-600">
                      {imageError}
                    </p>
                  )}

                  {imageSuccess && (
                    <p className="mt-2 text-sm font-medium text-emerald-600">
                      {imageSuccess}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* PROFILE INFORMATION */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-7">
                <h2 className="text-xl font-semibold text-slate-900">
                  Profile Information
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Update the information recruiters see on your profile.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500 outline-none"
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      Email cannot be changed from this page.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Phone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Karachi, Pakistan"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Professional Headline
                    </label>
                    <input
                      type="text"
                      name="headline"
                      value={formData.headline}
                      onChange={handleChange}
                      placeholder="e.g. MERN Stack Developer"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      About Me
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={6}
                      placeholder="Tell recruiters about yourself..."
                      className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Experience
                    </label>
                    <textarea
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Your work experience..."
                      className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Education
                    </label>
                    <textarea
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Your education..."
                      className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Skills
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="React, Node.js, MongoDB, Express"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Separate skills with commas.
                  </p>

                  {skillList.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {skillList.map((skill, index) => (
                        <span
                          key={`${skill}-${index}`}
                          className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-8 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-500">
                    Your profile changes are saved to your account.
                  </p>

                  <button
                    type="submit"
                    disabled={loading || !token}
                    className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Updating...
                      </>
                    ) : (
                      "Update Profile"
                    )}
                  </button>
                </div>
              </form>
            </section>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Account</h2>
              <div className="mt-6 space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">
                    Name
                  </p>
                  <p className="mt-1 font-medium text-slate-800">
                    {user?.name || "Not available"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">
                    Email
                  </p>
                  <p className="mt-1 break-all font-medium text-slate-800">
                    {user?.email || "Not available"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">
                    Role
                  </p>
                  <p className="mt-1 font-medium capitalize text-slate-800">
                    {user?.role || "candidate"}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Profile Overview
              </h2>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Profile Views</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {Number(user?.profileViews) || 0}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Skills</p>
                  <p className="mt-1 text-2xl font-bold text-blue-600">
                    {displayedSkills.length}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  Profile Strength
                </h2>
                <span className="text-lg font-bold text-blue-600">
                  {profilePercentage}%
                </span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${profilePercentage}%` }}
                />
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Complete more details to improve your visibility to recruiters.
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Your Skills
              </h2>
              {displayedSkills.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {displayedSkills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  No skills added yet.
                </p>
              )}
            </section>

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
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;