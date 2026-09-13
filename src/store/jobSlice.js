import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { apiRequest } from "../services/api";

// =========================================================
// HELPERS
// =========================================================

const getToken = (token, getState) => {
  return (
    token ||
    getState?.()?.auth?.token ||
    localStorage.getItem("token") ||
    null
  );
};

const normalizeJob = (job) => {
  if (!job) return null;

  return {
    ...job,
    jobType:
      typeof job.jobType === "string"
        ? job.jobType.toLowerCase()
        : job.jobType,
    skills: Array.isArray(job.skills) ? job.skills : [],
  };
};

const normalizeJobs = (jobs) => {
  if (!Array.isArray(jobs)) return [];
  return jobs.map(normalizeJob).filter(Boolean);
};

const getErrorMessage = (error, fallback = "Something went wrong") => {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  return error.message || error.error || fallback;
};

const buildJobQuery = ({
  page = 1,
  limit = 10,
  search = "",
  location = "",
  jobType = "",
  category = "",
  experienceLevel = "",
  minSalary = "",
  maxSalary = "",
} = {}) => {
  const params = new URLSearchParams();

  params.append("page", page);
  params.append("limit", limit);

  if (String(search).trim()) {
    params.append("search", String(search).trim());
  }

  if (String(location).trim()) {
    params.append("location", String(location).trim());
  }

  if (jobType) {
    params.append("jobType", String(jobType).toLowerCase().trim());
  }

  if (String(category).trim()) {
    params.append("category", String(category).trim());
  }

  if (experienceLevel) {
    params.append("experienceLevel", String(experienceLevel).trim());
  }

  if (minSalary !== "" && minSalary !== undefined && minSalary !== null) {
    params.append("minSalary", minSalary);
  }

  if (maxSalary !== "" && maxSalary !== undefined && maxSalary !== null) {
    params.append("maxSalary", maxSalary);
  }

  return params.toString();
};

// =========================================================
// GET ALL JOBS
// =========================================================

export const getAllJobs = createAsyncThunk(
  "job/getAllJobs",
  async (
    {
      page = 1,
      limit = 10,
      search = "",
      location = "",
      jobType = "",
      category = "",
      experienceLevel = "",
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const query = buildJobQuery({
        page,
        limit,
        search,
        location,
        jobType,
        category,
        experienceLevel,
      });

      const data = await apiRequest(
        `/jobs${query ? `?${query}` : ""}`,
        "GET"
      );

      return {
        jobs: normalizeJobs(data?.jobs || data?.data || []),
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
        getErrorMessage(error, "Failed to load jobs.")
      );
    }
  }
);

// =========================================================
// SEARCH JOBS (BY TITLE ONLY)
// =========================================================

export const searchJobs = createAsyncThunk(
  "job/searchJobs",
  async (
    { keyword = "", page = 1, limit = 10 } = {},
    { rejectWithValue }
  ) => {
    try {
      const trimmed = String(keyword).trim();

      if (!trimmed) {
        return rejectWithValue("Please provide a search keyword.");
      }

      const params = new URLSearchParams();
      params.append("keyword", trimmed);
      params.append("page", page);
      params.append("limit", limit);

      const data = await apiRequest(
        `/jobs/search?${params.toString()}`,
        "GET"
      );

      return {
        jobs: normalizeJobs(data?.jobs || data?.data || []),
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
        getErrorMessage(error, "Failed to search jobs.")
      );
    }
  }
);

// =========================================================
// GET SINGLE JOB
// =========================================================

export const getSingleJob = createAsyncThunk(
  "job/getSingleJob",
  async (id, { rejectWithValue }) => {
    try {
      if (!id) return rejectWithValue("Job ID is required.");

      const data = await apiRequest(`/jobs/${id}`, "GET");
      const job = data?.job || data?.data || data;

      return normalizeJob(job);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to load job.")
      );
    }
  }
);

// =========================================================
// CREATE JOB
// =========================================================

