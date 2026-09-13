import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Globe,
  Briefcase,
  Edit3,
} from "lucide-react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../services/api";

// ==========================================
// TOKEN
// ==========================================

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("accessToken") ||
  "";

// ==========================================
// STORED USER
// ==========================================

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

// ==========================================
// COMPANY VALUE READER
// ==========================================
// Priority:
//   1. user.companyId (populated object)   ← from API
//   2. user.company    (legacy nested)
//   3. flat fields on the user (companyName, companyDescription, ...)
//   4. user.profile.* (fallback)
// ==========================================

const getCompanyValue = (user, key, fallbackKeys = []) => {
  // 1. Populated companyId
  if (
    user?.companyId &&
    typeof user.companyId === "object" &&
    !Array.isArray(user.companyId)
  ) {
    const value = user.companyId[key];

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  // 2. Legacy nested company
  if (
    user?.company &&
    typeof user.company === "object" &&
    !Array.isArray(user.company)
  ) {
    const value = user.company[key];

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  // 3. Flat fallback keys
  for (const fallbackKey of fallbackKeys) {
    const value = user?.[fallbackKey];

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  // 4. profile.* fallback
  for (const fallbackKey of fallbackKeys) {
    const value = user?.profile?.[fallbackKey];

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return "";
};

// ==========================================
// WEBSITE URL NORMALIZER
// ==========================================

const getWebsiteUrl = (website) => {
  const value = String(website || "").trim();

  if (!value) return "";

  try {
    const parsedUrl = new URL(
      /^https?:\/\//i.test(value) ? value : `https://${value}`
    );

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

// ==========================================
// COMPONENT
// ==========================================

export default function RecruiterProfile() {
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(true);

  // ==========================================
  // LOAD PROFILE
  // ==========================================

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        const token = getToken();

        if (!token) {
          if (mounted) setLoading(false);
          return;
        }

        const data = await apiRequest(
          "/auth/me",
          "GET",
          null,
          token
        );

        const currentUser =
          data?.user ||
          data?.data?.user ||
          data?.data ||
          data;

        if (mounted && currentUser && typeof currentUser === "object") {
          setUser(currentUser);
          localStorage.setItem("user", JSON.stringify(currentUser));
        }
      } catch (error) {
        console.error("Recruiter profile error:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  // ==========================================
  // COMPANY FIELDS
  // ==========================================

  const companyName =
    getCompanyValue(user, "name", ["companyName"]) || "";

  const companyDescription =
    getCompanyValue(user, "description", [
      "companyDescription",
      "description",
    ]) || "";

  const companyLocation =
    getCompanyValue(user, "location", [
      "companyLocation",
      "location",
    ]) || "";

  const companyWebsite =
    getCompanyValue(user, "website", [
      "companyWebsite",
      "website",
    ]) || "";

  const companyLogo =
    getCompanyValue(user, "logo", ["companyLogo", "logo"]) || "";

  const websiteUrl = getWebsiteUrl(companyWebsite);

  // ==========================================
  // RECRUITER FIELDS
  // ==========================================

  const displayName =
    user?.name || user?.fullName || "Recruiter";

  const designation =
    user?.profile?.designation ||
    user?.designation ||
    user?.position ||
    "Recruiter";

  const initials =
    String(displayName)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "R";

  const profileImage =
    user?.profile?.profileImage ||
    user?.profileImage ||
    "";

  const normalizedStatus = String(
    user?.status || "active"
  )
    .trim()
    .toLowerCase();

  const isActive =
    !user?.isBlocked &&
    user?.isActive !== false &&
    normalizedStatus !== "blocked" &&
    normalizedStatus !== "inactive" &&
    normalizedStatus !== "suspended";

  const statusLabel = isActive
    ? "Active Recruiter"
    : "Inactive Recruiter";

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="mt-3 text-sm text-gray-500">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Recruiter Profile
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900 md:text-3xl">
              My Profile
            </h1>

            <p className="mt-1 text-gray-500">
              View your recruiter and company information.
            </p>
          </div>

          <Link
            to="/recruiter/settings"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            <Edit3 size={18} />
            Edit Profile
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* =====================================================
              LEFT PROFILE CARD
          ===================================================== */}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              {/* PROFILE IMAGE */}

              {profileImage ? (
                <img
                  src={profileImage}
                  alt={displayName}
                  className="h-32 w-32 rounded-full border-4 border-gray-100 object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-700">
                  {initials}
                </div>
              )}

              {/* NAME */}

              <h2 className="mt-5 text-2xl font-bold text-gray-900">
                {displayName}
              </h2>

              {/* DESIGNATION */}

              <p className="mt-1 text-sm text-gray-500">
                {designation}
              </p>

              {/* COMPANY */}

              {companyName && (
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                  <Building2 size={17} />
                  <span>{companyName}</span>
                </div>
              )}

              {/* LOCATION */}

              {companyLocation && (
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                  <MapPin size={17} />
                  <span>{companyLocation}</span>
                </div>
              )}

              {/* STATUS */}

              <div
                className={`mt-5 flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${
                  isActive
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isActive ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                {statusLabel}
              </div>
            </div>

            {/* CONTACT */}

            <div className="mt-7 border-t border-gray-100 pt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                Contact Information
              </h3>

              <div className="mt-4 space-y-4">
                {/* EMAIL */}

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Mail size={17} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="mt-1 break-all text-sm font-medium text-gray-700">
                      {user?.email || "Not available"}
                    </p>
                  </div>
                </div>

                {/* PHONE */}

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Phone size={17} />
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="mt-1 text-sm font-medium text-gray-700">
                      {user?.phone || "Not available"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              RIGHT CONTENT
          ===================================================== */}

          <div className="space-y-6 lg:col-span-2">
            {/* RECRUITER INFORMATION */}

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <User size={22} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Recruiter Information
                  </h2>

                  <p className="text-sm text-gray-500">
                    Your professional recruiter details.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-400">
                    Full Name
                  </p>
                  <p className="mt-2 font-semibold text-gray-800">
                    {displayName}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-400">
                    Role
                  </p>
                  <p className="mt-2 font-semibold capitalize text-gray-800">
                    {user?.role || "Recruiter"}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-400">
                    Email
                  </p>
                  <p className="mt-2 break-all font-semibold text-gray-800">
                    {user?.email || "Not available"}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-400">
                    Phone
                  </p>
                  <p className="mt-2 font-semibold text-gray-800">
                    {user?.phone || "Not available"}
                  </p>
                </div>

                {designation && (
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 sm:col-span-2">
                    <p className="text-xs uppercase tracking-wider text-gray-400">
                      Designation
                    </p>
                    <p className="mt-2 font-semibold text-gray-800">
                      {designation}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* COMPANY INFORMATION */}

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <Building2 size={22} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Company Information
                  </h2>

                  <p className="text-sm text-gray-500">
                    Information about your company.
                  </p>
                </div>
              </div>

              {companyName ? (
                <div className="mt-6 space-y-5">
                  {/* COMPANY HEADER WITH LOGO */}

                  <div className="flex items-center gap-4">
                    {companyLogo ? (
                      <img
                        src={companyLogo}
                        alt={companyName}
                        className="h-14 w-14 rounded-xl border border-gray-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                        <Building2 size={24} />
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wider text-gray-400">
                        Company Name
                      </p>
                      <p className="mt-1 truncate text-xl font-bold text-gray-900">
                        {companyName}
                      </p>
                    </div>
                  </div>

                  {/* LOCATION */}

                  <div className="flex items-start gap-3">
                    <MapPin
                      size={19}
                      className="mt-0.5 text-gray-400"
                    />

                    <div>
                      <p className="text-xs text-gray-400">
                        Location
                      </p>
                      <p className="mt-1 text-sm text-gray-700">
                        {companyLocation || "Location not added"}
                      </p>
                    </div>
                  </div>

                  {/* WEBSITE */}

                  {companyWebsite && (
                    <div className="flex items-start gap-3">
                      <Globe
                        size={19}
                        className="mt-0.5 text-gray-400"
                      />

                      <div className="min-w-0">
                        <p className="text-xs text-gray-400">
                          Website
                        </p>

                        {websiteUrl ? (
                          <a
                            href={websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 block break-all text-sm font-medium text-blue-600 hover:underline"
                          >
                            {companyWebsite}
                          </a>
                        ) : (
                          <p className="mt-1 break-all text-sm text-gray-700">
                            {companyWebsite}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* DESCRIPTION */}

                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-400">
                      About Company
                    </p>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">
                      {companyDescription ||
                        "Company description has not been added yet."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-10 text-center">
                  <Building2
                    size={30}
                    className="mx-auto text-gray-300"
                  />

                  <p className="mt-3 text-sm font-semibold text-gray-700">
                    No company information
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Add your company details from settings.
                  </p>

                  <Link
                    to="/recruiter/settings"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    <Edit3 size={14} />
                    Add Company Info
                  </Link>
                </div>
              )}
            </section>

            {/* RECRUITER SUMMARY */}

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <Briefcase size={22} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Recruiter Summary
                  </h2>

                  <p className="text-sm text-gray-500">
                    Your recruiter account overview.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
                  <p className="text-xs text-gray-400">
                    Account Role
                  </p>
                  <p className="mt-2 font-bold capitalize text-gray-900">
                    {user?.role || "Recruiter"}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
                  <p className="text-xs text-gray-400">Company</p>
                  <p className="mt-2 truncate font-bold text-gray-900">
                    {companyName || "Not added"}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
                  <p className="text-xs text-gray-400">
                    Profile Status
                  </p>
                  <p
                    className={`mt-2 font-bold ${
                      isActive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}