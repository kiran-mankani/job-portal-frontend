import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Loader2,
  Trash2,
  Upload,
  UserRound,
  XCircle,
} from "lucide-react";

import { apiRequest } from "../../services/api";

function MyCV() {
  const authUser = useSelector((state) => state.auth?.user);
  const authToken = useSelector((state) => state.auth?.token);

  const token = authToken || localStorage.getItem("token");

  const fileInputRef = useRef(null);

  const [resumeUrl, setResumeUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // DELETE CONFIRMATION DIALOG
  // ==========================================

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // ==========================================
  // LOAD CURRENT USER
  // ==========================================

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      if (!token) {
        if (mounted) {
          setFetching(false);
          setError("Please login to manage your CV / Resume.");
        }

        return;
      }

      try {
        const response = await apiRequest(
          "/auth/me",
          "GET",
          null,
          token
        );

        if (!mounted) return;

        const user =
          response?.user ||
          response?.data ||
          response;

        setResumeUrl(
          user?.profile?.resume ||
          user?.resume ||
          ""
        );
      } catch (err) {
        if (!mounted) return;

        setError(
          err.message ||
            "Unable to load your CV / Resume."
        );
      } finally {
        if (mounted) {
          setFetching(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [token]);

  // ==========================================
  // SELECT FILE
  // ==========================================

  const handleFileChange = (event) => {
    setMessage("");
    setError("");

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const allowedExtensions = [
      ".pdf",
      ".doc",
      ".docx",
    ];

    const fileName = file.name.toLowerCase();

    const extension = fileName.includes(".")
      ? fileName.substring(
          fileName.lastIndexOf(".")
        )
      : "";

    if (
      !allowedTypes.includes(file.type) ||
      !allowedExtensions.includes(extension)
    ) {
      setSelectedFile(null);

      setError(
        "Only PDF, DOC, and DOCX files are allowed."
      );

      event.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setSelectedFile(null);

      setError(
        "CV / Resume must be 5 MB or smaller."
      );

      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  // ==========================================
  // UPLOAD RESUME
  // ==========================================

  const handleUpload = async () => {
    setMessage("");
    setError("");

    if (!token) {
      setError("Please login first.");
      return;
    }

    if (!selectedFile) {
      setError(
        "Please select a CV / Resume file first."
      );
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("resume", selectedFile);

      const response = await apiRequest(
        "/auth/profile/resume",
        "POST",
        formData,
        token
      );

      const uploadedUrl =
        response?.resume ||
        response?.user?.profile?.resume ||
        response?.user?.resume ||
        response?.data?.resume ||
        response?.file?.url ||
        "";

      if (!uploadedUrl) {
        console.error(
          "Resume upload response:",
          response
        );

        throw new Error(
          "Resume uploaded but no file URL was returned by the server."
        );
      }

      setResumeUrl(uploadedUrl);
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (response?.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(response.user)
        );
      }

      setMessage(
        "CV / Resume uploaded successfully."
      );
    } catch (err) {
      console.error(
        "Resume upload error:",
        err
      );

      setError(
        err.message ||
          "Failed to upload CV / Resume."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // VIEW / DOWNLOAD RESUME
  // ==========================================

  const handleViewDownload = async () => {
    if (!token) {
      setError("Please login first.");
      return;
    }

    if (!resumeUrl) {
      setError("No CV / Resume is available.");
      return;
    }

    try {
      setError("");
      setMessage("");
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/profile/resume/download",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        let errorMessage =
          "Unable to download your CV / Resume.";

        try {
          const errorData = await response.json();

          errorMessage =
            errorData?.message ||
            errorMessage;
        } catch {
          // Server did not return JSON.
        }

        throw new Error(errorMessage);
      }

      const blob = await response.blob();

      if (!blob || blob.size === 0) {
        throw new Error(
          "The downloaded CV / Resume is empty."
        );
      }

      const blobUrl =
        window.URL.createObjectURL(blob);

      const downloadLink =
        document.createElement("a");

      downloadLink.href = blobUrl;

      /*
       * Do not force a filename here.
       * The backend Content-Disposition header
       * provides the original CV filename.
       */
      downloadLink.style.display = "none";

      document.body.appendChild(downloadLink);

      downloadLink.click();

      downloadLink.remove();

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 1000);

      setMessage(
        "CV / Resume download started."
      );
    } catch (err) {
      console.error(
        "Resume download error:",
        err
      );

      setError(
        err.message ||
          "Unable to download your CV / Resume."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // OPEN DELETE CONFIRMATION
  // ==========================================

  const handleRemoveClick = () => {
    setMessage("");
    setError("");

    if (!token) {
      setError("Please login first.");
      return;
    }

    setShowDeleteDialog(true);
  };

  // ==========================================
  // REMOVE RESUME
  // ==========================================

  const handleRemove = async () => {
    setShowDeleteDialog(false);

    setMessage("");
    setError("");

    if (!token) {
      setError("Please login first.");
      return;
    }

    try {
      setLoading(true);

      const response = await apiRequest(
        "/auth/profile",
        "PUT",
        {
          resume: "",
        },
        token
      );

      setResumeUrl("");
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (response?.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(response.user)
        );
      }

      setMessage(
        "CV / Resume removed successfully."
      );
    } catch (err) {
      setError(
        err.message ||
          "Failed to remove CV / Resume."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FORMAT FILE SIZE
  // ==========================================

  const formatFileSize = (bytes) => {
    if (!bytes) {
      return "0 KB";
    }

    const mb = bytes / (1024 * 1024);

    if (mb >= 1) {
      return `${mb.toFixed(2)} MB`;
    }

    return `${Math.ceil(bytes / 1024)} KB`;
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <Loader2
              size={22}
              className="animate-spin text-blue-600"
            />

            <span className="text-sm font-medium text-slate-600">
              Loading your CV / Resume...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ======================================
          HEADER
      ====================================== */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">

          <div className="flex items-center gap-3">

            <Link
              to="/candidate/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
            >
              <ArrowLeft size={20} />
            </Link>

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <FileText size={22} />
              </div>

              <div>
                <h1 className="text-lg font-bold text-slate-900">
                  My CV / Resume
                </h1>

                <p className="text-xs text-slate-500">
                  Upload and manage your professional resume
                </p>
              </div>

            </div>
          </div>

          <Link
            to="/candidate/profile"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-600"
          >
            <UserRound size={17} />
            Profile
          </Link>

        </div>
      </header>

      {/* ======================================
          CONTENT
      ====================================== */}

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="mb-8">

          <p className="mb-2 text-sm font-semibold text-blue-600">
            Career Documents
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Upload your CV / Resume
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Upload your latest CV so recruiters can review your
            experience and qualifications.
          </p>

        </div>

        {/* SUCCESS */}

        {message && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">

            <CheckCircle2
              size={19}
              className="mt-0.5 shrink-0"
            />

            <span>{message}</span>

          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">

            <XCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>

          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">

          {/* ====================================
              UPLOAD CARD
          ==================================== */}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <div className="mb-6">

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Upload size={24} />
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                Upload CV
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Select a PDF, DOC, or DOCX file from your computer.
              </p>

            </div>

            {/* FILE INPUT */}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={loading}
              className="w-full rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/40 p-8 text-center transition hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                <Upload size={26} />
              </div>

              <p className="mt-4 text-sm font-bold text-slate-800">
                Choose your CV / Resume
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Click here to browse files from your computer
              </p>

              <p className="mt-3 text-[11px] font-medium text-slate-400">
                PDF, DOC, DOCX • Maximum 5 MB
              </p>

            </button>

            {/* SELECTED FILE */}

            {selectedFile && (
              <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                    <FileText size={21} />
                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="truncate text-sm font-bold text-slate-900">
                      {selectedFile.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {formatFileSize(selectedFile.size)}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);

                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-red-500"
                  >
                    <XCircle size={19} />
                  </button>

                </div>

                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={loading}
                  className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      Upload CV
                    </>
                  )}

                </button>

              </div>
            )}

            {/* CURRENT RESUME */}

            {resumeUrl && (
              <div className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                      <CheckCircle2 size={21} />
                    </div>

                    <div className="min-w-0">

                      <p className="text-sm font-bold text-slate-900">
                        CV Uploaded
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        Your resume is currently saved.
                      </p>

                    </div>

                  </div>

                  <div className="flex gap-2">

                    <button
                      type="button"
                      onClick={handleViewDownload}
                      disabled={loading}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <FileText size={15} />
                      View Download
                    </button>

                    <button
                      type="button"
                      onClick={handleRemoveClick}
                      disabled={loading}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                    >
                      <Trash2 size={15} />
                      Remove
                    </button>

                  </div>

                </div>

              </div>
            )}

          </section>

          {/* ====================================
              SIDE INFORMATION
          ==================================== */}

          <aside className="space-y-6">

            <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl">

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <BriefcaseBusiness size={23} />
              </div>

              <h3 className="text-lg font-bold">
                Keep your profile recruiter-ready
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Upload your latest resume and keep your profile
                information consistent with your CV.
              </p>

              <Link
                to="/candidate/profile"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                <UserRound size={17} />
                Update Profile
              </Link>

            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

              <h3 className="text-base font-bold text-slate-900">
                Upload Requirements
              </h3>

              <div className="mt-5 space-y-4">

                <div className="flex items-start gap-3">

                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0 text-emerald-500"
                  />

                  <div>

                    <p className="text-sm font-semibold text-slate-800">
                      Accepted formats
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      PDF, DOC and DOCX.
                    </p>

                  </div>

                </div>

                <div className="flex items-start gap-3">

                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0 text-emerald-500"
                  />

                  <div>

                    <p className="text-sm font-semibold text-slate-800">
                      Maximum size
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Your CV must be 5 MB or smaller.
                    </p>

                  </div>

                </div>

                <div className="flex items-start gap-3">

                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0 text-emerald-500"
                  />

                  <div>

                    <p className="text-sm font-semibold text-slate-800">
                      Professional CV
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Keep your latest CV uploaded so recruiters
                      can review your qualifications.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </aside>

        </div>
      </main>

      {/* ======================================
          DELETE CV CONFIRMATION DIALOG
      ====================================== */}

      {showDeleteDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-cv-title"
        >
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-7">

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <Trash2 size={23} />
              </div>

              <div className="min-w-0">

                <h2
                  id="delete-cv-title"
                  className="text-xl font-bold text-slate-900"
                >
                  Delete CV?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Are you sure you want to delete CV?
                </p>

              </div>

            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() => setShowDeleteDialog(false)}
                disabled={loading}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRemove}
                disabled={loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={17} />
                    Delete CV
                  </>
                )}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default MyCV;