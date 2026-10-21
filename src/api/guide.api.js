import axiosClient from "./axiosClient";

export const getGuides = async () => {
  const res = await axiosClient.get("/services/guides");
  return res.data;
};

export const addGuide = async (data) => {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  const res = await axiosClient.post("/services/createGuide", data, {
    ...(isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}),
    timeout: 60000,
  });
  return res.data;
};

export const updateGuide = async (guideId, data) => {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  const res = await axiosClient.patch(`/services/updateGuide/${guideId}`, data, {
    ...(isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}),
    timeout: 60000,
  });
  return res.data;
};

export const deleteGuide = async (guideId) => {
  const res = await axiosClient.delete(`/services/deleteGuide/${guideId}`);
  return res.data;
};