export const createJob = createAsyncThunk(
  "job/createJob",
  async ({ jobData, token } = {}, { rejectWithValue, getState }) => {
    try {
      const authToken = getToken(token, getState);

      if (!authToken) return rejectWithValue("Please login as recruiter.");
      if (!jobData) return rejectWithValue("Job data is required.");

      const payload = {
        title: String(jobData.title || "").trim(),
        company: String(jobData.company || "").trim(),
        location: String(jobData.location || "").trim(),
        description: String(jobData.description || "").trim(),
        skills: Array.isArray(jobData.skills)
          ? jobData.skills.map((s) => String(s).trim()).filter(Boolean)
          : [],
        jobType: String(jobData.jobType || "").toLowerCase().trim(),
      };

      if (jobData.category)
        payload.category = String(jobData.category).trim();

      if (jobData.experienceLevel)
        payload.experienceLevel = String(jobData.experienceLevel).trim();

      if (jobData.experience)
        payload.experience = String(jobData.experience).trim();

      if (jobData.minSalary !== undefined && jobData.minSalary !== "") {
        const minSalary = Number(jobData.minSalary);
        if (!Number.isFinite(minSalary))
          return rejectWithValue("Minimum salary must be a valid number.");
        payload.minSalary = minSalary;
      }

      if (jobData.maxSalary !== undefined && jobData.maxSalary !== "") {
        const maxSalary = Number(jobData.maxSalary);
        if (!Number.isFinite(maxSalary))
          return rejectWithValue("Maximum salary must be a valid number.");
        payload.maxSalary = maxSalary;
      }

      if (
        payload.minSalary !== undefined &&
        payload.maxSalary !== undefined &&
        payload.minSalary > payload.maxSalary
      ) {
        return rejectWithValue(
          "Minimum salary cannot be greater than maximum salary."
        );
      }

      const data = await apiRequest("/jobs", "POST", payload, authToken);

      return {
        job: normalizeJob(data?.job || data?.data || data),
        message: data?.message || "Job created successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to create job.")
      );
    }
  }
);

// =========================================================
// UPDATE JOB
// =========================================================

export const updateJob = createAsyncThunk(
  "job/updateJob",
  async ({ id, jobData, token } = {}, { rejectWithValue, getState }) => {
    try {
      const authToken = getToken(token, getState);

      if (!authToken) return rejectWithValue("Please login.");
      if (!id) return rejectWithValue("Job ID is required.");
      if (!jobData) return rejectWithValue("Job data is required.");

      const payload = { ...jobData };

      if (payload.title !== undefined)
        payload.title = String(payload.title).trim();

      if (payload.company !== undefined)
        payload.company = String(payload.company).trim();

      if (payload.location !== undefined)
        payload.location = String(payload.location).trim();

      if (payload.description !== undefined)
        payload.description = String(payload.description).trim();

      if (Array.isArray(payload.skills))
        payload.skills = payload.skills
          .map((s) => String(s).trim())
          .filter(Boolean);

      if (payload.jobType !== undefined)
        payload.jobType = String(payload.jobType).toLowerCase().trim();

      if (payload.category !== undefined)
        payload.category = String(payload.category).trim();

      if (payload.experienceLevel !== undefined)
        payload.experienceLevel = String(payload.experienceLevel).trim();

      if (payload.minSalary !== undefined && payload.minSalary !== "") {
        const minSalary = Number(payload.minSalary);
        if (!Number.isFinite(minSalary))
          return rejectWithValue("Minimum salary must be a valid number.");
        payload.minSalary = minSalary;
      }

      if (payload.maxSalary !== undefined && payload.maxSalary !== "") {
        const maxSalary = Number(payload.maxSalary);
        if (!Number.isFinite(maxSalary))
          return rejectWithValue("Maximum salary must be a valid number.");
        payload.maxSalary = maxSalary;
      }

      const data = await apiRequest(
        `/jobs/${id}`,
        "PUT",
        payload,
        authToken
      );

      return {
        job: normalizeJob(data?.job || data?.data || data),
        message: data?.message || "Job updated successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update job.")
      );
    }
  }
);

// =========================================================
// DELETE JOB
// =========================================================

