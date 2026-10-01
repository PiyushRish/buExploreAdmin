import axiosClient from "./axiosClient";

export const getSurpriseEvents = async (params = {}) => {
  const res = await axiosClient.get("/surprise-events", { params });
  return res.data;
};

export const addSurpriseEvent = async (formData) => {
  const res = await axiosClient.post("/surprise-events", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120000,
  });
  return res.data;
};

export const updateSurpriseEvent = async (id, formData) => {
  const res = await axiosClient.put(`/surprise-events/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120000,
  });
  return res.data;
};

export const deleteSurpriseEvent = async (id) => {
  const res = await axiosClient.delete(`/surprise-events/${id}`);
  return res.data;
};
