import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "../services/api";

// ===============================
// REGEX VALIDATION
// ===============================

const nameRegex = /^[A-Za-z ]{2,50}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const phoneRegex = /^(?:\+92|0)3\d{9}$/;

// ===============================
// VALIDATION FUNCTION
// ===============================

const validateAuthData = (data, type) => {
  if (type === "register" || type === "recruiterRegister") {
    if (!data.name || !nameRegex.test(data.name.trim())) {
      return "Name must contain only letters and spaces (2-50 characters)";
    }

    if (!data.email || !emailRegex.test(data.email.trim())) {
      return "Please enter a valid email address";
    }

    if (!data.password || !passwordRegex.test(data.password)) {
      return "Password must be at least 8 characters and contain a letter and a number";
    }

    if (data.phone && !phoneRegex.test(data.phone.trim())) {
      return "Please enter a valid Pakistani phone number";
    }
  }

  if (type === "login") {
    if (!data.email || !emailRegex.test(data.email.trim())) {
      return "Please enter a valid email address";
    }

    if (!data.password) {
      return "Password is required";
    }
  }

  return null;
};

// ===============================
// REGISTER CANDIDATE
// ===============================

export const registerCandidate = createAsyncThunk(
  "auth/registerCandidate",
  async (userData, { rejectWithValue }) => {
    try {
      const validationError = validateAuthData(
        userData,
        "register"
      );

      if (validationError) {
        return rejectWithValue(validationError);
      }

      const data = await apiRequest(
        "/auth/register",
        "POST",
        userData
      );

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ===============================
// REGISTER RECRUITER
// ===============================

export const registerRecruiter = createAsyncThunk(
  "auth/registerRecruiter",
  async (userData, { rejectWithValue }) => {
    try {
      const validationError = validateAuthData(
        userData,
        "recruiterRegister"
      );

      if (validationError) {
        return rejectWithValue(validationError);
      }

      const data = await apiRequest(
        "/auth/recruiter-register",
        "POST",
        userData
      );

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ===============================
// LOGIN
// ===============================

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const validationError = validateAuthData(
        credentials,
        "login"
      );

      if (validationError) {
        return rejectWithValue(validationError);
      }

      const data = await apiRequest(
        "/auth/login",
        "POST",
        credentials
      );

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ===============================
// GET CURRENT USER
// ===============================

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return rejectWithValue("No authentication token found");
      }

      const data = await apiRequest(
        "/auth/me",
        "GET",
        null,
        token
      );

      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ===============================
// UPDATE PROFILE
// ===============================

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return rejectWithValue("No authentication token found");
      }

      const data = await apiRequest(
        "/auth/profile",
        "PUT",
        profileData,
        token
      );

      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ===============================
// INITIAL STATE
// ===============================

const savedToken = localStorage.getItem("token");
const savedUser = localStorage.getItem("user");

let parsedUser = null;

try {
  parsedUser = savedUser
    ? JSON.parse(savedUser)
    : null;
} catch {
  parsedUser = null;
}

// ===============================
// SLICE
// ===============================

const authSlice = createSlice({
  name: "auth",

  initialState: {
    user: parsedUser,
    token: savedToken,
    isAuthenticated: !!savedToken,
    loading: false,
    error: null,
    success: false,
  },

  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.success = false;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },

    clearAuthError: (state) => {
      state.error = null;
    },

    clearAuthSuccess: (state) => {
      state.success = false;
    },
  },

  extraReducers: (builder) => {
    // =========================
    // REGISTER CANDIDATE
    // =========================

    builder
      .addCase(registerCandidate.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(registerCandidate.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })

      .addCase(registerCandidate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });

    // =========================
    // REGISTER RECRUITER
    // =========================

    builder
      .addCase(registerRecruiter.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(registerRecruiter.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })

      .addCase(registerRecruiter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });

    // =========================
    // LOGIN
    // =========================

    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.success = true;

        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
        state.isAuthenticated = false;
      });

    // =========================
    // CURRENT USER
    // =========================

    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.error = null;
      })

      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // =========================
    // UPDATE PROFILE
    // =========================

    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.success = true;
        state.error = null;
      })

      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

// ===============================
// EXPORT ACTIONS
// ===============================

export const {
  logout,
  clearAuthError,
  clearAuthSuccess,
} = authSlice.actions;

// ===============================
// SELECTORS
// ===============================

export const selectUser = (state) => state.auth.user;

export const selectToken = (state) => state.auth.token;

export const selectIsAuthenticated = (state) =>
  state.auth.isAuthenticated;

export const selectAuthLoading = (state) =>
  state.auth.loading;

export const selectAuthError = (state) =>
  state.auth.error;

export const selectAuthSuccess = (state) =>
  state.auth.success;

export default authSlice.reducer;