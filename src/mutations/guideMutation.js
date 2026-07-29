import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addGuide, updateGuide, deleteGuide } from "../api/guide.api";

export const useAddGuideMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => addGuide(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guides"] });
    },
  });
};

export const useUpdateGuideMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ guideId, formData }) => updateGuide(guideId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guides"] });
    },
  });
};

export const useDeleteGuideMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (guideId) => deleteGuide(guideId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guides"] });
    },
  });
};