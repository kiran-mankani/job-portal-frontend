import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "../services/api";

// ==========================================
// TOKEN HELPER
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
// QUERY BUILDER
// ==========================================

const buildQueryString = (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      query.append(key, value);
    }
  });

  const result = query.toString();

  return result ? `?${result}` : "";
};

// ==========================================
// GET USERS
// GET /api/admin/users
// ==========================================

export const getUsers = createAsyncThunk(
  "admin/getUsers",
  async (
    {
      token,
      role = "",
      search = "",
      page = 1,
      limit = 10,
    } = {},
    { rejectWithValue, getState }
  ) => {
    try {
      const authToken = getAuthToken(
        token,
        getState
      );

      if (!authToken) {
        return rejectWithValue(
          "Authentication token is required"
        );
      }

      const endpoint =
        `/admin/users` +
        buildQueryString({
          role,
          search: search.trim(),
          page,
          limit,
        });

      const data = await apiRequest(
        endpoint,
        "GET",
        null,
        authToken
      );

      return {
        ...data,
        users:
          data?.users ||
          data?.data ||
          [],
        pagination:
          data?.pagination || {
            page,
            limit,
            total: 0,
            totalPages: 1,
          },
      };
    } catch (error) {
      return rejectWithValue(
        error.message ||
          "Failed to load users"
      );
    }
  }
);

// ==========================================
// BLOCK / UNBLOCK USER
// PATCH /api/admin/users/:id/block
// ==========================================

export const toggleBlockUser = createAsyncThunk(
  "admin/toggleBlockUser",
  async (
    { id, token } = {},
    { rejectWithValue, getState }
  ) => {
    try {
      if (!id) {
        return rejectWithValue(
          "User ID is required"
        );
      }

      const authToken = getAuthToken(
        token,
        getState
      );

      if (!authToken) {
        return rejectWithValue(
          "Authentication token is required"
        );
      }

      const data = await apiRequest(
        `/admin/users/${id}/block`,
        "PATCH",
        null,
        authToken
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.message ||
          "Failed to update user status"
      );
    }
  }
);

// ==========================================
// DELETE USER
// DELETE /api/admin/users/:id
// ==========================================

export const deleteUser = createAsyncThunk(
  "admin/deleteUser",
  async (
    { id, token } = {},
    { rejectWithValue, getState }
  ) => {
    try {
      if (!id) {
        return rejectWithValue(
          "User ID is required"
        );
      }

      const authToken = getAuthToken(
        token,
        getState
      );

      if (!authToken) {
        return rejectWithValue(
          "Authentication token is required"
        );
      }

      const data = await apiRequest(
        `/admin/users/${id}`,
        "DELETE",
        null,
        authToken
      );

      return {
        ...data,
        deletedUserId: id,
      };
    } catch (error) {
      return rejectWithValue(
        error.message ||
          "Failed to delete user"
      );
    }
  }
);

// ==========================================
// GET JOBS
// GET /api/admin/jobs
// ==========================================

export const getAdminJobs = createAsyncThunk(
  "admin/getAdminJobs",
  async (
    {
      token,
      status = "",
      search = "",
      page = 1,
      limit = 10,
    } = {},
    { rejectWithValue, getState }
  ) => {
    try {
      const authToken = getAuthToken(
        token,
        getState
      );

      if (!authToken) {
        return rejectWithValue(
          "Authentication token is required"
        );
      }

      const endpoint =
        `/admin/jobs` +
        buildQueryString({
          status,
          search: search.trim(),
          page,
          limit,
        });

      const data = await apiRequest(
        endpoint,
        "GET",
        null,
        authToken
      );

      return {
        ...data,
        jobs:
          data?.jobs ||
          data?.data ||
          [],
        pagination:
          data?.pagination || {
            page,
            limit,
            total: 0,
            totalPages: 1,
          },
      };
    } catch (error) {
      return rejectWithValue(
        error.message ||
          "Failed to load jobs"
      );
    }
  }
);

// ==========================================
// GET APPLICATIONS
// GET /api/admin/applications
// ==========================================

