import React, { useState, useContext } from "react";
import { 
  MapPin, Bell, User, Car, Megaphone, MessageSquare, AlertCircle 
} from "lucide-react";

import Places from "./Places.jsx";
import Hotels from "./Hotels.jsx";
import Restaurants from "./Restaurant.jsx";
// import Guides from "./Guides.jsx";      
import Guides from "./Guide.jsx"
import Vehicle from "./Vehicle.jsx";  
import Ads from "./Ads.jsx";                    // NEW
// import Testimonials from "./Testimonials.jsx"; // NEW
import Notifications from "./Notifications.jsx"; // NEW
import PlaceDetails from "./PlaceDetails.jsx";
import { PlaceContext } from "../contextApi/places.jsx";

const DashBoard = () => {
  const [activeTab, setActiveTab] = useState("Places");
  const { clickedPlace, setClickedPlaceHandler } = useContext(PlaceContext);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">Admin Panel</h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-3">

          <button
            onClick={() => {
              setActiveTab("Places");
              setClickedPlaceHandler(null);
            }}
            className={`flex items-center w-full p-2 rounded-lg text-left ${
              activeTab === "Places"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            <Bell className="w-5 h-5 mr-3" />
            Places
          </button>

          <button
            onClick={() => {
              setActiveTab("Hotels");
              setClickedPlaceHandler(null);
            }}
            className={`flex items-center w-full p-2 rounded-lg text-left ${
              activeTab === "Hotels"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            <MapPin className="w-5 h-5 mr-3" />
            Hotels
          </button>

          <button
            onClick={() => {
              setActiveTab("Restaurants");
              setClickedPlaceHandler(null);
            }}
            className={`flex items-center w-full p-2 rounded-lg text-left ${
              activeTab === "Restaurants"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            <MapPin className="w-5 h-5 mr-3" />
            Restaurants
          </button>

          {/* GUIDE */}
          <button
            onClick={() => {
              setActiveTab("Guides");
              setClickedPlaceHandler(null);
            }}
            className={`flex items-center w-full p-2 rounded-lg text-left ${
              activeTab === "Guides"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            <User className="w-5 h-5 mr-3" />
            Guide
          </button>

          {/* VEHICLE */}
          <button
            onClick={() => {
              setActiveTab("Vehicles");
              setClickedPlaceHandler(null);
            }}
            className={`flex items-center w-full p-2 rounded-lg text-left ${
              activeTab === "Vehicles"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            <Car className="w-5 h-5 mr-3" />
            Vehicle
          </button>

          {/* ADS */}
          <button
            onClick={() => {
              setActiveTab("Ads");
              setClickedPlaceHandler(null);
            }}
            className={`flex items-center w-full p-2 rounded-lg text-left ${
              activeTab === "Ads"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            <Megaphone className="w-5 h-5 mr-3" />
            Ads
          </button>

          {/* TESTIMONIALS */}
          <button
            onClick={() => {
              setActiveTab("Testimonials");
              setClickedPlaceHandler(null);
            }}
            className={`flex items-center w-full p-2 rounded-lg text-left ${
              activeTab === "Testimonials"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            <MessageSquare className="w-5 h-5 mr-3" />
            Testimonials
          </button>

          {/* NOTIFICATIONS */}
          <button
            onClick={() => {
              setActiveTab("Notifications");
              setClickedPlaceHandler(null);
            }}
            className={`flex items-center w-full p-2 rounded-lg text-left ${
              activeTab === "Notifications"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            <AlertCircle className="w-5 h-5 mr-3" />
            Notifications
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-5 overflow-auto">

        {activeTab === "Places" && (
          <div className="bg-white rounded-2xl shadow p-4 h-full">
            {clickedPlace ? (
              <PlaceDetails onBack={() => setClickedPlaceHandler(null)} />
            ) : (
              <Places />
            )}
          </div>
        )}

        {activeTab === "Hotels" && (
          <div className="bg-white rounded-2xl shadow p-4 h-full">
            <Hotels />
          </div>
        )}

        {activeTab === "Restaurants" && (
          <div className="bg-white rounded-2xl shadow p-4 h-full">
            <Restaurants />
          </div>
        )}

        {activeTab === "Guides" && (
          <div className="bg-white rounded-2xl shadow p-4 h-full">
            <Guides />
          </div>
        )}

        {activeTab === "Vehicles" && (
          <div className="bg-white rounded-2xl shadow p-4 h-full">
            <Vehicle />
          </div>
        )}

        {activeTab === "Ads" && (
          <div className="bg-white rounded-2xl shadow p-4 h-full">
            <Ads />
          </div>
        )}

        {activeTab === "Testimonials" && (
          <div className="bg-white rounded-2xl shadow p-4 h-full">
            <Testimonials />
          </div>
        )}

        {activeTab === "Notifications" && (
          <div className="bg-white rounded-2xl shadow p-4 h-full">
            <Notifications />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashBoard;
