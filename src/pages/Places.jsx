import React, { useState, useContext } from "react";
import { Heart, MapPin, Share2, Plus, X, UploadCloud } from "lucide-react";
import { PlaceContext } from "../contextApi/places.jsx";
import { 
  usePlacesQuery,
  usePlacesByCategory 
} from "../queries/placeQueries.js";

import { useAddPlaceMutation } from "../mutations/placeMutation.js";

/* -------------------------------------------------- */
/*              PLACE CARD COMPONENT                 */
/* -------------------------------------------------- */

const PlaceCard = ({ place }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(place?.likes || 0);

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
      onClick={() => setClickedPlaceHandler(place)}
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={place?.photos?.[0]?.url || "https://via.placeholder.com/400x300"}
          alt={place?.name || "Place Image"}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />

        <div className="absolute top-3 right-3">
          <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors text-gray-700">
            <Share2 size={18} />
          </button>
        </div>

        <div className="absolute bottom-3 left-3">
          <span className="bg-black/60 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md">
            {place?.category || "Place"}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-xl text-gray-800 line-clamp-1">
          {place?.name}
        </h3>

        <div className="flex items-center text-gray-500 text-sm mt-1">
          <MapPin size={14} className="mr-1" />
          {place?.location?.address || "Address not available"}
        </div>

        <p className="text-gray-600 text-sm mt-3 mb-4 line-clamp-2 flex-grow">
          {place?.description || "No description available."}
        </p>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
          <span className="font-semibold text-sm text-gray-500">
            {place?.city || "Unknown City"}
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
/*                MAIN PLACES GRID                   */
/* -------------------------------------------------- */

const Places = () => {
  const placesQuery = usePlacesQuery();
  const addPlaceMutation = useAddPlaceMutation();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const categoryQuery = usePlacesByCategory(selectedCategory);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  const categories = [
    "Heritage",
    "Pilgrimage",
    "WildLife",
    "WaterBody",
    "JhansiSmartCity",
    "Treasures",
  ];

  const basePlaces =
    categoryQuery.data?.places ??
    placesQuery.data?.places ??
    [];

  const places = basePlaces.filter(place =>
    place.name.toLowerCase().includes(search.toLowerCase())
  );

  const isLoading =
    placesQuery.isLoading ||
    categoryQuery.isLoading;

  const isError =
    placesQuery.isError ||
    categoryQuery.isError;

  const [showModal, setShowModal] = useState(false);

  /* -------------------------------------------------- */
  /*        UPDATED FORM STATE (MATCHES WORKING FORM)  */
  /* -------------------------------------------------- */

  const [form, setForm] = useState({
    name: "",
    description: "",
    history: "",
    category: "",
    city: "",
    ytVideoLink: "",
    location: {
      address: "",
      lat: "",
      lng: ""
    },
    reviews: "",
    likes: 0,
  });

  const [photoFiles, setPhotoFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);



  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLocationChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  /* -------------------------------------------------- */
  /*        UPDATED handleSubmit (MATCHES YOUR FORM)   */
  /* -------------------------------------------------- */

 const handleSubmit = async () => {
  const formData = new FormData();
  console.log(photoFiles,"Photofiles");
  console.log(videoFiles,"videoFiles")

  // ✅ Append normal fields individually (DO NOT wrap in JSON)
  formData.append("name", form.name);
  formData.append("description", form.description);
  formData.append("history", form.history);
  formData.append("category", form.category);
  formData.append("city", form.city);
  formData.append("ytVideoLink", form.ytVideoLink);
  formData.append("reviews", form.reviews);
  formData.append("likes", form.likes);

  // ✅ Append location properly
  formData.append("location[address]", form.location.address);
  formData.append("location[lat]", form.location.lat);
  formData.append("location[lng]", form.location.lng);

  // ✅ Append photos
  photoFiles.forEach(file => {
    formData.append("placePhoto", file);
  });

  // ✅ Append videos
  videoFiles.forEach(file => {
    formData.append("placeVideo", file);
  });

  try {
    const placeAdd = await addPlaceMutation.mutateAsync(formData);
    console.log("Place added:", placeAdd);
    setShowModal(false);
  } catch (error) {
    console.error("Add place failed:", error);
  }
};


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading places...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Failed to load places.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">

      <div className="max-w-7xl mx-auto">

        {/* SEARCH + FILTER BAR */}
        <div className="flex items-center justify-between mb-6 relative">

          <div className="w-1/3">
            <input
              type="text"
              placeholder="Search places..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedCategory("");
              }}
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowCategoryMenu(prev => !prev)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Filter by Category
            </button>

            {showCategoryMenu && (
              <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg p-2 z-50 min-w-[180px]">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSearch("");
                      setShowCategoryMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
                  >
                    {cat}
                  </button>
                ))}

                <button
                  onClick={() => {
                    setSelectedCategory("");
                    setShowCategoryMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 rounded mt-1"
                >
                  Clear Filter
                </button>
              </div>
            )}
          </div>
        </div>

        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 text-center">
          Popular Destinations
        </h1>

        {places.length === 0 ? (
          <div className="text-center text-gray-500">No places found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {places.map((place) => (
              <PlaceCard key={place?._id} place={place} />
            ))}
          </div>
        )}
      </div>

      {/* FLOATING ADD BUTTON */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700"
      >
        <Plus size={28} />
      </button>

      {/* CREATE PLACE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[650px] p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Create New Place</h2>
              <button onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>

            <input
              name="name"
              placeholder="Place Name *"
              value={form.name}
              onChange={handleChange}
              className="w-full border p-2 rounded mb-3"
            />

            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              className="w-full border p-2 rounded mb-3"
              rows={3}
            />

            <textarea
              name="history"
              placeholder="History of the place"
              value={form.history}
              onChange={handleChange}
              className="w-full border p-2 rounded mb-3"
              rows={3}
            />

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border p-2 rounded mb-3"
            >
              <option value="">Select Category *</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <input
              name="city"
              placeholder="City *"
              value={form.city}
              onChange={handleChange}
              className="w-full border p-2 rounded mb-3"
            />

            <input
              placeholder="Address *"
              value={form.location.address}
              onChange={(e) => handleLocationChange("address", e.target.value)}
              className="w-full border p-2 rounded mb-3"
            />

            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="number"
                placeholder="Latitude *"
                value={form.location.lat}
                onChange={(e) => handleLocationChange("lat", e.target.value)}
                className="w-full border p-2 rounded"
              />
              <input
                type="number"
                placeholder="Longitude *"
                value={form.location.lng}
                onChange={(e) => handleLocationChange("lng", e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>

            {/* PHOTO UPLOAD */}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setPhotoFiles(Array.from(e.target.files))}
              className="w-full mb-4"
            />

            {/* VIDEO UPLOAD */}
            <input
              type="file"
              multiple
              accept="video/*"
              onChange={(e) => setVideoFiles(Array.from(e.target.files))}
              className="w-full mb-4"
            />

            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Create Place
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return <Places />;
}
