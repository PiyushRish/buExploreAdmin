import axiosClient from "./axiosClient";

export const getAgencies = async (params = {}) => {
  const res = await axiosClient.get("/services/agencies", { params });
  return res.data;
};

export const getAgencyById = async (id) => {
  const res = await axiosClient.get(`/services/agency/${id}`);
  return res.data;
};

export const addAgency = async (formData) => {
  const res = await axiosClient.post("/services/createAgency", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000,
  });
  return res.data;
};

export const updateAgency = async (id, formData) => {
  const res = await axiosClient.put(`/services/agency/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000,
  });
  return res.data;
};

export const deleteAgency = async (id) => {
  const res = await axiosClient.delete(`/services/agency/${id}`);
  return res.data;
};
