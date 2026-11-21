import axiosClient from "./axiosClient";

export const getRestaurants = async () => {
  const res = await axiosClient.get("/services/restaurants");
  return res.data;
};

export const addRestaurant = async (data) => {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  const res = await axiosClient.post("/services/createRestaurant", data, {
    ...(isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}),
    timeout: 60000,
  });
  return res.data;
};

export const updateRestaurant = async (restaurantId, data) => {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  const res = await axiosClient.put(`/services/restaurant/${restaurantId}`, data, {
    ...(isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}),
    timeout: 60000,
  });
  return res.data;
};

export const deleteRestaurant = async (restaurantId) => {
  const res = await axiosClient.delete(`/services/restaurant/${restaurantId}`);
  return res.data;
};