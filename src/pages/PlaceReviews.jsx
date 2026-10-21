import React, { useState, useMemo, useCallback } from "react";
import {
  Heart, Trash2, Search, MessageSquare,
  MapPin, ArrowUpDown, Clock, TrendingUp,
  RefreshCw, User, Loader2, ChevronRight, X, ArrowLeft,
  Plus, AlertCircle, Filter, CheckCircle2, Copy, Sparkles,
  ShieldAlert
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPlaces } from "../api/places.api";
import { getPlaceReviews, likeReview, deleteReview, addPlaceReview } from "../api/placeReviews.api";
import { getCoverPhoto } from "../utils/mediaHelpers";
import toast from "react-hot-toast";

/* ─── CATEGORIES ─────────────────────────────────────────────────── */
const PLACE_CATEGORIES = [
  "All",
  "Heritage",
  "Pilgrimage",
  "WildLife",
  "WaterBody",
  "JhansiSmartCity",
  "Treasures",
];

/* ─── SORT OPTIONS ─────────────────────────────────────────────── */
const SORT_OPTIONS = [
  { key: "newest",     label: "Newest First", icon: Clock },
  { key: "oldest",     label: "Oldest First", icon: ArrowUpDown },
  { key: "most_liked", label: "Most Liked",   icon: TrendingUp },
];

