import { useQuery } from "@tanstack/react-query";
import { getEmergencyServices, getEmergencyServiceById } from "../api/emergency.api.js";

export const useEmergencyServicesQuery = (params = {}) => {
  return useQuery({
    queryKey: ["emergencies", params],
    queryFn: () => getEmergencyServices(params),
    staleTime: 1000 * 60,
  });
};

export const useEmergencyDetailsQuery = (id) => {
  return useQuery({
    queryKey: ["emergency", id],
    queryFn: () => getEmergencyServiceById(id),
    enabled: !!id,
    staleTime: 1000 * 60,
  });
};
