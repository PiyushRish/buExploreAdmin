import axiosClient from "./axiosClient";

export const getNotifications = async () => {
  const res = await axiosClient.get("/notification/getAllNotification");
  return res.data;
};

export const sendNotification = async (payload) => {
  const res = await axiosClient.post("/notification/send", payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.data;
};

export const deleteNotification = async (id) => {
  const res = await axiosClient.delete(`/notification/${id}`);
  return res.data;
};