/* ─── REVIEW CARD COMPONENT ────────────────────────────────────── */
const ReviewCard = ({ review, onLike, onDelete, isDeleting }) => {
  const [copied, setCopied] = useState(false);

  const dateStr = review.date || review.createdAt;
  const displayDate = dateStr
    ? new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const authorName = review.user?.name || review.userName || "Verified Traveler";
  const authorEmail = review.user?.email || null;
  const initial = (authorName || "?").charAt(0).toUpperCase();

  const handleCopyId = () => {
    if (review._id) {
      navigator.clipboard.writeText(review._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Review ID copied to clipboard!");
    }
  };

  const wordCount = useMemo(() => {
    return (review.comment || "").trim().split(/\s+/).filter(Boolean).length;
  }, [review.comment]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between gap-4 group hover:border-indigo-200">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white text-sm font-black flex-shrink-0 shadow-xs">
              {initial}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-slate-800 text-sm truncate flex items-center gap-1.5">
                {authorName}
                {review.user?.role === "admin" && (
                  <span className="text-[10px] font-extrabold bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded-md">
                    Admin
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-slate-400 font-medium truncate">
                {authorEmail || displayDate}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-[10px] text-slate-400 font-mono">{displayDate}</span>
          </div>
        </div>

        {/* Comment Body */}
        <div className="relative bg-slate-50/70 border border-slate-100 rounded-xl p-3.5 mt-1">
          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
            "{review.comment}"
          </p>
          <div className="flex justify-end mt-2">
            <span className="text-[10px] font-semibold text-slate-400">
              {wordCount} / 50 words
            </span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-1">
        {/* Like Button */}
        <button
          onClick={() => onLike(review._id)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
            review.isLiked
              ? "bg-pink-50 text-pink-600 border border-pink-200 shadow-xs"
              : "text-slate-500 hover:text-pink-600 hover:bg-pink-50/60"
          }`}
          title="Toggle like on this review"
        >
          <Heart
            size={14}
            className={`transition-transform duration-150 active:scale-125 ${
              review.isLiked
                ? "fill-pink-500 text-pink-500"
                : "text-slate-400 group-hover:text-pink-500"
            }`}
          />
          <span className="tabular-nums font-semibold">
            {review.likes ?? 0} {review.likes === 1 ? "like" : "likes"}
          </span>
        </button>

        {/* ID copy & Delete button */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyId}
            className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 bg-slate-100/70 hover:bg-slate-200/80 px-2 py-1 rounded-md transition font-mono"
            title="Copy Review MongoDB ID"
          >
            {copied ? <CheckCircle2 size={11} className="text-emerald-500" /> : <Copy size={11} />}
            <span className="max-w-[70px] truncate">{review._id?.slice(-6) || "ID"}</span>
          </button>

          <button
            onClick={() => onDelete(review)}
            disabled={isDeleting}
            className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 px-2.5 py-1 rounded-lg transition-all duration-150 disabled:opacity-40 cursor-pointer"
            title="Delete this review from database"
          >
            <Trash2 size={13} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── PLACE SELECTOR CARD ──────────────────────────────────────── */
const PlaceListItem = ({ place, isSelected, onClick }) => {
  const cover = getCoverPhoto(place.photos);
  const reviewsCount = Array.isArray(place.reviews) ? place.reviews.length : (place.reviewsCount || 0);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-150 cursor-pointer ${
        isSelected
          ? "bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200"
          : "bg-white border-slate-200/80 hover:border-indigo-200 hover:bg-indigo-50/30 text-slate-800"
      }`}
    >
      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200 shadow-xs">
        <img src={cover} alt={place.name} className="w-full h-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <p className={`font-bold text-sm truncate ${isSelected ? "text-white" : "text-slate-800"}`}>
            {place.name}
          </p>
          {reviewsCount > 0 && (
            <span
              className={`text-[10px] font-black px-1.5 py-0.2 rounded-full tabular-nums ${
                isSelected ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-700 border border-indigo-200"
              }`}
            >
              {reviewsCount}
            </span>
          )}
        </div>
        <p className={`text-[11px] flex items-center gap-1 truncate ${isSelected ? "text-indigo-100" : "text-slate-400"}`}>
          <MapPin size={10} className="flex-shrink-0" /> {place.city || "Jhansi"} ·{" "}
          <span className="font-semibold">{place.category}</span>
        </p>
      </div>
      <ChevronRight
        size={15}
        className={`flex-shrink-0 transition-transform ${
          isSelected ? "text-white translate-x-0.5" : "text-slate-300"
        }`}
      />
    </button>
  );
};

/* ─── ADD REVIEW MODAL ─────────────────────────────────────────── */
const AddReviewModal = ({ isOpen, onClose, place, onSubmit, isSubmitting }) => {
  const [comment, setComment] = useState("");

  if (!isOpen || !place) return null;

  const words = comment.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const isOverLimit = wordCount > 50;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      return toast.error("Please enter a review comment.");
    }
    if (isOverLimit) {
      return toast.error("Review comment cannot exceed 50 words as required by backend.");
    }
    onSubmit({ comment });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white flex items-center justify-between">
          <div>
            <h3 className="font-black text-lg flex items-center gap-2">
              <Sparkles size={18} className="text-amber-300" />
              Add Community Comment
            </h3>
            <p className="text-xs text-indigo-100 mt-0.5">
              Posting to: <span className="font-bold underline">{place.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-indigo-200 hover:text-white hover:bg-white/10 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Comment Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Review Comment <span className="text-red-500">*</span>
              </label>
              <span
                className={`text-xs font-bold tabular-nums px-2 py-0.5 rounded-full ${
                  isOverLimit
                    ? "bg-red-100 text-red-700 font-black"
                    : wordCount > 40
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {wordCount} / 50 words max
              </span>
            </div>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write genuine experience, highlights, or tips for this destination..."
              className={`w-full p-3.5 text-sm rounded-2xl border outline-none transition ${
                isOverLimit
                  ? "border-red-400 focus:ring-2 focus:ring-red-100"
                  : "border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              }`}
            />
            {isOverLimit && (
              <p className="text-xs text-red-600 font-bold mt-1.5 flex items-center gap-1">
                <AlertCircle size={13} /> Review exceeds the 50-word limit required by the backend.
              </p>
            )}
            <p className="text-[11px] text-slate-400 mt-1">
              Backend validates strictly: maximum 50 words. Latest review appears first.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isOverLimit || !comment.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black shadow-md hover:shadow-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Posting Review...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Publish Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── DELETE CONFIRMATION MODAL ────────────────────────────────── */
const DeleteReviewModal = ({ isOpen, onClose, review, onConfirm, isDeleting }) => {
  if (!isOpen || !review) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md p-6">
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <ShieldAlert size={26} />
        </div>

        <h3 className="text-lg font-black text-slate-900 mb-1">
          Delete Place Review?
        </h3>
        <p className="text-slate-500 text-xs leading-relaxed mb-4">
          This review will be permanently deleted from this destination's records in the database.
        </p>

        {/* Review snippet */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 mb-5 text-xs text-slate-700 italic">
          "{review.comment}"
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-black shadow-md hover:shadow-lg transition-all duration-150 disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={15} />
                <span>Delete Permanently</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── MAIN PLACE REVIEWS COMPONENT ─────────────────────────────── */
const PlaceReviews = ({ initialPlace = null, onBackToPlace = null }) => {
  const queryClient = useQueryClient();

  // State
  const [placeSearch, setPlaceSearch]             = useState("");
  const [placeCategory, setPlaceCategory]         = useState("All");
  const [selectedPlace, setSelectedPlace]         = useState(initialPlace);
  const [reviewSearch, setReviewSearch]           = useState("");
  const [sort, setSort]                           = useState("newest");
  const [page, setPage]                           = useState(1);
  const [showAddModal, setShowAddModal]           = useState(false);
  const [reviewToDelete, setReviewToDelete]       = useState(null);

  const LIMIT = 30;

  /* Query: All destinations */
  const { data: placesData, isLoading: loadingPlaces } = useQuery({
    queryKey: ["places", { limit: 1000 }],
    queryFn: () => getPlaces({ limit: 1000 }),
    staleTime: 60_000,
  });

  const allPlaces = placesData?.places || [];

  // Filter places for the left selector sidebar
  const filteredPlaces = useMemo(() => {
    return allPlaces.filter((p) => {
      const matchesSearch =
        p.name?.toLowerCase().includes(placeSearch.toLowerCase()) ||
        p.city?.toLowerCase().includes(placeSearch.toLowerCase()) ||
        p.category?.toLowerCase().includes(placeSearch.toLowerCase());

      const matchesCat =
        placeCategory === "All" ||
        p.category?.toLowerCase() === placeCategory.toLowerCase();

      return matchesSearch && matchesCat;
    });
  }, [allPlaces, placeSearch, placeCategory]);

  // Auto-select initial place or first place if none selected
  React.useEffect(() => {
    if (!selectedPlace && allPlaces.length > 0) {
      if (initialPlace) {
        const found = allPlaces.find((p) => p._id === initialPlace._id);
        setSelectedPlace(found || initialPlace);
      } else {
        setSelectedPlace(allPlaces[0]);
      }
    }
  }, [allPlaces, initialPlace, selectedPlace]);

  /* Query: Reviews for selected place */
  const {
    data: reviewsResponse,
    isLoading: loadingReviews,
    isFetching: fetchingReviews,
    refetch: refetchReviews,
  } = useQuery({
    queryKey: ["placeReviews", selectedPlace?._id, page, LIMIT],
    queryFn: () => getPlaceReviews(selectedPlace._id, { page, limit: LIMIT }),
    enabled: !!selectedPlace?._id,
    staleTime: 20_000,
  });

  const rawReviews = reviewsResponse?.reviews || [];
  const totalReviews = reviewsResponse?.total ?? rawReviews.length;
  const totalPages = reviewsResponse?.pages ?? Math.ceil(totalReviews / LIMIT) ?? 1;

  /* Derived Review Statistics */
  const stats = useMemo(() => {
    if (!rawReviews.length) {
      return { totalLikes: 0 };
    }

    let likes = 0;
    rawReviews.forEach((r) => {
      likes += typeof r.likes === "number" ? r.likes : 0;
    });

    return {
      totalLikes: likes,
    };
  }, [rawReviews]);

  /* Filter and Sort Reviews */
  const processedReviews = useMemo(() => {
    let list = [...rawReviews];

    // Search filter
    if (reviewSearch.trim()) {
      const query = reviewSearch.toLowerCase().trim();
      list = list.filter((r) => {
        const comment = (r.comment || "").toLowerCase();
        const author = (r.user?.name || r.userName || "").toLowerCase();
        const email = (r.user?.email || "").toLowerCase();
        return comment.includes(query) || author.includes(query) || email.includes(query);
      });
    }

    // Sorting
    switch (sort) {
      case "newest":
        list.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
        break;
      case "oldest":
        list.sort((a, b) => new Date(a.date || a.createdAt || 0) - new Date(b.date || b.createdAt || 0));
        break;
      case "most_liked":
        list.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
        break;
      default:
        break;
    }

    return list;
  }, [rawReviews, reviewSearch, sort]);

  /* Mutation: Like Review */
  const likeMut = useMutation({
    mutationFn: ({ placeId, reviewId }) => likeReview(placeId, reviewId),
    onMutate: async ({ reviewId }) => {
      await queryClient.cancelQueries({ queryKey: ["placeReviews", selectedPlace._id] });
      const prevData = queryClient.getQueryData(["placeReviews", selectedPlace._id, page, LIMIT]);

      queryClient.setQueryData(["placeReviews", selectedPlace._id, page, LIMIT], (old) => {
        if (!old) return old;
        return {
          ...old,
          reviews: (old.reviews || []).map((r) => {
            if (r._id === reviewId) {
              const wasLiked = Boolean(r.isLiked);
              return {
                ...r,
                isLiked: !wasLiked,
                likes: wasLiked ? Math.max(0, (r.likes || 1) - 1) : (r.likes || 0) + 1,
              };
            }
            return r;
          }),
        };
      });

      return { prevData };
    },
    onError: (_err, _vars, context) => {
      if (context?.prevData) {
        queryClient.setQueryData(["placeReviews", selectedPlace._id, page, LIMIT], context.prevData);
      }
      toast.error("Could not update like status.");
    },
    onSuccess: (data) => {
      toast.success(data.message || "Review like toggled!");
    },
  });

  /* Mutation: Delete Review */
  const deleteMut = useMutation({
    mutationFn: ({ placeId, reviewId }) => deleteReview(placeId, reviewId),
    onSuccess: () => {
      toast.success("Review deleted successfully.");
      setReviewToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["placeReviews", selectedPlace._id] });
      queryClient.invalidateQueries({ queryKey: ["places"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to delete review.");
    },
  });

  /* Mutation: Add Review */
  const addMut = useMutation({
    mutationFn: ({ placeId, payload }) => addPlaceReview(placeId, payload),
    onSuccess: () => {
      toast.success("Review published successfully!");
      setShowAddModal(false);
      setPage(1);
      queryClient.invalidateQueries({ queryKey: ["placeReviews", selectedPlace._id] });
      queryClient.invalidateQueries({ queryKey: ["places"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to publish review.");
    },
  });

  const handleLike = useCallback((reviewId) => {
    if (!selectedPlace?._id) return;
    likeMut.mutate({ placeId: selectedPlace._id, reviewId });
  }, [selectedPlace, likeMut]);

  const handleConfirmDelete = () => {
    if (!selectedPlace?._id || !reviewToDelete?._id) return;
    deleteMut.mutate({ placeId: selectedPlace._id, reviewId: reviewToDelete._id });
  };

  const handleAddReview = ({ rating, comment }) => {
    if (!selectedPlace?._id) return;
    addMut.mutate({ placeId: selectedPlace._id, payload: { rating, comment } });
  };

  return (
    <div className="flex h-full min-h-[calc(100vh-6.5rem)] rounded-2xl overflow-hidden border border-slate-200 bg-white font-sans shadow-xs">

      {/* ── LEFT: DESTINATION SELECTOR PANEL ──────────────────── */}
      <div className="w-80 flex-shrink-0 flex flex-col border-r border-slate-200 bg-slate-50/70">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-black text-slate-800 text-sm flex items-center gap-2">
              <MapPin size={16} className="text-indigo-600" />
              Destinations
            </h2>
            <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
              {allPlaces.length} total
            </span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={placeSearch}
              onChange={(e) => setPlaceSearch(e.target.value)}
              placeholder="Search destination..."
              className="w-full pl-8 pr-7 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
            />
            {placeSearch && (
              <button
                onClick={() => setPlaceSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="px-3 py-2 border-b border-slate-200 bg-white/70 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
          {PLACE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setPlaceCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition cursor-pointer ${
                placeCategory === cat
                  ? "bg-slate-800 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Places List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
          {loadingPlaces ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-indigo-500">
              <Loader2 size={24} className="animate-spin" />
              <p className="text-xs text-slate-400 font-semibold">Loading destinations...</p>
            </div>
          ) : filteredPlaces.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-xs font-bold text-slate-600">No destinations found</p>
              <p className="text-[11px] text-slate-400 mt-1">Try another search or category.</p>
            </div>
          ) : (
            filteredPlaces.map((place) => (
              <PlaceListItem
                key={place._id}
                place={place}
                isSelected={selectedPlace?._id === place._id}
                onClick={() => {
                  setSelectedPlace(place);
                  setPage(1);
                  setReviewSearch("");
                  setStarFilter("all");
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* ── RIGHT: PLACE REVIEWS & MODERATION PANEL ───────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/40 overflow-hidden">
        {!selectedPlace ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center mb-4 text-indigo-500 shadow-xs">
              <MessageSquare size={36} />
            </div>
            <h3 className="font-black text-slate-800 text-lg mb-1">Select a Destination</h3>
            <p className="text-slate-500 text-xs max-w-sm leading-relaxed">
              Choose a place from the left list to review, moderate user ratings, post official reviews, and manage feedback.
            </p>
          </div>
        ) : (
          <>
            {/* ── PLACE HERO HEADER ── */}
            <div className="bg-white border-b border-slate-200 p-5 shadow-xs flex-shrink-0">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Place Identity */}
                <div className="flex items-center gap-4 min-w-0">
                  {onBackToPlace && (
                    <button
                      onClick={onBackToPlace}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                      title="Return to place editor"
                    >
                      <ArrowLeft size={18} />
                    </button>
                  )}
                  <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-200 shadow-xs bg-slate-100">
                    <img
                      src={getCoverPhoto(selectedPlace.photos)}
                      alt={selectedPlace.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="font-black text-slate-900 text-lg truncate">
                        {selectedPlace.name}
                      </h1>
                      <span className="text-[10px] font-extrabold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0">
                        {selectedPlace.category}
                      </span>
                      {selectedPlace.isDeleted && (
                        <span className="text-[10px] font-extrabold bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase flex-shrink-0">
                          Deleted
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin size={11} className="text-indigo-500" />
                      {selectedPlace.location?.address || selectedPlace.city || "Jhansi"}
                    </p>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-xs hover:shadow-md transition cursor-pointer"
                  >
                    <Plus size={15} />
                    <span>Add Review</span>
                  </button>

                  <button
                    onClick={() => refetchReviews()}
                    disabled={fetchingReviews}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition cursor-pointer"
                    title="Refresh reviews"
                  >
                    <RefreshCw size={15} className={fetchingReviews ? "animate-spin text-indigo-600" : ""} />
                  </button>
                </div>
              </div>

              {/* ── STATS BAR ── */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
                {/* Total Reviews / Comments */}
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Community Comments</p>
                    <p className="text-sm font-black text-slate-800">{totalReviews}</p>
                  </div>
                </div>

                {/* Community Likes */}
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center flex-shrink-0">
                    <Heart size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Likes</p>
                    <p className="text-sm font-black text-slate-800">{stats.totalLikes}</p>
                  </div>
                </div>
              </div>

              {/* ── FILTER & SEARCH CONTROLS ── */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100">
                {/* Search within reviews */}
                <div className="relative flex-1 max-w-sm">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={reviewSearch}
                    onChange={(e) => setReviewSearch(e.target.value)}
                    placeholder="Search comment or user..."
                    className="w-full pl-8 pr-7 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-indigo-400 outline-none transition"
                  />
                  {reviewSearch && (
                    <button
                      onClick={() => setReviewSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Sort Selection */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold">Sort by:</span>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 py-1.5 px-3 outline-none cursor-pointer hover:border-slate-300"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.key} value={opt.key}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ── REVIEWS LIST / GRID ── */}
            <div className="flex-1 overflow-y-auto p-5">
              {loadingReviews ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3 text-indigo-500">
                  <Loader2 size={32} className="animate-spin" />
                  <p className="text-xs font-bold text-slate-400">Loading place reviews...</p>
                </div>
              ) : processedReviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                    <MessageSquare size={28} />
                  </div>
                  <h4 className="font-bold text-slate-700 text-sm mb-1">
                    {reviewSearch || starFilter !== "all"
                      ? "No reviews match your filters"
                      : "No reviews published for this destination yet"}
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xs mb-4">
                    {reviewSearch || starFilter !== "all"
                      ? "Try resetting your search query or rating filter."
                      : "Be the first to post official feedback or wait for travelers to review."}
                  </p>
                  {(reviewSearch || starFilter !== "all") ? (
                    <button
                      onClick={() => {
                        setReviewSearch("");
                        setStarFilter("all");
                      }}
                      className="text-xs font-bold text-indigo-600 hover:underline"
                    >
                      Reset all filters
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700 transition cursor-pointer"
                    >
                      <Plus size={14} /> Add First Review
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-500">
                      Showing <span className="text-slate-800">{processedReviews.length}</span> of{" "}
                      <span className="text-slate-800">{totalReviews}</span> total reviews
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      Sorted by {SORT_OPTIONS.find((s) => s.key === sort)?.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {processedReviews.map((review) => (
                      <ReviewCard
                        key={review._id}
                        review={review}
                        onLike={handleLike}
                        onDelete={(rev) => setReviewToDelete(rev)}
                        isDeleting={deleteMut.isPending}
                      />
                    ))}
                  </div>

                  {/* ── PAGINATION ── */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8 pb-4">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        ← Prev
                      </button>

                      <span className="text-xs font-bold text-slate-600 px-3 py-1.5 bg-slate-100 rounded-xl">
                        Page {page} of {totalPages}
                      </span>

                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── ADD REVIEW MODAL ── */}
      <AddReviewModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        place={selectedPlace}
        onSubmit={handleAddReview}
        isSubmitting={addMut.isPending}
      />

      {/* ── DELETE CONFIRMATION MODAL ── */}
      <DeleteReviewModal
        isOpen={!!reviewToDelete}
        onClose={() => setReviewToDelete(null)}
        review={reviewToDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMut.isPending}
      />
    </div>
  );
};

export default PlaceReviews;
