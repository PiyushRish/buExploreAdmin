import React, { useState, useContext } from "react";
import { Heart, MapPin, Share2, Star, Plus, X } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import { PlaceContext } from "../contextApi/places.jsx";
import RestaurantDetails from "./RestaurantDetails.jsx";

import { useRestaurantsQuery } from "../queries/restaurantQueries.js";
import { useAddRestaurantMutation } from "../mutations/restaurantMutation.js";

/* ---------------- RESTAURANT CARD ---------------- */

const RestaurantCard = ({ restaurant }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const { setClickedPlaceHandler } = useContext(PlaceContext);

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(prev => !prev);
    setLikeCount(prev => (isLiked ? prev - 1 : prev + 1));
  };

  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl 
      transition-all duration-300 transform hover:-translate-y-1 
      border border-gray-100 flex flex-col h-full cursor-pointer"
      onClick={() => setClickedPlaceHandler(restaurant)}
    >
      <div className="relative h-56 bg-red-700 flex items-center justify-center">
        <h2 className="text-4xl font-extrabold text-white tracking-wider">
          RESTAURANT
        </h2>

        <div className="absolute top-3 right-3">
          <button className="p-2 bg-white/80 rounded-full">
            <Share2 size={18} />
          </button>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-xl text-gray-800 line-clamp-1">
          {restaurant?.title}
        </h3>

        <div className="flex items-center text-gray-500 text-sm mt-1">
          <MapPin size={14} className="mr-1" />
          {restaurant?.location}
        </div>

        <p className="text-gray-600 text-sm mt-3 mb-4 line-clamp-2 flex-grow">
          {restaurant?.description}
        </p>

        <div className="flex justify-between items-center mb-3 text-sm">
          <span className="flex items-center font-semibold text-gray-700">
            <Star size={16} className="text-yellow-400 mr-1" />
            {restaurant?.rating}
          </span>

          <span className="font-semibold text-gray-700">
            ₹{restaurant?.averageCost}
          </span>
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
          <span className="font-semibold text-sm text-gray-500">
            {restaurant?.subCategory}
          </span>

          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-full ${
              isLiked
                ? "bg-red-50 text-red-500"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Heart size={18} className={isLiked ? "fill-red-500" : ""} />
            <span className="text-sm font-medium">{likeCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------- MAIN GRID ---------------- */

const Restaurants = () => {
  const { data, isLoading, isError } = useRestaurantsQuery();
  const { clickedPlace } = useContext(PlaceContext);

  const addMutation = useAddRestaurantMutation();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    subCategory: "",
    location: "",
    rating: "",
    timings: "",
    averageCost: "",
    cuisine: "",
    phone: "",
    email: "",
    website: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    const formData = new FormData();

    Object.entries(form).forEach(([k, v]) =>
      formData.append(k, v)
    );

    await addMutation.mutateAsync(formData);
    setShowModal(false);
  };

  if (isLoading)
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  if (isError)
    return <div className="flex items-center justify-center min-h-screen text-red-500">Error</div>;

  if (clickedPlace) return <RestaurantDetails />;

  const restaurants = data?.restaurants || [];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <Navbar />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {restaurants.map(r => (
            <RestaurantCard key={r._id} restaurant={r} />
          ))}
        </div>
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 bg-red-600 text-white p-4 rounded-full"
      >
        <Plus size={28} />
      </button>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-xl w-[600px] p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-2xl font-bold">Create Restaurant</h2>
              <X onClick={() => setShowModal(false)} />
            </div>

            {["title","location","subCategory","rating","timings","averageCost"].map(f => (
              <input
                key={f}
                name={f}
                placeholder={f}
                onChange={handleChange}
                className="w-full border p-2 rounded mb-3"
              />
            ))}

            <textarea
              name="description"
              placeholder="Description"
              onChange={handleChange}
              className="w-full border p-2 rounded mb-3"
            />

            <input
              name="cuisine"
              placeholder="Cuisine (comma separated)"
              onChange={handleChange}
              className="w-full border p-2 rounded mb-3"
            />

            {["phone","email","website"].map(f => (
              <input
                key={f}
                name={f}
                placeholder={f}
                onChange={handleChange}
                className="w-full border p-2 rounded mb-3"
              />
            ))}

            <button
              onClick={handleSubmit}
              className="w-full bg-red-600 text-white py-2 rounded"
            >
              Create Restaurant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return <Restaurants />;
}
