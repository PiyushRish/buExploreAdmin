import React, { useState } from "react";
import {
  AlertTriangle, Shield, CheckCircle, XCircle, Clock, Eye,
  Trash2, MessageSquare, Star, User, RefreshCw, Loader2, Filter
} from "lucide-react";
import toast from "react-hot-toast";
import { useReportsQuery, useReportStatsQuery } from "../queries/reportQueries.js";
import { useTakeReportActionMutation } from "../mutations/reportMutation.js";

const REASONS = [
  "ALL",
  "nsfw",
  "spam",
  "hate_speech",
  "harassment",
  "fishy_scam",
  "other",
];

const STATUSES = ["ALL", "pending", "investigating", "resolved", "dismissed"];

const ReportsPage = () => {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [reasonFilter, setReasonFilter] = useState("ALL");
  const [adminNotes, setAdminNotes] = useState("");

  const { data: statsData } = useReportStatsQuery();
  const { data: reportsData, isLoading, refetch } = useReportsQuery({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    reason: reasonFilter === "ALL" ? undefined : reasonFilter,
  });

  const actionMutation = useTakeReportActionMutation();

  const handleAction = async (id, actionType) => {
    try {
      await actionMutation.mutateAsync({
        id,
        data: {
          action: actionType,
          adminNotes: adminNotes || `Action taken: ${actionType}`,
        },
      });
      toast.success(`Report marked as ${actionType}!`);
      setAdminNotes("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to take action on report");
    }
  };

  const stats = statsData?.data || {
    totalReports: 0,
    pending: 0,
    investigating: 0,
    resolved: 0,
    dismissed: 0,
  };

  const reports = reportsData?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 shadow-xs">
              <Shield size={24} />
            </span>
            Content Moderation & Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review community flagged place reviews and testimonials for spam, harassment, fishy scams, or NSFW content.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 self-start sm:self-auto transition"
          title="Refresh reports"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold uppercase text-slate-400">Total Flagged</p>
          <p className="text-xl font-black text-slate-800 mt-1">{stats.totalReports}</p>
        </div>
        <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 shadow-xs">
          <p className="text-[11px] font-bold uppercase text-amber-700">Pending Review</p>
          <p className="text-xl font-black text-amber-900 mt-1">{stats.pending}</p>
        </div>
        <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-200/80 shadow-xs">
          <p className="text-[11px] font-bold uppercase text-indigo-700">Investigating</p>
          <p className="text-xl font-black text-indigo-900 mt-1">{stats.investigating}</p>
        </div>
        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 shadow-xs">
          <p className="text-[11px] font-bold uppercase text-emerald-700">Resolved / Deleted</p>
          <p className="text-xl font-black text-emerald-900 mt-1">{stats.resolved}</p>
        </div>
        <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold uppercase text-slate-500">Dismissed</p>
          <p className="text-xl font-black text-slate-700 mt-1">{stats.dismissed}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 shrink-0">Status:</span>
          {STATUSES.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition whitespace-nowrap ${
                statusFilter === st ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Reason:</span>
          <select
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-xl font-semibold focus:outline-hidden"
          >
            {REASONS.map((r) => (
              <option key={r} value={r}>
                {r === "ALL" ? "All Reasons" : r.replace("_", " ").toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reports List */}
      {isLoading ? (
        <div className="py-20 flex justify-center text-slate-400">
          <Loader2 size={32} className="animate-spin text-amber-500" />
        </div>
      ) : reports.length === 0 ? (
        <div className="py-16 text-center bg-white border border-dashed border-slate-200 rounded-3xl p-8">
          <CheckCircle size={40} className="mx-auto mb-3 text-emerald-400" />
          <h3 className="text-base font-bold text-slate-800">All clear! No pending reports</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Community reports on testimonials or place reviews will show up here for administrative review.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const isResolved = report.status === "resolved";
            const isDismissed = report.status === "dismissed";
            return (
              <div
                key={report._id}
                className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        report.reason === "nsfw"
                          ? "bg-rose-100 text-rose-700"
                          : report.reason === "fishy_scam"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {report.reason.replace("_", " ")}
                    </span>

                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600">
                      Target: {report.targetType}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        report.status === "pending"
                          ? "bg-amber-500 text-white"
                          : report.status === "resolved"
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-medium">
                    <span className="font-bold text-slate-900">Reporter:</span> {report.reporter?.name || "Anonymous User"}{" "}
                    {report.details && <span className="text-slate-500 italic">— "{report.details}"</span>}
                  </p>
                </div>

                {/* Moderation Action Buttons */}
                {!isResolved && !isDismissed && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAction(report._id, "dismiss")}
                      disabled={actionMutation.isPending}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleAction(report._id, "soft_delete_content")}
                      disabled={actionMutation.isPending}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                    >
                      Delete Content
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
