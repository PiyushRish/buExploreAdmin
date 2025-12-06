import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5500/api", // ← your API base URL
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: add interceptors later if needed
// axiosClient.interceptors.request.use(...)

export default axiosClient;
