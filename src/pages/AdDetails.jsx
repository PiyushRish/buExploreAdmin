import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, Trash2, Eye, MousePointer, ExternalLink, Image as ImageIcon, Video, UploadCloud, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useDeleteAdMutation, useUpdateAdMutation } from "../mutations/adsMutation";
import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";
import FormField from "../components/FormField";
import { validators, runValidators, validateMediaType } from "../utils/validators";
import { RequiredNotice, Req } from "../components/RequiredTag";

const STATUS_OPTIONS = ["active", "paused", "draft", "scheduled", "ended"];

const getImageUrl = (photo) => {
  if (!photo) return null;
  if (typeof photo === "string") return photo;
  return photo.url || photo.secure_url || null;
};

const AdDetails = ({ ad, onBack }) => {
  const updateAdMutation = useUpdateAdMutation();
  const deleteAdMutation = useDeleteAdMutation();

  const { data: statsData } = useQuery({
    queryKey: ["adStats", ad._id],
    queryFn: async () => {
      const res = await axiosClient.get(`/advertisment/stats/${ad._id}`);
      return res.data;
    },
  });

  const stats = statsData?.stats || { impressions: ad.impressions || 0, clicks: ad.clicks || 0, ctr: "0.0" };

  const [adForm, setAdForm] = useState({
    status: ad.status || "draft",
    headline: ad.content?.headline || "",
    bodyText: ad.content?.bodyText || "",
    ctaText: ad.content?.ctaText || "Learn More",
    linkUrl: ad.content?.linkUrl || "",
    priority: ad.priority?.toString() || "1",
    pricePaid: ad.pricePaid?.toString() || "",
    maxImpressions: ad.maxImpressions?.toString() || "",
    frequencyCap: ad.frequencyCap?.toString() || "",
    startDate: ad.startDate ? new Date(ad.startDate).toISOString().split("T")[0] : "",
    endDate: ad.endDate ? new Date(ad.endDate).toISOString().split("T")[0] : "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  const AD_RULES = {
    headline: [validators.required, validators.maxLength(100)],
    linkUrl: [validators.url],
    pricePaid: [validators.number({ min: 0 })],
    maxImpressions: [validators.positiveInt],
    frequencyCap: [validators.positiveInt],
    priority: [validators.number({ min: 1 })],
    startDate: [validators.required, validators.date],
    endDate: [validators.endAfterStart(adForm.startDate)],
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const rules = AD_RULES[name];
      if (rules) {
        setFieldErrors((prev) => ({ ...prev, [name]: runValidators(value, rules, name) }));
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const rules = AD_RULES[name];
    if (rules) {
      setFieldErrors((prev) => ({ ...prev, [name]: runValidators(value, rules, name) }));
    }
  };

  const handleSave = () => {
    const requiredFields = ["headline", "startDate"];
    const optionalFields = ["linkUrl", "pricePaid", "maxImpressions", "frequencyCap", "priority", "endDate"];
    const allFields = [...requiredFields, ...optionalFields];

    let hasError = false;
    const newTouched = {};
    const newErrors = {};

    allFields.forEach((field) => {
      newTouched[field] = true;
      const result = runValidators(adForm[field] || "", AD_RULES[field] || [], field);
      newErrors[field] = result;
      if (result) hasError = true;
    });

    setTouched(newTouched);
    setFieldErrors(newErrors);

    if (hasError) {
      toast.error("Please fix errors before saving.");
      return;
    }

    const formData = new FormData();
    if (imageFile) formData.append("photos", imageFile); // backend expects 'photos'
    if (videoFile) formData.append("videos", videoFile); // backend expects 'videos'

    const payload = {
      status: adForm.status,
      startDate: adForm.startDate,
      ...(adForm.endDate && { endDate: adForm.endDate }),
      priority: Number(adForm.priority) || 1,
      ...(adForm.pricePaid && { pricePaid: Number(adForm.pricePaid) }),
      ...(adForm.maxImpressions && { maxImpressions: Number(adForm.maxImpressions) }),
      ...(adForm.frequencyCap && { frequencyCap: Number(adForm.frequencyCap) }),
      content: {
        ...ad.content,
        headline: adForm.headline,
        ...(adForm.bodyText && { bodyText: adForm.bodyText }),
        ...(adForm.ctaText && { ctaText: adForm.ctaText }),
        ...(adForm.linkUrl && { linkUrl: adForm.linkUrl }),
      },
    };

    formData.append("data", JSON.stringify(payload));

    updateAdMutation.mutate(
      { adId: ad._id, formData },
      {
        onSuccess: () => {
          toast.success("Ad updated successfully!");
          onBack();
        },
      }
    );
  };

  const handleDelete = () => {
    if (window.confirm(`Permanently purge ad "${ad.name || ad.content?.headline}" and all analytics?`)) {
      deleteAdMutation.mutate(ad._id, {
        onSuccess: () => {
          toast.error("Ad purged");
          onBack();
        },
      });
    }
  };

  const isVideoFormat = ["video"].includes(ad.content?.creativeFormat);

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      <div className="h-16 border-b px-8 flex items-center justify-between bg-white sticky top-0 z-20">
        <button onClick={onBack} className="flex items-center text-gray-600 font-semibold hover:text-gray-900">
          <ArrowLeft size={18} className="mr-2" /> Back to Campaign
        </button>

        <div className="flex items-center gap-3">
          <button onClick={handleDelete} className="flex items-center px-4 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-xs border border-red-200">
            <Trash2 size={14} className="mr-1.5" /> Permanent Delete Ad
          </button>

          <button onClick={handleSave} disabled={updateAdMutation.isPending} className="flex items-center px-6 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-md">
            <Save size={14} className="mr-1.5" /> Save Changes
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 max-w-5xl mx-auto w-full">
        {/* ANALYTICS STATS CARDS */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border shadow-sm">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Total Impressions</span>
            <div className="text-3xl font-black text-gray-900 mt-1 flex items-center gap-2">
              <Eye size={22} className="text-purple-600" /> {stats.impressions || 0}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border shadow-sm">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Total Clicks</span>
            <div className="text-3xl font-black text-gray-900 mt-1 flex items-center gap-2">
              <MousePointer size={22} className="text-blue-600" /> {stats.clicks || 0}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border shadow-sm">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Click-Through Rate (CTR)</span>
            <div className="text-3xl font-black text-purple-600 mt-1">{stats.ctr || "0.0"}%</div>
          </div>
        </div>

        {/* EDIT FORM */}
        <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Edit Ad Details</h1>
              <p className="text-xs text-purple-600 font-bold uppercase mt-1">Placement: {ad.placement} • Format: {ad.content?.creativeFormat}</p>
            </div>
          </div>

          <RequiredNotice />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT COLUMN: Media Preview & Upload */}
            <div className="space-y-6">
              <div className="bg-gray-100 rounded-2xl p-4 border flex flex-col items-center justify-center relative overflow-hidden min-h-[300px]">
                {/* Current Media Preview */}
                {isVideoFormat ? (
                  <div className="w-full h-full flex flex-col items-center">
                    <span className="text-xs font-bold text-gray-500 mb-2 uppercase block w-full text-left">Current Video</span>
                    {videoFile ? (
                      <p className="font-bold text-green-600">New video selected for upload.</p>
                    ) : ad.content?.videos?.[0] ? (
                      <video src={getImageUrl(ad.content.videos[0])} controls className="w-full h-48 object-cover rounded-xl bg-black" />
                    ) : (
                      <div className="flex items-center justify-center h-48 bg-gray-200 w-full rounded-xl"><Video size={40} className="text-gray-400" /></div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center">
                    <span className="text-xs font-bold text-gray-500 mb-2 uppercase block w-full text-left">Current Image</span>
                    {imageFile ? (
                      <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                    ) : ad.content?.photos?.[0] ? (
                      <img src={getImageUrl(ad.content.photos[0])} alt="Current Ad" className="w-full h-48 object-cover rounded-xl" />
                    ) : (
                      <div className="flex items-center justify-center h-48 bg-gray-200 w-full rounded-xl"><ImageIcon size={40} className="text-gray-400" /></div>
                    )}
                  </div>
                )}
              </div>

              {/* Upload New Media */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                  Upload New {isVideoFormat ? "Video" : "Image"} (Optional)
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud size={24} className="text-gray-400 mb-2" />
                      <p className="text-xs font-bold text-gray-600">Click to upload new media</p>
                    </div>
                    <input type="file" className="hidden" 
                      accept={isVideoFormat ? "video/*" : "image/*"} 
                      onChange={(e) => {
                        if (isVideoFormat) {
                          const f = e.target.files[0];
                          if (f) {
                            const v = validateMediaType(f, "video");
                            if (v !== true) return toast.error(v);
                            setVideoFile(f);
                          }
                        } else {
                          const f = e.target.files[0];
                          if (f) {
                            const v = validateMediaType(f, "image");
                            if (v !== true) return toast.error(v);
                            setImageFile(f);
                          }
                        }
                      }} 
                    />
                  </label>
                </div>
                {(imageFile || videoFile) && (
                  <button onClick={() => { setImageFile(null); setVideoFile(null); }} className="mt-2 text-xs font-bold text-red-500 flex items-center">
                    <X size={12} className="mr-1" /> Clear selected file
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Form Fields */}
            <div className="space-y-4">
              <FormField label="Status" required>
                <select name="status" value={adForm.status} onChange={handleChange} className="w-full p-2.5 rounded-xl text-sm capitalize font-bold">
                  {STATUS_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </FormField>

              <FormField label="Headline" required error={fieldErrors.headline?.error} touched={touched.headline} valid={touched.headline && !fieldErrors.headline}>
                <input name="headline" value={adForm.headline} onChange={handleChange} onBlur={handleBlur} className="w-full p-2.5 rounded-xl text-sm" placeholder="Ad Headline" />
              </FormField>

              <FormField label="Body Copy" optional>
                <textarea name="bodyText" value={adForm.bodyText} onChange={handleChange} onBlur={handleBlur} className="w-full p-2.5 rounded-xl text-sm h-20" placeholder="Ad description text..." />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="CTA Text" optional>
                  <input name="ctaText" value={adForm.ctaText} onChange={handleChange} className="w-full p-2.5 rounded-xl text-sm" placeholder="e.g. Learn More" />
                </FormField>
                
                <FormField label="Target Link URL" optional error={fieldErrors.linkUrl?.error} touched={touched.linkUrl} valid={touched.linkUrl && !fieldErrors.linkUrl}>
                  <input name="linkUrl" value={adForm.linkUrl} onChange={handleChange} onBlur={handleBlur} className="w-full p-2.5 rounded-xl text-sm" placeholder="https://..." />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Start Date" required error={fieldErrors.startDate?.error} touched={touched.startDate} valid={touched.startDate && !fieldErrors.startDate}>
                  <input type="date" name="startDate" value={adForm.startDate} onChange={handleChange} onBlur={handleBlur} className="w-full p-2.5 rounded-xl text-sm font-bold" />
                </FormField>
                
                <FormField label="End Date" optional error={fieldErrors.endDate?.error} touched={touched.endDate} valid={touched.endDate && !fieldErrors.endDate}>
                  <input type="date" name="endDate" value={adForm.endDate} onChange={handleChange} onBlur={handleBlur} className="w-full p-2.5 rounded-xl text-sm font-bold" />
                </FormField>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField label="Priority" optional error={fieldErrors.priority?.error} touched={touched.priority}>
                  <input type="number" name="priority" value={adForm.priority} onChange={handleChange} onBlur={handleBlur} className="w-full p-2.5 rounded-xl text-sm" min="1" />
                </FormField>
                
                <FormField label="Price Paid" optional error={fieldErrors.pricePaid?.error} touched={touched.pricePaid}>
                  <input type="number" name="pricePaid" value={adForm.pricePaid} onChange={handleChange} onBlur={handleBlur} className="w-full p-2.5 rounded-xl text-sm" />
                </FormField>

                <FormField label="Max Impressions" optional error={fieldErrors.maxImpressions?.error} touched={touched.maxImpressions}>
                  <input type="number" name="maxImpressions" value={adForm.maxImpressions} onChange={handleChange} onBlur={handleBlur} className="w-full p-2.5 rounded-xl text-sm" />
                </FormField>

                <FormField label="Freq Cap / User" optional error={fieldErrors.frequencyCap?.error} touched={touched.frequencyCap}>
                  <input type="number" name="frequencyCap" value={adForm.frequencyCap} onChange={handleChange} onBlur={handleBlur} className="w-full p-2.5 rounded-xl text-sm" />
                </FormField>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdDetails;