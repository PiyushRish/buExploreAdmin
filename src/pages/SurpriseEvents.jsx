import React, { useState, useEffect } from "react";
import { Sparkles, Plus, Trash2, X, MapPin, Calendar, Tag, RefreshCw } from "lucide-react";
import { getSurpriseEvents, addSurpriseEvent, deleteSurpriseEvent } from "../api/surpriseEvents.api";
import toast from "react-hot-toast";

const SurpriseEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    city: "Jhansi",
    location: "",
    eventType: "festival",
    eventDate: "",
    photos: [],
    entryFee: "Free",
    organizer: "City Culture Club",
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await getSurpriseEvents({ activeOnly: false });
      setEvents(data.events || []);
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

      await addSurpriseEvent(data);
      toast.success("Surprise Event published successfully!");
      setShowAddModal(false);
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to publish event");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this surprise event?")) return;
    try {
      await deleteSurpriseEvent(id);
      toast.success("Surprise event deleted");
      fetchEvents();
    } catch (err) {
      toast.error("Failed to delete event");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="text-purple-600" size={24} />
            City Surprise Events
          </h2>
          <p className="text-xs text-slate-500">
            Publish dynamic city & nearby popup events with flexible metadata
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchEvents}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
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

      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading surprise events...</div>
      ) : events.length === 0 ? (
        <div className="py-20 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          No surprise events active. Click "Publish Event" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
              <div>
                <div className="relative h-44 bg-slate-100">
                  {event.photos?.[0]?.url ? (
                    <img src={event.photos[0].url} alt={event.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-purple-400 font-bold bg-purple-50">
                      Surprise Event
                    </div>
                  )}
                  <span className="absolute top-3 left-3 px-3 py-1 bg-purple-900/80 backdrop-blur-xs text-white text-xs font-bold rounded-full uppercase">
                    {event.eventType}
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  <h3 className="font-bold text-slate-900 text-base leading-snug">{event.title}</h3>
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

              <div className="p-4 pt-0">
                <button
                  onClick={() => handleDelete(event._id)}
                  className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Trash2 size={14} /> Delete Event
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── PUBLISH EVENT MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Sparkles className="text-purple-600" size={18} />
                Publish Surprise Event
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Secret Lantern Night Fest"
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Event Type</label>
                  <select
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  >
                    <option value="festival">Festival</option>
                    <option value="cultural">Cultural</option>
                    <option value="music">Music</option>
                    <option value="food">Food</option>
                    <option value="popup">Pop-up</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Venue / Location *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Betwa River Bank Grounds"
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Event Date *</label>
                <input
                  type="date"
                  required
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows="3"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Entry Fee</label>
                  <input
                    type="text"
                    value={formData.entryFee}
                    onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Organizer</label>
                  <input
                    type="text"
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Event Banner/Photos</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, photos: e.target.files })}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl"
                >
                  Publish Event
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
