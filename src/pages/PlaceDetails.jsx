import React, { useState, useRef, useEffect, useContext } from "react";
import {
  MapPin, Heart, Play, Volume2, VolumeX,
  Save, Edit2, ArrowLeft, Share2, Trash, UploadCloud, Trash2
} from "lucide-react";

import { PlaceContext } from "../contextApi/places.jsx";
// import { useDeletePlaceMutation } from "../queries/places.mutations.js"; // <-- IMPORTANT
import { useDeletePlaceMutation } from "../mutations/placeMutation.js";

const PlaceDetails = () => {
  const { clickedPlace, setClickedPlaceHandler } = useContext(PlaceContext);

  if (!clickedPlace) return null;

  const [data, setData] = useState(clickedPlace);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // React Query delete mutation
  const deletePlaceMutation = useDeletePlaceMutation();

  // -------- VIDEO STATES --------
  const [ytLink, setYtLink] = useState(clickedPlace.ytVideoLink || "");
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(
    clickedPlace.videos?.[0]?.url || null
  );

  // -------- PHOTO UPLOAD STATES --------
  const [photoFiles, setPhotoFiles] = useState([]);

  const handleChange = (e) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLocationChange = (e) => {
    setData(prev => ({
      ...prev,
      location: { ...prev.location, address: e.target.value }
    }));
  };

  // -------- VIDEO DRAG & DROP (KEPT EXACTLY AS YOU HAD) --------
  const handleVideoDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];

    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  // -------- PHOTO DRAG & DROP (UNCHANGED) --------
  const handlePhotoDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith("image/")
    );

    if (files.length) {
      setPhotoFiles(prev => [...prev, ...files]);

      const newPhotos = files.map(file => ({
        _id: Date.now() + Math.random(),
        url: URL.createObjectURL(file),
      }));

      setData(prev => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos],
      }));
    }
  };

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files).filter(file =>
      file.type.startsWith("image/")
    );

    if (files.length) {
      setPhotoFiles(prev => [...prev, ...files]);

      const newPhotos = files.map(file => ({
        _id: Date.now() + Math.random(),
        url: URL.createObjectURL(file),
      }));

      setData(prev => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos],
      }));
    }
  };

  const updatePhoto = (i, value) => {
    const updated = [...data.photos];
    updated[i] = { ...updated[i], url: value };
    setData(prev => ({ ...prev, photos: updated }));
  };

  const removePhoto = (i) => {
    const removed = data.photos[i];

    setPhotoFiles(prev =>
      prev.filter(file => URL.createObjectURL(file) !== removed.url)
    );

    const updated = data.photos.filter((_, idx) => idx !== i);
    setData(prev => ({ ...prev, photos: updated }));
  };

  const toggleEdit = () => setIsEditing(p => !p);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* LEFT SIDE */}
      <div className="w-[70%] h-full flex flex-col bg-white border-r">

        {/* HEADER */}
        <div className="h-16 border-b px-8 flex items-center justify-between">
          <button
            onClick={() => setClickedPlaceHandler(null)}
            className="flex items-center text-gray-600 hover:text-black"
          >
            <ArrowLeft size={20} className="mr-2" /> Back
          </button>

          {/* EDIT + DELETE BUTTON GROUP */}
          <div className="flex items-center gap-3">
            <button
              className="flex items-center px-4 py-2 rounded-lg bg-red-50 text-red-600 
                         hover:bg-red-100 transition-colors border border-red-200"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 size={16} className="mr-2" />
              Delete
            </button>

            <button
              onClick={toggleEdit}
              className={`flex items-center px-4 py-2 rounded-lg ${
                isEditing
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {isEditing ? (
                <>
                  <Save size={16} className="mr-2" /> Save
                </>
              ) : (
                <>
                  <Edit2 size={16} className="mr-2" /> Edit
                </>
              )}
            </button>
          </div>
        </div>

        {/* SCROLL AREA */}
        <div className="flex-1 overflow-y-auto p-8">

          {/* TITLE + LOCATION */}
          {isEditing ? (
            <div className="space-y-4">
              <input
                name="name"
                value={data.name}
                onChange={handleChange}
                className="w-full text-4xl font-extrabold border-b"
              />

              <div className="flex items-center space-x-2">
                <MapPin size={20} className="text-blue-500" />
                <input
                  value={data.location.address}
                  onChange={handleLocationChange}
                  className="w-full border-b"
                />
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-4xl font-extrabold">{data.name}</h1>
              <div className="flex items-center text-gray-500 mt-1">
                <MapPin size={20} className="mr-2 text-blue-600" />
                {data.location.address}
              </div>
            </div>
          )}

          {/* META BADGES */}
          <div className="flex gap-3 mt-6">
            {isEditing ? (
              <>
                <input
                  name="category"
                  value={data.category}
                  onChange={handleChange}
                  className="px-3 py-1 border rounded-full text-sm"
                />
                <input
                  name="city"
                  value={data.city}
                  onChange={handleChange}
                  className="px-3 py-1 border rounded-full text-sm"
                />
              </>
            ) : (
              <>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                  {data.category}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {data.city}
                </span>
              </>
            )}
          </div>

          {/* LIKES */}
          <div className="mt-8 bg-white p-4 rounded-2xl border shadow-sm w-40 text-center">
            <div className="p-3 rounded-full bg-red-50 mb-2 inline-block">
              <Heart size={22} className="text-red-500" />
            </div>
            <p className="text-xs text-gray-500">Likes</p>

            {isEditing ? (
              <input
                name="likes"
                value={data.likes}
                onChange={handleChange}
                className="mt-2 w-full text-center border-b font-bold"
              />
            ) : (
              <p className="text-xl font-bold mt-2">{data.likes}</p>
            )}
          </div>

          {/* YOUTUBE LINK */}
          <div className="mt-8 bg-gray-50 p-4 rounded-xl">
            <label className="text-xs text-gray-500 font-bold">
              YouTube Video Link
            </label>

            {isEditing ? (
              <input
                value={ytLink}
                onChange={(e) => setYtLink(e.target.value)}
                placeholder="https://youtube.com/..."
                className="w-full mt-2 p-2 border rounded"
              />
            ) : (
              <p className="mt-2 text-sm text-gray-700">{ytLink}</p>
            )}
          </div>

          {/* DESCRIPTION */}
          <div className="mt-10">
            <h3 className="text-xl font-bold">About</h3>
            {isEditing ? (
              <textarea
                name="description"
                value={data.description}
                onChange={handleChange}
                rows={6}
                className="w-full mt-2 p-3 border rounded-xl bg-gray-50"
              />
            ) : (
              <p className="text-gray-600 leading-relaxed mt-2">
                {data.description}
              </p>
            )}
          </div>

          {/* PHOTO GALLERY (UNCHANGED) */}
          <div className="mt-10">
            <h3 className="text-xl font-bold mb-3">Photos</h3>

            {isEditing && (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handlePhotoDrop}
                className="mb-4 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer"
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  id="photoInput"
                  onChange={handlePhotoSelect}
                />

                <label htmlFor="photoInput" className="cursor-pointer">
                  <UploadCloud size={32} className="mx-auto text-blue-500 mb-2" />
                  <p className="text-gray-600">
                    Drag & drop photos here, or{" "}
                    <span className="text-blue-600 underline">click to select</span>
                  </p>
                </label>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              {data.photos.map((p, i) => (
                <div key={p._id} className="relative">
                  {isEditing && (
                    <input
                      value={p.url}
                      onChange={(e) => updatePhoto(i, e.target.value)}
                      className="w-full border p-1 text-xs mb-1"
                      placeholder="Paste image URL"
                    />
                  )}

                  <img
                    src={p.url || "https://via.placeholder.com/400x300"}
                    alt={`photo-${i}`}
                    className="w-full h-40 object-cover rounded-xl"
                  />

                  {isEditing && (
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                    >
                      <Trash size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CLOUDINARY VIDEO (YOUR ORIGINAL SECTION — KEPT) */}
          <div className="mt-10 bg-gray-50 p-4 rounded-xl">
            <label className="text-xs text-gray-500 font-bold">
              Upload Video (Cloudinary)
            </label>

            {isEditing && (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleVideoDrop}
                className="mt-3 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer"
              >
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  id="videoInput"
                  onChange={handleVideoSelect}
                />

                <label htmlFor="videoInput" className="cursor-pointer">
                  <UploadCloud size={32} className="mx-auto text-blue-500 mb-2" />
                  <p className="text-gray-600">
                    Drag & drop a video here, or{" "}
                    <span className="text-blue-600 underline">click to select</span>
                  </p>
                </label>
              </div>
            )}

            {videoPreview && (
              <div className="mt-4">
                <video
                  src={videoPreview}
                  controls
                  className="w-full h-60 object-cover rounded-xl"
                />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* RIGHT VIDEO PREVIEW */}
      <div className="w-[30%] bg-black">
        <VideoPlayer
          src={videoPreview || data.videos[0].url}
          title={data.name}
          location={data.location.address}
          likes={data.likes}
        />
      </div>

      {/* DELETE MODAL (ADDED — DOES NOT REMOVE ANYTHING ELSE) */}
      {showDeleteModal && (
        <DeleteModal
          placeName={data.name}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={async () => {
            try {
              console.log("data id for deletion",data._id)
              await deletePlaceMutation.mutateAsync(data._id);
              setShowDeleteModal(false);
              setClickedPlaceHandler(null);
            } catch (err) {
              console.error("Delete failed:", err);
            }
          }}
        />
      )}
    </div>
  );
};

/* -------- DELETE MODAL (NEW) -------- */
const DeleteModal = ({ onClose, onConfirm, placeName }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[400px] shadow-xl">
        <h2 className="text-xl font-bold text-gray-900">Confirm Delete</h2>

        <p className="mt-3 text-gray-600">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-black">{placeName}</span>?  
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------- VIDEO PLAYER (UNCHANGED) -------- */
const VideoPlayer = ({ src, title, location, likes }) => {
  const videoRef = useRef(null);
  const [play, setPlay] = useState(true);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, [src]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setPlay(true);
    } else {
      videoRef.current.pause();
      setPlay(false);
    }
  };

  return (
    <div className="relative w-full h-full" onClick={togglePlay}>
      <video
        ref={videoRef}
        src={src}
        muted={muted}
        loop
        playsInline
        className="w-full h-full object-cover"
      />

      {!play && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Play size={40} className="text-white" />
        </div>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          setMuted((m) => !m);
        }}
        className="absolute top-4 right-4 p-2 bg-black/40 rounded-full text-white"
      >
        {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      <div className="absolute bottom-0 p-6 text-white bg-gradient-to-t from-black/80 via-black/30 to-transparent">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-sm text-gray-200">{location}</p>

        <div className="absolute right-6 bottom-20 flex flex-col items-center space-y-4">
          <div className="bg-black/40 p-3 rounded-full">
            <Heart size={26} className="text-red-500" />
          </div>
          <span className="text-sm">{likes}</span>

          <div className="bg-black/40 p-3 rounded-full">
            <Share2 size={22} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetails;
