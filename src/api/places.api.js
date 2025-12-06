import axiosClient from "./axiosClient";

export const getPlaces = async () => {
  const res = await axiosClient.get("/places/getAll"); // ← change endpoint
  return res.data;
};
