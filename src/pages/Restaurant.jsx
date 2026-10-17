import React, { useState, useContext } from "react";
import { MapPin, Plus, UploadCloud, X, Utensils, Loader2 } from "lucide-react";
import { PlaceContext } from "../contextApi/places.jsx";
import RestaurantDetails from "./RestaurantDetails.jsx";
import { useRestaurantsQuery } from "../queries/restaurantQueries.js";
import { useAddRestaurantMutation } from "../mutations/restaurantMutation.js";
import toast from "react-hot-toast";
import { Req, RequiredNotice } from "../components/RequiredTag.jsx";
import FormField from "../components/FormField.jsx";
import { validators, runValidators, validateMediaType } from "../utils/validators.js";
import NotificationDraftSection from "../components/NotificationDraftSection.jsx";
import { useNotificationDraft } from "../utils/useNotificationDraft.js";
import UploadProgressBar from "../components/UploadProgressBar.jsx";

const RestaurantCard = ({ restaurant }) => {
  const { setClickedPlaceHandler } = useContext(PlaceContext);
  const displayImage = restaurant?.photos?.[0]?.url || restaurant?.photos?.[0] || "https://via.placeholder.com/400x300?text=No+Image";

  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden border flex flex-col cursor-pointer group"
      onClick={() => setClickedPlaceHandler(restaurant)}
    >
      <div className="relative h-56 bg-gray-900">
        <img src={displayImage} alt={restaurant?.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-xl">{restaurant?.title}</h3>
          <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded">
            {restaurant?.subCategory}
          </span>
        </div>
        <p className="text-gray-500 text-sm mt-1 flex items-center">
          <MapPin size={14} className="mr-1"/> {restaurant?.location}
        </p>
      </div>
    </div>
  );
};

