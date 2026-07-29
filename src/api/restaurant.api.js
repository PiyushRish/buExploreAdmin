import axiosClient from "./axiosClient";

export const getRestaurants = async () => {
  const res = await axiosClient.get("/services/restaurants");
  return res.data;
};

export const addRestaurant = async (restaurantData) => {
  const res = await axiosClient.post("/services/createRestaurant", restaurantData, {
    headers: {  
      "Content-Type": "multipart/form-data",
    },
    timeout: 60000,
  });
  return res.data;
};

export const updateRestaurant = async (restaurantId, restaurantData) => {
  const res = await axiosClient.put(`/services/restaurant/${restaurantId}`, restaurantData, {
    headers: {  
      "Content-Type": "multipart/form-data",
    },
    timeout: 60000,
  });
  return res.data;
};

export const deleteRestaurant = async (restaurantId) => {
  const res = await axiosClient.delete(`/services/restaurant/${restaurantId}`);
  return res.data;
};