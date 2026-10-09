import React, { useState, useContext } from "react";
import { Car, Plus, UploadCloud, X } from "lucide-react";
import { PlaceContext } from "../contextApi/places.jsx";
import VehicleDetails from "./VehicleDetails.jsx";
import { useVehiclesQuery } from "../queries/vehicleQueries.js";
import { useAddVehicleMutation } from "../mutations/vehicleMutation.js";
import toast from "react-hot-toast";
import { Req, RequiredNotice } from "../components/RequiredTag.jsx";
import FormField from "../components/FormField.jsx";
import { validators, runValidators, validateMediaType } from "../utils/validators.js";
import NotificationDraftSection from "../components/NotificationDraftSection.jsx";
import { useNotificationDraft } from "../utils/useNotificationDraft.js";

const VehicleCard = ({ vehicle }) => {
  const { setClickedPlaceHandler } = useContext(PlaceContext);
  const displayImage = vehicle?.photos?.[0]?.url || vehicle?.photos?.[0] || "https://via.placeholder.com/400x300?text=No+Image";

  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden border flex flex-col cursor-pointer group"
      onClick={() => setClickedPlaceHandler(vehicle)}
    >
      <div className="relative h-56 bg-gray-900 border-b">
        <img src={displayImage} alt={vehicle?.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-xl">{vehicle?.title}</h3>
          <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">
            {vehicle?.subCategory}
          </span>
        </div>
        <p className="text-gray-500 text-sm mt-1 flex items-center">
          <Car size={14} className="mr-1"/> {vehicle?.vehicleType} • {vehicle?.seats} Seats
        </p>
      </div>
    </div>
  );
};