const Restaurants = () => {
  const { data, isLoading, isError } = useRestaurantsQuery();
  const { clickedPlace } = useContext(PlaceContext);
  const addRestaurantMutation = useAddRestaurantMutation();
  const { notif, setNotif, sendIfEnabled, resetNotif } = useNotificationDraft("restaurant");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ 
    title: "", location: "", subCategory: "Restaurants", 
    rating: "", timings: "", averageCost: "",
    phone: "", email: "", website: "", 
    description: "", cuisine: "" 
  });
  
  const [photoFiles, setPhotoFiles] = useState([]);

  const RULES = {
    title: [validators.required],
    location: [validators.required],
    phone: [validators.required, validators.phone],
    email: [validators.email],
    website: [validators.url],
    rating: [validators.number({ min: 0, max: 5 })],
    averageCost: [validators.number({ min: 0 })],
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
    const optionalFields = ["email", "website", "subCategory", "rating", "timings", "averageCost", "description", "cuisine"];
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
      rating: Number(form.rating),
      timings: form.timings,
      averageCost: Number(form.averageCost),
      description: form.description,
      contact: JSON.stringify({
        phone: form.phone,
        email: form.email,
        website: form.website
      }),
      cuisine: JSON.stringify(form.cuisine.split(',').map(i=>i.trim()).filter(Boolean)),
    };

    const formData = new FormData();
    Object.keys(payload).forEach((k) => formData.append(k, payload[k]));
    photoFiles.forEach(f => formData.append("RestaurantPhotos", f));

    try {
      const result = await addRestaurantMutation.mutateAsync(formData);
      await sendIfEnabled({ serviceId: result?.restaurant?._id || result?._id });
      toast.success("Restaurant added successfully!");
      setShowModal(false);
      setPhotoFiles([]);
      setForm({ title: "", location: "", subCategory: "Restaurants", rating: "", timings: "", averageCost: "", phone: "", email: "", website: "", description: "", cuisine: "" });
      setTouched({});
      setFieldErrors({});
      resetNotif();
    } catch(err) {
      toast.error(err?.response?.data?.message || "Failed to add restaurant");
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen font-semibold">Loading Restaurants...</div>;
  if (isError) return <div className="flex justify-center items-center h-screen text-red-500">Failed to load restaurants.</div>;
  if (clickedPlace) return <RestaurantDetails />;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
           <h1 className="text-3xl font-black text-gray-900">Dining & Nightlife</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(data?.restaurants || []).map((r) => <RestaurantCard key={r._id} restaurant={r} />)}
        </div>
      </div>

      <button onClick={() => setShowModal(true)} className="fixed bottom-8 right-8 bg-orange-600 text-white p-4 rounded-full shadow-lg hover:scale-105 transition-transform">
        <Plus size={28} />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100">
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 flex justify-between items-center px-6 py-4 bg-white/95 backdrop-blur border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-xs">
                  <Utensils size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Add Dining Location</h2>
                  <p className="text-xs text-slate-500 font-medium">List a restaurant, local cafe, bar, or eatery on BUXplore</p>
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

              {/* SECTION 1: Venue Profile */}
              <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-600"></span>
                  1. Venue Profile
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <FormField label="Restaurant Title" required error={fieldErrors.title?.error} hint={fieldErrors.title?.hint || "e.g. The Spicy Spoon"} touched={touched.title} valid={touched.title && !fieldErrors.title}>
                      <input name="title" placeholder="e.g. The Spicy Spoon" value={form.title} onChange={handleChange} onBlur={handleBlur} className="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-hidden" />
                    </FormField>
                  </div>

                  <div className="sm:col-span-1">
                    <FormField label="Category" optional hint="Type of dining">
                      <select name="subCategory" value={form.subCategory} onChange={handleChange} onBlur={handleBlur} className="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-hidden">
                        <option value="Restaurants">Restaurants</option>
                        <option value="Cafes">Cafes</option>
                        <option value="Bars">Bars</option>
                        <option value="Fast Food">Fast Food</option>
                      </select>
                    </FormField>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <FormField label="Location / Address" required error={fieldErrors.location?.error} hint={fieldErrors.location?.hint || "e.g. Main Street, Civil Lines"} touched={touched.location} valid={touched.location && !fieldErrors.location}>
                      <input name="location" placeholder="e.g. Main Street, Civil Lines" value={form.location} onChange={handleChange} onBlur={handleBlur} className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-hidden" />
                    </FormField>
                  </div>

                  <div className="sm:col-span-1">
                    <FormField label="Cuisine" optional hint="e.g. North Indian, Continental">
                      <input name="cuisine" placeholder="North Indian, Chinese" value={form.cuisine} onChange={handleChange} onBlur={handleBlur} className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-hidden" />
                    </FormField>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Dining Details & Pricing */}
              <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  2. Operations, Rating & Pricing
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField label="Operating Timings" optional hint="e.g. 10:00 AM - 11:00 PM">
                    <input name="timings" placeholder="e.g. 10:00 AM - 11:00 PM" value={form.timings} onChange={handleChange} onBlur={handleBlur} className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition outline-hidden" />
                  </FormField>

                  <FormField label="Rating (0.0 - 5.0)" optional error={fieldErrors.rating?.error} hint={fieldErrors.rating?.hint || "0.0 - 5.0"} touched={touched.rating} valid={touched.rating && !fieldErrors.rating}>
                    <input type="number" step="0.1" min="0" max="5" name="rating" placeholder="4.5" value={form.rating} onChange={handleChange} onBlur={handleBlur} className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition outline-hidden font-mono" />
                  </FormField>

                  <FormField label="Average Cost for Two (₹)" optional error={fieldErrors.averageCost?.error} hint={fieldErrors.averageCost?.hint || "e.g. 800"} touched={touched.averageCost} valid={touched.averageCost && !fieldErrors.averageCost}>
                    <input type="number" name="averageCost" placeholder="800" value={form.averageCost} onChange={handleChange} onBlur={handleBlur} className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition outline-hidden font-mono" />
                  </FormField>
                </div>
              </div>

              {/* SECTION 3: Contact Info & Online Presence */}
              <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  3. Contact & Online Presence
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField label="Contact Phone" required error={fieldErrors.phone?.error} hint={fieldErrors.phone?.hint || "+91 98765 43210"} touched={touched.phone} valid={touched.phone && !fieldErrors.phone}>
                    <input name="phone" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} onBlur={handleBlur} className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition outline-hidden" />
                  </FormField>

                  <FormField label="Contact Email" optional error={fieldErrors.email?.error} hint={fieldErrors.email?.hint || "dining@example.com"} touched={touched.email} valid={touched.email && !fieldErrors.email}>
                    <input name="email" placeholder="dining@example.com" value={form.email} onChange={handleChange} onBlur={handleBlur} className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition outline-hidden" />
                  </FormField>

                  <FormField label="Website / Menu URL" optional error={fieldErrors.website?.error} hint={fieldErrors.website?.hint || "https://restaurant.com"} touched={touched.website} valid={touched.website && !fieldErrors.website}>
                    <input name="website" placeholder="https://..." value={form.website} onChange={handleChange} onBlur={handleBlur} className="w-full px-3.5 py-2.5 rounded-xl text-sm text-blue-600 border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition outline-hidden" />
                  </FormField>
                </div>
              </div>

              {/* SECTION 4: Description */}
              <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  4. Venue Description
                </h3>

                <FormField label="Description" optional hint="Highlights, popular dishes, ambiance, outdoor seating...">
                  <textarea name="description" placeholder="Describe special dishes, music nights, family ambiance, chef specials..." rows={3} value={form.description} onChange={handleChange} onBlur={handleBlur} className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition outline-hidden resize-none" />
                </FormField>
              </div>

              {/* SECTION 5: Visual Gallery */}
              <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                  5. Cover Photos
                </h3>

                <div className="border-2 border-dashed border-orange-200 hover:border-orange-400 p-5 rounded-2xl text-center bg-orange-50/40 hover:bg-orange-50 transition cursor-pointer flex flex-col items-center justify-center">
                  <input type="file" multiple accept="image/*" id="restPhoto" onChange={(e) => {
                    const files = Array.from(e.target.files).slice(0, 4);
                    for (let f of files) {
                      const v = validateMediaType(f, 'image');
                      if (v !== true) return toast.error(v);
                    }
                    setPhotoFiles(files);
                  }} className="hidden" />
                  <label htmlFor="restPhoto" className="cursor-pointer w-full text-xs font-bold text-orange-700 flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
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
                serviceType="restaurant"
                entityName={form.title}
                value={notif}
                onChange={setNotif}
              />

              {addRestaurantMutation.isPending && (
                <div className="pt-2">
                  <UploadProgressBar isUploading={addRestaurantMutation.isPending} />
                </div>
              )}
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 z-20 flex justify-between items-center px-6 py-4 bg-white/95 backdrop-blur border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={addRestaurantMutation.isPending}
                className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={addRestaurantMutation.isPending}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 active:scale-98 text-white rounded-xl font-bold text-sm shadow-md transition disabled:bg-orange-300 flex items-center gap-2 cursor-pointer"
              >
                {addRestaurantMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Uploading Venue Assets...</span>
                  </>
                ) : (
                  <span>Create Dining Venue</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Restaurants;