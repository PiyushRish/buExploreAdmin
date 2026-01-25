import axiosClient from "./axiosClient";

export const getHotels = async () => {
  const res = await axiosClient.get("/services/hotel"); // ← change endpoint
  return res.data;
};


export const addHotel = async (formData) => {
  const res = await axiosClient.post("/services/createHotel", formData, {
    headers: {  
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};