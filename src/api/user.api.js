import axiosClient from "./axiosClient";

export const getUsers = async (params = {}) => {
  const res = await axiosClient.get("/users/getAllUsers", { params });
  return res.data;
};

export const softDeleteUser = async (id) => {
  const res = await axiosClient.delete(`/users/delete/${id}`);
  return res.data;
};

export const restoreUser = async (id) => {
  const res = await axiosClient.patch(`/users/restore/${id}`);
  return res.data;
};
