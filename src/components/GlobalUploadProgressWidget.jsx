import React, { useState } from "react";
import {
  UploadCloud, CheckCircle2, AlertTriangle, Loader2,
  ChevronDown, ChevronUp, X, Sparkles
} from "lucide-react";
import { useUploadProgress } from "../contextApi/uploadProgress.jsx";

const GlobalUploadProgressWidget = () => {
  const {
    isUploading,
    percent,
    formattedLoaded,
    formattedTotal,
    status,
    finished,
    error,
  } = useUploadProgress();

  const [minimized, setMinimized] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Reset dismissed state whenever a new upload starts
  React.useEffect(() => {
    if (isUploading) {
      setDismissed(false);
    }
  }, [isUploading]);

  if ((!isUploading && !finished && !error) || dismissed) {
    return null;
  }

  return (
    <aside
      aria-label="Upload progress"
      className="fixed bottom-5 right-5 z-[999999] max-w-sm w-full animate-in slide-in-from-bottom-5 duration-300 font-sans"
    >
      <div
        className={`rounded-3xl border shadow-2xl backdrop-blur-md transition-all duration-200 overflow-hidden ${
          finished
            ? "bg-emerald-950/90 text-white border-emerald-500/40"
            : error
            ? "bg-red-950/90 text-white border-red-500/40"
            : "bg-slate-900/95 text-white border-slate-700/80 shadow-indigo-500/10"
        }`}
      >
        {/* Header Bar */}
        <div className="px-4 py-3 flex items-center justify-between gap-3 border-b border-white/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                finished
                  ? "bg-emerald-500 text-white shadow-xs shadow-emerald-500/50"
                  : error
                  ? "bg-red-500 text-white"
                  : "bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-xs shadow-indigo-500/50"
              }`}
            >
              {finished ? (
                <CheckCircle2 size={16} />
              ) : error ? (
                <AlertTriangle size={16} />
              ) : percent >= 100 ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <UploadCloud size={16} className="animate-bounce" />
              )}
            </div>

            <div className="min-w-0">
              <h4 className="text-xs font-black truncate flex items-center gap-1.5">
                {finished ? "Upload Complete!" : error ? "Upload Failed" : "Uploading Media Assets"}
                {!finished && !error && (
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping inline-block" />
                )}
              </h4>
              <p className="text-[10px] text-slate-300 font-mono truncate">
                {formattedTotal !== "0 B" ? `${formattedLoaded} / ${formattedTotal}` : "Transferring..."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span
              className={`text-xs font-black px-2 py-0.5 rounded-full tabular-nums ${
                finished
                  ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
                  : error
                  ? "bg-red-500/30 text-red-300 border border-red-500/40"
                  : "bg-indigo-500/30 text-indigo-300 border border-indigo-500/40"
              }`}
            >
              {percent}%
            </span>

            <button
              onClick={() => setMinimized(!minimized)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title={minimized ? "Expand" : "Minimize"}
            >
              {minimized ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Expanded Body */}
        {!minimized && (
          <div className="p-4 space-y-3">
            {/* Animated Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 relative">
                <div
                  className={`h-full rounded-full transition-all duration-300 ease-out relative ${
                    finished
                      ? "bg-emerald-400"
                      : error
                      ? "bg-red-500"
                      : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-md shadow-purple-500/30"
                  }`}
                  style={{ width: `${Math.max(4, Math.min(100, percent))}%` }}
                >
                  {!finished && !error && (
                    <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full" />
                  )}
                </div>
              </div>
            </div>

            {/* Status Information */}
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-300">
              <span className="truncate max-w-[240px]">
                {status || (percent >= 100 ? "Processing on server..." : "Sending files to storage...")}
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                {percent >= 100 ? "Finalizing" : "In Progress"}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default GlobalUploadProgressWidget;
