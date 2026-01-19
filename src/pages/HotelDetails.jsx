import React, { useState, useContext } from "react";
import {
  MapPin, Save, Edit2, ArrowLeft,
  Phone, Globe, Mail, Star
} from "lucide-react";

import { PlaceContext } from "../contextApi/places.jsx";

const HotelDetails = () => {
  const { clickedPlace: hotel, setClickedPlaceHandler } = useContext(PlaceContext);

  if (!hotel) return null;

  const [data, setData] = useState(hotel);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleEdit = () => {
    setIsEditing(p => !p);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* LEFT SIDE (FULL WIDTH) */}
      <div className="w-full h-full flex flex-col bg-white">

        {/* HEADER */}
        <div className="h-16 border-b px-8 flex items-center justify-between">
          <button
            onClick={() => setClickedPlaceHandler(null)}
            className="flex items-center text-gray-600 hover:text-black"
          >
            <ArrowLeft size={20} className="mr-2" /> Back
          </button>

          <button
            onClick={toggleEdit}
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
        </div>

        {/* SCROLL AREA */}
        <div className="flex-1 overflow-y-auto p-8">

          {/* TITLE + LOCATION */}
          {isEditing ? (
            <div className="space-y-4">
              <input
                name="title"
                value={data.title}
                onChange={handleChange}
                className="w-full text-4xl font-extrabold border-b"
              />

              <div className="flex items-center space-x-2">
                <MapPin size={20} className="text-blue-500" />
                <input
                  name="location"
                  value={data.location}
                  onChange={handleChange}
                  className="w-full border-b"
                />
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-4xl font-extrabold">{data.title}</h1>
              <div className="flex items-center text-gray-500 mt-1">
                <MapPin size={20} className="mr-2 text-blue-600" />
                {data.location}
              </div>
            </div>
          )}

          {/* META BADGES */}
          <div className="flex gap-3 mt-6 flex-wrap">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
              {data.subCategory}
            </span>

            {data.rating && (
              <span className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded-full text-sm flex items-center gap-1">
                <Star size={14} /> {data.rating}
              </span>
            )}

            {data.priceRange && (
              <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                {data.priceRange}
              </span>
            )}

            {data.distanceFromCenter != null && (
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {data.distanceFromCenter} km from center
              </span>
            )}
          </div>

          {/* DESCRIPTION */}
          <div className="mt-10">
            <h3 className="text-xl font-bold">About</h3>
            {isEditing ? (
              <textarea
                name="description"
                value={data.description || ""}
                onChange={handleChange}
                rows={6}
                className="w-full mt-2 p-3 border rounded-xl bg-gray-50"
              />
            ) : (
              <p className="text-gray-600 leading-relaxed mt-2">
                {data.description || "No description available."}
              </p>
            )}
          </div>

          {/* AMENITIES */}
          <div className="mt-10">
            <h3 className="text-xl font-bold mb-3">Amenities</h3>

            {data.amenities?.length ? (
              <div className="grid grid-cols-2 gap-4">
                {data.amenities.map((a, i) => (
                  <div key={i} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                    {a}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No amenities listed.</p>
            )}
          </div>

          {/* ROOM TYPES */}
          <div className="mt-10">
            <h3 className="text-xl font-bold mb-3">Room Types</h3>

            {data.roomTypes?.length ? (
              <div className="flex gap-3 flex-wrap">
                {data.roomTypes.map((r, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {r}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No room types listed.</p>
            )}
          </div>

          {/* CONTACT INFO */}
          <div className="mt-10 bg-gray-50 p-4 rounded-xl">
            <h3 className="text-xl font-bold mb-3">Contact</h3>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-blue-500" />
                {data.contact?.phone}
              </div>

              {data.contact?.email && (
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-blue-500" />
                  {data.contact.email}
                </div>
              )}

              {data.contact?.website && (
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-blue-500" />
                  <a
                    href={data.contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HotelDetails;
