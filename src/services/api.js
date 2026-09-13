const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const apiRequest = async (
  endpoint,
  method = "GET",
  body = null,
  token = null
) => {
  try {
    const headers = {};

    // JSON ke liye Content-Type
    if (!(body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    // JWT token
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body:
        body instanceof FormData
          ? body
          : body !== null
          ? JSON.stringify(body)
          : undefined,
    });

    const contentType = response.headers.get("content-type") || "";

    let data;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();

      console.error("Non-JSON response:", text);

      throw new Error(
        `Server returned ${response.status} ${response.statusText}. Check API URL or route.`
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message || data.error || "Something went wrong"
      );
    }

    return data;
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
};

export default API_URL;