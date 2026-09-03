import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "../services/api";

// ==========================================
// SCHEDULE INTERVIEW
// Recruiter
// ==========================================

export const scheduleInterview = createAsyncThunk(
  "interviews/scheduleInterview",
  async ({ interviewData, token }, { rejectWithValue }) => {
    try {
      const data = await apiRequest(
        "/interviews",
        "POST",
        interviewData,
        token
      );

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ==========================================
// GET CANDIDATE INTERVIEWS
// Candidate
// ==========================================

export const getCandidateInterviews = createAsyncThunk(
  "interviews/getCandidateInterviews",
  async (token, { rejectWithValue }) => {
    try {
      const data = await apiRequest(
        "/interviews/my-interviews",
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
// GET RECRUITER INTERVIEWS
// Recruiter
// ==========================================

export const getRecruiterInterviews = createAsyncThunk(
  "interviews/getRecruiterInterviews",
  async (token, { rejectWithValue }) => {
    try {
      const data = await apiRequest(
        "/interviews/recruiter-interviews",
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
// UPDATE INTERVIEW
// Recruiter
// ==========================================

export const updateInterview = createAsyncThunk(
  "interviews/updateInterview",
  async ({ id, interviewData, token }, { rejectWithValue }) => {
    try {
      const data = await apiRequest(
        `/interviews/${id}`,
        "PUT",
        interviewData,
        token
      );

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ==========================================
// CANCEL INTERVIEW
// Recruiter
// ==========================================

export const cancelInterview = createAsyncThunk(
  "interviews/cancelInterview",
  async ({ id, token }, { rejectWithValue }) => {
    try {
      const data = await apiRequest(
        `/interviews/${id}/cancel`,
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
            state.interviews.push(createdInterview);
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
// REDUCERS
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