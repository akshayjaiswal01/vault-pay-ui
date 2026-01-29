import axios from "axios";
import { showErrorToast } from "./toast";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://vault-pay-backend.onrender.com/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add JWT token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("jwtToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor to handle 401 responses (unauthorized/token expired)
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes("/auth/login");
      if (isLoginRequest) {
        return Promise.reject(error);
      }
      if (typeof window !== "undefined") {
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("authUser");
        showErrorToast("Session expired. Please login again.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
