import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./authSlice";
import jobReducer from "./jobSlice";
import applicationReducer from "./applicationSlice";
import interviewReducer from "./interviewSlice";
import dashboardReducer from "./dashboardSlice";
import adminReducer from "./adminSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    job: jobReducer,
    applications: applicationReducer,
    interviews: interviewReducer,
    dashboard: dashboardReducer,
    admin: adminReducer,
  },
});

export default store;