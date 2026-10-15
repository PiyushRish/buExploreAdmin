import React from "react";
import { UploadCloud, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { useUploadProgress } from "../contextApi/uploadProgress.jsx";

const UploadProgressBar = ({
  percent: propPercent,
  status: propStatus,
  loaded: propLoaded,
  total: propTotal,
  isUploading: propIsUploading,
  showOnlyWhenUploading = true,
  className = "",
  compact = false,
}) => {
  const global = useUploadProgress();

  const isUploading = propIsUploading !== undefined ? propIsUploading : (global.isUploading || global.finished);
  const percent = propPercent !== undefined ? propPercent : global.percent;
  const status = propStatus !== undefined ? propStatus : global.status;
  const formattedLoaded = propLoaded !== undefined ? propLoaded : global.formattedLoaded;
  const formattedTotal = propTotal !== undefined ? propTotal : global.formattedTotal;
  const isFinished = global.finished;
  const isError = global.error;

  if (showOnlyWhenUploading && !isUploading && !isFinished && !isError) {
    return null;
  }

  return (
    <div
      className={`rounded-2xl border p-4 transition-all duration-200 animate-in fade-in slide-in-from-top-2 ${
        isFinished
          ? "bg-emerald-50/90 border-emerald-200 text-emerald-900"
          : isError
          ? "bg-red-50/90 border-red-200 text-red-900"
          : "bg-indigo-50/80 border-indigo-200/90 text-indigo-950 shadow-xs"
      } ${className}`}
    >
      {/* Top Details */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isFinished
                ? "bg-emerald-500 text-white"
                : isError
                ? "bg-red-500 text-white"
                : "bg-indigo-600 text-white shadow-xs"
            }`}
          >
            {isFinished ? (
              <CheckCircle2 size={16} />
            ) : isError ? (
              <AlertTriangle size={16} />
            ) : percent >= 100 ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <UploadCloud size={16} className="animate-pulse" />
            )}
          </div>

          <div className="min-w-0">
            <p className="text-xs font-black truncate">
              {status || (isFinished ? "Upload complete!" : `Uploading Media Assets (${percent}%)`)}
            </p>
            {!compact && formattedTotal && formattedTotal !== "0 B" && (
              <p className="text-[10px] font-semibold opacity-75 font-mono">
                {formattedLoaded} of {formattedTotal} transferred
              </p>
            )}
          </div>
        </div>

        {/* Percentage Pill */}
        <span
          className={`text-xs font-black px-2.5 py-0.5 rounded-full tabular-nums shadow-2xs ${
            isFinished
              ? "bg-emerald-200/70 text-emerald-800"
              : isError
              ? "bg-red-200/70 text-red-800"
              : "bg-indigo-200 text-indigo-900"
          }`}
        >
          {percent}%
        </span>
      </div>

      {/* Progress Bar Track */}
      <div className="w-full h-2.5 bg-black/10 rounded-full overflow-hidden relative p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out relative ${
            isFinished
              ? "bg-emerald-500"
              : isError
              ? "bg-red-500"
              : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-sm"
          }`}
          style={{ width: `${Math.max(4, Math.min(100, percent))}%` }}
        >
          {/* Shimmer animation on active upload */}
          {!isFinished && !isError && (
            <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full" />
          )}
        </div>
      </div>

      {/* Subtle Hint */}
      {!compact && !isFinished && !isError && (
        <div className="flex items-center justify-between text-[10px] font-medium opacity-65 mt-2">
          <span>Target: Cloudflare R2 / Server</span>
          <span>{percent < 100 ? "Uploading files..." : "Processing assets..."}</span>
        </div>
      )}
    </div>
  );
};

export default UploadProgressBar;
