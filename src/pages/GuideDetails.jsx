import React, { useState, useContext, useRef, useEffect } from "react";
import {
  Save, Edit2, ArrowLeft, Trash2, User, Camera, 
  X, Briefcase, IndianRupee, Languages, Award, Phone, Mail, Globe, 
  Upload, CheckCircle2, Clock, Hash, ShieldCheck, ShieldAlert, Layers,Plus
} from "lucide-react";

import { PlaceContext } from "../contextApi/places.jsx";
import {
  useDeleteGuideMutation,
  useUpdateGuideMutation
} from "../mutations/guideMutation.js";

const GuideDetails = () => {
  const { clickedPlace: guide, setClickedPlaceHandler } = useContext(PlaceContext);
  const fileInputRef = useRef(null);

  if (!guide) return null;

  // States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [data, setData] = useState(guide);
  const [isEditing, setIsEditing] = useState(false);
  const [photoFiles, setPhotoFiles] = useState([]); 
  const [existingPhotos, setExistingPhotos] = useState(guide.photos || []); 
  const [deletedPhotos, setDeletedPhotos] = useState([]); 

  const updateMutation = useUpdateGuideMutation();
  const deleteMutation = useDeleteGuideMutation();

  

  useEffect(() => {
    setData(guide);
    setExistingPhotos(guide.photos || []);
    setDeletedPhotos([]);
    setPhotoFiles([]);
  }, [guide]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("subCategory", data.subCategory);
    formData.append("experienceYears", data.experienceYears);
    formData.append("fee", data.fee);
    formData.append("isApproved", data.isApproved);
    formData.append("languages", JSON.stringify(data.languages));
    formData.append("speciality", JSON.stringify(data.speciality));
    formData.append("contact", JSON.stringify(data.contact));
    formData.append("existingPhotos", JSON.stringify(existingPhotos));
    formData.append("deletedPhotos", JSON.stringify(deletedPhotos));
    
    photoFiles.forEach(file => formData.append("GuidePhotos", file));

    try {
      await updateMutation.mutateAsync({ guideId: guide._id, formData });
      setIsEditing(false);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* --- ADMIN HEADER --- */}
      <div className="h-20 bg-white border-b border-gray-200 px-8 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => setClickedPlaceHandler(null)} className="p-2 hover:bg-gray-100 rounded-xl">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Admin Control</h2>
            <p className="text-sm font-bold text-gray-900">Managing: {data.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className={`px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-sm ${
              isEditing ? "bg-green-600 text-white hover:bg-green-700" : "bg-gray-900 text-white hover:bg-black"
            }`}
          >
            {isEditing ? <><Save size={18} /> Save</> : <><Edit2 size={18} /> Edit</>}
          </button>
          <button onClick={() => setShowDeleteModal(true)} className="p-2.5 text-red-500 bg-red-50 rounded-xl hover:bg-red-500 hover:text-white transition-all">
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: CORE SCHEMA FIELDS */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-8 border-b border-gray-50 pb-6">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</label>
                <input
                  name="name" value={data.name || ""} onChange={handleChange} disabled={!isEditing}
                  className="w-full text-3xl font-black bg-transparent border-none outline-none disabled:text-gray-900 text-blue-600 p-0"
                />
              </div>
              <div className="flex flex-col items-end">
                 <label className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Approval Status</label>
                 <div className={`flex items-center gap-3 p-2 rounded-2xl border ${data.isApproved ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
                    {data.isApproved ? <ShieldCheck className="text-green-600" size={20}/> : <ShieldAlert className="text-amber-600" size={20}/>}
                    <input type="checkbox" name="isApproved" checked={data.isApproved} onChange={handleChange} disabled={!isEditing} className="w-5 h-5 accent-green-600 cursor-pointer" />
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-2"><Award size={14}/> Speciality (Comma Separated)</label>
                  <textarea 
                    value={(data.speciality || []).join(", ")} disabled={!isEditing}
                    onChange={(e) => setData(p => ({ ...p, speciality: e.target.value.split(",").map(s => s.trim()) }))}
                    className="w-full bg-gray-50 p-4 rounded-2xl h-32 resize-none focus:ring-2 ring-blue-100 outline-none font-semibold text-gray-700"
                  />
               </div>
               <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-2"><Languages size={14}/> Languages (Comma Separated)</label>
                  <textarea 
                    value={(data.languages || []).join(", ")} disabled={!isEditing}
                    onChange={(e) => setData(p => ({ ...p, languages: e.target.value.split(",").map(s => s.trim()) }))}
                    className="w-full bg-gray-50 p-4 rounded-2xl h-32 resize-none focus:ring-2 ring-blue-100 outline-none font-semibold text-gray-700"
                  />
               </div>
            </div>
          </div>

          {/* PHOTO ASSET MANAGEMENT */}
          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Camera size={18}/> Photo Gallery Assets
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {existingPhotos.map((photo, i) => (
                <div key={photo.public_id} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                  <img src={photo.url} className="w-full h-full object-cover" alt="asset" />
                  {isEditing && (
                    <button onClick={() => { setDeletedPhotos(p => [...p, photo.public_id]); setExistingPhotos(p => p.filter((_, idx) => idx !== i)); }} className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-lg shadow-lg"><X size={14} /></button>
                  )}
                </div>
              ))}
              {photoFiles.map((file, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-green-500 shadow-md">
                  <img src={URL.createObjectURL(file)} className="w-full h-full object-cover opacity-60" alt="new" />
                  <button onClick={() => setPhotoFiles(p => p.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 bg-gray-800 text-white p-1.5 rounded-lg"><X size={14} /></button>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-green-600"><Upload size={20} /></div>
                </div>
              ))}
              {isEditing && (existingPhotos.length + photoFiles.length) < 5 && (
                <button onClick={() => fileInputRef.current.click()} className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center hover:bg-blue-50 transition-colors">
                  <Plus size={24} className="text-gray-400" />
                  <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Add Photo</span>
                </button>
              )}
            </div>
            <input type="file" multiple className="hidden" ref={fileInputRef} onChange={(e) => setPhotoFiles(prev => [...prev, ...Array.from(e.target.files)])} />
          </div>
        </div>

        {/* RIGHT: SYSTEM & CONTACT */}
        <div className="lg:col-span-4 space-y-8">
          
          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</label>
              <select 
                name="subCategory" value={data.subCategory} onChange={handleChange} disabled={!isEditing}
                className="w-full bg-gray-50 p-4 rounded-xl font-bold outline-none border-none disabled:bg-white appearance-none"
              >
                <option value="Guide">Individual Guide</option>
                <option value="Travel Agencies">Travel Agency</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-blue-500 uppercase mb-1">Daily Fee</p>
                <div className="flex items-center text-xl font-black text-blue-700">
                  <IndianRupee size={16}/>
                  <input name="fee" type="number" value={data.fee} onChange={handleChange} disabled={!isEditing} className="bg-transparent w-full outline-none" />
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Exp (Yrs)</p>
                <input name="experienceYears" type="number" value={data.experienceYears} onChange={handleChange} disabled={!isEditing} className="bg-transparent text-xl font-black w-full outline-none" />
              </div>
            </div>

            {/* SAFE SYSTEM REFERENCE RENDERING */}
            <div className="pt-6 border-t border-gray-100">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Service Linkage</label>
               <div className="bg-gray-900 rounded-2xl p-4 text-white shadow-lg">
                  <div className="flex items-center gap-2 mb-2 text-blue-400">
                    <Layers size={14}/>
                    <span className="text-[10px] font-black uppercase">{data.service?.category || "Service Category"}</span>
                  </div>
                  <h4 className="text-sm font-bold truncate mb-3">{data.service?.title || "Parent Service Title"}</h4>
                  <div className="flex items-center gap-2 text-[9px] font-mono text-gray-500 bg-black/30 p-2 rounded-lg truncate">
                    <Hash size={10}/> 
                    {/* Render ID string safely */}
                    {typeof data.service === 'object' ? data.service?._id : data.service || "N/A"}
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2"><Phone size={16}/> Contact Access</h3>
            <div className="space-y-4">
               {['phone', 'email', 'website'].map(f => (
                 <div key={f} className="space-y-1">
                   <label className="text-[9px] font-bold text-gray-400 ml-1 uppercase">{f}</label>
                   <div className="relative group">
                     <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                        {f === 'phone' ? <Phone size={14}/> : f === 'email' ? <Mail size={14}/> : <Globe size={14}/>}
                     </div>
                     <input
                       value={data.contact?.[f] || ""} disabled={!isEditing}
                       onChange={(e) => setData(p => ({ ...p, contact: { ...p.contact, [f]: e.target.value }}))}
                       className="w-full pl-11 pr-4 py-3.5 bg-gray-50 rounded-xl text-sm font-semibold outline-none focus:ring-2 ring-blue-100 border-none transition-all"
                     />
                   </div>
                 </div>
               ))}
            </div>
          </div>

        </div>
      </div>
         {showDeleteModal && (
        <DeleteModal
          placeName={data.name}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={async () => {
            await deleteMutation.mutateAsync(data._id);
            setShowDeleteModal(false);
            setClickedPlaceHandler(null);
          }}
        />
      )}
    </div>
    
  );
};

export default GuideDetails;


const DeleteModal = ({ onClose, onConfirm, placeName }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 w-[400px] shadow-xl">
      <h2 className="text-xl font-bold">Confirm Delete</h2>
      <p className="mt-3">
        Are you sure you want to delete <b>{placeName}</b>?
      </p>
      <div className="flex justify-end gap-3 mt-6">
        <button onClick={onClose} className="px-4 py-2 border rounded">
          Cancel
        </button>
        <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded">
          Delete
        </button>
      </div>
    </div>
  </div>
);