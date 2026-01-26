import { useQuery } from "@tanstack/react-query";

import { getGuides } from "../api/guide.api.js";

export const useGuidesQuery = () => {
  return useQuery({
    queryKey: ["guides"],
    queryFn: getGuides,
    staleTime: 1000 * 60, // optional
  });
};
