import { useQuery } from "@tanstack/react-query";
// import { getUsersApi } from "../api/users.api";
import { getPlaces } from "../api/places.api.js";

export const usePlacesQuery = () => {
  return useQuery({
    queryKey: ["places"],
    queryFn: getPlaces,
    staleTime: 1000 * 60, // optional
  });
};
