import React, { useState } from "react";
import { ArrowLeft, Save, Trash2, Eye, MousePointer, ExternalLink, Play, Pause } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useDeleteAdMutation, useUpdateAdStatusMutation } from "../mutations/adsMutation";
import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";

const STATUS_OPTIONS = ["active", "paused", "draft", "scheduled", "ended"];

const AdDetails = ({ ad, onBack }) => {
  const [status, setStatus] = useState(ad.status || "draft");

  const updateStatusMutation = useUpdateAdStatusMutation();
  const deleteAdMutation = useDeleteAdMutation();

  const { data: statsData } = useQuery({
    queryKey: ["adStats", ad._id],
    queryFn: async () => {
      const res = await axiosClient.get(`/advertisment/stats/${ad._id}`);
      return res.data;
    },
  });

  const handleStatusSave = () => {
    updateStatusMutation.mutate(
      { adId: ad._id, status },
      { onSuccess: () => toast.success(`Ad status updated to ${status}`) }
    );
  };

  const handleDelete = () => {
    if (window.confirm(`Permanently purge campaign "${ad.name}" and all analytics?`)) {
      deleteAdMutation.mutate(ad._id, {
        onSuccess: () => {
          toast.error("Ad campaign purged");
          onBack();
        },
      });
    }
  };

  const stats = statsData?.stats || { impressions: ad.impressions || 0, clicks: ad.clicks || 0, ctr: "0.0" };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      <div className="h-16 border-b px-8 flex items-center justify-between bg-white sticky top-0 z-20">
        <button onClick={onBack} className="flex items-center text-gray-600 font-semibold hover:text-gray-900">
          <ArrowLeft size={18} className="mr-2" /> Back to Campaigns
        </button>

        <div className="flex items-center gap-3">
          <button onClick={handleDelete} className="flex items-center px-4 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-xs border border-red-200">
            <Trash2 size={14} className="mr-1.5" /> Permanent Delete Campaign
          </button>

          <button onClick={handleStatusSave} disabled={updateStatusMutation.isPending} className="flex items-center px-6 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-md">
            <Save size={14} className="mr-1.5" /> Save Status
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6 max-w-5xl mx-auto w-full">
        {/* ANALYTICS STATS CARDS */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border shadow-sm">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Total Impressions</span>
            <div className="text-3xl font-black text-gray-900 mt-1 flex items-center gap-2">
              <Eye size={22} className="text-purple-600" /> {stats.impressions || 0}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border shadow-sm">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Total Clicks</span>
            <div className="text-3xl font-black text-gray-900 mt-1 flex items-center gap-2">
              <MousePointer size={22} className="text-blue-600" /> {stats.clicks || 0}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border shadow-sm">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Click-Through Rate (CTR)</span>
            <div className="text-3xl font-black text-purple-600 mt-1">{stats.ctr || "0.0"}%</div>
          </div>
        </div>

        {/* CAMPAIGN METADATA */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <h1 className="text-2xl font-black text-gray-900">{ad.name}</h1>
              <p className="text-xs text-purple-600 font-bold uppercase">Placement: {ad.placement}</p>
            </div>

            <div className="w-48">
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-2 border rounded-xl font-bold bg-white capitalize">
                {STATUS_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs font-bold text-gray-400 block">Advertiser</span>
              <span className="font-bold text-gray-800">{ad.advertiser?.advertiserName || "In-House"}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-gray-400 block">Priority Weight</span>
              <span className="font-bold text-gray-800">{ad.priority || 1}</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-gray-400 block">Headline</span>
            <p className="font-bold text-gray-900 text-base">{ad.content?.headline || "N/A"}</p>
          </div>

          <div>
            <span className="text-xs font-bold text-gray-400 block">Body Copy</span>
            <p className="text-gray-700 text-sm leading-relaxed">{ad.content?.bodyText || "N/A"}</p>
          </div>

          {ad.content?.linkUrl && (
            <div>
              <span className="text-xs font-bold text-gray-400 block">Target Link</span>
              <a href={ad.content.linkUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline">
                {ad.content.linkUrl} <ExternalLink size={14} />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdDetails;