# buExploreAdmin — Project Context

> **Last Updated:** 2026-10-09
> **Stack:** React 18, Vite, TanStack Query v5, Axios, Tailwind CSS, Lucide Icons, React Hot Toast

---

## 📁 Project Structure

```
buExploreAdmin/src/
├── App.jsx                # Root — QueryClientProvider, Toaster, Routes (/ Login, /dashboard DashBoard)
├── main.jsx               # ReactDOM entry
├── api/                   # Axios API wrappers (one file per domain)
│   ├── axiosClient.js     # Axios instance — base URL, JWT interceptor, error toast
│   ├── notification.api.js
│   ├── hotel.api.js
│   ├── guide.api.js
│   ├── restaurant.api.js
│   ├── surpriseEvents.api.js
│   ├── tours.api.js
│   ├── vehicle.api.js
│   └── ...
├── pages/                 # Full-page views (rendered inside DashBoard layout)
│   ├── Notifications.jsx  # Notification broadcast + history log page
│   ├── Hotels.jsx
│   ├── Guide.jsx
│   ├── Restaurant.jsx
│   ├── SurpriseEvents.jsx
│   ├── Tours.jsx
│   ├── Users.jsx
│   └── ...
├── components/            # Shared UI components
├── contextApi/            # React Context providers
├── mutations/             # TanStack mutation hooks
├── queries/               # TanStack query hooks
└── utils/                 # Utility helpers
```

---

## 🌐 API Base URL
- **Production:** `https://buexplorebackend.onrender.com/api`
- **Local Dev:** `http://localhost:5500/api` (comment swap in `axiosClient.js`)

---

## 🔑 Auth
- Token stored in `localStorage` as `"token"`
- Auto-attached via Axios request interceptor as `Authorization: Bearer <token>`

---

## 🔔 Notification System (Updated: 2026-10-09)

### What was built
The Notifications page (`pages/Notifications.jsx`) was upgraded to support:

1. **Service-specific notifications** — Admin can pick a service type (hotel, guide, restaurant, event, tour, etc.) and optionally paste the service's ObjectId so the notification links to that specific record
2. **UUID-based deduplication** — Backend generates a `notificationId` (UUID v4). Frontend uses this to deduplicate real-time socket notifications vs. fetched ones
3. **Read/Unread badge** — The admin sees total sent count; the mobile app fetches only unread

### API calls used
| Function | Method | Endpoint |
|----------|--------|----------|
| `getNotifications` | GET | `/notification/all` |
| `sendNotification` | POST | `/notification/send` |
| `deleteNotification` | DELETE | `/notification/:id` |
| `markAsRead` | PATCH | `/notification/:notificationId/read` |
| `markAllAsRead` | PATCH | `/notification/read-all` |

### Notification send payload
```js
{
  title: String,          // required
  message: String,        // required
  type: String,           // GENERAL | EVENT | OFFER | SYSTEM | ORDER | ADVERTISEMENT
  serviceType: String,    // hotel | restaurant | guide | event | tour | vehicle | podcast | place | surprise_event | general
  serviceId: String,      // optional — ObjectId of linked service record
  userIds: [String],      // optional — omit for broadcast
}
```

---

## 📝 Decisions Log

| Date | Decision | Reason |
|------|----------|--------|
| 2026-10-09 | `notificationId` (UUID) used as key in frontend list | Prevents duplicate entries when socket + refetch both deliver same notification |
| 2026-10-09 | Service type selector added to send form | Admin can tag notifications per service category for contextual deep-links |
| 2026-10-09 | `serviceId` field is optional | Not every notification links to a specific record; keeps it flexible |
| 2026-10-09 | `isOffer` toggle added to form (disabled UI) | Placeholder for future offer-bar feature — schema ready on backend |
| 2026-10-09 | Place review word limit 50 words & latest one above | Unified with backend review validation rules |
| 2026-10-09 | Top bar Online & Total Users count badges | Real-time Socket.IO (`userCountLatest`) + polling fallback (`/users/getUserCount`) in header with quick navigation to Users tab |
| 2026-10-09 | Notification toggle button across all services, events, and places | Admin can toggle broadcast ON/OFF per place, hotel, restaurant, guide, tour, surprise event, vehicle |
| 2026-10-09 | Dynamic API Base URL resolution in `axiosClient.js` | Automatically points to `localhost:5500` when admin runs on localhost/127.0.0.1, preventing Render 429 rate limit errors from blocking local data |
| 2026-10-09 | Surprise Events DB visibility fix | Connected local admin to local backend where surprise events exist; added `/all` endpoint support and cache flushing |
| 2026-10-09 | Modern Slider Toggle Switch in `NotificationDraftSection` | Replaced plain pill with an iOS-style animated slider toggle switch (`translate-x-6` when active, gradient track) |
| 2026-10-09 | Comprehensive Modal Redesign & Decongestion | Upgraded creation modals for Places, Surprise Events, Hotels, Restaurants, Guides, and Vehicles from cramped 500px single-column layouts to spacious `max-w-4xl` cards with organized visual sections, styled upload dropzones, sticky headers, and sticky footers |

