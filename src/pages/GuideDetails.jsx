import React, { useState, useEffect } from "react";
import { User, MapPin, Star, UploadCloud, Save, X, Edit2, ShieldAlert, ArrowLeft, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { validateMediaType } from "../utils/validators.js";
import { useUpdateGuideMutation, useDeleteGuideMutation } from "../mutations/guideMutation";

const getImageUrl = (photo) => {
  if (!photo) return "";
  if (typeof photo === "string") return photo;
  return photo.url || photo.secure_url || "";
};

const GuideDetails = ({ guide, setSelectedGuide }) => {
  const [data, setData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [newPhotoFiles, setNewPhotoFiles] = useState([]);

  const updateMutation = useUpdateGuideMutation();
  const deleteMutation = useDeleteGuideMutation();

  useEffect(() => {
    if (guide) {
      setData({
        ...guide,
        contactPhone: guide?.contact?.phone || "",
        contactEmail: guide?.contact?.email || "",
        contactWebsite: guide?.contact?.website || "",
        parsedLanguages: guide?.languages ? guide.languages.join(", ") : "",
        parsedSpeciality: guide?.speciality ? guide.speciality.join(", ") : "",
      });
    }
  }, [guide]);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const payload = {
      title: data.title,
      name: data.name,
      subCategory: data.subCategory,
      experienceYears: Number(data.experienceYears || 0),
      fee: Number(data.fee || 0),
    };

    const formData = new FormData();
    Object.keys(payload).forEach((k) => formData.append(k, payload[k]));

    if (data.contactPhone || data.contactEmail) {
      formData.append("contact", JSON.stringify({
        phone: data.contactPhone,
        email: data.contactEmail,
        website: data.contactWebsite
      }));
    }
    if (data.parsedLanguages) {
      formData.append("languages", JSON.stringify(data.parsedLanguages.split(',').map(i=>i.trim()).filter(Boolean)));
    }
    if (data.parsedSpeciality) {
      formData.append("speciality", JSON.stringify(data.parsedSpeciality.split(',').map(i=>i.trim()).filter(Boolean)));
    }
    if (newPhotoFiles.length > 0) {
        newPhotoFiles.forEach(f => formData.append("GuidePhotos", f));
    }
    // We send existing photos state so the backend doesn't delete them. 
    formData.append("existingPhotos", JSON.stringify(guide.photos || []));

    try {
      const targetId = guide.service?._id || guide._id;
      await updateMutation.mutateAsync({ guideId: targetId, guideData: formData });
      toast.success("Profile updated!");
      setIsEditing(false);
      setNewPhotoFiles([]);
    } catch(err) {
      toast.error(err?.response?.data?.message || "Failed to update");
    }
  };

  const handleDelete = async () => {
    try {
      const targetId = guide?.service?._id || guide?._id;
      await deleteMutation.mutateAsync(targetId);
      toast.success("Profile deleted");
      setSelectedGuide(null);
    } catch(err) {
       toast.error(err?.response?.data?.message || "Failed to delete");
    }
  };

  const displayImages = guide?.photos || [];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <div className="w-full h-full flex flex-col bg-white">
        <div className="h-16 border-b px-8 flex items-center justify-between">
          <button onClick={() => setSelectedGuide(null)} className="flex items-center text-gray-600 hover:text-black">
            <ArrowLeft size={20} className="mr-2" /> Back summary
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className={`flex items-center px-4 py-2 rounded-lg font-bold ${
                isEditing ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              {isEditing ? <><Save size={16} className="mr-2" /> Save</> : <><Edit2 size={16} className="mr-2" /> Edit</>}
            </button>

            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg flex items-center font-bold hover:bg-red-100 focus:outline-none"
            >
              <Trash2 size={16} className="mr-2" /> Delete 
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <input
            name="name"
            value={data.name || ""}
            onChange={handleChange}
            disabled={!isEditing}
            className={`w-full text-4xl font-extrabold bg-transparent ${isEditing ? 'border-b-2 border-purple-500' : ''}`}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border mt-6">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Title Display</span>
              <input name="title" value={data.title || ""} onChange={handleChange} disabled={!isEditing} className="w-full bg-transparent font-medium" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Type</span>
              <select 
                name="subCategory" 
                value={data.subCategory || ""} 
                onChange={handleChange} 
                disabled={!isEditing}
                className="w-full bg-transparent font-medium disabled:opacity-100"
              >
                <option value="Guide">Individual Guide</option>
                <option value="Travel Agencies">Travel Agency</option>
              </select>
            </div>
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Fee (₹)</span>
              <input name="fee" type="number" step="1" value={data.fee || ""} onChange={handleChange} disabled={!isEditing} className="w-full bg-transparent font-medium" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Experience (Yrs)</span>
              <input name="experienceYears" type="number" value={data.experienceYears || ""} onChange={handleChange} disabled={!isEditing} className="w-full bg-transparent font-medium" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
               <div>
                <span className="text-sm font-bold text-gray-800 mb-2 block">Specialities</span>
                <input
                  name="parsedSpeciality"
                  value={data.parsedSpeciality || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="e.g. Monuments, Food Tours"
                  className="w-full border-b p-1 bg-transparent outline-none"
                />
               </div>

               <div>
                <span className="text-sm font-bold text-gray-800 mb-2 block">Languages</span>
                <input
                  name="parsedLanguages"
                  value={data.parsedLanguages || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="e.g. English, French"
                  className="w-full border-b p-1 bg-transparent outline-none"
                />
               </div>
               
               <div className="bg-gray-50 p-4 rounded-xl border space-y-3 mt-4">
                 <h4 className="text-sm font-bold text-gray-800">Contact Details</h4>
                 <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-16">Phone:</span>
                    <input name="contactPhone" value={data.contactPhone || ""} onChange={handleChange} disabled={!isEditing} className="flex-1 bg-transparent border-b outline-none"/>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-16">Email:</span>
                    <input name="contactEmail" value={data.contactEmail || ""} onChange={handleChange} disabled={!isEditing} className="flex-1 bg-transparent border-b outline-none"/>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-16">Web:</span>
                    <input name="contactWebsite" value={data.contactWebsite || ""} onChange={handleChange} disabled={!isEditing} className="flex-1 bg-transparent border-b outline-none"/>
                 </div>
               </div>
            </div>

            <div className="space-y-4">
              <div>
                 <h4 className="text-sm font-bold text-gray-800 mb-2">Display Photos</h4>
                 <div className="grid grid-cols-3 gap-3">
                   {displayImages.length > 0 && newPhotoFiles.length === 0 && displayImages.map((photo, i) => (
                      <div key={i} className="aspect-square rounded-xl overflow-hidden border">
                        <img src={getImageUrl(photo)} alt={`display ${i}`} className="w-full h-full object-cover" />
                      </div>
                   ))}
                   {newPhotoFiles.length > 0 && Array.from(newPhotoFiles).map((file, i) => (
                      <div key={i} className="aspect-square rounded-xl overflow-hidden border">
                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt={`new upload ${i}`} />
                      </div>
                   ))}
                 </div>
                 
                 {isEditing && (
                    <div className="mt-3">
                      <input type="file" multiple id="gPhotoUpdate" onChange={(e) => {
                const files = Array.from(e.target.files).slice(0, 2);
                for (let f of files) {
                  const v = validateMediaType(f, 'image');
                  if (v !== true) return toast.error(v);
                }
                setNewPhotoFiles(files);
              }} accept="image/*" className="hidden"/>
                      <label htmlFor="gPhotoUpdate" className="text-purple-600 text-sm font-bold flex items-center gap-1 cursor-pointer w-fit bg-purple-50 py-1.5 px-3 rounded-lg"><UploadCloud size={16}/> Replace Photos (Max 2)</label>
                    </div>
                 )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideDetails;