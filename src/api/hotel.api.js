import axiosClient from "./axiosClient";

export const getHotels = async () => {
  const res = await axiosClient.get("/services/hotel"); // ← change endpoint
  return res.data;
};
