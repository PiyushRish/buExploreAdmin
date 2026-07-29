import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendNotification, deleteNotification } from "../api/notification.api";

export const useSendNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => sendNotification(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      console.error("Send notification failed:", error);
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      console.error("Delete notification failed:", error);
    },
  });
};