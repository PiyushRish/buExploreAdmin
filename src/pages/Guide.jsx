import React, { useState } from "react";
import { User, Phone, Globe, Star, Plus, X, UploadCloud, Languages, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import { useAddGuideMutation } from "../mutations/guideMutation";
import toast from "react-hot-toast";

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
        alt={guide?.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      {guide.isDeleted && (
        <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow">
          Soft Deleted
        </div>
      )}
      <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
        <Star size={12} className="text-yellow-400 fill-yellow-400" />
        {guide?.rating || "4.8"}
      </div>
    </div>

    <div className="p-5 flex flex-col flex-grow">
      <h3 className="font-extrabold text-lg text-gray-900 line-clamp-1">{guide?.name}</h3>
      <div className="flex items-center text-gray-500 text-xs font-medium mt-1 mb-2">
        <Languages size={12} className="mr-1 text-purple-500 flex-shrink-0" />
        <span className="line-clamp-1">
          {Array.isArray(guide?.languages) ? guide.languages.join(", ") : guide?.languages || "Hindi, English"}
        </span>
      </div>
      <p className="text-gray-600 text-xs line-clamp-2 flex-grow leading-relaxed">
        {guide?.bio || guide?.experience || "Registered Tour Guide."}
      </p>
      <div className="pt-3 mt-3 border-t border-gray-100 flex justify-between items-center text-[11px] font-bold text-gray-500">
        <span className="text-purple-700">₹{guide?.pricePerDay || "1,000"}/day</span>
        <span className="text-blue-600 hover:underline">Manage All Fields →</span>
      </div>
    </div>
  </div>
);

const Guide = ({ setSelectedGuide }) => {
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["guides", includeDeleted],
    queryFn: async () => {
      const res = await axiosClient.get("/services/guides", { params: { includeDeleted } });
      return res.data;
    },
  });

  const { mutateAsync: addGuide, isPending } = useAddGuideMutation();

  const [form, setForm] = useState({
    name: "",
    bio: "",
    phoneNumber: "",
    languages: "Hindi, English",
    pricePerDay: "1000",
    experienceYears: "5",
  });

  const [photoFiles, setPhotoFiles] = useState([]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.name || photoFiles.length === 0) {
      toast.error("Guide name and photo required");
      return;
    }

    const formData = new FormData();
    const payload = {
      ...form,
      languages: form.languages.split(",").map((s) => s.trim()),
    };

    formData.append("data", JSON.stringify(payload));
    photoFiles.forEach((f) => formData.append("photos", f));

    try {
      await addGuide(formData);
      toast.success("Guide profile created!");
      setShowModal(false);
      setPhotoFiles([]);
    } catch (_err) {
      toast.error("Failed to add guide");
    }
  };

  const guides = (data?.guides || []).filter((g) =>
    g.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <div className="p-8 font-bold text-center text-gray-500">Loading Guides...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border">
          <input
            type="text"
            placeholder="Search guides by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-1/3 border p-2.5 rounded-xl text-sm outline-none focus:border-purple-500"
          />

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700 bg-gray-100 px-3 py-2 rounded-xl border">
              <input
                type="checkbox"
                checked={includeDeleted}
                onChange={(e) => setIncludeDeleted(e.target.checked)}
                className="rounded text-purple-600"
              />
              Show Soft-Deleted Records
            </label>

            <button
              onClick={() => setShowModal(true)}
              className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-purple-700 shadow-md"
            >
              <Plus size={16} /> Add Guide Profile
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {guides.map((guide) => (
            <GuideCard key={guide._id} guide={guide} onSelect={setSelectedGuide} />
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-bold">New Guide Profile</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            <input name="name" placeholder="Full Name *" onChange={handleChange} className="w-full border p-2.5 rounded-xl text-sm" />
            <textarea name="bio" placeholder="Bio / Experience..." onChange={handleChange} rows={3} className="w-full border p-2.5 rounded-xl text-sm resize-none" />

            <div className="grid grid-cols-2 gap-4">
              <input name="phoneNumber" placeholder="Phone Number" onChange={handleChange} className="border p-2.5 rounded-xl text-sm" />
              <input name="pricePerDay" placeholder="Price Per Day (₹)" onChange={handleChange} className="border p-2.5 rounded-xl text-sm" />
            </div>

            <input name="languages" placeholder="Languages (e.g. Hindi, English, German)" onChange={handleChange} className="w-full border p-2.5 rounded-xl text-sm" />

            <div className="border border-dashed p-4 rounded-xl text-center bg-gray-50">
              <input type="file" multiple accept="image/*" id="guidePhotos" onChange={(e) => setPhotoFiles(Array.from(e.target.files))} className="hidden" />
              <label htmlFor="guidePhotos" className="cursor-pointer text-xs font-bold text-purple-600 flex items-center justify-center gap-2">
                <UploadCloud size={20} /> {photoFiles.length ? `${photoFiles.length} Photos Selected` : "Upload Guide Photos *"}
              </label>
            </div>

            <button onClick={handleSubmit} disabled={isPending} className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold shadow-md">
              {isPending ? "Creating..." : "Save Guide Profile"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Guide;