import axiosClient from "./axiosClient";

export const getAds = async () => {
  const res = await axiosClient.get("/advertisment/all"); // ← change endpoint
  return res.data;
};
