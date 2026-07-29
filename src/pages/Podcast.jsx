import React, { useState } from "react";
import { Mic, Plus, X, UploadCloud, Film, Image as ImageIcon, Trash2, Play, Youtube, Link } from "lucide-react";
import { usePodcastsQuery } from "../queries/podcastQueries.js";
import { useAddPodcastMutation, useDeletePodcastMutation } from "../mutations/podcastMutation.js";
import { useAddYoutubeVideoMutation, useDeleteYoutubeVideoMutation } from "../mutations/youtubeVideoMutation.js";
import toast from "react-hot-toast";
import { Req, RequiredNotice } from "../components/RequiredTag.jsx";
import FormField from "../components/FormField.jsx";
import { validators, runValidators, validateMediaType } from "../utils/validators.js";

const Podcast = () => {
  const { data, isLoading } = usePodcastsQuery();
  const addMutation = useAddPodcastMutation();
  const deleteMutation = useDeletePodcastMutation();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "" });
  const [videoFile, setVideoFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const addYtMutation = useAddYoutubeVideoMutation();
  const deleteYtMutation = useDeleteYoutubeVideoMutation();
  const [showYtModal, setShowYtModal] = useState(false);
  const [activePodcastId, setActivePodcastId] = useState(null);
  const [ytForm, setYtForm] = useState({ title: "", youtubeVideoLink: "" });

  const RULES = {
    title: [validators.required],
    youtubeVideoLink: [validators.required, validators.youtubeUrl],
  };

  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [ytTouched, setYtTouched] = useState({});
  const [ytFieldErrors, setYtFieldErrors] = useState({});

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

  const handleYtChange = (e) => {
    const { name, value } = e.target;
    setYtForm((prev) => ({ ...prev, [name]: value }));
    if (ytTouched[name]) {
      setYtFieldErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
    }
  };

  const handleYtBlur = (e) => {
    const { name, value } = e.target;
    setYtTouched((prev) => ({ ...prev, [name]: true }));
    setYtFieldErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleYtSubmit = () => {
    const requiredFields = ["title", "youtubeVideoLink"];
    const newTouched = {};
    const newErrors = {};
    let hasError = false;

    requiredFields.forEach((field) => {
      newTouched[field] = true;
      const error = validate(field, ytForm[field] || "");
      newErrors[field] = error;
      if (error) hasError = true;
    });

    setYtTouched(newTouched);
    setYtFieldErrors(newErrors);

    if (hasError) {
      return toast.error("Please fix the highlighted errors before submitting.");
    }

    addYtMutation.mutate({ podcastId: activePodcastId, ...ytForm }, {
      onSuccess: () => {
        toast.success("YouTube link attached!");
        setShowYtModal(false);
        setYtForm({ title: "", youtubeVideoLink: "" });
        setYtTouched({});
        setYtFieldErrors({});
      },
      onError: (err) => toast.error(err?.response?.data?.message || "Failed to attach link"),
    });
  };

  const handleSubmit = () => {
    setTouched({ title: true });
    const titleError = validate("title", form.title || "");
    setFieldErrors({ title: titleError });

    if (titleError || !videoFile) {
      if (!videoFile) toast.error("Podcast Video is required!");
      if (titleError) toast.error("Please fix the highlighted errors before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("data", JSON.stringify({ title: form.title }));
    formData.append("PodcastVideo", videoFile);
    if (imageFile) {
      formData.append("PodcastImage", imageFile);
    }

    addMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Podcast successfully uploaded!");
        setShowModal(false);
        setForm({ title: "" });
        setVideoFile(null);
        setImageFile(null);
        setTouched({});
        setFieldErrors({});
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || "Failed to upload podcast");
      },
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this podcast?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success("Podcast deleted!"),
        onError: () => toast.error("Failed to delete"),
      });
    }
  };

  const podcasts = data?.data || data?.podcasts || [];

  if (isLoading) return <div className="p-8 font-bold text-center">Loading Podcasts...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-5 rounded-2xl border shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Podcasts</h1>
            <p className="text-xs text-gray-500">Manage audio/video podcast episodes and thumbnails</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-indigo-700 shadow-md"
          >
            <Plus size={16} /> New Episode
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {podcasts.map((podcast) => (
            <div key={podcast._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
              <div className="relative h-48 bg-gray-900 flex items-center justify-center">
                {podcast.PodcastImage?.url ? (
                  <img src={podcast.PodcastImage.url} alt="thumbnail" className="w-full h-full object-cover opacity-60" />
                ) : (
                  <Mic size={40} className="text-indigo-400 opacity-50" />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/40">
                    <Play size={20} className="ml-1" />
                  </div>
                </div>
              </div>
              <div className="p-5 flex-grow">
                <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{podcast.title}</h3>
                <p className="text-xs font-mono text-gray-500 mt-2">
                  Uploaded: {new Date(podcast.createdAt).toLocaleDateString()}
                </p>

                {podcast.youtubeVideos && podcast.youtubeVideos.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Linked YouTube Videos</h4>
                    {podcast.youtubeVideos.map(yt => (
                      <div key={yt._id} className="flex items-center justify-between bg-gray-50 border rounded-lg p-2.5 shadow-sm">
                        <a href={yt.YoutubeVideoLink} target="_blank" rel="noreferrer" className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1.5 line-clamp-1 flex-grow pr-2">
                          <Youtube size={14} className="flex-shrink-0" /> {yt.title}
                        </a>
                        <button onClick={() => {
                          if(window.confirm("Delete YouTube Link?")) deleteYtMutation.mutate(yt._id);
                        }} className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="border-t p-3 flex justify-between bg-gray-50 items-center">
                <button
                  onClick={() => { setActivePodcastId(podcast._id); setShowYtModal(true); }}
                  className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 text-xs font-black px-3 py-2 rounded-lg hover:bg-indigo-100/50 transition-colors"
                >
                  <Link size={14} /> Attach YT
                </button>
                <button
                  onClick={() => handleDelete(podcast._id)}
                  disabled={deleteMutation.isPending}
                  className="text-red-500 hover:text-red-700 flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
          {podcasts.length === 0 && (
            <div className="col-span-full py-16 text-center text-gray-500 bg-white border border-dashed rounded-2xl">
              <Mic size={40} className="mx-auto mb-4 opacity-50" />
              <p className="font-bold">No podcast episodes found.</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-bold">Upload Podcast</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <RequiredNotice />

            <FormField label="Podcast Title" required error={fieldErrors.title?.error} hint={fieldErrors.title?.hint || "Podcast Title"} touched={touched.title} valid={touched.title && !fieldErrors.title}>
              <input name="title" placeholder="Podcast Title" value={form.title} onChange={handleChange} onBlur={handleBlur} className="w-full border p-2.5 rounded-xl text-sm font-bold focus:border-indigo-500 outline-none" />
            </FormField>

            <div className="border border-dashed p-4 rounded-xl text-center bg-gray-50">
              <input type="file" accept="image/*" id="pThumbnail" onChange={(e) => {
                const f = e.target.files[0];
                if (f) {
                  const v = validateMediaType(f, 'image');
                  if (v !== true) return toast.error(v);
                  setImageFile(f);
                }
              }} className="hidden" />
              <label htmlFor="pThumbnail" className="cursor-pointer text-xs font-bold text-indigo-600 flex flex-col items-center justify-center gap-2">
                <ImageIcon size={20} /> {imageFile ? `thumbnail: ${imageFile.name}` : "Upload Cover Image (Optional)"}
              </label>
            </div>

            <div className="border border-dashed p-4 rounded-xl text-center bg-indigo-50">
              <input type="file" accept="video/*, audio/*" id="pVideo" onChange={(e) => {
                const f = e.target.files[0];
                if (f) {
                  const v = validateMediaType(f, 'video');
                  if (v !== true) return toast.error(v);
                  setVideoFile(f);
                }
              }} className="hidden" />
              <label htmlFor="pVideo" className="cursor-pointer text-xs font-bold text-indigo-700 flex flex-col items-center justify-center gap-2">
                <Film size={20} /> {videoFile ? `Media: ${videoFile.name}` : <span>Upload Podcast Video / Audio <Req /></span>}
              </label>
            </div>

            <button
              onClick={handleSubmit}
              disabled={addMutation.isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold shadow-md transition-colors"
            >
              {addMutation.isPending ? "Uploading Media..." : "Publish Episode"}
            </button>
          </div>
        </div>
      )}

      {showYtModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2"><Youtube className="text-red-600" /> Link YouTube</h2>
              <button onClick={() => setShowYtModal(false)} className="text-gray-400 hover:text-red-500">
                <X size={20} />
              </button>
            </div>

            <RequiredNotice />

            <div className="space-y-4">
              <FormField label="Video Title" required error={ytFieldErrors.title?.error} hint={ytFieldErrors.title?.hint || "e.g. Full Interview Uncut"} touched={ytTouched.title} valid={ytTouched.title && !ytFieldErrors.title}>
                <input name="title" placeholder="e.g. Full Interview Uncut" value={ytForm.title} onChange={handleYtChange} onBlur={handleYtBlur} className="w-full border p-3 rounded-xl text-sm font-semibold outline-none focus:border-red-500 bg-gray-50" />
              </FormField>
              <FormField label="YouTube URL" required error={ytFieldErrors.youtubeVideoLink?.error} hint={ytFieldErrors.youtubeVideoLink?.hint || "https://youtube.com/watch?v=..."} touched={ytTouched.youtubeVideoLink} valid={ytTouched.youtubeVideoLink && !ytFieldErrors.youtubeVideoLink}>
                <input name="youtubeVideoLink" placeholder="https://youtube.com/watch?v=..." value={ytForm.youtubeVideoLink} onChange={handleYtChange} onBlur={handleYtBlur} className="w-full border p-3 rounded-xl text-sm font-medium outline-none focus:border-red-500 bg-gray-50" />
              </FormField>
              <button
                onClick={handleYtSubmit}
                disabled={addYtMutation.isPending}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold shadow-md transition-colors flex justify-center items-center gap-2 mt-2"
              >
                {addYtMutation.isPending ? "Linking..." : <><Link size={16} /> Attach Video</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Podcast;
