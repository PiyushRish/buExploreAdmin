import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addPodcast, deletePodcast } from "../api/podcast.api.js";

export const useAddPodcastMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => addPodcast(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcasts"] });
    },
  });
};

export const useDeletePodcastMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deletePodcast(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcasts"] });
    },
  });
};
