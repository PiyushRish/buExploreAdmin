import { useMutation ,useQueryClient} from "@tanstack/react-query";
// import { sendNotification } from "../api/notificationApi";
import { deleteNotification, sendNotification } from "../api/notification.api";

export const useSendNotification = () => {
        const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => sendNotification(payload),
    onSuccess: () => {
      // Invalidate the "ads" query so the list refreshes automatically
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useDeleteNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn:(id) => deleteNotification(id),
         onSuccess: () => {
      // Invalidate the "ads" query so the list refreshes automatically
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    })
};