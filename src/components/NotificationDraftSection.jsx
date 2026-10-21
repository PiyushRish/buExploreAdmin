/**
 * NotificationDraftSection
 *
 * Drop this inside any "Create" modal just above the submit button.
 * It auto-generates a default title + message from the entity name,
 * lets the admin edit both, and returns the final values via onChange.
 *
 * Props:
 *  - entityName  : string  — live value of the entity being created (e.g. form.name / form.title)
 *  - serviceType : string  — one of the SERVICE_TYPES keys (place, hotel, guide, etc.)
 *  - value       : { title, message, send } — controlled state from parent
 *  - onChange    : (next) => void — called whenever any field changes
 */

import React, { useEffect } from "react";
import { Bell, BellOff, RefreshCw } from "lucide-react";

// ─── Service type friendly labels ─────────────────────────────────────────────
export const SERVICE_LABELS = {
  place: "Place / Destination",
  hotel: "Hotel / Property",
  restaurant: "Restaurant / Dining",
  guide: "Tourist Guide",
  agency: "Travel Agency",
  event: "City Event",
  surprise_event: "Surprise Event",
  tour: "Tour / Plan",
  vehicle: "Vehicle / Rental",
  emergency: "Emergency 24/7",
  shopping: "Store / Shopping",
  podcast: "Podcast Episode",
  general: "Service",
};

// ─── Default message generators per service type ──────────────────────────────
export const DEFAULT_NOTIF = {
  place: (name) => ({
    title: `Explore ${name || "New Destination"}`,
    message: `A stunning new destination has just been added — ${name || "this place"} is now waiting for you to explore. Discover its history, beauty, and hidden gems!`,
  }),
  hotel: (name) => ({
    title: `New Stay Available: ${name || "New Property"}`,
    message: `Looking for a great place to stay? ${name || "A new property"} has just been listed on BUXplore — check out its amenities, rooms, and pricing.`,
  }),
  restaurant: (name) => ({
    title: `Taste It: ${name || "New Restaurant"}`,
    message: `A new dining experience awaits! ${name || "A new restaurant"} is now live on BUXplore — explore the menu, ambiance, and location.`,
  }),
  guide: (name) => ({
    title: `Meet Your Guide: ${name || "New Guide"}`,
    message: `Explore with confidence! ${name || "A new expert guide"} is now available on BUXplore to make your journey unforgettable.`,
  }),
  agency: (name) => ({
    title: `New Travel Agency: ${name || "Agency Partner"}`,
    message: `Looking for professional travel planning? ${name || "A new travel agency"} is now registered on BUXplore!`,
  }),
  event: (name) => ({
    title: `Don't Miss: ${name || "New Event"}`,
    message: `An exciting new event is happening — ${name || "this event"} has been added to BUXplore. Check the details and plan your visit!`,
  }),
  surprise_event: (name) => ({
    title: `Surprise Event: ${name || "Special Event"}`,
    message: `Something special is coming your way! ${name || "A surprise event"} has just been published. Be the first to know and grab your spot!`,
  }),
  tour: (name) => ({
    title: `New Tour Package: ${name || "Explore Now"}`,
    message: `Adventure awaits! A brand-new tour — ${name || "this tour package"} — is now available on BUXplore. Book your spot before it fills up!`,
  }),
  vehicle: (name) => ({
    title: `Ride Now: ${name || "New Vehicle"}`,
    message: `Getting around just got easier. ${name || "A new vehicle option"} is now listed on BUXplore — book your ride and explore freely!`,
  }),
  emergency: (name) => ({
    title: `Emergency Service: ${name || "New Facility"}`,
    message: `24/7 Emergency assistance available: ${name || "this service"} is now registered on BUXplore. Save and note its contact details for quick access.`,
  }),
  shopping: (name) => ({
    title: `Local Shopping & Crafts: ${name || "New Store"}`,
    message: `Discover authentic local goods: ${name || "this store"} is now featured on BUXplore. Explore local handicrafts, souvenirs, and specialty items!`,
  }),
  podcast: (name) => ({
    title: `New Episode: ${name || "New Podcast"}`,
    message: `A fresh episode is live! Tune in to ${name || "this new podcast"} on BUXplore and discover local stories, travel tips, and more.`,
  }),
};

