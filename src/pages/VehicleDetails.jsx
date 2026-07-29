import React, { useState, useContext, useEffect } from "react";
import { Car, Save, Edit2, ArrowLeft, Trash2, UploadCloud } from "lucide-react";
import { PlaceContext } from "../contextApi/places.jsx";
import { useDeleteVehicleMutation, useUpdateVehicleMutation } from "../mutations/vehicleMutation.js";
import toast from "react-hot-toast";
import { validateMediaType } from "../utils/validators.js";

const VehicleDetails = () => {
  const { clickedPlace: vehicle, setClickedPlaceHandler } = useContext(PlaceContext);
  
  const [data, setData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [newPhotoFiles, setNewPhotoFiles] = useState([]);

  useEffect(() => {
    if (vehicle) {
      setData({
        ...vehicle,
        contactPhone: vehicle?.contact?.phone || "",
        contactEmail: vehicle?.contact?.email || "",
        contactWebsite: vehicle?.contact?.website || "",
      });
    }
  }, [vehicle]);

  const updateMutation = useUpdateVehicleMutation();
  const deleteMutation = useDeleteVehicleMutation();

  if (!vehicle) return null;

  const handleChange = (e) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    const payload = {
      title: data.title,
      subCategory: data.subCategory,
      vehicleType: data.vehicleType,
      seats: Number(data.seats || 0),
      price: Number(data.price || 0),
      transmissionType: data.transmissionType,
      fuelType: data.fuelType,
      description: data.description,
    };

    const formData = new FormData();
    Object.keys(payload).forEach((k) => formData.append(k, payload[k]));
    
    if (data.contactPhone || data.contactEmail) {
      formData.append("contact", JSON.stringify({
        phone: data.contactPhone,
        email: data.contactEmail,
        website: data.contactWebsite
      }));
    }
    
    if (newPhotoFiles.length > 0) {
        newPhotoFiles.forEach(f => formData.append("VehiclePhotos", f));
    }
    formData.append("existingPhotos", JSON.stringify(vehicle.photos || []));

    try {
      const targetId = vehicle.service?._id || vehicle._id;
      await updateMutation.mutateAsync({ id: targetId, formData });
      toast.success("Vehicle updated successfully!");
      setIsEditing(false);
      setNewPhotoFiles([]);
    } catch(err) {
      toast.error(err?.response?.data?.message || "Failed to update");
    }
  };

  const handleDelete = async () => {
    try {
      const targetId = vehicle?.service?._id || vehicle?._id;
      await deleteMutation.mutateAsync(targetId);
      toast.success("Vehicle deleted");
      setClickedPlaceHandler(null);
    } catch(err) {
       toast.error(err?.response?.data?.message || "Failed to delete");
    }
  };

  const displayImages = vehicle?.photos || [];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <div className="w-full h-full flex flex-col bg-white">
        <div className="h-16 border-b px-8 flex items-center justify-between">
          <button onClick={() => setClickedPlaceHandler(null)} className="flex items-center text-gray-600 hover:text-black">
            <ArrowLeft size={20} className="mr-2" /> Back to Vehicles
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className={`flex items-center px-4 py-2 rounded-lg font-bold ${
                isEditing ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              {isEditing ? <><Save size={16} className="mr-2" /> Save</> : <><Edit2 size={16} className="mr-2" /> Edit</>}
            </button>

            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg flex items-center font-bold hover:bg-red-100 focus:outline-none"
            >
              <Trash2 size={16} className="mr-2" /> Delete 
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <input
            name="title"
            value={data.title || ""}
            onChange={handleChange}
            disabled={!isEditing}
            className={`w-full text-4xl font-extrabold bg-transparent ${isEditing ? 'border-b-2 border-red-500' : ''}`}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border mt-6">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Sub-Category</span>
              <select 
                name="subCategory" 
                value={data.subCategory || ""} 
                onChange={handleChange} 
                disabled={!isEditing}
                className="w-full bg-transparent font-medium disabled:opacity-100"
              >
                <option value="Car Rentals">Car Rentals</option>
                <option value="Bus Rentals">Bus Rentals</option>
                <option value="Taxi">Taxi</option>
              </select>
            </div>
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Price</span>
              <input name="price" type="number" step="1" value={data.price || ""} onChange={handleChange} disabled={!isEditing} className="w-full bg-transparent font-medium" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Seats</span>
              <input name="seats" type="number" value={data.seats || ""} onChange={handleChange} disabled={!isEditing} className="w-full bg-transparent font-medium" />
            </div>
             <div>
              <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Vehicle Type</span>
              <input name="vehicleType" value={data.vehicleType || ""} onChange={handleChange} disabled={!isEditing} className="w-full bg-transparent font-medium" />
            </div>
             <div>
              <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Transmission</span>
              <input name="transmissionType" value={data.transmissionType || ""} onChange={handleChange} disabled={!isEditing} className="w-full bg-transparent font-medium" />
            </div>
             <div>
              <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Fuel Type</span>
              <input name="fuelType" value={data.fuelType || ""} onChange={handleChange} disabled={!isEditing} className="w-full bg-transparent font-medium" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
               <div>
                <span className="text-sm font-bold text-gray-800 mb-2 block">Description</span>
                <textarea
                  name="description"
                  value={data.description || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full border p-3 rounded-xl bg-gray-50/50"
                />
               </div>
               
               <div className="bg-gray-50 p-4 rounded-xl border space-y-3">
                 <h4 className="text-sm font-bold text-gray-800">Contact Details</h4>
                 <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-16">Phone:</span>
                    <input name="contactPhone" value={data.contactPhone || ""} onChange={handleChange} disabled={!isEditing} className="flex-1 bg-transparent border-b outline-none"/>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-16">Email:</span>
                    <input name="contactEmail" value={data.contactEmail || ""} onChange={handleChange} disabled={!isEditing} className="flex-1 bg-transparent border-b outline-none"/>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-16">Web:</span>
                    <input name="contactWebsite" value={data.contactWebsite || ""} onChange={handleChange} disabled={!isEditing} className="flex-1 bg-transparent border-b outline-none"/>
                 </div>
               </div>
            </div>

            <div className="space-y-4">
              <div>
                 <h4 className="text-sm font-bold text-gray-800 mb-2">Display Photos</h4>
                 <div className="grid grid-cols-3 gap-3">
                   {displayImages.length > 0 && newPhotoFiles.length === 0 && displayImages.map((photo, i) => (
                      <div key={i} className="aspect-square rounded-xl overflow-hidden border">
                        <img src={photo.url || photo} alt={`display ${i}`} className="w-full h-full object-cover" />
                      </div>
                   ))}
                   {newPhotoFiles.length > 0 && Array.from(newPhotoFiles).map((file, i) => (
                      <div key={i} className="aspect-square rounded-xl overflow-hidden border">
                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt={`new upload ${i}`} />
                      </div>
                   ))}
                 </div>
                 
                 {isEditing && (
                    <div className="mt-3">
                      <input type="file" multiple id="vPhotoUpdate" onChange={(e) => {
                const files = Array.from(e.target.files).slice(0, 3);
                for (let f of files) {
                  const v = validateMediaType(f, 'image');
                  if (v !== true) return toast.error(v);
                }
                setNewPhotoFiles(files);
              }} accept="image/*" className="hidden"/>
                      <label htmlFor="vPhotoUpdate" className="text-red-600 text-sm font-bold flex items-center gap-1 cursor-pointer w-fit bg-red-50 py-1.5 px-3 rounded-lg"><UploadCloud size={16}/> Replace Photos (Max 3)</label>
                    </div>
                 )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;