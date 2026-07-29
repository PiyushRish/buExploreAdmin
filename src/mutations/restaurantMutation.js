import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addRestaurant, updateRestaurant, deleteRestaurant } from "../api/restaurant.api";

export const useAddRestaurantMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => addRestaurant(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
  });
};

export const useUpdateRestaurantMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => updateRestaurant(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
  });
};

export const useDeleteRestaurantMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteRestaurant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
  });
};