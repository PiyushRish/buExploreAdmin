import React, { useState, useCallback } from "react";
import { Megaphone, Plus, X, UploadCloud, Film, ArrowLeft, Folder } from "lucide-react";
import { useAdsQuery, useCampaignsQuery } from "../queries/adsQueries.js";
import { useCreateAdMutation, useCreateCampaignMutation } from "../mutations/adsMutation.js";
import toast from "react-hot-toast";
import AdDetails from "./AdDetails.jsx";
import { RequiredNotice } from "../components/RequiredTag.jsx";
import FormField from "../components/FormField.jsx";
import { validators, runValidators, validateMediaType } from "../utils/validators.js";

const getImageUrl = (photo) => {
  if (!photo) return null;
  if (typeof photo === "string") return photo;
  return photo.url || photo.secure_url || null;
};

const PLACEMENTS = [
  "feed_native",
  "reel_native",
  "top_banner",
  "bottom_banner",
  "interstitial",
  "app_open",
  "search_result",
  "explore_grid",
  "notification_inbox",
  "profile_spotlight",
];

const Ads = () => {
  const { data: adsData, isLoading: isLoadingAds } = useAdsQuery();
  const { data: campaignsData, isLoading: isLoadingCampaigns } = useCampaignsQuery();
  
  const createAdMutation = useCreateAdMutation();
  const createCampaignMutation = useCreateCampaignMutation();

  const [activeCampaign, setActiveCampaign] = useState(null);
  const [selectedAd, setSelectedAd] = useState(null);

  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);

  // --- Campaign Form State ---
  const [campaignForm, setCampaignForm] = useState({
    name: "",
    advertiserName: "",
    notes: "",
  });
  const [campaignTouched, setCampaignTouched] = useState({});
  const [campaignFieldErrors, setCampaignFieldErrors] = useState({});

  const CAMPAIGN_RULES = {
    name: [validators.required, validators.minLength(3)],
    advertiserName: [validators.required, validators.minLength(2)],
  };

  const handleCampaignChange = (e) => {
    const { name, value } = e.target;
    setCampaignForm((prev) => ({ ...prev, [name]: value }));
    if (campaignTouched[name]) {
      const result = runValidators(value, CAMPAIGN_RULES[name] || [], name);
      setCampaignFieldErrors((prev) => ({ ...prev, [name]: result }));
    }
  };

  const handleCampaignBlur = (e) => {
    const { name, value } = e.target;
    setCampaignTouched((prev) => ({ ...prev, [name]: true }));
    const result = runValidators(value, CAMPAIGN_RULES[name] || [], name);
    setCampaignFieldErrors((prev) => ({ ...prev, [name]: result }));
  };

  const handleCampaignSubmit = () => {
    const requiredFields = ["name", "advertiserName"];
    const newTouched = {};
    const newErrors = {};
    let hasError = false;

    requiredFields.forEach((field) => {
      newTouched[field] = true;
      const result = runValidators(campaignForm[field] || "", CAMPAIGN_RULES[field] || [], field);
      newErrors[field] = result;
      if (result) hasError = true;
    });

    setCampaignTouched(newTouched);
    setCampaignFieldErrors(newErrors);

    if (hasError) {
      toast.error("Please fix errors before submitting.");
      return;
    }

    createCampaignMutation.mutate(campaignForm, {
      onSuccess: () => {
        toast.success("Campaign created!");
        setShowCampaignModal(false);
        setCampaignForm({ name: "", advertiserName: "", notes: "" });
        setCampaignTouched({});
        setCampaignFieldErrors({});
      },
      onError: (err) => toast.error(err?.response?.data?.message || "Failed to create campaign"),
    });
  };

  // --- Ad Form State ---
  const [adForm, setAdForm] = useState({
    placement: "feed_native",
    creativeFormat: "image_single",
    headline: "",
    bodyText: "",
    ctaText: "Learn More",
    linkUrl: "",
    priority: "1",
    pricePaid: "",
    maxImpressions: "",
    frequencyCap: "",
    startDate: "",
    endDate: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  const AD_RULES = {
    headline:       [validators.required, validators.maxLength(100)],
    linkUrl:        [validators.url],
    pricePaid:      [validators.number({ min: 0 })],
    maxImpressions: [validators.positiveInt],
    priority:       [validators.number({ min: 1 })],
    startDate:      [validators.required, validators.date],
    endDate:        [validators.endAfterStart(adForm.startDate)],
  };

  const [adTouched, setAdTouched] = useState({});
  const [adFieldErrors, setAdFieldErrors] = useState({});

  const handleAdChange = (e) => {
    const { name, value } = e.target;
    setAdForm((prev) => ({ ...prev, [name]: value }));
    if (adTouched[name]) {
      const rules = AD_RULES[name];
      if (rules) {
        const result = runValidators(value, rules, name);
        setAdFieldErrors((prev) => ({ ...prev, [name]: result }));
      }
    }
  };

  const handleAdBlur = (e) => {
    const { name, value } = e.target;
    setAdTouched((prev) => ({ ...prev, [name]: true }));
    const rules = AD_RULES[name];
    if (rules) {
      const result = runValidators(value, rules, name);
      setAdFieldErrors((prev) => ({ ...prev, [name]: result }));
    }
  };

  const handleAdSubmit = () => {
    const requiredFields = ["headline", "startDate"];
    const allOptional = ["linkUrl", "pricePaid", "maxImpressions", "priority", "endDate"];
    const allFields = [...requiredFields, ...allOptional];

    const newTouched = {};
    const newErrors = {};
    let hasError = false;

    allFields.forEach((field) => {
      newTouched[field] = true;
      const result = runValidators(adForm[field] || "", AD_RULES[field] || [], field);
      newErrors[field] = result;
      if (result) hasError = true;
    });

    setAdTouched(newTouched);
    setAdFieldErrors(newErrors);

    if (hasError) {
      toast.error("Please fix errors before submitting.");
      return;
    }

    const formData = new FormData();
    if (imageFile) formData.append("ImageAd", imageFile);
    if (videoFile) formData.append("VideoAd", videoFile);

    const payload = {
      campaignId: activeCampaign._id,
      placement: adForm.placement,
      status: "active",
      startDate: adForm.startDate,
      ...(adForm.endDate && { endDate: adForm.endDate }),
      ...(adForm.priority && { priority: Number(adForm.priority) }),
      ...(adForm.pricePaid && { pricePaid: Number(adForm.pricePaid) }),
      ...(adForm.maxImpressions && { maxImpressions: Number(adForm.maxImpressions) }),
      content: {
        creativeFormat: adForm.creativeFormat,
        headline: adForm.headline,
        ...(adForm.bodyText && { bodyText: adForm.bodyText }),
        ...(adForm.ctaText && { ctaText: adForm.ctaText }),
        ...(adForm.linkUrl && { linkUrl: adForm.linkUrl }),
      },
    };

    formData.append("data", JSON.stringify(payload));

    createAdMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Ad Placement created!");
        setShowAdModal(false);
        setImageFile(null);
        setVideoFile(null);
        setAdTouched({});
        setAdFieldErrors({});
        setAdForm({ placement: "feed_native", creativeFormat: "image_single", headline: "", bodyText: "", ctaText: "Learn More", linkUrl: "", priority: "1", pricePaid: "", maxImpressions: "", frequencyCap: "", startDate: "", endDate: "" });
      },
      onError: (err) => toast.error(err?.response?.data?.message || "Failed to create ad placement"),
    });
  };

  const campaigns = campaignsData?.campaigns || [];
  const allAds = adsData?.ads || [];
  
  // Filter ads for the active campaign
  const campaignAds = activeCampaign ? allAds.filter(ad => ad.campaign?._id === activeCampaign._id) : [];

  if (isLoadingCampaigns || isLoadingAds) return <div className="p-8 font-bold text-center">Loading Campaigns...</div>;
  if (selectedAd) return <AdDetails ad={selectedAd} onBack={() => setSelectedAd(null)} />;

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-3 sm:px-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-white p-4 sm:p-5 rounded-2xl border shadow-sm">
          <div className="flex items-center gap-3">
            {activeCampaign && (
              <button onClick={() => setActiveCampaign(null)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900">
                {activeCampaign ? activeCampaign.name : "Ad Campaigns"}
              </h1>
              <p className="text-xs text-gray-500">
                {activeCampaign ? `Advertiser: ${activeCampaign.advertiser?.advertiserName || 'Unknown'}` : "Manage digital promotions and advertiser folders"}
              </p>
            </div>
          </div>

          <button
            onClick={() => activeCampaign ? setShowAdModal(true) : setShowCampaignModal(true)}
            className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-purple-700 shadow-md w-full sm:w-auto justify-center transition-colors"
          >
            <Plus size={16} /> {activeCampaign ? "Create Ad Placement" : "Create Campaign"}
          </button>
        </div>

        {/* Master View: List of Campaigns */}
        {!activeCampaign && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {campaigns.length === 0 && <div className="col-span-full text-center text-gray-500 font-bold py-10">No campaigns found. Create one!</div>}
            {campaigns.map((camp) => (
              <div
                key={camp._id}
                onClick={() => setActiveCampaign(camp)}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 group"
              >
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Folder size={24} fill="currentColor" />
                </div>
                <h3 className="font-extrabold text-lg text-gray-900 line-clamp-1">{camp.name}</h3>
                <p className="font-bold text-xs text-gray-500 mt-1">Advertiser: {camp.advertiser?.advertiserName}</p>
                
                <div className="mt-4 pt-4 border-t flex justify-between items-center text-xs font-bold">
                  <span className={`px-2 py-1 rounded-md ${camp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {camp.status}
                  </span>
                  <span className="text-purple-600">Open Folder →</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail View: Ads inside Active Campaign */}
        {activeCampaign && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-8">
            {campaignAds.length === 0 && <div className="col-span-full text-center text-gray-500 font-bold py-10">No ads in this campaign yet. Create one!</div>}
            {campaignAds.map((ad) => (
              <div
                key={ad._id}
                onClick={() => setSelectedAd(ad)}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-2xl flex flex-col h-full cursor-pointer group"
              >
                <div className="relative h-48 bg-gray-900 flex items-center justify-center overflow-hidden">
                  {ad.content?.creativeFormat === "text_only" ? (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-200 flex flex-col items-center justify-center p-6 text-center">
                      <Megaphone size={32} className="text-indigo-400 mb-2 opacity-50" />
                      <p className="text-indigo-900 font-black text-sm italic line-clamp-2">"{ad.content?.headline}"</p>
                    </div>
                  ) : ad.content?.creativeFormat === "video" && getImageUrl(ad.content?.videos?.[0]) ? (
                    <video src={getImageUrl(ad.content?.videos?.[0])} autoPlay loop muted playsInline className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : getImageUrl(ad.content?.photos?.[0]) ? (
                    <img src={getImageUrl(ad.content?.photos?.[0])} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <Megaphone size={40} className="text-purple-400 opacity-50" />
                    </div>
                  )}

                  <div className="absolute top-3 left-3 bg-purple-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider shadow">
                    {ad.placement}
                  </div>
                  
                  <div className="absolute top-3 right-3 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider shadow">
                    {ad.content?.creativeFormat?.replace("_", " ")}
                  </div>

                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-lg font-bold capitalize">
                    {ad.status}
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-grow space-y-1">
                  <p className="font-extrabold text-sm text-gray-900 line-clamp-1">{ad.content?.headline}</p>
                  <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed flex-grow">{ad.content?.bodyText || "No copy provided."}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Campaign Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-bold">New Campaign Folder</h2>
              <button onClick={() => setShowCampaignModal(false)}><X size={20} /></button>
            </div>
            <RequiredNotice />
            
            <FormField label="Campaign Name" required
              error={campaignFieldErrors.name?.error} hint={campaignFieldErrors.name?.hint || "e.g. Summer Heritage 2026"}
              touched={campaignTouched.name} valid={campaignTouched.name && !campaignFieldErrors.name}>
              <input name="name" placeholder="e.g. Summer Heritage 2026"
                value={campaignForm.name} onChange={handleCampaignChange} onBlur={handleCampaignBlur}
                className="w-full p-2.5 rounded-xl text-sm" />
            </FormField>
            
            <FormField label="Advertiser Name" required
              error={campaignFieldErrors.advertiserName?.error} hint={campaignFieldErrors.advertiserName?.hint || "e.g. Jhansi Tourism Board"}
              touched={campaignTouched.advertiserName} valid={campaignTouched.advertiserName && !campaignFieldErrors.advertiserName}>
              <input name="advertiserName" placeholder="e.g. Jhansi Tourism Board"
                value={campaignForm.advertiserName} onChange={handleCampaignChange} onBlur={handleCampaignBlur}
                className="w-full p-2.5 rounded-xl text-sm" />
            </FormField>

            <button onClick={handleCampaignSubmit} disabled={createCampaignMutation.isPending} className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold shadow-md mt-4">
              {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
            </button>
          </div>
        </div>
      )}

      {/* Ad Modal */}
      {showAdModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-bold">New Ad Placement</h2>
              <button onClick={() => setShowAdModal(false)}><X size={20} /></button>
            </div>

            <RequiredNotice />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Placement Slot" required hint="Where this ad appears in the app">
                <select name="placement" value={adForm.placement} onChange={handleAdChange}
                  className="w-full p-2.5 rounded-xl text-sm bg-white font-bold">
                  {PLACEMENTS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </FormField>
              <FormField label="Creative Format" required hint="Type of media this ad uses">
                <select name="creativeFormat" value={adForm.creativeFormat} onChange={handleAdChange}
                  className="w-full p-2.5 rounded-xl text-sm bg-white font-bold">
                  <option value="image_single">Single Image</option>
                  <option value="video">Video Reel</option>
                  <option value="image_carousel">Carousel</option>
                  <option value="text_only">Text Only</option>
                </select>
              </FormField>
            </div>

            <FormField label="Headline" required
              error={adFieldErrors.headline?.error} hint={adFieldErrors.headline?.hint || "Max 100 characters · e.g. Discover the Heart of Jhansi"}
              touched={adTouched.headline} valid={adTouched.headline && !adFieldErrors.headline}>
              <input name="headline" placeholder="e.g. Discover the Heart of Jhansi"
                value={adForm.headline} onChange={handleAdChange} onBlur={handleAdBlur}
                className="w-full p-2.5 rounded-xl text-sm font-bold" />
            </FormField>

            <FormField label="Body Text" optional hint="Supporting copy shown below the headline">
              <textarea name="bodyText" placeholder="Ad copy describing your promotion..."
                value={adForm.bodyText} onChange={handleAdChange} rows={2}
                className="w-full p-2.5 rounded-xl text-sm resize-none" />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="CTA Button Label" optional hint="e.g. Learn More, Book Now, Shop">
                <input name="ctaText" placeholder="Learn More" defaultValue="Learn More"
                  onChange={handleAdChange} className="w-full p-2.5 rounded-xl text-sm" />
              </FormField>
              <FormField label="Target URL" optional
                error={adFieldErrors.linkUrl?.error} hint={adFieldErrors.linkUrl?.hint || "e.g. https://your-destination.com"}
                touched={adTouched.linkUrl} valid={adTouched.linkUrl && !adFieldErrors.linkUrl}>
                <input name="linkUrl" placeholder="https://your-destination.com"
                  value={adForm.linkUrl} onChange={handleAdChange} onBlur={handleAdBlur}
                  className="w-full p-2.5 rounded-xl text-sm text-blue-600" />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4 mt-2">
              <FormField label="Start Date" required
                error={adFieldErrors.startDate?.error} hint="Campaign goes live on this date"
                touched={adTouched.startDate} valid={adTouched.startDate && !adFieldErrors.startDate}>
                <input type="date" name="startDate" value={adForm.startDate}
                  onChange={handleAdChange} onBlur={handleAdBlur}
                  className="w-full p-2.5 rounded-xl text-sm" />
              </FormField>
              <FormField label="End Date" optional
                error={adFieldErrors.endDate?.error} hint={adFieldErrors.endDate?.hint || "Must be >= Start Date. Leave blank for unlimited run"}
                touched={adTouched.endDate} valid={adTouched.endDate && !adFieldErrors.endDate}>
                <input type="date" name="endDate" value={adForm.endDate}
                  onChange={handleAdChange} onBlur={handleAdBlur}
                  className="w-full p-2.5 rounded-xl text-sm" />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField label="Priority Weight" optional
                error={adFieldErrors.priority?.error} hint="Higher number = more often shown"
                touched={adTouched.priority} valid={adTouched.priority && !adFieldErrors.priority}>
                <input type="number" name="priority" placeholder="1" defaultValue="1"
                  onChange={handleAdChange} onBlur={handleAdBlur}
                  className="w-full p-2.5 rounded-xl text-sm font-mono" />
              </FormField>
              <FormField label="Price Paid (₹)" optional
                error={adFieldErrors.pricePaid?.error} hint="e.g. 5000"
                touched={adTouched.pricePaid} valid={adTouched.pricePaid && !adFieldErrors.pricePaid}>
                <input type="number" name="pricePaid" placeholder="e.g. 5000"
                  onChange={handleAdChange} onBlur={handleAdBlur}
                  className="w-full p-2.5 rounded-xl text-sm font-mono" />
              </FormField>
              <FormField label="Max Impressions" optional
                error={adFieldErrors.maxImpressions?.error} hint="e.g. 10000 total views"
                touched={adTouched.maxImpressions} valid={adTouched.maxImpressions && !adFieldErrors.maxImpressions}>
                <input type="number" name="maxImpressions" placeholder="e.g. 10000"
                  onChange={handleAdChange} onBlur={handleAdBlur}
                  className="w-full p-2.5 rounded-xl text-sm font-mono" />
              </FormField>
            </div>

            <div className="border border-dashed p-4 rounded-xl text-center bg-gray-50">
              <input type="file" accept="image/*" id="adImageFile" onChange={(e) => {
                const f = e.target.files[0];
                if (f) {
                  const v = validateMediaType(f, "image");
                  if (v !== true) return toast.error(v);
                  setImageFile(f);
                }
              }} className="hidden" />
              <label htmlFor="adImageFile" className="cursor-pointer text-xs font-bold text-purple-600 flex items-center justify-center gap-2">
                <UploadCloud size={18} /> {imageFile ? imageFile.name : "Upload Banner Image"}
              </label>
            </div>

            {adForm.creativeFormat === "video" && (
              <div className="border border-dashed p-4 rounded-xl text-center bg-purple-50">
                <input type="file" accept="video/*" id="adVideoFile" onChange={(e) => {
                  const f = e.target.files[0];
                  if (f) {
                    const v = validateMediaType(f, "video");
                    if (v !== true) return toast.error(v);
                    setVideoFile(f);
                  }
                }} className="hidden" />
                <label htmlFor="adVideoFile" className="cursor-pointer text-xs font-bold text-purple-600 flex items-center justify-center gap-2">
                  <Film size={18} /> {videoFile ? videoFile.name : "Upload Reel Video File *"}
                </label>
              </div>
            )}

            <button onClick={handleAdSubmit} disabled={createAdMutation.isPending} className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold shadow-md">
              {createAdMutation.isPending ? "Processing..." : "Publish Ad Placement"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ads;