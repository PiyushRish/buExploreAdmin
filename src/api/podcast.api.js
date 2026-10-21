import axiosClient from "./axiosClient.js";

export const getPodcasts = async () => {
  const res = await axiosClient.get("/podcasts/getAll");
  return res.data;
};

export const addPodcast = async (data) => {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  const res = await axiosClient.post("/podcasts/addPodcast", data, {
    ...(isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}),
  });
  return res.data;
};

export const deletePodcast = async (id) => {
  const res = await axiosClient.delete(`/podcasts/delete/${id}`);
  return res.data;
};
