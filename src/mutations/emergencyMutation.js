import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createEmergencyService,
  updateEmergencyService,
  deleteEmergencyService,
} from "../api/emergency.api.js";

export const useCreateEmergencyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => createEmergencyService(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergencies"] });
    },
  });
};

export const useUpdateEmergencyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => updateEmergencyService(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergencies"] });
      queryClient.invalidateQueries({ queryKey: ["emergency"] });
    },
  });
};

export const useDeleteEmergencyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteEmergencyService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergencies"] });
    },
  });
};
