import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePlace, addPlace,updatePlace } from "../api/places.api.js";
export const useDeletePlaceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (placeId) => deletePlace(placeId),

    onSuccess: () => {
      // Refresh all relevant place queries
      queryClient.invalidateQueries({ queryKey: ["places"] });
      queryClient.invalidateQueries({ queryKey: ["places", "category"] });
      queryClient.invalidateQueries({ queryKey: ["places", "search"] });
    },

    onError: (error) => {
      console.error("Delete failed:", error);
    },
  });
};



export const useAddPlaceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => addPlace(formData),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["places"] });
      queryClient.invalidateQueries({ queryKey: ["places", "category"] });
      queryClient.invalidateQueries({ queryKey: ["places", "search"] });
    },

    onError: (error) => {
      console.error("Add place failed:", error);
    },
  });
};




export const useUpdatePlaceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => updatePlace(formData),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["places"] });
      queryClient.invalidateQueries({ queryKey: ["places", "category"] });
      queryClient.invalidateQueries({ queryKey: ["places", "search"] });
    },

    onError: (error) => {
      console.error("Add place failed:", error);
    },
  });
};


