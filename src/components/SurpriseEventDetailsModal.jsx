import React, { useState } from "react";
import {
  X,
  Sparkles,
  Calendar,
  MapPin,
  Tag,
  Film,
  UploadCloud,
  Edit,
  Trash2,
  RotateCcw,
  AlertTriangle,
  Clock,
  User,
  CheckCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Play,
  Save,
  Eye,
  Loader2,
} from "lucide-react";
import {
  updateSurpriseEvent,
  softDeleteSurpriseEvent,
  restoreSurpriseEvent,
  hardDeleteSurpriseEvent,
} from "../api/surpriseEvents.api";
import toast from "react-hot-toast";
import UploadProgressBar from "./UploadProgressBar";

const SurpriseEventDetailsModal = ({
  event,
  isOpen,
  onClose,
  onUpdated,
  onDeleted,
}) => {
  const [mode, setMode] = useState("view"); // "view" | "edit"
  const [selectedVideoIdx, setSelectedVideoIdx] = useState(0);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: event?.title || "",
    description: event?.description || "",
    city: event?.city || "Jhansi",
    location: event?.location || "",
    eventType: event?.eventType || "festival",
    eventDate: event?.eventDate
      ? new Date(event.eventDate).toISOString().split("T")[0]
      : "",
    endDate: event?.endDate
      ? new Date(event.endDate).toISOString().split("T")[0]
      : "",
    entryFee: event?.dynamicMetadata?.entryFee || "Free",
    organizer: event?.dynamicMetadata?.organizer || "",
    isActive: event?.isActive !== undefined ? event.isActive : true,
  });

  const [removedPhotoIds, setRemovedPhotoIds] = useState([]);
  const [removedVideoIds, setRemovedVideoIds] = useState([]);
  const [newPhotos, setNewPhotos] = useState(null);
  const [newVideos, setNewVideos] = useState(null);

  // Soft delete handler
  const handleSoftDelete = async () => {
    if (
      !window.confirm(
        `Move "${event.title}" to Trash? It will be hidden from mobile users.`
      )
    )
      return;
    setIsSubmitting(true);
    try {
      await softDeleteSurpriseEvent(event._id);
      toast.success("Event moved to trash (soft-deleted).");
      onDeleted();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Soft delete failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Restore handler
  const handleRestore = async () => {
    setIsSubmitting(true);
    try {
      await restoreSurpriseEvent(event._id);
      toast.success("Event restored to active state!");
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Restore failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hard delete handler
  const handleHardDelete = async () => {
    const confirmed = window.confirm(
      `⚠️ PERMANENT DELETION WARNING:\n\nAre you absolutely sure you want to permanently delete "${event.title}"?\n\nThis will completely remove the record from the database and delete all photos and videos from Cloudinary. This action CANNOT be undone!`
    );
    if (!confirmed) return;

    setIsSubmitting(true);
    try {
      await hardDeleteSurpriseEvent(event._id);
      toast.success("Event permanently deleted from DB & Cloudinary.");
      onDeleted();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Hard delete failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save edit handler
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("title", editForm.title);
      data.append("description", editForm.description);
      data.append("city", editForm.city);
      data.append("location", editForm.location);
      data.append("eventType", editForm.eventType);
      data.append("eventDate", editForm.eventDate);
      if (editForm.endDate) data.append("endDate", editForm.endDate);
      data.append("isActive", editForm.isActive ? "true" : "false");

      const dynamicMeta = {
        ...(event.dynamicMetadata || {}),
        entryFee: editForm.entryFee,
        organizer: editForm.organizer,
      };
      data.append("dynamicMetadata", JSON.stringify(dynamicMeta));

      if (removedPhotoIds.length > 0) {
        data.append("removedPhotoIds", JSON.stringify(removedPhotoIds));
      }
      if (removedVideoIds.length > 0) {
        data.append("removedVideoIds", JSON.stringify(removedVideoIds));
      }

      if (newPhotos) {
        for (let i = 0; i < newPhotos.length; i++) {
          data.append("photos", newPhotos[i]);
        }
      }

      if (newVideos) {
        for (let i = 0; i < newVideos.length; i++) {
          data.append("videos", newVideos[i]);
        }
      }

      await updateSurpriseEvent(event._id, data);
      toast.success("Surprise event details updated successfully!");
      setMode("view");
      onUpdated();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update event");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !event) return null;

  const activePhotos = (event.photos || []).filter(
    (p) => !removedPhotoIds.includes(p.public_id)
  );
  const activeVideos = (event.videos || []).filter(
    (v) => !removedVideoIds.includes(v.public_id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100">
        {/* Sticky Frosted Header */}
        <div className="sticky top-0 z-20 flex justify-between items-center px-6 py-4 bg-white/95 backdrop-blur border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs shrink-0">
              <Sparkles size={22} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-slate-900 text-lg truncate max-w-md">
                  {event.title}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 text-purple-700">
                  {event.eventType}
                </span>
                {event.isDeleted ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-700 flex items-center gap-1">
                    <Trash2 size={11} /> In Trash (Soft Deleted)
                  </span>
                ) : event.isActive ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-700 flex items-center gap-1">
                    <CheckCircle size={11} /> Active
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-600">
                    Draft / Inactive
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium truncate">
                {event.location}, {event.city} • ID: {event._id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {mode === "view" ? (
              <button
                onClick={() => setMode("edit")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                <Edit size={14} /> Edit
              </button>
            ) : (
              <button
                onClick={() => setMode("view")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                <Eye size={14} /> Overview
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {event.isDeleted && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-amber-600 shrink-0" size={20} />
                <div>
                  <p className="text-sm font-bold text-amber-900">
                    This event is soft-deleted (in Trash)
                  </p>
                  <p className="text-xs text-amber-700">
                    It is currently hidden from mobile app users. You can restore
                    it or delete it permanently.
                  </p>
                </div>
              </div>
              <button
                onClick={handleRestore}
                disabled={isSubmitting}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <RotateCcw size={14} /> Restore Event
              </button>
            </div>
          )}

          {mode === "view" ? (
            /* ══════════════════════════════════════════════
               VIEW / OVERVIEW MODE
               ══════════════════════════════════════════════ */
            <div className="space-y-6">
              {/* Media Section: Video Player & Photo Gallery */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Videos Player */}
                <div className="bg-slate-900 rounded-2xl p-4 text-white space-y-3 flex flex-col justify-between shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Film size={18} className="text-pink-400" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
                        Event Videos & Reels ({event.videos?.length || 0})
                      </h4>
                    </div>
                    {event.videos && event.videos.length > 1 && (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                        {event.videos.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setSelectedVideoIdx(i)}
                            className={`w-6 h-6 rounded-lg text-xs font-bold transition ${
                              selectedVideoIdx === i
                                ? "bg-pink-600 text-white"
                                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {event.videos && event.videos.length > 0 ? (
                    <div className="space-y-2">
                      <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                        <video
                          key={event.videos[selectedVideoIdx]?.url}
                          src={event.videos[selectedVideoIdx]?.url}
                          controls
                          playsInline
                          className="w-full h-full max-h-72 object-contain"
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                        <span className="truncate max-w-[200px]">
                          Public ID: {event.videos[selectedVideoIdx]?.public_id}
                        </span>
                        <a
                          href={event.videos[selectedVideoIdx]?.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-pink-400 hover:text-pink-300 flex items-center gap-1 font-semibold"
                        >
                          <ExternalLink size={11} /> Open Video
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="py-16 text-center text-slate-500 text-xs font-medium bg-slate-800/50 rounded-xl border border-dashed border-slate-800">
                      No videos uploaded for this surprise event.
                    </div>
                  )}
                </div>

                {/* 2. Photo Showcase */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles size={18} className="text-purple-600" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                        Event Photos ({event.photos?.length || 0})
                      </h4>
                    </div>
                    {event.photos && event.photos.length > 1 && (
                      <span className="text-[11px] font-bold text-slate-500">
                        {selectedPhotoIdx + 1} of {event.photos.length}
                      </span>
                    )}
                  </div>

                  {event.photos && event.photos.length > 0 ? (
                    <div className="space-y-3">
                      <div className="relative rounded-xl overflow-hidden bg-slate-200 aspect-video flex items-center justify-center">
                        <img
                          src={event.photos[selectedPhotoIdx]?.url}
                          alt="Surprise Event Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {event.photos.map((p, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedPhotoIdx(idx)}
                            className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                              selectedPhotoIdx === idx
                                ? "border-purple-600 ring-2 ring-purple-200"
                                : "border-transparent opacity-70 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={p.url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="py-16 text-center text-slate-400 text-xs font-medium bg-white rounded-xl border border-dashed border-slate-200">
                      No photos uploaded for this surprise event.
                    </div>
                  )}
                </div>
              </div>

              {/* Description Box */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-xs">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Full Description
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>

              {/* Comprehensive Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase">
                    <Calendar size={13} className="text-purple-600" /> Event Date
                  </div>
                  <p className="text-sm font-black text-slate-900">
                    {new Date(event.eventDate).toLocaleDateString(undefined, {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase">
                    <MapPin size={13} className="text-purple-600" /> Location
                  </div>
                  <p className="text-sm font-black text-slate-900 truncate">
                    {event.location}
                  </p>
                  <p className="text-xs text-slate-500 font-semibold">{event.city}</p>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase">
                    <Tag size={13} className="text-emerald-600" /> Entry Fee
                  </div>
                  <p className="text-sm font-black text-emerald-700">
                    {event.dynamicMetadata?.entryFee || "Free"}
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase">
                    <User size={13} className="text-blue-600" /> Organizer
                  </div>
                  <p className="text-sm font-black text-slate-900 truncate">
                    {event.dynamicMetadata?.organizer || "City Culture Club"}
                  </p>
                </div>
              </div>

              {/* Extra Dynamic Metadata (if any) */}
              {event.dynamicMetadata &&
                Object.keys(event.dynamicMetadata).filter(
                  (k) => !["entryFee", "organizer"].includes(k)
                ).length > 0 && (
                  <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-purple-700">
                      Additional Metadata Attributes
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.entries(event.dynamicMetadata)
                        .filter(([k]) => !["entryFee", "organizer"].includes(k))
                        .map(([key, val]) => (
                          <div
                            key={key}
                            className="bg-white p-3 rounded-xl border border-purple-100 shadow-2xs"
                          >
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">
                              {key}
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              {typeof val === "object"
                                ? JSON.stringify(val)
                                : String(val)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
            </div>
          ) : (
            /* ══════════════════════════════════════════════
               EDIT DETAILS MODE
               ══════════════════════════════════════════════ */
            <form onSubmit={handleSaveEdit} className="space-y-6">
              {/* Basic Fields */}
              <div className="bg-slate-50/60 border border-slate-200 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                  1. General Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Event Category
                    </label>
                    <select
                      value={editForm.eventType}
                      onChange={(e) =>
                        setEditForm({ ...editForm, eventType: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition outline-hidden font-semibold"
                    >
                      <option value="festival">Festival</option>
                      <option value="cultural">Cultural</option>
                      <option value="music">Music</option>
                      <option value="food">Food</option>
                      <option value="sports">Sports</option>
                      <option value="popup">Pop-Up</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.city}
                      onChange={(e) =>
                        setEditForm({ ...editForm, city: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Venue / Specific Location *
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.location}
                      onChange={(e) =>
                        setEditForm({ ...editForm, location: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={editForm.eventDate}
                      onChange={(e) =>
                        setEditForm({ ...editForm, eventDate: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={editForm.endDate}
                      onChange={(e) =>
                        setEditForm({ ...editForm, endDate: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Entry Fee
                    </label>
                    <input
                      type="text"
                      value={editForm.entryFee}
                      onChange={(e) =>
                        setEditForm({ ...editForm, entryFee: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Organizer
                    </label>
                    <input
                      type="text"
                      value={editForm.organizer}
                      onChange={(e) =>
                        setEditForm({ ...editForm, organizer: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition outline-hidden resize-none"
                  />
                </div>
              </div>

              {/* Manage Existing Photos */}
              <div className="bg-slate-50/60 border border-slate-200 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                  2. Existing Photos ({activePhotos.length})
                </h4>

                {activePhotos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {activePhotos.map((photo) => (
                      <div
                        key={photo.public_id}
                        className="relative group rounded-xl overflow-hidden aspect-square border border-slate-200 bg-white"
                      >
                        <img
                          src={photo.url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setRemovedPhotoIds([...removedPhotoIds, photo.public_id])
                          }
                          className="absolute top-1 right-1 p-1 bg-red-600/90 text-white rounded-lg opacity-80 hover:opacity-100 transition"
                          title="Remove Photo"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No existing photos</p>
                )}

                {/* Upload More Photos */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-purple-700 mb-1">
                    + Upload Additional Photos
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setNewPhotos(e.target.files)}
                    className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer"
                  />
                </div>
              </div>

              {/* Manage Existing Videos */}
              <div className="bg-slate-50/60 border border-slate-200 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  3. Existing Videos ({activeVideos.length})
                </h4>

                {activeVideos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {activeVideos.map((video) => (
                      <div
                        key={video.public_id}
                        className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 p-2 flex flex-col justify-between"
                      >
                        <video
                          src={video.url}
                          className="w-full h-24 object-contain rounded-lg bg-black"
                          controls
                        />
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                            {video.public_id}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setRemovedVideoIds([...removedVideoIds, video.public_id])
                            }
                            className="p-1 bg-red-600/90 text-white rounded-lg hover:bg-red-700 transition"
                            title="Remove Video"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No existing videos</p>
                )}

                {/* Upload More Videos */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-indigo-700 mb-1">
                    + Upload Additional Teaser Videos / Reels
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={(e) => setNewVideos(e.target.files)}
                    className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 cursor-pointer"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col gap-3 pt-4 border-t border-slate-200">
                <UploadProgressBar isUploading={isSubmitting} />
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setMode("view")}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-100 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md flex items-center gap-2 transition disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Uploading & Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Sticky Frosted Footer with Soft & Hard Delete Actions */}
        <div className="sticky bottom-0 z-20 flex flex-wrap justify-between items-center gap-3 px-6 py-4 bg-slate-50/95 backdrop-blur border-t border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            {!event.isDeleted ? (
              <button
                type="button"
                onClick={handleSoftDelete}
                disabled={isSubmitting}
                className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                title="Hide from mobile app users without erasing data"
              >
                <Trash2 size={13} />
                Soft Delete (Move to Trash)
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRestore}
                disabled={isSubmitting}
                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              >
                <RotateCcw size={13} />
                Restore Event
              </button>
            )}

            <button
              type="button"
              onClick={handleHardDelete}
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
              title="Permanently erase from DB and delete Cloudinary files"
            >
              <Trash2 size={13} />
              Permanent Delete (Hard)
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition shadow-2xs"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurpriseEventDetailsModal;
