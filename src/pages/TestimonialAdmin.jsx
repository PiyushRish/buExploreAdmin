import React, { useState, useEffect } from "react";
import { 
  Plus, X, UploadCloud, Send, Loader2, 
  User, Calendar, Quote, ImageIcon, MapPin 
} from "lucide-react";
import { useCreateTestimonialMutation } from "../mutations/testimonialMutation.js";
import { useTestimonialsQuery } from "../queries/testimonialQueries.js";

/* -------------------------------------------------- */
/* EXPERIENCE CARD - Handles 1 to 4 Images            */
/* -------------------------------------------------- */
const ExperienceCard = ({ item }) => {
  const photos = item.photos || [];

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-500 group flex flex-col h-full">
      
      {/* ADAPTIVE PHOTO GRID */}
      <div className={`relative bg-slate-100 overflow-hidden h-72 grid gap-0.5 ${
        photos.length >= 2 ? "grid-cols-2" : "grid-cols-1"
      }`}>
        {photos.length > 0 ? (
          photos.slice(0, 4).map((photo, idx) => (
            <div key={idx} className={`relative overflow-hidden ${
              photos.length === 3 && idx === 0 ? "row-span-2" : "h-full"
            }`}>
              <img
                src={photo.url}
                alt="Visit"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-300 h-full">
            <ImageIcon size={48} strokeWidth={1} />
            <span className="text-[10px] font-bold uppercase tracking-widest mt-2">No Photos</span>
          </div>
        )}
      </div>

      <div className="p-8 flex flex-col flex-grow">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 font-bold">
            {item.user?.name?.charAt(0) || "E"}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">{item.user?.name || "Explorer"}</h4>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {new Date(item.date).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="relative">
           <Quote className="absolute -top-2 -left-2 text-indigo-100 opacity-30 w-8 h-8" />
           <p className="text-slate-600 text-sm leading-relaxed italic relative z-10 line-clamp-4">
             "{item.content}"
           </p>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------- */
/* MAIN PAGE COMPONENT                                */
/* -------------------------------------------------- */
const TestimonialsPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  const { mutate: createTestimonial, isPending } = useCreateTestimonialMutation();
  const { data, isLoading, isError } = useTestimonialsQuery();

  const testimonialsList = data?.testimonials || data || [];

  const handleFileChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (selectedFiles.length + files.length > 4) {
        alert("You can only upload a maximum of 4 images.");
        const remainingSlots = 4 - selectedFiles.length;
        setSelectedFiles([...selectedFiles, ...files.slice(0, remainingSlots)]);
      } else {
        setSelectedFiles([...selectedFiles, ...files]);
      }
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("userId", "64a7f4e2c8f1b2a5d6e7f890"); // Placeholder ID
    formData.append("content", content);
    
    selectedFiles.forEach((file) => {
      formData.append("photos", file); // Must match backend field name
    });

    createTestimonial(formData, {
      onSuccess: () => {
        setContent("");
        setSelectedFiles([]);
        setShowModal(false);
      },
      onError: (err) => {
        alert(err?.response?.data?.message || "Failed to post story.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto mb-16 text-center">
        <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">
          Travel <span className="text-indigo-600">Experiences</span>
        </h1>
        <p className="text-slate-500 max-w-lg mx-auto italic">
          Authentic stories from our travelers. Max 4 photos per story.
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
          </div>
        ) : isError ? (
          <p className="text-center text-red-500 font-bold">Error loading testimonials.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonialsList.map((item) => (
              <ExperienceCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-10 right-10 bg-indigo-600 text-white flex items-center gap-3 px-8 py-5 rounded-[2rem] shadow-2xl hover:bg-indigo-700 transition-all z-50 group"
      >
        <Plus size={24} className="group-hover:rotate-90 transition-transform" />
        <span className="font-black">Share Story</span>
      </button>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-in zoom-in duration-300">
            {isPending && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
              </div>
            )}

            <div className="p-10">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-slate-800">New Post</h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>

              <div className="space-y-6">
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-50 rounded-3xl p-6 text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all resize-none border-none"
                  placeholder="Tell us about your trip..."
                  rows={4}
                />

                {/* PREVIEW THUMBNAILS */}
                <div className="grid grid-cols-4 gap-2">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="relative h-20 rounded-xl overflow-hidden group">
                      <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                      <button onClick={() => removeFile(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {selectedFiles.length < 4 && (
                    <label className="flex items-center justify-center h-20 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-indigo-50 transition-all">
                      <Plus className="text-slate-400" />
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                  )}
                </div>

                <button 
                  onClick={handleSubmit}
                  disabled={!content || isPending}
                  className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-xl disabled:opacity-50"
                >
                  <Send size={18} /> Post Experience
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialsPage;