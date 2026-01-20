import React, { useState } from "react";
import { 
  Bell, Plus, X, Send, User, Trash2, 
  Search, Filter, Calendar, ExternalLink, BellOff 
} from "lucide-react";
import { useNotificationsQuery } from "../queries/notificationQueries.js";
import { useDeleteNotification, useSendNotification } from "../mutations/notificationMutation.js";

const typeColors = {
  SYSTEM: "bg-blue-100 text-blue-700",
  ORDER: "bg-purple-100 text-purple-700",
  ADVERTISEMENT: "bg-pink-100 text-pink-700",
  EVENT: "bg-green-100 text-green-700",
  OFFER: "bg-yellow-100 text-yellow-700",
  GENERAL: "bg-gray-100 text-gray-700",
};

const Notifications = () => {
  // 1. FIX: Hooks must be at the top level
  const { data, isLoading, isError } = useNotificationsQuery();
  const sendNotification = useSendNotification();
  const deleteNotification = useDeleteNotification(); // Get the delete function here

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 2. FIX: Add state to track which ID we are deleting
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null); 
  
  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "SYSTEM",
    image: "",
    user: "", // empty = broadcast
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // 3. FIX: New function to handle the actual deletion confirmation
  const confirmDelete = () => {
    if (!deleteId) return;

    deleteNotification.mutate(deleteId, {
      onSuccess: () => {
        setShowDeleteModal(false);
        setDeleteId(null);
      },
      onError: (err) => {
        console.error(err);
        alert("Failed to delete");
      }
    });
  };

  // Helper to open the modal and save the ID
  const openDeleteModal = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      title: form.title,
      message: form.message,
      type: form.type,
      userIds: form.user ? [form.user.trim()] : [],
    };

    sendNotification.mutate(payload, {
      onSuccess: () => {
        setIsModalOpen(false);
        setForm({
          title: "",
          message: "",
          type: "SYSTEM",
          image: "",
          user: "",
        });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading notifications...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Failed to load notifications.
      </div>
    );
  }

  const notifications = data?.data || [];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Notifications
          </h1>
          <p className="text-lg text-gray-600">
            View and manage system notifications
          </p>
        </div>

        {/* Notification List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center text-gray-500">
              No notifications found.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                className="bg-white rounded-xl shadow p-4 flex gap-4 items-start"
              >
                {n.image && (
                  <img
                    src={n.image}
                    alt="notification"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">{n.title}</h3>

                    <div className="flex items-center gap-2">
                        <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            typeColors[n.type] || typeColors.GENERAL
                        }`}
                        >
                        {n.type}
                        </span>
                        
                        {/* 4. FIX: Use openDeleteModal instead of calling hook directly */}
                        <button
                        className="flex items-center px-4 py-2 rounded-lg bg-red-50 text-red-600 
                                    hover:bg-red-100 transition-colors border border-red-200"
                        onClick={() => openDeleteModal(n._id)}
                        >
                        <Trash2 size={16} className="mr-2" />
                        Delete
                        </button>
                    </div>
                  </div>

                  <p className="text-gray-600 mt-1">{n.message}</p>

                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>
                      {new Date(n.createdAt).toLocaleString()}
                    </span>

                    {n.user && (
                      <span className="flex items-center gap-1">
                        <User size={14} /> Targeted
                      </span>
                    )}

                    {n.link && (
                      <a
                        href={n.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        Open Link
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
      >
        <Plus size={24} />
      </button>

      {/* Add Notification Modal - YOUR ORIGINAL UI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Create Notification</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="title"
                placeholder="Title"
                value={form.title}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />

              <textarea
                name="message"
                placeholder="Message"
                value={form.message}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                rows={4}
                required
              />

              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                {[
                  "SYSTEM",
                  "ORDER",
                  "ADVERTISEMENT",
                  "EVENT",
                  "OFFER",
                  "GENERAL",
                ].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <User size={16} />
                <input
                  name="user"
                  placeholder="User ID (leave empty for broadcast)"
                  value={form.user}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>

              <button
                type="submit"
                disabled={sendNotification.isPending}
                className="w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <Send size={16} />
                {sendNotification.isPending
                  ? "Sending..."
                  : "Send Notification"}
              </button>

              {sendNotification.isError && (
                <p className="text-red-500 text-sm text-center">
                  Failed to send notification
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - ADDED TO HANDLE DELETE LOGIC */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl max-w-sm w-full shadow-2xl">
                <h3 className="text-lg font-bold text-gray-900">Delete Notification?</h3>
                <p className="text-gray-500 mt-2 text-sm">This action cannot be undone.</p>
                <div className="flex gap-3 mt-6">
                    <button 
                        onClick={() => setShowDeleteModal(false)} 
                        className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmDelete} 
                        className="flex-1 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium"
                    >
                        {deleteNotification.isPending ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;