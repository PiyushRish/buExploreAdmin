import axiosClient from "./axiosClient.js";

// ==========================================
// Subservice Templates
// ==========================================

export const getServiceTemplates = async (params = {}) => {
  const res = await axiosClient.get("/services/templates", { params });
  return res.data;
};

export const getServiceTemplateById = async (id) => {
  const res = await axiosClient.get(`/services/templates/${id}`);
  return res.data;
};

export const createServiceTemplate = async (templateData) => {
  const res = await axiosClient.post("/services/templates", templateData);
  return res.data;
};

export const updateServiceTemplate = async (id, templateData) => {
  const res = await axiosClient.put(`/services/templates/${id}`, templateData);
  return res.data;
};

export const deleteServiceTemplate = async (id) => {
  const res = await axiosClient.delete(`/services/templates/${id}`);
  return res.data;
};

export const seedDefaultTemplates = async () => {
  const res = await axiosClient.post("/services/templates/seed-defaults");
  return res.data;
};

// ==========================================
// Dynamic Custom Services (Listings)
// ==========================================

export const getCustomServices = async (params = {}) => {
  const res = await axiosClient.get("/services/custom", { params });
  return res.data;
};

export const getCustomServiceById = async (id) => {
  const res = await axiosClient.get(`/services/custom/${id}`);
  return res.data;
};

export const createCustomService = async (data) => {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  const res = await axiosClient.post("/services/custom", data, {
    ...(isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}),
    timeout: 180000,
  });
  return res.data;
};

export const updateCustomService = async (id, data) => {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  const res = await axiosClient.put(`/services/custom/${id}`, data, {
    ...(isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}),
    timeout: 180000,
  });
  return res.data;
};

export const deleteCustomService = async (id) => {
  const res = await axiosClient.delete(`/services/custom/${id}`);
  return res.data;
};

export const trackCustomServiceClick = async (id) => {
  const res = await axiosClient.post(`/services/custom/${id}/click`);
  return res.data;
};

export const trackCustomServiceShare = async (id) => {
  const res = await axiosClient.post(`/services/custom/${id}/share`);
  return res.data;
};

export const trackCustomServiceLike = async (id) => {
  const res = await axiosClient.post(`/services/custom/${id}/like`);
  return res.data;
};
