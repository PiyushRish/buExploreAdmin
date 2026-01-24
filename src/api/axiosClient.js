import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://buexplorebackend.onrender.com/api", // ← your API base URL
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: add interceptors later if needed
// axiosClient.interceptors.request.use(...)

export default axiosClient;
