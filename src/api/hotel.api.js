import axiosClient from "./axiosClient";

export const getHotels = async () => {
  const res = await axiosClient.get("/services/hotel");
  return res.data;
};

export const addHotel = async (data) => {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  const res = await axiosClient.post("/services/createHotel", data, {
    ...(isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}),
    timeout: 60000,
  });
  return res.data;
};

export const updateHotel = async (hotelId, data) => {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  const res = await axiosClient.put(`/services/hotel/${hotelId}`, data, {
    ...(isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}),
    timeout: 60000,
  });
  return res.data;
};

export const deleteHotel = async (hotelId) => {
  const res = await axiosClient.delete(`/services/hotel/${hotelId}`);
  return res.data;
};