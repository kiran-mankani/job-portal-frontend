import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "../services/api";

// ==========================================
// CANDIDATE DASHBOARD
// ==========================================

export const getCandidateDashboard = createAsyncThunk(
  "dashboard/getCandidateDashboard",
  async (token, { rejectWithValue }) => {
    try {
      if (!token) {
        return rejectWithValue("Authentication token is required");
      }

      return await apiRequest(
        "/dashboard/candidate",
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
// RECRUITER DASHBOARD
// ==========================================

export const getRecruiterDashboard = createAsyncThunk(
  "dashboard/getRecruiterDashboard",
  async (token, { rejectWithValue }) => {
    try {
      if (!token) {
        return rejectWithValue("Authentication token is required");
      }

      return await apiRequest(
        "/dashboard/recruiter",
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
// ADMIN DASHBOARD
// ==========================================

export const getAdminDashboard = createAsyncThunk(
  "dashboard/getAdminDashboard",
  async (token, { rejectWithValue }) => {
    try {
      if (!token) {
        return rejectWithValue("Authentication token is required");
      }

      return await apiRequest(
        "/dashboard/admin",
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
    // Candidate
    builder
      .addCase(getCandidateDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCandidateDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.data =
          action.payload.dashboard ||
          action.payload.data ||
          action.payload;
        state.success = action.payload;
      })
      .addCase(getCandidateDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Recruiter
    builder
      .addCase(getRecruiterDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRecruiterDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.data =
          action.payload.dashboard ||
          action.payload.data ||
          action.payload;
        state.success = action.payload;
      })
      .addCase(getRecruiterDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Admin
    builder
      .addCase(getAdminDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.data =
          action.payload.dashboard ||
          action.payload.data ||
          action.payload;
        state.success = action.payload;
      })
      .addCase(getAdminDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
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

export const selectDashboard = (state) => state.dashboard.data;
export const selectDashboardLoading = (state) => state.dashboard.loading;
export const selectDashboardError = (state) => state.dashboard.error;
export const selectDashboardSuccess = (state) => state.dashboard.success;

// ==========================================
// EXPORT
// ==========================================

export default dashboardSlice.reducer;