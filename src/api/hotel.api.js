import axiosClient from "./axiosClient";

export const getHotels = async () => {
  const res = await axiosClient.get("/services/hotel");
  return res.data;
};

export const addHotel = async (formData) => {
  const res = await axiosClient.post("/services/createHotel", formData, {
    headers: {  
      "Content-Type": "multipart/form-data",
    },
    timeout: 60000,
  });
  return res.data;
};

export const updateHotel = async (hotelId, formData) => {
  const res = await axiosClient.put(`/services/hotel/${hotelId}`, formData, {
    headers: {  
      "Content-Type": "multipart/form-data",
    },
    timeout: 60000,
  });
  return res.data;
};

export const deleteHotel = async (hotelId) => {
  const res = await axiosClient.delete(`/services/hotel/${hotelId}`);
  return res.data;
};