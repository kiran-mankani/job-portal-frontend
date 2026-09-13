import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/**
 * Admin login
 * POST /api/admin/login
 */
export const adminLoginApi = async ({ email, password }) => {
  const { data } = await adminApi.post("/admin/login", {
    email,
    password,
  });

  return data;
};

export default adminApi;