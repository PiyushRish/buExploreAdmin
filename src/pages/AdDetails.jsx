import React, { useState, useContext, useRef } from "react";
import {
  Megaphone, Heart, Share2, Save, Edit2,
  ArrowLeft, Calendar, ImageIcon, UploadCloud, X,Trash2
} from "lucide-react";

import { PlaceContext } from "../contextApi/places.jsx";

const AdDetails = () => {
  const { clickedPlace: clickedAd, setClickedPlaceHandler } = useContext(PlaceContext);


  console.log("Clicked Ad:", clickedAd);

  if (!clickedAd) return null;

  const [data, setData] = useState(clickedAd);
  const [isEditing, setIsEditing] = useState(false);
  
  // New state to handle the file object for the backend
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Ref for the hidden file input
  const fileInputRef = useRef(null);

  const statusOptions = ['active', 'paused', 'draft', 'scheduled', 'ended'];

  // --- HANDLERS ---

  const handleChange = (e) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleContentChange = (e) => {
    setData((prev) => ({
      ...prev,
      content: { ...prev.content, [e.target.name]: e.target.value },
    }));
  };

  const toggleEdit = () => {
    // If canceling edit, you might want to reset data here in a real app
    setIsEditing((p) => !p);
  };

  // --- IMAGE UPLOAD LOGIC ---

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      processFile(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    // 1. Store file in state to send to backend later
    setSelectedFile(file);

    // 2. Create a local preview URL so the Right Panel updates instantly
    const previewUrl = URL.createObjectURL(file);
    
    setData((prev) => ({
      ...prev,
      content: { ...prev.content, imageUrl: previewUrl }
    }));
  };

  const handleSave = () => {
    // HERE IS WHERE YOU HANDLE THE BACKEND LOGIC
    console.log("Saving data...", data);

    if (selectedFile) {
      console.log("File ready for upload:", selectedFile);
      // Example Backend Logic:
      // const formData = new FormData();
      // formData.append('adImage', selectedFile);
      // formData.append('data', JSON.stringify(data));
      // await axios.post('/api/update-ad', formData);
    }
    
    setIsEditing(false);
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (e) { return ""; }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      {/* LEFT PANEL */}
      <div className="w-[70%] h-full flex flex-col bg-white border-r shadow-sm z-10">

        {/* HEADER */}
        <div className="h-16 border-b flex items-center justify-between px-6 bg-white sticky top-0 z-20">
          <button
            onClick={() => setClickedPlaceHandler(null)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
          </button>

          <button
              className="flex items-center px-4 py-2 rounded-lg bg-red-50 text-red-600 
                         hover:bg-red-100 transition-colors border border-red-200"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 size={16} className="mr-2" />
              Delete
            </button>

          <button
            onClick={isEditing ? handleSave : toggleEdit}
            className={`flex items-center px-4 py-2 rounded-lg font-semibold transition-all shadow-sm ${
              isEditing
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border"
            }`}
          >
            {isEditing ? (
              <>
                <Save size={18} className="mr-2" /> Save Changes
              </>
            ) : (
              <>
                <Edit2 size={18} className="mr-2" /> Edit Campaign
              </>
            )}
          </button>
        </div>

        {/* SCROLL AREA */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50/50">

          {/* 1. BASIC INFO */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="flex-1 w-full space-y-4">
                <div>
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Campaign Name</label>
                  {isEditing ? (
                    <input
                      name="name"
                      value={data.name}
                      onChange={handleChange}
                      className="w-full text-3xl font-extrabold border-b-2 border-blue-100 focus:border-blue-600 outline-none py-1 bg-transparent"
                    />
                  ) : (
                    <h1 className="text-3xl font-extrabold text-gray-900">{data.name}</h1>
                  )}
                </div>
                
                {/* Type */}
                <div className="flex items-center text-sm font-medium text-gray-600 bg-gray-100 w-fit px-3 py-1 rounded-full">
                  <Megaphone size={16} className="mr-2 text-purple-500" />
                  {isEditing ? (
                    <input
                      name="type"
                      value={data.content.type}
                      onChange={handleContentChange}
                      className="bg-transparent border-b border-gray-300 focus:border-purple-500 outline-none w-32"
                    />
                  ) : (
                    <span className="capitalize">{data.content.type}</span>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="w-full md:w-48">
                 <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2 block">Status</label>
                 {isEditing ? (
                   <select
                     name="status"
                     value={data.status}
                     onChange={handleChange}
                     className="w-full p-2 border rounded-md capitalize bg-white cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none"
                   >
                     {statusOptions.map(opt => (
                       <option key={opt} value={opt}>{opt}</option>
                     ))}
                   </select>
                 ) : (
                   <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold capitalize ${
                     data.status === "active" ? "bg-green-100 text-green-800" :
                     data.status === "paused" ? "bg-yellow-100 text-yellow-800" :
                     "bg-gray-100 text-gray-800"
                   }`}>
                     {data.status}
                   </span>
                 )}
              </div>
            </div>
          </div>

          {/* 2. VISUAL MEDIA (DRAG & DROP) */}
          <div className={`p-6 rounded-2xl shadow-sm border transition-all ${isEditing ? 'bg-blue-50/30 border-blue-200' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center mb-4">
              <ImageIcon size={20} className={`mr-2 ${isEditing ? 'text-blue-600' : 'text-gray-400'}`} />
              <h3 className="text-lg font-bold text-gray-900">Visual Media</h3>
            </div>

            {isEditing ? (
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group
                  ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"}
                `}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  className="hidden" 
                  accept="image/*"
                />
                
                <div className={`p-4 rounded-full mb-3 ${isDragging ? "bg-blue-100" : "bg-gray-100 group-hover:scale-110 transition-transform"}`}>
                  <UploadCloud size={32} className={isDragging ? "text-blue-600" : "text-gray-500"} />
                </div>
                
                <p className="text-sm font-bold text-gray-700">
                  {isDragging ? "Drop image here" : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  SVG, PNG, JPG or GIF (max. 800x400px)
                </p>

                {selectedFile && (
                  <div className="mt-4 flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                    {selectedFile.name}
                  </div>
                )}
              </div>
            ) : (
              // Read Only View
              <div className="flex items-start bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex-shrink-0 w-20 h-20 border border-gray-300 rounded-lg overflow-hidden bg-gray-200 mr-4">
                   <img src={data.content.imageUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-center h-20">
                   <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Current Asset</label>
                   <p className="text-sm text-gray-600 truncate mt-1">
                      {selectedFile ? selectedFile.name : "Remote Image URL"}
                   </p>
                </div>
              </div>
            )}
          </div>

          {/* 3. TEXT CONTENT */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Edit2 size={18} className="mr-2 text-gray-400"/> Ad Copy
            </h3>
            <div className="grid gap-6">
              <div>
                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-2">Headline</label>
                {isEditing ? (
                  <input
                    name="headline"
                    value={data.content.headline}
                    onChange={handleContentChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg"
                  />
                ) : (
                  <p className="p-3 bg-gray-50 rounded-lg border font-bold text-xl">{data.content.headline}</p>
                )}
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-2">Body Text</label>
                {isEditing ? (
                  <textarea
                    name="bodyText"
                    value={data.content.bodyText}
                    onChange={handleContentChange}
                    rows={4}
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                ) : (
                  <p className="p-4 bg-gray-50 rounded-xl border whitespace-pre-wrap">{data.content.bodyText}</p>
                )}
              </div>
            </div>
          </div>

          {/* 4. SCHEDULING & ACTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
            {/* Dates */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
               <h3 className="text-lg font-bold text-gray-900 flex items-center">
                 <Calendar size={18} className="mr-2 text-gray-400"/> Scheduling
               </h3>
               {['startDate', 'endDate'].map((field) => (
                 <div key={field}>
                   <label className="text-xs text-gray-500 font-bold uppercase block mb-1">
                     {field === 'startDate' ? 'Start Date' : 'End Date'}
                   </label>
                   {isEditing ? (
                     <input
                       type="date"
                       name={field}
                       value={formatDateForInput(data[field])}
                       onChange={handleChange}
                       className="w-full p-2 border rounded focus:ring-blue-500 outline-none"
                     />
                   ) : (
                     <p className="p-2 bg-gray-50 rounded border text-sm font-semibold">
                       {new Date(data[field]).toLocaleDateString()}
                     </p>
                   )}
                 </div>
               ))}
            </div>

            {/* CTA */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
               <h3 className="text-lg font-bold text-gray-900">Call To Action</h3>
               <div>
                 <label className="text-xs text-gray-500 font-bold uppercase block mb-1">Button Text</label>
                 {isEditing ? (
                   <input
                     name="ctaText"
                     value={data.content.ctaText}
                     onChange={handleContentChange}
                     className="w-full p-2 border rounded focus:ring-purple-500 outline-none font-semibold text-purple-700"
                   />
                 ) : (
                   <div className="inline-block px-4 py-2 bg-purple-100 text-purple-700 text-sm font-bold rounded">
                     {data.content.ctaText}
                   </div>
                 )}
               </div>
               <div>
                 <label className="text-xs text-gray-500 font-bold uppercase block mb-1">Destination URL</label>
                 {isEditing ? (
                   <input
                     name="linkUrl"
                     value={data.content.linkUrl}
                     onChange={handleContentChange}
                     className="w-full p-2 border rounded focus:ring-blue-500 outline-none text-blue-600 text-sm"
                   />
                 ) : (
                   <p className="text-sm text-blue-600 truncate bg-blue-50 p-2 rounded border">{data.content.linkUrl}</p>
                 )}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE PREVIEW */}
      <div className="w-[30%] bg-gray-900 shadow-2xl relative z-20 border-l border-gray-800">
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
          Live Preview
        </div>
        <AdPreview
          image={data.content.imageUrl}
          headline={data.content.headline}
          body={data.content.bodyText}
          cta={data.content.ctaText}
          name={data.name}
        />
      </div>
    </div>
  );
};

/* ---------------- AD PREVIEW COMPONENT ---------------- */
const AdPreview = ({ image, headline, body, cta, name }) => {
  return (
    <div className="relative w-full h-full flex flex-col justify-end overflow-hidden group">
      <div className="absolute inset-0 bg-gray-800">
        <img
          key={image} // Force re-render when image URL changes
          src={image}
          alt={name}
          className="w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
             e.target.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent/10" />
      </div>

      <div className="relative p-8 pb-12 w-full max-w-md mx-auto">
        <div className="space-y-4 animate-fade-in-up">
          <h2 className="text-4xl font-extrabold text-white leading-tight drop-shadow-2xl">
            {headline || "Headline..."}
          </h2>
          <p className="text-lg text-gray-100 leading-relaxed drop-shadow-md line-clamp-4">
            {body || "Ad body text..."}
          </p>
          <div className="pt-4">
            <button className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full shadow-lg">
              {cta || "Click Here"}
            </button>
          </div>
        </div>
        
        <div className="absolute right-6 bottom-36 flex flex-col items-center space-y-4">
          <button className="bg-white/10 backdrop-blur-md p-3 rounded-full hover:bg-white/20">
            <Heart size={24} className="text-white" />
          </button>
          <button className="bg-white/10 backdrop-blur-md p-3 rounded-full hover:bg-white/20">
            <Share2 size={24} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdDetails;