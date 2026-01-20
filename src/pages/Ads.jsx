import React, { useState, useContext, useEffect } from "react";
import {
  Heart,
  Share2,
  Megaphone,
  Calendar,
  Clock,
  Plus,
  X,
  UploadCloud,
} from "lucide-react";
import { PlaceContext } from "../contextApi/places.jsx";
import { useAdsQuery } from "../queries/adsQueries.js";
import AdDetails from "./AdDetails.jsx";
import { useCreateAdMutation } from "../mutations/adsMutation.js";

/* -------------------------------------------------- */
/* AD CARD COMPONENT                 */
/* -------------------------------------------------- */
const AdCard = ({ ad }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const { setClickedPlaceHandler } = useContext(PlaceContext);

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked((prev) => !prev);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const statusColor = {
    active: "bg-green-100 text-green-700",
    paused: "bg-yellow-100 text-yellow-700",
    draft: "bg-gray-100 text-gray-700",
    scheduled: "bg-blue-100 text-blue-700",
  };

  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl 
      transition-all duration-300 transform hover:-translate-y-1 
      border border-gray-100 flex flex-col h-full cursor-pointer"
      onClick={() => setClickedPlaceHandler(ad)}
    >
      {/* IMAGE SECTION */}
      <div className="relative h-56 bg-gray-200 flex items-center justify-center overflow-hidden">
        {ad.content?.imageUrl ? (
          <img
            src={ad.content.imageUrl}
            alt={ad.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.target.src = "https://picsum.photos/800/600";
            }}
          />
        ) : (
          <div className="text-center text-gray-400 px-4">
            <Megaphone size={40} className="mx-auto mb-2 opacity-50" />
            <span className="text-sm font-semibold">No Image</span>
          </div>
        )}

        <div className="absolute top-3 right-3">
          <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors text-gray-700 shadow-sm">
            <Share2 size={18} />
          </button>
        </div>

        <div className="absolute bottom-3 left-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
              statusColor[ad.status] || "bg-gray-100 text-gray-700"
            }`}
          >
            {ad.status}
          </span>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-xl text-gray-900 line-clamp-1 mb-1">
          {ad.name}
        </h3>

        <div className="flex items-center text-xs font-medium text-purple-600 bg-purple-50 w-fit px-2 py-1 rounded mb-3">
          <Megaphone size={12} className="mr-1" />
          {(ad.content?.type || "ad")
            .replace(/_/g, " ")
            .toUpperCase()}
        </div>

        {ad.content?.headline && (
          <p className="font-bold text-gray-800 text-sm mb-2 line-clamp-1">
            {ad.content.headline}
          </p>
        )}

        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow leading-relaxed">
          {ad.content?.bodyText || "No description provided."}
        </p>

        {/* Dates */}
        <div className="flex justify-between items-center mb-4 text-xs text-gray-500 font-medium">
          <div className="flex items-center bg-gray-50 px-2 py-1 rounded border border-gray-100">
            <Calendar size={12} className="mr-1.5" />
            {ad.startDate
              ? new Date(ad.startDate).toLocaleDateString()
              : "No start date"}
          </div>

          {ad.endDate && (
            <div className="flex items-center bg-gray-50 px-2 py-1 rounded border border-gray-100">
              <Clock size={12} className="mr-1.5" />
              {new Date(ad.endDate).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
          {ad.content?.ctaText ? (
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
              {ad.content.ctaText}
            </span>
          ) : (
            <span></span>
          )}

          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-full transition-colors ${
              isLiked
                ? "bg-red-50 text-red-500"
                : "bg-gray-50 text-gray-400 hover:bg-gray-100"
            }`}
          >
            <Heart size={16} className={isLiked ? "fill-current" : ""} />
            <span className="text-xs font-bold">{likeCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------- */
/* MAIN ADS GRID                     */
/* -------------------------------------------------- */

const Ads = () => {
  const { data, isLoading, isError } = useAdsQuery();
  const { clickedPlace } = useContext(PlaceContext);
  const [showModal, setShowModal] = useState(false);
  const[showVideoUpload,setShowVideoUpload] = useState(false);
  const { mutate: createAd, isPending} = useCreateAdMutation();

  // {if(adForm.type === "video_ad"){
  //   ()=>{
  //     setShow
  //   };

  // }}

  const [adForm, setAdForm] = useState({
    advertiserName: "",
    name: "",
    notes: "",
    status: "draft",
    startDate: "",
    endDate: "",
    type: "banner",
    headline: "",
    bodyText: "",
    linkUrl: "",
    ctaText: "Learn More",
  });

  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  const handleVideoChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    const formData = new FormData();

    // 2. APPEND FILES
    // Important: Backend expects "photos" and "videos" (plural), 
    // even if you are sending just one file.
    if (imageFile) {
      formData.append("photos", imageFile); 
    }

    if (videoFile) {
      formData.append("videos", videoFile);
    }

    // 3. APPEND DATA
    const payload = {
      advertiserName: adForm.advertiserName,
      name: adForm.name,
      notes: adForm.notes,
      status: adForm.status,
      startDate: adForm.startDate,
      endDate: adForm.endDate,
      content: {
        type: adForm.type,
        headline: adForm.headline,
        bodyText: adForm.bodyText,
        linkUrl: adForm.linkUrl,
        ctaText: adForm.ctaText,
      },
    };

    formData.append("data", JSON.stringify(payload));

    console.log("Submitting...", payload);

    // 4. TRIGGER THE MUTATION
    createAd(formData, {
      onSuccess: (data) => {
        console.log("Success:", data);
        setShowModal(false);
        
        // Reset Form
        setAdForm({
          advertiserName: "",
          name: "",
          notes: "",
          status: "draft",
          startDate: "",
          endDate: "",
          type: "banner",
          headline: "",
          bodyText: "",
          linkUrl: "",
          ctaText: "Learn More",
        });
        setImageFile(null);
        setVideoFile(null);
        
        // Optional: Show alert
        // alert("Campaign created successfully!");
      },
      onError: (error) => {
        console.error("Submission failed:", error);
        alert(error.response?.data?.message || "Failed to create campaign.");
      }
    });
  };
useEffect(() => {
  if (adForm.type === "video_ad") {
    setShowVideoUpload(true);
  } else {
    setShowVideoUpload(false);
    setVideoFile(null); // clear video if user switches away
  }
}, [adForm.type]);


  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading ads...
      </div>
    );

  if (isError)
    return (
      <div className="text-red-500 text-center mt-10">
        Error loading ads.
      </div>
    );

  if (clickedPlace) {
    return <AdDetails />;
  }

  const ads = data?.ads ?? [];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative font-sans">
      <div className="max-w-7xl mx-auto mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
          Ad Campaigns
        </h1>
        <p className="text-gray-500">
          Manage your digital presence across all platforms
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        {ads.length === 0 ? (
          <div className="text-center text-gray-500 py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
            <Megaphone className="mx-auto text-gray-300 mb-4" size={48} />
            <p>No campaigns found. Create your first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ads.map((ad) => (
              <AdCard key={ad._id} ad={ad} />
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 hover:scale-105 transition-all z-40"
      >
        <Plus size={28} />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-800">
                New Campaign
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Campaign Name
                  </label>
                  <input
                    name="name"
                    value={adForm.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded-lg"
                    placeholder="e.g. Summer Sale"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Advertiser Name
                  </label>
                  <input
                    name="advertiserName"
                    value={adForm.advertiserName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded-lg"
                    placeholder="e.g. Nike Inc."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Notes
                  </label>
                  <input
                    name="notes"
                    value={adForm.notes}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded-lg"
                    placeholder="Notes (Advertiser Information)."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Ad Type
                  </label>
                  <select
                    name="type"
                    value={adForm.type}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-lg capitalize"
                  >
                    {[
                      "banner",
                      "splash_screen",
                      "text_ad",
                      "image_card",
                      "video_ad",
                    ].map((type) => (
                      <option key={type} value={type}>
                        {type.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={adForm.startDate}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={adForm.endDate}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={adForm.status}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-lg capitalize"
                  >
                    {["draft", "active", "paused", "scheduled"].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <hr className="border-gray-100 my-2" />

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Headline
                </label>
                <input
                  name="headline"
                  value={adForm.headline}
                  onChange={handleChange}
                  className="w-full border p-2 rounded-lg font-bold"
                  placeholder="Catchy Title"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Body Text
                </label>
                <textarea
                  name="bodyText"
                  rows={3}
                  value={adForm.bodyText}
                  onChange={handleChange}
                  className="w-full border p-2 rounded-lg resize-none"
                  placeholder="Main ad copy..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    CTA Text
                  </label>
                  <input
                    name="ctaText"
                    value={adForm.ctaText}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Destination URL
                  </label>
                  <input
                    name="linkUrl"
                    value={adForm.linkUrl}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-lg"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 text-center">
                <input
                  type="file"
                  id="adImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="adImage"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <UploadCloud
                    className="text-blue-500 mb-2"
                    size={32}
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    {imageFile
                      ? imageFile.name
                      : "Click to upload Banner Image"}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    Supports JPG, PNG
                  </span>
                </label>
              </div>

              {showVideoUpload && <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 text-center mt-4">
                <input
                  type="file"
                  id="adVideo"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="hidden"
                />
                <label
                  htmlFor="adVideo"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <UploadCloud
                    className="text-purple-500 mb-2"
                    size={32}
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    {videoFile
                      ? videoFile.name
                      : "Click to upload Video Ad"}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    Supports MP4, MOV
                  </span>
                </label>
              </div>}

              <button
                onClick={handleSubmit}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all transform active:scale-95"
              >
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return <Ads />;
}
