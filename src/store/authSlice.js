import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "../services/api";

// ==========================================
// REGEX VALIDATION
// ==========================================

const nameRegex = /^[A-Za-z ]{2,50}$/;

const companyNameRegex = /^[A-Za-z0-9 &.-]{2,100}$/;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

const phoneRegex = /^(?:\+92|0)3\d{9}$/;

const otpRegex = /^\d{6}$/;


// ==========================================
// VALIDATION FUNCTION
// ==========================================

const validateAuthData = (data, type) => {

  // ----------------------------------------
  // Candidate Register
  // ----------------------------------------

  if (type === "register") {

    if (
      !data.name ||
      !nameRegex.test(data.name.trim())
    ) {
      return "Name must contain only letters and spaces (2-50 characters)";
    }

    if (
      !data.email ||
      !emailRegex.test(data.email.trim())
    ) {
      return "Please enter a valid email address";
    }

    if (
      !data.password ||
      !passwordRegex.test(data.password)
    ) {
      return "Password must be at least 8 characters and contain a letter and a number";
    }

    if (
      data.phone &&
      !phoneRegex.test(data.phone.trim())
    ) {
      return "Please enter a valid Pakistani phone number";
    }
  }


  // ----------------------------------------
  // Recruiter Register
  // ----------------------------------------

  if (type === "recruiterRegister") {

    if (
      !data.name ||
      !nameRegex.test(data.name.trim())
    ) {
      return "Name must contain only letters and spaces (2-50 characters)";
    }

    if (
      !data.companyName ||
      !companyNameRegex.test(
        data.companyName.trim()
      )
    ) {
      return "Company name must be 2-100 characters";
    }

    if (
      !data.email ||
      !emailRegex.test(data.email.trim())
    ) {
      return "Please enter a valid email address";
    }

    if (
      !data.password ||
      !passwordRegex.test(data.password)
    ) {
      return "Password must be at least 8 characters and contain a letter and a number";
    }
  }


  // ----------------------------------------
  // Login
  // ----------------------------------------

  if (type === "login") {

    if (
      !data.email ||
      !emailRegex.test(data.email.trim())
    ) {
      return "Please enter a valid email address";
    }

    if (!data.password) {
      return "Password is required";
    }
  }


  // ----------------------------------------
  // Forgot Password
  // ----------------------------------------

  if (type === "forgotPassword") {

    if (
      !data.email ||
      !emailRegex.test(data.email.trim())
    ) {
      return "Please enter a valid email address";
    }
  }


  // ----------------------------------------
  // Verify OTP
  // ----------------------------------------

  if (type === "verifyOTP") {

    if (
      !data.email ||
      !emailRegex.test(data.email.trim())
    ) {
      return "Please enter a valid email address";
    }

    if (
      !data.otp ||
      !otpRegex.test(data.otp)
    ) {
      return "OTP must be exactly 6 digits";
    }
  }

  return null;
};


// ==========================================
// CANDIDATE REGISTER
// ==========================================

export const registerCandidate = createAsyncThunk(
  "auth/registerCandidate",

  async (userData, { rejectWithValue }) => {
    try {

      const validationError =
        validateAuthData(
          userData,
          "register"
        );

      if (validationError) {
        return rejectWithValue(
          validationError
        );
      }

      const data = await apiRequest(
        "/auth/register",
        "POST",
        userData
      );

      return data;

    } catch (error) {

      return rejectWithValue(
        error.message
      );
    }
  }
);


// ==========================================
// RECRUITER REGISTER
// ==========================================

export const registerRecruiter = createAsyncThunk(
  "auth/registerRecruiter",

  async (userData, { rejectWithValue }) => {
    try {

      const validationError =
        validateAuthData(
          userData,
          "recruiterRegister"
        );

      if (validationError) {
        return rejectWithValue(
          validationError
        );
      }

      const data = await apiRequest(
        "/auth/recruiter/register",
        "POST",
        userData
      );

      return data;

    } catch (error) {

      return rejectWithValue(
        error.message
      );
    }
  }
);


// ==========================================
// LOGIN
// ==========================================

