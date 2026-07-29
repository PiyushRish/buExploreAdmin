import React, { useState } from "react";
import { ArrowLeft, Save, Edit2, Trash2, AlertTriangle, RotateCcw, Image as ImageIcon, Star, Phone, Languages } from "lucide-react";
import axiosClient from "../api/axiosClient";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const getImageUrl = (photo) => {
  if (!photo) return "https://picsum.photos/400/400";
  if (typeof photo === "string") return photo;
  return photo.url || photo.secure_url || "https://picsum.photos/400/400";
};

const GuideDetails = ({ guide, onBack }) => {
  const queryClient = useQueryClient();
  const [data, setData] = useState(guide);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteMode, setDeleteMode] = useState(null);
  const [isPending, setIsPending] = useState(false);

  const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setIsPending(true);
    try {
      const formData = new FormData();
      const payload = {
        name: data.name,
        bio: data.bio,
        phoneNumber: data.phoneNumber,
        pricePerDay: data.pricePerDay,
        languages: typeof data.languages === "string" ? data.languages.split(",").map((s) => s.trim()) : data.languages,
      };

      formData.append("data", JSON.stringify(payload));
      await axiosClient.patch(`/services/guides/${data._id}`, formData);
      queryClient.invalidateQueries({ queryKey: ["guides"] });
      setIsEditing(false);
      toast.success("Guide profile updated!");
    } catch (_err) {
      toast.error("Update failed");
    } finally {
      setIsPending(false);
    }
  };

  const handleSoftDelete = async () => {
    try {
      await axiosClient.delete(`/services/guides/${data._id}`, { params: { hard: false } });
      queryClient.invalidateQueries({ queryKey: ["guides"] });
      toast.success("Guide soft-deleted");
      onBack();
    } catch (_err) {
      toast.error("Soft delete failed");
    }
  };

  const handleRestore = async () => {
    try {
      await axiosClient.patch(`/services/guides/restore/${data._id}`);
      queryClient.invalidateQueries({ queryKey: ["guides"] });
      setData({ ...data, isDeleted: false, deletedAt: null });
      toast.success("Guide restored!");
    } catch (_err) {
      toast.error("Restore failed");
    }
  };

  const handleHardDelete = async () => {
    try {
      await axiosClient.delete(`/services/guides/${data._id}`, { params: { hard: true } });
      queryClient.invalidateQueries({ queryKey: ["guides"] });
      toast.error("Guide permanently erased");
      onBack();
    } catch (_err) {
      toast.error("Permanent delete failed");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      <div className="h-16 border-b px-8 flex items-center justify-between bg-white sticky top-0 z-20">
        <button onClick={onBack} className="flex items-center text-gray-600 font-semibold hover:text-gray-900">
          <ArrowLeft size={18} className="mr-2" /> Back to Guides
        </button>

        <div className="flex items-center gap-2">
          {data.isDeleted ? (
            <button onClick={handleRestore} className="flex items-center px-4 py-2 rounded-xl bg-green-50 text-green-700 font-bold text-xs border border-green-200">
              <RotateCcw size={14} className="mr-1.5" /> Restore Guide
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
              isEditing ? "bg-purple-600 text-white shadow-md" : "bg-gray-100 text-gray-700 border"
            }`}
          >
            {isEditing ? <><Save size={14} className="mr-1.5" /> Save Changes</> : <><Edit2 size={14} className="mr-1.5" /> Edit All Fields</>}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6 max-w-4xl mx-auto w-full">
        <div className="bg-white p-6 rounded-2xl border space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b pb-3">
            <span className="text-xs font-mono text-gray-400">ID: {data._id}</span>
            <span className={`text-xs px-3 py-1 rounded-full font-bold ${data.isDeleted ? "bg-red-100 text-red-700" : "bg-purple-100 text-purple-700"}`}>
              {data.isDeleted ? "Status: Soft Deleted" : "Status: Active"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Guide Name</label>
              <input name="name" disabled={!isEditing} value={data.name || ""} onChange={handleChange} className="w-full p-2 border-b font-bold text-lg bg-transparent" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Price Per Day (₹)</label>
              <input name="pricePerDay" disabled={!isEditing} value={data.pricePerDay || ""} onChange={handleChange} className="w-full p-2 border rounded-xl text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Phone Number</label>
              <input name="phoneNumber" disabled={!isEditing} value={data.phoneNumber || ""} onChange={handleChange} className="w-full p-2 border rounded-xl text-sm font-mono" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Languages Spoken</label>
              <input name="languages" disabled={!isEditing} value={Array.isArray(data.languages) ? data.languages.join(", ") : data.languages || ""} onChange={handleChange} className="w-full p-2 border rounded-xl text-sm" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase">Bio / Experience Details</label>
            <textarea name="bio" disabled={!isEditing} value={data.bio || ""} onChange={handleChange} rows={4} className="w-full p-3 border rounded-xl text-sm resize-none" />
          </div>
        </div>

        {/* PHOTO ASSETS */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-700 uppercase flex items-center gap-2">
            <ImageIcon size={16} /> Guide Photo Assets ({data.photos?.length || (data.profilePhoto ? 1 : 0)})
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {(data.photos || [data.profilePhoto]).filter(Boolean).map((photo, i) => (
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
              {deleteMode === "hard" ? "Erase this guide permanently from database?" : "Hide this guide from public search?"}
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

export default GuideDetails;