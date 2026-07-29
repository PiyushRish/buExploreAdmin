import React, { useState } from "react";
import { Film, Play, Megaphone, Tag, Loader2 } from "lucide-react";
import { useReelsFeedQuery } from "../queries/placeQueries.js";

const CATEGORIES = [
  "Heritage",
  "Pilgrimage",
  "WildLife",
  "WaterBody",
  "JhansiSmartCity",
  "Treasures",
];

const ReelsFeed = () => {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  
  // Use category filter hooked directly to the dedicated reels endpoint
  const { data, isLoading, isError } = useReelsFeedQuery(selectedCategory, 1, 10, 4);

  const finalItems = Array.isArray(data) ? data : (data?.data || data?.places || []);

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-3 sm:px-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-white p-4 sm:p-5 rounded-2xl border shadow-sm">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
              <Film className="text-indigo-600" /> Reels Feed Preview
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Visualize how Reels and Ads are interleaved natively on the client device
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-gray-100 p-2 rounded-xl w-full sm:w-auto">
            <Tag size={16} className="text-gray-500 ml-2 flex-shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent border-none font-bold text-sm text-gray-800 outline-none cursor-pointer pr-4 flex-1 sm:flex-none"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-indigo-500">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-bold">Fetching interleaved feed...</p>
          </div>
        ) : isError ? (
          <div className="bg-red-50 text-red-600 p-10 rounded-2xl text-center font-bold border border-red-200">
            Failed to load the feed. Check your connection or backend logic.
          </div>
        ) : (
          <div className="h-[80vh] overflow-y-auto snap-y snap-mandatory pb-10 flex flex-col items-center hide-scrollbar">
            {finalItems.length === 0 ? (
              <div className="bg-white p-16 rounded-2xl text-center border shadow-sm flex flex-col items-center justify-center">
                <Film size={48} className="text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Reels Found</h3>
                <p className="text-gray-500">There are no places with videos in this category yet.</p>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                {finalItems.map((item, index) => {
                  if (item.type === "Ad") {
                    // AD CARD
                    const adVideoUrl = item.content?.videos?.[0]?.url;
                    const adPhotoUrl = item.content?.photos?.[0]?.url;

                    return (
                      <div key={`ad-${item._id}-${index}`} className="snap-start snap-always w-full max-w-sm h-[80vh] my-4 bg-black rounded-3xl shadow-2xl overflow-hidden flex flex-col shrink-0 relative group border border-gray-800">
                        <div className="relative flex-grow bg-black w-full h-full">
                          {adVideoUrl ? (
                            <video 
                              src={adVideoUrl} 
                              autoPlay 
                              loop 
                              muted 
                              playsInline
                              className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                            />
                          ) : adPhotoUrl ? (
                            <img src={adPhotoUrl} alt="Ad Media" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-500 bg-gray-900">No Media</div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20 pointer-events-none"></div>

                          {/* Sponsored Tag */}
                          <div className="absolute top-4 left-4 z-20">
                            <span className="bg-indigo-600/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white flex items-center gap-2 shadow-lg border border-indigo-400/50">
                              <Megaphone size={12} /> Sponsored
                            </span>
                          </div>

                          {/* Ad Content */}
                          <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
                            <h3 className="text-xl font-black mb-2 drop-shadow-md">{item.content?.headline || "Ad Headline"}</h3>
                            <p className="text-sm font-medium text-gray-300 mb-4 drop-shadow-sm line-clamp-3">
                              {item.content?.bodyText || "Advertisement Description"}
                            </p>
                            <button className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 transition-colors text-white font-black rounded-xl text-sm shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                              {item.content?.ctaText || "Learn More"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    // ORGANIC REEL CARD
                    const videoUrl = item.videos?.[0]?.url;
                    const photoUrl = item.photos?.[0]?.url;

                    return (
                      <div key={`place-${item._id}-${index}`} className="snap-start snap-always w-full max-w-sm h-[80vh] my-4 bg-black rounded-3xl shadow-2xl overflow-hidden flex flex-col shrink-0 relative group">
                        <div className="relative flex-grow bg-black w-full h-full">
                          {videoUrl ? (
                            <video 
                              src={videoUrl} 
                              autoPlay 
                              loop 
                              muted 
                              playsInline
                              className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                            />
                          ) : photoUrl ? (
                            <img src={photoUrl} alt={item.name} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-600 bg-gray-900">No Media</div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none"></div>
                          
                          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white">
                                {item.category}
                              </span>
                            </div>
                            <h3 className="text-xl font-black drop-shadow-lg">{item.name}</h3>
                            <p className="text-xs font-medium text-gray-300 line-clamp-2 mt-2 drop-shadow-sm">
                              {item.description || "Explore this amazing destination in Jhansi."}
                            </p>
                          </div>

                          <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white">
                            <Play size={16} className="ml-1" />
                          </div>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReelsFeed;
