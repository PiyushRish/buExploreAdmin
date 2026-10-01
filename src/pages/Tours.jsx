import React, { useState, useEffect } from "react";
import { Compass, Plus, Trash2, X, Eye, Users, Calendar, DollarSign, UserCheck, RefreshCw } from "lucide-react";
import { getAllTours, addTour, deleteTour } from "../api/tours.api";
import toast from "react-hot-toast";

const ToursPage = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTour, setSelectedTour] = useState(null); // Side panel selected tour
  const [showAddModal, setShowAddModal] = useState(false); // Admin test post modal

  const [formData, setFormData] = useState({
    tourPackage: "family",
    numberOfPeople: 2,
    numberOfDays: 3,
    usdBudget: 50,
    rupeeBudget: 4000,
  });

  const fetchTours = async () => {
    setLoading(true);
    try {
      const data = await getAllTours();
      setTours(data.tours || []);
    } catch (err) {
      toast.error("Failed to load tour requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, []);

  const handleCreateTestTour = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        tourPackage: formData.tourPackage,
        numberOfPeople: Number(formData.numberOfPeople),
        numberOfDays: Number(formData.numberOfDays),
        budgetPerDayPerPerson: {
          usd: Number(formData.usdBudget),
          rupee: Number(formData.rupeeBudget),
        },
      };
      await addTour(payload);
      toast.success("Test tour request posted successfully!");
      setShowAddModal(false);
      fetchTours();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post tour");
    }
  };

  const handleDeleteTour = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tour request?")) return;
    try {
      await deleteTour(id);
      toast.success("Tour request deleted");
      if (selectedTour?._id === id) setSelectedTour(null);
      fetchTours();
    } catch (err) {
      toast.error("Failed to delete tour");
    }
  };

  return (
    <div className="relative min-h-[500px]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Compass className="text-indigo-600" size={24} />
            Tour & Trip Requests
          </h2>
          <p className="text-xs text-slate-500">
            Read user tour submissions or create test posts for verification
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTours}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md transition"
          >
            <Plus size={18} />
            Post Test Tour
          </button>
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading tour requests...</div>
      ) : tours.length === 0 ? (
        <div className="py-20 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          No tour requests found. Click "Post Test Tour" to simulate a user request.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tours.map((tour) => (
            <div
              key={tour._id}
              className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white hover:shadow-md ${
                selectedTour?._id === tour._id ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-slate-200"
              }`}
              onClick={() => setSelectedTour(tour)}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {tour.tourPackage} Package
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTour(tour._id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="space-y-2 mb-4 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-indigo-500" />
                  <span><strong>People:</strong> {tour.numberOfPeople} traveler(s)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-indigo-500" />
                  <span><strong>Duration:</strong> {tour.numberOfDays} day(s)</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign size={14} className="text-emerald-500" />
                  <span><strong>Daily Budget:</strong> ₹{tour.budgetPerDayPerPerson?.rupee} / ${tour.budgetPerDayPerPerson?.usd}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">
                  By: {tour.createdBy?.name || "User"}
                </span>
                <span className="text-indigo-600 font-semibold flex items-center gap-1">
                  Read Info <Eye size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── SIDE PANEL SPACE (Slide-over for reading tour details) ── */}
      {selectedTour && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <Compass className="text-indigo-600" size={20} />
                  Tour Detail Inspection
                </h3>
                <button
                  onClick={() => setSelectedTour(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6 text-sm">
                <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100">
                  <p className="text-xs uppercase font-bold text-indigo-600 tracking-wider">Package Type</p>
                  <p className="text-xl font-extrabold text-indigo-950 capitalize">{selectedTour.tourPackage} Tour</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-400 font-medium">Travelers</p>
                    <p className="text-base font-bold text-slate-800">{selectedTour.numberOfPeople} Person(s)</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-400 font-medium">Duration</p>
                    <p className="text-base font-bold text-slate-800">{selectedTour.numberOfDays} Day(s)</p>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <p className="text-xs uppercase font-bold text-emerald-700">Estimated Total Budget</p>
                  <div className="flex justify-between items-baseline mt-1">
                    <span className="text-2xl font-black text-emerald-900">₹{selectedTour.totalBudget?.rupee || (selectedTour.budgetPerDayPerPerson?.rupee * selectedTour.numberOfDays * selectedTour.numberOfPeople)}</span>
                    <span className="text-sm font-semibold text-emerald-700">${selectedTour.totalBudget?.usd || (selectedTour.budgetPerDayPerPerson?.usd * selectedTour.numberOfDays * selectedTour.numberOfPeople)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <p className="text-xs uppercase font-bold text-slate-400">Created By User</p>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                      {selectedTour.createdBy?.name?.[0] || "U"}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{selectedTour.createdBy?.name || "Unknown User"}</p>
                      <p className="text-xs text-slate-500">{selectedTour.createdBy?.email || "No email"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDeleteTour(selectedTour._id)}
              className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold text-sm transition mt-6 flex items-center justify-center gap-2"
            >
              <Trash2 size={16} /> Delete Tour Request
            </button>
          </div>
        </div>
      )}

      {/* ── ADD TEST TOUR MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 text-base">Post Test Tour Plan</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTestTour} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Package Type</label>
                <select
                  value={formData.tourPackage}
                  onChange={(e) => setFormData({ ...formData, tourPackage: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-800"
                >
                  <option value="solo">Solo</option>
                  <option value="family">Family</option>
                  <option value="group">Group</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Number of People</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.numberOfPeople}
                    onChange={(e) => setFormData({ ...formData, numberOfPeople: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Days</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.numberOfDays}
                    onChange={(e) => setFormData({ ...formData, numberOfDays: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Daily Budget (INR ₹)</label>
                  <input
                    type="number"
                    value={formData.rupeeBudget}
                    onChange={(e) => setFormData({ ...formData, rupeeBudget: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Daily Budget (USD $)</label>
                  <input
                    type="number"
                    value={formData.usdBudget}
                    onChange={(e) => setFormData({ ...formData, usdBudget: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
                >
                  Submit Tour Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToursPage;
