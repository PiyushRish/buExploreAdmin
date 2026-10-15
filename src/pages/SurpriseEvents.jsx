import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  X,
  MapPin,
  Calendar,
  Tag,
  RefreshCw,
  UploadCloud,
  Film,
  Video,
  Eye,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  getSurpriseEvents,
  addSurpriseEvent,
  deleteSurpriseEvent,
  softDeleteSurpriseEvent,
  restoreSurpriseEvent,
  hardDeleteSurpriseEvent,
} from "../api/surpriseEvents.api";
import toast from "react-hot-toast";
import NotificationDraftSection from "../components/NotificationDraftSection.jsx";
import { useNotificationDraft } from "../utils/useNotificationDraft.js";
import SurpriseEventDetailsModal from "../components/SurpriseEventDetailsModal.jsx";
import UploadProgressBar from "../components/UploadProgressBar.jsx";

const SurpriseEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterTab, setFilterTab] = useState("active"); // "active" | "trash" | "all"
  const { notif, setNotif, sendIfEnabled, resetNotif } = useNotificationDraft("surprise_event");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    city: "Jhansi",
    location: "",
    eventType: "festival",
    eventDate: "",
    photos: [],
    videos: [],
    entryFee: "Free",
    organizer: "City Culture Club",
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await getSurpriseEvents({ includeDeleted: "true" });
      const rawList = data?.events || data?.data || (Array.isArray(data) ? data : []);
      setEvents(rawList);
    } catch (err) {
      toast.error("Failed to load surprise events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsPublishing(true);
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("city", formData.city);
      data.append("location", formData.location);
      data.append("eventType", formData.eventType);
      data.append("eventDate", formData.eventDate);

      // Dynamic Metadata JSON
      const metadata = {
        entryFee: formData.entryFee,
        organizer: formData.organizer,
      };
      data.append("dynamicMetadata", JSON.stringify(metadata));

      if (formData.photos) {
        for (let i = 0; i < formData.photos.length; i++) {
          data.append("photos", formData.photos[i]);
        }
      }

      if (formData.videos) {
        for (let i = 0; i < formData.videos.length; i++) {
          data.append("videos", formData.videos[i]);
        }
      }

      const res = await addSurpriseEvent(data);
      await sendIfEnabled({ serviceId: res?.event?._id || res?.data?._id || res?._id });
      toast.success("Surprise Event published successfully!");
      setShowAddModal(false);
      resetNotif();
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to publish event");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleToggleSoftDelete = async (event, e) => {
    e?.stopPropagation();
    try {
      if (event.isDeleted) {
        await restoreSurpriseEvent(event._id);
        toast.success("Event restored to active list!");
      } else {
        await softDeleteSurpriseEvent(event._id);
        toast.success("Event moved to trash (soft deleted).");
      }
      fetchEvents();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Action failed");
    }
  };

  const activeCount = events.filter((e) => !e.isDeleted).length;
  const trashCount = events.filter((e) => e.isDeleted).length;

  const filteredEvents = events.filter((e) => {
    if (filterTab === "active") return !e.isDeleted;
    if (filterTab === "trash") return e.isDeleted;
    return true;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="text-purple-600" size={24} />
            City Surprise Events
          </h2>
          <p className="text-xs text-slate-500">
            Publish dynamic city & nearby popup events with flexible metadata, photos & videos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchEvents}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            title="Refresh events list"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold shadow-md transition"
          >
            <Plus size={18} />
            Publish Event
          </button>
        </div>
      </div>

      {/* Filter Tabs: Active vs Trash vs All */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
        <button
          onClick={() => setFilterTab("active")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            filterTab === "active"
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <CheckCircle size={13} />
          Active Events
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {activeCount}
          </span>
        </button>

        <button
          onClick={() => setFilterTab("trash")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            filterTab === "trash"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Trash2 size={13} />
          In Trash / Soft Deleted
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {trashCount}
          </span>
        </button>

        <button
          onClick={() => setFilterTab("all")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            filterTab === "all"
              ? "bg-slate-800 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All Events ({events.length})
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading surprise events...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="py-20 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          {filterTab === "trash"
            ? "Trash is empty. No soft-deleted events found."
            : 'No surprise events found. Click "Publish Event" to create one.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event._id}
              onClick={() => setSelectedEvent(event)}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer overflow-hidden flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  {event.photos?.[0]?.url ? (
                    <img
                      src={event.photos[0].url}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-purple-400 font-bold bg-purple-50">
                      Surprise Event
                    </div>
                  )}

                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                    <span className="px-3 py-1 bg-purple-900/80 backdrop-blur-xs text-white text-xs font-bold rounded-full uppercase">
                      {event.eventType}
                    </span>
                    {event.isDeleted ? (
                      <span className="px-2.5 py-1 bg-amber-900/85 backdrop-blur-xs text-white text-[10px] font-extrabold rounded-full uppercase flex items-center gap-1">
                        <AlertTriangle size={10} /> Trash
                      </span>
                    ) : event.isActive ? (
                      <span className="px-2.5 py-1 bg-emerald-900/85 backdrop-blur-xs text-white text-[10px] font-extrabold rounded-full uppercase flex items-center gap-1">
                        <CheckCircle size={10} /> Active
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-extrabold rounded-full uppercase">
                        Inactive
                      </span>
                    )}
                  </div>

                  {event.videos && event.videos.length > 0 && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold rounded-full flex items-center gap-1">
                      <Film size={12} className="text-pink-400" />
                      {event.videos.length} Video{event.videos.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-purple-700 transition">
                    {event.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{event.description}</p>

                  <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-purple-600" />
                      <span>{event.location}, {event.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-purple-600" />
                      <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                    </div>
                    {event.dynamicMetadata?.entryFee && (
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-emerald-600" />
                        <span>Fee: {event.dynamicMetadata.entryFee}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Quick Controls */}
              <div className="p-4 pt-0 grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => setSelectedEvent(event)}
                  className="py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Eye size={13} /> View Details
                </button>

                {event.isDeleted ? (
                  <button
                    type="button"
                    onClick={(e) => handleToggleSoftDelete(event, e)}
                    className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    title="Restore to active events list"
                  >
                    <RotateCcw size={13} /> Restore
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => handleToggleSoftDelete(event, e)}
                    className="py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    title="Move to trash (soft delete)"
                  >
                    <Trash2 size={13} /> Soft Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── DETAILS, MEDIA & EDIT MODAL ── */}
      <SurpriseEventDetailsModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onUpdated={fetchEvents}
        onDeleted={fetchEvents}
      />

      {/* ── PUBLISH EVENT MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100">
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 flex justify-between items-center px-6 py-4 bg-white/95 backdrop-blur border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs">
                  <Sparkles size={22} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">
                    Publish Surprise Event
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Broadcast pop-up gatherings, cultural fests, and flash events
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleCreate} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
                {/* SECTION 1: Event Essentials */}
                <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                    1. Event Details & Scheduling
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Event Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Secret Lantern Night Fest"
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition outline-hidden"
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Event Type</label>
                      <select
                        value={formData.eventType}
                        onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition outline-hidden"
                      >
                        <option value="festival">Festival</option>
                        <option value="cultural">Cultural</option>
                        <option value="music">Music</option>
                        <option value="food">Food</option>
                        <option value="popup">Pop-up</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Venue / Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., Betwa River Bank Grounds"
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition outline-hidden"
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Event Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.eventDate}
                        onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Entry Fee</label>
                      <input
                        type="text"
                        value={formData.entryFee}
                        onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })}
                        placeholder="e.g., Free or ₹100"
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Organizer</label>
                      <input
                        type="text"
                        value={formData.organizer}
                        onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                        placeholder="e.g., City Culture Club"
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: Description */}
                <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    2. Event Description
                  </h4>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the atmosphere, key attractions, special performances, and what makes this surprise event unmissable..."
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition outline-hidden resize-none"
                    />
                  </div>
                </div>

                {/* SECTION 3: Banner / Photos */}
                <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                    3. Event Media (Multiple Photos & Videos)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Photos Upload */}
                    <div className="border-2 border-dashed border-purple-200 hover:border-purple-400 p-5 rounded-2xl text-center bg-purple-50/40 hover:bg-purple-50 transition cursor-pointer flex flex-col items-center justify-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        id="surpriseEventPhotos"
                        onChange={(e) => setFormData({ ...formData, photos: e.target.files })}
                        className="hidden"
                      />
                      <label
                        htmlFor="surpriseEventPhotos"
                        className="cursor-pointer w-full text-xs font-bold text-purple-700 flex flex-col items-center justify-center gap-2"
                      >
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                          <UploadCloud size={20} />
                        </div>
                        {formData.photos && formData.photos.length > 0 ? (
                          <div className="space-y-1">
                            <p className="font-bold text-emerald-700">✓ {formData.photos.length} Photo(s) Selected</p>
                            <p className="text-[11px] text-slate-500">Click to change photos</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm font-bold">Upload Event Photos</p>
                            <p className="text-[10px] text-slate-400 font-normal mt-0.5">Multiple JPG, PNG, WebP images</p>
                          </div>
                        )}
                      </label>
                    </div>

                    {/* Videos Upload */}
                    <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 p-5 rounded-2xl text-center bg-indigo-50/40 hover:bg-indigo-50 transition cursor-pointer flex flex-col items-center justify-center">
                      <input
                        type="file"
                        multiple
                        accept="video/*"
                        id="surpriseEventVideos"
                        onChange={(e) => setFormData({ ...formData, videos: e.target.files })}
                        className="hidden"
                      />
                      <label
                        htmlFor="surpriseEventVideos"
                        className="cursor-pointer w-full text-xs font-bold text-indigo-700 flex flex-col items-center justify-center gap-2"
                      >
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                          <Film size={20} />
                        </div>
                        {formData.videos && formData.videos.length > 0 ? (
                          <div className="space-y-1">
                            <p className="font-bold text-emerald-700">✓ {formData.videos.length} Video(s) Selected</p>
                            <p className="text-[11px] text-slate-500">Click to change videos</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm font-bold">Upload Event Videos</p>
                            <p className="text-[10px] text-slate-400 font-normal mt-0.5">Multiple MP4, WebM teaser reels</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                {/* SECTION 4: Push Notification Broadcast */}
                <NotificationDraftSection
                  serviceType="surprise_event"
                  entityName={formData.title}
                  value={notif}
                  onChange={setNotif}
                />

                {isPublishing && (
                  <div className="pt-2">
                    <UploadProgressBar isUploading={isPublishing} />
                  </div>
                )}
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 z-20 flex justify-between items-center px-6 py-4 bg-white/95 backdrop-blur border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isPublishing}
                  className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 text-sm transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-98 text-white font-bold rounded-xl text-sm shadow-md transition disabled:bg-purple-300 flex items-center gap-2 cursor-pointer"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Publishing Event Assets...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} /> <span>Publish Surprise Event</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurpriseEventsPage;
