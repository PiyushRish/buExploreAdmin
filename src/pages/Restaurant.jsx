import React, { useState, useContext, useRef } from "react";
import { 
  Heart, 
  MapPin, 
  Share2, 
  Star, 
  Plus, 
  X, 
  Upload, 
  Globe, 
  Phone, 
  Mail, 
  ChevronDown,
  Clock,
  Utensils,
  IndianRupee
} from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import { PlaceContext } from "../contextApi/places.jsx";
import RestaurantDetails from "./RestaurantDetails.jsx";

import { useRestaurantsQuery } from "../queries/restaurantQueries.js";
import { useAddRestaurantMutation } from "../mutations/restaurantMutation.js";

/* -------------------------------------------------- */
/* RESTAURANT CARD COMPONENT            */
/* -------------------------------------------------- */

const RestaurantCard = ({ restaurant }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const { setClickedPlaceHandler } = useContext(PlaceContext);

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(prev => !prev);
    setLikeCount(prev => (isLiked ? prev - 1 : prev + 1));
  };

  // Image Logic: Handle both string URLs and Object URLs (Cloudinary)
  const imageUrl = restaurant?.photos?.[0]?.url || restaurant?.photos?.[0];
  const displayImage = imageUrl || "https://via.placeholder.com/400x300?text=No+Image";

  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl 
      transition-all duration-300 transform hover:-translate-y-1 
      border border-gray-100 flex flex-col h-full cursor-pointer group"
      onClick={() => setClickedPlaceHandler(restaurant)}
    >
      {/* --- Image Section with Gradient --- */}
      <div className="relative h-56 bg-gray-900 flex items-center justify-center overflow-hidden">
        
        {/* Real Photo */}
        <img
          src={displayImage}
          alt={restaurant?.title || "Restaurant Image"}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Gradient Overlay (Makes text readable) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

        <div className="absolute top-3 right-3 z-20">
          <button className="p-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-gray-900 transition-colors">
            <Share2 size={18} />
          </button>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-xl text-gray-800 line-clamp-1 flex-1">
            {restaurant?.title}
          </h3>
          <span className="flex items-center text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded ml-2">
            {restaurant?.rating} <Star size={10} className="ml-1 fill-current" />
          </span>
        </div>

        <div className="flex items-center text-gray-500 text-sm mt-2">
          <MapPin size={14} className="mr-1 flex-shrink-0" />
          <span className="line-clamp-1">{restaurant?.location || "Location N/A"}</span>
        </div>

        <p className="text-gray-600 text-sm mt-3 mb-4 line-clamp-2 flex-grow">
          {restaurant?.description || "Experience fine dining..."}
        </p>

        {/* Cuisine Tags Preview */}
        <div className="flex gap-2 mb-4 overflow-hidden">
            {restaurant?.cuisine?.slice(0, 3).map((item, i) => (
                <span key={i} className="text-[10px] bg-orange-50 text-orange-600 px-2 py-1 rounded-full whitespace-nowrap border border-orange-100">
                    {item}
                </span>
            ))}
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">Avg Cost</span>
            <span className="font-bold text-gray-800 text-sm">₹{restaurant?.averageCost}</span>
          </div>

          <div className="flex flex-col items-end">
             <span className="text-xs text-gray-400">{restaurant?.subCategory}</span>
             <button
                onClick={handleLike}
                className={`flex items-center space-x-1 mt-1 transition-colors ${
                  isLiked ? "text-red-500" : "text-gray-400 hover:text-red-500"
                }`}
              >
                <Heart size={16} className={isLiked ? "fill-red-500" : ""} />
                <span className="text-xs font-medium">{likeCount}</span>
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------- */
/* MAIN COMPONENT                    */
/* -------------------------------------------------- */

