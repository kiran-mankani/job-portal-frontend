
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiRequest } from "../services/api";

// ======================================================
// REGISTER CANDIDATE
// ======================================================

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      return await apiRequest("/auth/register", "POST", userData);
    } catch (error) {
      return rejectWithValue(error?.message || "Registration failed");
    }
  }
);

export const registerCandidate = registerUser;

// ======================================================
// REGISTER RECRUITER
// ======================================================

export const registerRecruiter = createAsyncThunk(
  "auth/registerRecruiter",
  async (recruiterData, { rejectWithValue }) => {
    try {
      return await apiRequest(
        "/auth/recruiter-register",
        "POST",
        recruiterData
      );
    } catch (error) {
      return rejectWithValue(
        error?.message || "Recruiter registration failed"
      );
    }
  }
);

// ======================================================
// LOGIN
// ======================================================

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      return await apiRequest("/auth/login", "POST", credentials);
    } catch (error) {
      return rejectWithValue(error?.message || "Login failed");
    }
  }
);

export const login = loginUser;

// ======================================================
// FORGOT PASSWORD
// ======================================================

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (emailData, { rejectWithValue }) => {
    try {
      return await apiRequest(
        "/auth/forgot-password",
        "POST",
        emailData
      );
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to send password reset email"
      );
    }
  }
);

// ======================================================
// VERIFY OTP
// ======================================================

export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async (otpData, { rejectWithValue }) => {
    try {
      return await apiRequest(
        "/auth/verify-otp",
        "POST",
        otpData
      );
    } catch (error) {
      return rejectWithValue(
        error?.message || "OTP verification failed"
      );
    }
  }
);

// ======================================================
// RESET PASSWORD
// ======================================================

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (resetData, { rejectWithValue }) => {
    try {
      return await apiRequest(
        "/auth/reset-password",
        "POST",
        resetData
      );
    } catch (error) {
      return rejectWithValue(
        error?.message || "Password reset failed"
      );
    }
  }
);

// ======================================================
// UPDATE PROFILE
// ======================================================

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth?.token;

      return await apiRequest(
        "/auth/profile",
        "PUT",
        profileData,
        token
      );
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to update profile"
      );
    }
  }
);

// ======================================================
// STORED USER
// ======================================================

const getStoredUser = () => {
  try {
    const user = localStorage.getItem("user");

    if (!user) {
      return null;
    }

    return JSON.parse(user);
  } catch (error) {
    console.error("Failed to read stored user:", error);
    localStorage.removeItem("user");
    return null;
  }
};

// ======================================================
// STORED TOKEN
// ======================================================

const getStoredToken = () => {
  try {
    return localStorage.getItem("token") || null;
  } catch (error) {
    console.error("Failed to read stored token:", error);
    return null;
  }
};

// ======================================================
// INITIAL STATE
// ======================================================

const initialState = {
  user: getStoredUser(),
  token: getStoredToken(),

  isAuthenticated: !!getStoredToken(),

  loading: false,
  error: null,
  success: null,

  // Login
  loginLoading: false,
  loginError: null,
  loginSuccess: null,

  // Register
  registerLoading: false,
  registerError: null,
  registerSuccess: null,

  // Recruiter Register
  recruiterRegisterLoading: false,
  recruiterRegisterError: null,
  recruiterRegisterSuccess: null,

  // Forgot Password
  forgotPasswordLoading: false,
  forgotPasswordError: null,
  forgotPasswordSuccess: null,

  // OTP
  verifyOTPLoading: false,
  verifyOTPError: null,
  verifyOTPSuccess: null,

  // Reset Password
  resetPasswordLoading: false,
  resetPasswordError: null,
  resetPasswordSuccess: null,

  // Profile
  updateProfileLoading: false,
  updateProfileError: null,
  updateProfileSuccess: null,
};

