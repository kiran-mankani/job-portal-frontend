import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "../services/api";

// ==========================================
// TOKEN HELPER
// ==========================================

const getAuthToken = (token, getState) => {
  if (token) return token;

  const stateToken = getState()?.auth?.token;

  if (stateToken) {
    return stateToken;
  }

  return localStorage.getItem("token");
};

// ==========================================
// BUILD QUERY
// ==========================================

const buildApplicationQuery = ({
  page = 1,
  limit = 10,
  status = "",
  search = "",
  jobId = "",
} = {}) => {
  const params = new URLSearchParams();

  params.append("page", page);
  params.append("limit", limit);

  if (String(status).trim()) {
    params.append("status", String(status).trim());
  }

  if (String(search).trim()) {
    params.append("search", String(search).trim());
  }

  if (String(jobId).trim()) {
    params.append("jobId", String(jobId).trim());
  }

  return params.toString();
};

// ==========================================
// APPLY FOR JOB
// POST /api/applications/:jobId/apply
// ==========================================

export const applyForJob = createAsyncThunk(
  "applications/applyForJob",
  async (
    { jobId, coverLetter = "", token } = {},
    { rejectWithValue, getState }
  ) => {
    try {
      if (!jobId) {
        return rejectWithValue("Job ID is required");
      }

      const authToken = getAuthToken(token, getState);

      if (!authToken) {
        return rejectWithValue("Authentication token is required");
      }

      return await apiRequest(
        `/applications/${jobId}/apply`,
        "POST",
        { coverLetter },
        authToken
      );
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to apply for job"
      );
    }
  }
);

// ==========================================
// UPLOAD CV
// POST /api/applications/:applicationId/cv
// ==========================================

export const uploadCV = createAsyncThunk(
  "applications/uploadCV",
  async (
    { applicationId, file, token } = {},
    { rejectWithValue, getState }
  ) => {
    try {
      if (!applicationId) {
        return rejectWithValue("Application ID is required");
      }

      if (!file) {
        return rejectWithValue("CV file is required");
      }

      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type)) {
        return rejectWithValue(
          "Only PDF, DOC, and DOCX files are allowed"
        );
      }

      if (file.size > 5 * 1024 * 1024) {
        return rejectWithValue("CV file must be smaller than 5 MB");
      }

      const authToken = getAuthToken(token, getState);

      if (!authToken) {
        return rejectWithValue("Authentication token is required");
      }

      const formData = new FormData();

      // ⚠️ Field name must match what multer expects on the backend.
      // Your backend route uses `upload.single("resume")`.
      formData.append("resume", file);

      // ⚠️ Path must match the registered route.
      return await apiRequest(
        `/applications/${applicationId}/resume`,
        "POST",
        formData,
        authToken
      );
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to upload CV"
      );
    }
  }
);

// ==========================================
// GET MY APPLICATIONS (PAGINATED)
// GET /api/applications/my-applications?page=1&limit=10
// ==========================================

export const getMyApplications = createAsyncThunk(
  "applications/getMyApplications",
  async (
    { page = 1, limit = 10, status = "", search = "", token } = {},
    { rejectWithValue, getState }
  ) => {
    try {
      const authToken = getAuthToken(token, getState);

      if (!authToken) {
        return rejectWithValue("Authentication token is required");
      }

      const query = buildApplicationQuery({
        page,
        limit,
        status,
        search,
      });

      const data = await apiRequest(
        `/applications/my-applications?${query}`,
        "GET",
        null,
        authToken
      );

      return {
        applications:
          data?.applications || data?.data || [],
        pagination:
          data?.pagination || {
            page,
            limit,
            total: 0,
            totalPages: 1,
          },
        message: data?.message || "",
      };
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch applications"
      );
    }
  }
);

// ==========================================
// GET APPLICATION DETAILS
// ==========================================

