import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useAddVehicleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => formData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
};

export const useUpdateVehicleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ formData }) => formData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
};

export const useDeleteVehicleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => id,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
};