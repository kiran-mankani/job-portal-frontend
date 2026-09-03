import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "../services/api";


// ==========================================
// APPLY FOR JOB
// ==========================================

export const applyForJob = createAsyncThunk(
  "applications/applyForJob",
  async ({ jobId, token }, { rejectWithValue }) => {
    try {
      if (!jobId) {
        return rejectWithValue("Job ID is required");
      }

      if (!token) {
        return rejectWithValue("Authentication token is required");
      }

      return await apiRequest(
        "/applications",
        "POST",
        { jobId },
        token
      );
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


// ==========================================
// UPLOAD CV
// ==========================================

export const uploadCV = createAsyncThunk(
  "applications/uploadCV",
  async ({ applicationId, file, token }, { rejectWithValue }) => {
    try {
      if (!applicationId) {
        return rejectWithValue("Application ID is required");
      }

      if (!file) {
        return rejectWithValue("CV file is required");
      }

      if (!token) {
        return rejectWithValue("Authentication token is required");
      }

      const formData = new FormData();

      formData.append("cv", file);

      return await apiRequest(
        `/applications/${applicationId}/cv`,
        "POST",
        formData,
        token
      );
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


// ==========================================
// GET MY APPLICATIONS
// ==========================================

export const getMyApplications = createAsyncThunk(
  "applications/getMyApplications",
  async (token, { rejectWithValue }) => {
    try {
      if (!token) {
        return rejectWithValue("Authentication token is required");
      }

      return await apiRequest(
        "/applications/my-applications",
        "GET",
        null,
        token
      );
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


// ==========================================
// GET APPLICATION DETAILS
// ==========================================

export const getApplicationDetails = createAsyncThunk(
  "applications/getApplicationDetails",
  async ({ id, token }, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue("Application ID is required");
      }

      if (!token) {
        return rejectWithValue("Authentication token is required");
      }

      return await apiRequest(
        `/applications/${id}`,
        "GET",
        null,
        token
      );
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


// ==========================================
// GET RECRUITER APPLICATIONS
// ==========================================

export const getRecruiterApplications = createAsyncThunk(
  "applications/getRecruiterApplications",
  async (token, { rejectWithValue }) => {
    try {
      if (!token) {
        return rejectWithValue("Authentication token is required");
      }

      return await apiRequest(
        "/applications/recruiter",
        "GET",
        null,
        token
      );
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


// ==========================================
// UPDATE APPLICATION STATUS
// ==========================================

export const updateApplicationStatus = createAsyncThunk(
  "applications/updateApplicationStatus",
  async ({ id, status, token }, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue("Application ID is required");
      }

      if (!status) {
        return rejectWithValue("Application status is required");
      }

      if (!token) {
        return rejectWithValue("Authentication token is required");
      }

      return await apiRequest(
        `/applications/${id}/status`,
        "PUT",
        { status },
        token
      );
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


// ==========================================
// WITHDRAW APPLICATION
// ==========================================

export const withdrawApplication = createAsyncThunk(
  "applications/withdrawApplication",
  async ({ id, token }, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue("Application ID is required");
      }

      if (!token) {
        return rejectWithValue("Authentication token is required");
      }

      return await apiRequest(
        `/applications/${id}/withdraw`,
        "PATCH",
        null,
        token
      );
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


// ==========================================
// INITIAL STATE
// ==========================================

const initialState = {
  applications: [],
  application: null,
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
        state.success = action.payload;

        const newApplication =
          action.payload.application ||
          action.payload.data;

        if (newApplication) {
          state.applications.unshift(newApplication);
        }
      })

      .addCase(applyForJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
        state.success = action.payload;

        const updatedApplication =
          action.payload.application ||
          action.payload.data;

        if (updatedApplication) {
          state.application = updatedApplication;

          const index = state.applications.findIndex(
            (item) =>
              item._id === updatedApplication._id
          );

          if (index !== -1) {
            state.applications[index] =
              updatedApplication;
          }
        }
      })

      .addCase(uploadCV.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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

        state.applications =
          action.payload.applications ||
          action.payload.data ||
          [];
      })

      .addCase(getMyApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });


    // ========================================
    // GET APPLICATION DETAILS
    // ========================================

    builder
      .addCase(getApplicationDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.application = null;
      })

      .addCase(
        getApplicationDetails.fulfilled,
        (state, action) => {
          state.loading = false;

          state.application =
            action.payload.application ||
            action.payload.data ||
            action.payload;
        }
      )

      .addCase(
        getApplicationDetails.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );


    // ========================================
    // GET RECRUITER APPLICATIONS
    // ========================================

    builder
      .addCase(
        getRecruiterApplications.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getRecruiterApplications.fulfilled,
        (state, action) => {
          state.loading = false;

          state.applications =
            action.payload.applications ||
            action.payload.data ||
            [];
        }
      )

      .addCase(
        getRecruiterApplications.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );


    // ========================================
    // UPDATE APPLICATION STATUS
    // ========================================

    builder
      .addCase(
        updateApplicationStatus.pending,
        (state) => {
          state.loading = true;
          state.error = null;
          state.success = null;
        }
      )

      .addCase(
        updateApplicationStatus.fulfilled,
        (state, action) => {
          state.loading = false;
          state.success = action.payload;

          const updatedApplication =
            action.payload.application ||
            action.payload.data;

          if (updatedApplication) {
            state.application =
              updatedApplication;

            const index =
              state.applications.findIndex(
                (item) =>
                  item._id ===
                  updatedApplication._id
              );

            if (index !== -1) {
              state.applications[index] =
                updatedApplication;
            }
          }
        }
      )

      .addCase(
        updateApplicationStatus.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );


    // ========================================
    // WITHDRAW APPLICATION
    // ========================================

    builder
      .addCase(
        withdrawApplication.pending,
        (state) => {
          state.loading = true;
          state.error = null;
          state.success = null;
        }
      )

      .addCase(
        withdrawApplication.fulfilled,
        (state, action) => {
          state.loading = false;
          state.success = action.payload;

          const withdrawnApplication =
            action.payload.application ||
            action.payload.data;

          if (withdrawnApplication) {
            state.application =
              withdrawnApplication;

            const index =
              state.applications.findIndex(
                (item) =>
                  item._id ===
                  withdrawnApplication._id
              );

            if (index !== -1) {
              state.applications[index] =
                withdrawnApplication;
            }
          }
        }
      )

      .addCase(
        withdrawApplication.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});


// ==========================================
// ACTIONS
// ==========================================

export const {
  clearApplicationError,
  clearApplicationSuccess,
  clearSelectedApplication,
} = applicationSlice.actions;


// ==========================================
// SELECTORS
// ==========================================

export const selectApplications = (state) =>
  state.applications.applications;

export const selectApplication = (state) =>
  state.applications.application;

export const selectApplicationLoading = (state) =>
  state.applications.loading;

export const selectApplicationError = (state) =>
  state.applications.error;

export const selectApplicationSuccess = (state) =>
  state.applications.success;


// ==========================================
// EXPORT REDUCER
// ==========================================

export default applicationSlice.reducer;