export const deleteJob = createAsyncThunk(
  "job/deleteJob",
  async ({ id, token } = {}, { rejectWithValue, getState }) => {
    try {
      const authToken = getToken(token, getState);

      if (!authToken) return rejectWithValue("Please login.");
      if (!id) return rejectWithValue("Job ID is required.");

      const data = await apiRequest(
        `/jobs/${id}`,
        "DELETE",
        null,
        authToken
      );

      return {
        id,
        message: data?.message || "Job deleted successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to delete job.")
      );
    }
  }
);

// =========================================================
// GET MY JOBS (with search + pagination)
// =========================================================

export const getMyJobs = createAsyncThunk(
  "job/getMyJobs",
  async (
    {
      page = 1,
      limit = 10,
      search = "",
      status = "",
      jobType = "",
      location = "",
      token,
    } = {},
    { rejectWithValue, getState }
  ) => {
    try {
      const authToken = getToken(token, getState);

      if (!authToken) {
        return rejectWithValue("Please login as recruiter.");
      }

      const params = new URLSearchParams();

      params.append("page", page);
      params.append("limit", limit);

      if (String(search).trim()) {
        params.append("search", String(search).trim());
      }

      if (String(status).trim()) {
        params.append("status", String(status).trim());
      }

      if (String(jobType).trim()) {
        params.append(
          "jobType",
          String(jobType).toLowerCase().trim()
        );
      }

      if (String(location).trim()) {
        params.append("location", String(location).trim());
      }

      const data = await apiRequest(
        `/jobs/my-jobs?${params.toString()}`,
        "GET",
        null,
        authToken
      );

      return {
        jobs: normalizeJobs(data?.jobs || data?.data || []),
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
        getErrorMessage(error, "Failed to load your jobs.")
      );
    }
  }
);

// =========================================================
// FILTER JOBS
// =========================================================

export const filterJobs = createAsyncThunk(
  "job/filterJobs",
  async (
    {
      search = "",
      location = "",
      jobType = "",
      category = "",
      experienceLevel = "",
      minSalary = "",
      maxSalary = "",
      page = 1,
      limit = 10,
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const query = buildJobQuery({
        search,
        location,
        jobType,
        category,
        experienceLevel,
        minSalary,
        maxSalary,
        page,
        limit,
      });

      const data = await apiRequest(`/jobs/filter?${query}`, "GET");

      return {
        jobs: normalizeJobs(data?.jobs || data?.data || []),
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
        getErrorMessage(error, "Failed to filter jobs.")
      );
    }
  }
);

// =========================================================
// GET SAVED JOBS
// =========================================================

export const getSavedJobs = createAsyncThunk(
  "job/getSavedJobs",
  async ({ token } = {}, { rejectWithValue, getState }) => {
    try {
      const authToken = getToken(token, getState);

      if (!authToken) return rejectWithValue("Please login as candidate.");

      const data = await apiRequest("/jobs/saved", "GET", null, authToken);

      return {
        jobs: normalizeJobs(data?.jobs || data?.data || []),
        count: data?.count ?? data?.total ?? 0,
        message: data?.message || "",
      };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to load saved jobs.")
      );
    }
  }
);

// =========================================================
// SAVE JOB
// =========================================================

export const saveJob = createAsyncThunk(
  "job/saveJob",
  async ({ jobId, token } = {}, { rejectWithValue, getState }) => {
    try {
      const authToken = getToken(token, getState);

      if (!authToken) return rejectWithValue("Please login as candidate.");
      if (!jobId) return rejectWithValue("Job ID is required.");

      const data = await apiRequest(
        `/jobs/${jobId}/save`,
        "POST",
        null,
        authToken
      );

      return {
        jobId,
        saved:
          data?.saved !== undefined ? Boolean(data.saved) : true,
        message: data?.message || "Job saved successfully.",
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to save job."));
    }
  }
);

// =========================================================
// UNSAVE JOB
// =========================================================

export const unsaveJob = createAsyncThunk(
  "job/unsaveJob",
  async ({ jobId, token } = {}, { rejectWithValue, getState }) => {
    try {
      const authToken = getToken(token, getState);

      if (!authToken) return rejectWithValue("Please login as candidate.");
      if (!jobId) return rejectWithValue("Job ID is required.");

      const data = await apiRequest(
        `/jobs/${jobId}/save`,
        "DELETE",
        null,
        authToken
      );

      return {
        jobId,
        saved: false,
        message: data?.message || "Job removed from saved jobs.",
      };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to remove saved job.")
      );
    }
  }
);

