import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addVehicle, updateVehicle, deleteVehicle } from "../api/vehicle.api";

export const useAddVehicleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => addVehicle(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
};

export const useUpdateVehicleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => updateVehicle(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
};

export const useDeleteVehicleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
};