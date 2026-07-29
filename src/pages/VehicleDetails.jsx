import React, { useState } from "react";
import { ArrowLeft, Save, Edit2, Trash2, AlertTriangle, RotateCcw, Image as ImageIcon } from "lucide-react";
import axiosClient from "../api/axiosClient";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const getImageUrl = (photo) => {
  if (!photo) return "https://picsum.photos/600/400";
  if (typeof photo === "string") return photo;
  return photo.url || photo.secure_url || "https://picsum.photos/600/400";
};

const VehicleDetails = ({ vehicle, onBack }) => {
  const queryClient = useQueryClient();
  const [data, setData] = useState(vehicle);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteMode, setDeleteMode] = useState(null);
  const [isPending, setIsPending] = useState(false);

  const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setIsPending(true);
    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify(data));
      await axiosClient.patch(`/services/vehicles/${data._id}`, formData);
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setIsEditing(false);
      toast.success("Vehicle record updated!");
    } catch (_err) {
      toast.error("Failed to update vehicle");
    } finally {
      setIsPending(false);
    }
  };

  const handleSoftDelete = async () => {
    try {
      await axiosClient.delete(`/services/vehicles/${data._id}`, { params: { hard: false } });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle soft-deleted");
      onBack();
    } catch (_err) {
      toast.error("Soft delete failed");
    }
  };

  const handleRestore = async () => {
    try {
      await axiosClient.patch(`/services/vehicles/restore/${data._id}`);
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setData({ ...data, isDeleted: false, deletedAt: null });
      toast.success("Vehicle restored!");
    } catch (_err) {
      toast.error("Restore failed");
    }
  };

  const handleHardDelete = async () => {
    try {
      await axiosClient.delete(`/services/vehicles/${data._id}`, { params: { hard: true } });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.error("Vehicle permanently erased");
      onBack();
    } catch (_err) {
      toast.error("Permanent erase failed");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      <div className="h-16 border-b px-8 flex items-center justify-between bg-white sticky top-0 z-20">
        <button onClick={onBack} className="flex items-center text-gray-600 font-semibold hover:text-gray-900">
          <ArrowLeft size={18} className="mr-2" /> Back to Vehicles
        </button>

        <div className="flex items-center gap-2">
          {data.isDeleted ? (
            <button onClick={handleRestore} className="flex items-center px-4 py-2 rounded-xl bg-green-50 text-green-700 font-bold text-xs border border-green-200">
              <RotateCcw size={14} className="mr-1.5" /> Restore Vehicle
            </button>
          ) : (
            <button onClick={() => setDeleteMode("soft")} className="flex items-center px-4 py-2 rounded-xl bg-yellow-50 text-yellow-700 font-bold text-xs border border-yellow-200">
              <Trash2 size={14} className="mr-1.5" /> Soft Delete
            </button>
          )}

          <button onClick={() => setDeleteMode("hard")} className="flex items-center px-4 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-xs border border-red-200">
            <AlertTriangle size={14} className="mr-1.5" /> Permanent Delete
          </button>

          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            disabled={isPending}
            className={`flex items-center px-6 py-2 rounded-xl font-bold text-xs ${
              isEditing ? "bg-indigo-600 text-white shadow-md" : "bg-gray-100 text-gray-700 border"
            }`}
          >
            {isEditing ? <><Save size={14} className="mr-1.5" /> Save Changes</> : <><Edit2 size={14} className="mr-1.5" /> Edit All Fields</>}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6 max-w-5xl mx-auto w-full">
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Vehicle Name / Model</label>
              <input name="name" disabled={!isEditing} value={data.name || data.vehicleModel || ""} onChange={handleChange} className="w-full p-2 border-b font-bold text-lg bg-transparent" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Registration Plate Number</label>
              <input name="vehicleNumber" disabled={!isEditing} value={data.vehicleNumber || ""} onChange={handleChange} className="w-full p-2 border rounded-xl font-mono uppercase text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Price Per KM (₹)</label>
              <input name="pricePerKm" disabled={!isEditing} value={data.pricePerKm || ""} onChange={handleChange} className="w-full p-2 border rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Price Per Day (₹)</label>
              <input name="pricePerDay" disabled={!isEditing} value={data.pricePerDay || ""} onChange={handleChange} className="w-full p-2 border rounded-xl text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Driver Name</label>
              <input name="driverName" disabled={!isEditing} value={data.driverName || ""} onChange={handleChange} className="w-full p-2 border rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Contact Phone Number</label>
              <input name="contactNumber" disabled={!isEditing} value={data.contactNumber || ""} onChange={handleChange} className="w-full p-2 border rounded-xl text-sm font-mono" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase">Vehicle Notes & Description</label>
            <textarea name="description" disabled={!isEditing} value={data.description || ""} onChange={handleChange} rows={3} className="w-full p-3 border rounded-xl text-sm resize-none" />
          </div>
        </div>

        {/* PHOTO ASSET GALLERY */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-700 uppercase flex items-center gap-2">
            <ImageIcon size={16} /> Vehicle Photos ({data.photos?.length || 0})
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {(data.photos || []).map((photo, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden border">
                <img src={getImageUrl(photo)} className="w-full h-full object-cover" alt="" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {deleteMode && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[400px] shadow-2xl">
            <h3 className="text-lg font-bold">{deleteMode === "hard" ? "Permanent Delete?" : "Soft Delete?"}</h3>
            <p className="text-sm text-gray-600 mt-2">
              {deleteMode === "hard" ? "Erase vehicle permanently from database?" : "Hide vehicle from public listings?"}
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setDeleteMode(null)} className="px-4 py-2 border rounded-xl text-sm font-bold">Cancel</button>
              <button onClick={deleteMode === "hard" ? handleHardDelete : handleSoftDelete} className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl text-sm">
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleDetails;