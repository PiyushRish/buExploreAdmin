import React, { useState, useContext } from "react";
import { Heart, MapPin, Share2, Star, Clock, Utensils, Wallet, Globe, Phone } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import { PlaceContext } from "../contextApi/places.jsx";
import { useRestaurantsQuery } from "../queries/restaurantQueries.js"; // <-- adjust if your hook name is different

/* -------------------------------------------------- */
/*            RESTAURANT CARD COMPONENT              */
/* -------------------------------------------------- */

const RestaurantCard = ({ restaurant }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const { setClickedPlaceHandler } = useContext(PlaceContext);

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked((prev) => !prev);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl 
      transition-all duration-300 transform hover:-translate-y-1 
      border border-gray-100 flex flex-col h-full cursor-pointer"
      onClick={() => setClickedPlaceHandler(restaurant)}
    >
      {/* NO IMAGE → RESTAURANT PLACEHOLDER */}
      <div className="relative h-56 bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center">
        <h2 className="text-4xl font-extrabold text-white tracking-wider">
          RESTAURANT
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
          {restaurant?.title}
        </h3>

        <div className="flex items-center text-gray-500 text-sm mt-1">
          <MapPin size={14} className="mr-1" />
          {restaurant?.location || "Location not available"}
        </div>

        <p className="text-gray-600 text-sm mt-3 mb-4 line-clamp-2 flex-grow">
          {restaurant?.description || "No description available."}
        </p>

        {/* Restaurant Info Row */}
        <div className="flex justify-between items-center mb-3 text-sm">
          <span className="flex items-center font-semibold text-gray-700">
            <Star size={16} className="text-yellow-400 mr-1" />
            {restaurant?.rating || "N/A"}
          </span>

          <span className="flex items-center font-semibold text-gray-700">
            <Wallet size={16} className="mr-1" />
            ₹{restaurant?.averageCost || "N/A"}
          </span>
        </div>

        {/* Timings */}
        <div className="flex items-center text-sm text-gray-700 mb-3">
          <Clock size={14} className="mr-1" />
          {restaurant?.timings || "Timings not available"}
        </div>

        {/* Cuisine Tags */}
        {restaurant?.cuisine?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {restaurant.cuisine.map((c, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {c}
              </span>
            ))}
          </div>
        )}

        {/* FOOTER */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
          <span className="font-semibold text-sm text-gray-500">
            {restaurant?.subCategory || "Restaurant"}
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
/*              MAIN RESTAURANTS GRID                */
/* -------------------------------------------------- */

const Restaurants = () => {
  const { data, isLoading, isError } = useRestaurantsQuery();

  console.log(data, "restaurant data");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading restaurants...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Failed to load restaurants. Please try again later.
      </div>
    );
  }

  const restaurants = data?.restaurants || [];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Navbar />

      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Best Restaurants
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover top-rated restaurants, cafes, and dining spots near you.
          </p>
        </div>

        {restaurants.length === 0 ? (
          <div className="text-center text-gray-500">
            No restaurants found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant?._id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  return <Restaurants />;
}
