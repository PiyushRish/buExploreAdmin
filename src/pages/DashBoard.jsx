import React, { useState, useContext } from "react";
import {
  MapPin, Bell, User, Car, Megaphone, MessageSquare, AlertCircle,
} from "lucide-react";

import Places from "./Places.jsx";
import Hotels from "./Hotels.jsx";
import Restaurants from "./Restaurant.jsx";
import Guides from "./Guide.jsx";
import Vehicle from "./Vehicle.jsx";
import Ads from "./Ads.jsx";
import Notifications from "./Notifications.jsx";
import PlaceDetails from "./PlaceDetails.jsx";
import TestimonialsPage from "./TestimonialAdmin.jsx";
import { PlaceContext } from "../contextApi/places.jsx";

const DashBoard = () => {
  const [activeTab, setActiveTab] = useState("Places");
  const { clickedPlace, setClickedPlaceHandler } = useContext(PlaceContext);

  const navItems = [
    { name: "Places", icon: Bell },
    { name: "Hotels", icon: MapPin },
    { name: "Restaurants", icon: MapPin },
    { name: "Guides", icon: User },
    { name: "Vehicles", icon: Car },
    { name: "Ads", icon: Megaphone },
    { name: "Testimonials", icon: MessageSquare },
    { name: "Notifications", icon: AlertCircle },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* SIDEBAR */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">Admin Dashboard</h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name);
                  setClickedPlaceHandler(null);
                }}
                className={`flex items-center w-full p-3 rounded-lg text-left font-medium transition-all ${
                  isActive ? "bg-blue-100 text-blue-600 font-bold" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 p-6 overflow-auto">
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
            <TestimonialsPage />
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