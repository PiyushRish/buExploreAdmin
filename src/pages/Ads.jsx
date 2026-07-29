import React, { useState } from "react";
import { Megaphone, Plus, X, UploadCloud, Film, Image as ImageIcon, ExternalLink, Play, Pause, Trash2, Eye, MousePointer } from "lucide-react";
import { useAdsQuery } from "../queries/adsQueries";
import { useCreateAdMutation } from "../mutations/adsMutation";
import toast from "react-hot-toast";

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

const Ads = ({ setSelectedAd }) => {
  const { data, isLoading } = useAdsQuery();
  const createAdMutation = useCreateAdMutation();

  const [showModal, setShowModal] = useState(false);
  const [adForm, setAdForm] = useState({
    advertiserName: "",
    name: "",
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
  });

  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  const handleChange = (e) => setAdForm({ ...adForm, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    if (!adForm.name || !adForm.advertiserName || !adForm.headline) {
      toast.error("Campaign name, advertiser name, and headline are required.");
      return;
    }

    const formData = new FormData();
    if (imageFile) formData.append("ImageAd", imageFile);
    if (videoFile) formData.append("VideoAd", videoFile);

    formData.append("advertiserName", adForm.advertiserName);
    formData.append("name", adForm.name);
    formData.append("placement", adForm.placement);
    formData.append("priority", adForm.priority);
    if (adForm.pricePaid) formData.append("pricePaid", adForm.pricePaid);
    if (adForm.maxImpressions) formData.append("maxImpressions", adForm.maxImpressions);
    if (adForm.frequencyCap) formData.append("frequencyCap", adForm.frequencyCap);

    formData.append("content[creativeFormat]", adForm.creativeFormat);
    formData.append("content[headline]", adForm.headline);
    formData.append("content[bodyText]", adForm.bodyText);
    formData.append("content[ctaText]", adForm.ctaText);
    formData.append("content[linkUrl]", adForm.linkUrl);

    createAdMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Ad campaign created!");
        setShowModal(false);
        setImageFile(null);
        setVideoFile(null);
      },
      onError: (err) => toast.error(err?.response?.data?.message || "Failed to create ad campaign"),
    });
  };

  const ads = data?.ads || [];

  if (isLoading) return <div className="p-8 font-bold text-center">Loading Ad Campaigns...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-5 rounded-2xl border shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Ad Campaigns & Placements</h1>
            <p className="text-xs text-gray-500">Manage digital promotions, placements, rotation weights, and revenue caps</p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-purple-700 shadow-md"
          >
            <Plus size={16} /> Create Campaign
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ads.map((ad) => (
            <div
              key={ad._id}
              onClick={() => setSelectedAd(ad)}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-2xl flex flex-col h-full cursor-pointer group"
            >
              <div className="relative h-56 bg-gray-900 flex items-center justify-center overflow-hidden">
                {getImageUrl(ad.content?.photos?.[0]) ? (
                  <img src={getImageUrl(ad.content?.photos?.[0])} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <Megaphone size={40} className="text-purple-400 opacity-50" />
                )}

                <div className="absolute top-3 left-3 bg-purple-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider shadow">
                  {ad.placement}
                </div>

                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-lg font-bold capitalize">
                  {ad.status}
                </div>
              </div>

              <div className="p-5 flex flex-col flex-grow space-y-2">
                <h3 className="font-extrabold text-lg text-gray-900 line-clamp-1">{ad.name}</h3>
                <p className="font-bold text-xs text-purple-600 line-clamp-1">{ad.content?.headline}</p>
                <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed flex-grow">{ad.content?.bodyText || "No copy provided."}</p>

                <div className="pt-3 mt-3 border-t flex justify-between items-center text-[10px] font-bold text-gray-400">
                  <span>Advertiser: {ad.advertiser?.advertiserName || "In-House"}</span>
                  <span className="text-purple-600">View All Analytics →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-bold">New Ad Campaign</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input name="name" placeholder="Campaign Name *" onChange={handleChange} className="border p-2.5 rounded-xl text-sm" />
              <input name="advertiserName" placeholder="Advertiser Name *" onChange={handleChange} className="border p-2.5 rounded-xl text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select name="placement" value={adForm.placement} onChange={handleChange} className="border p-2.5 rounded-xl text-sm bg-white font-bold">
                {PLACEMENTS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>

              <select name="creativeFormat" value={adForm.creativeFormat} onChange={handleChange} className="border p-2.5 rounded-xl text-sm bg-white font-bold">
                <option value="image_single">Single Image</option>
                <option value="video">Video Reel</option>
                <option value="image_carousel">Carousel</option>
                <option value="text_only">Text Only</option>
              </select>
            </div>

            <input name="headline" placeholder="Headline *" onChange={handleChange} className="w-full border p-2.5 rounded-xl text-sm font-bold" />
            <textarea name="bodyText" placeholder="Ad Copy / Body..." onChange={handleChange} rows={2} className="w-full border p-2.5 rounded-xl text-sm resize-none" />

            <div className="grid grid-cols-2 gap-4">
              <input name="ctaText" placeholder="CTA Label (e.g. Learn More)" defaultValue="Learn More" onChange={handleChange} className="border p-2.5 rounded-xl text-sm" />
              <input name="linkUrl" placeholder="Target Link (https://...)" onChange={handleChange} className="border p-2.5 rounded-xl text-sm text-blue-600" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <input type="number" name="priority" placeholder="Priority Weight (e.g. 1)" defaultValue="1" onChange={handleChange} className="border p-2.5 rounded-xl text-sm font-mono" />
              <input type="number" name="pricePaid" placeholder="Price Paid (₹)" onChange={handleChange} className="border p-2.5 rounded-xl text-sm font-mono" />
              <input type="number" name="maxImpressions" placeholder="Max Impression Cap" onChange={handleChange} className="border p-2.5 rounded-xl text-sm font-mono" />
            </div>

            <div className="border border-dashed p-4 rounded-xl text-center bg-gray-50">
              <input type="file" accept="image/*" id="adImageFile" onChange={(e) => setImageFile(e.target.files[0])} className="hidden" />
              <label htmlFor="adImageFile" className="cursor-pointer text-xs font-bold text-purple-600 flex items-center justify-center gap-2">
                <UploadCloud size={18} /> {imageFile ? imageFile.name : "Upload Banner Image"}
              </label>
            </div>

            {adForm.creativeFormat === "video" && (
              <div className="border border-dashed p-4 rounded-xl text-center bg-purple-50">
                <input type="file" accept="video/*" id="adVideoFile" onChange={(e) => setVideoFile(e.target.files[0])} className="hidden" />
                <label htmlFor="adVideoFile" className="cursor-pointer text-xs font-bold text-purple-600 flex items-center justify-center gap-2">
                  <Film size={18} /> {videoFile ? videoFile.name : "Upload Reel Video File *"}
                </label>
              </div>
            )}

            <button onClick={handleSubmit} disabled={createAdMutation.isPending} className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold shadow-md">
              {createAdMutation.isPending ? "Processing Campaign..." : "Publish Campaign"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ads;