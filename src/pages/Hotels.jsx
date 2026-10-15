import React, { useState, useContext } from "react";
import { MapPin, Plus, ArrowLeft, UploadCloud, X, Building, Loader2 } from "lucide-react";
import { PlaceContext } from "../contextApi/places.jsx";
import HotelDetails from "./HotelDetails.jsx";
import { useHotelsQuery } from "../queries/hotelQueries.js";
import { useAddHotelMutation } from "../mutations/hotelMutation.js";
import toast from "react-hot-toast";
import { Req, RequiredNotice } from "../components/RequiredTag.jsx";
import FormField from "../components/FormField.jsx";
import { validators, runValidators, validateMediaType } from "../utils/validators.js";
import NotificationDraftSection from "../components/NotificationDraftSection.jsx";
import { useNotificationDraft } from "../utils/useNotificationDraft.js";
import UploadProgressBar from "../components/UploadProgressBar.jsx";

const HotelCard = ({ hotel }) => {
  const { setClickedPlaceHandler } = useContext(PlaceContext);
  const displayImage = hotel?.photos?.[0]?.url || hotel?.photos?.[0] || "https://via.placeholder.com/400x300?text=No+Image";

  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden border flex flex-col cursor-pointer group"
      onClick={() => setClickedPlaceHandler(hotel)}
    >
      <div className="relative h-56 bg-gray-900">
        <img src={displayImage} alt={hotel?.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-xl">{hotel?.title}</h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
            {hotel?.subCategory}
          </span>
        </div>
        <p className="text-gray-500 text-sm mt-1 flex items-center">
          <MapPin size={14} className="mr-1"/> {hotel?.location}
        </p>
      </div>
    </div>
  );
};

