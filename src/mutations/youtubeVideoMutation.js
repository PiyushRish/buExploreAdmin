import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient.js";

export const useAddYoutubeVideoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await axiosClient.post("/youtubeVideos/addVideo", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["podcasts"]);
    },
  });
};

export const useDeleteYoutubeVideoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosClient.delete(`/youtubeVideos/delete/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["podcasts"]);
    },
  });
};
