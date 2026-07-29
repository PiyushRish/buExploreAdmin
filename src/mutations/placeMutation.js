import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addPlace,
  updatePlace,
  deletePlace,
  restorePlace,
  likePlace,
} from "../api/places.api.js";

// 1. Add Place Mutation
export const useAddPlaceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => addPlace(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["places"] });
      queryClient.invalidateQueries({ queryKey: ["reels"] });
    },
    onError: (error) => {
      console.error("[PLACES] Add place mutation failed:", error);
    },
  });
};

// 2. Update Place Mutation
export const useUpdatePlaceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => updatePlace({ id, formData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["places"] });
      queryClient.invalidateQueries({ queryKey: ["reels"] });
    },
    onError: (error) => {
      console.error("[PLACES] Update place mutation failed:", error);
    },
  });
};

// 3. Delete Place Mutation (Handles string IDs OR { id, hard } objects)
export const useDeletePlaceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (param) => deletePlace(param),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["places"] });
      queryClient.invalidateQueries({ queryKey: ["reels"] });
    },
    onError: (error) => {
      console.error("[PLACES] Delete place mutation failed:", error);
    },
  });
};

// 4. Restore Soft-Deleted Place Mutation
export const useRestorePlaceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (placeId) => restorePlace(placeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["places"] });
      queryClient.invalidateQueries({ queryKey: ["reels"] });
    },
    onError: (error) => {
      console.error("[PLACES] Restore place mutation failed:", error);
    },
  });
};

// 5. Like Place Mutation
export const useLikePlaceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (placeId) => likePlace(placeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["places"] });
    },
    onError: (error) => {
      console.error("[PLACES] Like place mutation failed:", error);
    },
  });
};