export const getApplicationDetails = createAsyncThunk(
  "applications/getApplicationDetails",
  async (
    { id, applicationId, token } = {},
    { rejectWithValue, getState }
  ) => {
    try {
      const finalId = id || applicationId;

      if (!finalId) {
        return rejectWithValue("Application ID is required");
      }

      const authToken = getAuthToken(token, getState);

      if (!authToken) {
        return rejectWithValue("Authentication token is required");
      }

      return await apiRequest(
        `/applications/${finalId}`,
        "GET",
        null,
        authToken
      );
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch application details"
      );
    }
  }
);

// ==========================================
// GET RECRUITER APPLICATIONS (PAGINATED)
// ==========================================

export const getRecruiterApplications = createAsyncThunk(
  "applications/getRecruiterApplications",
  async (
    {
      page = 1,
      limit = 10,
      status = "",
      search = "",
      jobId = "",
      token,
    } = {},
    { rejectWithValue, getState }
  ) => {
    try {
      const authToken = getAuthToken(token, getState);

      if (!authToken) {
        return rejectWithValue("Authentication token is required");
      }

      const query = buildApplicationQuery({
        page,
        limit,
        status,
        search,
        jobId,
      });

      const data = await apiRequest(
        `/applications/recruiter?${query}`,
        "GET",
        null,
        authToken
      );

      return {
        applications:
          data?.applications || data?.data || [],
        pagination:
          data?.pagination || {
            page,
            limit,
            total: 0,
            totalPages: 1,
          },
        message: data?.message || "",
      };
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch recruiter applications"
      );
    }
  }
);

// ==========================================
// UPDATE APPLICATION STATUS
// ==========================================

export const updateApplicationStatus = createAsyncThunk(
  "applications/updateApplicationStatus",
  async (
    { id, applicationId, status, token } = {},
    { rejectWithValue, getState }
  ) => {
    try {
      const finalId = id || applicationId;

      if (!finalId) {
        return rejectWithValue("Application ID is required");
      }

      if (!status) {
        return rejectWithValue("Application status is required");
      }

      const allowedStatuses = [
        "pending",
        "reviewing",
        "shortlisted",
        "rejected",
        "hired",
      ];

      if (!allowedStatuses.includes(status)) {
        return rejectWithValue("Invalid application status");
      }

      const authToken = getAuthToken(token, getState);

      if (!authToken) {
        return rejectWithValue("Authentication token is required");
      }

      return await apiRequest(
        `/applications/${finalId}/status`,
        "PUT",
        { status },
        authToken
      );
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to update application status"
      );
    }
  }
);

// ==========================================
// WITHDRAW APPLICATION
// ==========================================

export const withdrawApplication = createAsyncThunk(
  "applications/withdrawApplication",
  async (
    { id, applicationId, token } = {},
    { rejectWithValue, getState }
  ) => {
    try {
      const finalId = id || applicationId;

      if (!finalId) {
        return rejectWithValue("Application ID is required");
      }

      const authToken = getAuthToken(token, getState);

      if (!authToken) {
        return rejectWithValue("Authentication token is required");
      }

      return await apiRequest(
        `/applications/${finalId}/withdraw`,
        "PUT",
        null,
        authToken
      );
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to withdraw application"
      );
    }
  }
);

// ==========================================
// INITIAL STATE
// ==========================================

const initialState = {
  applications: [],
  application: null,

  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },

  loading: false,
  error: null,
  success: null,
};

// ==========================================
// SLICE
// ==========================================

