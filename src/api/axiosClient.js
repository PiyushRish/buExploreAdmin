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

/* ─── GLOBAL UPLOAD PROGRESS LISTENER SYSTEM ───────────────────── */
const uploadListeners = new Set();

export const subscribeUploadProgress = (fn) => {
  uploadListeners.add(fn);
  return () => uploadListeners.delete(fn);
};

export const notifyUploadProgress = (data) => {
  uploadListeners.forEach((fn) => {
    try {
      fn(data);
    } catch (e) {
      console.error("Upload listener error:", e);
    }
  });
};

const axiosClient = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach Authorization Bearer Token and monitor upload progress
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const isFormData =
      (typeof FormData !== "undefined" && config.data instanceof FormData) ||
      (config.headers && String(config.headers["Content-Type"]).includes("multipart/form-data"));

    if (isFormData) {
      // Ensure generous timeout (5 minutes) for high-res videos/photos
      if (!config.timeout || config.timeout < 300000) {
        config.timeout = 300000;
      }

      // Signal upload start
      notifyUploadProgress({
        active: true,
        percent: 0,
        loaded: 0,
        total: 100,
        status: "Initiating asset upload...",
        url: config.url,
      });

      const originalProgress = config.onUploadProgress;
      config.onUploadProgress = (e) => {
        const total = e.total || 0;
        const loaded = e.loaded || 0;
        const percent = total > 0 ? Math.min(100, Math.round((loaded * 100) / total)) : 0;

        let statusText = `Uploading media (${percent}%)...`;
        if (percent >= 100) {
          statusText = "Upload complete! Saving & processing on Cloudflare R2 / Server...";
        } else if (percent > 85) {
          statusText = "Almost done uploading...";
        }

        notifyUploadProgress({
          active: true,
          percent,
          loaded,
          total,
          status: statusText,
          url: config.url,
        });

        if (typeof originalProgress === "function") {
          originalProgress(e);
        }
      };
    }

    return config;
  },
  (error) => {
    notifyUploadProgress({ active: false, error: true, status: "Upload failed" });
    return Promise.reject(error);
  }
);

// Global Response Interceptor for Error Handling & Upload Completion
axiosClient.interceptors.response.use(
  (response) => {
    const isFormData =
      (typeof FormData !== "undefined" && response.config?.data instanceof FormData) ||
      (response.config?.headers && String(response.config.headers["Content-Type"]).includes("multipart/form-data"));

    if (isFormData) {
      notifyUploadProgress({
        active: false,
        finished: true,
        percent: 100,
        status: "Upload & processing complete! ✨",
      });
    }
    return response;
  },
  (error) => {
    notifyUploadProgress({
      active: false,
      error: true,
      status: error.response?.data?.message || "Upload failed",
    });
    const message = error.response?.data?.message || error.message || "An unexpected API error occurred.";
    toast.error(message);
    return Promise.reject(error);
  }
);

export default axiosClient;