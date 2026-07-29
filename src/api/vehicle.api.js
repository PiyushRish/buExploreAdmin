import axiosClient from "./axiosClient";

export const getVehicles = async () => {
  const res = await axiosClient.get("/services/vehicles");
  return res.data;
};

export const addVehicle = async (vehicleData) => {
  const res = await axiosClient.post("/services/createVehicle", vehicleData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 60000,
  });
  return res.data;
};

export const updateVehicle = async (vehicleId, vehicleData) => {
  const res = await axiosClient.put(`/services/vehicle/${vehicleId}`, vehicleData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 60000,
  });
  return res.data;
};

export const deleteVehicle = async (vehicleId) => {
  const res = await axiosClient.delete(`/services/vehicle/${vehicleId}`);
  return res.data;
};