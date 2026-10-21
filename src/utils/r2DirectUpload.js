import axios from "axios";
import axiosClient, { notifyUploadProgress } from "../api/axiosClient.js";

/**
 * Upload a single file directly to Cloudflare R2 using a short-lived presigned PUT URL.
 * Bypasses the backend server completely (0 bytes through Node/Workers).
 *
 * @param {File} file - Browser File object
 * @param {string} category - e.g. "testimonials", "places", "services/hotels", "emergency", "events/surprise"
 * @param {"image" | "video"} [mediaType="image"]
 * @returns {Promise<Object>} Verified R2 asset descriptor { url, public_id, storageProvider: "r2", key, mediaType }
 */
export const uploadFileDirectToR2 = async (file, category, mediaType = "image") => {
  if (!file) return null;

  // 1. Request short-lived presigned URL from backend
  const presignRes = await axiosClient.post("/media/r2/presign", {
    fileName: file.name,
    contentType: file.type || (mediaType === "video" ? "video/mp4" : "image/jpeg"),
    mediaType,
    category,
  });

  const { uploadUrl, key, headers } = presignRes.data?.data || presignRes.data;

  // 2. Direct HTTP PUT to Cloudflare R2 storage
  // Standalone axios is used so the absolute Cloudflare URL is called directly,
  // without baseURL or Authorization headers that R2 would reject.
  await axios.put(uploadUrl, file, {
    headers: {
      "Content-Type": file.type || headers?.["Content-Type"] || "application/octet-stream",
    },
    onUploadProgress: (progressEvent) => {
      const total = progressEvent.total || file.size;
      const loaded = progressEvent.loaded || 0;
      const percent = total > 0 ? Math.min(100, Math.round((loaded * 100) / total)) : 0;
      notifyUploadProgress({
        active: true,
        percent,
        loaded,
        total,
        status: `Uploading directly to Cloudflare R2 (${percent}%)...`,
      });
    },
  });

  // 3. Finalize on backend to verify R2 object and get asset metadata
  const completeRes = await axiosClient.post("/media/r2/complete", {
    key,
    mediaType,
    category,
  });

  notifyUploadProgress({
    active: false,
    finished: true,
    percent: 100,
    status: "R2 direct upload complete! ✨",
  });

  return completeRes.data?.data || completeRes.data;
};

/**
 * Upload multiple files directly to Cloudflare R2 in parallel.
 *
 * @param {File[]} files
 * @param {string} category
 * @param {"image" | "video"} [mediaType="image"]
 * @returns {Promise<Object[]>} Array of verified R2 asset descriptors
 */
export const uploadMultipleFilesDirectToR2 = async (files = [], category, mediaType = "image") => {
  if (!files || !files.length) return [];
  const validFiles = Array.from(files).filter((f) => f instanceof File);
  if (!validFiles.length) return [];

  const results = await Promise.all(
    validFiles.map((file) => uploadFileDirectToR2(file, category, mediaType))
  );

  return results.filter(Boolean);
};