const applicationSlice = createSlice({
  name: "applications",
  initialState,

  reducers: {
    clearApplicationError: (state) => {
      state.error = null;
    },

    clearApplicationSuccess: (state) => {
      state.success = null;
    },

    clearSelectedApplication: (state) => {
      state.application = null;
    },

    clearApplications: (state) => {
      state.applications = [];
      state.application = null;
      state.error = null;
      state.success = null;
      state.pagination = { ...initialState.pagination };
    },
  },

  extraReducers: (builder) => {
    // ========================================
    // APPLY FOR JOB
    // ========================================

    builder
      .addCase(applyForJob.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(applyForJob.fulfilled, (state, action) => {
        state.loading = false;
        state.success =
          action.payload?.message ||
          "Job application submitted successfully";

        const newApplication =
          action.payload?.application ||
          action.payload?.data ||
          null;

        if (newApplication) {
          const alreadyExists = state.applications.some(
            (item) => item._id === newApplication._id
          );

          if (!alreadyExists) {
            state.applications.unshift(newApplication);
          }

          state.application = newApplication;
        }
      })
      .addCase(applyForJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to apply for job";
      });

    // ========================================
    // UPLOAD CV
    // ========================================

    builder
      .addCase(uploadCV.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(uploadCV.fulfilled, (state, action) => {
        state.loading = false;
        state.success =
          action.payload?.message || "CV uploaded successfully";

        const updatedApplication =
          action.payload?.application ||
          action.payload?.data ||
          null;

        if (updatedApplication) {
          state.application = updatedApplication;

          const index = state.applications.findIndex(
            (item) => item._id === updatedApplication._id
          );

          if (index !== -1) {
            state.applications[index] = updatedApplication;
          }
        }
      })
      .addCase(uploadCV.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to upload CV";
      });

    // ========================================
    // GET MY APPLICATIONS
    // ========================================

    builder
      .addCase(getMyApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload.applications;
        state.pagination =
          action.payload.pagination || state.pagination;
      })
      .addCase(getMyApplications.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to fetch applications";
      });

    // ========================================
    // GET APPLICATION DETAILS
    // ========================================

    builder
      .addCase(getApplicationDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getApplicationDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.application =
          action.payload?.application ||
          action.payload?.data ||
          action.payload ||
          null;
      })
      .addCase(getApplicationDetails.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to fetch application details";
      });

    // ========================================
    // GET RECRUITER APPLICATIONS
    // ========================================

    builder
      .addCase(getRecruiterApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getRecruiterApplications.fulfilled,
        (state, action) => {
          state.loading = false;
          state.applications = action.payload.applications;
          state.pagination =
            action.payload.pagination || state.pagination;
        }
      )
      .addCase(
        getRecruiterApplications.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to fetch recruiter applications";
        }
      );

    // ========================================
    // UPDATE APPLICATION STATUS
    // ========================================

    builder
      .addCase(updateApplicationStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(
        updateApplicationStatus.fulfilled,
        (state, action) => {
          state.loading = false;
          state.success =
            action.payload?.message ||
            "Application status updated successfully";

          const updatedApplication =
            action.payload?.application ||
            action.payload?.data ||
            null;

          if (updatedApplication) {
            state.application = updatedApplication;

            const index = state.applications.findIndex(
              (item) => item._id === updatedApplication._id
            );

            if (index !== -1) {
              state.applications[index] = updatedApplication;
            }
          }
        }
      )
      .addCase(
        updateApplicationStatus.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to update application status";
        }
      );

    // ========================================
    // WITHDRAW APPLICATION
    // ========================================

    builder
      .addCase(withdrawApplication.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(withdrawApplication.fulfilled, (state, action) => {
        state.loading = false;
        state.success =
          action.payload?.message ||
          "Application withdrawn successfully";

        const withdrawnApplication =
          action.payload?.application ||
          action.payload?.data ||
          null;

        if (withdrawnApplication) {
          state.application = withdrawnApplication;

          const index = state.applications.findIndex(
            (item) => item._id === withdrawnApplication._id
          );

          if (index !== -1) {
            state.applications[index] = withdrawnApplication;
          }
        }
      })
      .addCase(withdrawApplication.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to withdraw application";
      });
  },
});

// ==========================================
// ACTIONS
// ==========================================

export const {
  clearApplicationError,
  clearApplicationSuccess,
  clearSelectedApplication,
  clearApplications,
} = applicationSlice.actions;

// ==========================================
// SELECTORS
// ==========================================

export const selectApplications = (state) =>
  state.applications?.applications || [];

export const selectApplication = (state) =>
  state.applications?.application || null;

export const selectApplicationLoading = (state) =>
  state.applications?.loading || false;

export const selectApplicationError = (state) =>
  state.applications?.error || null;

export const selectApplicationSuccess = (state) =>
  state.applications?.success || null;

export const selectApplicationPagination = (state) =>
  state.applications?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  };

// ==========================================
// EXPORT REDUCER
// ==========================================

export default applicationSlice.reducer;