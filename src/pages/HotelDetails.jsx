import React, { useState, useContext } from "react";
import {
  MapPin, Save, Edit2, ArrowLeft,
  Phone, Globe, Mail, Star,
  Trash2, UploadCloud
} from "lucide-react";

import { PlaceContext } from "../contextApi/places.jsx";
import {
  useDeleteHotelMutation,
  useUpdateHotelMutation
} from "../mutations/hotelMutation.js";

const HotelDetails = () => {
  const { clickedPlace: hotel, setClickedPlaceHandler } =
    useContext(PlaceContext);

  if (!hotel) return null;

  const [data, setData] = useState(hotel);
  const [isEditing, setIsEditing] = useState(false);
  const [photoFiles, setPhotoFiles] = useState([]);

  const updateMutation = useUpdateHotelMutation();
  const deleteMutation = useDeleteHotelMutation();

  const handleChange = (e) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /* ---------------- DIFF LOGIC (same as Places) ---------------- */

  const getChangedFields = () => {
    const changes = {};

    Object.keys(data).forEach(key => {
      if (JSON.stringify(data[key]) !== JSON.stringify(hotel[key])) {
        changes[key] = data[key];
      }
    });

    const currentPhotos = (data.photos || []).map(p => p.url).sort();
    const originalPhotos = (hotel.photos || []).map(p => p.url).sort();

    if (JSON.stringify(currentPhotos) !== JSON.stringify(originalPhotos)) {
      changes.photos = data.photos.map(p => ({ url: p.url }));
    }

    return changes;
  };

  const handleSave = async () => {
    const changes = getChangedFields();

    if (!Object.keys(changes).length && !photoFiles.length) {
      setIsEditing(false);
      return;
    }

    const formData = new FormData();
    formData.append("data", JSON.stringify(changes));

    photoFiles.forEach(file => {
      formData.append("hotelPhoto", file);
    });

    await updateMutation.mutateAsync({
      id: hotel._id,
      formData
    });

    setIsEditing(false);
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="w-full h-full flex flex-col bg-white">

        {/* HEADER */}
        <div className="h-16 border-b px-8 flex items-center justify-between">
          <button
            onClick={() => setClickedPlaceHandler(null)}
            className="flex items-center text-gray-600 hover:text-black"
          >
            <ArrowLeft size={20} className="mr-2" /> Back
          </button>

          <div className="flex gap-3">
           <button
  onClick={() => {
    if (isEditing) handleSave();
    else setIsEditing(true);
  }}
  className={`flex items-center px-4 py-2 rounded-lg ${
    isEditing
      ? "bg-blue-600 text-white"
      : "bg-gray-100 text-gray-700"
  }`}
>
  {isEditing ? (
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
              onClick={() => deleteMutation.mutate(hotel._id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center"
            >
              <Trash2 size={16} className="mr-2" /> Delete
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">

          {/* TITLE */}
          <input
            name="title"
            value={data.title}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full text-4xl font-extrabold border-b"
          />

          {/* LOCATION */}
          <div className="flex items-center">
            <MapPin size={18} className="mr-2" />
            <input
              name="location"
              value={data.location}
              onChange={handleChange}
              disabled={!isEditing}
              className="border-b w-full"
            />
          </div>

          {/* BASIC INFO */}
          <div className="grid grid-cols-3 gap-4">
            {["subCategory", "rating", "priceRange", "distanceFromCenter"].map(f => (
              <input
                key={f}
                name={f}
                value={data[f] || ""}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder={f}
                className="border p-2 rounded"
              />
            ))}
          </div>

          {/* DESCRIPTION */}
          <textarea
            name="description"
            value={data.description || ""}
            onChange={handleChange}
            disabled={!isEditing}
            rows={5}
            className="w-full border p-3 rounded-xl"
          />

          {/* AMENITIES */}
          <div>
            <h3 className="font-bold mb-2">Amenities</h3>
            <textarea
              name="amenities"
              value={(data.amenities || []).join(", ")}
              onChange={(e) =>
                setData(prev => ({
                  ...prev,
                  amenities: e.target.value.split(",").map(s => s.trim())
                }))
              }
              disabled={!isEditing}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* ROOM TYPES */}
          <div>
            <h3 className="font-bold mb-2">Room Types</h3>
            <textarea
              name="roomTypes"
              value={(data.roomTypes || []).join(", ")}
              onChange={(e) =>
                setData(prev => ({
                  ...prev,
                  roomTypes: e.target.value.split(",").map(s => s.trim())
                }))
              }
              disabled={!isEditing}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="font-bold mb-2">Contact</h3>
            {["phone", "email", "website"].map(f => (
              <input
                key={f}
                placeholder={f}
                value={data.contact?.[f] || ""}
                disabled={!isEditing}
                onChange={(e) =>
                  setData(prev => ({
                    ...prev,
                    contact: {
                      ...prev.contact,
                      [f]: e.target.value
                    }
                  }))
                }
                className="w-full border p-2 rounded mb-2"
              />
            ))}
          </div>

          {/* PHOTO UPLOAD */}
          {isEditing && (
            <div className="border-2 border-dashed p-6 text-center rounded-xl">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) =>
                  setPhotoFiles(Array.from(e.target.files))
                }
              />
            </div>
          )}

          {/* PHOTOS */}
          <div className="grid grid-cols-3 gap-4">
            {(data.photos || []).map((p, i) => (
              <img
                key={i}
                src={p.url}
                alt=""
                className="h-40 w-full object-cover rounded-xl"
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default HotelDetails;
