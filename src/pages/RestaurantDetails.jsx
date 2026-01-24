import React, { useState, useContext } from "react";
import {
  MapPin, Save, Edit2, ArrowLeft,
  Phone, Globe, Mail, Trash2
} from "lucide-react";

import { PlaceContext } from "../contextApi/places.jsx";
import {
  useDeleteRestaurantMutation,
  useUpdateRestaurantMutation
} from "../mutations/restaurantMutation.js";

const RestaurantDetails = () => {
  const { clickedPlace: restaurant, setClickedPlaceHandler } =
    useContext(PlaceContext);

  if (!restaurant) return null;

  const [data, setData] = useState(restaurant);
  const [isEditing, setIsEditing] = useState(false);

  const updateMutation = useUpdateRestaurantMutation();
  const deleteMutation = useDeleteRestaurantMutation();

  const handleChange = (e) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /* -------- SAME DIFF LOGIC -------- */
  const getChangedFields = () => {
    const changes = {};
    Object.keys(data).forEach(key => {
      if (JSON.stringify(data[key]) !== JSON.stringify(restaurant[key])) {
        changes[key] = data[key];
      }
    });
    return changes;
  };

  const handleSave = async () => {
    const changes = getChangedFields();

    const formData = new FormData();
    formData.append("data", JSON.stringify(changes));

    await updateMutation.mutateAsync({
      id: restaurant._id,
      formData
    });

    setIsEditing(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="w-full flex flex-col bg-white">

        {/* HEADER */}
        <div className="h-16 border-b px-8 flex items-center justify-between">
          <button
            onClick={() => setClickedPlaceHandler(null)}
            className="flex items-center text-gray-600"
          >
            <ArrowLeft size={20} className="mr-2" /> Back
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className={`flex items-center px-4 py-2 rounded-lg ${
                isEditing ? "bg-blue-600 text-white" : "bg-gray-100"
              }`}
            >
              {isEditing ? <Save className="mr-2" /> : <Edit2 className="mr-2" />}
              {isEditing ? "Save" : "Edit"}
            </button>

            <button
              onClick={() => deleteMutation.mutate(restaurant._id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center"
            >
              <Trash2 className="mr-2" /> Delete
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
            {["subCategory", "rating", "averageCost", "timings"].map(f => (
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

          {/* CUISINE */}
          <div>
            <h3 className="font-bold mb-2">Cuisine</h3>
            <textarea
              value={(data.cuisine || []).join(", ")}
              disabled={!isEditing}
              onChange={(e) =>
                setData(prev => ({
                  ...prev,
                  cuisine: e.target.value.split(",").map(s => s.trim())
                }))
              }
              className="w-full border p-2 rounded"
            />
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="font-bold mb-2">Contact</h3>
            {["phone", "email", "website"].map(f => (
              <div key={f} className="flex items-center mb-2">
                {f === "phone" && <Phone size={16} className="mr-2" />}
                {f === "email" && <Mail size={16} className="mr-2" />}
                {f === "website" && <Globe size={16} className="mr-2" />}

                <input
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
                  className="w-full border p-2 rounded"
                />
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;
