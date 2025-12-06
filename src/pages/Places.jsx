import React, { useState } from 'react';
import { Heart, MapPin, Star, Share2 } from 'lucide-react';
import { useContext } from "react";
import { PlaceContext } from "../contextApi/places.jsx";
import Navbar from '../components/Navbar.jsx';
import { usePlacesQuery } from '../queries/placeQueries.js';

// Mock Data for the Places
const placesData = [
  {
    id: 1,
    title: "Bamboo Forest Retreat",
    location: "Kyoto, Japan",
    imageUrl: "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&q=80&w=800",
    likes: 1240,
    rating: 4.9,
    price: "$120/night",
    description: "Experience the tranquility of nature in this traditional Japanese retreat."
  },
  {
    id: 2,
    title: "Santorini Cliff Villa",
    location: "Santorini, Greece",
    imageUrl: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&q=80&w=800",
    likes: 3500,
    rating: 5.0,
    price: "$450/night",
    description: "Breathtaking sunset views from your private infinity pool on the cliffs."
  },
  {
    id: 3,
    title: "Alpine Lake Cabin",
    location: "Banff, Canada",
    imageUrl: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800",
    likes: 890,
    rating: 4.7,
    price: "$200/night",
    description: "Cozy wood cabin situated right on the edge of a crystal clear lake."
  },
  {
    id: 4,
    title: "Urban Loft Studio",
    location: "New York, USA",
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800",
    likes: 2100,
    rating: 4.8,
    price: "$300/night",
    description: "Modern minimalist design in the heart of the city that never sleeps."
  },
  {
    id: 5,
    title: "Tropical Beach House",
    location: "Bali, Indonesia",
    imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800",
    likes: 4200,
    rating: 4.9,
    price: "$150/night",
    description: "Steps away from the ocean, featuring an open-air living space."
  },
  {
    id: 6,
    title: "Desert Dome Glamping",
    location: "Joshua Tree, USA",
    imageUrl: "https://images.unsplash.com/photo-1532339142463-fd0a8979791a?auto=format&fit=crop&q=80&w=800",
    likes: 1500,
    rating: 4.6,
    price: "$180/night",
    description: "Stargaze from your bed in this unique eco-friendly dome structure."
  }
];

// Single Card Component
const PlaceCard = ({ place }) => {
  const { data, loading, error } = usePlacesQuery();
  console.log(data, loading, error, "api data");

  console.log(data, "place data");

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(place.likes);

  const { clickedPlace, setClickedPlaceHandler } = useContext(PlaceContext);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => (isLiked ? prev - 1 : prev + 1));
  };

  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 flex flex-col h-full"
      onClick={() => setClickedPlaceHandler(place)}
    >
      {/* Image Section */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={place.photos[0]?.url || "https://via.placeholder.com/400x300"}
          alt={place.name }
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />

        <div className="absolute top-3 right-3 flex gap-2">
          <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors text-gray-700">
            <Share2 size={18} />
          </button>
        </div>

        <div className="absolute bottom-3 left-3">
          <span className="bg-black/60 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
            {/* rating not in API, so removed */}
            Pilgrimage
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-xl text-gray-800 line-clamp-1">
              {place.name}
            </h3>

            <div className="flex items-center text-gray-500 text-sm mt-1">
              <MapPin size={14} className="mr-1" />
              {place.location.address}
            </div>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
          {place.description}
        </p>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
          {/* price removed */}
          <span className="font-semibold text-sm text-gray-500">
            {place.city}
          </span>

          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-full transition-colors ${
              isLiked
                ? "bg-red-50 text-red-500"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Heart
              size={18}
              className={`transition-all duration-300 ${
                isLiked ? "fill-red-500 scale-110" : ""
              }`}
            />
            <span className="text-sm font-medium">{likeCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
};


// Main Grid Component
const Places = () => {
  const { data, isLoading, isError } = usePlacesQuery();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (isError) {
    return <div className="flex items-center justify-center min-h-screen">Error loading places.</div>;
  } 
  return (

    
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Navbar/>
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Popular Destinations</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our curated list of top-rated places around the world. 
            Find your next adventure or relaxing getaway.
          </p>
        </div>

        {/* The Grid: 1 col mobile, 2 cols tablet, 3 cols desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.places.map((place) => (
            <PlaceCard key={place.id} place={place}  />
          ))}
        </div>
      </div>
    </div>
  );
};

// Default export as App to render the component immediately
export default function App() {
  return <Places />;
}