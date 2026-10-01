import React, { useState, useContext } from "react";
import {
  MapPin, Bell, User, Car, Megaphone, MessageSquare, AlertCircle,
  Film, Video, Menu, X, ChevronLeft, LayoutDashboard, Mic,
  Compass, Sparkles,
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
import Users from "./Users.jsx";
import Podcast from "./Podcast.jsx";
import IntroVideoPage from "./IntroVideo.jsx";
import ReelsFeed from "./ReelsFeed.jsx";
import ToursPage from "./Tours.jsx";
import SurpriseEventsPage from "./SurpriseEvents.jsx";
import { PlaceContext } from "../contextApi/places.jsx";

const navItems = [
  { name: "Places",          icon: MapPin },
  { name: "Hotels",          icon: MapPin },
  { name: "Restaurants",     icon: MapPin },
  { name: "Guides & Agency", icon: User },
  { name: "Tours & Plans",   icon: Compass },
  { name: "Surprise Events", icon: Sparkles },
  { name: "Vehicles",        icon: Car },
  { name: "Ads",             icon: Megaphone },
  { name: "Testimonials",    icon: MessageSquare },
  { name: "Notifications",   icon: Bell },
  { name: "Users",           icon: User },
  { name: "Podcasts",        icon: Mic },
  { name: "Intro Video",     icon: Video },
  { name: "Reels Feed",      icon: Film },
];

const DashBoard = () => {
  const [activeTab, setActiveTab]   = useState("Places");
  const [sidebarOpen, setSidebarOpen] = useState(false);   // mobile drawer
  const [collapsed, setCollapsed]   = useState(false);     // desktop icon-only mode
  const { clickedPlace, setClickedPlaceHandler } = useContext(PlaceContext);

  const handleNav = (name) => {
    setActiveTab(name);
    setClickedPlaceHandler(null);
    setSidebarOpen(false); // auto-close mobile drawer on tap
  };

  const SidebarContent = ({ iconOnly = false }) => (
    <>
      {/* Brand */}
      <div className={`flex items-center gap-3 px-4 h-16 border-b border-white/10 ${iconOnly ? "justify-center" : ""}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
          <LayoutDashboard size={16} className="text-white" />
        </div>
        {!iconOnly && (
          <div>
            <p className="text-white font-black text-sm leading-tight">BuXplore</p>
            <p className="text-indigo-300 text-[10px] font-medium">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ name, icon: Icon }) => {
          const isActive = activeTab === name;
          return (
            <button
              key={name}
              onClick={() => handleNav(name)}
              title={iconOnly ? name : undefined}
              className={`flex items-center w-full rounded-xl text-left transition-all duration-150 group
                ${iconOnly ? "justify-center p-3" : "gap-3 px-3 py-2.5"}
                ${isActive
                  ? "bg-white/15 text-white shadow-inner"
                  : "text-indigo-200 hover:bg-white/10 hover:text-white"
                }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!iconOnly && <span className="text-sm font-semibold">{name}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {!iconOnly && (
        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-indigo-400 text-[10px] text-center">v1.0 · BuXplore Admin</p>
        </div>
      )}
    </>
  );

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">

      {/* ── MOBILE OVERLAY ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── MOBILE DRAWER (slides in) ── */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-50 flex flex-col
          bg-gradient-to-b from-indigo-900 via-indigo-800 to-purple-900
          shadow-2xl transition-transform duration-300 lg:hidden
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* close btn */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 text-indigo-300 hover:text-white"
        >
          <X size={20} />
        </button>
        <SidebarContent iconOnly={false} />
      </aside>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 h-full
          bg-gradient-to-b from-indigo-900 via-indigo-800 to-purple-900
          shadow-xl transition-all duration-300
          ${collapsed ? "w-16" : "w-60"}`}
      >
        <SidebarContent iconOnly={collapsed} />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mx-auto mb-4 p-2 rounded-full text-indigo-300 hover:text-white hover:bg-white/10 transition"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft size={18} className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="flex items-center gap-4 h-14 px-4 bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
          {/* Hamburger (mobile only) */}
          <button
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          <h2 className="font-black text-slate-800 text-sm sm:text-base flex-1 truncate">{activeTab}</h2>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-xs text-slate-400 font-medium bg-slate-100 px-3 py-1 rounded-full">
              Admin
            </span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 min-h-full p-3 sm:p-4 md:p-6">
            {activeTab === "Places" && (
              clickedPlace
                ? <PlaceDetails onBack={() => setClickedPlaceHandler(null)} />
                : <Places />
            )}
            {activeTab === "Hotels font-medium" || activeTab === "Hotels" && <Hotels />}
            {activeTab === "Restaurants flex"  || activeTab === "Restaurants" && <Restaurants />}
            {(activeTab === "Guides & Agency"  || activeTab === "Guides") && <Guides />}
            {activeTab === "Tours & Plans"     && <ToursPage />}
            {activeTab === "Surprise Events"   && <SurpriseEventsPage />}
            {activeTab === "Vehicles"          && <Vehicle />}
            {activeTab === "Ads"               && <Ads />}
            {activeTab === "Testimonials"      && <TestimonialsPage />}
            {activeTab === "Notifications"     && <Notifications />}
            {activeTab === "Users"             && <Users />}
            {activeTab === "Podcasts"          && <Podcast />}
            {activeTab === "Intro Video"       && <IntroVideoPage />}
            {activeTab === "Reels Feed"        && <ReelsFeed />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashBoard;