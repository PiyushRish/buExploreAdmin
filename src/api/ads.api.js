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
  const res = await axiosClient.post("/advertisment/new", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 300000, // 5 minutes timeout for video processing
  });
  return res.data;
};

// 4. Create Campaign
export const createCampaign = async (campaignData) => {
  const res = await axiosClient.post("/advertisment/campaign", campaignData);
  return res.data;
};

// 5. Get Campaigns
export const getCampaigns = async () => {
  const res = await axiosClient.get("/advertisment/campaign");
  return res.data;
};

// 6. Pause / Update Ad Status ('active', 'paused', 'draft', 'ended')
export const updateAdStatus = async (adId, status) => {
  const res = await axiosClient.put(`/advertisment/status/${adId}`, { status });
  return res.data;
};

// 6.5 Full Ad Update (FormData)
export const updateAd = async ({ adId, formData }) => {
  const res = await axiosClient.put(`/advertisment/${adId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 300000,
  });
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