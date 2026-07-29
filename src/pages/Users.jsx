import React, { useState, useEffect } from "react";
import { User, Trash2, CheckCircle, RefreshCcw, Activity } from "lucide-react";
import { useUsersQuery } from "../queries/userQueries";
import { useSoftDeleteUserMutation, useRestoreUserMutation } from "../mutations/userMutation";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const Users = () => {
  const [onlyDeleted, setOnlyDeleted] = useState(false);
  const [liveUsers, setLiveUsers] = useState(0);

  const { data, isLoading } = useUsersQuery({ onlyDeleted });

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
      toast.success("User soft deleted successfully.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Action failed");
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreMutation.mutateAsync(id);
      toast.success("User restored successfully.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Action failed");
    }
  };

  const users = data?.users || data?.data || [];

  if (isLoading) {
    return <div className="p-8 font-bold text-center text-gray-500">Loading Users...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-3 sm:px-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-white p-4 sm:p-5 rounded-2xl border shadow-sm">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 flex flex-wrap items-center gap-3">
              User Management
              <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-green-200 uppercase font-black tracking-widest">
                <Activity size={12} className="animate-pulse" /> Live: {liveUsers}
              </span>
            </h1>
            <p className="text-xs text-gray-500 mt-1">Manage registered tourists and users</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-bold flex items-center gap-2 cursor-pointer bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200">
              <input 
                type="checkbox" 
                checked={onlyDeleted} 
                onChange={(e) => setOnlyDeleted(e.target.checked)} 
                className="w-4 h-4"
              />
              Show Only Deleted
            </label>
          </div>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b text-xs uppercase tracking-wider text-gray-500 font-extrabold pb-2">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-400 font-semibold">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${u.isDeleted ? "opacity-60 bg-red-50/20" : ""}`}>
                      <td className="p-4 font-bold text-sm text-gray-900 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                          <User size={14} />
                        </div>
                        {u.name}
                      </td>
                      <td className="p-4 text-sm font-medium text-gray-600">{u.email}</td>
                      <td className="p-4">
                        <span className="text-[10px] font-extrabold uppercase bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                          {u.role || "user"}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.isDeleted ? (
                          <span className="text-[10px] font-extrabold uppercase bg-red-100 text-red-600 px-2 py-1 rounded-md">
                            Deleted
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold uppercase bg-green-100 text-green-600 px-2 py-1 rounded-md flex items-center w-fit gap-1">
                            <CheckCircle size={10} /> Active
                          </span>
                        )}
                      </td>
                      <td className="p-4 flex gap-2 justify-end">
                        {u.isDeleted ? (
                          <button 
                            onClick={() => handleRestore(u._id)}
                            className="bg-green-50 text-green-600 p-2 rounded-xl hover:bg-green-100 transition-colors"
                            title="Restore User"
                          >
                            <RefreshCcw size={16} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleSoftDelete(u._id)}
                            className="bg-red-50 text-red-600 p-2 rounded-xl hover:bg-red-100 transition-colors"
                            title="Soft Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
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
