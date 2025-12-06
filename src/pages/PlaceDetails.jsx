import React, { useState, useRef, useEffect, useContext } from "react";
import {
  MapPin, Star, Heart, DollarSign, Play, Pause,
  Volume2, VolumeX, Save, Edit2, Share2, ArrowLeft
} from "lucide-react";

// import { PlaceContext } from "../contextApi/places.jsx";
import { PlaceContext } from "../contextApi/places.jsx";

const PlaceDetails = () => {

  const { clickedPlace, setClickedPlaceHandler } = useContext(PlaceContext);

  // -------------------------------
  // SAFETY: If no place selected → return nothing
  // -------------------------------
  if (!clickedPlace) return null;

  // A copy of clickedPlace to allow editing
  const [data, setData] = useState(clickedPlace);
  const [isEditing, setIsEditing] = useState(false);

  // Update values
  const handleChange = (e) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAmenityChange = (i, value) => {
    const updated = [...data.amenities];
    updated[i] = value;
    setData((prev) => ({ ...prev, amenities: updated }));
  };

  const toggleEdit = () => {
    setIsEditing((p) => !p);
  };

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

        {/* SCROLL AREA */}
        <div className="flex-1 overflow-y-auto p-8">

          {/* TITLE + LOCATION */}
          {isEditing ? (
            <div className="space-y-4">
              <input
                name="title"
                value={data.title}
                onChange={handleChange}
                className="w-full text-4xl font-extrabold border-b"
              />

              <div className="flex items-center space-x-2">
                <MapPin size={20} className="text-blue-500" />
                <input
                  name="location"
                  value={data.location}
                  onChange={handleChange}
                  className="w-full border-b"
                />
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-4xl font-extrabold">{data.title}</h1>
              {/* <div className="flex items-center text-gray-500 mt-1">
                <MapPin size={20} className="mr-2 text-blue-600" />
                {data.location}
              </div> */}
            </div>
          )}

          {/* STAT CARDS */}
          <div className="grid grid-cols-3 gap-6 mt-10">
            <StatCard
              label="Price"
              icon={DollarSign}
              name="price"
              value={data.price}
              color="text-green-500"
              isEditing={isEditing}
              onChange={handleChange}
            />
            <StatCard
              label="Rating"
              icon={Star}
              name="rating"
              value={data.rating}
              color="text-yellow-400"
              isEditing={isEditing}
              onChange={handleChange}
            />
            <StatCard
              label="Likes"
              icon={Heart}
              name="likes"
              value={data.likes}
              color="text-red-500"
              isEditing={isEditing}
              onChange={handleChange}
            />
          </div>

          {/* VIDEO URL FIELD */}
          {isEditing && (
            <div className="mt-8 bg-gray-50 p-4 rounded-xl">
              <label className="text-xs text-gray-500 font-bold">
                Video URL
              </label>
              <input
                name="videoUrl"
                value={data.videoUrl}
                onChange={handleChange}
                className="w-full mt-2 p-2 border rounded"
              />
            </div>
          )}

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

          {/* HOST */}
          <div className="flex items-center bg-white border p-4 rounded-xl mt-10">
            <img
              src={data.hostImage}
              className="w-12 h-12 rounded-full mr-4"
            />
            <div>
              <p className="text-sm text-gray-500">Host</p>
              {isEditing ? (
                <input
                  name="hostName"
                  value={data.hostName}
                  onChange={handleChange}
                  className="border-b"
                />
              ) : (
                <p className="font-bold">{data.hostName}</p>
              )}
            </div>

            <button className="ml-auto px-4 py-2 bg-black text-white rounded-lg">
              Contact Host
            </button>
          </div>

          {/* AMENITIES */}
          <div className="mt-10">
            <h3 className="text-xl font-bold mb-3">Amenities</h3>

            <div className="grid grid-cols-2 gap-4">
              {data.amenities?.map((a, i) => (
                <div key={i} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  {isEditing ? (
                    <input
                      value={a}
                      onChange={(e) => handleAmenityChange(i, e.target.value)}
                      className="border-b w-full"
                    />
                  ) : (
                    <span>{a}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* RIGHT SECTION — VIDEO */}
      <div className="w-[30%] bg-black">
        <VideoPlayer
          src={data.videos[0].url}
          title={data.title}
          location={data.location}
          likes={data.likes}
          price={data.price}
        />
      </div>

    </div>
  );
};


// ------------------------------------------
// STAT CARD COMPONENT
// ------------------------------------------
const StatCard = ({ icon: Icon, label, value, name, color, isEditing, onChange }) => (
  <div className="bg-white p-4 rounded-2xl border shadow-sm text-center">
    <div className={`p-3 rounded-full bg-gray-50 mb-2 ${color}`}>
      <Icon size={22} />
    </div>

    <p className="text-xs text-gray-500">{label}</p>

    {isEditing ? (
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="mt-2 w-full text-center border-b font-bold"
      />
    ) : (
      <p className="text-xl font-bold mt-2">{value}</p>
    )}
  </div>
);


// ------------------------------------------
// VIDEO PLAYER
// ------------------------------------------
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

      {/* Overlay Info */}
      <div className="absolute bottom-0 p-6 text-white bg-gradient-to-t from-black/80 via-black/30 to-transparent">
        <h2 className="text-2xl font-bold">{title}</h2>
        {/* <p className="text-sm text-gray-200">{location}</p> */}

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