// ─── Component ────────────────────────────────────────────────────────────────
const NotificationDraftSection = ({ entityName, serviceType, value, onChange }) => {
  const serviceLabel = SERVICE_LABELS[serviceType] || "Service";

  const generate = () => {
    const gen = DEFAULT_NOTIF[serviceType] || DEFAULT_NOTIF.place;
    return gen(entityName);
  };

  // Auto-fill when entityName changes
  useEffect(() => {
    if (!entityName?.trim()) return;
    const { title, message } = generate();
    onChange({ ...value, title, message });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityName, serviceType]);

  const handleReset = () => {
    const { title, message } = generate();
    onChange({ ...value, title, message });
  };

  const isEnabled = Boolean(value?.send);

  return (
    <div className={`border rounded-2xl p-4 space-y-3 transition-colors duration-200 ${
      isEnabled ? "border-blue-200 bg-blue-50/50 shadow-xs" : "border-slate-200 bg-slate-50/70"
    }`}>
      {/* Header with Prominent Toggle Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg transition-colors ${
            isEnabled ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
          }`}>
            {isEnabled ? <Bell size={15} /> : <BellOff size={15} />}
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wide text-slate-800">
              Notification for this {serviceLabel}
            </span>
            <p className="text-[11px] text-slate-500 font-medium">
              Toggle broadcast when publishing
            </p>
          </div>
        </div>

        {/* Modern Slider Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end text-right">
            <span className="text-xs font-black select-none text-slate-800">
              {isEnabled ? "Push Notification Enabled" : "Push Notification Disabled"}
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              {isEnabled ? "Will broadcast to tourists" : "Silent creation (No alert)"}
            </span>
          </div>

          {/* Slider Switch Track */}
          <button
            type="button"
            role="switch"
            aria-checked={isEnabled}
            onClick={() => onChange({ ...value, send: !isEnabled })}
            className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-300 ease-in-out focus:outline-hidden ${
              isEnabled
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 shadow-sm"
                : "bg-slate-300 hover:bg-slate-400"
            }`}
            title={isEnabled ? "Click to disable notification" : "Click to enable notification"}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-300 ease-in-out ${
                isEnabled ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>

          {isEnabled && (
            <button
              type="button"
              onClick={handleReset}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer ml-1 p-1"
              title="Reset to default template"
            >
              <RefreshCw size={12} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* When notification is DISABLED */}
      {!isEnabled && (
        <div className="text-[11px] text-slate-500 bg-white p-3 rounded-xl border border-dashed border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">🔕 Notification slider is OFF.</span>
            <span>Saving this {serviceLabel.toLowerCase()} will NOT trigger any notifications.</span>
          </div>
          <span className="text-[10px] text-indigo-600 font-bold">Slide toggle to enable ➔</span>
        </div>
      )}

      {/* When notification is ENABLED */}
      {isEnabled && (
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between text-[10px] text-blue-700 font-semibold bg-blue-100/70 px-2.5 py-1.5 rounded-xl">
            <span>⏱️ Active notification retention: 1 day (24 hours)</span>
            <span className="text-emerald-700 font-bold">● Broadcasts instantly on save</span>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
              Notification Title
            </label>
            <input
              type="text"
              value={value.title}
              onChange={(e) => onChange({ ...value, title: e.target.value })}
              placeholder={`e.g. Explore ${entityName || "New Destination"}`}
              className="w-full border border-blue-200 bg-white p-2.5 rounded-xl text-sm outline-none focus:border-blue-500 shadow-xs"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
              Message Body
            </label>
            <textarea
              rows={2}
              value={value.message}
              onChange={(e) => onChange({ ...value, message: e.target.value })}
              placeholder="Write a short, engaging notification message for users..."
              className="w-full border border-blue-200 bg-white p-2.5 rounded-xl text-sm resize-none outline-none focus:border-blue-500 shadow-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDraftSection;
