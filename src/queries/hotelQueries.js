import { useQuery } from "@tanstack/react-query";
// import { getUsersApi } from "../api/users.api";
import { getHotels } from "../api/hotel.api.js";

export const useHotelsQuery = () => {
  return useQuery({
    queryKey: ["hotels"],
    queryFn: getHotels,
    staleTime: 1000 * 60, // optional
  });
};
