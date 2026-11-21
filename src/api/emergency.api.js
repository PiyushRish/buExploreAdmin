import axiosClient from "./axiosClient.js";

export const getEmergencyServices = async (params = {}) => {
  const res = await axiosClient.get("/services/emergency", { params });
  return res.data;
};

export const getEmergencyServiceById = async (id) => {
  const res = await axiosClient.get(`/services/emergency/${id}`);
  return res.data;
};

export const getEmergencyServicesBySubCategory = async (subCategory) => {
  const res = await axiosClient.get(`/services/emergency/subCategory/${subCategory}`);
  return res.data;
};

export const createEmergencyService = async (data) => {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  const res = await axiosClient.post("/services/createEmergency", data, {
    ...(isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}),
    timeout: 120000,
  });
  return res.data;
};

export const updateEmergencyService = async (id, data) => {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  const res = await axiosClient.put(`/services/emergency/${id}`, data, {
    ...(isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}),
    timeout: 120000,
  });
  return res.data;
};

export const deleteEmergencyService = async (id) => {
  const res = await axiosClient.delete(`/services/emergency/${id}`);
  return res.data;
};

export const trackEmergencyCall = async (id) => {
  const res = await axiosClient.post(`/services/emergency/call/${id}`);
  return res.data;
};
