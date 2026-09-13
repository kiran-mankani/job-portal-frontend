import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getMyApplications,
  clearApplicationError,
  clearSelectedApplication,
} from "../../store/applicationSlice";

function MyApplications() {
  const dispatch = useDispatch();

  const { token } = useSelector((state) => state.auth);

  const {
    applications,
    loading,
    error,
    pagination,
  } = useSelector((state) => state.applications);

  const [keyword, setKeyword] = useState("");

  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const limit = pagination?.limit || 10;

  const isFirstRender = useRef(true);
  const lastDispatchedKeyword = useRef("");

  // ==========================================
  // GET MY APPLICATIONS (INITIAL)
  // ==========================================

  useEffect(() => {
    if (token) {
      dispatch(
        getMyApplications({
          page: 1,
          limit,
          search: "",
          token,
        })
      );
    }

    return () => {
      dispatch(clearSelectedApplication());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, token, limit]);

  // ==========================================
  // LIVE SEARCH (DEBOUNCED)
  // ==========================================

  useEffect(() => {
    if (!token) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const trimmed = keyword.trim();

    if (trimmed === lastDispatchedKeyword.current) {
      return;
    }

    const timer = setTimeout(() => {
      lastDispatchedKeyword.current = trimmed;

      dispatch(clearApplicationError());

      dispatch(
        getMyApplications({
          page: 1,
          limit,
          search: trimmed,
          token,
        })
      );
    }, 400);

    return () => clearTimeout(timer);
  }, [keyword, dispatch, token, limit]);

  // ==========================================
  // RETRY
  // ==========================================

  const handleRetry = () => {
    dispatch(clearApplicationError());

    if (token) {
      dispatch(
        getMyApplications({
          page: currentPage,
          limit,
          search: keyword.trim(),
          token,
        })
      );
    }
  };

  // ==========================================
  // CLEAR SEARCH
  // ==========================================

  const handleClear = () => {
    setKeyword("");
    lastDispatchedKeyword.current = "";

    dispatch(clearApplicationError());

    if (token) {
      dispatch(
        getMyApplications({
          page: 1,
          limit,
          search: "",
          token,
        })
      );
    }
  };

  // ==========================================
  // PAGINATION
  // ==========================================

  const loadPage = (page) => {
    if (
      loading ||
      page < 1 ||
      page > totalPages ||
      page === currentPage ||
      !token
    ) {
      return;
    }

    dispatch(clearApplicationError());

    dispatch(
      getMyApplications({
        page,
        limit,
        search: keyword.trim(),
        token,
      })
    );
  };

  const handlePrevious = () => loadPage(currentPage - 1);
  const handleNext = () => loadPage(currentPage + 1);

  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let page = 1; page <= totalPages; page += 1) {
        pages.push(page);
      }
      return pages;
    }

    pages.push(1);

    if (currentPage > 3) pages.push("...");

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let page = startPage; page <= endPage; page += 1) {
      if (!pages.includes(page)) pages.push(page);
    }

    if (currentPage < totalPages - 2) pages.push("...");
    if (!pages.includes(totalPages)) pages.push(totalPages);

    return pages;
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1>My Applications</h1>
          <p style={styles.subtitle}>
            Track the jobs you have applied for.
          </p>
        </div>

        <Link to="/jobs" style={styles.jobsButton}>
          Browse Jobs
        </Link>
      </div>

      {/* SEARCH */}
      <div style={styles.searchBox}>
        <input
          type="text"
          placeholder="Search by job title..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={styles.input}
          maxLength={100}
          autoComplete="off"
        />

        <button
          type="button"
          onClick={handleClear}
          style={styles.clearButton}
          disabled={loading && !keyword}
        >
          Clear
        </button>
      </div>

      {/* SEARCH INFO */}
      {keyword.trim() && (
        <div style={styles.searchInfo}>
          <span>
            Keyword: <strong>{keyword.trim()}</strong>
          </span>

          {loading ? (
            <span>Searching…</span>
          ) : (
            pagination?.total !== undefined && (
              <span>
                {pagination.total} application
                {pagination.total === 1 ? "" : "s"} found
              </span>
            )
          )}
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div style={styles.error}>
          <div>
            <strong>Error:</strong> {error}
          </div>
          <button onClick={handleRetry} style={styles.retryButton}>
            Retry
          </button>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div style={styles.message}>Loading applications...</div>
      )}

      {/* EMPTY */}
      {!loading && !error && applications.length === 0 && (
        <div style={styles.empty}>
          <h2>No Applications Yet</h2>
          <p>
            {keyword.trim()
              ? `No applications match "${keyword.trim()}".`
              : "You have not applied for any jobs yet."}
          </p>
          <Link to="/jobs" style={styles.jobsButton}>
            Find Jobs
          </Link>
        </div>
      )}

      {/* APPLICATIONS */}
      {!loading && applications.length > 0 && (
        <>
          <div style={styles.listHeader}>
            <h2 style={styles.listTitle}>Applications</h2>
            {pagination?.total !== undefined && (
              <p style={styles.listCount}>
                Showing page {currentPage} of {totalPages} •{" "}
                {pagination.total} total
              </p>
            )}
          </div>

          <div style={styles.list}>
            {applications.map((application) => {
              const job = application.job;

              return (
                <div key={application._id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div>
                      <h2 style={styles.jobTitle}>
                        {job?.title || "Job Title Not Available"}
                      </h2>

                      <p style={styles.company}>
                        {job?.company ||
                          job?.companyName ||
                          job?.companyId?.name ||
                          "Company not available"}
                      </p>
                    </div>

                    <span
                      style={{
                        ...styles.status,
                        ...(application.status
                          ? getStatusStyle(application.status)
                          : {}),
                      }}
                    >
                      {application.status || "pending"}
                    </span>
                  </div>

                  <div style={styles.details}>
                    <p>
                      <strong>Location:</strong>{" "}
                      {job?.location || "N/A"}
                    </p>
                    <p>
                      <strong>Job Type:</strong>{" "}
                      {job?.jobType || job?.type || "N/A"}
                    </p>
                    <p>
                      <strong>Applied:</strong>{" "}
                      {application.createdAt
                        ? new Date(
                            application.createdAt
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                    {application.cvUrl && (
                      <p>
                        <strong>CV:</strong> Uploaded
                      </p>
                    )}
                  </div>

                  <div style={styles.actions}>
                    {application._id && (
                      <Link
                        to={`/candidate/applications/${application._id}`}
                        style={styles.viewButton}
                      >
                        View Application
                      </Link>
                    )}

                    {job?._id && (
                      <Link
                        to={`/jobs/${job._id}`}
                        style={styles.jobButton}
                      >
                        View Job
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                type="button"
                onClick={handlePrevious}
                disabled={loading || currentPage <= 1}
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
                {getPageNumbers().map((page, index) =>
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
                      disabled={loading || page === currentPage}
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
                disabled={loading || currentPage >= totalPages}
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

// ==========================================
// STATUS STYLE
// ==========================================

function getStatusStyle(status) {
  const normalizedStatus = String(status).toLowerCase();

  if (
    normalizedStatus === "accepted" ||
    normalizedStatus === "approved" ||
    normalizedStatus === "shortlisted" ||
    normalizedStatus === "hired"
  ) {
    return { background: "#e5ffe9", color: "#087a21" };
  }

  if (
    normalizedStatus === "rejected" ||
    normalizedStatus === "declined"
  ) {
    return { background: "#ffe5e5", color: "#c00" };
  }

  if (
    normalizedStatus === "withdrawn" ||
    normalizedStatus === "cancelled"
  ) {
    return { background: "#eee", color: "#555" };
  }

  return { background: "#fff4d6", color: "#946200" };
}

// ==========================================
// STYLES
// ==========================================

const styles = {
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "30px 20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "30px",
  },
  subtitle: { color: "#666", marginTop: "5px" },
  jobsButton: {
    display: "inline-block",
    padding: "11px 18px",
    background: "#2563eb",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "6px",
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    padding: "15px",
    marginBottom: "20px",
    background: "#ffe5e5",
    color: "#c00",
    borderRadius: "6px",
  },
  retryButton: {
    padding: "8px 14px",
    border: "none",
    borderRadius: "5px",
    background: "#c00",
    color: "#fff",
    cursor: "pointer",
  },
  message: {
    textAlign: "center",
    padding: "50px",
    color: "#666",
  },
  empty: {
    textAlign: "center",
    padding: "60px 20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    background: "#fff",
  },
  listHeader: { marginBottom: "18px" },
  listTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: "22px",
  },
  listCount: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  card: {
    padding: "22px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    background: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "18px",
  },
  jobTitle: { margin: 0, marginBottom: "6px" },
  company: { margin: 0, color: "#555", fontSize: "16px" },
  status: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    textTransform: "capitalize",
    whiteSpace: "nowrap",
  },
  details: { color: "#555", lineHeight: "1.5" },
  actions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "20px",
  },
  viewButton: {
    display: "inline-block",
    padding: "9px 15px",
    background: "#2563eb",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "5px",
  },
  jobButton: {
    display: "inline-block",
    padding: "9px 15px",
    background: "#fff",
    color: "#2563eb",
    border: "1px solid #2563eb",
    textDecoration: "none",
    borderRadius: "5px",
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

export default MyApplications;