import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addHotel } from "../api/hotel.api";

export const useAddHotelMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => addHotel(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotels"] });
    },
  });
};

export const useUpdateHotelMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ formData }) => formData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotels"] });
    },
  });
};

export const useDeleteHotelMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => id,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotels"] });
    },
  });
};