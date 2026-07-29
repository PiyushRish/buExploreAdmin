import React, { useState, useContext } from "react";
import { Car, Plus, UploadCloud } from "lucide-react";
import { PlaceContext } from "../contextApi/places.jsx";
import VehicleDetails from "./VehicleDetails.jsx";
import { useVehiclesQuery } from "../queries/vehicleQueries.js";
import { useAddVehicleMutation } from "../mutations/vehicleMutation.js";
import toast from "react-hot-toast";
import { Req, RequiredNotice } from "../components/RequiredTag.jsx";
import FormField from "../components/FormField.jsx";
import { validators, runValidators, validateMediaType } from "../utils/validators.js";

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
      await addMutation.mutateAsync(formData);
      toast.success("Vehicle added successfully!");
      setShowModal(false);
      setPhotoFiles([]);
      setForm({ title: "", subCategory: "Car Rentals", vehicleType: "", seats: "", price: "", transmissionType: "", fuelType: "", phone: "", email: "", website: "", description: "" });
      setTouched({});
      setFieldErrors({});
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Add Rental Vehicle</h2>
              <button className="text-gray-500 hover:text-black" onClick={()=> setShowModal(false)}>Close</button>
            </div>

            <RequiredNotice />

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Vehicle Title / Model" required error={fieldErrors.title?.error} hint={fieldErrors.title?.hint || "Vehicle Title/Model"} touched={touched.title} valid={touched.title && !fieldErrors.title}>
                <input name="title" placeholder="Vehicle Title/Model" value={form.title} onChange={handleChange} onBlur={handleBlur} className="w-full border p-2 rounded" />
              </FormField>

              <FormField label="Vehicle Category" optional hint="Type of rental">
                <select name="subCategory" value={form.subCategory} onChange={handleChange} onBlur={handleBlur} className="w-full border p-2 rounded">
                  <option value="Car Rentals">Car Rentals</option>
                  <option value="Bus Rentals">Bus Rentals</option>
                  <option value="Taxi">Taxi</option>
                </select>
              </FormField>

              <FormField label="Vehicle Type" optional hint="e.g. SUV, Sedan">
                <input name="vehicleType" placeholder="e.g. SUV, Sedan" value={form.vehicleType} onChange={handleChange} onBlur={handleBlur} className="w-full border p-2 rounded" />
              </FormField>
              <FormField label="Seats" optional error={fieldErrors.seats?.error} hint={fieldErrors.seats?.hint || "e.g. 5"} touched={touched.seats} valid={touched.seats && !fieldErrors.seats}>
                <input type="number" name="seats" placeholder="e.g. 5" value={form.seats} onChange={handleChange} onBlur={handleBlur} className="w-full border p-2 rounded" />
              </FormField>

              <FormField label="Price /day or /km" optional error={fieldErrors.price?.error} hint={fieldErrors.price?.hint || "Price"} touched={touched.price} valid={touched.price && !fieldErrors.price}>
                <input type="number" name="price" placeholder="Price" value={form.price} onChange={handleChange} onBlur={handleBlur} className="w-full border p-2 rounded" />
              </FormField>
              <FormField label="Transmission" optional hint="Auto/Manual">
                <input name="transmissionType" placeholder="Auto/Manual" value={form.transmissionType} onChange={handleChange} onBlur={handleBlur} className="w-full border p-2 rounded" />
              </FormField>
              <FormField label="Fuel Type" optional hint="Petrol/Diesel/EV">
                <input name="fuelType" placeholder="Petrol/Diesel/EV" value={form.fuelType} onChange={handleChange} onBlur={handleBlur} className="w-full border p-2 rounded" />
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
            <FormField label="Description" optional hint="Description">
              <textarea name="description" placeholder="Description" rows={3} value={form.description} onChange={handleChange} onBlur={handleBlur} className="w-full border p-2 rounded" />
            </FormField>

            <div className="border border-dashed border-gray-300 p-4 rounded-xl text-center bg-gray-50 flex items-center justify-center">
              <input type="file" multiple accept="image/*" id="vehPhoto" onChange={(e) => {
                const files = Array.from(e.target.files).slice(0, 3);
                for (let f of files) {
                  const v = validateMediaType(f, 'image');
                  if (v !== true) return toast.error(v);
                }
                setPhotoFiles(files);
              }} className="hidden" />
              <label htmlFor="vehPhoto" className="cursor-pointer text-sm font-bold text-red-600 flex items-center gap-2">
                <UploadCloud size={20} />
                {photoFiles.length > 0 ? `${photoFiles.length} Photos Selected (Max 3)` : <span>Upload Cover Photos <Req /> (Max 3)</span>}
              </label>
            </div>

            <button onClick={handleSubmit} className="w-full bg-red-600 hover:bg-red-700 transition-colors text-white py-3 rounded-xl font-bold mt-4">Create Entity</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;