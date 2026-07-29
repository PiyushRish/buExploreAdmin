import { useQuery } from "@tanstack/react-query";
import { getAds, getAdsByPlacement, getAdStats, getCampaigns } from "../api/ads.api.js";

export const useCampaignsQuery = () => {
  return useQuery({
    queryKey: ["campaigns"],
    queryFn: getCampaigns,
  });
};

export const useAdsQuery = () => {
  return useQuery({
    queryKey: ["ads"],
    queryFn: getAds,
  });
};

export const useAdsByPlacementQuery = (placement, limit = 1) => {
  return useQuery({
    queryKey: ["ads", placement, limit],
    queryFn: () => getAdsByPlacement(placement, limit),
    enabled: !!placement,
  });
};

export const useAdStatsQuery = (adId) => {
  return useQuery({
    queryKey: ["adStats", adId],
    queryFn: () => getAdStats(adId),
    enabled: !!adId,
  });
};