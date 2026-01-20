import axiosClient from "./axiosClient";

export const getAds = async () => {
  const res = await axiosClient.get("/advertisment/all"); // ← change endpoint
  return res.data;
};


export const createAds = async (formData) => {
  // CORRECT: Pass URL, Data, and Config as 3 arguments
  const res = await axiosClient.post(
    "/advertisment/create-campaign", // 1. URL
    formData,                         // 2. Body (FormData)
    {                                 // 3. Config (Headers/Timeout)
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000, 
    }
  );
  
  return res.data;
};