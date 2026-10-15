import React, { useState, useContext } from "react";
import {
  Heart,
  MapPin,
  X,
  UploadCloud,
  Check,
  RefreshCw,
  Tag,
  Star,
  Loader2,
} from "lucide-react";
import { GenericListHeader } from "../components/layout/GenericListHeader.jsx";
import { PlaceContext } from "../contextApi/places.jsx";
import { usePlacesQuery } from "../queries/placeQueries.js";
import toast from "react-hot-toast";
import { useAddPlaceMutation } from "../mutations/placeMutation.js";
import { Req, RequiredNotice } from "../components/RequiredTag.jsx";
import FormField from "../components/FormField.jsx";
import { validators, runValidators, validateMediaType } from "../utils/validators.js";
import NotificationDraftSection from "../components/NotificationDraftSection.jsx";
import { useNotificationDraft } from "../utils/useNotificationDraft.js";
import UploadProgressBar from "../components/UploadProgressBar.jsx";

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

const PlaceCard = ({ place, onNavigateToReviews }) => {
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
          <div className="flex items-center gap-2">
            {onNavigateToReviews && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateToReviews(place);
                }}
                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md transition font-bold cursor-pointer"
                title="View & moderate reviews"
              >
                <Star size={11} className="text-amber-500 fill-amber-400" />
                <span>Reviews {place.reviews?.length > 0 ? `(${place.reviews.length})` : ""}</span>
              </button>
            )}
            <span className="text-blue-600 font-bold hover:underline">
              Manage All Fields →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Places = ({ onNavigateToReviews }) => {
  const [onlyDeleted, setOnlyDeleted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Unified Query: Fetches places passing onlyDeleted flag explicitly
  const { data, isLoading } = usePlacesQuery({ onlyDeleted, limit: 1000 });
  const { mutateAsync: addPlace, isPending } = useAddPlaceMutation();
  const { notif, setNotif, sendIfEnabled, resetNotif } = useNotificationDraft("place");

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
      const result = await addPlace(formData);
      await sendIfEnabled({ serviceId: result?.place?._id || result?._id });
      toast.success("Destination created successfully!");
      setShowModal(false);
      setPhotoFile(null);
      setVideoFile(null);
      resetNotif();
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
              <PlaceCard
                key={place._id}
                place={place}
                onNavigateToReviews={onNavigateToReviews}
              />
            ))}
          </div>
        )}
      </div>

      {/* CREATE DESTINATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-100">
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                  <MapPin size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Create Destination Record
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Add a tourist spot, heritage site, or landmark to BUXplore
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
              <RequiredNotice />

              {/* SECTION 1: Basic Information */}
              <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  1. General Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <FormField
                      label="Destination Name"
                      required
                      error={fieldErrors.name?.error}
                      hint={fieldErrors.name?.hint || "e.g. Jhansi Fort"}
                      touched={touched.name}
                      valid={touched.name && !fieldErrors.name}
                    >
                      <input
                        name="name"
                        value={form.name}
                        placeholder="e.g. Jhansi Fort"
                        onChange={handleChangeValidated}
                        onBlur={handleBlur}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition outline-hidden"
                      />
                    </FormField>
                  </div>

                  <div className="sm:col-span-1">
                    <FormField label="Category" required hint="Select a category">
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleChangeValidated}
                        onBlur={handleBlur}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition outline-hidden"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <FormField
                      label="City"
                      required
                      error={fieldErrors.city?.error}
                      touched={touched.city}
                      valid={touched.city && !fieldErrors.city}
                    >
                      <input
                        name="city"
                        value={form.city}
                        defaultValue="Jhansi"
                        onChange={handleChangeValidated}
                        onBlur={handleBlur}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition outline-hidden"
                      />
                    </FormField>
                  </div>

                  <div className="sm:col-span-2">
                    <FormField
                      label="YouTube Video Link"
                      optional
                      error={fieldErrors.ytVideoLink?.error}
                      hint={fieldErrors.ytVideoLink?.hint || "e.g. https://youtube.com/watch?v=..."}
                      touched={touched.ytVideoLink}
                      valid={touched.ytVideoLink && !fieldErrors.ytVideoLink}
                    >
                      <input
                        name="ytVideoLink"
                        value={form.ytVideoLink}
                        placeholder="https://youtube.com/watch?v=..."
                        onChange={handleChangeValidated}
                        onBlur={handleBlur}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm text-blue-600 border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition outline-hidden"
                      />
                    </FormField>
                  </div>
                </div>

                <FormField
                  label="Description"
                  required
                  error={fieldErrors.description?.error}
                  touched={touched.description}
                  valid={touched.description && !fieldErrors.description}
                >
                  <textarea
                    name="description"
                    value={form.description}
                    placeholder="Provide a detailed description of the history, significance, and highlights of this destination..."
                    onChange={handleChangeValidated}
                    onBlur={handleBlur}
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition outline-hidden resize-none"
                  />
                </FormField>
              </div>

              {/* SECTION 2: Location & Coordinates */}
              <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  2. Location & Coordinates
                </h3>

                <FormField
                  label="Street Address / Landmark"
                  required
                  error={fieldErrors.address?.error}
                  touched={touched.address}
                  valid={touched.address && !fieldErrors.address}
                >
                  <input
                    name="address"
                    value={form.address}
                    placeholder="e.g. Fort Road, Near Civil Lines, Jhansi"
                    onChange={handleChangeValidated}
                    onBlur={handleBlur}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition outline-hidden"
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Latitude"
                    required
                    error={fieldErrors.lat?.error}
                    hint={fieldErrors.lat?.hint || "e.g. 25.4484"}
                    touched={touched.lat}
                    valid={touched.lat && !fieldErrors.lat}
                  >
                    <input
                      type="number"
                      step="any"
                      name="lat"
                      value={form.lat}
                      placeholder="25.4484"
                      onChange={handleChangeValidated}
                      onBlur={handleBlur}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono border border-slate-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition outline-hidden"
                    />
                  </FormField>

                  <FormField
                    label="Longitude"
                    required
                    error={fieldErrors.lng?.error}
                    hint={fieldErrors.lng?.hint || "e.g. 78.5685"}
                    touched={touched.lng}
                    valid={touched.lng && !fieldErrors.lng}
                  >
                    <input
                      type="number"
                      step="any"
                      name="lng"
                      value={form.lng}
                      placeholder="78.5685"
                      onChange={handleChangeValidated}
                      onBlur={handleBlur}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono border border-slate-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition outline-hidden"
                    />
                  </FormField>
                </div>
              </div>

              {/* SECTION 3: Media Uploads */}
              <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  3. Media & Assets
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Photo Dropzone */}
                  <div className="border-2 border-dashed border-blue-200 hover:border-blue-400 p-5 rounded-2xl text-center bg-blue-50/40 hover:bg-blue-50 transition cursor-pointer flex flex-col items-center justify-center">
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
                      className="cursor-pointer w-full text-xs font-bold text-blue-700 flex flex-col items-center justify-center gap-2"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <UploadCloud size={20} />
                      </div>
                      {photoFile ? (
                        <div className="space-y-1">
                          <p className="font-bold text-emerald-700">✓ Photo Selected</p>
                          <p className="text-[11px] text-slate-600 truncate max-w-[200px]">{photoFile.name}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-bold">Upload Place Photo <Req /></p>
                          <p className="text-[10px] text-slate-400 font-normal mt-0.5">JPG, PNG, WebP up to 10MB (1 Max)</p>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Video Dropzone */}
                  <div className="border-2 border-dashed border-purple-200 hover:border-purple-400 p-5 rounded-2xl text-center bg-purple-50/40 hover:bg-purple-50 transition cursor-pointer flex flex-col items-center justify-center">
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
                      className="cursor-pointer w-full text-xs font-bold text-purple-700 flex flex-col items-center justify-center gap-2"
                    >
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                        <UploadCloud size={20} />
                      </div>
                      {videoFile ? (
                        <div className="space-y-1">
                          <p className="font-bold text-emerald-700">✓ Video Selected</p>
                          <p className="text-[11px] text-slate-600 truncate max-w-[200px]">{videoFile.name}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-bold">Upload Place Video <Req /></p>
                          <p className="text-[10px] text-slate-400 font-normal mt-0.5">MP4, WebM up to 50MB (1 Max)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Push Notification Broadcast */}
              <NotificationDraftSection
                serviceType="place"
                entityName={form.name}
                value={notif}
                onChange={setNotif}
              />

              {/* Upload Progress Indicator when uploading */}
              {isPending && (
                <div className="pt-2">
                  <UploadProgressBar isUploading={isPending} />
                </div>
              )}
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 z-20 flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={isPending}
                className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl font-bold text-sm shadow-md transition disabled:bg-blue-300 flex items-center gap-2 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Uploading Assets...</span>
                  </>
                ) : (
                  <span>Save Destination</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Places;