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
// SCHEDULE INTERVIEW
// Recruiter
// ==========================================

export const scheduleInterview = createAsyncThunk(
  "interviews/scheduleInterview",
  async (
    { interviewData, token } = {},
    { rejectWithValue, getState }
  ) => {
    try {
      if (!interviewData) {
        return rejectWithValue("Interview data is required");
      }

      const authToken = getAuthToken(token, getState);

      if (!authToken) {
        return rejectWithValue(
          "Authentication token is required"
        );
      }

      const data = await apiRequest(
        "/interviews",
        "POST",
        interviewData,
        authToken
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to schedule interview"
      );
    }
  }
);

// ==========================================
// GET CANDIDATE INTERVIEWS
// Candidate
// ==========================================

export const getCandidateInterviews = createAsyncThunk(
  "interviews/getCandidateInterviews",
  async (token, { rejectWithValue, getState }) => {
    try {
      const authToken = getAuthToken(token, getState);

      if (!authToken) {
        return rejectWithValue(
          "Authentication token is required"
        );
      }

      const data = await apiRequest(
        "/interviews/my-interviews",
        "GET",
        null,
        authToken
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to load candidate interviews"
      );
    }
  }
);

// ==========================================
// GET RECRUITER INTERVIEWS
// Recruiter
// ==========================================

export const getRecruiterInterviews = createAsyncThunk(
  "interviews/getRecruiterInterviews",
  async (token, { rejectWithValue, getState }) => {
    try {
      const authToken = getAuthToken(token, getState);

      if (!authToken) {
        return rejectWithValue(
          "Authentication token is required"
        );
      }

      const data = await apiRequest(
        "/interviews/recruiter-interviews",
        "GET",
        null,
        authToken
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to load recruiter interviews"
      );
    }
  }
);

// ==========================================
// UPDATE INTERVIEW
// Recruiter
// ==========================================

export const updateInterview = createAsyncThunk(
  "interviews/updateInterview",
  async (
    { id, interviewData, token } = {},
    { rejectWithValue, getState }
  ) => {
    try {
      if (!id) {
        return rejectWithValue("Interview ID is required");
      }

      if (!interviewData) {
        return rejectWithValue("Interview data is required");
      }

      const authToken = getAuthToken(token, getState);

      if (!authToken) {
        return rejectWithValue(
          "Authentication token is required"
        );
      }

      const data = await apiRequest(
        `/interviews/${id}`,
        "PUT",
        interviewData,
        authToken
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to update interview"
      );
    }
  }
);

// ==========================================
// CANCEL INTERVIEW
// Recruiter
// ==========================================

export const cancelInterview = createAsyncThunk(
  "interviews/cancelInterview",
  async (
    { id, token } = {},
    { rejectWithValue, getState }
  ) => {
    try {
      if (!id) {
        return rejectWithValue("Interview ID is required");
      }

      const authToken = getAuthToken(token, getState);

      if (!authToken) {
        return rejectWithValue(
          "Authentication token is required"
        );
      }

      const data = await apiRequest(
        `/interviews/${id}/cancel`,
        "PATCH",
        null,
        authToken
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to cancel interview"
      );
    }
  }
);

// ==========================================
// INITIAL STATE
// ==========================================

const initialState = {
  interviews: [],
  interview: null,
  loading: false,
  error: null,
  success: null,
};

// ==========================================
// SLICE
// ==========================================

const interviewSlice = createSlice({
  name: "interviews",
  initialState,

  reducers: {
    clearInterviewError: (state) => {
      state.error = null;
    },

    clearInterviewSuccess: (state) => {
      state.success = null;
    },

    clearSelectedInterview: (state) => {
      state.interview = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ========================================
      // SCHEDULE INTERVIEW
      // ========================================

      .addCase(
        scheduleInterview.pending,
        (state) => {
          state.loading = true;
          state.error = null;
          state.success = null;
        }
      )

      .addCase(
        scheduleInterview.fulfilled,
        (state, action) => {
          state.loading = false;
          state.success = action.payload;

          const createdInterview =
            action.payload?.interview ||
            action.payload?.data;

          if (createdInterview) {
            state.interview = createdInterview;

            const alreadyExists = state.interviews.some(
              (item) => item._id === createdInterview._id
            );

            if (!alreadyExists) {
              state.interviews.push(createdInterview);
            }
          }
        }
      )

      .addCase(
        scheduleInterview.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to schedule interview";
        }
      )

      // ========================================
      // GET CANDIDATE INTERVIEWS
      // ========================================

      .addCase(
        getCandidateInterviews.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getCandidateInterviews.fulfilled,
        (state, action) => {
          state.loading = false;

          state.interviews =
            action.payload?.interviews ||
            action.payload?.data ||
            [];

          state.error = null;
        }
      )

      .addCase(
        getCandidateInterviews.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to load candidate interviews";
        }
      )

      // ========================================
      // GET RECRUITER INTERVIEWS
      // ========================================

      .addCase(
        getRecruiterInterviews.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getRecruiterInterviews.fulfilled,
        (state, action) => {
          state.loading = false;

          state.interviews =
            action.payload?.interviews ||
            action.payload?.data ||
            [];

          state.error = null;
        }
      )

      .addCase(
        getRecruiterInterviews.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to load recruiter interviews";
        }
      )

      // ========================================
      // UPDATE INTERVIEW
      // ========================================

      .addCase(
        updateInterview.pending,
        (state) => {
          state.loading = true;
          state.error = null;
          state.success = null;
        }
      )

      .addCase(
        updateInterview.fulfilled,
        (state, action) => {
          state.loading = false;
          state.success = action.payload;

          const updatedInterview =
            action.payload?.interview ||
            action.payload?.data;

          if (updatedInterview) {
            state.interview = updatedInterview;

            const index = state.interviews.findIndex(
              (item) =>
                item._id === updatedInterview._id
            );

            if (index !== -1) {
              state.interviews[index] =
                updatedInterview;
            }
          }
        }
      )

      .addCase(
        updateInterview.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to update interview";
        }
      )

      // ========================================
      // CANCEL INTERVIEW
      // ========================================

      .addCase(
        cancelInterview.pending,
        (state) => {
          state.loading = true;
          state.error = null;
          state.success = null;
        }
      )

      .addCase(
        cancelInterview.fulfilled,
        (state, action) => {
          state.loading = false;
          state.success = action.payload;

          const cancelledInterview =
            action.payload?.interview ||
            action.payload?.data;

          if (cancelledInterview) {
            state.interview =
              cancelledInterview;

            const index =
              state.interviews.findIndex(
                (item) =>
                  item._id ===
                  cancelledInterview._id
              );

            if (index !== -1) {
              state.interviews[index] =
                cancelledInterview;
            }
          }
        }
      )

      .addCase(
        cancelInterview.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to cancel interview";
        }
      );
  },
});

// ==========================================
// ACTIONS
// ==========================================

export const {
  clearInterviewError,
  clearInterviewSuccess,
  clearSelectedInterview,
} = interviewSlice.actions;

// ==========================================
// SELECTORS
// ==========================================

export const selectInterviews = (state) =>
  state.interviews.interviews;

export const selectInterview = (state) =>
  state.interviews.interview;

export const selectInterviewLoading = (state) =>
  state.interviews.loading;

export const selectInterviewError = (state) =>
  state.interviews.error;

export const selectInterviewSuccess = (state) =>
  state.interviews.success;

// ==========================================
// EXPORT REDUCER
// ==========================================

export default interviewSlice.reducer;