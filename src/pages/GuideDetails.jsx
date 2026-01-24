import React, { useState, useContext } from "react";
import {
  Save, Edit2, ArrowLeft,
  Trash2
} from "lucide-react";

import { PlaceContext } from "../contextApi/places.jsx";
import {
  useDeleteGuideMutation,
  useUpdateGuideMutation
} from "../mutations/guideMutation.js";

const GuideDetails = () => {
  const { clickedPlace: guide, setClickedPlaceHandler } =
    useContext(PlaceContext);

  if (!guide) return null;

  const [data, setData] = useState(guide);
  const [isEditing, setIsEditing] = useState(false);

  const updateMutation = useUpdateGuideMutation();
  const deleteMutation = useDeleteGuideMutation();

  const handleChange = (e) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const getChangedFields = () => {
    const changes = {};
    Object.keys(data).forEach(key => {
      if (JSON.stringify(data[key]) !== JSON.stringify(guide[key])) {
        changes[key] = data[key];
      }
    });
    return changes;
  };

  const handleSave = async () => {
    const changes = getChangedFields();
    if (!Object.keys(changes).length) {
      setIsEditing(false);
      return;
    }

    const formData = new FormData();
    formData.append("data", JSON.stringify(changes));

    await updateMutation.mutateAsync({
      id: guide._id,
      formData
    });

    setIsEditing(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-full bg-white flex flex-col">

        {/* HEADER */}
        <div className="h-16 border-b px-8 flex justify-between items-center">
          <button
            onClick={() => setClickedPlaceHandler(null)}
            className="flex items-center"
          >
            <ArrowLeft size={20} className="mr-2" /> Back
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="px-4 py-2 bg-gray-100 rounded-lg flex items-center"
            >
              {isEditing ? <Save size={16} /> : <Edit2 size={16} />}
            </button>

            <button
              onClick={() => deleteMutation.mutate(guide._id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-8 space-y-6 overflow-y-auto">

          {["subCategory", "experienceYears", "fee"].map(f => (
            <input
              key={f}
              name={f}
              value={data[f] || ""}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full border p-2 rounded"
              placeholder={f}
            />
          ))}

          {/* Languages */}
          <textarea
            value={(data.languages || []).join(", ")}
            disabled={!isEditing}
            onChange={(e) =>
              setData(prev => ({
                ...prev,
                languages: e.target.value.split(",").map(s => s.trim())
              }))
            }
            className="w-full border p-2 rounded"
            placeholder="Languages comma separated"
          />

          {/* Speciality */}
          <textarea
            value={(data.speciality || []).join(", ")}
            disabled={!isEditing}
            onChange={(e) =>
              setData(prev => ({
                ...prev,
                speciality: e.target.value.split(",").map(s => s.trim())
              }))
            }
            className="w-full border p-2 rounded"
            placeholder="Speciality comma separated"
          />

          {/* Contact */}
          <div>
            <h3 className="font-bold mb-2">Contact</h3>
            {["phone", "email", "website"].map(f => (
              <input
                key={f}
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
                placeholder={f}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default GuideDetails;
