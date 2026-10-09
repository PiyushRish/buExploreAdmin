import React, { useState } from "react";
import { User, Globe, Star, Plus, X, UploadCloud, Languages, Building, MapPin, Clock, Phone, Mail } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import { getAgencies, addAgency } from "../api/agency.api";
import { useAddGuideMutation } from "../mutations/guideMutation";
import toast from "react-hot-toast";
import GuideDetails from "./GuideDetails.jsx";
import { Req, RequiredNotice } from "../components/RequiredTag.jsx";
import FormField from "../components/FormField.jsx";
import { validators, runValidators, validateMediaType } from "../utils/validators.js";
import NotificationDraftSection from "../components/NotificationDraftSection.jsx";
import { useNotificationDraft } from "../utils/useNotificationDraft.js";

const getImageUrl = (photo) => {
  if (!photo) return "https://picsum.photos/400/400";
  if (typeof photo === "string") return photo;
  return photo.url || photo.secure_url || "https://picsum.photos/400/400";
};

const GuideCard = ({ guide, onSelect }) => (
  <div
    onClick={() => onSelect(guide)}
    className={`bg-white rounded-2xl shadow-lg overflow-hidden border transition-all duration-300 hover:shadow-2xl flex flex-col h-full cursor-pointer group ${
      guide.isDeleted ? "opacity-60 border-red-300 bg-red-50/30" : "border-gray-100"
    }`}
  >
    <div className="relative h-56 bg-gray-900 overflow-hidden">
      <img
        src={getImageUrl(guide?.photos?.[0] || guide?.profilePhoto)}
        alt={guide?.name || guide?.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute top-3 left-3 bg-purple-900/80 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
        <Building size={12} className="text-purple-300" />
        {guide?.agency?.name || "Independent Guide"}
      </div>
      <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
        <Star size={12} className="text-yellow-400 fill-yellow-400" />
        {guide?.rating || "New"}
      </div>
    </div>

    <div className="p-5 flex flex-col flex-grow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-extrabold text-lg text-gray-900 line-clamp-1">{guide?.name || guide?.title}</h3>
        <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded">
          {guide?.subCategory}
        </span>
      </div>
      
      {guide?.agency && (
        <p className="text-xs font-semibold text-indigo-600 mb-2 flex items-center gap-1">
          <MapPin size={12} /> {guide.agency.city || "Bundelkhand"} Agency Partner
        </p>
      )}

      <div className="flex items-center text-gray-500 text-xs font-medium mt-1 mb-2">
        <Languages size={12} className="mr-1 text-purple-500 flex-shrink-0" />
        <span className="line-clamp-1">
          {Array.isArray(guide?.languages) ? guide.languages.join(", ") : guide?.languages || "English"}
        </span>
      </div>
      <p className="text-gray-600 text-xs line-clamp-2 flex-grow leading-relaxed">
        {guide?.experienceYears ? `${guide.experienceYears} Years Exp.` : "Registered Professional."}
      </p>
      <div className="pt-3 mt-3 border-t border-gray-100 flex justify-between items-center text-[11px] font-bold text-gray-500">
        <span className="text-purple-700">₹{guide?.fee || "1000"}/day</span>
        <span className="text-blue-600 hover:underline">Manage All Fields →</span>
      </div>
    </div>
  </div>
);

const Guide = () => {
  const queryClient = useQueryClient();
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showAgencyModal, setShowAgencyModal] = useState(false);
  const [search, setSearch] = useState("");

  // Fetch Guides
  const { data: guideData, isLoading: loadingGuides } = useQuery({
    queryKey: ["guides"],
    queryFn: async () => {
      const res = await axiosClient.get("/services/guides");
      return res.data;
    },
  });

  // Fetch Agencies
  const { data: agencyData } = useQuery({
    queryKey: ["agencies"],
    queryFn: async () => getAgencies(),
  });

  const agencies = agencyData?.agencies || [];
  const { mutateAsync: addGuideMutation, isPending: isAddingGuide } = useAddGuideMutation();
  const { notif, setNotif, sendIfEnabled, resetNotif } = useNotificationDraft("guide");

  // Guide Form State
  const [guideForm, setGuideForm] = useState({
    title: "",
    name: "",
    agencyId: "",
    subCategory: "Guide",
    phone: "",
    email: "",
    website: "",
    languages: "English",
    speciality: "",
    fee: "",
    experienceYears: "",
  });
  const [guidePhotos, setGuidePhotos] = useState([]);

  // Agency Form State
  const [agencyForm, setAgencyForm] = useState({
    name: "",
    address: "",
    city: "Jhansi",
    phone: "",
    email: "",
    website: "",
    openTime: "09:00 AM",
    closeTime: "07:00 PM",
    description: "",
  });
  const [agencyPhotos, setAgencyPhotos] = useState([]);

  const handleCreateAgency = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("name", agencyForm.name);
      data.append("address", agencyForm.address);
      data.append("city", agencyForm.city);
      data.append("description", agencyForm.description);
      
      const contact = { phone: agencyForm.phone, email: agencyForm.email, website: agencyForm.website };
      data.append("contact", JSON.stringify(contact));

      const openingHours = { open: agencyForm.openTime, close: agencyForm.closeTime, daysOpen: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] };
      data.append("openingHours", JSON.stringify(openingHours));

      if (agencyPhotos) {
        for (let i = 0; i < agencyPhotos.length; i++) {
          data.append("AgencyPhotos", agencyPhotos[i]);
        }
      }

      await addAgency(data);
      toast.success("Travel Agency created successfully!");
      setShowAgencyModal(false);
      queryClient.invalidateQueries(["agencies"]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create agency");
    }
  };

  const handleCreateGuide = async () => {
    if (!guideForm.title || !guideForm.name || guidePhotos.length === 0) {
      toast.error("Title, Name, and Cover Photo are required");
      return;
    }

    const payload = {
      title: guideForm.title,
      name: guideForm.name,
      subCategory: guideForm.subCategory,
      agencyId: guideForm.agencyId,
      experienceYears: Number(guideForm.experienceYears || 0),
      fee: Number(guideForm.fee || 0),
      contact: JSON.stringify({
        phone: guideForm.phone,
        email: guideForm.email,
        website: guideForm.website,
      }),
      languages: JSON.stringify(guideForm.languages.split(",").map((s) => s.trim()).filter(Boolean)),
      speciality: JSON.stringify(guideForm.speciality.split(",").map((s) => s.trim()).filter(Boolean)),
    };

    const formData = new FormData();
    Object.keys(payload).forEach((k) => formData.append(k, payload[k]));
    guidePhotos.forEach((file) => formData.append("GuidePhotos", file));

    try {
      const result = await addGuideMutation(formData);
      await sendIfEnabled({ serviceId: result?.guide?._id || result?._id });
      toast.success("Guide profile created!");
      setShowGuideModal(false);
      setGuidePhotos([]);
      resetNotif();
      queryClient.invalidateQueries(["guides"]);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add guide");
    }
  };

  const guides = (guideData?.guides || []).filter((g) =>
    (g.name || g.title)?.toLowerCase().includes(search.toLowerCase())
  );

  if (loadingGuides) return <div className="p-8 font-bold text-center text-gray-500">Loading Guides...</div>;
  if (selectedGuide) return <GuideDetails guide={selectedGuide} setSelectedGuide={setSelectedGuide} />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border">
          <input
            type="text"
            placeholder="Search guides by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-1/3 border p-2.5 rounded-xl text-sm outline-none focus:border-purple-500"
          />

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => setShowAgencyModal(true)}
              className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-indigo-700 shadow-md transition"
            >
              <Building size={16} /> 1. Create Travel Agency
            </button>
            <button
              onClick={() => setShowGuideModal(true)}
              className="bg-purple-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-purple-700 shadow-md transition"
            >
              <Plus size={16} /> 2. Add Guide Profile
            </button>
          </div>
        </div>

        {/* Agencies Quick Summary */}
        {agencies.length > 0 && (
          <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-2xl">
            <p className="text-xs uppercase font-bold text-indigo-700 mb-2">Registered Travel Agencies ({agencies.length})</p>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {agencies.map((agency) => (
                <div key={agency._id} className="bg-white px-3 py-2 rounded-xl border border-indigo-200 text-xs flex items-center gap-2 flex-shrink-0 shadow-xs">
                  <Building size={14} className="text-indigo-600" />
                  <span className="font-bold text-slate-800">{agency.name}</span>
                  <span className="text-slate-400">({agency.city})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {guides.map((guide) => (
            <GuideCard key={guide._id} guide={guide} onSelect={setSelectedGuide} />
          ))}
        </div>
      </div>

      {/* ── CREATE TRAVEL AGENCY MODAL ── */}
      {showAgencyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100">
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 flex justify-between items-center px-6 py-4 bg-white/95 backdrop-blur border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
                  <Building size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Create Travel Agency</h2>
                  <p className="text-xs text-slate-500 font-medium">Register an agency partner to manage tourist guides and tours</p>
                </div>
              </div>
              <button
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                onClick={() => setShowAgencyModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAgency} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
                {/* SECTION 1: Agency Profile */}
                <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    1. Agency Profile & City
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Agency Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={agencyForm.name}
                        onChange={(e) => setAgencyForm({ ...agencyForm, name: e.target.value })}
                        placeholder="e.g. Royal Bundelkhand Travels"
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition outline-hidden"
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={agencyForm.city}
                        onChange={(e) => setAgencyForm({ ...agencyForm, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: Location & Timings */}
                <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    2. Location & Operating Hours
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Office Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={agencyForm.address}
                        onChange={(e) => setAgencyForm({ ...agencyForm, address: e.target.value })}
                        placeholder="e.g. Near Elite Crossing, Civil Lines"
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition outline-hidden"
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Operating Hours</label>
                      <input
                        type="text"
                        value={agencyForm.openTime}
                        onChange={(e) => setAgencyForm({ ...agencyForm, openTime: e.target.value })}
                        placeholder="09:00 AM - 07:00 PM"
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: Contact */}
                <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    3. Contact Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={agencyForm.phone}
                        onChange={(e) => setAgencyForm({ ...agencyForm, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={agencyForm.email}
                        onChange={(e) => setAgencyForm({ ...agencyForm, email: e.target.value })}
                        placeholder="agency@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 4: Photos */}
                <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                    4. Agency Photos
                  </h3>

                  <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 p-5 rounded-2xl text-center bg-indigo-50/40 hover:bg-indigo-50 transition cursor-pointer flex flex-col items-center justify-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      id="agencyPhotoUpload"
                      onChange={(e) => setAgencyPhotos(Array.from(e.target.files))}
                      className="hidden"
                    />
                    <label
                      htmlFor="agencyPhotoUpload"
                      className="cursor-pointer w-full text-xs font-bold text-indigo-700 flex flex-col items-center justify-center gap-2"
                    >
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <UploadCloud size={20} />
                      </div>
                      {agencyPhotos.length > 0 ? (
                        <div className="space-y-1">
                          <p className="font-bold text-emerald-700">✓ {agencyPhotos.length} Photo(s) Selected</p>
                          <p className="text-[11px] text-slate-500">Click to change selection</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-bold">Upload Agency Office Photos</p>
                          <p className="text-[10px] text-slate-400 font-normal mt-0.5">JPG, PNG, WebP photos</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 z-20 flex justify-between items-center px-6 py-4 bg-white/95 backdrop-blur border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAgencyModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold rounded-xl text-sm shadow-md transition"
                >
                  Create Agency
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CREATE GUIDE MODAL ── */}
      {showGuideModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100">
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 flex justify-between items-center px-6 py-4 bg-white/95 backdrop-blur border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs">
                  <User size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">New Tourist Guide Profile</h2>
                  <p className="text-xs text-slate-500 font-medium">List a verified tour guide with specialties and pricing</p>
                </div>
              </div>
              <button
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                onClick={() => setShowGuideModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
              {/* SECTION 1: Agency Affiliation */}
              <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  1. Agency Affiliation & Identity
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Select Travel Agency (Optional)
                    </label>
                    <select
                      value={guideForm.agencyId}
                      onChange={(e) => setGuideForm({ ...guideForm, agencyId: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl font-semibold bg-white border border-slate-200 text-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition outline-hidden"
                    >
                      <option value="">Independent (No Agency)</option>
                      {agencies.map((agency) => (
                        <option key={agency._id} value={agency._id}>
                          🏢 {agency.name} ({agency.city})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Profile Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={guideForm.title}
                        onChange={(e) => setGuideForm({ ...guideForm, title: e.target.value })}
                        placeholder="e.g. Certified Heritage Historian"
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={guideForm.name}
                        onChange={(e) => setGuideForm({ ...guideForm, name: e.target.value })}
                        placeholder="e.g. Rajesh Sharma"
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Professional Metrics & Fee */}
              <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  2. Experience & Daily Rates
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Experience (Years)</label>
                    <input
                      type="number"
                      value={guideForm.experienceYears}
                      onChange={(e) => setGuideForm({ ...guideForm, experienceYears: e.target.value })}
                      placeholder="e.g. 5"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition outline-hidden font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Fee Per Day (₹)</label>
                    <input
                      type="number"
                      value={guideForm.fee}
                      onChange={(e) => setGuideForm({ ...guideForm, fee: e.target.value })}
                      placeholder="e.g. 1500"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition outline-hidden font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Contact & Languages */}
              <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  3. Contact & Languages
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      value={guideForm.phone}
                      onChange={(e) => setGuideForm({ ...guideForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      value={guideForm.email}
                      onChange={(e) => setGuideForm({ ...guideForm, email: e.target.value })}
                      placeholder="guide@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Languages (Comma separated)
                  </label>
                  <input
                    value={guideForm.languages}
                    onChange={(e) => setGuideForm({ ...guideForm, languages: e.target.value })}
                    placeholder="e.g. Hindi, English, Bundeli, German"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition outline-hidden"
                  />
                </div>
              </div>

              {/* SECTION 4: Cover Photos */}
              <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  4. Profile Cover Photos
                </h3>

                <div className="border-2 border-dashed border-purple-200 hover:border-purple-400 p-5 rounded-2xl text-center bg-purple-50/40 hover:bg-purple-50 transition cursor-pointer flex flex-col items-center justify-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    id="guidePhotoUpload"
                    onChange={(e) => setGuidePhotos(Array.from(e.target.files).slice(0, 2))}
                    className="hidden"
                  />
                  <label
                    htmlFor="guidePhotoUpload"
                    className="cursor-pointer w-full text-xs font-bold text-purple-700 flex flex-col items-center justify-center gap-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                      <UploadCloud size={20} />
                    </div>
                    {guidePhotos.length > 0 ? (
                      <div className="space-y-1">
                        <p className="font-bold text-emerald-700">✓ {guidePhotos.length} Photo(s) Selected</p>
                        <p className="text-[11px] text-slate-500">Click to change selection (Max 2)</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-bold">Upload Guide Profile Photos <Req /></p>
                        <p className="text-[10px] text-slate-400 font-normal mt-0.5">JPG, PNG, WebP up to 2 photos</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* SECTION 5: Push Notification Broadcast */}
              <NotificationDraftSection
                serviceType="guide"
                entityName={guideForm.name || guideForm.title}
                value={notif}
                onChange={setNotif}
              />
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 z-20 flex justify-between items-center px-6 py-4 bg-white/95 backdrop-blur border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGuide}
                disabled={isAddingGuide}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-98 text-white rounded-xl font-bold text-sm shadow-md transition disabled:bg-purple-300 flex items-center gap-2"
              >
                {isAddingGuide ? "Saving..." : "Save Guide Profile"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Guide;