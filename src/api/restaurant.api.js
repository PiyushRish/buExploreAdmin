import axiosClient from "./axiosClient";

export const getRestaurants = async () => {
  const res = await axiosClient.get("/services/restaurants"); // ← change endpoint
  return res.data;
};
