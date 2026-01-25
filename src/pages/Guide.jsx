import React, { useState, useContext, useRef } from "react";
import { 
  Share2, 
  Plus, 
  X, 
  Upload, 
  Globe, 
  Phone, 
  Mail, 
  ChevronDown,
  Languages,
  Briefcase,
  Award,
  IndianRupee,
  User
} from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import { PlaceContext } from "../contextApi/places.jsx";
import GuideDetails from "./GuideDetails.jsx";

import { useGuidesQuery } from "../queries/guideQueries.js";
import { useAddGuideMutation } from "../mutations/guideMutation.js";

/* -------------------------------------------------- */
/* GUIDE CARD COMPONENT                  */
/* -------------------------------------------------- */

const GuideCard = ({ guide }) => {
  const { setClickedPlaceHandler } = useContext(PlaceContext);

  // Image Logic: Safe check for photos array
  const imageUrl = guide?.photos?.[0]?.url || guide?.photos?.[0];
  const displayImage = imageUrl || "https://via.placeholder.com/400x300?text=No+Image";

  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl 
      transition-all duration-300 transform hover:-translate-y-1 
      border border-gray-100 flex flex-col h-full cursor-pointer group"
      onClick={() => setClickedPlaceHandler(guide)}
    >
      {/* --- Image Section --- */}
      <div className="relative h-64 bg-gray-900 flex items-center justify-center overflow-hidden">
        
        {/* Real Photo */}
        <img
          src={displayImage}
          alt={guide?.title || "Guide Profile"}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-black/20 to-transparent z-10" />

        <div className="absolute top-3 right-3 z-20">
          <button className="p-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-gray-900 transition-colors">
            <Share2 size={18} />
          </button>
        </div>

        {/* Overlay Info (Name & Category) */}
        <div className="absolute bottom-4 left-4 z-20 text-white">
            <span className="bg-blue-600 text-xs font-bold px-2 py-1 rounded-md mb-2 inline-block shadow-sm">
                {guide?.subCategory}
            </span>
            <h3 className="text-2xl font-bold leading-tight shadow-black drop-shadow-md">
                {guide?.title || "Professional Guide"}
            </h3>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        
        {/* Languages & Experience */}
        <div className="space-y-3 mb-4">
            <div className="flex items-start text-gray-600 text-sm">
                <Languages size={16} className="mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
                <span className="line-clamp-1">{guide?.languages?.join(", ") || "English"}</span>
            </div>
            <div className="flex items-center text-gray-600 text-sm">
                <Briefcase size={16} className="mr-2 text-blue-500 flex-shrink-0" />
                <span>{guide?.experienceYears} Years Experience</span>
            </div>
        </div>

        {/* Specialities Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
            {guide?.speciality?.slice(0, 3).map((spec, i) => (
                <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full border border-gray-200">
                    {spec}
                </span>
            ))}
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">Daily Fee</span>
            <span className="font-bold text-gray-800 text-lg flex items-center">
                <IndianRupee size={14} className="mt-0.5" />{guide?.fee}
            </span>
          </div>

          <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------- */
/* MAIN GUIDES COMPONENT                 */
/* -------------------------------------------------- */

const Guides = () => {
  const { data, isLoading, isError } = useGuidesQuery();
  const { clickedPlace } = useContext(PlaceContext);
  const addMutation = useAddGuideMutation();

  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);

  // Form State matching Mongoose Schema
  const [form, setForm] = useState({
    title: "", // Needed for parent Service
    subCategory: "Guide", // Enum Default
    languages: "", // String -> Array
    experienceYears: "",
    fee: "",
    speciality: "", // String -> Array
    contact: {
      phone: "",
      email: "",
      website: ""
    }
  });

  const [photoFiles, setPhotoFiles] = useState([]);

  // --- Handlers ---

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleContactChange = (e) => {
    setForm({
      ...form,
      contact: { ...form.contact, [e.target.name]: e.target.value }
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (photoFiles.length + files.length > 4) {
        alert("Max 4 images allowed");
        return;
    }
    setPhotoFiles(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const formData = new FormData();

    // 1. Simple Fields
    formData.append("title", form.title);
    formData.append("subCategory", form.subCategory);
    formData.append("experienceYears", form.experienceYears);
    formData.append("fee", form.fee);

    // 2. Arrays (Split string by comma) -> JSON Stringify for Backend Middleware
    const languagesArray = form.languages ? form.languages.split(',').map(i => i.trim()) : [];
    const specialityArray = form.speciality ? form.speciality.split(',').map(i => i.trim()) : [];

    formData.append("languages", JSON.stringify(languagesArray));
    formData.append("speciality", JSON.stringify(specialityArray));
    formData.append("contact", JSON.stringify(form.contact));

    // 3. Images (Key: "GuidePhotos" - ensure backend matches this)
    photoFiles.forEach(file => formData.append("GuidePhotos", file));

    try {
        await addMutation.mutateAsync(formData);
        setShowModal(false);
        setForm({
            title: "", subCategory: "Guide", languages: "", experienceYears: "", fee: "", speciality: "",
            contact: { phone: "", email: "", website: "" }
        });
        setPhotoFiles([]);
    } catch (err) {
        console.error("Failed to add guide", err);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (isError) return <div className="flex justify-center items-center h-screen text-red-500">Error loading data</div>;
  if (clickedPlace) return <GuideDetails />;

  const guides = data?.guides || [];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <Navbar />

      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Local Guides & Agencies</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore the city with experienced professionals and trusted agencies.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {guides.map(g => (
            <GuideCard key={g._id} guide={g} />
          ))}
        </div>
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105"
      >
        <Plus size={28} />
      </button>

      {/* ---------------- MODAL ---------------- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800">Register Guide / Agency</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-5">
                
                {/* Section 1: Identity */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Profile Info</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                                name="title"
                                placeholder="Name or Agency Name"
                                value={form.title}
                                onChange={handleChange}
                                className="w-full pl-9 border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500"
                            />
                        </div>
                        
                        {/* Schema Enum Dropdown */}
                        <div className="relative">
                            <select
                                name="subCategory"
                                value={form.subCategory}
                                onChange={handleChange}
                                className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500 bg-white appearance-none cursor-pointer"
                            >
                                {["Guide","Travel Agencies"].map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-3.5 text-gray-500 pointer-events-none" size={16}/>
                        </div>
                    </div>
                </div>

                {/* Section 2: Professional Details */}
                <div className="grid grid-cols-2 gap-4">
                     <div className="relative">
                        <Briefcase size={16} className="absolute left-3 top-3.5 text-gray-400" />
                        <input
                            name="experienceYears"
                            type="number"
                            placeholder="Exp (Years)"
                            value={form.experienceYears}
                            onChange={handleChange}
                            className="w-full pl-9 border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500"
                        />
                     </div>
                     <div className="relative">
                        <IndianRupee size={16} className="absolute left-3 top-3.5 text-gray-400" />
                        <input
                            name="fee"
                            type="number"
                            placeholder="Fee (₹)"
                            value={form.fee}
                            onChange={handleChange}
                            className="w-full pl-9 border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500"
                        />
                     </div>
                </div>

                <div>
                    <div className="relative mb-3">
                        <Languages size={16} className="absolute left-3 top-3.5 text-gray-400" />
                        <input
                            name="languages"
                            placeholder="Languages (comma separated: Hindi, English)"
                            value={form.languages}
                            onChange={handleChange}
                            className="w-full pl-9 border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500"
                        />
                    </div>
                    <div className="relative">
                        <Award size={16} className="absolute left-3 top-3.5 text-gray-400" />
                        <input
                            name="speciality"
                            placeholder="Specialities (comma separated: History, Trekking)"
                            value={form.speciality}
                            onChange={handleChange}
                            className="w-full pl-9 border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Section 3: Contact */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Contact Info</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                            <Phone size={16} className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                                name="phone"
                                placeholder="Phone (Required)"
                                value={form.contact.phone}
                                onChange={handleContactChange}
                                className="w-full pl-9 border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                                name="email"
                                placeholder="Email"
                                value={form.contact.email}
                                onChange={handleContactChange}
                                className="w-full pl-9 border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="relative sm:col-span-2">
                            <Globe size={16} className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                                name="website"
                                placeholder="Website"
                                value={form.contact.website}
                                onChange={handleContactChange}
                                className="w-full pl-9 border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 4: Images */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50">
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        ref={fileInputRef}
                        disabled={photoFiles.length >= 4}
                    />
                    {photoFiles.length < 4 && (
                        <button onClick={() => fileInputRef.current.click()} className="flex flex-col items-center text-blue-600 hover:text-blue-700">
                            <Upload size={32} className="mb-2"/>
                            <span className="font-medium">Upload Photos ({photoFiles.length}/4)</span>
                        </button>
                    )}
                    {photoFiles.length > 0 && (
                        <div className="grid grid-cols-4 gap-4 mt-6 w-full">
                            {photoFiles.map((file, i) => (
                                <div key={i} className="relative group aspect-square rounded overflow-hidden shadow-sm">
                                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="preview"/>
                                    <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={handleSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold shadow-md transition-all active:scale-[0.98]"
              >
                Register
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return <Guides />;
}