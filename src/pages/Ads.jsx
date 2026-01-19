import React, { useState, useContext } from "react";
import { Heart, Share2, Megaphone, Calendar, Clock } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import { PlaceContext } from "../contextApi/places.jsx";
import { useAdsQuery } from "../queries/adsQueries.js"; // change if your hook name is different

/* -------------------------------------------------- */
/*                 AD CARD COMPONENT                 */
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
    ended: "bg-red-100 text-red-700",
  };

  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl 
      transition-all duration-300 transform hover:-translate-y-1 
      border border-gray-100 flex flex-col h-full cursor-pointer"
      onClick={() => setClickedPlaceHandler(ad)}
    >
      {/* IMAGE OR PLACEHOLDER */}
      <div className="relative h-56 bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
        {ad.content?.imageUrl ? (
          <img
            src={ad.content.imageUrl}
            alt={ad.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <h2 className="text-4xl font-extrabold text-white tracking-wider">
            AD
          </h2>
        )}

        <div className="absolute top-3 right-3">
          <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors text-gray-700">
            <Share2 size={18} />
          </button>
        </div>

        {/* Status badge */}
        <div className="absolute bottom-3 left-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              statusColor[ad.status] || "bg-gray-100 text-gray-700"
            }`}
          >
            {ad.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-xl text-gray-800 line-clamp-1">
          {ad.name}
        </h3>

        <div className="flex items-center text-sm text-gray-600 mt-1">
          <Megaphone size={14} className="mr-1 text-purple-500" />
          {ad.content?.type || "ad"}
        </div>

        {ad.content?.headline && (
          <p className="font-semibold text-gray-800 mt-2">
            {ad.content.headline}
          </p>
        )}

        <p className="text-gray-600 text-sm mt-2 mb-4 line-clamp-2 flex-grow">
          {ad.content?.bodyText || "No description available."}
        </p>

        {/* Dates Row */}
        <div className="flex justify-between items-center mb-3 text-sm text-gray-700">
          <span className="flex items-center">
            <Calendar size={14} className="mr-1" />
            {new Date(ad.startDate).toLocaleDateString()}
          </span>

          {ad.endDate && (
            <span className="flex items-center">
              <Clock size={14} className="mr-1" />
              {new Date(ad.endDate).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* CTA */}
        {ad.content?.ctaText && (
          <div className="mb-3">
            <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs">
              {ad.content.ctaText}
            </span>
          </div>
        )}

        {/* FOOTER */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
          <span className="font-semibold text-sm text-gray-500">
            {ad.content?.type || "Advertisement"}
          </span>

          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-full transition-colors ${
              isLiked
                ? "bg-red-50 text-red-500"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Heart
              size={18}
              className={`transition-all duration-300 ${
                isLiked ? "fill-red-500 scale-110" : ""
              }`}
            />
            <span className="text-sm font-medium">{likeCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------- */
/*                 MAIN ADS GRID                     */
/* -------------------------------------------------- */

const Ads = () => {
  const { data, isLoading, isError } = useAdsQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading ads...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Failed to load ads. Please try again later.
      </div>
    );
  }

  const ads = data?.ads || [];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Navbar />

      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Advertisements
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Manage active, scheduled, and draft ad campaigns.
          </p>
        </div>

        {ads.length === 0 ? (
          <div className="text-center text-gray-500">
            No ads found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ads.map((ad) => (
              <AdCard key={ad._id} ad={ad} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  return <Ads />;
}
