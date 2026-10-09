import React, { useState } from "react";
import {
  Bell,
  Send,
  Trash2,
  Globe,
  Tag,
  Layers,
  CheckCheck,
  Check,
  RefreshCw,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  sendNotification,
  deleteNotification,
  markAsRead,
  markAllAsRead,
} from "../api/notification.api";
import toast from "react-hot-toast";

// ─── Constants ───────────────────────────────────────────────────────────────

const NOTIFICATION_TYPES = [
  { value: "GENERAL", label: "General" },
  { value: "EVENT", label: "Event" },
  { value: "OFFER", label: "Offer" },
  { value: "ADVERTISEMENT", label: "Advertisement" },
  { value: "SYSTEM", label: "System" },
  { value: "ORDER", label: "Order" },
  { value: "SERVICE", label: "Service" },
];

const SERVICE_TYPES = [
  { value: "general", label: "General (No Service)" },
  { value: "hotel", label: "🏨 Hotel" },
  { value: "restaurant", label: "🍽️ Restaurant" },
  { value: "guide", label: "🧭 Guide" },
  { value: "event", label: "🎉 Event" },
  { value: "tour", label: "🗺️ Tour" },
  { value: "vehicle", label: "🚗 Vehicle" },
  { value: "podcast", label: "🎙️ Podcast" },
  { value: "place", label: "📍 Place" },
  { value: "surprise_event", label: "🎊 Surprise Event" },
];

const TYPE_COLORS = {
  GENERAL: "bg-gray-100 text-gray-700",
  EVENT: "bg-purple-50 text-purple-700",
  OFFER: "bg-green-50 text-green-700",
  ADVERTISEMENT: "bg-yellow-50 text-yellow-700",
  SYSTEM: "bg-blue-50 text-blue-700",
  ORDER: "bg-orange-50 text-orange-700",
  SERVICE: "bg-pink-50 text-pink-700",
};

// ─── Component ────────────────────────────────────────────────────────────────

