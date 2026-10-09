import axiosClient from "./axiosClient";

/** Admin: Get all notifications (history log) */
export const getNotifications = async () => {
  const res = await axiosClient.get("/notification/all");
  return res.data;
};

/** Admin: Send broadcast or targeted notification */
export const sendNotification = async (payload) => {
  const res = await axiosClient.post("/notification/send", payload);
  return res.data;
};

/** Admin: Delete notification by _id */
export const deleteNotification = async (id) => {
  const res = await axiosClient.delete(`/notification/${id}`);
  return res.data;
};

/** User: Mark single notification as read by UUID notificationId */
export const markAsRead = async (notificationId) => {
  const res = await axiosClient.patch(`/notification/${notificationId}/read`);
  return res.data;
};

/** User: Mark all notifications as read */
export const markAllAsRead = async () => {
  const res = await axiosClient.patch("/notification/read-all");
  return res.data;
};