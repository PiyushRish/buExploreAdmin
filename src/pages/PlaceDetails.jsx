import React, { useState, useRef, useEffect } from 'react';
import { 
  MapPin, Star, Heart, DollarSign, Play, Pause, 
  Volume2, VolumeX, Save, Edit2, Check, Share2, ArrowLeft
} from 'lucide-react';
import { useContext } from "react";
import { PlaceContext } from "../contextApi/places.jsx";

const PlaceDetails = () => {
  // --- STATE MANAGEMENT ---
  // All data is stored here and can be updated
  const {clickedPlace,setClickedPlaceHandler} = useContext(PlaceContext);
  console.log("Clicked Place in Details:", clickedPlace);
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState({
    title: "Bamboo Forest Retreat",
    location: "Kyoto, Japan",
    description: "Immerse yourself in the tranquility of the Arashiyama Bamboo Grove. This exclusive retreat offers a private pathway through the towering stalks, leading to a traditional Ryokan with modern amenities. Enjoy a private tea ceremony, kaiseki dining, and an open-air onsen bath overlooking the forest.",
    price: 120,
    rating: 4.9,
    likes: 1240,
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4", // Free stock video
    amenities: ["Free Wi-Fi", "Private Onsen", "Breakfast Included", "Nature Guide"],
    hostName: "Kenji Tanaka",
    hostImage: "https://randomuser.me/api/portraits/men/32.jpg"
  });

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleAmenityChange = (index, value) => {
    const newAmenities = [...data.amenities];
    newAmenities[index] = value;
    setData(prev => ({ ...prev, amenities: newAmenities }));
  };

  const toggleEdit = () => setIsEditing(!isEditing);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* --- LEFT SIDE: DETAILS (70%) --- */}
      <div className="w-[70%] h-full flex flex-col border-r border-gray-200 bg-white">
        
        {/* Header / Nav */}
        <div className="h-16 border-b border-gray-100 flex items-center justify-between px-8 bg-white sticky top-0 z-10">
          <button 
            onClick={() => setClickedPlaceHandler(null)}
            className="flex items-center text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
          </button>
          <button 
            onClick={toggleEdit}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isEditing 
              ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isEditing ? <><Save size={16} className="mr-2" /> Save Changes</> : <><Edit2 size={16} className="mr-2" /> Edit Details</>}
          </button>
        </div>

        {/* Scrollable Content Form */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Title & Location */}
            <div className="space-y-4">
              {isEditing ? (
                <div className="space-y-3 animate-in fade-in slide-in-from-left-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={data.title}
                    onChange={handleChange}
                    className="w-full text-4xl font-extrabold text-gray-900 border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none bg-transparent py-2"
                  />
                  <div className="flex items-center space-x-2">
                    <MapPin className="text-blue-500" size={20} />
                    <input
                      type="text"
                      name="location"
                      value={data.location}
                      onChange={handleChange}
                      className="w-full text-lg text-gray-600 border-b border-gray-100 focus:border-blue-500 focus:outline-none bg-transparent py-1"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <h1 className="text-4xl font-extrabold text-gray-900">{data.title}</h1>
                  <div className="flex items-center text-gray-500 text-lg">
                    <MapPin size={20} className="mr-2 text-blue-500" />
                    {data.location}
                  </div>
                </div>
              )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-6">
              <StatCard 
                icon={DollarSign} 
                label="Price / Night" 
                value={data.price} 
                name="price"
                isEditing={isEditing} 
                onChange={handleChange}
                type="number"
                color="text-green-600"
              />
              <StatCard 
                icon={Star} 
                label="Rating" 
                value={data.rating} 
                name="rating"
                isEditing={isEditing} 
                onChange={handleChange}
                type="number"
                step="0.1"
                color="text-yellow-500"
              />
              <StatCard 
                icon={Heart} 
                label="Total Likes" 
                value={data.likes} 
                name="likes"
                isEditing={isEditing} 
                onChange={handleChange}
                type="number"
                color="text-red-500"
              />
            </div>

            {/* Video Source Input (Only visible in edit) */}
            {isEditing && (
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in fade-in">
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Video Source URL (Right Panel)</label>
                <input
                  type="text"
                  name="videoUrl"
                  value={data.videoUrl}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Paste MP4 link here..."
                />
                <p className="text-xs text-gray-400 mt-2">Try pasting a different link to see the player update instantly.</p>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">About this place</h3>
              {isEditing ? (
                <textarea
                  name="description"
                  value={data.description}
                  onChange={handleChange}
                  rows={6}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 leading-relaxed focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              ) : (
                <p className="text-gray-600 leading-relaxed text-lg">
                  {data.description}
                </p>
              )}
            </div>

            {/* Host Info */}
            <div className="flex items-center p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <img src={data.hostImage} alt="Host" className="w-12 h-12 rounded-full object-cover mr-4" />
              <div>
                <p className="text-sm text-gray-500">Hosted by</p>
                {isEditing ? (
                  <input 
                    name="hostName" 
                    value={data.hostName} 
                    onChange={handleChange} 
                    className="font-bold text-gray-800 border-b border-gray-300 focus:border-blue-500 outline-none"
                  />
                ) : (
                  <p className="font-bold text-gray-800">{data.hostName}</p>
                )}
              </div>
              <button className="ml-auto px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800">Contact Host</button>
            </div>

            {/* Amenities List */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Amenities</h3>
              <div className="grid grid-cols-2 gap-4">
                {data.amenities.map((item, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    {isEditing ? (
                      <input 
                        value={item} 
                        onChange={(e) => handleAmenityChange(index, e.target.value)}
                        className="bg-transparent border-b border-gray-300 w-full focus:outline-none focus:border-blue-500"
                      />
                    ) : (
                      <span className="text-gray-700 font-medium">{item}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: VIDEO (30%) --- */}
      <div className="w-[30%] h-full bg-black relative shadow-2xl z-20">
        <VideoPlayer 
          src={data.videoUrl} 
          title={data.title}
          location={data.location}
          likes={data.likes}
          price={data.price}
        />
      </div>

    </div>
  );
};

// --- HELPER COMPONENTS ---

const StatCard = ({ icon: Icon, label, value, name, isEditing, onChange, type = "text", step, color }) => (
  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow">
    <div className={`p-3 rounded-full bg-gray-50 mb-3 ${color}`}>
      <Icon size={24} />
    </div>
    <span className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{label}</span>
    {isEditing ? (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        step={step}
        className="w-full text-center font-bold text-xl text-gray-800 border-b border-gray-200 focus:border-blue-500 outline-none bg-transparent"
      />
    ) : (
      <span className="font-bold text-xl text-gray-800">{value}</span>
    )}
  </div>
);

const VideoPlayer = ({ src, title, location, likes, price }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Auto-play when source changes
  useEffect(() => {
    if(videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [src]);

  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative w-full h-full group cursor-pointer" onClick={togglePlay}>
      {/* Video Element - Object Cover simulates phone screen fill */}
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        loop
        muted={isMuted}
        playsInline
      />

      {/* Play/Pause Overlay Icon (Centers on pause) */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] transition-all">
          <div className="bg-white/20 p-6 rounded-full backdrop-blur-md border border-white/30 text-white">
            <Play size={48} fill="currentColor" />
          </div>
        </div>
      )}

      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent pt-12">
        <span className="bg-black/40 backdrop-blur-md text-white text-xs px-2 py-1 rounded border border-white/20">
          Preview
        </span>
        <button onClick={toggleMute} className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors">
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      {/* Bottom Info Overlay (Phone Style) */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white pt-24">
        
        {/* Floating Action Buttons Right */}
        <div className="absolute right-4 bottom-24 flex flex-col gap-4 items-center">
          <div className="flex flex-col items-center gap-1">
             <div className="bg-gray-800/80 p-3 rounded-full hover:bg-gray-700 transition-colors">
                <Heart size={24} className={likes > 0 ? "fill-red-500 text-red-500" : ""} />
             </div>
             <span className="text-xs font-medium">{likes}</span>
          </div>
          <div className="bg-gray-800/80 p-3 rounded-full hover:bg-gray-700 transition-colors">
            <Share2 size={24} />
          </div>
        </div>

        <div className="pr-16">
          <h2 className="text-2xl font-bold mb-1 leading-tight text-shadow-sm">{title}</h2>
          <div className="flex items-center text-gray-200 text-sm mb-4">
            <MapPin size={14} className="mr-1" />
            {location}
          </div>
          
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-all active:scale-95 flex justify-center items-center shadow-lg shadow-blue-900/50">
            Book Now <span className="ml-1 text-blue-200 text-sm font-normal">| from ${price}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetails;