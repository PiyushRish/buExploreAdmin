import { useQuery } from "@tanstack/react-query";
// import { getUsersApi } from "../api/users.api";
import { getRestaurants } from "../api/restaurant.api.js";

export const useRestaurantsQuery = () => {
  return useQuery({
    queryKey: ["restaurants"],
    queryFn: getRestaurants,
    staleTime: 1000 * 60, // optional
  });
};
