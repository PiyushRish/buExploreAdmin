import React, { useState, useContext } from "react";
import { Heart, MapPin, Share2, Car, Gauge } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import { PlaceContext } from "../contextApi/places.jsx";
import { useVehiclesQuery } from "../queries/vehicleQueries.js"; // change if needed

/* -------------------------------------------------- */
/*              VEHICLE CARD COMPONENT               */
/* -------------------------------------------------- */

const VehicleCard = ({ vehicle }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const { setClickedPlaceHandler } = useContext(PlaceContext);

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked((prev) => !prev);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl 
      transition-all duration-300 transform hover:-translate-y-1 
      border border-gray-100 flex flex-col h-full cursor-pointer"
      onClick={() => setClickedPlaceHandler(vehicle)}
    >
      {/* NO IMAGE → VEHICLE PLACEHOLDER */}
      <div className="relative h-56 bg-gradient-to-r from-gray-800 to-gray-600 flex items-center justify-center">
        <h2 className="text-4xl font-extrabold text-white tracking-wider">
          VEHICLE
        </h2>

        <div className="absolute top-3 right-3">
          <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors text-gray-700">
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-xl text-gray-800 line-clamp-1">
          {vehicle?.title || vehicle?.name || "Vehicle"}
        </h3>

        <div className="flex items-center text-gray-500 text-sm mt-1">
          <MapPin size={14} className="mr-1" />
          {vehicle?.location || "Location not available"}
        </div>

        <p className="text-gray-600 text-sm mt-3 mb-4 line-clamp-2 flex-grow">
          {vehicle?.description || "No description available."}
        </p>

        {/* Vehicle Info Row */}
        <div className="flex justify-between items-center mb-3 text-sm">
          {vehicle?.type && (
            <span className="flex items-center font-semibold text-gray-700">
              <Car size={16} className="mr-1 text-blue-500" />
              {vehicle.type}
            </span>
          )}

          {vehicle?.mileage && (
            <span className="flex items-center font-semibold text-gray-700">
              <Gauge size={16} className="mr-1 text-green-500" />
              {vehicle.mileage} km/l
            </span>
          )}
        </div>

        {/* FOOTER */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
          <span className="font-semibold text-sm text-gray-500">
            {vehicle?.subCategory || "Vehicle"}
          </span>

          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-full transition-colors ${
              isLiked
                ? "bg-red-50 text-red-500"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Heart
              size={18}
              className={`transition-all duration-300 ${
                isLiked ? "fill-red-500 scale-110" : ""
              }`}
            />
            <span className="text-sm font-medium">{likeCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------- */
/*                MAIN VEHICLES GRID                 */
/* -------------------------------------------------- */

const Vehicles = () => {
  const { data, isLoading, isError } = useVehiclesQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading vehicles...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Failed to load vehicles. Please try again later.
      </div>
    );
  }

  const vehicles = data?.vehicles || [];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Navbar />

      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Vehicles
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find reliable transport options for your journey.
          </p>
        </div>

        {vehicles.length === 0 ? (
          <div className="text-center text-gray-500">
            No vehicles found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map((v) => (
              <VehicleCard key={v?._id} vehicle={v} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  return <Vehicles />;
}
