import React, { useState, useContext } from "react";
import { Heart, MapPin, Share2, Star } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import { PlaceContext } from "../contextApi/places.jsx";
import HotelDetails from "./HotelDetails.jsx";
import { useHotelsQuery } from "../queries/hotelQueries.js"; // <-- your hotel API hook

/* -------------------------------------------------- */
/*              HOTEL CARD COMPONENT                 */
/* -------------------------------------------------- */

const HotelCard = ({ hotel }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const { setClickedPlaceHandler } = useContext(PlaceContext);

  const handleLike = (e) => {
    e.stopPropagation(); // prevents card click
    setIsLiked((prev) => !prev);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl 
      transition-all duration-300 transform hover:-translate-y-1 
      border border-gray-100 flex flex-col h-full cursor-pointer"
      onClick={() => setClickedPlaceHandler(hotel)}
    >
      {/* IMAGE REPLACED WITH HOTEL TEXT */}
      <div className="relative h-56 bg-gray-900 flex items-center justify-center">
        <h2 className="text-4xl font-extrabold text-white tracking-wider">
          HOTEL
        </h2>

        <div className="absolute top-3 right-3">
          <button
            className="p-2 bg-white/80 backdrop-blur-sm rounded-full 
            hover:bg-white transition-colors text-gray-700"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-xl text-gray-800 line-clamp-1">
          {hotel?.title}
        </h3>

        <div className="flex items-center text-gray-500 text-sm mt-1">
          <MapPin size={14} className="mr-1" />
          {hotel?.location || "Location not available"}
        </div>

        <p className="text-gray-600 text-sm mt-3 mb-4 line-clamp-2 flex-grow">
          {hotel?.description || "No description available."}
        </p>

        {/* Hotel Info Row */}
        <div className="flex justify-between items-center mb-3 text-sm">
          <span className="flex items-center font-semibold text-gray-700">
            <Star size={16} className="text-yellow-400 mr-1" />
            {hotel?.rating}
          </span>

          <span className="font-semibold text-gray-700">
            {hotel?.priceRange}
          </span>
        </div>

        {/* FOOTER */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
          <span className="font-semibold text-sm text-gray-500">
            {hotel?.subCategory || "Hotel"}
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
/*                MAIN HOTELS GRID                   */
/* -------------------------------------------------- */

const Hotels = () => {
  const { data, isLoading, isError } = useHotelsQuery();
  const { clickedPlace, setClickedPlaceHandler } = useContext(PlaceContext);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading hotels...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Failed to load hotels. Please try again later.
      </div>
    );
  }

  const hotels = data?.hotels || [];

  // 🔥 KEY LOGIC: If a hotel is clicked → show HotelDetails
  if (clickedPlace) {
    return <HotelDetails />;
  }

  // Otherwise show grid
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Navbar />

      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Luxury Hotels
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover top-rated hotels with world-class amenities.
          </p>
        </div>

        {hotels.length === 0 ? (
          <div className="text-center text-gray-500">
            No hotels found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hotels.map((hotel) => (
              <HotelCard key={hotel?._id} hotel={hotel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


export default function App() {
  return <Hotels />;
}
