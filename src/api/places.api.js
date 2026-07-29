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

// 6. Add New Place (FormData)
export const addPlace = async (formData) => {
  const res = await axiosClient.post("/places/addPlace", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 300000,
  });
  return res.data;
};

// 7. Update Place (FormData)
export const updatePlace = async ({ id, formData }) => {
  const res = await axiosClient.patch(`/places/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
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

// 10. Like Place
export const likePlace = async (placeId) => {
  const res = await axiosClient.post(`/places/like/${placeId}`);
  return res.data;
};