import axiosClient from "./axiosClient";

// 1. Fetch All Ads (Admin Dashboard View)
export const getAds = async () => {
  const res = await axiosClient.get("/advertisment/all");
  return res.data;
};

// 2. Fetch Active Ads by Placement Slot (e.g. 'reel_native', 'top_banner')
export const getAdsByPlacement = async (placement, limit = 1) => {
  const res = await axiosClient.get(`/advertisment/placement/${placement}`, {
    params: { limit },
  });
  return res.data;
};

// 3. Bundled Advertiser + Ad Campaign Creation (FormData)
export const createAds = async (formData) => {
  const res = await axiosClient.post("/advertisment/bundled", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 300000, // 5 minutes timeout for video processing
  });
  return res.data;
};

// 4. Create Standalone Ad
export const createSingleAd = async (adData) => {
  const res = await axiosClient.post("/advertisment", adData);
  return res.data;
};

// 5. Create Standalone Advertiser Profile
export const createAdvertiser = async (advertiserData) => {
  const res = await axiosClient.post("/advertisment/advertiser", advertiserData);
  return res.data;
};

// 6. Pause / Update Ad Status ('active', 'paused', 'draft', 'ended')
export const updateAdStatus = async (adId, status) => {
  const res = await axiosClient.patch(`/advertisment/status/${adId}`, { status });
  return res.data;
};

// 7. Hard Delete Ad Campaign & Analytics
export const deleteAd = async (adId) => {
  const res = await axiosClient.delete(`/advertisment/${adId}`);
  return res.data;
};

// 8. Impression & Click Analytics
export const trackImpression = async (adId) => {
  const res = await axiosClient.post(`/advertisment/stats/impression/${adId}`);
  return res.data;
};

export const trackClick = async (adId) => {
  const res = await axiosClient.post(`/advertisment/stats/click/${adId}`);
  return res.data;
};

export const getAdStats = async (adId) => {
  const res = await axiosClient.get(`/advertisment/stats/${adId}`);
  return res.data;
};