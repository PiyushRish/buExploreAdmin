import axiosClient from "./axiosClient";

export const getAllTours = async () => {
  const res = await axiosClient.get("/tours/all");
  return res.data;
};

export const getMyTours = async () => {
  const res = await axiosClient.get("/tours/my");
  return res.data;
};

export const addTour = async (tourData) => {
  const res = await axiosClient.post("/tours", tourData);
  return res.data;
};

export const deleteTour = async (id) => {
  const res = await axiosClient.delete(`/tours/${id}`);
  return res.data;
};
