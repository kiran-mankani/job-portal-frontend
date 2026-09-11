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

const getCompanyValue = (company, key, fallback = "") => {
  if (company && typeof company === "object") {
    return company?.[key] || fallback;
  }

  return fallback;
};

const getWebsiteUrl = (website) => {
  const value = String(website || "").trim();

  if (!value) {
    return "";
  }

  try {
    const parsedUrl = new URL(
      /^https?:\/\//i.test(value)
        ? value
        : `https://${value}`
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

export default function RecruiterProfile() {
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        const token = getToken();

        if (!token) {
          if (mounted) {
            setLoading(false);
          }
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

        if (
          mounted &&
          currentUser &&
          typeof currentUser === "object"
        ) {
          setUser(currentUser);

          localStorage.setItem(
            "user",
            JSON.stringify(currentUser)
          );
        }
      } catch (error) {
        console.error(
          "Recruiter profile error:",
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const companyName =
    getCompanyValue(
      user?.company,
      "name"
    ) ||
    user?.companyName ||
    "";

  const companyDescription =
    getCompanyValue(
      user?.company,
      "description"
    ) ||
    user?.companyDescription ||
    user?.description ||
    "";

  const companyLocation =
    getCompanyValue(
      user?.company,
      "location"
    ) ||
    user?.companyLocation ||
    user?.location ||
    "";

  const companyWebsite =
    getCompanyValue(
      user?.company,
      "website"
    ) ||
    user?.companyWebsite ||
    user?.website ||
    "";

  const websiteUrl =
    getWebsiteUrl(companyWebsite);

  const initials =
    String(
      user?.name ||
        user?.fullName ||
        "Recruiter"
    )
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "R";

  const normalizedStatus = String(
    user?.status || "active"
  )
    .trim()
    .toLowerCase();

  const isActive =
    normalizedStatus !== "blocked" &&
    normalizedStatus !== "inactive" &&
    normalizedStatus !== "suspended";

  const statusLabel = isActive
    ? "Active Recruiter"
    : "Inactive Recruiter";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="mt-3 text-sm text-gray-500">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

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
          {/* LEFT PROFILE CARD */}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              {/* PROFILE IMAGE */}

              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={
                    user?.name ||
                    user?.fullName ||
                    "Recruiter"
                  }
                  className="h-32 w-32 rounded-full border-4 border-gray-100 object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-700">
                  {initials}
                </div>
              )}

              {/* NAME */}

              <h2 className="mt-5 text-2xl font-bold text-gray-900">
                {user?.name ||
                  user?.fullName ||
                  "Recruiter"}
              </h2>

              {/* ROLE */}

              <p className="mt-1 text-sm text-gray-500">
                {user?.designation ||
                  user?.position ||
                  "Recruiter"}
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
                    isActive
                      ? "bg-green-500"
                      : "bg-red-500"
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
                    <p className="text-xs text-gray-400">
                      Email
                    </p>

                    <p className="mt-1 break-all text-sm font-medium text-gray-700">
                      {user?.email ||
                        "Not available"}
                    </p>
                  </div>
                </div>

                {/* PHONE */}

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Phone size={17} />
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">
                      Phone
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-700">
                      {user?.phone ||
                        "Not available"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT */}

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
                {/* FULL NAME */}

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-400">
                    Full Name
                  </p>

                  <p className="mt-2 font-semibold text-gray-800">
                    {user?.name ||
                      user?.fullName ||
                      "Not available"}
                  </p>
                </div>

                {/* ROLE */}

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-400">
                    Role
                  </p>

                  <p className="mt-2 font-semibold capitalize text-gray-800">
                    {user?.role ||
                      "Recruiter"}
                  </p>
                </div>

                {/* EMAIL */}

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-400">
                    Email
                  </p>

                  <p className="mt-2 break-all font-semibold text-gray-800">
                    {user?.email ||
                      "Not available"}
                  </p>
                </div>

                {/* PHONE */}

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-400">
                    Phone
                  </p>

                  <p className="mt-2 font-semibold text-gray-800">
                    {user?.phone ||
                      "Not available"}
                  </p>
                </div>
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

              <div className="mt-6 space-y-5">
                {/* COMPANY NAME */}

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400">
                    Company Name
                  </p>

                  <p className="mt-2 text-xl font-bold text-gray-900">
                    {companyName ||
                      "Company not added"}
                  </p>
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
                      {companyLocation ||
                        "Location not added"}
                    </p>
                  </div>
                </div>

                {/* WEBSITE */}

                {companyWebsite && websiteUrl && (
                  <div className="flex items-start gap-3">
                    <Globe
                      size={19}
                      className="mt-0.5 text-gray-400"
                    />

                    <div>
                      <p className="text-xs text-gray-400">
                        Website
                      </p>

                      <a
                        href={websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 block break-all text-sm font-medium text-blue-600 hover:underline"
                      >
                        {companyWebsite}
                      </a>
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
                {/* ACCOUNT ROLE */}

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
                  <p className="text-xs text-gray-400">
                    Account Role
                  </p>

                  <p className="mt-2 font-bold capitalize text-gray-900">
                    {user?.role ||
                      "Recruiter"}
                  </p>
                </div>

                {/* COMPANY */}

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
                  <p className="text-xs text-gray-400">
                    Company
                  </p>

                  <p className="mt-2 truncate font-bold text-gray-900">
                    {companyName ||
                      "Not added"}
                  </p>
                </div>

                {/* PROFILE STATUS */}

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
                  <p className="text-xs text-gray-400">
                    Profile Status
                  </p>

                  <p
                    className={`mt-2 font-bold ${
                      isActive
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {isActive
                      ? "Active"
                      : "Inactive"}
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