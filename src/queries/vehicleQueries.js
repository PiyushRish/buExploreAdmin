import { useQuery } from "@tanstack/react-query";

import { getVehicles } from "../api/vehicle.api.js"

export const useVehiclesQuery = () => {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: getVehicles,
    staleTime: 1000 * 60, // optional
  });
};
