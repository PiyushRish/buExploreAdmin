import axiosClient from "./axiosClient";

export const getGuides = async () => {
  const res = await axiosClient.get("/services/guides"); // ← change endpoint
  return res.data;
};
