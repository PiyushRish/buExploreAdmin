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
  ChevronDown 
} from "lucide-react";
import Navbar from "../components/Navbar.jsx"; // Assuming Navbar is here
import { PlaceContext } from "../contextApi/places.jsx";
import HotelDetails from "./HotelDetails.jsx";
import { useHotelsQuery } from "../queries/hotelQueries.js";
import { useAddHotelMutation } from "../mutations/hotelMutation.js";

/* -------------------------------------------------- */
/* HOTEL CARD COMPONENT              */
/* -------------------------------------------------- */

const HotelCard = ({ hotel }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const { setClickedPlaceHandler } = useContext(PlaceContext);

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked((prev) => !prev);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  // Helper to safely get the first image URL
  // Checks if photos exists, then checks if it's an object with .url or just a string
  const imageUrl = hotel?.photos?.[0]?.url || hotel?.photos?.[0];
  const displayImage = imageUrl || "https://via.placeholder.com/400x300?text=No+Image";

  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl 
      transition-all duration-300 transform hover:-translate-y-1 
      border border-gray-100 flex flex-col h-full cursor-pointer group"
      onClick={() => setClickedPlaceHandler(hotel)}
    >
      <div className="relative h-56 bg-gray-900 flex items-center justify-center overflow-hidden">
        
        {/* --- REAL PHOTO LOGIC --- */}
        <img
          src={displayImage}
          alt={hotel?.title || "Hotel Image"}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Gradient Overlay (Makes text/icons readable) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />

        {/* Share Button (Above image and gradient) */}
        <div className="absolute top-3 right-3 z-20">
          <button className="p-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-gray-900 transition-colors">
            <Share2 size={18} />
          </button>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-xl text-gray-800 line-clamp-1 flex-1">
            {hotel?.title}
          </h3>
          <span className="flex items-center text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded ml-2">
            {hotel?.rating} <Star size={10} className="ml-1 fill-current" />
          </span>
        </div>

        <div className="flex items-center text-gray-500 text-sm mt-2">
          <MapPin size={14} className="mr-1 flex-shrink-0" />
          <span className="line-clamp-1">{hotel?.location || "Location N/A"}</span>
        </div>

        <p className="text-gray-600 text-sm mt-3 mb-4 line-clamp-2 flex-grow">
          {hotel?.description || "No description available."}
        </p>

        {/* Amenities Preview */}
        <div className="flex gap-2 mb-4 overflow-hidden">
            {hotel?.amenities?.slice(0, 3).map((am, i) => (
                <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full whitespace-nowrap">
                    {am}
                </span>
            ))}
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">Price Range</span>
            <span className="font-bold text-gray-800 text-sm">{hotel?.priceRange}</span>
          </div>

          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-full transition-colors ${
              isLiked ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Heart size={18} className={`${isLiked ? "fill-red-500 scale-110" : ""}`} />
            <span className="text-sm font-medium">{likeCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------- */
/* MAIN HOTELS GRID                  */
/* -------------------------------------------------- */

const Hotels = () => {
  const { data, isLoading, isError } = useHotelsQuery();
  const { clickedPlace } = useContext(PlaceContext);
  const addHotelMutation = useAddHotelMutation();

  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);

  // Form State
  const [form, setForm] = useState({
    title: "",
    subCategory: "Hotels",
    priceRange: "",
    rating: "",
    description: "",
    location: "",
    distanceFromCenter: "",
    amenities: "", 
    roomTypes: "", 
    contact: {
      phone: "",
      email: "",
      website: ""
    }
  });

  const [photoFiles, setPhotoFiles] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleContactChange = (e) => {
    setForm({
        ...form,
        contact: {
            ...form.contact,
            [e.target.name]: e.target.value
        }
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (photoFiles.length + files.length > 4) {
        alert("You can only upload a maximum of 4 images.");
        return;
    }
    setPhotoFiles((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const formData = new FormData();

    // 1. Append regular fields
    formData.append("title", form.title);
    formData.append("subCategory", form.subCategory);
    formData.append("priceRange", form.priceRange);
    formData.append("rating", form.rating);
    formData.append("description", form.description);
    formData.append("location", form.location);
    formData.append("distanceFromCenter", form.distanceFromCenter);
    
    // 2. Convert comma-separated strings to arrays
    const amenitiesArray = form.amenities ? form.amenities.split(',').map(item => item.trim()) : [];
    const roomTypesArray = form.roomTypes ? form.roomTypes.split(',').map(item => item.trim()) : [];

    // 3. Serialize complex data
    formData.append("amenities", JSON.stringify(amenitiesArray));
    formData.append("roomTypes", JSON.stringify(roomTypesArray));
    formData.append("contact", JSON.stringify(form.contact));

    // 4. Append Images
    photoFiles.forEach((file) => formData.append("HotelPhotos", file)); 

    try {
        await addHotelMutation.mutateAsync(formData);
        
        // Reset and Close
        setForm({
            title: "", subCategory: "Hotels", priceRange: "", rating: "", description: "", location: "", distanceFromCenter: "",
            amenities: "", roomTypes: "", contact: { phone: "", email: "", website: "" }
        });
        setPhotoFiles([]);
        setShowModal(false);
    } catch (error) {
        console.error("Submission failed:", error);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading hotels...</div>;
  if (isError) return <div className="flex items-center justify-center min-h-screen text-red-500">Failed to load hotels.</div>;
  if (clickedPlace) return <HotelDetails />;

  const hotels = data?.hotels || [];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">

      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Luxury Stays</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find your perfect getaway from our curated list of premium hotels.
          </p>
        </div>

        {hotels.length === 0 ? (
          <div className="text-center text-gray-500">No hotels found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hotels.map((hotel) => (
              <HotelCard key={hotel?._id} hotel={hotel} />
            ))}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-105"
      >
        <Plus size={28} />
      </button>

      {/* CREATE HOTEL MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800">Add New Property</h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar space-y-5">
              
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Basic Details</h3>
                
                <input
                  name="title"
                  placeholder="Property Name (e.g. Taj Palace)"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                        name="location"
                        placeholder="Location (e.g. Colaba, Mumbai)"
                        value={form.location}
                        onChange={handleChange}
                        className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500"
                    />
                    
                    <div className="relative">
                        <select
                            name="subCategory"
                            value={form.subCategory}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500 bg-white appearance-none cursor-pointer text-gray-700"
                        >
                            {["Hotels", "Resorts", "Guest Houses"].map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                            <ChevronDown size={16} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <input
                        name="priceRange"
                        placeholder="Price (₹8k - ₹25k)"
                        value={form.priceRange}
                        onChange={handleChange}
                        className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500"
                    />
                    <input
                        name="rating"
                        type="number"
                        step="0.1"
                        placeholder="Rating (4.8)"
                        value={form.rating}
                        onChange={handleChange}
                        className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500"
                    />
                    <input
                        name="distanceFromCenter"
                        type="number"
                        step="0.1"
                        placeholder="Dist. from center (km)"
                        value={form.distanceFromCenter}
                        onChange={handleChange}
                        className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500"
                    />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Overview</h3>
                <textarea
                    name="description"
                    placeholder="Describe the property..."
                    value={form.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="space-y-4">
                 <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Features</h3>
                 <input
                    name="amenities"
                    placeholder="Amenities (comma separated: WiFi, Pool, Spa)"
                    value={form.amenities}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500"
                />
                <input
                    name="roomTypes"
                    placeholder="Room Types (comma separated: Deluxe, Suite)"
                    value={form.roomTypes}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                        <Phone size={18} className="absolute left-3 top-3.5 text-gray-400" />
                        <input
                            name="phone"
                            placeholder="Phone Number"
                            value={form.contact.phone}
                            onChange={handleContactChange}
                            className="w-full pl-10 border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500"
                        />
                    </div>
                    <div className="relative">
                        <Mail size={18} className="absolute left-3 top-3.5 text-gray-400" />
                        <input
                            name="email"
                            placeholder="Email Address"
                            value={form.contact.email}
                            onChange={handleContactChange}
                            className="w-full pl-10 border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500"
                        />
                    </div>
                    <div className="relative sm:col-span-2">
                        <Globe size={18} className="absolute left-3 top-3.5 text-gray-400" />
                        <input
                            name="website"
                            placeholder="Website URL"
                            value={form.contact.website}
                            onChange={handleContactChange}
                            className="w-full pl-10 border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500"
                        />
                    </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Gallery</h3>
                    <span className="text-xs text-gray-500">{photoFiles.length}/4 Images</span>
                </div>
                
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
                        <button 
                            onClick={() => fileInputRef.current.click()}
                            className="flex flex-col items-center text-blue-600 hover:text-blue-700"
                        >
                            <Upload size={32} className="mb-2" />
                            <span className="font-medium">Click to upload images</span>
                        </button>
                    )}

                    {photoFiles.length > 0 && (
                        <div className="grid grid-cols-4 gap-4 mt-6 w-full">
                            {photoFiles.map((file, index) => (
                                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden shadow-sm">
                                    <img 
                                        src={URL.createObjectURL(file)} 
                                        alt="preview" 
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={handleSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-lg shadow-md transition-all hover:shadow-lg active:scale-[0.98]"
              >
                Create Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return <Hotels />;
}