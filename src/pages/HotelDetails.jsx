import React, { useState, useContext, useEffect } from "react";
import { MapPin, Save, Edit2, ArrowLeft, Trash2, UploadCloud, Loader2 } from "lucide-react";
import { PlaceContext } from "../contextApi/places.jsx";
import { useDeleteHotelMutation, useUpdateHotelMutation } from "../mutations/hotelMutation.js";
import toast from "react-hot-toast";
import { validateMediaType } from "../utils/validators.js";
import UploadProgressBar from "../components/UploadProgressBar.jsx";
import { uploadMultipleFilesDirectToR2 } from "../utils/r2DirectUpload.js";

const HotelDetails = () => {
  const { clickedPlace: hotel, setClickedPlaceHandler } = useContext(PlaceContext);
  
  const [data, setData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [newPhotoFiles, setNewPhotoFiles] = useState([]);
  const [isUploadingR2, setIsUploadingR2] = useState(false);

  useEffect(() => {
    if (hotel) {
      setData({
        ...hotel,
        contactPhone: hotel?.contact?.phone || "",
        contactEmail: hotel?.contact?.email || "",
        contactWebsite: hotel?.contact?.website || "",
        parsedAmenities: hotel?.amenities ? hotel.amenities.join(", ") : "",
        parsedRoomTypes: hotel?.roomTypes ? hotel.roomTypes.join(", ") : "",
      });
    }
  }, [hotel]);

  const updateMutation = useUpdateHotelMutation();
  const deleteMutation = useDeleteHotelMutation();

  if (!hotel) return null;

  const handleChange = (e) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      let newlyUploadedR2 = [];
      if (newPhotoFiles.length > 0) {
        setIsUploadingR2(true);
        newlyUploadedR2 = await uploadMultipleFilesDirectToR2(newPhotoFiles, "services/hotels", "image");
      }

      const payload = {
        title: data.title,
        location: data.location,
        subCategory: data.subCategory,
        priceRange: data.priceRange,
        rating: Number(data.rating || 0),
        distanceFromCenter: Number(data.distanceFromCenter || 0),
        description: data.description,
        ...(data.contactPhone || data.contactEmail ? {
          contact: {
            phone: data.contactPhone,
            email: data.contactEmail,
            website: data.contactWebsite
          }
        } : {}),
        ...(data.parsedAmenities ? {
          amenities: data.parsedAmenities.split(',').map(i=>i.trim()).filter(Boolean)
        } : {}),
        ...(data.parsedRoomTypes ? {
          roomTypes: data.parsedRoomTypes.split(',').map(i=>i.trim()).filter(Boolean)
        } : {}),
        photos: [...(hotel.photos || []), ...newlyUploadedR2],
      };

      const targetId = hotel.service?._id || hotel._id;
      await updateMutation.mutateAsync({ id: targetId, formData: payload });
      toast.success("Hotel updated successfully!");
      setIsEditing(false);
      setNewPhotoFiles([]);
      setIsUploadingR2(false);
    } catch(err) {
      setIsUploadingR2(false);
      toast.error(err?.response?.data?.message || err?.message || "Failed to update");
    }
  };

  const handleDelete = async () => {
    try {
      const targetId = hotel?.service?._id || hotel?._id;
      await deleteMutation.mutateAsync(targetId);
      toast.success("Property deleted");
      setClickedPlaceHandler(null);
    } catch(err) {
       toast.error(err?.response?.data?.message || "Failed to delete");
    }
  };

  const displayImages = hotel?.photos || [];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <div className="w-full h-full flex flex-col bg-white">
        <div className="border-b px-8 py-3 bg-white sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <button onClick={() => setClickedPlaceHandler(null)} className="flex items-center text-gray-600 hover:text-black">
              <ArrowLeft size={20} className="mr-2" /> Back to accommodations
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                disabled={updateMutation.isPending || isUploadingR2}
                className={`flex items-center px-4 py-2 rounded-lg font-bold transition ${
                  isEditing ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } disabled:opacity-50`}
              >
                {isUploadingR2 ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" /> Uploading to R2...
                  </>
                ) : updateMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" /> Saving...
                  </>
                ) : isEditing ? (
                  <>
                    <Save size={16} className="mr-2" /> Save
                  </>
                ) : (
                  <>
                    <Edit2 size={16} className="mr-2" /> Edit
                  </>
                )}
              </button>

              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg flex items-center font-bold hover:bg-red-100 focus:outline-none disabled:opacity-50"
              >
                <Trash2 size={16} className="mr-2" /> Delete 
              </button>
            </div>
          </div>
          <UploadProgressBar isUploading={updateMutation.isPending} className="mt-2" />
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <input
            name="title"
            value={data.title || ""}
            onChange={handleChange}
            disabled={!isEditing}
            className={`w-full text-4xl font-extrabold bg-transparent ${isEditing ? 'border-b-2 border-blue-500' : ''}`}
          />

          <div className="flex items-center">
            <MapPin size={18} className="mr-2 text-blue-500" />
            <input
              name="location"
              value={data.location || ""}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full max-w-sm bg-transparent ${isEditing ? 'border-b border-blue-500' : ''}`}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Sub-Category</span>
              <select 
                name="subCategory" 
                value={data.subCategory || ""} 
                onChange={handleChange} 
                disabled={!isEditing}
                className="w-full bg-transparent font-medium disabled:opacity-100"
              >
                <option value="Hotels">Hotels</option>
                <option value="Resorts">Resorts</option>
                <option value="Guest Houses">Guest Houses</option>
              </select>
            </div>
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Price Range</span>
              <input name="priceRange" value={data.priceRange || ""} onChange={handleChange} disabled={!isEditing} className="w-full bg-transparent font-medium" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Rating</span>
              <input name="rating" type="number" step="0.1" value={data.rating || ""} onChange={handleChange} disabled={!isEditing} className="w-full bg-transparent font-medium" />
            </div>
             <div>
              <span className="text-xs font-bold text-gray-500 uppercase block mb-1">km from center</span>
              <input name="distanceFromCenter" type="number" value={data.distanceFromCenter || ""} onChange={handleChange} disabled={!isEditing} className="w-full bg-transparent font-medium" />
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
                <h4 className="text-sm font-bold text-gray-800 mb-1">Amenities (Comma separated)</h4>
                <input name="parsedAmenities" value={data.parsedAmenities || ""} onChange={handleChange} disabled={!isEditing} className="w-full border-b p-1 bg-transparent outline-none"/>
              </div>
              
              <div>
                <h4 className="text-sm font-bold text-gray-800 mb-1">Room Types (Comma separated)</h4>
                <input name="parsedRoomTypes" value={data.parsedRoomTypes || ""} onChange={handleChange} disabled={!isEditing} className="w-full border-b p-1 bg-transparent outline-none"/>
              </div>

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
                      <input type="file" multiple id="hPhotoUpdate" onChange={(e) => {
                const files = Array.from(e.target.files).slice(0, 4);
                for (let f of files) {
                  const v = validateMediaType(f, 'image');
                  if (v !== true) return toast.error(v);
                }
                setNewPhotoFiles(files);
              }} accept="image/*" className="hidden"/>
                      <label htmlFor="hPhotoUpdate" className="text-blue-600 text-sm font-bold flex items-center gap-1 cursor-pointer w-fit bg-blue-50 py-1.5 px-3 rounded-lg"><UploadCloud size={16}/> Replace Photos (Max 4)</label>
                    </div>
                 )}

                 {(updateMutation.isPending || isUploadingR2) && (
                   <div className="mt-3">
                     <UploadProgressBar isUploading={updateMutation.isPending || isUploadingR2} />
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

export default HotelDetails;