import React, { useState } from "react";
import { MessageSquare, Plus, X, Trash2, Star, User, UploadCloud } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useCreateTestimonialMutation, useDeleteTestimonialMutation } from "../mutations/testimonialMutation.js";
import axiosClient from "../api/axiosClient.js";
import toast from "react-hot-toast";
import { validateMediaType } from "../utils/validators.js";

const Testimonials = () => {
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const res = await axiosClient.get("/testimonials/getTestimonials");
      return res.data;
    },
  });

  const [content, setContent] = useState("");
  const [photos, setPhotos] = useState([]);

  const addMutation = useCreateTestimonialMutation();
  const deleteMutation = useDeleteTestimonialMutation();

  const handleCreate = () => {
    if (!content) return toast.error("Content is required");
    const formData = new FormData();
    formData.append("content", content);
    photos.forEach(f => formData.append("photos", f));

    addMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Testimonial saved!");
        setShowModal(false);
        setContent("");
        setPhotos([]);
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || "Failed to create");
      }
    });
  };

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
                {t.photos && t.photos.length > 0 && (
                   <div className="flex gap-2 overflow-x-auto mt-2">
                     {t.photos.map((p, i) => (
                       <img key={i} src={p.url || p} alt="T" className="w-12 h-12 rounded object-cover border" />
                     ))}
                   </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t flex justify-between items-center text-[10px] text-gray-400 font-mono">
                <span>{new Date(t.date || t.createdAt || Date.now()).toLocaleString()}</span>
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

            <textarea placeholder="Feedback Content *" value={content} onChange={(e) => setContent(e.target.value)} rows={4} className="w-full border p-2.5 rounded-xl text-sm resize-none" />

            <div className="border border-dashed p-4 rounded-xl text-center bg-gray-50 mt-3">
              <input type="file" multiple accept="image/*" id="tPhotos" onChange={(e) => {
                const files = Array.from(e.target.files).slice(0, 4);
                for (let f of files) {
                  const v = validateMediaType(f, 'image');
                  if (v !== true) return toast.error(v);
                }
                setPhotos(files);
              }} className="hidden" />
              <label htmlFor="tPhotos" className="cursor-pointer text-xs font-bold text-blue-600 flex flex-col items-center justify-center gap-2">
                <UploadCloud size={20} /> {photos.length > 0 ? `${photos.length} Photos Selected (Max 4)` : "Attach Optional Photos"}
              </label>
            </div>

            <button onClick={handleCreate} disabled={addMutation.isPending} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-md mt-4">
              Publish Testimonial
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Testimonials;