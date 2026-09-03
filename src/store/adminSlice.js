import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "../services/api";

// ==========================================
// GET USERS
// ==========================================

export const getUsers = createAsyncThunk(
  "admin/getUsers",
  async ({ token, role = "" }, { rejectWithValue }) => {
    try {
      const endpoint = role
        ? `/admin/users?role=${encodeURIComponent(role)}`
        : "/admin/users";

      const data = await apiRequest(
        endpoint,
        "GET",
        null,
        token
      );

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ==========================================
// BLOCK / UNBLOCK USER
// ==========================================

export const toggleBlockUser = createAsyncThunk(
  "admin/toggleBlockUser",
  async ({ id, token }, { rejectWithValue }) => {
    try {
      const data = await apiRequest(
        `/admin/users/${id}/block`,
        "PATCH",
        null,
        token
      );

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ==========================================
// DELETE USER
// ==========================================

export const deleteUser = createAsyncThunk(
  "admin/deleteUser",
  async ({ id, token }, { rejectWithValue }) => {
    try {
      const data = await apiRequest(
        `/admin/users/${id}`,
        "DELETE",
        null,
        token
      );

      return {
        ...data,
        deletedUserId: id,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ==========================================
// GET JOBS
// ==========================================

export const getAdminJobs = createAsyncThunk(
  "admin/getAdminJobs",
  async ({ token, status = "" }, { rejectWithValue }) => {
    try {
      const endpoint = status
        ? `/admin/jobs?status=${encodeURIComponent(status)}`
        : "/admin/jobs";

      const data = await apiRequest(
        endpoint,
        "GET",
        null,
        token
      );

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ==========================================
// GET APPLICATIONS
// ==========================================

export const getAdminApplications = createAsyncThunk(
  "admin/getAdminApplications",
  async (token, { rejectWithValue }) => {
    try {
      const data = await apiRequest(
        "/admin/applications",
        "GET",
        null,
        token
      );

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ==========================================
// INITIAL STATE
// ==========================================

const initialState = {
  users: [],
  jobs: [],
  applications: [],

  userCount: 0,
  jobCount: 0,
  applicationCount: 0,

  loading: false,
  error: null,
  success: null,
};

// ==========================================
// SLICE
// ==========================================

const adminSlice = createSlice({
  name: "admin",

  initialState,

  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },

    clearAdminSuccess: (state) => {
      state.success = null;
    },

    clearAdminData: (state) => {
      state.users = [];
      state.jobs = [];
      state.applications = [];
    },
  },

  extraReducers: (builder) => {
    // ========================================
    // GET USERS
    // ========================================

    builder
      .addCase(getUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getUsers.fulfilled, (state, action) => {
        state.loading = false;

        state.users =
          action.payload?.users ||
          action.payload?.data ||
          [];

        state.userCount =
          action.payload?.count ??
          state.users.length;
      })

      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false;

        state.error =
          action.payload ||
          "Failed to load users";
      });

    // ========================================
    // BLOCK / UNBLOCK USER
    // ========================================

    builder
      .addCase(toggleBlockUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })

      .addCase(toggleBlockUser.fulfilled, (state, action) => {
        state.loading = false;

        state.success = action.payload;

        const updatedUser =
          action.payload?.user ||
          action.payload?.data;

        if (updatedUser?._id) {
          const index = state.users.findIndex(
            (user) =>
              user._id === updatedUser._id
          );

          if (index !== -1) {
            state.users[index] = updatedUser;
          }
        }
      })

      .addCase(toggleBlockUser.rejected, (state, action) => {
        state.loading = false;

        state.error =
          action.payload ||
          "Failed to update user status";
      });

    // ========================================
    // DELETE USER
    // ========================================

    builder
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })

      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;

        state.success = action.payload;

        const deletedUserId =
          action.payload?.deletedUserId;

        if (deletedUserId) {
          state.users =
            state.users.filter(
              (user) =>
                user._id !== deletedUserId
            );

          state.userCount =
            state.users.length;
        }
      })

      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;

        state.error =
          action.payload ||
          "Failed to delete user";
      });

    // ========================================
    // GET JOBS
    // ========================================

    builder
      .addCase(getAdminJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getAdminJobs.fulfilled, (state, action) => {
        state.loading = false;

        state.jobs =
          action.payload?.jobs ||
          action.payload?.data ||
          [];

        state.jobCount =
          action.payload?.count ??
          state.jobs.length;
      })

      .addCase(getAdminJobs.rejected, (state, action) => {
        state.loading = false;

        state.error =
          action.payload ||
          "Failed to load jobs";
      });

    // ========================================
    // GET APPLICATIONS
    // ========================================

    builder
      .addCase(getAdminApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getAdminApplications.fulfilled, (state, action) => {
        state.loading = false;

        state.applications =
          action.payload?.applications ||
          action.payload?.data ||
          [];

        state.applicationCount =
          action.payload?.count ??
          state.applications.length;
      })

      .addCase(getAdminApplications.rejected, (state, action) => {
        state.loading = false;

        state.error =
          action.payload ||
          "Failed to load applications";
      });
  },
});

// ==========================================
// ACTIONS
// ==========================================

export const {
  clearAdminError,
  clearAdminSuccess,
  clearAdminData,
} = adminSlice.actions;

// ==========================================
// SELECTORS
// ==========================================

export const selectAdminUsers = (state) =>
  state.admin.users;

export const selectAdminJobs = (state) =>
  state.admin.jobs;

export const selectAdminApplications = (state) =>
  state.admin.applications;

export const selectAdminLoading = (state) =>
  state.admin.loading;

export const selectAdminError = (state) =>
  state.admin.error;

export const selectAdminSuccess = (state) =>
  state.admin.success;

// ==========================================
// REDUCER
// ==========================================

export default adminSlice.reducer;