import axiosClient from "./axiosClient";

export const getAgencies = async (params = {}) => {
  const res = await axiosClient.get("/services/agencies", { params });
  return res.data;
};

export const getAgencyById = async (id) => {
  const res = await axiosClient.get(`/services/agency/${id}`);
  return res.data;
};

export const addAgency = async (data) => {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  const res = await axiosClient.post("/services/createAgency", data, {
    ...(isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}),
    timeout: 60000,
  });
  return res.data;
};

export const updateAgency = async (id, data) => {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  const res = await axiosClient.put(`/services/agency/${id}`, data, {
    ...(isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}),
    timeout: 60000,
  });
  return res.data;
};

export const deleteAgency = async (id) => {
  const res = await axiosClient.delete(`/services/agency/${id}`);
  return res.data;
};
