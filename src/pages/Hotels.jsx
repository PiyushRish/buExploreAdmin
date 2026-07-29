import React, { useState, useContext } from "react";
import { MapPin, Star, Plus, X, Upload, Share2, Heart } from "lucide-react";
import { PlaceContext } from "../contextApi/places.jsx";
import HotelDetails from "./HotelDetails.jsx";
import { useHotelsQuery } from "../queries/hotelQueries.js";
import { useAddHotelMutation } from "../mutations/hotelMutation.js";

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
        <h3 className="font-bold text-xl">{hotel?.title}</h3>
        <p className="text-gray-500 text-sm mt-1">{hotel?.location}</p>
      </div>
    </div>
  );
};

const Hotels = () => {
  const { data, isLoading, isError } = useHotelsQuery();
  const { clickedPlace } = useContext(PlaceContext);
  const addHotelMutation = useAddHotelMutation();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", location: "", priceRange: "", description: "" });
  // Removed unused setPhotoFiles

  const handleSubmit = async () => {
    const formData = new FormData();
    Object.keys(form).forEach((k) => formData.append(k, form[k]));
    photoFiles.forEach((f) => formData.append("HotelPhotos", f));

    await addHotelMutation.mutateAsync(formData);
    setShowModal(false);
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen font-semibold">Loading Hotels...</div>;
  if (isError) return <div className="flex justify-center items-center h-screen text-red-500">Failed to load hotels.</div>;
  if (clickedPlace) return <HotelDetails />;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(data?.hotels || []).map((h) => <HotelCard key={h._id} hotel={h} />)}
        </div>
      </div>

      <button onClick={() => setShowModal(true)} className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg">
        <Plus size={28} />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl max-w-lg w-full space-y-4">
            <h2 className="text-2xl font-bold">Add Property</h2>
            <input placeholder="Hotel Title" className="w-full border p-2 rounded" onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input placeholder="Location" className="w-full border p-2 rounded" onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Submit</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hotels;