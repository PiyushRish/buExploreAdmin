
import axiosClient from "./axiosClient";

export const getNotifications = async () => {
  const res = await axiosClient.get("/notification/getAllNotification"); // ← change endpoint
  return res.data;
};
