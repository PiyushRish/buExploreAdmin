import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../api/user.api";

export const useUsersQuery = (params) => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => getUsers(params),
  });
};
