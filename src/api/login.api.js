import axiosClient from "./axiosClient";

// Authenticates Admin / User via email/phone + password
export const login = async (credentials) => {
  const res = await axiosClient.post("/auth/login", credentials);
  return res.data;
};