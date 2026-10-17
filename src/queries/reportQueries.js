import { useQuery } from "@tanstack/react-query";
import { getReports, getReportStats, getReportById } from "../api/report.api.js";

export const useReportsQuery = (params = {}) => {
  return useQuery({
    queryKey: ["reports", params],
    queryFn: () => getReports(params),
    staleTime: 1000 * 30,
  });
};

export const useReportStatsQuery = () => {
  return useQuery({
    queryKey: ["reportStats"],
    queryFn: getReportStats,
    staleTime: 1000 * 60,
  });
};

export const useReportDetailsQuery = (id) => {
  return useQuery({
    queryKey: ["report", id],
    queryFn: () => getReportById(id),
    enabled: !!id,
  });
};