const Notifications = () => {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("GENERAL");
  const [serviceType, setServiceType] = useState("general");
  const [serviceId, setServiceId] = useState("");
  // Future: offer bar
  // const [isOffer, setIsOffer] = useState(false);

  // ── Fetch all notifications (admin history with auto sync) ──
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    refetchInterval: 15000,
  });

  // ── Send notification ──
  const sendMutation = useMutation({
    mutationFn: sendNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification dispatched!");
      setTitle("");
      setMessage("");
      setType("GENERAL");
      setServiceType("general");
      setServiceId("");
    },
    onError: () => toast.error("Failed to send notification"),
  });

  // ── Delete notification ──
  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification removed");
    },
  });

  // ── Mark all as read (admin utility) ──
  const markAllMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All marked as read");
    },
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required");
      return;
    }
    const payload = {
      title: title.trim(),
      message: message.trim(),
      type,
      serviceType,
      ...(serviceId.trim() && { serviceId: serviceId.trim() }),
    };
    sendMutation.mutate(payload);
  };

  const notifications = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.notifications)
    ? data.notifications
    : [];

  if (isLoading)
    return (
      <div className="p-8 font-bold text-center text-gray-400">
        Loading Notifications...
      </div>
    );

  if (isError)
    return (
      <div className="p-8 max-w-xl mx-auto my-12 bg-white rounded-2xl border text-center shadow-sm space-y-3">
        <p className="font-bold text-red-600 text-base">Failed to fetch notifications</p>
        <p className="text-xs text-gray-500">{error?.message || "Server error occurred"}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── LEFT: SEND FORM ── */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4 h-fit">
          <div className="flex items-center gap-2 text-blue-600 border-b pb-3">
            <Bell size={20} />
            <h2 className="text-xl font-bold text-gray-900">Broadcast Alert</h2>
          </div>

          <form onSubmit={handleSend} className="space-y-4">
            {/* Title */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                Alert Title *
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. New Destination Unlocked!"
                className="w-full border p-2.5 rounded-xl text-sm outline-none focus:border-blue-500"
              />
            </div>

            {/* Notification Type */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1 flex items-center gap-1">
                <Tag size={10} /> Notification Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border p-2.5 rounded-xl text-sm bg-white font-semibold outline-none focus:border-blue-500"
              >
                {NOTIFICATION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Type */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1 flex items-center gap-1">
                <Layers size={10} /> Related Service
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full border p-2.5 rounded-xl text-sm bg-white font-semibold outline-none focus:border-blue-500"
              >
                {SERVICE_TYPES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Service ID — only shown when a specific service is chosen */}
            {serviceType !== "general" && (
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                  Service ID (Optional)
                </label>
                <input
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  placeholder="Paste MongoDB ObjectId of specific record"
                  className="w-full border p-2.5 rounded-xl text-sm outline-none focus:border-blue-500 font-mono"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Leave blank to target all {serviceType}s
                </p>
              </div>
            )}

            {/* Message */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                Message Body *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write notification details..."
                rows={4}
                className="w-full border p-2.5 rounded-xl text-sm resize-none outline-none focus:border-blue-500"
              />
            </div>

            {/* Future: Offer bar toggle */}
            {/* <div className="flex items-center gap-2 opacity-40 cursor-not-allowed">
              <input type="checkbox" disabled id="isOffer" />
              <label htmlFor="isOffer" className="text-xs font-semibold text-gray-500">
                📢 Mark as Offer (coming soon)
              </label>
            </div> */}

            <button
              type="submit"
              disabled={sendMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md text-sm flex items-center justify-center gap-2 transition-all disabled:bg-blue-300"
            >
              <Send size={16} />
              {sendMutation.isPending ? "Sending..." : "Dispatch Notification"}
            </button>
          </form>
        </div>

        {/* ── RIGHT: HISTORY LOG ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header */}
          <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Sent Notifications
                <span className="ml-2 bg-blue-50 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {notifications.length}
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Active notifications log • 1-day retention limit
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition-colors"
                title="Refresh notifications"
              >
                <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
                Refresh
              </button>
              {notifications.length > 0 && (
                <button
                  onClick={() => markAllMutation.mutate()}
                  disabled={markAllMutation.isPending}
                  className="flex items-center gap-1.5 text-xs font-bold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-2 rounded-xl transition-colors"
                >
                  <CheckCheck size={14} />
                  Mark All Read
                </button>
              )}
            </div>
          </div>

          {/* Notification Cards */}
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border text-center text-gray-400 font-semibold">
                No notifications dispatched yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.notificationId || n._id}
                  className="bg-white p-5 rounded-2xl border shadow-sm flex justify-between items-start gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    {/* Title + Type badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-base text-gray-900 truncate">
                        {n.title}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase ${
                          TYPE_COLORS[n.type] || TYPE_COLORS.GENERAL
                        }`}
                      >
                        {n.type}
                      </span>
                      {n.serviceType && n.serviceType !== "general" && (
                        <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                          {n.serviceType}
                        </span>
                      )}
                      {n.user === null && (
                        <span className="flex items-center gap-1 bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          <Globe size={9} /> Broadcast
                        </span>
                      )}
                    </div>

                    {/* Message */}
                    <p className="text-sm text-gray-600 leading-relaxed">{n.message}</p>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-3 pt-0.5">
                      <span className="text-[10px] text-gray-400 font-mono">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                      {n.readBy?.length > 0 && (
                        <span className="flex items-center gap-1 text-[10px] text-green-600 font-bold">
                          <Check size={10} />
                          {n.readBy.length} read
                        </span>
                      )}
                      {n.notificationId && (
                        <span className="text-[9px] text-gray-300 font-mono truncate max-w-[160px]">
                          ID: {n.notificationId}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => deleteMutation.mutate(n._id)}
                    disabled={deleteMutation.isPending}
                    className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors flex-shrink-0"
                    title="Delete notification"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;