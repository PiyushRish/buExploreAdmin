import { useQuery } from "@tanstack/react-query";
// import { getUsersApi } from "../api/users.api";
// import { getHotels } from "../api/hotel.
// js";
import { getNotifications } from "../api/notification.api";
export const useNotificationsQuery = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    staleTime: 1000 * 60, // optional
  });
};