export const loginUser = createAsyncThunk(
  "auth/loginUser",

  async (credentials, { rejectWithValue }) => {
    try {

      const validationError =
        validateAuthData(
          credentials,
          "login"
        );

      if (validationError) {
        return rejectWithValue(
          validationError
        );
      }

      const data = await apiRequest(
        "/auth/login",
        "POST",
        {
          email: credentials.email.trim(),
          password: credentials.password,
        }
      );


      // Save token
      if (data.token) {
        localStorage.setItem(
          "token",
          data.token
        );
      }


      // Save user
      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      }


      return data;

    } catch (error) {

      return rejectWithValue(
        error.message
      );
    }
  }
);


// ==========================================
// FORGOT PASSWORD
// ==========================================

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",

  async (data, { rejectWithValue }) => {
    try {

      const validationError =
        validateAuthData(
          data,
          "forgotPassword"
        );

      if (validationError) {
        return rejectWithValue(
          validationError
        );
      }

      const response = await apiRequest(
        "/auth/forgot-password",
        "POST",
        {
          email: data.email.trim(),
        }
      );


      return response;

    } catch (error) {

      return rejectWithValue(
        error.message
      );
    }
  }
);


// ==========================================
// VERIFY OTP
// ==========================================

export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",

  async ({ email, otp }, { rejectWithValue }) => {
    try {

      const validationError =
        validateAuthData(
          {
            email,
            otp,
          },
          "verifyOTP"
        );

      if (validationError) {
        return rejectWithValue(
          validationError
        );
      }


      const data = await apiRequest(
        "/auth/verify-otp",
        "POST",
        {
          email: email.trim(),
          otp,
        }
      );


      // Save reset token
      if (data.resetToken) {
        localStorage.setItem(
          "resetToken",
          data.resetToken
        );
      }


      return data;

    } catch (error) {

      return rejectWithValue(
        error.message
      );
    }
  }
);
// ==========================================
// RESET PASSWORD
// ==========================================

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",

  async (
    { email, password, confirmPassword, resetToken },
    { rejectWithValue }
  ) => {
    try {
      if (!email || !emailRegex.test(email.trim())) {
        return rejectWithValue(
          "Please enter a valid email address"
        );
      }

      if (!resetToken) {
        return rejectWithValue(
          "Reset verification not found. Please verify your OTP again."
        );
      }

      if (!password || !passwordRegex.test(password)) {
        return rejectWithValue(
          "Password must be at least 8 characters and contain a letter and a number"
        );
      }

      if (password !== confirmPassword) {
        return rejectWithValue(
          "Passwords do not match."
        );
      }

      const data = await apiRequest(
        "/auth/reset-password",
        "POST",
        {
          email: email.trim(),
          password,
          confirmPassword,
          resetToken,
        }
      );

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


// ==========================================
// GET CURRENT USER
// ==========================================

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",

  async (_, { rejectWithValue }) => {
    try {

      const token =
        localStorage.getItem("token");

      if (!token) {
        return rejectWithValue(
          "Authentication token not found"
        );
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

      return rejectWithValue(
        error.message
      );
    }
  }
);


// ==========================================
// UPDATE PROFILE
// ==========================================

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",

  async (profileData, { rejectWithValue }) => {
    try {

      const token =
        localStorage.getItem("token");

      if (!token) {
        return rejectWithValue(
          "Authentication token not found"
        );
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

      return rejectWithValue(
        error.message
      );
    }
  }
);


// ==========================================
// INITIAL STATE
// ==========================================

const savedToken =
  localStorage.getItem("token");

const savedUser =
  localStorage.getItem("user");


let parsedUser = null;


if (savedUser) {

  try {

    parsedUser =
      JSON.parse(savedUser);

  } catch (error) {

    localStorage.removeItem("user");
  }
}


const initialState = {

  user: parsedUser,

  token: savedToken,

  isAuthenticated: !!savedToken,

  loading: false,

  error: null,

  success: null,
};


// ==========================================
// AUTH SLICE
// ==========================================

const authSlice = createSlice({

  name: "auth",

  initialState,

  reducers: {

    // --------------------------------------
    // LOGOUT
    // --------------------------------------

    logout: (state) => {

      state.user = null;

      state.token = null;

      state.isAuthenticated = false;

      state.error = null;

      state.success = null;


      localStorage.removeItem("token");

      localStorage.removeItem("user");
    },


    // --------------------------------------
    // CLEAR ERROR
    // --------------------------------------

    clearAuthError: (state) => {

      state.error = null;
    },


    // --------------------------------------
    // CLEAR SUCCESS
    // --------------------------------------

    clearAuthSuccess: (state) => {

      state.success = null;
    },
  },


  // ========================================
  // EXTRA REDUCERS
  // ========================================

  extraReducers: (builder) => {


    // ======================================
    // CANDIDATE REGISTER
    // ======================================

    builder
      .addCase(
        registerCandidate.pending,
        (state) => {

          state.loading = true;

          state.error = null;

          state.success = null;
        }
      )

      .addCase(
        registerCandidate.fulfilled,
        (state, action) => {

          state.loading = false;

          state.success =
            action.payload;

          state.error = null;
        }
      )

      .addCase(
        registerCandidate.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload ||
            "Registration failed";
        }
      );


    // ======================================
    // RECRUITER REGISTER
    // ======================================

    builder
      .addCase(
        registerRecruiter.pending,
        (state) => {

          state.loading = true;

          state.error = null;

          state.success = null;
        }
      )

      .addCase(
        registerRecruiter.fulfilled,
        (state, action) => {

          state.loading = false;

          state.success =
            action.payload;

          state.error = null;
        }
      )

      .addCase(
        registerRecruiter.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload ||
            "Recruiter registration failed";
        }
      );


    // ======================================
    // LOGIN
    // ======================================

    builder
      .addCase(
        loginUser.pending,
        (state) => {

          state.loading = true;

          state.error = null;

          state.success = null;
        }
      )

      .addCase(
        loginUser.fulfilled,
        (state, action) => {

          state.loading = false;

          state.user =
            action.payload.user;

          state.token =
            action.payload.token;

          state.isAuthenticated =
            true;

          state.success =
            action.payload;

          state.error = null;
        }
      )

      .addCase(
        loginUser.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload ||
            "Login failed";

          state.isAuthenticated =
            false;
        }
      );


    // ======================================
    // FORGOT PASSWORD
    // ======================================

    builder
      .addCase(
        forgotPassword.pending,
        (state) => {

          state.loading = true;

          state.error = null;

          state.success = null;
        }
      )

      .addCase(
        forgotPassword.fulfilled,
        (state, action) => {

          state.loading = false;

          state.success =
            action.payload;

          state.error = null;
        }
      )

      .addCase(
        forgotPassword.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload ||
            "Failed to send OTP";
        }
      );


    // ======================================
    // VERIFY OTP
    // ======================================

    builder
      .addCase(
        verifyOTP.pending,
        (state) => {

          state.loading = true;

          state.error = null;

          state.success = null;
        }
      )

      .addCase(
        verifyOTP.fulfilled,
        (state, action) => {

          state.loading = false;

          state.success =
            action.payload;

          state.error = null;
        }
      )

      .addCase(
        verifyOTP.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload ||
            "Invalid OTP";
        }
      );
    

    // ======================================
    // GET CURRENT USER
    // ======================================

    builder
      .addCase(
        getCurrentUser.pending,
        (state) => {

          state.loading = true;

          state.error = null;
        }
      )

      .addCase(
        getCurrentUser.fulfilled,
        (state, action) => {

          state.loading = false;

          state.user =
            action.payload.user;

          state.isAuthenticated =
            true;

          state.error = null;
        }
      )

      .addCase(
        getCurrentUser.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload ||
            "Failed to get current user";
        }
      );


    // ======================================
    // UPDATE PROFILE
    // ======================================

    builder
      .addCase(
        updateProfile.pending,
        (state) => {

          state.loading = true;

          state.error = null;

          state.success = null;
        }
      )

      .addCase(
        updateProfile.fulfilled,
        (state, action) => {

          state.loading = false;

          state.user =
            action.payload.user;

          state.success =
            action.payload;

          state.error = null;
        }
      )

      .addCase(
        updateProfile.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload ||
            "Profile update failed";
        }
      );

  },
});


// ==========================================
// ACTIONS
// ==========================================

export const {
  logout,
  clearAuthError,
  clearAuthSuccess,
} = authSlice.actions;


// ==========================================
// SELECTORS
// ==========================================

export const selectUser = (state) =>
  state.auth.user;

export const selectToken = (state) =>
  state.auth.token;

export const selectIsAuthenticated = (state) =>
  state.auth.isAuthenticated;

export const selectAuthLoading = (state) =>
  state.auth.loading;

export const selectAuthError = (state) =>
  state.auth.error;

export const selectAuthSuccess = (state) =>
  state.auth.success;


// ==========================================
// EXPORT REDUCER
// ==========================================

export default authSlice.reducer;