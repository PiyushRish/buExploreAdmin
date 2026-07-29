import React, { useState } from "react";
import { User, Globe, Star, Plus, X, UploadCloud, Languages } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import { useAddGuideMutation } from "../mutations/guideMutation";
import toast from "react-hot-toast";
import GuideDetails from "./GuideDetails.jsx";
import { Req, RequiredNotice } from "../components/RequiredTag.jsx";
import FormField from "../components/FormField.jsx";
import { validators, runValidators, validateMediaType } from "../utils/validators.js";

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
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["guides"],
    queryFn: async () => {
      const res = await axiosClient.get("/services/guides");
      return res.data;
    },
  });

  const { mutateAsync: addGuide, isPending } = useAddGuideMutation();

  const [form, setForm] = useState({
    title: "",
    name: "",
    subCategory: "Guide",
    phone: "",
    email: "",
    website: "",
    languages: "English",
    speciality: "",
    fee: "",
    experienceYears: "",
  });

  const [photoFiles, setPhotoFiles] = useState([]);

  const RULES = {
    title: [validators.required],
    name: [validators.required],
    phone: [validators.phone],
    email: [validators.email],
    website: [validators.url],
    fee: [validators.number({ min: 0 })],
    experienceYears: [validators.number({ min: 0 })],
  };

  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = (name, value) => {
    const rules = RULES[name];
    if (!rules) return null;
    return runValidators(value, rules, name);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFieldErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleSubmit = async () => {
    const requiredFields = ["title", "name"];
    const optionalFields = ["subCategory", "phone", "email", "website", "languages", "speciality", "fee", "experienceYears"];
    const allFields = [...requiredFields, ...optionalFields];

    const newTouched = {};
    const newErrors = {};
    let hasError = false;

    allFields.forEach((field) => {
      newTouched[field] = true;
      const error = validate(field, form[field] || "");
      newErrors[field] = error;
      if (error) hasError = true;
    });

    setTouched(newTouched);
    setFieldErrors(newErrors);

    if (hasError || photoFiles.length === 0) {
      if (photoFiles.length === 0) toast.error("Photo is required");
      toast.error("Please fix the highlighted errors before submitting.");
      return;
    }

    const payload = {
      title: form.title,
      name: form.name,
      subCategory: form.subCategory,
      experienceYears: Number(form.experienceYears || 0),
      fee: Number(form.fee || 0),
      contact: JSON.stringify({
        phone: form.phone,
        email: form.email,
        website: form.website
      }),
      languages: JSON.stringify(form.languages.split(',').map(s=>s.trim()).filter(Boolean)),
      speciality: JSON.stringify(form.speciality.split(',').map(s=>s.trim()).filter(Boolean)),
    };

    const formData = new FormData();
    Object.keys(payload).forEach((k) => formData.append(k, payload[k]));
    photoFiles.forEach(file => formData.append("GuidePhotos", file));

    try {
      await addGuide(formData);
      toast.success("Guide profile created!");
      setShowModal(false);
      setPhotoFiles([]);
      setForm({ title: "", name: "", subCategory: "Guide", phone: "", email: "", website: "", languages: "English", speciality: "", fee: "", experienceYears: "" });
      setTouched({});
      setFieldErrors({});
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add guide");
    }
  };

  const guides = (data?.guides || []).filter((g) =>
    (g.name || g.title)?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <div className="p-8 font-bold text-center text-gray-500">Loading Guides...</div>;
  if (selectedGuide) return <GuideDetails guide={selectedGuide} setSelectedGuide={setSelectedGuide} />;

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
              <h2 className="text-xl font-bold">New Travel Expert</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            <RequiredNotice />

            <div className="grid grid-cols-2 gap-4">
               <FormField label="Profile Title" required error={fieldErrors.title?.error} hint={fieldErrors.title?.hint || "Profile Title"} touched={touched.title} valid={touched.title && !fieldErrors.title}>
                 <input name="title" placeholder="Profile Title" value={form.title} onChange={handleChange} onBlur={handleBlur} className="w-full border p-2.5 rounded-xl text-sm" />
               </FormField>
               <FormField label="Full Name" required error={fieldErrors.name?.error} hint={fieldErrors.name?.hint || "Full Name"} touched={touched.name} valid={touched.name && !fieldErrors.name}>
                 <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} onBlur={handleBlur} className="w-full border p-2.5 rounded-xl text-sm" />
               </FormField>
               
               <FormField label="Guide Type" optional hint="Type of guide">
                 <select name="subCategory" value={form.subCategory} onChange={handleChange} onBlur={handleBlur} className="w-full border p-2.5 rounded-xl text-sm">
                   <option value="Guide">Individual Guide</option>
                   <option value="Travel Agencies">Travel Agency</option>
                 </select>
               </FormField>
               <FormField label="Experience Years" optional error={fieldErrors.experienceYears?.error} hint={fieldErrors.experienceYears?.hint || "e.g. 5"} touched={touched.experienceYears} valid={touched.experienceYears && !fieldErrors.experienceYears}>
                 <input name="experienceYears" type="number" placeholder="e.g. 5" value={form.experienceYears} onChange={handleChange} onBlur={handleBlur} className="border p-2.5 rounded-xl text-sm w-full" />
               </FormField>
               <FormField label="Fee Per Day (₹)" optional error={fieldErrors.fee?.error} hint={fieldErrors.fee?.hint || "Fee Per Day (₹)"} touched={touched.fee} valid={touched.fee && !fieldErrors.fee}>
                 <input name="fee" type="number" placeholder="Fee Per Day (₹)" value={form.fee} onChange={handleChange} onBlur={handleBlur} className="border p-2.5 rounded-xl text-sm w-full" />
               </FormField>
               <FormField label="Contact Phone" optional error={fieldErrors.phone?.error} hint={fieldErrors.phone?.hint || "Contact Phone"} touched={touched.phone} valid={touched.phone && !fieldErrors.phone}>
                 <input name="phone" placeholder="Contact Phone" value={form.phone} onChange={handleChange} onBlur={handleBlur} className="w-full border p-2.5 rounded-xl text-sm" />
               </FormField>
               <FormField label="Email" optional error={fieldErrors.email?.error} hint={fieldErrors.email?.hint || "Contact Email"} touched={touched.email} valid={touched.email && !fieldErrors.email}>
                 <input name="email" placeholder="Contact Email" value={form.email} onChange={handleChange} onBlur={handleBlur} className="w-full border p-2.5 rounded-xl text-sm" />
               </FormField>
               <div className="col-span-2">
                 <FormField label="Website" optional error={fieldErrors.website?.error} hint={fieldErrors.website?.hint || "Website"} touched={touched.website} valid={touched.website && !fieldErrors.website}>
                   <input name="website" placeholder="Website" value={form.website} onChange={handleChange} onBlur={handleBlur} className="w-full border p-2.5 rounded-xl text-sm" />
                 </FormField>
               </div>
            </div>

            <FormField label="Languages" optional hint="Comma separated, e.g. English, Hindi">
              <input name="languages" placeholder="Comma separated, e.g. English, Hindi" value={form.languages} onChange={handleChange} onBlur={handleBlur} className="w-full border p-2.5 rounded-xl text-sm" />
            </FormField>
            <FormField label="Specialities" optional hint="e.g. History, Trekking">
              <input name="speciality" placeholder="e.g. History, Trekking" value={form.speciality} onChange={handleChange} onBlur={handleBlur} className="w-full border p-2.5 rounded-xl text-sm" />
            </FormField>

            <div className="border border-dashed p-4 rounded-xl text-center bg-gray-50">
              <input type="file" multiple accept="image/*" id="guidePhotos" onChange={(e) => {
                const files = Array.from(e.target.files).slice(0, 2);
                for (let f of files) {
                  const v = validateMediaType(f, 'image');
                  if (v !== true) return toast.error(v);
                }
                setPhotoFiles(files);
              }} className="hidden" />
              <label htmlFor="guidePhotos" className="cursor-pointer text-xs font-bold text-purple-600 flex flex-col items-center justify-center gap-2">
                <UploadCloud size={20} />
                {photoFiles.length > 0 ? `${photoFiles.length} Selections (Max 2)` : <span>Upload Cover Photos <Req /> (Max 2)</span>}
              </label>
            </div>

            <button onClick={handleSubmit} disabled={isPending} className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold shadow-md">
              {isPending ? "Creating..." : "Save Profile"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Guide;