import React, { useState, useContext } from "react";
import { Heart, Share2, Plus, X } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import { PlaceContext } from "../contextApi/places.jsx";
import VehicleDetails from "./VehicleDetails.jsx";

import { useVehiclesQuery } from "../queries/vehicleQueries.js";
import { useAddVehicleMutation } from "../mutations/vehicleMutation.js";

/* ---------------- VEHICLE CARD ---------------- */

const VehicleCard = ({ vehicle }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const { setClickedPlaceHandler } = useContext(PlaceContext);

  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden border flex flex-col cursor-pointer"
      onClick={() => setClickedPlaceHandler(vehicle)}
    >
      <div className="h-56 bg-gray-800 flex items-center justify-center relative">
        <h2 className="text-4xl font-extrabold text-white">VEHICLE</h2>
        <div className="absolute top-3 right-3">
          <Share2 size={18} className="text-white" />
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-xl">{vehicle?.vehicleType}</h3>
        <p className="text-sm text-gray-600 mt-2">{vehicle?.description}</p>

        <div className="mt-auto pt-4 border-t flex justify-between">
          <span>{vehicle?.subCategory}</span>
          <span>₹{vehicle?.price}</span>
        </div>
      </div>
    </div>
  );
};

/* ---------------- GRID ---------------- */

const Vehicles = () => {
  const { data, isLoading, isError } = useVehiclesQuery();
  const { clickedPlace } = useContext(PlaceContext);
  const addMutation = useAddVehicleMutation();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    subCategory: "",
    vehicleType: "",
    seats: "",
    price: "",
    transmissionType: "",
    fuelType: "",
    phone: "",
    email: "",
    website: "",
    description: ""
  });

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) =>
      formData.append(k, v)
    );
    await addMutation.mutateAsync(formData);
    setShowModal(false);
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;
  if (clickedPlace) return <VehicleDetails />;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <Navbar />

      <div className="grid grid-cols-3 gap-8">
        {data?.vehicles?.map(v => (
          <VehicleCard key={v._id} vehicle={v} />
        ))}
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 bg-gray-800 text-white p-4 rounded-full"
      >
        <Plus size={28} />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 w-[600px] rounded-xl">
            <div className="flex justify-between mb-4">
              <h2>Create Vehicle</h2>
              <X onClick={() => setShowModal(false)} />
            </div>

            {Object.keys(form).map(f => (
              <input
                key={f}
                name={f}
                placeholder={f}
                onChange={handleChange}
                className="w-full border p-2 rounded mb-3"
              />
            ))}

            <button
              onClick={handleSubmit}
              className="w-full bg-gray-800 text-white py-2 rounded"
            >
              Create Vehicle
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return <Vehicles />;
}
