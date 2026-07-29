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
import { Req, RequiredNotice } from "../components/RequiredTag.jsx";
import FormField from "../components/FormField.jsx";
import { validators, runValidators, validateMediaType } from "../utils/validators.js";

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
  const [onlyDeleted, setOnlyDeleted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Unified Query: Fetches places passing onlyDeleted flag explicitly
  const { data, isLoading } = usePlacesQuery({ onlyDeleted, limit: 1000 });
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

  const [photoFile, setPhotoFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Validation
  const RULES = {
    name:        [validators.required, validators.minLength(2)],
    description: [validators.required],
    category:    [validators.required],
    city:        [validators.required],
    address:     [validators.required],
    ytVideoLink: [validators.youtubeUrl],
    lat:         [validators.required, validators.latitude],
    lng:         [validators.required, validators.longitude],
  };
  const [touched, setTouched]     = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));
    const result = runValidators(value, RULES[name] || [], name);
    setFieldErrors((p) => ({ ...p, [name]: result }));
  };

  const handleChangeValidated = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (touched[name]) {
      const result = runValidators(value, RULES[name] || [], name);
      setFieldErrors((p) => ({ ...p, [name]: result }));
    }
  };

  const handleSubmit = async () => {
    const requiredFields = ["name", "description", "category", "city", "address", "lat", "lng"];
    const optionalValidated = ["ytVideoLink"];
    const allFields = [...requiredFields, ...optionalValidated];

    const newTouched = {};
    const newErrors  = {};
    let hasError = false;

    allFields.forEach((field) => {
      newTouched[field] = true;
      const result = runValidators(form[field] || "", RULES[field] || [], field);
      newErrors[field] = result;
      if (result) hasError = true;
    });

    setTouched(newTouched);
    setFieldErrors(newErrors);

    if (!form.category) {
      toast.error("Please select a category.");
      return;
    }
    if (!photoFile) {
      toast.error("A place photo is required.");
      return;
    }
    if (!videoFile) {
      toast.error("A place video is required.");
      return;
    }
    if (hasError) {
      toast.error("Please fix the highlighted errors before submitting.");
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
    formData.append("placePhoto", photoFile);
    if (videoFile) formData.append("placeVideo", videoFile);

    try {
      await addPlace(formData);
      toast.success("Destination created successfully!");
      setShowModal(false);
      setPhotoFile(null);
      setVideoFile(null);
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
          includeDeleted={onlyDeleted}
          onIncludeDeletedChange={setOnlyDeleted}
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

            {/* Required fields notice */}
            <RequiredNotice />

            <FormField label="Destination Name" required
              error={fieldErrors.name?.error} hint={fieldErrors.name?.hint || "e.g. Jhansi Fort"}
              touched={touched.name} valid={touched.name && !fieldErrors.name}>
              <input
                name="name"
                value={form.name}
                placeholder="e.g. Jhansi Fort"
                onChange={handleChangeValidated}
                onBlur={handleBlur}
                className="w-full p-2.5 rounded-xl text-sm font-semibold"
              />
            </FormField>

            <FormField label="Description" required error={fieldErrors.description?.error} touched={touched.description} valid={touched.description && !fieldErrors.description}>
              <textarea
                name="description"
                value={form.description}
                placeholder="Write full description..."
                onChange={handleChangeValidated}
                onBlur={handleBlur}
                rows={3}
                className="w-full p-2.5 rounded-xl text-sm resize-none"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Category" required hint="Select a category">
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChangeValidated}
                  onBlur={handleBlur}
                  className="w-full p-2.5 rounded-xl text-sm bg-white font-semibold"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="City" required error={fieldErrors.city?.error} touched={touched.city} valid={touched.city && !fieldErrors.city}>
                <input
                  name="city"
                  value={form.city}
                  defaultValue="Jhansi"
                  onChange={handleChangeValidated}
                  onBlur={handleBlur}
                  className="w-full p-2.5 rounded-xl text-sm font-semibold"
                />
              </FormField>
            </div>

            <FormField label="YouTube Video Link" optional
              error={fieldErrors.ytVideoLink?.error} hint={fieldErrors.ytVideoLink?.hint || "e.g. https://youtube.com/watch?v=..."}
              touched={touched.ytVideoLink} valid={touched.ytVideoLink && !fieldErrors.ytVideoLink}>
              <input
                name="ytVideoLink"
                value={form.ytVideoLink}
                placeholder="https://youtube.com/watch?v=..."
                onChange={handleChangeValidated}
                onBlur={handleBlur}
                className="w-full p-2.5 rounded-xl text-sm text-blue-600"
              />
            </FormField>

            <FormField label="Street Address / Landmark" required error={fieldErrors.address?.error} touched={touched.address} valid={touched.address && !fieldErrors.address}>
              <input
                name="address"
                value={form.address}
                placeholder="e.g. Fort Road, Near Civil Lines"
                onChange={handleChangeValidated}
                onBlur={handleBlur}
                className="w-full p-2.5 rounded-xl text-sm"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Latitude" required
                error={fieldErrors.lat?.error} hint={fieldErrors.lat?.hint || "e.g. 25.4484"}
                touched={touched.lat} valid={touched.lat && !fieldErrors.lat}>
                <input
                  type="number"
                  step="any"
                  name="lat"
                  value={form.lat}
                  placeholder="25.4484"
                  onChange={handleChangeValidated}
                  onBlur={handleBlur}
                  className="w-full p-2.5 rounded-xl text-sm font-mono"
                />
              </FormField>

              <FormField label="Longitude" required
                error={fieldErrors.lng?.error} hint={fieldErrors.lng?.hint || "e.g. 78.5685"}
                touched={touched.lng} valid={touched.lng && !fieldErrors.lng}>
                <input
                  type="number"
                  step="any"
                  name="lng"
                  value={form.lng}
                  placeholder="78.5685"
                  onChange={handleChangeValidated}
                  onBlur={handleBlur}
                  className="w-full p-2.5 rounded-xl text-sm font-mono"
                />
              </FormField>
            </div>

            {/* FILE UPLOADS */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-dashed border-gray-300 p-4 rounded-xl text-center bg-gray-50">
                <input
                  type="file"
                  accept="image/*"
                  id="photos"
                  onChange={(e) => {
                    const f = e.target.files[0];
                    if (f) {
                      const v = validateMediaType(f, "image");
                      if (v !== true) return toast.error(v);
                      setPhotoFile(f);
                    }
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="photos"
                  className="cursor-pointer text-xs font-bold text-blue-600 flex flex-col items-center justify-center gap-2"
                >
                  <UploadCloud size={18} />
                  {photoFile
                    ? `Photo Selected: ${photoFile.name}`
                    : <><span>Upload Place Photo</span><Req /><span className="text-red-400 text-[10px]">(1 Max)</span></>}
                </label>
              </div>

              <div className="border border-dashed border-gray-300 p-4 rounded-xl text-center bg-purple-50">
                <input
                  type="file"
                  accept="video/*"
                  id="videoUpload"
                  onChange={(e) => {
                    const f = e.target.files[0];
                    if (f) {
                      const v = validateMediaType(f, "video");
                      if (v !== true) return toast.error(v);
                      setVideoFile(f);
                    }
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="videoUpload"
                  className="cursor-pointer text-xs font-bold text-purple-600 flex flex-col items-center justify-center gap-2"
                >
                  <UploadCloud size={18} />
                  {videoFile
                    ? `Video Selected: ${videoFile.name}`
                    : <><span>Upload Place Video</span><Req /><span className="text-purple-400 text-[10px]">(1 Max)</span></>}
                </label>
              </div>
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