import axiosClient from "./axiosClient";

export const getSurpriseEvents = async (params = {}) => {
  const res = await axiosClient.get("/surprise-events", { params });
  return res.data;
};

export const addSurpriseEvent = async (data) => {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  const res = await axiosClient.post("/surprise-events", data, {
    ...(isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}),
    timeout: 120000,
  });
  return res.data;
};

export const updateSurpriseEvent = async (id, data) => {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  const res = await axiosClient.put(`/surprise-events/${id}`, data, {
    ...(isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}),
    timeout: 120000,
  });
  return res.data;
};

export const getSurpriseEventById = async (id) => {
  const res = await axiosClient.get(`/surprise-events/${id}`);
  return res.data;
};

export const softDeleteSurpriseEvent = async (id) => {
  const res = await axiosClient.patch(`/surprise-events/${id}/soft-delete`);
  return res.data;
};

export const restoreSurpriseEvent = async (id) => {
  const res = await axiosClient.patch(`/surprise-events/${id}/restore`);
  return res.data;
};

export const hardDeleteSurpriseEvent = async (id) => {
  const res = await axiosClient.delete(`/surprise-events/${id}/hard`);
  return res.data;
};

export const deleteSurpriseEvent = async (id) => {
  const res = await axiosClient.delete(`/surprise-events/${id}`);
  return res.data;
};
