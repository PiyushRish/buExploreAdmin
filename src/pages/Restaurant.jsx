import React, { useState } from "react";
import { MapPin, Plus, X, UploadCloud, Star, Utensils } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import { useAddRestaurantMutation } from "../mutations/restaurantMutation";
import toast from "react-hot-toast";

const getImageUrl = (photo) => {
  if (!photo) return "https://picsum.photos/600/400";
  if (typeof photo === "string") return photo;
  return photo.url || photo.secure_url || "https://picsum.photos/600/400";
};

const RestaurantCard = ({ restaurant, onSelect }) => (
  <div
    onClick={() => onSelect(restaurant)}
    className={`bg-white rounded-2xl shadow-lg overflow-hidden border transition-all duration-300 hover:shadow-2xl flex flex-col h-full cursor-pointer group ${
      restaurant.isDeleted ? "opacity-60 border-red-300 bg-red-50/30" : "border-gray-100"
    }`}
  >
    <div className="relative h-56 bg-gray-900 overflow-hidden">
      <img
        src={getImageUrl(restaurant?.photos?.[0])}
        alt={restaurant?.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute top-3 left-3 z-20 flex gap-2">
        <span className="bg-orange-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider shadow">
          {restaurant?.cuisine?.length ? (Array.isArray(restaurant.cuisine) ? restaurant.cuisine[0] : restaurant.cuisine) : "Restaurant"}
        </span>
        {restaurant.isDeleted && (
          <span className="bg-red-600 text-white text-[10px] font-extrabold px-2 py-1 rounded-md uppercase tracking-wider shadow">
            Soft Deleted
          </span>
        )}
      </div>

      <div className="absolute bottom-3 right-3 z-20 bg-black/70 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
        <Star size={12} className="text-yellow-400 fill-yellow-400" />
        {restaurant?.rating || "4.5"}
      </div>
    </div>

    <div className="p-5 flex flex-col flex-grow">
      <h3 className="font-extrabold text-lg text-gray-900 line-clamp-1">{restaurant?.name}</h3>
      <div className="flex items-center text-gray-500 text-xs font-medium mt-1 mb-2">
        <MapPin size={12} className="mr-1 text-orange-500 flex-shrink-0" />
        <span className="line-clamp-1">{restaurant?.address || restaurant?.location?.address || "Address"}</span>
      </div>
      <p className="text-gray-600 text-xs line-clamp-2 flex-grow leading-relaxed">
        {restaurant?.description || "No description provided."}
      </p>
      <div className="pt-3 mt-3 border-t border-gray-100 flex justify-between items-center text-[11px] font-bold text-gray-500">
        <span className="text-orange-700">₹{restaurant?.averageCost || "500 - 1,500"} for two</span>
        <span className="text-blue-600 hover:underline">Manage All Fields →</span>
      </div>
    </div>
  </div>
);

const Restaurants = ({ setSelectedRestaurant }) => {
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["restaurants", includeDeleted],
    queryFn: async () => {
      const res = await axiosClient.get("/services/restaurants", { params: { includeDeleted } });
      return res.data;
    },
  });

  const { mutateAsync: addRestaurant, isPending } = useAddRestaurantMutation();

  const [form, setForm] = useState({
    name: "",
    description: "",
    city: "Jhansi",
    address: "",
    contactNumber: "",
    averageCost: "",
    rating: "4.5",
    cuisine: "",
    openingHours: "10:00 AM - 11:00 PM",
  });

  const [photoFiles, setPhotoFiles] = useState([]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.name || photoFiles.length === 0) {
      toast.error("Restaurant name and at least 1 photo are required");
      return;
    }

    const formData = new FormData();
    const payload = {
      ...form,
      cuisine: form.cuisine ? form.cuisine.split(",").map((s) => s.trim()) : [],
    };

    formData.append("data", JSON.stringify(payload));
    photoFiles.forEach((file) => formData.append("photos", file));

    try {
      await addRestaurant(formData);
      toast.success("Restaurant added!");
      setShowModal(false);
      setPhotoFiles([]);
    } catch (_err) {
      toast.error(err?.response?.data?.message || "Failed to add restaurant");
    }
  };

  const restaurants = (data?.restaurants || []).filter((r) =>
    r.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <div className="p-8 font-bold text-center text-gray-500">Loading Restaurants...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border">
          <input
            type="text"
            placeholder="Search restaurants by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-1/3 border p-2.5 rounded-xl text-sm outline-none focus:border-orange-500"
          />

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700 bg-gray-100 px-3 py-2 rounded-xl border">
              <input
                type="checkbox"
                checked={includeDeleted}
                onChange={(e) => setIncludeDeleted(e.target.checked)}
                className="rounded text-orange-600"
              />
              Show Soft-Deleted Records
            </label>

            <button
              onClick={() => setShowModal(true)}
              className="bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-orange-700 shadow-md"
            >
              <Plus size={16} /> Add Restaurant
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant._id} restaurant={restaurant} onSelect={setSelectedRestaurant} />
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-bold">New Restaurant Listing</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            <input name="name" placeholder="Restaurant Name *" onChange={handleChange} className="w-full border p-2.5 rounded-xl text-sm" />
            <textarea name="description" placeholder="Description..." onChange={handleChange} rows={3} className="w-full border p-2.5 rounded-xl text-sm resize-none" />

            <div className="grid grid-cols-2 gap-4">
              <input name="averageCost" placeholder="Avg Cost for Two (₹)" onChange={handleChange} className="border p-2.5 rounded-xl text-sm" />
              <input name="contactNumber" placeholder="Contact Number" onChange={handleChange} className="border p-2.5 rounded-xl text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input name="cuisine" placeholder="Cuisines (comma separated)" onChange={handleChange} className="border p-2.5 rounded-xl text-sm" />
              <input name="openingHours" placeholder="Opening Hours" defaultValue="10:00 AM - 11:00 PM" onChange={handleChange} className="border p-2.5 rounded-xl text-sm" />
            </div>

            <input name="address" placeholder="Full Address" onChange={handleChange} className="w-full border p-2.5 rounded-xl text-sm" />

            <div className="border border-dashed p-4 rounded-xl text-center bg-gray-50">
              <input type="file" multiple accept="image/*" id="restPhotos" onChange={(e) => setPhotoFiles(Array.from(e.target.files))} className="hidden" />
              <label htmlFor="restPhotos" className="cursor-pointer text-xs font-bold text-orange-600 flex items-center justify-center gap-2">
                <UploadCloud size={20} /> {photoFiles.length ? `${photoFiles.length} Photos Selected` : "Upload Restaurant Photos *"}
              </label>
            </div>

            <button onClick={handleSubmit} disabled={isPending} className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold shadow-md">
              {isPending ? "Creating..." : "Save Restaurant Record"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Restaurants;