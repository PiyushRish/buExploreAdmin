import React, { useState, useEffect } from "react";
import { User, Trash2, CheckCircle, RefreshCcw, Activity, Clock, ShieldAlert } from "lucide-react";
import { useUsersQuery } from "../queries/userQueries";
import { useSoftDeleteUserMutation, useRestoreUserMutation } from "../mutations/userMutation";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const Users = () => {
  const [filterTab, setFilterTab] = useState("all"); // "all", "active", "deleted"
  const [liveUsers, setLiveUsers] = useState(0);

  const { data, isLoading } = useUsersQuery({ includeDeleted: true });

  useEffect(() => {
    const socket = io("http://localhost:5500");
    socket.emit("getLiveUsers");
    socket.on("userCountLatest", (count) => {
      setLiveUsers(count);
    });
    return () => socket.disconnect();
  }, []);
  
  const deleteMutation = useSoftDeleteUserMutation();
  const restoreMutation = useRestoreUserMutation();

  const handleSoftDelete = async (id) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("User flagged for deletion (30-day grace period started).");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Action failed");
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreMutation.mutateAsync(id);
      toast.success("User account restored successfully.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Action failed");
    }
  };

  const rawUsers = data?.users || data?.data || [];

  const filteredUsers = rawUsers.filter((u) => {
    if (filterTab === "active") return !u.isDeleted;
    if (filterTab === "deleted") return u.isDeleted;
    return true;
  });

  const getRemainingDays = (deletedAt) => {
    if (!deletedAt) return 30;
    const deletedDate = new Date(deletedAt).getTime();
    const scheduledDate = deletedDate + 30 * 24 * 60 * 60 * 1000;
    const diffMs = scheduledDate - Date.now();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  };

  if (isLoading) {
    return <div className="p-8 font-bold text-center text-gray-500">Loading Users...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-3 sm:px-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex flex-wrap items-center gap-3">
              User Management
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full flex items-center gap-1.5 font-bold border border-emerald-200 uppercase tracking-wider">
                <Activity size={12} className="animate-pulse" /> Live: {liveUsers}
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">Manage platform tourists, user credentials & 30-day soft-deletion grace period</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setFilterTab("all")}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                filterTab === "all" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Users ({rawUsers.length})
            </button>
            <button
              onClick={() => setFilterTab("active")}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                filterTab === "active" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Active ({rawUsers.filter(u => !u.isDeleted).length})
            </button>
            <button
              onClick={() => setFilterTab("deleted")}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                filterTab === "deleted" ? "bg-amber-500 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Scheduled Delete ({rawUsers.filter(u => u.isDeleted).length})
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-extrabold">
                  <th className="p-4">User</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status & Grace Period</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-400 font-semibold">
                      No users match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const remainingDays = u.isDeleted ? getRemainingDays(u.deletedAt) : null;

                    return (
                      <tr key={u._id} className={`hover:bg-slate-50 transition-colors ${u.isDeleted ? "bg-amber-50/30" : ""}`}>
                        <td className="p-4 font-bold text-sm text-slate-900">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black">
                              <User size={16} />
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-900">{u.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">ID: {u._id}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 text-xs font-semibold text-slate-600">
                          <p>{u.email || "No email"}</p>
                          <p className="text-[11px] text-slate-400">{u.phoneNumber || "No phone"}</p>
                        </td>

                        <td className="p-4">
                          <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
                            {u.role || "user"}
                          </span>
                        </td>

                        <td className="p-4">
                          {u.isDeleted ? (
                            <div className="space-y-1">
                              <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-800 px-2.5 py-1 rounded-md border border-amber-200 inline-flex items-center gap-1">
                                <Clock size={11} className="animate-spin" /> Scheduled Deletion
                              </span>
                              <p className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                                <ShieldAlert size={12} /> Grace: {remainingDays} {remainingDays === 1 ? "day" : "days"} remaining
                              </p>
                              {u.deletedAt && (
                                <p className="text-[10px] text-slate-400">
                                  Flagged: {new Date(u.deletedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-200 inline-flex items-center gap-1">
                              <CheckCircle size={11} /> Active
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-right">
                          {u.isDeleted ? (
                            <button 
                              onClick={() => handleRestore(u._id)}
                              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm"
                              title="Restore User Account"
                            >
                              <RefreshCcw size={14} /> Restore Account
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleSoftDelete(u._id)}
                              className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
                              title="Schedule 30-Day Soft Delete"
                            >
                              <Trash2 size={14} /> Flag Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
