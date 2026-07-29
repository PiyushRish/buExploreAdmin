import React, { useState } from "react";
import { MessageSquare, Plus, X, Trash2, Star, User } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";

const Testimonials = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const res = await axiosClient.get("/testimonials");
      return res.data;
    },
  });

  const [userName, setUserName] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);

  const addMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosClient.post("/testimonials", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success("Testimonial created!");
      setShowModal(false);
      setUserName("");
      setContent("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await axiosClient.delete(`/testimonials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast.error("Testimonial deleted");
    },
  });

  const testimonials = data?.testimonials || data?.data || [];

  if (isLoading) return <div className="p-8 font-bold text-center text-gray-500">Loading Testimonials...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-5 rounded-2xl border shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-gray-900">User Reviews & Testimonials</h1>
            <p className="text-xs text-gray-500">Manage tourist reviews and platform ratings</p>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-blue-700 shadow-md">
            <Plus size={16} /> Add Testimonial
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t._id} className="bg-white p-6 rounded-2xl border shadow-lg flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-gray-900 flex items-center gap-2">
                    <User size={16} className="text-blue-600" /> {t.userName || t.user?.name || "Anonymous Tourist"}
                  </span>
                  <div className="flex text-yellow-400">
                    {Array.from({ length: t.rating || 5 }).map((_, i) => (
                      <Star key={i} size={12} className="fill-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 text-sm italic leading-relaxed">"{t.content || t.comment}"</p>
              </div>

              <div className="pt-4 mt-4 border-t flex justify-between items-center text-[10px] text-gray-400 font-mono">
                <span>{new Date(t.createdAt || Date.now()).toLocaleDateString()}</span>
                <button onClick={() => deleteMutation.mutate(t._id)} className="text-xs font-bold text-red-600 flex items-center gap-1 hover:underline">
                  <Trash2 size={14} /> Remove Review
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-bold">New Testimonial</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            <input placeholder="Tourist Name" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full border p-2.5 rounded-xl text-sm" />
            <textarea placeholder="Feedback Content *" value={content} onChange={(e) => setContent(e.target.value)} rows={4} className="w-full border p-2.5 rounded-xl text-sm resize-none" />

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">Rating (1 to 5):</span>
              <input type="number" min="1" max="5" value={rating} onChange={(e) => setRating(Number(e.target.value))} className="w-20 border p-2 rounded-xl text-center font-bold" />
            </div>

            <button onClick={() => addMutation.mutate({ userName, content, rating })} disabled={addMutation.isPending} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-md">
              Publish Testimonial
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Testimonials;