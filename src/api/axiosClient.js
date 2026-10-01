import axios from "axios";
import toast from "react-hot-toast";

const axiosClient = axios.create({
  baseURL: "https://buexplorebackend.onrender.com/api", // Base URL
  // baseURL: "http://localhost:5500/api", // Development URL
  timeout: 10000,
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