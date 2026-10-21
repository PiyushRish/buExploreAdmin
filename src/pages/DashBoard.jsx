import React, { useState, useContext, useEffect } from "react";
import {
  MapPin, Bell, User, Users as UsersIcon, Car, Megaphone, MessageSquare, AlertCircle,
  Film, Video, Menu, X, ChevronLeft, LayoutDashboard, Mic,
  Compass, Sparkles, Star,
} from "lucide-react";
import { io } from "socket.io-client";
import axiosClient from "../api/axiosClient.js";
import { useUserStatsQuery } from "../queries/userQueries.js";

import Places from "./Places.jsx";
import PlaceReviews from "./PlaceReviews.jsx";
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
import EmergencyPage from "./Emergency.jsx";
import ServiceTemplatesPage from "./ServiceTemplates.jsx";
import Services from "./Services.jsx";
import ReportsPage from "./Reports.jsx";
import { PlaceContext } from "../contextApi/places.jsx";
import { ShieldAlert, Layers, Shield } from "lucide-react";

const navItems = [
  { name: "Places",            icon: MapPin },
  { name: "Place Reviews",     icon: MessageSquare },
  { name: "Services",          icon: Layers },
  { name: "Surprise Events",   icon: Sparkles },
  { name: "Tours & Plans",     icon: Compass },
  { name: "Ads",               icon: Megaphone },
  { name: "Testimonials",      icon: MessageSquare },
  { name: "Reports & Safety",  icon: Shield },
  { name: "Notifications",     icon: Bell },
  { name: "Users",             icon: User },
  { name: "Podcasts",          icon: Mic },
  { name: "Intro Video",       icon: Video },
  { name: "Reels Feed",        icon: Film },
];

const DashBoard = () => {
  const [activeTab, setActiveTab]   = useState("Places");
  const [sidebarOpen, setSidebarOpen] = useState(false);   // mobile drawer
  const [collapsed, setCollapsed]   = useState(false);     // desktop icon-only mode
  const { clickedPlace, setClickedPlaceHandler } = useContext(PlaceContext);

  const { data: userStats } = useUserStatsQuery();
  const [liveUsersCount, setLiveUsersCount] = useState(null);

  useEffect(() => {
    let socket;
    try {
      const socketServer =
        import.meta.env?.VITE_SOCKET_URL ||
        (axiosClient?.defaults?.baseURL
          ? axiosClient.defaults.baseURL.replace(/\/api\/?$/, "")
          : "http://localhost:5500");

      socket = io(socketServer, {
        transports: ["websocket", "polling"],
        reconnectionAttempts: 5,
      });
      socket.emit("getLiveUsers");
      socket.on("userCountLatest", (count) => {
        if (typeof count === "number") {
          setLiveUsersCount(count);
        }
      });
    } catch (_e) {
      // fallback to polling userStats
    }

  }, []);

  useEffect(() => {
    const handleTabNav = (e) => {
      if (e?.detail) {
        handleNav(e.detail);
      }
    };
    window.addEventListener("navigate-tab", handleTabNav);
    return () => window.removeEventListener("navigate-tab", handleTabNav);
  }, []);

  const totalUsers = userStats?.totalUsers ?? userStats?.userCount ?? 0;
  const onlineUsers = liveUsersCount !== null ? liveUsersCount : (userStats?.onlineUsers ?? userStats?.onlineCount ?? 0);

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
        {navItems.map((item) => {
          const Icon = item.icon;
          const name = item.name;
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
        <header className="flex items-center gap-3 sm:gap-4 h-14 px-4 bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
          {/* Hamburger (mobile only) */}
          <button
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          <h2 className="font-black text-slate-800 text-sm sm:text-base truncate mr-auto">
            {activeTab}
          </h2>

          {/* User Metrics Counters */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Online Users Badge */}
            <button
              onClick={() => handleNav("Users")}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/90 rounded-full shadow-xs text-xs transition-all duration-150 cursor-pointer"
              title="Real-time online users (Click to view users)"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-black text-emerald-800 text-xs sm:text-sm tabular-nums">
                {onlineUsers}
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold hidden sm:inline">
                Online
              </span>
            </button>

            {/* Total Users Count Badge */}
            <button
              onClick={() => handleNav("Users")}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/90 rounded-full shadow-xs text-xs transition-all duration-150 cursor-pointer"
              title="Total registered users (Click to view users)"
            >
              <UsersIcon size={14} className="text-indigo-600" />
              <span className="font-black text-indigo-900 text-xs sm:text-sm tabular-nums">
                {totalUsers}
              </span>
              <span className="text-[11px] text-indigo-700 font-semibold hidden sm:inline">
                Total Users
              </span>
            </button>

            {/* Admin Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <span className="hidden md:inline-block text-xs text-slate-500 font-semibold bg-slate-100 px-2.5 py-0.5 rounded-full">
                Admin
              </span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 min-h-full p-3 sm:p-4 md:p-6">
            {activeTab === "Places" && (
              clickedPlace
                ? <PlaceDetails
                    onBack={() => setClickedPlaceHandler(null)}
                    onNavigateToReviews={(place) => {
                      setClickedPlaceHandler(place);
                      setActiveTab("Place Reviews");
                    }}
                  />
                : <Places
                    onNavigateToReviews={(place) => {
                      setClickedPlaceHandler(place);
                      setActiveTab("Place Reviews");
                    }}
                  />
            )}
            {activeTab === "Place Reviews" && (
              <PlaceReviews
                initialPlace={clickedPlace}
                onBackToPlace={() => {
                  if (clickedPlace) {
                    setActiveTab("Places");
                  }
                }}
              />
            )}
            {(activeTab === "Services" || activeTab === "Service Templates") && <Services />}
            {activeTab === "Surprise Events"   && <SurpriseEventsPage />}
            {activeTab === "Tours & Plans"     && <ToursPage />}
            {activeTab === "Hotels"            && <Services />}
            {activeTab === "Restaurants"       && <Services />}
            {activeTab === "Emergency 24/7"    && <Services />}
            {(activeTab === "Guides & Agency" || activeTab === "Guides") && <Services />}
            {activeTab === "Vehicles"          && <Services />}
            {activeTab === "Ads"               && <Ads />}
            {activeTab === "Testimonials"      && <TestimonialsPage />}
            {activeTab === "Reports & Safety"  && <ReportsPage />}
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