// =========================================================
// INITIAL STATE
// =========================================================

const initialState = {
  jobs: [],
  job: null,

  savedJobs: [],
  savedJobsLoading: false,
  savedJobsError: null,
  savedJobsCount: 0,

  savingJobIds: {},

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

// =========================================================
// SLICE
// =========================================================

const jobSlice = createSlice({
  name: "job",
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

    clearJobs: (state) => {
      state.jobs = [];
    },

    clearSavedJobsError: (state) => {
      state.savedJobsError = null;
    },

    resetJobState: () => {
      return {
        ...initialState,
        jobs: [],
        job: null,
        savedJobs: [],
        savingJobIds: {},
        pagination: { ...initialState.pagination },
      };
    },
  },

  extraReducers: (builder) => {
    // =======================================================
    // GET ALL JOBS
    // =======================================================

    builder
      .addCase(getAllJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.jobs;
        state.pagination =
          action.payload.pagination || state.pagination;
        state.error = null;
      })
      .addCase(getAllJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load jobs.";
      });

    // =======================================================
    // SEARCH JOBS
    // =======================================================

    builder
      .addCase(searchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.jobs;
        state.pagination =
          action.payload.pagination || state.pagination;
        state.error = null;
      })
      .addCase(searchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to search jobs.";
      });

    // =======================================================
    // GET SINGLE JOB
    // =======================================================

    builder
      .addCase(getSingleJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSingleJob.fulfilled, (state, action) => {
        state.loading = false;
        state.job = action.payload;
        state.error = null;
      })
      .addCase(getSingleJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load job.";
      });

    // =======================================================
    // CREATE JOB
    // =======================================================

    builder
      .addCase(createJob.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.loading = false;
        const newJob = action.payload.job;
        if (newJob) {
          state.job = newJob;
          state.jobs = [newJob, ...state.jobs];
        }
        state.success =
          action.payload.message || "Job created successfully.";
        state.error = null;
      })
      .addCase(createJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create job.";
        state.success = null;
      });

    // =======================================================
    // UPDATE JOB
    // =======================================================

    builder
      .addCase(updateJob.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.loading = false;
        const updatedJob = action.payload.job;

        if (updatedJob) {
          state.job = updatedJob;

          state.jobs = state.jobs.map((job) =>
            job._id === updatedJob._id ? updatedJob : job
          );

          state.savedJobs = state.savedJobs.map((job) =>
            job._id === updatedJob._id ? updatedJob : job
          );
        }

        state.success =
          action.payload.message || "Job updated successfully.";
        state.error = null;
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update job.";
        state.success = null;
      });

    // =======================================================
    // DELETE JOB
    // =======================================================

    builder
      .addCase(deleteJob.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.loading = false;

        state.jobs = state.jobs.filter(
          (job) => job._id !== action.payload.id
        );

        state.savedJobs = state.savedJobs.filter(
          (job) => job._id !== action.payload.id
        );

        state.savedJobsCount = state.savedJobs.length;

        if (state.job?._id === action.payload.id) {
          state.job = null;
        }

        state.success =
          action.payload.message || "Job deleted successfully.";
        state.error = null;
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete job.";
        state.success = null;
      });

    // =======================================================
    // GET MY JOBS
    // =======================================================

    builder
      .addCase(getMyJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.jobs;
        state.pagination =
          action.payload.pagination || state.pagination;
        state.error = null;
      })
      .addCase(getMyJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load your jobs.";
      });

    // =======================================================
    // FILTER JOBS
    // =======================================================

    builder
      .addCase(filterJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(filterJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.jobs;
        state.pagination =
          action.payload.pagination || state.pagination;
        state.error = null;
      })
      .addCase(filterJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to filter jobs.";
      });

    // =======================================================
    // GET SAVED JOBS
    // =======================================================

    builder
      .addCase(getSavedJobs.pending, (state) => {
        state.savedJobsLoading = true;
        state.savedJobsError = null;
      })
      .addCase(getSavedJobs.fulfilled, (state, action) => {
        state.savedJobsLoading = false;
        state.savedJobs = action.payload.jobs;
        state.savedJobsCount =
          action.payload.count ?? action.payload.jobs.length;
        state.savedJobsError = null;
      })
      .addCase(getSavedJobs.rejected, (state, action) => {
        state.savedJobsLoading = false;
        state.savedJobsError =
          action.payload || "Failed to load saved jobs.";
      });

    // =======================================================
    // SAVE JOB
    // =======================================================

    builder
      .addCase(saveJob.pending, (state, action) => {
        const jobId = action.meta.arg?.jobId;
        if (jobId) state.savingJobIds[jobId] = true;
        state.error = null;
      })
      .addCase(saveJob.fulfilled, (state, action) => {
        const jobId = action.payload.jobId;
        delete state.savingJobIds[jobId];

        const jobToSave = state.jobs.find(
          (job) => String(job._id) === String(jobId)
        );

        if (
          jobToSave &&
          !state.savedJobs.some(
            (job) => String(job._id) === String(jobId)
          )
        ) {
          state.savedJobs.push(jobToSave);
        }

        state.savedJobsCount = state.savedJobs.length;
        state.success =
          action.payload.message || "Job saved successfully.";
        state.error = null;
      })
      .addCase(saveJob.rejected, (state, action) => {
        const jobId = action.meta.arg?.jobId;
        if (jobId) delete state.savingJobIds[jobId];
        state.error = action.payload || "Failed to save job.";
      });

    // =======================================================
    // UNSAVE JOB
    // =======================================================

    builder
      .addCase(unsaveJob.pending, (state, action) => {
        const jobId = action.meta.arg?.jobId;
        if (jobId) state.savingJobIds[jobId] = true;
        state.error = null;
      })
      .addCase(unsaveJob.fulfilled, (state, action) => {
        const jobId = action.payload.jobId;
        delete state.savingJobIds[jobId];

        state.savedJobs = state.savedJobs.filter(
          (job) => String(job._id) !== String(jobId)
        );

        state.savedJobsCount = state.savedJobs.length;
        state.success =
          action.payload.message || "Job removed from saved jobs.";
        state.error = null;
      })
      .addCase(unsaveJob.rejected, (state, action) => {
        const jobId = action.meta.arg?.jobId;
        if (jobId) delete state.savingJobIds[jobId];
        state.error = action.payload || "Failed to remove saved job.";
      });
  },
});

