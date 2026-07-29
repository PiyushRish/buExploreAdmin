import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addHotel, updateHotel, deleteHotel } from "../api/hotel.api";

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
    mutationFn: ({ id, formData }) => updateHotel(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotels"] });
    },
  });
};

export const useDeleteHotelMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteHotel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotels"] });
    },
  });
};