import { useQuery } from "@tanstack/react-query";
import { getUsers, getUserStats } from "../api/user.api";

export const useUsersQuery = (params) => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => getUsers(params),
  });
};

export const useUserStatsQuery = () => {
  return useQuery({
    queryKey: ["userStats"],
    queryFn: getUserStats,
    refetchInterval: 8000,
  });
};
