import axios from "axios";
import toast from "react-hot-toast";

const resolveBaseUrl = () => {
  if (import.meta.env?.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
  ) {
    return "http://localhost:5500/api";
  }
  return "https://buexplorebackend.onrender.com/api";
};

const axiosClient = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach Authorization Bearer Token if logged in
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global Response Interceptor for Error Handling
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // We can extract the message from the backend structure securely
    const message = error.response?.data?.message || error.message || "An unexpected API error occurred.";
    toast.error(message);
    return Promise.reject(error);
  }
);

export default axiosClient;