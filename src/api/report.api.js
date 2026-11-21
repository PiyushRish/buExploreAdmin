import axiosClient from "./axiosClient.js";

export const getReports = async (params = {}) => {
  const res = await axiosClient.get("/reports/all", { params });
  return res.data;
};

export const getReportStats = async () => {
  const res = await axiosClient.get("/reports/stats");
  return res.data;
};

export const getReportById = async (id) => {
  const res = await axiosClient.get(`/reports/${id}`);
  return res.data;
};

export const takeReportAction = async (id, data) => {
  const res = await axiosClient.patch(`/reports/${id}/action`, data);
  return res.data;
};
