import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "../services/api";


// ===============================
// GET ALL JOBS
// ===============================

export const getAllJobs = createAsyncThunk(
  "jobs/getAllJobs",
  async (_, { rejectWithValue }) => {
    try {
      return await apiRequest("/jobs");
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


// ===============================
// GET SINGLE JOB
// ===============================

export const getSingleJob = createAsyncThunk(
  "jobs/getSingleJob",
  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue("Job ID is required");
      }

      return await apiRequest(`/jobs/${id}`);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


// ===============================
// SEARCH JOBS
// ===============================

export const searchJobs = createAsyncThunk(
  "jobs/searchJobs",
  async ({ keyword = "", location = "" }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();

      if (keyword.trim()) {
        params.append("keyword", keyword.trim());
      }

      if (location.trim()) {
        params.append("location", location.trim());
      }

      return await apiRequest(`/jobs/search?${params.toString()}`);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


// ===============================
// FILTER JOBS
// ===============================

export const filterJobs = createAsyncThunk(
  "jobs/filterJobs",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value).trim() !== "") {
          params.append(key, value);
        }
      });

      return await apiRequest(`/jobs/filter?${params.toString()}`);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


// ===============================
// CREATE JOB
// ===============================

export const createJob = createAsyncThunk(
  "jobs/createJob",
  async ({ jobData, token }, { rejectWithValue }) => {
    try {
      if (!jobData) {
        return rejectWithValue("Job data is required");
      }

      if (!token) {
        return rejectWithValue("Authentication token is required");
      }

      return await apiRequest(
        "/jobs",
        "POST",
        jobData,
        token
      );
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


// ===============================
// UPDATE JOB
// ===============================

export const updateJob = createAsyncThunk(
  "jobs/updateJob",
  async ({ id, jobData, token }, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue("Job ID is required");
      }

      if (!jobData) {
        return rejectWithValue("Job data is required");
      }

      if (!token) {
        return rejectWithValue("Authentication token is required");
      }

      return await apiRequest(
        `/jobs/${id}`,
        "PUT",
        jobData,
        token
      );
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


// ===============================
// DELETE JOB
// ===============================

export const deleteJob = createAsyncThunk(
  "jobs/deleteJob",
  async ({ id, token }, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue("Job ID is required");
      }

      if (!token) {
        return rejectWithValue("Authentication token is required");
      }

      const data = await apiRequest(
        `/jobs/${id}`,
        "DELETE",
        null,
        token
      );

      return {
        id,
        ...data,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


// ===============================
// GET RECRUITER OWN JOBS
// ===============================

export const getMyJobs = createAsyncThunk(
  "jobs/getMyJobs",
  async (token, { rejectWithValue }) => {
    try {
      if (!token) {
        return rejectWithValue("Authentication token is required");
      }

      return await apiRequest(
        "/jobs/my-jobs",
        "GET",
        null,
        token
      );
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


// ===============================
// INITIAL STATE
// ===============================

const initialState = {
  jobs: [],
  job: null,
  loading: false,
  error: null,
  success: null,
};


// ===============================
// SLICE
// ===============================

const jobSlice = createSlice({
  name: "jobs",
  initialState,

  reducers: {
    clearJobError: (state) => {
      state.error = null;
    },

    clearJobSuccess: (state) => {
      state.success = null;
    },

    clearSelectedJob: (state) => {
      state.job = null;
    },
  },

  extraReducers: (builder) => {

    // GET ALL JOBS
    builder
      .addCase(getAllJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getAllJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.jobs || action.payload.data || [];
      })

      .addCase(getAllJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });


    // GET SINGLE JOB
    builder
      .addCase(getSingleJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getSingleJob.fulfilled, (state, action) => {
        state.loading = false;
        state.job =
          action.payload.job ||
          action.payload.data ||
          action.payload;
      })

      .addCase(getSingleJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });


    // SEARCH JOBS
    builder
      .addCase(searchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(searchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.jobs || action.payload.data || [];
      })

      .addCase(searchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });


    // FILTER JOBS
    builder
      .addCase(filterJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(filterJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.jobs || action.payload.data || [];
      })

      .addCase(filterJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });


    // CREATE JOB
    builder
      .addCase(createJob.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })

      .addCase(createJob.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload;

        const newJob =
          action.payload.job ||
          action.payload.data;

        if (newJob) {
          state.jobs.unshift(newJob);
        }
      })

      .addCase(createJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });


    // UPDATE JOB
    builder
      .addCase(updateJob.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })

      .addCase(updateJob.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload;

        const updatedJob =
          action.payload.job ||
          action.payload.data;

        if (updatedJob) {
          state.job = updatedJob;

          const index = state.jobs.findIndex(
            (item) => item._id === updatedJob._id
          );

          if (index !== -1) {
            state.jobs[index] = updatedJob;
          }
        }
      })

      .addCase(updateJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });


    // DELETE JOB
    builder
      .addCase(deleteJob.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })

      .addCase(deleteJob.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload;

        state.jobs = state.jobs.filter(
          (job) => job._id !== action.payload.id
        );

        if (state.job?._id === action.payload.id) {
          state.job = null;
        }
      })

      .addCase(deleteJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });


    // GET MY JOBS
    builder
      .addCase(getMyJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getMyJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.jobs || action.payload.data || [];
      })

      .addCase(getMyJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

  },
});


// ===============================
// ACTIONS
// ===============================

export const {
  clearJobError,
  clearJobSuccess,
  clearSelectedJob,
} = jobSlice.actions;


// ===============================
// SELECTORS
// ===============================

export const selectJobs = (state) => state.jobs.jobs;
export const selectJob = (state) => state.jobs.job;
export const selectJobLoading = (state) => state.jobs.loading;
export const selectJobError = (state) => state.jobs.error;
export const selectJobSuccess = (state) => state.jobs.success;


// ===============================
// EXPORT
// ===============================

export default jobSlice.reducer;