import axiosClient from "./axiosClient";

export const getVehicles = async () => {
  const res = await axiosClient.get("/services/vehicles");
  return res.data;
};

export const addVehicle = async (data) => {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  const res = await axiosClient.post("/services/createVehicle", data, {
    ...(isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}),
    timeout: 60000,
  });
  return res.data;
};

export const updateVehicle = async (vehicleId, data) => {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  const res = await axiosClient.put(`/services/vehicle/${vehicleId}`, data, {
    ...(isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}),
    timeout: 60000,
  });
  return res.data;
};

export const deleteVehicle = async (vehicleId) => {
  const res = await axiosClient.delete(`/services/vehicle/${vehicleId}`);
  return res.data;
};