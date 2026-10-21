import axiosClient from "./axiosClient";

// 1. Get All Places (supports pagination & includeDeleted flag)
export const getPlaces = async (params = {}) => {
  const res = await axiosClient.get("/places/getAll", { params });
  return res.data;
};

// 2. Get Reels Video Feed with server-side interleaved ads
export const getReelsFeed = async (categoryId = "", page = 1, limit = 10, adInterval = 4) => {
  const finalCategoryId = categoryId === "" ? "ALL" : categoryId;
  const res = await axiosClient.post("/places/reels", {
    categoryId: finalCategoryId, page, limit, adInterval
  });
  return res.data;
};

// 3. Get Single Place Details
export const getPlaceById = async (id) => {
  const res = await axiosClient.get(`/places/${id}`);
  return res.data;
};

// 4. Search Places
export const searchPlaces = async (keyword) => {
  const res = await axiosClient.get(`/places/search?keyword=${encodeURIComponent(keyword)}`);
  return res.data;
};

// 5. Get Places by Category
export const getPlacesByCategory = async (categoryId) => {
  const res = await axiosClient.post("/places/category", { categoryId });
  return res.data;
};

// 6. Add New Place (JSON or FormData)
export const addPlace = async (data) => {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  const res = await axiosClient.post("/places/addPlace", data, {
    ...(isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}),
    timeout: 300000,
  });
  return res.data;
};

// 7. Update Place (JSON or FormData)
export const updatePlace = async ({ id, formData, data }) => {
  const payload = data !== undefined ? data : formData;
  const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;
  const res = await axiosClient.patch(`/places/${id}`, payload, {
    ...(isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}),
    timeout: 300000,
  });
  return res.data;
};

// 8. Delete Place (Handles both Soft Delete & Permanent Hard Delete)
export const deletePlace = async (param) => {
  // Extract placeId and hard deletion flag whether param is an Object { id, hard } or String
  const placeId = typeof param === "object" ? param.id : param;
  const isHard = typeof param === "object" ? Boolean(param.hard) : false;

  const res = await axiosClient.delete(`/places/delete/${placeId}`, {
    params: { hard: isHard },
  });
  return res.data;
};

// 9. Restore Soft-Deleted Place
export const restorePlace = async (placeId) => {
  const res = await axiosClient.patch(`/places/restore/${placeId}`);
  return res.data;
};

// 10. Like Place (Queued & Sequential)
export const likePlace = async (placeId) => {
  const res = await axiosClient.post(`/places/like/${placeId}`);
  return res.data;
};

// 11. Track Place View / Impression (Queued & Buffered)
export const trackPlaceView = async (placeId) => {
  const res = await axiosClient.post(`/places/stats/view/${placeId}`);
  return res.data;
};

// 12. Track Place Share (Queued & Buffered)
export const trackPlaceShare = async (placeId) => {
  const res = await axiosClient.post(`/places/stats/share/${placeId}`);
  return res.data;
};