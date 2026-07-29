import axiosClient from "./axiosClient";

export const getVehicles = async () => {
  const res = await axiosClient.get("/services/vehicles");
  return res.data;
};