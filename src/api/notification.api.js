
import axiosClient from "./axiosClient";

export const getNotifications = async () => {
  const res = await axiosClient.get("/notification/getAllNotification"); // ← change endpoint
  return res.data;
};




export const sendNotification = async (payload) => {
  const { data } = await axiosClient.post(
    "/notification/send",
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // if you're using cookies
    }
  );
  return data;
};


export const deleteNotification = async(id) =>{
  const res = await axiosClient.delete(`/notification/${id}`)
  return res;
}