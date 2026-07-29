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