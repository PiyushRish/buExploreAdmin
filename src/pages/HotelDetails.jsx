import React, { useState, useContext } from "react";
import { MapPin, Save, Edit2, ArrowLeft, Trash2 } from "lucide-react";
import { PlaceContext } from "../contextApi/places.jsx";
import { useDeleteHotelMutation, useUpdateHotelMutation } from "../mutations/hotelMutation.js";

const HotelDetails = () => {
  const { clickedPlace: hotel, setClickedPlaceHandler } = useContext(PlaceContext);
  
  const [data, setData] = useState(hotel || {});
  const [isEditing, setIsEditing] = useState(false);
  // removed photoFiles

  const updateMutation = useUpdateHotelMutation();
  const deleteMutation = useDeleteHotelMutation();

  if (!hotel) return null;

  const handleChange = (e) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));
    await updateMutation.mutateAsync({ formData });
    setIsEditing(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <div className="w-full h-full flex flex-col bg-white">
        <div className="h-16 border-b px-8 flex items-center justify-between">
          <button onClick={() => setClickedPlaceHandler(null)} className="flex items-center text-gray-600">
            <ArrowLeft size={20} className="mr-2" /> Back
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className={`flex items-center px-4 py-2 rounded-lg font-bold ${
                isEditing ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              {isEditing ? <><Save size={16} className="mr-2" /> Save</> : <><Edit2 size={16} className="mr-2" /> Edit</>}
            </button>

            <button
              onClick={() => deleteMutation.mutate(hotel._id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center font-bold"
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
            className="w-full text-4xl font-extrabold border-b bg-transparent"
          />

          <div className="flex items-center">
            <MapPin size={18} className="mr-2 text-blue-500" />
            <input
              name="location"
              value={data.location || ""}
              onChange={handleChange}
              disabled={!isEditing}
              className="border-b w-full bg-transparent"
            />
          </div>

          <textarea
            name="description"
            value={data.description || ""}
            onChange={handleChange}
            disabled={!isEditing}
            rows={4}
            className="w-full border p-3 rounded-xl bg-gray-50/50"
          />
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;