const Hotels = () => {
  const { data, isLoading, isError } = useHotelsQuery();
  const { clickedPlace } = useContext(PlaceContext);
  const addHotelMutation = useAddHotelMutation();
  const { notif, setNotif, sendIfEnabled, resetNotif } = useNotificationDraft("hotel");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ 
    title: "", location: "", priceRange: "", subCategory: "Hotels", 
    rating: "", distanceFromCenter: "", 
    phone: "", email: "", website: "", 
    description: "", amenities: "", roomTypes: "" 
  });
  
  const [photoFiles, setPhotoFiles] = useState([]);

  const RULES = {
    title: [validators.required],
    location: [validators.required],
    phone: [validators.required, validators.phone],
    email: [validators.email],
    website: [validators.url],
    priceRange: [],
    rating: [validators.number({ min: 0, max: 5 })],
    distanceFromCenter: [validators.number({ min: 0 })],
  };

  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = (name, value) => {
    const rules = RULES[name];
    if (!rules) return null;
    return runValidators(value, rules, name);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFieldErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleSubmit = async () => {
    const requiredFields = ["title", "location", "phone"];
    const optionalFields = ["email", "website", "priceRange", "rating", "distanceFromCenter", "subCategory", "description", "amenities", "roomTypes"];
    const allFields = [...requiredFields, ...optionalFields];

    const newTouched = {};
    const newErrors = {};
    let hasError = false;

    allFields.forEach((field) => {
      newTouched[field] = true;
      const error = validate(field, form[field] || "");
      newErrors[field] = error;
      if (error) hasError = true;
    });

    setTouched(newTouched);
    setFieldErrors(newErrors);

    if (hasError || photoFiles.length === 0) {
      if (photoFiles.length === 0) toast.error("Photo is required");
      toast.error("Please fix the highlighted errors before submitting.");
      return;
    }

    const payload = {
      title: form.title,
      location: form.location,
      subCategory: form.subCategory,
      priceRange: form.priceRange,
      rating: Number(form.rating),
      distanceFromCenter: Number(form.distanceFromCenter),
      description: form.description,
      contact: JSON.stringify({
        phone: form.phone,
        email: form.email,
        website: form.website
      }),
      amenities: JSON.stringify(form.amenities.split(',').map(i=>i.trim()).filter(Boolean)),
      roomTypes: JSON.stringify(form.roomTypes.split(',').map(i=>i.trim()).filter(Boolean))
    };

    const formData = new FormData();
    Object.keys(payload).forEach((k) => formData.append(k, payload[k]));
    photoFiles.forEach(file => formData.append("HotelPhotos", file));

    try {
      const result = await addHotelMutation.mutateAsync(formData);
      await sendIfEnabled({ serviceId: result?.hotel?._id || result?._id });
      toast.success("Property added successfully!");
      setShowModal(false);
      setPhotoFiles([]);
      setForm({ title: "", location: "", priceRange: "", subCategory: "Hotels", rating: "", distanceFromCenter: "", phone: "", email: "", website: "", description: "", amenities: "", roomTypes: "" });
      setTouched({});
      setFieldErrors({});
      resetNotif();
    } catch(err) {
      toast.error(err?.response?.data?.message || "Failed to add property");
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen font-semibold">Loading Hotels...</div>;
  if (isError) return <div className="flex justify-center items-center h-screen text-red-500">Failed to load hotels.</div>;
  if (clickedPlace) return <HotelDetails />;

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Accommodations</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 shadow-md w-full sm:w-auto justify-center"
          >
            <Plus size={18} /> Add Property
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {(data?.hotels || []).map((h) => <HotelCard key={h._id} hotel={h} />)}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100">
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 flex justify-between items-center px-6 py-4 bg-white/95 backdrop-blur border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                  <Building size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Add Property (Hotel / Resort)</h2>
                  <p className="text-xs text-slate-500 font-medium">List a new stay, resort suite, or guest house on BUXplore</p>
                </div>
              </div>
              <button
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
              <RequiredNotice />

              {/* SECTION 1: Basic Property Details */}
              <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  1. Property Overview
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <FormField label="Property Title" required error={fieldErrors.title?.error} hint={fieldErrors.title?.hint || "e.g. Grand Palace Hotel"} touched={touched.title} valid={touched.title && !fieldErrors.title}>
                      <input name="title" placeholder="e.g. Grand Palace Hotel" value={form.title} onChange={handleChange} onBlur={handleBlur} className="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition outline-hidden" />
                    </FormField>
                  </div>

                  <div className="sm:col-span-1">
                    <FormField label="Category" optional hint="Type of property">
                      <select name="subCategory" value={form.subCategory} onChange={handleChange} onBlur={handleBlur} className="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition outline-hidden">
                        <option value="Hotels">Hotels</option>
                        <option value="Resorts">Resorts</option>
                        <option value="Guest Houses">Guest Houses</option>
                      </select>
                    </FormField>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <FormField label="Location / City" required error={fieldErrors.location?.error} hint={fieldErrors.location?.hint || "e.g. Jhansi, UP"} touched={touched.location} valid={touched.location && !fieldErrors.location}>
                      <input name="location" placeholder="e.g. Jhansi, UP" value={form.location} onChange={handleChange} onBlur={handleBlur} className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition outline-hidden" />
                    </FormField>
                  </div>

                  <div className="sm:col-span-1">
                    <FormField label="Distance from Centre (km)" optional error={fieldErrors.distanceFromCenter?.error} hint={fieldErrors.distanceFromCenter?.hint || "e.g. 2.5"} touched={touched.distanceFromCenter} valid={touched.distanceFromCenter && !fieldErrors.distanceFromCenter}>
                      <input type="number" step="0.1" name="distanceFromCenter" placeholder="2.5" value={form.distanceFromCenter} onChange={handleChange} onBlur={handleBlur} className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition outline-hidden font-mono" />
                    </FormField>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Pricing & Metrics */}
              <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  2. Pricing & Guest Rating
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <FormField label="Price Range" optional error={fieldErrors.priceRange?.error} hint={fieldErrors.priceRange?.hint || "e.g. ₹2000 - ₹5000 / night"} touched={touched.priceRange} valid={touched.priceRange && !fieldErrors.priceRange}>
                      <input name="priceRange" placeholder="e.g. ₹2000 - ₹5000 / night" value={form.priceRange} onChange={handleChange} onBlur={handleBlur} className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition outline-hidden" />
                    </FormField>
                  </div>

                  <div className="sm:col-span-1">
                    <FormField label="Rating (0–5)" optional error={fieldErrors.rating?.error} hint={fieldErrors.rating?.hint || "e.g. 4.5"} touched={touched.rating} valid={touched.rating && !fieldErrors.rating}>
                      <input type="number" step="0.1" min="0" max="5" name="rating" placeholder="4.5" value={form.rating} onChange={handleChange} onBlur={handleBlur} className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition outline-hidden font-mono" />
                    </FormField>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Contact & Links */}
              <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  3. Contact & Web Presence
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField label="Contact Phone" required error={fieldErrors.phone?.error} hint={fieldErrors.phone?.hint || "+91 98765 43210"} touched={touched.phone} valid={touched.phone && !fieldErrors.phone}>
                    <input name="phone" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} onBlur={handleBlur} className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition outline-hidden" />
                  </FormField>

                  <FormField label="Contact Email" optional error={fieldErrors.email?.error} hint={fieldErrors.email?.hint || "hotel@example.com"} touched={touched.email} valid={touched.email && !fieldErrors.email}>
                    <input name="email" placeholder="hotel@example.com" value={form.email} onChange={handleChange} onBlur={handleBlur} className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition outline-hidden" />
                  </FormField>

                  <FormField label="Website URL" optional error={fieldErrors.website?.error} hint={fieldErrors.website?.hint || "https://hotel.com"} touched={touched.website} valid={touched.website && !fieldErrors.website}>
                    <input name="website" placeholder="https://hotel.com" value={form.website} onChange={handleChange} onBlur={handleBlur} className="w-full px-3.5 py-2.5 rounded-xl text-sm text-blue-600 border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition outline-hidden" />
                  </FormField>
                </div>
              </div>

              {/* SECTION 4: Features & Description */}
              <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  4. Amenities & Rooms
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Amenities" optional hint="Comma separated, e.g. Pool, WiFi, Gym, Spa">
                    <input name="amenities" placeholder="Pool, WiFi, Gym, Spa" value={form.amenities} onChange={handleChange} onBlur={handleBlur} className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition outline-hidden" />
                  </FormField>
                  <FormField label="Room Types" optional hint="Comma separated, e.g. Single, Double, Deluxe Suite">
                    <input name="roomTypes" placeholder="Single, Double, Suite" value={form.roomTypes} onChange={handleChange} onBlur={handleBlur} className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition outline-hidden" />
                  </FormField>
                </div>

                <FormField label="Description" optional hint="Describe property highlights, check-in rules, etc.">
                  <textarea name="description" placeholder="Describe the property, view, ambiance, and guest facilities..." rows={3} value={form.description} onChange={handleChange} onBlur={handleBlur} className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition outline-hidden resize-none" />
                </FormField>
              </div>

              {/* SECTION 5: Visual Gallery */}
              <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                  5. Cover Photos
                </h3>

                <div className="border-2 border-dashed border-blue-200 hover:border-blue-400 p-5 rounded-2xl text-center bg-blue-50/40 hover:bg-blue-50 transition cursor-pointer flex flex-col items-center justify-center">
                  <input type="file" multiple accept="image/*" id="hotelPhoto" onChange={(e) => {
                    const files = Array.from(e.target.files).slice(0, 4);
                    for (let f of files) {
                      const v = validateMediaType(f, 'image');
                      if (v !== true) return toast.error(v);
                    }
                    setPhotoFiles(files);
                  }} className="hidden" />
                  <label htmlFor="hotelPhoto" className="cursor-pointer w-full text-xs font-bold text-blue-700 flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <UploadCloud size={20} />
                    </div>
                    {photoFiles.length > 0 ? (
                      <div className="space-y-1">
                        <p className="font-bold text-emerald-700">✓ {photoFiles.length} Photo(s) Selected</p>
                        <p className="text-[11px] text-slate-500">Click to change selection (Max 4)</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-bold">Upload Cover Photos <Req /></p>
                        <p className="text-[10px] text-slate-400 font-normal mt-0.5">JPG, PNG, WebP up to 4 photos</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* SECTION 6: Push Notification Broadcast */}
              <NotificationDraftSection
                serviceType="hotel"
                entityName={form.title}
                value={notif}
                onChange={setNotif}
              />

              {addHotelMutation.isPending && (
                <div className="pt-2">
                  <UploadProgressBar isUploading={addHotelMutation.isPending} />
                </div>
              )}
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 z-20 flex justify-between items-center px-6 py-4 bg-white/95 backdrop-blur border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={addHotelMutation.isPending}
                className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={addHotelMutation.isPending}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl font-bold text-sm shadow-md transition disabled:bg-blue-300 flex items-center gap-2 cursor-pointer"
              >
                {addHotelMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Uploading Property Assets...</span>
                  </>
                ) : (
                  <span>Create Property</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hotels;