import React, { useState, useContext } from "react";
import {
  Heart,
  MapPin,
  X,
  UploadCloud,
  Check,
  RefreshCw,
  Tag,
} from "lucide-react";
import { GenericListHeader } from "../components/layout/GenericListHeader.jsx";
import { PlaceContext } from "../contextApi/places.jsx";
import { usePlacesQuery } from "../queries/placeQueries.js";
import toast from "react-hot-toast";
import { useAddPlaceMutation } from "../mutations/placeMutation.js";

const getImageUrl = (photo) => {
  if (!photo) return "https://picsum.photos/600/400";
  if (typeof photo === "string") return photo;
  return photo.url || photo.secure_url || "https://picsum.photos/600/400";
};

const CATEGORIES = [
  "Heritage",
  "Pilgrimage",
  "WildLife",
  "WaterBody",
  "JhansiSmartCity",
  "Treasures",
];

const PlaceCard = ({ place }) => {
  const { setClickedPlaceHandler } = useContext(PlaceContext);
  const coverImage = getImageUrl(place?.photos?.[0]);

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg overflow-hidden border transition-all duration-300 hover:shadow-2xl flex flex-col h-full cursor-pointer group ${
        place.isDeleted
          ? "opacity-60 border-red-300 bg-red-50/30"
          : "border-gray-100"
      }`}
      onClick={() => setClickedPlaceHandler(place)}
    >
      <div className="relative h-56 bg-gray-900 overflow-hidden">
        <img
          src={coverImage}
          alt={place?.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-2">
          <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider shadow">
            {place?.category || "Destination"}
          </span>

          {place.isDeleted && (
            <span className="bg-red-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider shadow animate-pulse">
              Soft Deleted
            </span>
          )}
        </div>

        <div className="absolute bottom-3 right-3 z-20 bg-black/70 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
          <Heart size={12} className="text-red-500 fill-red-500" />
          {place?.likes || 0}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-extrabold text-lg text-gray-900 line-clamp-1">
          {place?.name}
        </h3>

        <div className="flex items-center text-gray-500 text-xs font-medium mt-1 mb-2">
          <MapPin size={12} className="mr-1 text-blue-500 flex-shrink-0" />
          <span className="line-clamp-1">
            {place?.location?.address || place?.city || "Jhansi"}
          </span>
        </div>

        <p className="text-gray-600 text-xs line-clamp-2 flex-grow leading-relaxed">
          {place?.description || "No description provided."}
        </p>

        <div className="pt-3 mt-3 border-t border-gray-100 flex justify-between items-center text-[10px] font-bold text-gray-400">
          <span>CITY: {place?.city || "Jhansi"}</span>
          <span className="text-blue-600 font-bold hover:underline">
            Manage All Fields →
          </span>
        </div>
      </div>
    </div>
  );
};

const Places = () => {
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Unified Query: Fetches places passing includeDeleted flag
  const { data, isLoading } = usePlacesQuery({ includeDeleted });
  const { mutateAsync: addPlace, isPending } = useAddPlaceMutation();

  const allPlaces = data?.places || [];

  // Filter client-side by Category and Search Keyword
  const places = allPlaces.filter((place) => {
    const matchesSearch =
      place.name?.toLowerCase().includes(search.toLowerCase()) ||
      place.description?.toLowerCase().includes(search.toLowerCase()) ||
      place.city?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      !selectedCategory ||
      place.category?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "Heritage",
    city: "Jhansi",
    ytVideoLink: "",
    address: "",
    lat: "",
    lng: "",
  });

  const [photoFiles, setPhotoFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.name || !form.category || photoFiles.length === 0) {
      toast.error("Name, category, and at least 1 photo are required");
      return;
    }

    const formData = new FormData();
    const payload = {
      name: form.name,
      description: form.description,
      category: form.category,
      city: form.city,
      ytVideoLink: form.ytVideoLink,
      location: {
        address: form.address,
        lat: Number(form.lat) || 0,
        lng: Number(form.lng) || 0,
      },
    };

    formData.append("data", JSON.stringify(payload));
    photoFiles.forEach((f) => formData.append("placePhoto", f));
    videoFiles.forEach((f) => formData.append("placeVideo", f));

    try {
      await addPlace(formData);
      toast.success("Destination created successfully!");
      setShowModal(false);
      setPhotoFiles([]);
      setVideoFiles([]);
    } catch (_err) {
      toast.error(_err?.response?.data?.message || "Failed to create destination");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen font-bold text-gray-500">
        Loading Destinations...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <GenericListHeader
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search destinations by name, description, or city..."
          includeDeleted={includeDeleted}
          onIncludeDeletedChange={setIncludeDeleted}
          onAddClick={() => setShowModal(true)}
          addButtonLabel="Add Destination"
          categories={CATEGORIES.map(cat => ({ 
            label: cat, 
            value: cat, 
            count: allPlaces.filter(p => p.category?.toLowerCase() === cat.toLowerCase()).length 
          }))}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          totalItemsCount={allPlaces.length}
        />

        {/* DESTINATIONS GRID */}
        {places.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl text-center border text-gray-400 font-semibold">
            No destinations match your search or filter criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {places.map((place) => (
              <PlaceCard key={place._id} place={place} />
            ))}
          </div>
        )}
      </div>

      {/* CREATE DESTINATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-bold text-gray-900">
                Create New Destination Record
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                Destination Name *
              </label>
              <input
                name="name"
                placeholder="e.g. Jhansi Fort"
                onChange={handleChange}
                className="w-full border p-2.5 rounded-xl text-sm font-semibold outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                Description
              </label>
              <textarea
                name="description"
                placeholder="Write full description..."
                onChange={handleChange}
                rows={3}
                className="w-full border p-2.5 rounded-xl text-sm resize-none outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border p-2.5 rounded-xl text-sm bg-white font-semibold outline-none focus:border-blue-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                  City
                </label>
                <input
                  name="city"
                  defaultValue="Jhansi"
                  onChange={handleChange}
                  className="w-full border p-2.5 rounded-xl text-sm font-semibold outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                YouTube Video Link
              </label>
              <input
                name="ytVideoLink"
                placeholder="https://youtube.com/watch?v=..."
                onChange={handleChange}
                className="w-full border p-2.5 rounded-xl text-sm text-blue-600 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                Street Address / Landmark
              </label>
              <input
                name="address"
                placeholder="e.g. Fort Road, Near Civil Lines"
                onChange={handleChange}
                className="w-full border p-2.5 rounded-xl text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="lat"
                  placeholder="25.4484"
                  onChange={handleChange}
                  className="w-full border p-2.5 rounded-xl text-sm font-mono outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="lng"
                  placeholder="78.5685"
                  onChange={handleChange}
                  className="w-full border p-2.5 rounded-xl text-sm font-mono outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* FILE UPLOADS */}
            <div className="border border-dashed border-gray-300 p-4 rounded-xl text-center bg-gray-50">
              <input
                type="file"
                multiple
                accept="image/*"
                id="photos"
                onChange={(e) => setPhotoFiles(Array.from(e.target.files))}
                className="hidden"
              />
              <label
                htmlFor="photos"
                className="cursor-pointer text-xs font-bold text-blue-600 flex items-center justify-center gap-2"
              >
                <UploadCloud size={18} />
                {photoFiles.length
                  ? `${photoFiles.length} Photos Selected`
                  : "Upload Place Photos *"}
              </label>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all disabled:bg-blue-300"
            >
              {isPending ? "Creating..." : "Save Record"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Places;