---

## 👥 Top Bar Live & Total User Counters (Added: 2026-10-09)
- **Top Bar Badges (`pages/DashBoard.jsx`):**
  - **Online Users Badge:** Emerald glowing pill with live ping animation displaying real-time connected users (`onlineUsers`). Receives updates dynamically via Socket.IO `userCountLatest` event, falling back to TanStack Query polling (`useUserStatsQuery`).
  - **Total Users Badge:** Indigo pill with `Users` icon displaying total registered user count (`totalUsers`).
  - **Interactive Quick-Nav:** Clicking either counter seamlessly switches the active tab directly to `Users` management.
  - **Socket Server Resiliency:** Dynamically resolves socket server URL from `import.meta.env.VITE_SOCKET_URL` or `axiosClient.defaults.baseURL`, automatically adapting between local dev (`localhost:5500`) and production (`onrender.com`).

---

## 🎨 Modal Decongestion & Slider Toggle Architecture (Updated: 2026-10-09)
- **Spacious Layouts:** Upgraded modal dialogs from cramped `max-w-xl` (~500px) to spacious `max-w-4xl` structured cards across:
  - `Places.jsx` (Create Destination Record)
  - `SurpriseEvents.jsx` (Publish Surprise Event)
  - `Hotels.jsx` (Add Property)
  - `Restaurant.jsx` (Add Dining Venue)
  - `Guide.jsx` (Create Travel Agency & New Tourist Guide Profile)
  - `Vehicle.jsx` (Add Rental Vehicle)
- **Sticky Controls:** Every modal features a sticky frosted header (`sticky top-0 bg-white/95 backdrop-blur`) with icon badge, clear titles and accessible close button, plus a sticky footer (`sticky bottom-0 bg-white/95 backdrop-blur`) with Cancel and Save/Publish buttons so actions are always within reach.
- **Card-Grouped Sections:** Inputs are organized into distinct categorized sections (Overview, Operations/Pricing, Location, Media Dropzone, Notification Broadcast) with responsive 2-to-3 column grids and modern input focus styles.
- **Animated Slider Toggle Switch:** `NotificationDraftSection.jsx` now features a sliding toggle track with smooth transitions, live status badges, and contextual message auto-fill.

---

## 🔔 Notifications Log & Read State Management (Updated: 2026-10-09)
- **History Log Resilience (`pages/Notifications.jsx`):**
  - Integrated `refetchInterval` for hands-free live synchronization of dispatched notifications.
  - Safe payload normalization supporting both `{ data: [...] }` and `{ notifications: [...] }` envelopes.
  - Graceful error boundary with dedicated "Retry" button.
  - Manual "Refresh" button alongside "Mark All Read" with visual 1-day retention badge indicator.
- **Mark as Read Endpoints:**
  - `PATCH /api/notification/:notificationId/read` supports UUID `notificationId` as well as MongoDB `_id`.
  - `PATCH /api/notification/read-all` marks all unread notifications within 24h retention window.

---

## 🎬 Reels Feed & Surprise Events Multi-Media (Updated: 2026-10-09)
- **Reels Feed Preview (`pages/ReelsFeed.jsx`):**
  - Supports all categories (`ALL` / empty) as well as specific category filters.
  - Returns interleaved ads and most liked review per place card.
- **Surprise Events Multi-Media (`pages/SurpriseEvents.jsx`):**
  - Added dedicated video upload dropzone supporting multiple teaser reels/videos (`videos` multipart field).
  - Cards visually display video count badges (`Film` icon) alongside event category and photos.

---

## 🎊 Surprise Event Details Page & Soft/Hard Deletion (Added: 2026-10-09)
- **Dedicated Event Details Modal (`components/SurpriseEventDetailsModal.jsx`):**
  - **Overview Mode:** Full-fidelity event inspector displaying title, category badge, active/trash status pill, date & location badges, entry fee, organizer, description, and dynamic metadata attributes.
  - **Embedded Video Player:** Dedicated video player with custom video selector tabs (supports switching between multiple uploaded videos), full controls, and external links.
  - **Photo Gallery:** High-res image display with thumbnail selector strip.
  - **Edit Mode:** In-place editing of title, category, city, location, event date, end date, entry fee, organizer, and description. Allows removing individual photos/videos by public_id and uploading additional files.
  - **Dual Delete Engine:**
    - **Soft Delete (Move to Trash):** Flags `isDeleted: true`, disables `isActive`, hides event from mobile consumers while preserving data in the database.
    - **Restore:** Re-activates soft-deleted event (`isDeleted: false, isActive: true`).
    - **Hard Delete (Permanent):** Completely erases the MongoDB document and purges all associated photos and videos from Cloudinary.
  - **Trash Filter Tabs (`pages/SurpriseEvents.jsx`):** Segmented filter controls allowing the admin to switch between "Active Events", "In Trash / Soft Deleted", and "All Events".