// =========================================================
// REDUCERS
// =========================================================

export const {
  clearJobError,
  clearJobSuccess,
  clearSelectedJob,
  clearJobs,
  clearSavedJobsError,
  resetJobState,
} = jobSlice.actions;

// =========================================================
// SELECTORS
// =========================================================

export const selectJobs = (state) => state.job?.jobs || [];
export const selectJob = (state) => state.job?.job || null;
export const selectJobLoading = (state) => state.job?.loading || false;
export const selectJobError = (state) => state.job?.error || null;
export const selectJobSuccess = (state) => state.job?.success || null;
export const selectJobPagination = (state) =>
  state.job?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  };

export const selectSavedJobs = (state) => state.job?.savedJobs || [];
export const selectSavedJobsLoading = (state) =>
  state.job?.savedJobsLoading || false;
export const selectSavedJobsError = (state) =>
  state.job?.savedJobsError || null;
export const selectSavedJobsCount = (state) =>
  state.job?.savedJobsCount || 0;
export const selectSavingJobIds = (state) =>
  state.job?.savingJobIds || {};

export const selectIsJobSaved = (state, jobId) => {
  if (!jobId) return false;
  return (
    state.job?.savedJobs?.some(
      (job) => String(job._id) === String(jobId)
    ) || false
  );
};

export const selectIsSavingJob = (state, jobId) => {
  if (!jobId) return false;
  return Boolean(state.job?.savingJobIds?.[jobId]);
};

// =========================================================
// EXPORT REDUCER
// =========================================================

