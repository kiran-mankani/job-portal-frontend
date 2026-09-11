
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Bookmark,
  BookmarkCheck,
} from "lucide-react";

import {
  getAllJobs,
  getSavedJobs,
  saveJob,
  unsaveJob,
  clearJobError,
  selectSavedJobs,
  selectSavingJobIds,
} from "../../store/jobSlice";

function JobList() {
  const dispatch = useDispatch();

  const {
    jobs = [],
    loading,
    error,
    pagination,
  } = useSelector((state) => state.job);

  const savedJobs = useSelector(selectSavedJobs);
  const savingJobIds = useSelector(selectSavingJobIds);

  const user = useSelector((state) => state.auth?.user);
  const userRole = user?.role;

  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");

  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const limit = pagination?.limit || 10;

  // ======================================================
  // CHECK SAVED JOB
  // ======================================================

  const isJobSaved = (jobId) => {
    return savedJobs.some(
      (savedJob) =>
        String(savedJob?._id) === String(jobId)
    );
  };

  // ======================================================
  // LOAD JOBS + SAVED JOBS
  // ======================================================

  useEffect(() => {
    dispatch(
      getAllJobs({
        page: 1,
        limit,
      })
    );

    // Saved jobs require an authenticated candidate.
    if (userRole === "candidate") {
      dispatch(getSavedJobs());
    }
  }, [dispatch, limit, userRole]);

  // ======================================================
  // SAVE / UNSAVE JOB
  // ======================================================

  const handleSaveToggle = async (e, jobId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!jobId) {
      return;
    }

    if (savingJobIds?.[jobId]) {
      return;
    }

    if (isJobSaved(jobId)) {
      dispatch(
        unsaveJob({
          jobId,
        })
      );
    } else {
      dispatch(
        saveJob({
          jobId,
        })
      );
    }
  };

  // ======================================================
  // SEARCH
  // ======================================================

  const handleSearch = (e) => {
    e.preventDefault();

    const trimmedKeyword = keyword.trim();
    const trimmedLocation = location.trim();

    dispatch(clearJobError());

    dispatch(
      getAllJobs({
        page: 1,
        limit,
        search: trimmedKeyword,
        location: trimmedLocation,
      })
    );
  };

  // ======================================================
  // CLEAR SEARCH
  // ======================================================

  const handleClear = () => {
    setKeyword("");
    setLocation("");

    dispatch(clearJobError());

    dispatch(
      getAllJobs({
        page: 1,
        limit,
      })
    );
  };

  // ======================================================
  // PAGINATION
  // ======================================================

  const loadPage = (page) => {
    if (
      loading ||
      page < 1 ||
      page > totalPages ||
      page === currentPage
    ) {
      return;
    }

    dispatch(clearJobError());

    dispatch(
      getAllJobs({
        page,
        limit,
        search: keyword.trim(),
        location: location.trim(),
      })
    );
  };

  const handlePrevious = () => {
    loadPage(currentPage - 1);
  };

  const handleNext = () => {
    loadPage(currentPage + 1);
  };

  // ======================================================
  // PAGE NUMBERS
  // ======================================================

  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let page = 1; page <= totalPages; page += 1) {
        pages.push(page);
      }

      return pages;
    }

    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(
      totalPages - 1,
      currentPage + 1
    );

    for (
      let page = startPage;
      page <= endPage;
      page += 1
    ) {
      if (!pages.includes(page)) {
        pages.push(page);
      }
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    if (!pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  };

  // ======================================================
  // SALARY DISPLAY
  // ======================================================

  const getSalaryText = (job) => {
    const minSalary = job?.minSalary;
    const maxSalary = job?.maxSalary;

    if (
      minSalary !== undefined &&
      minSalary !== null &&
      maxSalary !== undefined &&
      maxSalary !== null
    ) {
      return `${minSalary} - ${maxSalary}`;
    }

    if (
      minSalary !== undefined &&
      minSalary !== null
    ) {
      return `${minSalary}+`;
    }

    if (
      maxSalary !== undefined &&
      maxSalary !== null
    ) {
      return `Up to ${maxSalary}`;
    }

    if (job?.salary) {
      return String(job.salary);
    }

    return "";
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div style={styles.container}>
      {/* ==================================================
          HEADER
      ================================================== */}

      <div style={styles.header}>
        <h1 style={styles.heading}>Find Jobs</h1>

        <p style={styles.subtitle}>
          Search for your next opportunity
        </p>
      </div>

      {/* ==================================================
          SEARCH
      ================================================== */}

      <form
        onSubmit={handleSearch}
        style={styles.searchBox}
      >
        <input
          type="text"
          placeholder="Job title, keyword..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={styles.input}
          maxLength={100}
        />

        <input
          type="text"
          placeholder="Location..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={styles.input}
          maxLength={100}
        />

        <button
          type="submit"
          style={{
            ...styles.searchButton,
            ...(loading
              ? styles.disabledButton
              : {}),
          }}
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>

        <button
          type="button"
          onClick={handleClear}
          style={styles.clearButton}
          disabled={loading}
        >
          Clear
        </button>
      </form>

      {/* ==================================================
          SEARCH INFO
      ================================================== */}

      {(keyword.trim() || location.trim()) && (
        <div style={styles.searchInfo}>
          {keyword.trim() && (
            <span>
              Keyword:{" "}
              <strong>{keyword.trim()}</strong>
            </span>
          )}

          {location.trim() && (
            <span>
              Location:{" "}
              <strong>{location.trim()}</strong>
            </span>
          )}

          {pagination?.total !== undefined && (
            <span>
              {pagination.total} job
              {pagination.total === 1 ? "" : "s"} found
            </span>
          )}
        </div>
      )}

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div style={styles.error} role="alert">
          {error}
        </div>
      )}

      {/* ==================================================
          LOADING
      ================================================== */}

      {loading && (
        <div style={styles.message}>
          <p>Loading jobs...</p>
        </div>
      )}

      {/* ==================================================
          EMPTY STATE
      ================================================== */}

      {!loading && jobs.length === 0 && (
        <div style={styles.emptyState}>
          <h2>No jobs found</h2>

          <p>
            {keyword.trim() || location.trim()
              ? "Try changing your search keywords or location."
              : "There are no active jobs available right now."}
          </p>
        </div>
      )}

      {/* ==================================================
          JOB LIST
      ================================================== */}

      {!loading && jobs.length > 0 && (
        <>
          <div style={styles.jobsHeader}>
            <div>
              <h2 style={styles.resultsTitle}>
                Available Jobs
              </h2>

              {pagination?.total !== undefined && (
                <p style={styles.resultsCount}>
                  Showing page {currentPage} of{" "}
                  {totalPages} • {pagination.total} total
                  jobs
                </p>
              )}
            </div>
          </div>

          <div style={styles.jobsGrid}>
            {jobs.map((job) => {
              const salaryText = getSalaryText(job);
              const saved = isJobSaved(job._id);
              const saving =
                savingJobIds?.[job._id] || false;

              return (
                <div
                  key={job._id}
                  style={styles.jobCard}
                >
                  {/* ==================================================
                      JOB CARD HEADER
                  ================================================== */}

                  <div style={styles.cardHeader}>
                    <h2 style={styles.jobTitle}>
                      {job.title || "Untitled Job"}
                    </h2>

                    {userRole === "candidate" && (
                      <button
                        type="button"
                        onClick={(e) =>
                          handleSaveToggle(e, job._id)
                        }
                        disabled={saving}
                        aria-label={
                          saved
                            ? "Remove job from saved jobs"
                            : "Save job"
                        }
                        title={
                          saved
                            ? "Remove from saved jobs"
                            : "Save job"
                        }
                        style={{
                          ...styles.saveButton,
                          ...(saved
                            ? styles.savedButton
                            : {}),
                          ...(saving
                            ? styles.savingButton
                            : {}),
                        }}
                      >
                        {saved ? (
                          <BookmarkCheck
                            size={21}
                            strokeWidth={2.2}
                          />
                        ) : (
                          <Bookmark
                            size={21}
                            strokeWidth={2.2}
                          />
                        )}
                      </button>
                    )}
                  </div>

                  {/* ==================================================
                      COMPANY
                  ================================================== */}

                  <p style={styles.info}>
                    <strong>Company:</strong>{" "}
                    {job.company ||
                      job.companyName ||
                      job.recruiter?.companyName ||
                      "N/A"}
                  </p>

                  {/* ==================================================
                      LOCATION
                  ================================================== */}

                  <p style={styles.info}>
                    <strong>Location:</strong>{" "}
                    {job.location || "N/A"}
                  </p>

                  {/* ==================================================
                      JOB TYPE
                  ================================================== */}

                  <p style={styles.info}>
                    <strong>Job Type:</strong>{" "}
                    {job.jobType ||
                      job.type ||
                      "N/A"}
                  </p>

                  {/* ==================================================
                      CATEGORY
                  ================================================== */}

                  {job.category && (
                    <p style={styles.info}>
                      <strong>Category:</strong>{" "}
                      {job.category}
                    </p>
                  )}

                  {/* ==================================================
                      EXPERIENCE
                  ================================================== */}

                  {job.experienceLevel && (
                    <p style={styles.info}>
                      <strong>Experience:</strong>{" "}
                      {job.experienceLevel}
                    </p>
                  )}

                  {/* ==================================================
                      SALARY
                  ================================================== */}

                  {salaryText && (
                    <p style={styles.info}>
                      <strong>Salary:</strong>{" "}
                      {salaryText}
                    </p>
                  )}

                  {/* ==================================================
                      DESCRIPTION
                  ================================================== */}

                  {job.description && (
                    <p style={styles.description}>
                      {String(job.description).length >
                      150
                        ? `${String(
                            job.description
                          ).substring(0, 150)}...`
                        : job.description}
                    </p>
                  )}

                  {/* ==================================================
                      SKILLS
                  ================================================== */}

                  {Array.isArray(job.skills) &&
                    job.skills.length > 0 && (
                      <div style={styles.skills}>
                        {job.skills
                          .slice(0, 5)
                          .map((skill, index) => (
                            <span
                              key={`${skill}-${index}`}
                              style={styles.skill}
                            >
                              {skill}
                            </span>
                          ))}

                        {job.skills.length > 5 && (
                          <span
                            style={styles.moreSkills}
                          >
                            +{job.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    )}

                  {/* ==================================================
                      DETAILS BUTTON
                  ================================================== */}

                  <Link
                    to={`/jobs/${job._id}`}
                    style={styles.detailsButton}
                  >
                    View Details
                  </Link>
                </div>
              );
            })}
          </div>

          {/* ==================================================
              PAGINATION
          ================================================== */}

          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                type="button"
                onClick={handlePrevious}
                disabled={
                  loading || currentPage <= 1
                }
                style={{
                  ...styles.pageButton,
                  ...(currentPage <= 1
                    ? styles.disabledPageButton
                    : {}),
                }}
              >
                ← Previous
              </button>

              <div style={styles.pageNumbers}>
                {getPageNumbers().map(
                  (page, index) =>
                    page === "..." ? (
                      <span
                        key={`ellipsis-${index}`}
                        style={styles.ellipsis}
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        type="button"
                        onClick={() => loadPage(page)}
                        disabled={
                          loading ||
                          page === currentPage
                        }
                        style={{
                          ...styles.numberButton,
                          ...(page === currentPage
                            ? styles.activePageButton
                            : {}),
                        }}
                      >
                        {page}
                      </button>
                    )
                )}
              </div>

              <button
                type="button"
                onClick={handleNext}
                disabled={
                  loading ||
                  currentPage >= totalPages
                }
                style={{
                  ...styles.pageButton,
                  ...(currentPage >= totalPages
                    ? styles.disabledPageButton
                    : {}),
                }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "30px 20px 60px",
  },

  header: {
    textAlign: "center",
    marginBottom: "30px",
  },

  heading: {
    margin: "0 0 8px",
    color: "#0f172a",
    fontSize: "32px",
  },

  subtitle: {
    margin: 0,
    color: "#64748b",
    fontSize: "16px",
  },

  searchBox: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },

  input: {
    flex: "1",
    minWidth: "220px",
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
  },

  searchButton: {
    padding: "12px 20px",
    border: "none",
    borderRadius: "6px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },

  disabledButton: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  clearButton: {
    padding: "12px 20px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    background: "#fff",
    color: "#334155",
    cursor: "pointer",
    fontWeight: "500",
  },

  searchInfo: {
    display: "flex",
    gap: "18px",
    flexWrap: "wrap",
    marginBottom: "20px",
    padding: "12px 16px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    color: "#475569",
    fontSize: "14px",
  },

  error: {
    padding: "12px",
    marginBottom: "20px",
    background: "#fee2e2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    borderRadius: "6px",
  },

  message: {
    textAlign: "center",
    padding: "50px 20px",
    color: "#64748b",
  },

  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#64748b",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    background: "#fff",
  },

  jobsHeader: {
    marginBottom: "18px",
  },

  resultsTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: "22px",
  },

  resultsCount: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },

  jobsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },

  jobCard: {
    position: "relative",
    padding: "20px",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    background: "#fff",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
  },

  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "15px",
  },

  jobTitle: {
    flex: 1,
    margin: 0,
    color: "#0f172a",
    fontSize: "21px",
    lineHeight: "1.35",
  },

  saveButton: {
    flexShrink: 0,
    width: "42px",
    height: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    background: "#fff",
    color: "#64748b",
    cursor: "pointer",
    transition:
      "all 0.2s ease",
  },

  savedButton: {
    background: "#eff6ff",
    color: "#2563eb",
    borderColor: "#93c5fd",
  },

  savingButton: {
    opacity: 0.55,
    cursor: "not-allowed",
  },

  info: {
    margin: "8px 0",
    color: "#475569",
    fontSize: "14px",
  },

  description: {
    marginTop: "15px",
    color: "#64748b",
    lineHeight: "1.6",
    whiteSpace: "pre-line",
  },

  skills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginTop: "15px",
  },

  skill: {
    padding: "5px 9px",
    borderRadius: "15px",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontSize: "12px",
    fontWeight: "500",
  },

  moreSkills: {
    padding: "5px 9px",
    color: "#64748b",
    fontSize: "12px",
  },

  detailsButton: {
    display: "inline-block",
    marginTop: "18px",
    padding: "10px 16px",
    background: "#2563eb",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "6px",
    fontWeight: "600",
    fontSize: "14px",
  },

  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "35px",
  },

  pageNumbers: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  pageButton: {
    padding: "9px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    background: "#fff",
    color: "#334155",
    cursor: "pointer",
    fontWeight: "600",
  },

  numberButton: {
    minWidth: "38px",
    height: "38px",
    padding: "0 10px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    background: "#fff",
    color: "#334155",
    cursor: "pointer",
    fontWeight: "600",
  },

  activePageButton: {
    background: "#2563eb",
    color: "#fff",
    borderColor: "#2563eb",
    cursor: "default",
  },

  disabledPageButton: {
    opacity: 0.5,
    cursor: "not-allowed",
  },

  ellipsis: {
    padding: "0 4px",
    color: "#64748b",
  },
};

export default JobList;

