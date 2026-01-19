import { useQuery } from "@tanstack/react-query";

import { getAds } from "../api/ads.api";

export const useAdsQuery = () => {
  return useQuery({
    queryKey: ["ads"],
    queryFn: getAds,
    staleTime: 1000 * 60, // optional
  });
};
