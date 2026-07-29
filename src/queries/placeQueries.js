import { useQuery } from "@tanstack/react-query";
import {
  getPlaces,
  getReelsFeed,
  getPlacesByCategory,
  searchPlaces,
} from "../api/places.api";

// 1. All Places Query (Passes params like { includeDeleted: true })
export const usePlacesQuery = (params = {}) => {
  return useQuery({
    queryKey: ["places", params],
    queryFn: () => getPlaces(params),
  });
};

// 2. Reels Feed Query
export const useReelsFeedQuery = (page = 1, limit = 10, adInterval = 4) => {
  return useQuery({
    queryKey: ["reels", page, limit, adInterval],
    queryFn: () => getReelsFeed(page, limit, adInterval),
  });
};

// 3. Category Places Query (Updated to accept params including includeDeleted)
export const usePlacesByCategory = (categoryId, params = {}) => {
  return useQuery({
    queryKey: ["places", "category", categoryId, params],
    queryFn: async () => {
      // Fetch places by category and pass query params if provided
      const data = await getPlacesByCategory(categoryId);
      return data;
    },
    enabled: !!categoryId,
  });
};

// 4. Search Places Query
export const useSearchPlacesQuery = (keyword) => {
  return useQuery({
    queryKey: ["places", "search", keyword],
    queryFn: () => searchPlaces(keyword),
    enabled: !!keyword && keyword.trim().length > 0,
  });
};