// ======================================================
// AUTH SLICE
// ======================================================

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    // ==================================================
    // SET AUTH ERROR
    // ==================================================

    setAuthError: (state, action) => {
      const message =
        action.payload || "Something went wrong.";

      state.error = message;
      state.loginError = message;
    },

    // ==================================================
    // CLEAR AUTH ERROR
    // ==================================================

    clearAuthError: (state) => {
      state.error = null;
      state.loginError = null;
      state.registerError = null;
      state.recruiterRegisterError = null;
      state.forgotPasswordError = null;
      state.verifyOTPError = null;
      state.resetPasswordError = null;
      state.updateProfileError = null;
    },

    // ==================================================
    // SET AUTH SUCCESS
    // ==================================================

    setAuthSuccess: (state, action) => {
      const message =
        action.payload || "Operation successful.";

      state.success = message;
      state.loginSuccess = message;
      state.registerSuccess = message;
      state.forgotPasswordSuccess = message;
      state.verifyOTPSuccess = message;
      state.resetPasswordSuccess = message;
      state.updateProfileSuccess = message;
    },

    // ==================================================
    // CLEAR AUTH SUCCESS
    // ==================================================

    clearAuthSuccess: (state) => {
      state.success = null;
      state.loginSuccess = null;
      state.registerSuccess = null;
      state.recruiterRegisterSuccess = null;
      state.forgotPasswordSuccess = null;
      state.verifyOTPSuccess = null;
      state.resetPasswordSuccess = null;
      state.updateProfileSuccess = null;
    },

    // ==================================================
    // CLEAR LOGIN ERROR
    // ==================================================

    clearLoginError: (state) => {
      state.error = null;
      state.loginError = null;
    },

    // ==================================================
    // CLEAR REGISTER ERROR
    // ==================================================

    clearRegisterError: (state) => {
      state.error = null;
      state.registerError = null;
    },

    // ==================================================
    // CLEAR RECRUITER REGISTER ERROR
    // ==================================================

    clearRecruiterRegisterError: (state) => {
      state.error = null;
      state.recruiterRegisterError = null;
    },

    // ==================================================
    // CLEAR FORGOT PASSWORD ERROR
    // ==================================================

    clearForgotPasswordError: (state) => {
      state.error = null;
      state.forgotPasswordError = null;
    },

    // ==================================================
    // CLEAR OTP ERROR
    // ==================================================

    clearVerifyOTPError: (state) => {
      state.error = null;
      state.verifyOTPError = null;
    },

    // ==================================================
    // CLEAR RESET PASSWORD ERROR
    // ==================================================

    clearResetPasswordError: (state) => {
      state.error = null;
      state.resetPasswordError = null;
    },

    // ==================================================
    // CLEAR PROFILE ERROR
    // ==================================================

    clearUpdateProfileError: (state) => {
      state.error = null;
      state.updateProfileError = null;
    },

    // ==================================================
    // SET CREDENTIALS
    // ==================================================

    setCredentials: (state, action) => {
      const payload = action.payload || {};

      const user =
        payload.user ||
        payload.data?.user ||
        null;

      const token =
        payload.token ||
        payload.data?.token ||
        null;

      if (user) {
        state.user = user;

        localStorage.setItem(
          "user",
          JSON.stringify(user)
        );
      }

      if (token) {
        state.token = token;
        state.isAuthenticated = true;

        localStorage.setItem(
          "token",
          token
        );
      }
    },

    // ==================================================
    // LOGOUT
    // ==================================================

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      state.loading = false;

      state.error = null;
      state.success = null;

      state.loginLoading = false;
      state.loginError = null;
      state.loginSuccess = null;

      state.registerLoading = false;
      state.registerError = null;
      state.registerSuccess = null;

      state.recruiterRegisterLoading = false;
      state.recruiterRegisterError = null;
      state.recruiterRegisterSuccess = null;

      state.forgotPasswordLoading = false;
      state.forgotPasswordError = null;
      state.forgotPasswordSuccess = null;

      state.verifyOTPLoading = false;
      state.verifyOTPError = null;
      state.verifyOTPSuccess = null;

      state.resetPasswordLoading = false;
      state.resetPasswordError = null;
      state.resetPasswordSuccess = null;

      state.updateProfileLoading = false;
      state.updateProfileError = null;
      state.updateProfileSuccess = null;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },

  // ====================================================
  // EXTRA REDUCERS
  // ====================================================

  extraReducers: (builder) => {
    // ==================================================
    // REGISTER USER
    // ==================================================

    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.registerLoading = true;

        state.error = null;
        state.registerError = null;

        state.success = null;
        state.registerSuccess = null;
      })

      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.registerLoading = false;

        state.error = null;
        state.registerError = null;

        const payload = action.payload || {};

        const user =
          payload.user ||
          payload.data?.user ||
          null;

        const token =
          payload.token ||
          payload.data?.token ||
          null;

        const message =
          payload.message ||
          payload.data?.message ||
          "Registration successful.";

        state.success = message;
        state.registerSuccess = message;

        if (user) {
          state.user = user;

          localStorage.setItem(
            "user",
            JSON.stringify(user)
          );
        }

        if (token) {
          state.token = token;
          state.isAuthenticated = true;

          localStorage.setItem(
            "token",
            token
          );
        }
      })

      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.registerLoading = false;

        state.success = null;
        state.registerSuccess = null;

        const message =
          action.payload || "Registration failed.";

        state.error = message;
        state.registerError = message;
      });

    // ==================================================
    // RECRUITER REGISTER
    // ==================================================

    builder
      .addCase(registerRecruiter.pending, (state) => {
        state.loading = true;
        state.recruiterRegisterLoading = true;

        state.error = null;
        state.recruiterRegisterError = null;

        state.success = null;
        state.recruiterRegisterSuccess = null;
      })

      .addCase(
        registerRecruiter.fulfilled,
        (state, action) => {
          state.loading = false;
          state.recruiterRegisterLoading = false;

          state.error = null;
          state.recruiterRegisterError = null;

          const payload = action.payload || {};

          const user =
            payload.user ||
            payload.data?.user ||
            null;

          const token =
            payload.token ||
            payload.data?.token ||
            null;

          const message =
            payload.message ||
            payload.data?.message ||
            "Recruiter registration successful.";

          state.success = message;
          state.recruiterRegisterSuccess =
            message;

          if (user) {
            state.user = user;

            localStorage.setItem(
              "user",
              JSON.stringify(user)
            );
          }

          if (token) {
            state.token = token;
            state.isAuthenticated = true;

            localStorage.setItem(
              "token",
              token
            );
          }
        }
      )

      .addCase(
        registerRecruiter.rejected,
        (state, action) => {
          state.loading = false;
          state.recruiterRegisterLoading = false;

          state.success = null;
          state.recruiterRegisterSuccess = null;

          const message =
            action.payload ||
            "Recruiter registration failed.";

          state.error = message;
          state.recruiterRegisterError = message;
        }
      );

    // ==================================================
    // LOGIN
    // ==================================================

    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.loginLoading = true;

        state.error = null;
        state.loginError = null;

        state.success = null;
        state.loginSuccess = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.loginLoading = false;

        state.error = null;
        state.loginError = null;

        const payload = action.payload || {};

        const user =
          payload.user ||
          payload.data?.user ||
          null;

        const token =
          payload.token ||
          payload.data?.token ||
          null;

        const message =
          payload.message ||
          payload.data?.message ||
          "Login successful.";

        state.success = message;
        state.loginSuccess = message;

        if (user) {
          state.user = user;

          localStorage.setItem(
            "user",
            JSON.stringify(user)
          );
        }

        if (token) {
          state.token = token;
          state.isAuthenticated = true;

          localStorage.setItem(
            "token",
            token
          );
        }
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.loginLoading = false;

        state.success = null;
        state.loginSuccess = null;

        const message =
          action.payload || "Login failed.";

        state.error = message;
        state.loginError = message;

        state.isAuthenticated = false;
      });

    // ==================================================
    // FORGOT PASSWORD
    // ==================================================

    builder
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.forgotPasswordLoading = true;

        state.error = null;
        state.forgotPasswordError = null;

        state.success = null;
        state.forgotPasswordSuccess = null;
      })

      .addCase(
        forgotPassword.fulfilled,
        (state, action) => {
          state.loading = false;
          state.forgotPasswordLoading = false;

          state.error = null;
          state.forgotPasswordError = null;

          const payload = action.payload || {};

          const message =
            payload.message ||
            payload.data?.message ||
            "OTP sent successfully.";

          state.success = message;
          state.forgotPasswordSuccess =
            message;
        }
      )

      .addCase(
        forgotPassword.rejected,
        (state, action) => {
          state.loading = false;
          state.forgotPasswordLoading = false;

          state.success = null;
          state.forgotPasswordSuccess = null;

          const message =
            action.payload ||
            "Failed to send OTP.";

          state.error = message;
          state.forgotPasswordError =
            message;
        }
      );

    // ==================================================
    // VERIFY OTP
    // ==================================================

    builder
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.verifyOTPLoading = true;

        state.error = null;
        state.verifyOTPError = null;

        state.success = null;
        state.verifyOTPSuccess = null;
      })

      .addCase(
        verifyOTP.fulfilled,
        (state, action) => {
          state.loading = false;
          state.verifyOTPLoading = false;

          state.error = null;
          state.verifyOTPError = null;

          const payload = action.payload || {};

          const message =
            payload.message ||
            payload.data?.message ||
            "OTP verified successfully.";

          state.success = message;
          state.verifyOTPSuccess = message;
        }
      )

      .addCase(
        verifyOTP.rejected,
        (state, action) => {
          state.loading = false;
          state.verifyOTPLoading = false;

          state.success = null;
          state.verifyOTPSuccess = null;

          const message =
            action.payload ||
            "OTP verification failed.";

          state.error = message;
          state.verifyOTPError = message;
        }
      );

    // ==================================================
    // RESET PASSWORD
    // ==================================================

    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.resetPasswordLoading = true;

        state.error = null;
        state.resetPasswordError = null;

        state.success = null;
        state.resetPasswordSuccess = null;
      })

      .addCase(
        resetPassword.fulfilled,
        (state, action) => {
          state.loading = false;
          state.resetPasswordLoading = false;

          state.error = null;
          state.resetPasswordError = null;

          const payload = action.payload || {};

          const message =
            payload.message ||
            payload.data?.message ||
            "Password reset successful.";

          state.success = message;
          state.resetPasswordSuccess =
            message;
        }
      )

      .addCase(
        resetPassword.rejected,
        (state, action) => {
          state.loading = false;
          state.resetPasswordLoading = false;

          state.success = null;
          state.resetPasswordSuccess = null;

          const message =
            action.payload ||
            "Password reset failed.";

          state.error = message;
          state.resetPasswordError =
            message;
        }
      );

    // ==================================================
    // UPDATE PROFILE
    // ==================================================

    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.updateProfileLoading = true;

        state.error = null;
        state.updateProfileError = null;

        state.success = null;
        state.updateProfileSuccess = null;
      })

      .addCase(
        updateProfile.fulfilled,
        (state, action) => {
          state.loading = false;
          state.updateProfileLoading = false;

          state.error = null;
          state.updateProfileError = null;

          const payload = action.payload || {};

          const updatedUser =
            payload.user ||
            payload.data?.user ||
            payload.updatedUser ||
            payload.data?.updatedUser ||
            null;

          const message =
            payload.message ||
            payload.data?.message ||
            "Profile updated successfully.";

          state.success = message;
          state.updateProfileSuccess = message;

          if (updatedUser) {
            state.user = updatedUser;

            localStorage.setItem(
              "user",
              JSON.stringify(updatedUser)
            );
          }
        }
      )

      .addCase(
        updateProfile.rejected,
        (state, action) => {
          state.loading = false;
          state.updateProfileLoading = false;

          state.success = null;
          state.updateProfileSuccess = null;

          const message =
            action.payload ||
            "Failed to update profile.";

          state.error = message;
          state.updateProfileError = message;
        }
      );
  },
});

// ======================================================
// ACTION EXPORTS
// ======================================================

export const {
  setAuthError,
  clearAuthError,

  setAuthSuccess,
  clearAuthSuccess,

  clearLoginError,
  clearRegisterError,
  clearRecruiterRegisterError,

  clearForgotPasswordError,
  clearVerifyOTPError,
  clearResetPasswordError,
  clearUpdateProfileError,

  setCredentials,
  logout,
} = authSlice.actions;

// ======================================================
// SELECTORS
// ======================================================

export const selectCurrentUser = (state) =>
  state.auth?.user || null;

export const selectAuthToken = (state) =>
  state.auth?.token || null;

export const selectIsAuthenticated = (state) =>
  state.auth?.isAuthenticated || false;

export const selectAuthLoading = (state) =>
  state.auth?.loading || false;

export const selectAuthError = (state) =>
  state.auth?.error || null;

export const selectAuthSuccess = (state) =>
  state.auth?.success || null;

// ======================================================
// DEFAULT EXPORT
// ======================================================

export default authSlice.reducer;

