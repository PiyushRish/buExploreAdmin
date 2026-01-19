import React, { useState } from "react";
import { Bell, Plus, X, Send, Image, Link, User } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import { useNotificationsQuery } from "../queries/notificationQueries.js"; 
// adjust hook names to match your project

const typeColors = {
  SYSTEM: "bg-blue-100 text-blue-700",
  ORDER: "bg-purple-100 text-purple-700",
  ADVERTISEMENT: "bg-pink-100 text-pink-700",
  EVENT: "bg-green-100 text-green-700",
  OFFER: "bg-yellow-100 text-yellow-700",
  GENERAL: "bg-gray-100 text-gray-700",
};

const Notifications = () => {
  const { data, isLoading, isError } = useNotificationsQuery();
  console.table(data,"notificaiton data")
//   const createNotification = useCreateNotification();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "SYSTEM",
    image: "",
    link: "",
    user: "", // empty = broadcast
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      user: form.user || null, // null = broadcast
    };

    createNotification.mutate(payload, {
      onSuccess: () => {
        setIsModalOpen(false);
        setForm({
          title: "",
          message: "",
          type: "SYSTEM",
          image: "",
          link: "",
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
      <Navbar />

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
                {/* Optional Image */}
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

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        typeColors[n.type] || typeColors.GENERAL
                      }`}
                    >
                      {n.type}
                    </span>
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

      {/* Add Notification Modal */}
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
                <Image size={16} />
                <input
                  name="image"
                  placeholder="Image URL (optional)"
                  value={form.image}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="flex items-center gap-2">
                <Link size={16} />
                <input
                  name="link"
                  placeholder="Redirect Link (optional)"
                  value={form.link}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>

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
                className="w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <Send size={16} />
                Send Notification
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
