import { useQuery } from "@tanstack/react-query";
// import { getUsersApi } from "../api/users.api";
import { getPlaces, getPlacesByCategory, searchPlaces } from "../api/places.api.js";

export const usePlacesQuery = () => {
  return useQuery({
    queryKey: ["places"],
    queryFn: getPlaces,
    staleTime: 1000 * 60, // optional
  });
};


export const useSearchPlacesQuery = (keyword) =>{
  return useQuery({
    queryKey: ["places", keyword],   
    queryFn: () => searchPlaces(keyword), 
    enabled: !!keyword, 
  });
};
export const usePlacesByCategory = (categoryId) => {
  return useQuery({
    queryKey: ["places", "category", categoryId],

    // 👉 WRAP the function so React Query doesn't pass its internal object
    queryFn: () => getPlacesByCategory(categoryId),

    enabled: 
      categoryId !== undefined &&
      categoryId !== null &&
      categoryId !== "",

    staleTime: 1000 * 60,
    cacheTime: 1000 * 60 * 5,
  });
};