const Restaurants = () => {
  const { data, isLoading, isError } = useRestaurantsQuery();
  const { clickedPlace } = useContext(PlaceContext);
  const addMutation = useAddRestaurantMutation();

  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);

  // Form State matching Mongoose Schema
  const [form, setForm] = useState({
    title: "",
    subCategory: "Restaurants", // Default to first Enum option
    location: "",
    rating: "",
    description: "",
    timings: "",
    averageCost: "",
    cuisine: "", // Input as comma separated string
    contact: {
      phone: "",
      email: "",
      website: ""
    }
  });

  const [photoFiles, setPhotoFiles] = useState([]);

  // --- Handlers ---

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleContactChange = (e) => {
    setForm({
      ...form,
      contact: { ...form.contact, [e.target.name]: e.target.value }
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (photoFiles.length + files.length > 4) {
        alert("Max 4 images allowed");
        return;
    }
    setPhotoFiles(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const formData = new FormData();

    // 1. Simple Fields
    formData.append("title", form.title);
    formData.append("subCategory", form.subCategory);
    formData.append("location", form.location);
    formData.append("rating", form.rating);
    formData.append("description", form.description);
    formData.append("timings", form.timings);
    formData.append("averageCost", form.averageCost);

    // 2. Complex Fields (Arrays/Objects) -> Stringify for Backend Parsing
    const cuisineArray = form.cuisine ? form.cuisine.split(',').map(i => i.trim()) : [];
    
    formData.append("cuisine", JSON.stringify(cuisineArray));
    formData.append("contact", JSON.stringify(form.contact));

    // 3. Images (Must match backend upload.fields name)
    photoFiles.forEach(file => formData.append("RestaurantPhotos", file));

    try {
      console.log("Submitting Restaurant:", formData);
        await addMutation.mutateAsync(formData);
        
        // Success: Close and Reset
        setShowModal(false);
        setForm({
            title: "", subCategory: "Restaurants", location: "", rating: "", description: "", timings: "", averageCost: "", cuisine: "",
            contact: { phone: "", email: "", website: "" }
        });
        setPhotoFiles([]);
    } catch (err) {
        console.error("Failed to add restaurant", err);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (isError) return <div className="flex justify-center items-center h-screen text-red-500">Error loading data</div>;
  if (clickedPlace) return <RestaurantDetails />;

  const restaurants = data?.restaurants || [];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <Navbar />

      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Culinary Delights</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the best local flavors and dining experiences.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {restaurants.map(r => (
            <RestaurantCard key={r._id} restaurant={r} />
          ))}
        </div>
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105"
      >
        <Plus size={28} />
      </button>

      {/* ---------------- MODAL ---------------- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800">Add Restaurant</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-5">
                
                {/* Section 1: Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Basic Details</h3>
                    <input
                        name="title"
                        placeholder="Restaurant Name"
                        value={form.title}
                        onChange={handleChange}
                        className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-red-500 transition-colors"
                    />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                            name="location"
                            placeholder="Location (e.g. Downtown)"
                            value={form.location}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-red-500"
                        />
                        
                        {/* Schema Enum Dropdown */}
                        <div className="relative">
                            <select
                                name="subCategory"
                                value={form.subCategory}
                                onChange={handleChange}
                                className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-red-500 bg-white appearance-none cursor-pointer text-gray-700"
                            >
                                {["Restaurants","Cafes","Bars","Fast Food"].map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-3.5 text-gray-500 pointer-events-none" size={16}/>
                        </div>
                    </div>
                </div>

                {/* Section 2: Stats */}
                <div className="grid grid-cols-3 gap-4">
                     <div className="relative">
                        <Star size={16} className="absolute left-3 top-3.5 text-gray-400" />
                        <input
                            name="rating"
                            type="number"
                            step="0.1"
                            placeholder="Rating"
                            value={form.rating}
                            onChange={handleChange}
                            className="w-full pl-9 border border-gray-300 p-3 rounded-lg outline-none focus:border-red-500"
                        />
                     </div>
                     <div className="relative">
                        <IndianRupee size={16} className="absolute left-3 top-3.5 text-gray-400" />
                        <input
                            name="averageCost"
                            type="number"
                            placeholder="Avg Cost"
                            value={form.averageCost}
                            onChange={handleChange}
                            className="w-full pl-9 border border-gray-300 p-3 rounded-lg outline-none focus:border-red-500"
                        />
                     </div>
                     <div className="relative">
                        <Clock size={16} className="absolute left-3 top-3.5 text-gray-400" />
                        <input
                            name="timings"
                            placeholder="10 AM - 11 PM"
                            value={form.timings}
                            onChange={handleChange}
                            className="w-full pl-9 border border-gray-300 p-3 rounded-lg outline-none focus:border-red-500"
                        />
                     </div>
                </div>

                {/* Section 3: Details */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Overview</h3>
                    <textarea
                        name="description"
                        placeholder="Description..."
                        value={form.description}
                        onChange={handleChange}
                        rows="3"
                        className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-red-500 resize-none mb-4"
                    />
                    <div className="relative">
                        <Utensils size={16} className="absolute left-3 top-3.5 text-gray-400" />
                        <input
                            name="cuisine"
                            placeholder="Cuisine (comma separated: Italian, Chinese)"
                            value={form.cuisine}
                            onChange={handleChange}
                            className="w-full pl-9 border border-gray-300 p-3 rounded-lg outline-none focus:border-red-500"
                        />
                    </div>
                </div>

                {/* Section 4: Contact */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Contact Info</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                            <Phone size={16} className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                                name="phone"
                                placeholder="Phone"
                                value={form.contact.phone}
                                onChange={handleContactChange}
                                className="w-full pl-9 border border-gray-300 p-3 rounded-lg outline-none focus:border-red-500"
                            />
                        </div>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                                name="email"
                                placeholder="Email"
                                value={form.contact.email}
                                onChange={handleContactChange}
                                className="w-full pl-9 border border-gray-300 p-3 rounded-lg outline-none focus:border-red-500"
                            />
                        </div>
                        <div className="relative sm:col-span-2">
                            <Globe size={16} className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                                name="website"
                                placeholder="Website"
                                value={form.contact.website}
                                onChange={handleContactChange}
                                className="w-full pl-9 border border-gray-300 p-3 rounded-lg outline-none focus:border-red-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 5: Images */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50">
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        ref={fileInputRef}
                        disabled={photoFiles.length >= 4}
                    />
                    {photoFiles.length < 4 && (
                        <button onClick={() => fileInputRef.current.click()} className="flex flex-col items-center text-red-600 hover:text-red-700">
                            <Upload size={32} className="mb-2"/>
                            <span className="font-medium">Upload Images ({photoFiles.length}/4)</span>
                        </button>
                    )}
                    {photoFiles.length > 0 && (
                        <div className="grid grid-cols-4 gap-4 mt-6 w-full">
                            {photoFiles.map((file, i) => (
                                <div key={i} className="relative group aspect-square rounded overflow-hidden shadow-sm">
                                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="preview"/>
                                    <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={handleSubmit}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold shadow-md transition-all active:scale-[0.98]"
              >
                Add Restaurant
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return <Restaurants />;
}