export const getAdminApplications = createAsyncThunk(
  "admin/getAdminApplications",
  async (
    {
      token,
      status = "",
      page = 1,
      limit = 10,
    } = {},
    { rejectWithValue, getState }
  ) => {
    try {
      const authToken = getAuthToken(
        token,
        getState
      );

      if (!authToken) {
        return rejectWithValue(
          "Authentication token is required"
        );
      }

      const endpoint =
        `/admin/applications` +
        buildQueryString({
          status,
          page,
          limit,
        });

      const data = await apiRequest(
        endpoint,
        "GET",
        null,
        authToken
      );

      return {
        ...data,
        applications:
          data?.applications ||
          data?.data ||
          [],
        pagination:
          data?.pagination || {
            page,
            limit,
            total: 0,
            totalPages: 1,
          },
      };
    } catch (error) {
      return rejectWithValue(
        error.message ||
          "Failed to load applications"
      );
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

  usersPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },

  jobsPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },

  applicationsPagination: {
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

      state.userCount = 0;
      state.jobCount = 0;
      state.applicationCount = 0;

      state.usersPagination = {
        ...initialState.usersPagination,
      };

      state.jobsPagination = {
        ...initialState.jobsPagination,
      };

      state.applicationsPagination = {
        ...initialState.applicationsPagination,
      };
    },
  },

  extraReducers: (builder) => {
    // ========================================
    // GET USERS
    // ========================================

    builder
      .addCase(
        getUsers.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getUsers.fulfilled,
        (state, action) => {
          state.loading = false;

          state.users =
            action.payload?.users ||
            [];

          state.usersPagination =
            action.payload?.pagination ||
            state.usersPagination;

          state.userCount =
            action.payload?.pagination?.total ??
            action.payload?.count ??
            state.users.length;

          state.error = null;
        }
      )

      .addCase(
        getUsers.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to load users";
        }
      );

    // ========================================
    // BLOCK / UNBLOCK USER
    // ========================================

    builder
      .addCase(
        toggleBlockUser.pending,
        (state) => {
          state.loading = true;
          state.error = null;
          state.success = null;
        }
      )

      .addCase(
        toggleBlockUser.fulfilled,
        (state, action) => {
          state.loading = false;

          state.success =
            action.payload?.message ||
            action.payload;

          const updatedUser =
            action.payload?.user ||
            action.payload?.data;

          if (updatedUser?._id) {
            const index =
              state.users.findIndex(
                (user) =>
                  user._id ===
                  updatedUser._id
              );

            if (index !== -1) {
              state.users[index] =
                updatedUser;
            }
          }

          state.error = null;
        }
      )

      .addCase(
        toggleBlockUser.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to update user status";
        }
      );

    // ========================================
    // DELETE USER
    // ========================================

    builder
      .addCase(
        deleteUser.pending,
        (state) => {
          state.loading = true;
          state.error = null;
          state.success = null;
        }
      )

      .addCase(
        deleteUser.fulfilled,
        (state, action) => {
          state.loading = false;

          state.success =
            action.payload?.message ||
            "User deleted successfully";

          const deletedUserId =
            action.payload?.deletedUserId;

          if (deletedUserId) {
            state.users =
              state.users.filter(
                (user) =>
                  user._id !==
                  deletedUserId
              );

            if (
              state.userCount > 0
            ) {
              state.userCount -= 1;
            }
          }

          state.error = null;
        }
      )

      .addCase(
        deleteUser.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to delete user";
        }
      );

    // ========================================
    // GET JOBS
    // ========================================

    builder
      .addCase(
        getAdminJobs.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getAdminJobs.fulfilled,
        (state, action) => {
          state.loading = false;

          state.jobs =
            action.payload?.jobs ||
            [];

          state.jobsPagination =
            action.payload?.pagination ||
            state.jobsPagination;

          state.jobCount =
            action.payload?.pagination?.total ??
            action.payload?.count ??
            state.jobs.length;

          state.error = null;
        }
      )

      .addCase(
        getAdminJobs.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to load jobs";
        }
      );

    // ========================================
    // GET APPLICATIONS
    // ========================================

    builder
      .addCase(
        getAdminApplications.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getAdminApplications.fulfilled,
        (state, action) => {
          state.loading = false;

          state.applications =
            action.payload?.applications ||
            [];

          state.applicationsPagination =
            action.payload?.pagination ||
            state.applicationsPagination;

          state.applicationCount =
            action.payload?.pagination?.total ??
            action.payload?.count ??
            state.applications.length;

          state.error = null;
        }
      )

      .addCase(
        getAdminApplications.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to load applications";
        }
      );
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
  state.admin?.users || [];

export const selectAdminJobs = (state) =>
  state.admin?.jobs || [];

export const selectAdminApplications = (state) =>
  state.admin?.applications || [];

export const selectAdminUserCount = (state) =>
  state.admin?.userCount || 0;

export const selectAdminJobCount = (state) =>
  state.admin?.jobCount || 0;

export const selectAdminApplicationCount = (
  state
) =>
  state.admin?.applicationCount || 0;

export const selectAdminUsersPagination = (
  state
) =>
  state.admin?.usersPagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  };

export const selectAdminJobsPagination = (
  state
) =>
  state.admin?.jobsPagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  };

export const selectAdminApplicationsPagination = (
  state
) =>
  state.admin?.applicationsPagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  };

export const selectAdminLoading = (state) =>
  state.admin?.loading || false;

export const selectAdminError = (state) =>
  state.admin?.error || null;

export const selectAdminSuccess = (state) =>
  state.admin?.success || null;

// ==========================================
// REDUCER
// ==========================================

export default adminSlice.reducer;