const Vehicles = () => {
  const { data, isLoading, isError } = useVehiclesQuery();
  const { clickedPlace } = useContext(PlaceContext);
  const addMutation = useAddVehicleMutation();
  const { notif, setNotif, sendIfEnabled, resetNotif } = useNotificationDraft("vehicle");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ 
    title: "", subCategory: "Car Rentals", vehicleType: "", 
    seats: "", price: "", transmissionType: "", fuelType: "",
    phone: "", email: "", website: "", description: ""
  });
  
  const [photoFiles, setPhotoFiles] = useState([]);

  const RULES = {
    title: [validators.required],
    phone: [validators.required, validators.phone],
    email: [validators.email],
    website: [validators.url],
    seats: [validators.number({ min: 1 })],
    price: [validators.number({ min: 0 })],
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
    const requiredFields = ["title", "phone"];
    const optionalFields = ["email", "website", "subCategory", "vehicleType", "seats", "price", "transmissionType", "fuelType", "description"];
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
      subCategory: form.subCategory,
      vehicleType: form.vehicleType,
      seats: Number(form.seats || 4),
      price: Number(form.price || 0),
      transmissionType: form.transmissionType,
      fuelType: form.fuelType,
      description: form.description,
      contact: JSON.stringify({
        phone: form.phone,
        email: form.email,
        website: form.website
      }),
    };

    const formData = new FormData();
    Object.keys(payload).forEach((k) => formData.append(k, payload[k]));
    photoFiles.forEach(f => formData.append("VehiclePhotos", f));

    try {
      const result = await addMutation.mutateAsync(formData);
      await sendIfEnabled({ serviceId: result?.vehicle?._id || result?._id });
      toast.success("Vehicle added successfully!");
      setShowModal(false);
      setPhotoFiles([]);
      setForm({ title: "", subCategory: "Car Rentals", vehicleType: "", seats: "", price: "", transmissionType: "", fuelType: "", phone: "", email: "", website: "", description: "" });
      setTouched({});
      setFieldErrors({});
      resetNotif();
    } catch(err) {
      toast.error(err?.response?.data?.message || "Failed to add vehicle");
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen font-semibold">Loading Vehicles...</div>;
  if (isError) return <div className="flex justify-center items-center h-screen text-red-500">Failed to load vehicles.</div>;
  if (clickedPlace) return <VehicleDetails />;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
           <h1 className="text-3xl font-black text-gray-900">Vehicle Rentals</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(data?.vehicles || []).map((v) => <VehicleCard key={v._id} vehicle={v} />)}
        </div>
      </div>

      <button onClick={() => setShowModal(true)} className="fixed bottom-8 right-8 bg-red-600 text-white p-4 rounded-full shadow-lg hover:scale-105 transition-transform">
        <Plus size={28} />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100">
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 flex justify-between items-center px-6 py-4 bg-white/95 backdrop-blur border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shadow-xs">
                  <Car size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Add Rental Vehicle</h2>
                  <p className="text-xs text-slate-500 font-medium">List a car rental, tourist bus, cab, or EV service on BUXplore</p>
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

              {/* SECTION 1: Vehicle Identity & Classification */}
              <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  1. Vehicle Specification
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <FormField label="Vehicle Title / Model" required error={fieldErrors.title?.error} hint={fieldErrors.title?.hint || "e.g. Innova Crysta 7-Seater"} touched={touched.title} valid={touched.title && !fieldErrors.title}>
                      <input name="title" placeholder="e.g. Innova Crysta" value={form.title} onChange={handleChange} onBlur={handleBlur} className="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 transition outline-hidden" />
                    </FormField>
                  </div>

                  <div className="sm:col-span-1">
                    <FormField label="Rental Category" optional hint="Type of service">
                      <select name="subCategory" value={form.subCategory} onChange={handleChange} onBlur={handleBlur} className="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 transition outline-hidden">
                        <option value="Car Rentals">Car Rentals</option>
                        <option value="Bus Rentals">Bus Rentals</option>
                        <option value="Taxi">Taxi</option>
                      </select>
                    </FormField>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Body Type" optional hint="e.g. SUV, Sedan, Mini-Bus">
                    <input name="vehicleType" placeholder="e.g. SUV, Sedan" value={form.vehicleType} onChange={handleChange} onBlur={handleBlur} className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 transition outline-hidden" />
                  </FormField>

                  <FormField label="Seating Capacity" optional error={fieldErrors.seats?.error} hint={fieldErrors.seats?.hint || "e.g. 7"} touched={touched.seats} valid={touched.seats && !fieldErrors.seats}>
                    <input type="number" name="seats" placeholder="e.g. 7" value={form.seats} onChange={handleChange} onBlur={handleBlur} className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 transition outline-hidden font-mono" />
                  </FormField>
                </div>
              </div>

              {/* SECTION 2: Pricing & Powertrain */}
              <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  2. Pricing, Fuel & Transmission
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField label="Price Rate (₹ /day or /km)" optional error={fieldErrors.price?.error} hint={fieldErrors.price?.hint || "e.g. 2500"} touched={touched.price} valid={touched.price && !fieldErrors.price}>
                    <input type="number" name="price" placeholder="2500" value={form.price} onChange={handleChange} onBlur={handleBlur} className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition outline-hidden font-mono" />
                  </FormField>

                  <FormField label="Transmission" optional hint="Automatic / Manual">
                    <input name="transmissionType" placeholder="Automatic / Manual" value={form.transmissionType} onChange={handleChange} onBlur={handleBlur} className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition outline-hidden" />
                  </FormField>

                  <FormField label="Fuel Type" optional hint="Diesel / Petrol / EV / CNG">
                    <input name="fuelType" placeholder="Diesel / Petrol / EV" value={form.fuelType} onChange={handleChange} onBlur={handleBlur} className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition outline-hidden" />
                  </FormField>
                </div>
              </div>

              {/* SECTION 3: Contact & Links */}
              <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  3. Contact & Booking Links
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField label="Contact Phone" required error={fieldErrors.phone?.error} hint={fieldErrors.phone?.hint || "+91 98765 43210"} touched={touched.phone} valid={touched.phone && !fieldErrors.phone}>
                    <input name="phone" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} onBlur={handleBlur} className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition outline-hidden" />
                  </FormField>

                  <FormField label="Contact Email" optional error={fieldErrors.email?.error} hint={fieldErrors.email?.hint || "rentals@example.com"} touched={touched.email} valid={touched.email && !fieldErrors.email}>
                    <input name="email" placeholder="rentals@example.com" value={form.email} onChange={handleChange} onBlur={handleBlur} className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition outline-hidden" />
                  </FormField>

                  <FormField label="Booking Website" optional error={fieldErrors.website?.error} hint={fieldErrors.website?.hint || "https://..."} touched={touched.website} valid={touched.website && !fieldErrors.website}>
                    <input name="website" placeholder="https://..." value={form.website} onChange={handleChange} onBlur={handleBlur} className="w-full px-3.5 py-2.5 rounded-xl text-sm text-blue-600 border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition outline-hidden" />
                  </FormField>
                </div>
              </div>

              {/* SECTION 4: Description */}
              <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  4. Vehicle Description & Features
                </h3>

                <FormField label="Description" optional hint="AC, luggage capacity, driver included, outstation availability...">
                  <textarea name="description" placeholder="Describe vehicle conditions, driver options, luggage space, sanitization standards..." rows={3} value={form.description} onChange={handleChange} onBlur={handleBlur} className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition outline-hidden resize-none" />
                </FormField>
              </div>

              {/* SECTION 5: Visual Gallery */}
              <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                  5. Vehicle Photos
                </h3>

                <div className="border-2 border-dashed border-red-200 hover:border-red-400 p-5 rounded-2xl text-center bg-red-50/40 hover:bg-red-50 transition cursor-pointer flex flex-col items-center justify-center">
                  <input type="file" multiple accept="image/*" id="vehPhoto" onChange={(e) => {
                    const files = Array.from(e.target.files).slice(0, 3);
                    for (let f of files) {
                      const v = validateMediaType(f, 'image');
                      if (v !== true) return toast.error(v);
                    }
                    setPhotoFiles(files);
                  }} className="hidden" />
                  <label htmlFor="vehPhoto" className="cursor-pointer w-full text-xs font-bold text-red-700 flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                      <UploadCloud size={20} />
                    </div>
                    {photoFiles.length > 0 ? (
                      <div className="space-y-1">
                        <p className="font-bold text-emerald-700">✓ {photoFiles.length} Photo(s) Selected</p>
                        <p className="text-[11px] text-slate-500">Click to change selection (Max 3)</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-bold">Upload Vehicle Photos <Req /></p>
                        <p className="text-[10px] text-slate-400 font-normal mt-0.5">JPG, PNG, WebP up to 3 photos</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* SECTION 6: Push Notification Broadcast */}
              <NotificationDraftSection
                serviceType="vehicle"
                entityName={form.title}
                value={notif}
                onChange={setNotif}
              />
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 z-20 flex justify-between items-center px-6 py-4 bg-white/95 backdrop-blur border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 active:scale-98 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center gap-2"
              >
                Add Rental Vehicle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;