import axiosClient from "./axiosClient";

export const getRestaurants = async () => {
  const res = await axiosClient.get("/services/restaurants"); // ← change endpoint
  return res.data;
};


export const addRestaurant = async (restaurantData) => {
  const res = await axiosClient.post("/services/createRestaurant", restaurantData, {
    headers: {  
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

