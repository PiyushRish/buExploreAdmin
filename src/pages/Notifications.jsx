import React, { useState } from "react";
import { Bell, Send, Trash2, CheckCircle2, User, Globe } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";

const Notification = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await axiosClient.get("/notification/getAllNotification");
      return res.data;
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosClient.post("/notification/send", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Broadcast notification sent!");
      setTitle("");
      setMessage("");
    },
    onError: () => toast.error("Failed to send notification"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await axiosClient.delete(`/notification/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.error("Notification removed");
    },
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!title || !message) {
      toast.error("Title and message body are required");
      return;
    }
    sendMutation.mutate({ title, message, targetRole });
  };

  const notifications = data?.notifications || data?.data || [];

  if (isLoading) return <div className="p-8 font-bold text-center text-gray-500">Loading Notifications...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT FORM - SEND BROADCAST NOTIFICATION */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4 h-fit">
          <div className="flex items-center gap-2 text-blue-600 border-b pb-3">
            <Bell size={20} />
            <h2 className="text-xl font-bold text-gray-900">Broadcast Push Alert</h2>
          </div>

          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Alert Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. New Destination Unlocked!"
                className="w-full border p-2.5 rounded-xl text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Target Audience</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full border p-2.5 rounded-xl text-sm bg-white font-semibold outline-none focus:border-blue-500"
              >
                <option value="all">All Users & Visitors</option>
                <option value="user">Tourists Only</option>
                <option value="shopOwner">Shop Owners Only</option>
                <option value="admin">Admins Only</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Message Body *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write message details..."
                rows={4}
                className="w-full border p-2.5 rounded-xl text-sm resize-none outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={sendMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md text-sm flex items-center justify-center gap-2 transition-all disabled:bg-blue-300"
            >
              <Send size={16} />
              {sendMutation.isPending ? "Sending Broadcast..." : "Dispatch Notification"}
            </button>
          </form>
        </div>

        {/* RIGHT LIST - SENT NOTIFICATIONS HISTORY */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Sent Notification Logs ({notifications.length})</h2>
            <span className="text-xs text-gray-400 font-bold">History Log</span>
          </div>

          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border text-center text-gray-400 font-semibold">
                No notifications dispatched yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n._id} className="bg-white p-5 rounded-2xl border shadow-sm space-y-2 flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-gray-900">{n.title}</span>
                      <span className="bg-blue-50 text-blue-600 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase">
                        Target: {n.targetRole || "All"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-gray-400 font-mono block pt-1">
                      Sent: {new Date(n.createdAt || Date.now()).toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => deleteMutation.mutate(n._id)}
                    className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={16} />
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

export default Notification;