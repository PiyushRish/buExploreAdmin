import React, { useState, useContext } from "react";
import { MapPin, Plus, UploadCloud } from "lucide-react";
import { PlaceContext } from "../contextApi/places.jsx";
import RestaurantDetails from "./RestaurantDetails.jsx";
import { useRestaurantsQuery } from "../queries/restaurantQueries.js";
import { useAddRestaurantMutation } from "../mutations/restaurantMutation.js";
import toast from "react-hot-toast";
import { Req, RequiredNotice } from "../components/RequiredTag.jsx";
import FormField from "../components/FormField.jsx";
import { validators, runValidators, validateMediaType } from "../utils/validators.js";

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
      await addRestaurantMutation.mutateAsync(formData);
      toast.success("Restaurant added successfully!");
      setShowModal(false);
      setPhotoFiles([]);
      setForm({ title: "", location: "", subCategory: "Restaurants", rating: "", timings: "", averageCost: "", phone: "", email: "", website: "", description: "", cuisine: "" });
      setTouched({});
      setFieldErrors({});
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Add Dining Location</h2>
              <button className="text-gray-500 hover:text-black" onClick={()=> setShowModal(false)}>Close</button>
            </div>

            <RequiredNotice />

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Restaurant Title" required error={fieldErrors.title?.error} hint={fieldErrors.title?.hint || "e.g. The Spicy Spoon"} touched={touched.title} valid={touched.title && !fieldErrors.title}>
                <input name="title" placeholder="Restaurant Title" value={form.title} onChange={handleChange} onBlur={handleBlur} className="w-full border p-2 rounded" />
              </FormField>
              <FormField label="Location / Address" required error={fieldErrors.location?.error} hint={fieldErrors.location?.hint || "e.g. Main Street"} touched={touched.location} valid={touched.location && !fieldErrors.location}>
                <input name="location" placeholder="Location/Address" value={form.location} onChange={handleChange} onBlur={handleBlur} className="w-full border p-2 rounded" />
              </FormField>
              
              <FormField label="Category" optional hint="Type of dining">
                <select name="subCategory" value={form.subCategory} onChange={handleChange} onBlur={handleBlur} className="w-full border p-2 rounded">
                  <option value="Restaurants">Restaurants</option>
                  <option value="Cafes">Cafes</option>
                  <option value="Bars">Bars</option>
                  <option value="Fast Food">Fast Food</option>
                </select>
              </FormField>

              <FormField label="Timings" optional hint="e.g. 9 AM - 11 PM">
                <input name="timings" placeholder="e.g. 9 AM - 11 PM" value={form.timings} onChange={handleChange} onBlur={handleBlur} className="w-full border p-2 rounded" />
              </FormField>
              <FormField label="Rating" optional error={fieldErrors.rating?.error} hint={fieldErrors.rating?.hint || "0.0 - 5.0"} touched={touched.rating} valid={touched.rating && !fieldErrors.rating}>
                <input type="number" step="0.1" name="rating" placeholder="0.0 - 5.0" value={form.rating} onChange={handleChange} onBlur={handleBlur} className="w-full border p-2 rounded" />
              </FormField>
              <FormField label="Average Cost" optional error={fieldErrors.averageCost?.error} hint={fieldErrors.averageCost?.hint || "Average Cost ($)"} touched={touched.averageCost} valid={touched.averageCost && !fieldErrors.averageCost}>
                <input type="number" name="averageCost" placeholder="Average Cost ($)" value={form.averageCost} onChange={handleChange} onBlur={handleBlur} className="w-full border p-2 rounded" />
              </FormField>

              <FormField label="Contact Phone" required error={fieldErrors.phone?.error} hint={fieldErrors.phone?.hint || "Contact Phone"} touched={touched.phone} valid={touched.phone && !fieldErrors.phone}>
                <input name="phone" placeholder="Contact Phone" value={form.phone} onChange={handleChange} onBlur={handleBlur} className="w-full border p-2 rounded" />
              </FormField>
              <FormField label="Contact Email" optional error={fieldErrors.email?.error} hint={fieldErrors.email?.hint || "Contact Email"} touched={touched.email} valid={touched.email && !fieldErrors.email}>
                <input name="email" placeholder="Contact Email" value={form.email} onChange={handleChange} onBlur={handleBlur} className="w-full border p-2 rounded" />
              </FormField>
            </div>

            <FormField label="Website URL" optional error={fieldErrors.website?.error} hint={fieldErrors.website?.hint || "https://..."} touched={touched.website} valid={touched.website && !fieldErrors.website}>
              <input name="website" placeholder="https://..." value={form.website} onChange={handleChange} onBlur={handleBlur} className="w-full border p-2 rounded" />
            </FormField>
            <FormField label="Cuisine" optional hint="Comma separated, e.g. Italian, Mexican">
              <input name="cuisine" placeholder="Comma separated, e.g. Italian, Mexican" value={form.cuisine} onChange={handleChange} onBlur={handleBlur} className="w-full border p-2 rounded" />
            </FormField>
            <FormField label="Description" optional hint="Description">
              <textarea name="description" placeholder="Description" rows={3} value={form.description} onChange={handleChange} onBlur={handleBlur} className="w-full border p-2 rounded" />
            </FormField>

            <div className="border border-dashed border-gray-300 p-4 rounded-xl text-center bg-gray-50 flex items-center justify-center">
              <input type="file" multiple accept="image/*" id="restPhoto" onChange={(e) => {
                const files = Array.from(e.target.files).slice(0, 4);
                for (let f of files) {
                  const v = validateMediaType(f, 'image');
                  if (v !== true) return toast.error(v);
                }
                setPhotoFiles(files);
              }} className="hidden" />
              <label htmlFor="restPhoto" className="cursor-pointer text-sm font-bold text-orange-600 flex items-center gap-2">
                <UploadCloud size={20} />
                {photoFiles.length > 0 ? `${photoFiles.length} Photos Selected (Max 4)` : <span>Upload Cover Photos <Req /> (Max 4)</span>}
              </label>
            </div>

            <button onClick={handleSubmit} className="w-full bg-orange-600 hover:bg-orange-700 transition-colors text-white py-3 rounded-xl font-bold mt-4">Create Entity</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Restaurants;