import React, { useState, useRef, useEffect, useContext } from "react";
import {
  MapPin, Heart, Play, Volume2, VolumeX,
  Save, Edit2, ArrowLeft, Share2, Trash, UploadCloud, Trash2
} from "lucide-react";

import { PlaceContext } from "../contextApi/places.jsx";
import { useDeletePlaceMutation, useUpdatePlaceMutation } from "../mutations/placeMutation.js";

const PlaceDetails = () => {
  const { clickedPlace, setClickedPlaceHandler } = useContext(PlaceContext);
  if (!clickedPlace) return null;

  const [data, setData] = useState(clickedPlace);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const deletePlaceMutation = useDeletePlaceMutation();
  const updatePlaceMutation = useUpdatePlaceMutation();

  // -------- VIDEO STATES --------
  const [ytLink, setYtLink] = useState(clickedPlace.ytVideoLink || "");
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(
    clickedPlace.videos?.[0]?.url || null
  );

  // -------- PHOTO STATES --------
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

  // -------- VIDEO HANDLERS --------
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

  // -------- PHOTO HANDLERS --------
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

  // -------- PARTIAL DIFF LOGIC --------
  const getChangedFields = () => {
    const changes = {};

    if (data.name !== clickedPlace.name) changes.name = data.name;
    if (data.description !== clickedPlace.description)
      changes.description = data.description;
    if (data.category !== clickedPlace.category)
      changes.category = data.category;
    if (data.city !== clickedPlace.city)
      changes.city = data.city;
    if (Number(data.likes) !== Number(clickedPlace.likes))
      changes.likes = Number(data.likes);

    if (ytLink !== clickedPlace.ytVideoLink)
      changes.ytVideoLink = ytLink;

    if (data.location?.address !== clickedPlace.location?.address) {
      changes.location = {
        ...clickedPlace.location,
        address: data.location.address,
      };
    }

    const currentPhotoUrls = data.photos.map(p => p.url).sort();
    const originalPhotoUrls = (clickedPlace.photos || [])
      .map(p => p.url)
      .sort();

    if (JSON.stringify(currentPhotoUrls) !== JSON.stringify(originalPhotoUrls)) {
      changes.photos = data.photos.map(p => ({ url: p.url }));
    }

    return changes;
  };

  // -------- SAVE (ONLY CHANGED FIELDS) --------
  const handleSave = async () => {
    try {
      const changes = getChangedFields();

      if (
        Object.keys(changes).length === 0 &&
        !videoFile &&
        photoFiles.length === 0
      ) {
        setIsEditing(false);
        return;
      }

      const formData = new FormData();
      formData.append("data", JSON.stringify(changes));

      photoFiles.forEach(file => {
        formData.append("placePhoto", file);
      });

      if (videoFile) {
        formData.append("placeVideo", videoFile);
      }

      await updatePlaceMutation.mutateAsync({
        id: data._id,
        formData,
      });

      setIsEditing(false);
      console.log("Updated only changed fields:", changes);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const toggleEdit = () => {
    if (isEditing) handleSave();
    else setIsEditing(true);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="w-[70%] h-full flex flex-col bg-white border-r">
        {/* HEADER */}
        <div className="h-16 border-b px-8 flex items-center justify-between">
          <button
            onClick={() => setClickedPlaceHandler(null)}
            className="flex items-center text-gray-600 hover:text-black"
          >
            <ArrowLeft size={20} className="mr-2" /> Back
          </button>

          <div className="flex items-center gap-3">
            <button
              className="flex items-center px-4 py-2 rounded-lg bg-red-50 text-red-600 border border-red-200"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 size={16} className="mr-2" />
              Delete
            </button>

            <button
              onClick={toggleEdit}
              disabled={updatePlaceMutation.isLoading}
              className={`flex items-center px-4 py-2 rounded-lg ${
                isEditing ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              {isEditing ? (
                <>
                  <Save size={16} className="mr-2" />
                  {updatePlaceMutation.isLoading ? "Saving..." : "Save"}
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

          {/* LIKES */}
          <div className="mt-8 bg-white p-4 rounded-2xl border shadow-sm w-40 text-center">
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
            {isEditing ? (
              <input
                value={ytLink}
                onChange={(e) => setYtLink(e.target.value)}
                className="w-full mt-2 p-2 border rounded"
              />
            ) : (
              <p className="mt-2 text-sm text-gray-700">{ytLink}</p>
            )}
          </div>

          {/* DESCRIPTION */}
          <div className="mt-10">
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

          {/* PHOTO UPLOADER */}
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
                    />
                  )}

                  <img
                    src={p.url}
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

          {/* VIDEO UPLOADER */}
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
          src={videoPreview || data.videos?.[0]?.url}
          title={data.name}
          location={data.location.address}
          likes={data.likes}
        />
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <DeleteModal
          placeName={data.name}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={async () => {
            await deletePlaceMutation.mutateAsync(data._id);
            setShowDeleteModal(false);
            setClickedPlaceHandler(null);
          }}
        />
      )}
    </div>
  );
};

/* -------- DELETE MODAL -------- */
const DeleteModal = ({ onClose, onConfirm, placeName }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 w-[400px] shadow-xl">
      <h2 className="text-xl font-bold">Confirm Delete</h2>
      <p className="mt-3">
        Are you sure you want to delete <b>{placeName}</b>?
      </p>
      <div className="flex justify-end gap-3 mt-6">
        <button onClick={onClose} className="px-4 py-2 border rounded">
          Cancel
        </button>
        <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded">
          Delete
        </button>
      </div>
    </div>
  </div>
);

/* -------- VIDEO PLAYER -------- */
const VideoPlayer = ({ src, title, location, likes }) => {
  const videoRef = useRef(null);
  const [play, setPlay] = useState(true);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, [src]);

  return (
    <div className="relative w-full h-full">
      <video ref={videoRef} src={src} muted={muted} loop className="w-full h-full" />
      <button
        onClick={() => setMuted(m => !m)}
        className="absolute top-4 right-4 p-2 bg-black/40 text-white rounded-full"
      >
        {muted ? <VolumeX /> : <Volume2 />}
      </button>
    </div>
  );
};

export default PlaceDetails;
