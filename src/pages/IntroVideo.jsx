import React, { useState } from "react";
import { Film, Plus, X, UploadCloud, Trash2, CheckCircle2, AlertTriangle, RotateCcw, Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";
import { Req, RequiredNotice } from "../components/RequiredTag.jsx";
import FormField from "../components/FormField.jsx";
import { validators, runValidators, validateMediaType } from "../utils/validators.js";

const IntroVideo = () => {
  const queryClient = useQueryClient();
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["introVideos", includeDeleted],
    queryFn: async () => {
      const res = await axiosClient.get("/admin/intro-video", { params: { includeDeleted } });
      return res.data;
    },
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  const RULES = {
    title: [validators.required],
  };

  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = (name, value) => {
    const rules = RULES[name];
    if (!rules) return null;
    return runValidators(value, rules, name);
  };

  const handleBlur = (name, value) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFieldErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleChangeTitle = (e) => {
    setTitle(e.target.value);
    if (touched.title) {
      setFieldErrors((prev) => ({ ...prev, title: validate("title", e.target.value) }));
    }
  };

  const createMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await axiosClient.post("/admin/intro-video", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["introVideos"] });
      toast.success("Intro video uploaded!");
      setShowModal(false);
      setTitle("");
      setDescription("");
      setVideoFile(null);
      setThumbnailFile(null);
      setTouched({});
      setFieldErrors({});
    },
    onError: () => toast.error("Failed to upload intro video"),
  });

  const handleSoftDelete = async (id) => {
    try {
      await axiosClient.patch(`/admin/intro-video/${id}/soft-delete`);
      queryClient.invalidateQueries({ queryKey: ["introVideos"] });
      toast.success("Intro video soft-deleted");
    } catch (_err) {
      toast.error("Soft delete failed");
    }
  };

  const handleRestore = async (id) => {
    try {
      await axiosClient.patch(`/admin/intro-video/${id}/restore`);
      queryClient.invalidateQueries({ queryKey: ["introVideos"] });
      toast.success("Intro video restored");
    } catch (_err) {
      toast.error("Restore failed");
    }
  };

  const handleHardDelete = async (id) => {
    if (window.confirm("Permanently erase video file and database record?")) {
      try {
        await axiosClient.delete(`/admin/intro-video/${id}/hard-delete`);
        queryClient.invalidateQueries({ queryKey: ["introVideos"] });
        toast.error("Intro video permanently purged");
      } catch (_err) {
        toast.error("Hard delete failed");
      }
    }
  };

  const handleSubmit = () => {
    setTouched({ title: true });
    const titleError = validate("title", title);
    setFieldErrors({ title: titleError });

    if (titleError || !videoFile) {
      if (!videoFile) toast.error("Video file is required");
      if (titleError) toast.error("Please fix the highlighted errors before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("isActive", isActive);
    formData.append("video", videoFile);
    if (thumbnailFile) formData.append("thumbnail", thumbnailFile);

    createMutation.mutate(formData);
  };

  const videos = data?.data || data?.videos || [];

  if (isLoading) return <div className="p-8 font-bold text-center">Loading Intro Videos...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-5 rounded-2xl border shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Intro & Splash Videos</h1>
            <p className="text-xs text-gray-500">Manage app welcome screens and promotional video reels</p>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700 bg-gray-100 px-3 py-2 rounded-xl">
              <input
                type="checkbox"
                checked={includeDeleted}
                onChange={(e) => setIncludeDeleted(e.target.checked)}
                className="rounded text-blue-600"
              />
              Show Soft-Deleted Videos
            </label>

            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-blue-700 shadow-md"
            >
              <Plus size={16} /> Upload New Intro Video
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((vid) => (
            <div
              key={vid._id}
              className={`bg-white rounded-2xl border shadow-lg overflow-hidden flex flex-col ${
                vid.isDeleted ? "opacity-60 border-red-300 bg-red-50/20" : "border-gray-100"
              }`}
            >
              <div className="relative aspect-video bg-black flex items-center justify-center">
                {vid.video?.url ? (
                  <video src={vid.video.url} controls className="w-full h-full object-cover" />
                ) : (
                  <Film size={40} className="text-gray-600" />
                )}

                <div className="absolute top-3 left-3 z-20 flex gap-2">
                  {vid.isActive && (
                    <span className="bg-green-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1 shadow">
                      <CheckCircle2 size={10} /> Currently Active
                    </span>
                  )}
                  {vid.isDeleted && (
                    <span className="bg-red-600 text-white text-[10px] font-extrabold px-2 py-1 rounded-md uppercase tracking-wider shadow">
                      Soft Deleted
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-extrabold text-lg text-gray-900">{vid.title}</h3>
                <p className="text-gray-600 text-xs mt-1 leading-relaxed flex-grow">{vid.description || "No description provided."}</p>

                <div className="pt-4 mt-4 border-t flex items-center justify-between">
                  {vid.isDeleted ? (
                    <button onClick={() => handleRestore(vid._id)} className="text-xs font-bold text-green-600 flex items-center gap-1 hover:underline">
                      <RotateCcw size={14} /> Restore
                    </button>
                  ) : (
                    <button onClick={() => handleSoftDelete(vid._id)} className="text-xs font-bold text-yellow-600 flex items-center gap-1 hover:underline">
                      <Trash2 size={14} /> Soft Delete
                    </button>
                  )}

                  <button onClick={() => handleHardDelete(vid._id)} className="text-xs font-bold text-red-600 flex items-center gap-1 hover:underline">
                    <AlertTriangle size={14} /> Hard Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-bold">Upload Intro / Splash Video</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            <RequiredNotice />

            <FormField label="Title" required error={fieldErrors.title?.error} hint={fieldErrors.title?.hint || "Title"} touched={touched.title} valid={touched.title && !fieldErrors.title}>
              <input name="title" placeholder="Title" value={title} onChange={handleChangeTitle} onBlur={(e) => handleBlur("title", e.target.value)} className="w-full border p-2.5 rounded-xl text-sm" />
            </FormField>
            <FormField label="Description" optional hint="Description...">
              <textarea placeholder="Description..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full border p-2.5 rounded-xl text-sm resize-none" />
            </FormField>

            <label className="flex items-center gap-2 text-xs font-bold text-gray-700">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded text-blue-600" />
              Set as Currently Active Intro Video
            </label>

            <div className="border border-dashed p-4 rounded-xl text-center bg-gray-50">
              <input type="file" accept="video/*" id="introVidFile" onChange={(e) => {
                const f = e.target.files[0];
                if (f) {
                  const v = validateMediaType(f, "video");
                  if (v !== true) return toast.error(v);
                  setVideoFile(f);
                }
              }} className="hidden" />
              <label htmlFor="introVidFile" className="cursor-pointer text-xs font-bold text-blue-600 flex items-center justify-center gap-2">
                <UploadCloud size={20} /> {videoFile ? videoFile.name : <span>Select Video File (MP4, MOV) <Req /></span>}
              </label>
            </div>

            <button onClick={handleSubmit} disabled={createMutation.isPending} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-md">
              {createMutation.isPending ? "Uploading Media..." : "Publish Intro Video"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntroVideo;