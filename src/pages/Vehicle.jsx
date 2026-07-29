import React, { useState } from "react";
import { Car, Plus, X, UploadCloud, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import { useAddVehicleMutation } from "../mutations/vehicleMutation";
import toast from "react-hot-toast";

const getImageUrl = (photo) => {
  if (!photo) return "https://picsum.photos/600/400";
  if (typeof photo === "string") return photo;
  return photo.url || photo.secure_url || "https://picsum.photos/600/400";
};

const VehicleCard = ({ vehicle, onSelect }) => (
  <div
    onClick={() => onSelect(vehicle)}
    className={`bg-white rounded-2xl shadow-lg overflow-hidden border transition-all duration-300 hover:shadow-2xl flex flex-col h-full cursor-pointer group ${
      vehicle.isDeleted ? "opacity-60 border-red-300 bg-red-50/30" : "border-gray-100"
    }`}
  >
    <div className="relative h-56 bg-gray-900 overflow-hidden">
      <img
        src={getImageUrl(vehicle?.photos?.[0])}
        alt={vehicle?.name || vehicle?.vehicleModel}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute top-3 left-3 z-20 flex gap-2">
        <span className="bg-indigo-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider shadow">
          {vehicle?.type || "Vehicle"}
        </span>
        {vehicle.isDeleted && (
          <span className="bg-red-600 text-white text-[10px] font-extrabold px-2 py-1 rounded-md uppercase tracking-wider shadow">
            Soft Deleted
          </span>
        )}
      </div>

      <div className="absolute bottom-3 right-3 z-20 bg-black/70 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
        <Users size={12} className="text-indigo-400" />
        {vehicle?.capacity || "4"} Seats
      </div>
    </div>

    <div className="p-5 flex flex-col flex-grow">
      <h3 className="font-extrabold text-lg text-gray-900 line-clamp-1">{vehicle?.name || vehicle?.vehicleModel}</h3>
      <p className="text-gray-600 text-xs line-clamp-2 flex-grow leading-relaxed mt-2">
        {vehicle?.description || "Taxi/Rental transport service."}
      </p>
      <div className="pt-3 mt-3 border-t border-gray-100 flex justify-between items-center text-[11px] font-bold text-gray-500">
        <span className="text-indigo-700">₹{vehicle?.pricePerKm || "15"}/km (or ₹{vehicle?.pricePerDay || "2,500"}/day)</span>
        <span className="text-blue-600 hover:underline">Manage All Fields →</span>
      </div>
    </div>
  </div>
);

const Vehicle = ({ setSelectedVehicle }) => {
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["vehicles", includeDeleted],
    queryFn: async () => {
      const res = await axiosClient.get("/services/vehicles", { params: { includeDeleted } });
      return res.data;
    },
  });

  const { mutateAsync: addVehicle, isPending } = useAddVehicleMutation();

  const [form, setForm] = useState({
    name: "",
    type: "SUV",
    vehicleNumber: "",
    driverName: "",
    contactNumber: "",
    capacity: "4",
    pricePerKm: "15",
    pricePerDay: "2500",
    description: "",
  });

  const [photoFiles, setPhotoFiles] = useState([]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.name || photoFiles.length === 0) {
      toast.error("Vehicle model name and photo required");
      return;
    }

    const formData = new FormData();
    formData.append("data", JSON.stringify(form));
    photoFiles.forEach((file) => formData.append("photos", file));

    try {
      await addVehicle(formData);
      toast.success("Vehicle registered!");
      setShowModal(false);
      setPhotoFiles([]);
    } catch (_err) {
      toast.error("Failed to add vehicle");
    }
  };

  const vehicles = (data?.vehicles || []).filter((v) =>
    (v.name || v.vehicleModel)?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <div className="p-8 font-bold text-center text-gray-500">Loading Vehicles...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border">
          <input
            type="text"
            placeholder="Search vehicles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-1/3 border p-2.5 rounded-xl text-sm outline-none focus:border-indigo-500"
          />

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700 bg-gray-100 px-3 py-2 rounded-xl border">
              <input
                type="checkbox"
                checked={includeDeleted}
                onChange={(e) => setIncludeDeleted(e.target.checked)}
                className="rounded text-indigo-600"
              />
              Show Soft-Deleted Records
            </label>

            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-indigo-700 shadow-md"
            >
              <Plus size={16} /> Add Vehicle
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle._id} vehicle={vehicle} onSelect={setSelectedVehicle} />
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-bold">New Vehicle Listing</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            <input name="name" placeholder="Vehicle Model Name (e.g. Innova Crysta) *" onChange={handleChange} className="w-full border p-2.5 rounded-xl text-sm" />
            <textarea name="description" placeholder="Vehicle Specs / Notes..." onChange={handleChange} rows={3} className="w-full border p-2.5 rounded-xl text-sm resize-none" />

            <div className="grid grid-cols-2 gap-4">
              <input name="vehicleNumber" placeholder="Reg Number (e.g. UP93 AB 1234)" onChange={handleChange} className="border p-2.5 rounded-xl text-sm uppercase" />
              <input name="capacity" placeholder="Seating Capacity (e.g. 7)" onChange={handleChange} className="border p-2.5 rounded-xl text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input name="pricePerKm" placeholder="Price Per KM (₹)" onChange={handleChange} className="border p-2.5 rounded-xl text-sm" />
              <input name="pricePerDay" placeholder="Price Per Day (₹)" onChange={handleChange} className="border p-2.5 rounded-xl text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input name="driverName" placeholder="Driver Name" onChange={handleChange} className="border p-2.5 rounded-xl text-sm" />
              <input name="contactNumber" placeholder="Contact Phone" onChange={handleChange} className="border p-2.5 rounded-xl text-sm" />
            </div>

            <div className="border border-dashed p-4 rounded-xl text-center bg-gray-50">
              <input type="file" multiple accept="image/*" id="vehiclePhotos" onChange={(e) => setPhotoFiles(Array.from(e.target.files))} className="hidden" />
              <label htmlFor="vehiclePhotos" className="cursor-pointer text-xs font-bold text-indigo-600 flex items-center justify-center gap-2">
                <UploadCloud size={20} /> {photoFiles.length ? `${photoFiles.length} Photos Selected` : "Upload Vehicle Photos *"}
              </label>
            </div>

            <button onClick={handleSubmit} disabled={isPending} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-md">
              {isPending ? "Registering..." : "Save Vehicle Record"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicle;