import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "../services/api";

// ==========================================
// GET TOKEN FROM REDUX STATE
// ==========================================

const getAuthToken = (token, getState) => {
  return (
    token ||
    getState()?.auth?.token ||
    localStorage.getItem("token") ||
    null
  );
};

// ==========================================
// CANDIDATE DASHBOARD
// ==========================================

export const getCandidateDashboard = createAsyncThunk(
  "dashboard/getCandidateDashboard",

  async (token, { rejectWithValue, getState }) => {
    try {
      const authToken = getAuthToken(token, getState);

      if (!authToken) {
        return rejectWithValue(
          "Authentication token is required"
        );
      }

      return await apiRequest(
        "/dashboard/candidate",
        "GET",
        null,
        authToken
      );
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to load candidate dashboard"
      );
    }
  }
);

// ==========================================
// RECRUITER DASHBOARD
// ==========================================

export const getRecruiterDashboard = createAsyncThunk(
  "dashboard/getRecruiterDashboard",

  async (
    {
      token,
      page = 1,
      limit = 5,
      jobStatus = "",
      applicationStatus = "",
      search = "",
    } = {},
    { rejectWithValue, getState }
  ) => {
    try {
      const authToken = getAuthToken(token, getState);

      if (!authToken) {
        return rejectWithValue(
          "Authentication token is required"
        );
      }

      const params = new URLSearchParams();

      params.append("page", page);
      params.append("limit", limit);

      if (jobStatus) {
        params.append("jobStatus", jobStatus);
      }

      if (applicationStatus) {
        params.append(
          "applicationStatus",
          applicationStatus
        );
      }

      if (search) {
        params.append("search", search);
      }

      return await apiRequest(
        `/dashboard/recruiter?${params.toString()}`,
        "GET",
        null,
        authToken
      );
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to load recruiter dashboard"
      );
    }
  }
);

// ==========================================
// ADMIN DASHBOARD
// ==========================================

export const getAdminDashboard = createAsyncThunk(
  "dashboard/getAdminDashboard",

  async (token, { rejectWithValue, getState }) => {
    try {
      const authToken = getAuthToken(token, getState);

      if (!authToken) {
        return rejectWithValue(
          "Authentication token is required"
        );
      }

      return await apiRequest(
        "/dashboard/admin",
        "GET",
        null,
        authToken
      );
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to load admin dashboard"
      );
    }
  }
);

// ==========================================
// NORMALIZE DASHBOARD RESPONSE
// ==========================================

const getDashboardData = (payload) => {
  if (!payload) {
    return null;
  }

  return (
    payload.dashboard ||
    payload.data ||
    payload
  );
};

// ==========================================
// INITIAL STATE
// ==========================================

const initialState = {
  data: null,
  loading: false,
  error: null,
  success: null,
};

// ==========================================
// SLICE
// ==========================================

const dashboardSlice = createSlice({
  name: "dashboard",

  initialState,

  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },

    clearDashboardSuccess: (state) => {
      state.success = null;
    },

    clearDashboard: (state) => {
      state.data = null;
      state.error = null;
      state.success = null;
    },
  },

  extraReducers: (builder) => {
    // ======================================
    // CANDIDATE
    // ======================================

    builder
      .addCase(
        getCandidateDashboard.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getCandidateDashboard.fulfilled,
        (state, action) => {
          state.loading = false;

          state.data = getDashboardData(
            action.payload
          );

          state.success = action.payload;
          state.error = null;
        }
      )

      .addCase(
        getCandidateDashboard.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to load candidate dashboard";
        }
      );

    // ======================================
    // RECRUITER
    // ======================================

    builder
      .addCase(
        getRecruiterDashboard.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getRecruiterDashboard.fulfilled,
        (state, action) => {
          state.loading = false;

          state.data = getDashboardData(
            action.payload
          );

          state.success = action.payload;
          state.error = null;
        }
      )

      .addCase(
        getRecruiterDashboard.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to load recruiter dashboard";
        }
      );

    // ======================================
    // ADMIN
    // ======================================

    builder
      .addCase(
        getAdminDashboard.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getAdminDashboard.fulfilled,
        (state, action) => {
          state.loading = false;

          state.data = getDashboardData(
            action.payload
          );

          state.success = action.payload;
          state.error = null;
        }
      )

      .addCase(
        getAdminDashboard.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to load admin dashboard";
        }
      );
  },
});

// ==========================================
// ACTIONS
// ==========================================

export const {
  clearDashboardError,
  clearDashboardSuccess,
  clearDashboard,
} = dashboardSlice.actions;

// ==========================================
// SELECTORS
// ==========================================

export const selectDashboard = (state) =>
  state.dashboard.data;

export const selectDashboardLoading = (state) =>
  state.dashboard.loading;

export const selectDashboardError = (state) =>
  state.dashboard.error;

export const selectDashboardSuccess = (state) =>
  state.dashboard.success;

// ==========================================
// DEFAULT EXPORT
// ==========================================

export default dashboardSlice.reducer;