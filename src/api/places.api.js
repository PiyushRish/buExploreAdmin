import axiosClient from "./axiosClient";

export const getPlaces = async () => {
  const res = await axiosClient.get("/places/getAll");
  return res.data;
};

export const searchPlaces = async (keyword) => {
  const res = await axiosClient.get(`/places/search?keyword=${keyword}`);
  return res.data;
};

export const getPlacesByCategory = async (categoryId) => {
  const res = await axiosClient.post("/places/category", {
    categoryId: categoryId,
  });
  return res.data;
};

export const deletePlace = async (placeId) => {
  const res = await axiosClient.delete(`/places/delete/${placeId}`);
  return res.data;
};

// ✅ FIXED VERSION — THIS WAS WRONG BEFORE
export const addPlace = async (formData) => {
  const res = await axiosClient.post(
    "/places/addPlace",
    formData,
    { headers: {
      "Content-Type": "multipart/form-data", // Most libraries set this automatically if you pass formData
    },timeout: 60000 }   // optional but useful for videos
  );
  return res.data;
};

export const updatePlace = async ({ id, formData }) => {
  const res = await axiosClient.patch(
    `/places/${id}`,   // ✅ ID IN URL
    formData,
    { 
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000 
    }
  );
  return res.data;
};


