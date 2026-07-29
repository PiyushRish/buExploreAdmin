import React, { useState, useContext } from "react";
import { MapPin, Plus, ArrowLeft, UploadCloud, X } from "lucide-react";
import { PlaceContext } from "../contextApi/places.jsx";
import HotelDetails from "./HotelDetails.jsx";
import { useHotelsQuery } from "../queries/hotelQueries.js";
import { useAddHotelMutation } from "../mutations/hotelMutation.js";
import toast from "react-hot-toast";
import { Req, RequiredNotice } from "../components/RequiredTag.jsx";
import FormField from "../components/FormField.jsx";
import { validators, runValidators, validateMediaType } from "../utils/validators.js";

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
      await addHotelMutation.mutateAsync(formData);
      toast.success("Property added successfully!");
      setShowModal(false);
      setPhotoFiles([]);
      setForm({ title: "", location: "", priceRange: "", subCategory: "Hotels", rating: "", distanceFromCenter: "", phone: "", email: "", website: "", description: "", amenities: "", roomTypes: "" });
      setTouched({});
      setFieldErrors({});
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-bold text-gray-900">Add Property (Hotel / Resort)</h2>
              <button className="text-gray-400 hover:text-gray-700" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Required notice */}
            <RequiredNotice />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Property Title" required error={fieldErrors.title?.error} hint={fieldErrors.title?.hint || "e.g. Grand Palace Hotel"} touched={touched.title} valid={touched.title && !fieldErrors.title}>
                <input name="title" placeholder="e.g. Grand Palace Hotel" value={form.title} onChange={handleChange} onBlur={handleBlur} className="w-full p-2.5 rounded-xl text-sm" />
              </FormField>
              <FormField label="Location / City" required error={fieldErrors.location?.error} hint={fieldErrors.location?.hint || "e.g. Jhansi, UP"} touched={touched.location} valid={touched.location && !fieldErrors.location}>
                <input name="location" placeholder="e.g. Jhansi, UP" value={form.location} onChange={handleChange} onBlur={handleBlur} className="w-full p-2.5 rounded-xl text-sm" />
              </FormField>
              <FormField label="Contact Phone" required error={fieldErrors.phone?.error} hint={fieldErrors.phone?.hint || "+91 98765 43210"} touched={touched.phone} valid={touched.phone && !fieldErrors.phone}>
                <input name="phone" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} onBlur={handleBlur} className="w-full p-2.5 rounded-xl text-sm" />
              </FormField>
              <FormField label="Category" optional hint="Type of property">
                <select name="subCategory" value={form.subCategory} onChange={handleChange} onBlur={handleBlur} className="w-full p-2.5 rounded-xl text-sm bg-white">
                  <option value="Hotels">Hotels</option>
                  <option value="Resorts">Resorts</option>
                  <option value="Guest Houses">Guest Houses</option>
                </select>
              </FormField>
              <FormField label="Price Range" optional error={fieldErrors.priceRange?.error} hint={fieldErrors.priceRange?.hint || "e.g. ₹2000 - ₹5000 / night"} touched={touched.priceRange} valid={touched.priceRange && !fieldErrors.priceRange}>
                <input name="priceRange" placeholder="e.g. ₹2000 - ₹5000 / night" value={form.priceRange} onChange={handleChange} onBlur={handleBlur} className="w-full p-2.5 rounded-xl text-sm" />
              </FormField>
              <FormField label="Rating (0–5)" optional error={fieldErrors.rating?.error} hint={fieldErrors.rating?.hint || "e.g. 4.5"} touched={touched.rating} valid={touched.rating && !fieldErrors.rating}>
                <input type="number" step="0.1" min="0" max="5" name="rating" placeholder="4.5" value={form.rating} onChange={handleChange} onBlur={handleBlur} className="w-full p-2.5 rounded-xl text-sm" />
              </FormField>
              <FormField label="Distance from Centre (km)" optional error={fieldErrors.distanceFromCenter?.error} hint={fieldErrors.distanceFromCenter?.hint || "e.g. 2.5"} touched={touched.distanceFromCenter} valid={touched.distanceFromCenter && !fieldErrors.distanceFromCenter}>
                <input type="number" step="0.1" name="distanceFromCenter" placeholder="2.5" value={form.distanceFromCenter} onChange={handleChange} onBlur={handleBlur} className="w-full p-2.5 rounded-xl text-sm" />
              </FormField>
              <FormField label="Contact Email" optional error={fieldErrors.email?.error} hint={fieldErrors.email?.hint || "hotel@example.com"} touched={touched.email} valid={touched.email && !fieldErrors.email}>
                <input name="email" placeholder="hotel@example.com" value={form.email} onChange={handleChange} onBlur={handleBlur} className="w-full p-2.5 rounded-xl text-sm" />
              </FormField>
            </div>

            <FormField label="Website URL" optional error={fieldErrors.website?.error} hint={fieldErrors.website?.hint || "https://hotel.com"} touched={touched.website} valid={touched.website && !fieldErrors.website}>
              <input name="website" placeholder="https://hotel.com" value={form.website} onChange={handleChange} onBlur={handleBlur} className="w-full p-2.5 rounded-xl text-sm text-blue-600" />
            </FormField>
            <FormField label="Amenities" optional hint="Comma separated, e.g. Pool, WiFi, Gym, Spa">
              <input name="amenities" placeholder="Pool, WiFi, Gym, Spa" value={form.amenities} onChange={handleChange} onBlur={handleBlur} className="w-full p-2.5 rounded-xl text-sm" />
            </FormField>
            <FormField label="Room Types" optional hint="Comma separated, e.g. Single, Double, Suite">
              <input name="roomTypes" placeholder="Single, Double, Suite" value={form.roomTypes} onChange={handleChange} onBlur={handleBlur} className="w-full p-2.5 rounded-xl text-sm" />
            </FormField>
            <FormField label="Description" optional hint="Describe the property...">
              <textarea name="description" placeholder="Describe the property..." rows={3} value={form.description} onChange={handleChange} onBlur={handleBlur} className="w-full p-2.5 rounded-xl text-sm resize-none" />
            </FormField>

            <div className="border-2 border-dashed border-blue-200 p-4 rounded-xl text-center bg-blue-50">
              <input type="file" multiple accept="image/*" id="hotelPhoto" onChange={(e) => {
                const files = Array.from(e.target.files).slice(0, 4);
                for (let f of files) {
                  const v = validateMediaType(f, 'image');
                  if (v !== true) return toast.error(v);
                }
                setPhotoFiles(files);
              }} className="hidden" />
              <label htmlFor="hotelPhoto" className="cursor-pointer text-sm font-bold text-blue-600 flex items-center justify-center gap-2">
                <UploadCloud size={20} />
                {photoFiles.length > 0 ? `${photoFiles.length} Photo(s) Selected` : (
                  <span>Upload Cover Photos <Req /> <span className="text-blue-400 font-normal">(Max 4)</span></span>
                )}
              </label>
            </div>

            <button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white py-3 rounded-xl font-bold text-sm shadow-md">
              Create Property
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hotels;