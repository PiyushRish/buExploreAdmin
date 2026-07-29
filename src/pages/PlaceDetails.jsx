import React, { useState, useContext, useEffect } from "react";
import {
  Image as ImageIcon, Film, ExternalLink,
  Globe, Compass, Tag, Calendar, Eye, Heart, UploadCloud, AlertTriangle
} from "lucide-react";
import { GenericDetailsHeader } from "../components/layout/GenericDetailsHeader.jsx";
import { PlaceContext } from "../contextApi/places.jsx";
import {
  useDeletePlaceMutation,
  useUpdatePlaceMutation,
  useRestorePlaceMutation,
} from "../mutations/placeMutation.js";
import toast from "react-hot-toast";

const getImageUrl = (photo) => {
  if (!photo) return "https://picsum.photos/600/400";
  if (typeof photo === "string") return photo;
  return photo.url || photo.secure_url || "https://picsum.photos/600/400";
};

const PlaceDetails = () => {
  const { clickedPlace, setClickedPlaceHandler } = useContext(PlaceContext);

  const [data, setData] = useState(clickedPlace || {});
  const [isEditing, setIsEditing] = useState(false);
  const [deleteMode, setDeleteMode] = useState(null); // 'soft' | 'hard' | null

  const updatePlaceMutation = useUpdatePlaceMutation();
  const deletePlaceMutation = useDeletePlaceMutation();
  const restorePlaceMutation = useRestorePlaceMutation();

  const [newPhotoFiles, setNewPhotoFiles] = useState([]);
  const [newVideoFile, setNewVideoFile] = useState(null);

  useEffect(() => {
    if (clickedPlace) {
      setData(clickedPlace);
    }
  }, [clickedPlace]);

  if (!clickedPlace) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [name]: name === "lat" || name === "lng" ? Number(value) || 0 : value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      const payload = {
        name: data.name,
        description: data.description,
        category: data.category,
        city: data.city,
        ytVideoLink: data.ytVideoLink,
        likes: Number(data.likes) || 0,
        location: {
          address: data.location?.address || "",
          lat: Number(data.location?.lat) || 0,
          lng: Number(data.location?.lng) || 0,
        },
      };

      formData.append("data", JSON.stringify(payload));
      newPhotoFiles.forEach((file) => formData.append("placePhoto", file));
      if (newVideoFile) formData.append("placeVideo", newVideoFile);

      await updatePlaceMutation.mutateAsync({ id: data._id, formData });
      setIsEditing(false);
      setNewPhotoFiles([]);
      setNewVideoFile(null);
      toast.success("Destination details saved successfully!");
    } catch (_err) {
      toast.error(_err?.response?.data?.message || "Failed to update destination");
    }
  };

  const handleSoftDelete = async () => {
    try {
      await deletePlaceMutation.mutateAsync({ id: data._id, hard: false });
      toast.success("Place soft-deleted successfully");
      setDeleteMode(null);
      setClickedPlaceHandler(null);
    } catch (_err) {
      toast.error("Soft deletion failed");
    }
  };

  const handleRestore = async () => {
    try {
      await restorePlaceMutation.mutateAsync(data._id);
      setData((prev) => ({ ...prev, isDeleted: false, deletedAt: null }));
      toast.success("Place restored successfully!");
    } catch (_err) {
      toast.error("Restoration failed");
    }
  };

  const handleHardDelete = async () => {
    try {
      await deletePlaceMutation.mutateAsync({ id: data._id, hard: true });
      toast.error("Place permanently removed from database");
      setDeleteMode(null);
      setClickedPlaceHandler(null);
    } catch (_err) {
      toast.error("Permanent deletion failed");
    }
  };

  const CATEGORY_OPTIONS = [
    "Heritage",
    "Pilgrimage",
    "WildLife",
    "WaterBody",
    "JhansiSmartCity",
    "Treasures",
  ];

  const videoUrl = data.videos?.[0]?.url;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      {/* LEFT FORM & METADATA PANEL */}
      <div className="w-[70%] h-full flex flex-col bg-white border-r shadow-sm z-10">
        
        <GenericDetailsHeader
          onBack={() => setClickedPlaceHandler(null)}
          isDeleted={data.isDeleted}
          isEditing={isEditing}
          isPending={updatePlaceMutation.isPending}
          onRestore={handleRestore}
          onSoftDeleteClick={() => setDeleteMode("soft")}
          onHardDeleteClick={() => setDeleteMode("hard")}
          onSave={handleSave}
          onEditClick={() => setIsEditing(true)}
          backLabel="Back to Destinations"
        />

        {/* CONTENT FIELD CONTAINER */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/50">
          {/* STATUS BADGES & ID */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">
                ID: <span className="font-mono text-gray-700">{data._id}</span>
              </span>
              {data.isDeleted ? (
                <span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-bold">
                  Status: Soft Deleted ({new Date(data.deletedAt).toLocaleDateString()})
                </span>
              ) : (
                <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-bold">
                  Status: Active & Public
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs font-bold text-gray-600">
              <span className="flex items-center gap-1">
                <Heart size={14} className="text-red-500 fill-red-500" />
                Likes:
                <input
                  type="number"
                  name="likes"
                  disabled={!isEditing}
                  value={data.likes || 0}
                  onChange={handleChange}
                  className="w-16 border rounded px-1 text-center ml-1 disabled:bg-transparent"
                />
              </span>
            </div>
          </div>

          {/* BASIC INFORMATION */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
            <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
              <Tag size={16} /> Basic Destination Attributes
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Destination Name
                </label>
                <input
                  name="name"
                  disabled={!isEditing}
                  value={data.name || ""}
                  onChange={handleChange}
                  className="w-full p-2.5 border-b focus:border-blue-600 outline-none font-bold text-lg bg-transparent disabled:border-transparent"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Category
                </label>
                <select
                  name="category"
                  disabled={!isEditing}
                  value={data.category || ""}
                  onChange={handleChange}
                  className="w-full p-2.5 border rounded-xl bg-white disabled:bg-gray-50 font-semibold"
                >
                  <option value="">Select Category</option>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  City
                </label>
                <input
                  name="city"
                  disabled={!isEditing}
                  value={data.city || "Jhansi"}
                  onChange={handleChange}
                  className="w-full p-2.5 border rounded-xl bg-white disabled:bg-gray-50 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  YouTube Video Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    name="ytVideoLink"
                    disabled={!isEditing}
                    value={data.ytVideoLink || ""}
                    onChange={handleChange}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full p-2.5 border rounded-xl bg-white disabled:bg-gray-50 text-sm text-blue-600 font-medium"
                  />
                  {data.ytVideoLink && (
                    <a
                      href={data.ytVideoLink}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Full Description
              </label>
              <textarea
                name="description"
                disabled={!isEditing}
                value={data.description || ""}
                onChange={handleChange}
                rows={4}
                className="w-full p-3 border rounded-xl bg-white disabled:bg-gray-50 text-sm text-gray-700 leading-relaxed resize-none"
              />
            </div>
          </div>

          {/* LOCATION & GEOLOCATION METADATA */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
            <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
              <Compass size={16} /> Location & GPS Mapping Data
            </h3>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Street Address / Landmark
              </label>
              <input
                name="address"
                disabled={!isEditing}
                value={data.location?.address || ""}
                onChange={handleLocationChange}
                className="w-full p-2.5 border rounded-xl bg-white disabled:bg-gray-50 text-sm font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="lat"
                  disabled={!isEditing}
                  value={data.location?.lat || 0}
                  onChange={handleLocationChange}
                  className="w-full p-2.5 border rounded-xl bg-white disabled:bg-gray-50 text-sm font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="lng"
                  disabled={!isEditing}
                  value={data.location?.lng || 0}
                  onChange={handleLocationChange}
                  className="w-full p-2.5 border rounded-xl bg-white disabled:bg-gray-50 text-sm font-mono"
                />
              </div>
            </div>
          </div>

          {/* PHOTO GALLERY MANAGEMENT */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <ImageIcon size={16} /> Photo Assets ({data.photos?.length || 0})
              </h3>

              {isEditing && (
                <label className="cursor-pointer text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100">
                  + Upload Additional Photos
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      setNewPhotoFiles((prev) => [...prev, ...Array.from(e.target.files)])
                    }
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="grid grid-cols-4 gap-4">
              {(data.photos || []).map((photo, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border bg-gray-100 group shadow-sm">
                  <img src={getImageUrl(photo)} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end text-[10px] text-white font-mono truncate">
                    {photo.publicId || `Photo ${idx + 1}`}
                  </div>
                </div>
              ))}
            </div>

            {newPhotoFiles.length > 0 && (
              <div className="pt-4 border-t">
                <span className="text-xs font-bold text-gray-500 mb-2 block">
                  Pending File Uploads ({newPhotoFiles.length}):
                </span>
                <div className="grid grid-cols-6 gap-3">
                  {newPhotoFiles.map((file, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden border">
                      <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - VIDEO REEL PREVIEW & VIDEO ASSET MANAGEMENT */}
      <div className="w-[30%] bg-[#0a0a0a] flex flex-col items-center justify-between p-6 relative">
        <div className="w-full text-center text-white/80 border-b border-white/10 pb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">
            Server Reel Preview
          </span>
          <h4 className="text-sm font-bold text-white truncate">{data.name}</h4>
        </div>

        <div className="w-full max-w-[280px] aspect-[9/16] bg-black rounded-[2.5rem] border-[6px] border-[#1a1a1a] overflow-hidden shadow-2xl relative my-auto">
          {videoUrl ? (
            <video
              src={videoUrl}
              autoPlay
              muted
              loop
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 p-6 text-center">
              <Film size={40} className="mb-2 opacity-50" />
              <p className="text-xs font-bold">No Reel Video Asset Uploaded</p>
            </div>
          )}
        </div>

        {isEditing && (
          <div className="w-full bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/10">
            <input
              type="file"
              id="reelVideoInput"
              accept="video/*"
              onChange={(e) => setNewVideoFile(e.target.files[0])}
              className="hidden"
            />
            <label htmlFor="reelVideoInput" className="cursor-pointer text-xs font-bold text-purple-300 flex items-center justify-center gap-2">
              <UploadCloud size={16} />
              {newVideoFile ? newVideoFile.name : "Replace Vertical Video Reel"}
            </label>
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteMode && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white rounded-2xl p-6 w-[420px] shadow-2xl">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
              deleteMode === "hard" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"
            }`}>
              <AlertTriangle size={24} />
            </div>

            <h3 className="text-xl font-bold text-gray-900">
              {deleteMode === "hard" ? "Confirm Permanent Hard Delete?" : "Confirm Soft Delete?"}
            </h3>

            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              {deleteMode === "hard" ? (
                <>
                  This action will <span className="font-bold text-red-600">permanently erase</span> "{data.name}" and all media files from the database. This cannot be undone.
                </>
              ) : (
                <>
                  This will hide "{data.name}" from public feeds while preserving all analytics and historical records. You can restore it later.
                </>
              )}
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteMode(null)}
                className="px-4 py-2 border rounded-xl text-sm font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={deleteMode === "hard" ? handleHardDelete : handleSoftDelete}
                className={`px-5 py-2 text-white font-bold rounded-xl text-sm shadow-md ${
                  deleteMode === "hard" ? "bg-red-600 hover:bg-red-700" : "bg-yellow-600 hover:bg-yellow-700"
                }`}
              >
                {deleteMode === "hard" ? "Permanently Erase" : "Soft Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceDetails;