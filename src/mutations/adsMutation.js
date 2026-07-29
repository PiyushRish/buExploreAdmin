import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createAds,
  createCampaign,
  updateAdStatus,
  deleteAd,
  trackImpression,
  trackClick,
  updateAd,
} from "../api/ads.api.js";

export const useCreateAdMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => createAds(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
    onError: (error) => {
      console.error("[ADS] Create ad mutation failed:", error);
    },
  });
};

export const useCreateCampaignMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (campaignData) => createCampaign(campaignData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: (error) => {
      console.error("[ADS] Create campaign mutation failed:", error);
    },
  });
};

export const useUpdateAdStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ adId, status }) => updateAdStatus(adId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
    onError: (error) => {
      console.error("[ADS] Update ad status mutation failed:", error);
    },
  });
};

export const useUpdateAdMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ adId, formData }) => updateAd({ adId, formData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
    onError: (error) => {
      console.error("[ADS] Update ad mutation failed:", error);
    },
  });
};

export const useDeleteAdMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (adId) => deleteAd(adId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
    onError: (error) => {
      console.error("[ADS] Delete ad mutation failed:", error);
    },
  });
};

export const useTrackImpressionMutation = () => {
  return useMutation({
    mutationFn: (adId) => trackImpression(adId),
  });
};

export const useTrackClickMutation = () => {
  return useMutation({
    mutationFn: (adId) => trackClick(adId),
  });
};