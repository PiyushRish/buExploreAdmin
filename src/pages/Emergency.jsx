import React, { useState } from "react";
import {
  ShieldAlert, Plus, Phone, Clock, MapPin, Building2, Flame,
  Ambulance, Siren, CheckCircle, AlertCircle, Trash2, Edit, Loader2,
  ExternalLink, Sparkles, X, Activity, Eye, PhoneCall, RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";
import {
  useEmergencyServicesQuery,
} from "../queries/emergencyQueries.js";
import {
  useCreateEmergencyMutation,
  useUpdateEmergencyMutation,
  useDeleteEmergencyMutation,
} from "../mutations/emergencyMutation.js";
import UploadProgressBar from "../components/UploadProgressBar.jsx";
import { uploadMultipleFilesDirectToR2 } from "../utils/r2DirectUpload.js";

const SUBCATEGORIES = [
  { id: "ALL", label: "All Services", icon: ShieldAlert, color: "indigo" },
  { id: "ambulance", label: "Ambulance", icon: Ambulance, color: "rose" },
  { id: "police", label: "Police", icon: Siren, color: "blue" },
  { id: "fireStation", label: "Fire Station", icon: Flame, color: "amber" },
  { id: "hospital", label: "Hospitals", icon: Building2, color: "emerald" },
];

const EmergencyPage = () => {
  const [selectedSubCategory, setSelectedSubCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Form State
  const [form, setForm] = useState({
    title: "",
    subCategory: "ambulance",
    emergencyNumber: "108",
    alternateNumbers: "",
    tollFreeNumber: "",
    is24x7: true,
    liveStatus: "operational",
    description: "",
    address: "",
    area: "",
    city: "Jhansi",
    googleMapsUrl: "",
    facilities: "",
    // Subcategory details
    operatorType: "",
    avgResponseTimeMinutes: "",
    hasOxygenSupport: false,
    hasVentilator: false,
    hasIcu: false,
    hasEmergencyTraumaCenter: false,
    hasBloodBank: false,
    stationCode: "",
    jurisdictionArea: "",
    numFireTenders: "",
  });

  const [photoFiles, setPhotoFiles] = useState([]);

  const { data, isLoading, isError, refetch } = useEmergencyServicesQuery({
    subCategory: selectedSubCategory === "ALL" ? undefined : selectedSubCategory,
    search: search || undefined,
  });

  const createMutation = useCreateEmergencyMutation();
  const updateMutation = useUpdateEmergencyMutation();
  const deleteMutation = useDeleteEmergencyMutation();

  const [isUploadingR2, setIsUploadingR2] = useState(false);
  const isSaving = createMutation.isPending || updateMutation.isPending || isUploadingR2;

  const handleOpenAdd = () => {
    setEditingService(null);
    setForm({
      title: "",
      subCategory: selectedSubCategory === "ALL" ? "ambulance" : selectedSubCategory,
      emergencyNumber: "108",
      alternateNumbers: "",
      tollFreeNumber: "",
      is24x7: true,
      liveStatus: "operational",
      description: "",
      address: "",
      area: "",
      city: "Jhansi",
      googleMapsUrl: "",
      facilities: "",
      operatorType: "",
      avgResponseTimeMinutes: "",
      hasOxygenSupport: false,
      hasVentilator: false,
      hasIcu: false,
      hasEmergencyTraumaCenter: false,
      hasBloodBank: false,
      stationCode: "",
      jurisdictionArea: "",
      numFireTenders: "",
    });
    setPhotoFiles([]);
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingService(item);
    setForm({
      title: item.title || "",
      subCategory: item.subCategory || "ambulance",
      emergencyNumber: item.emergencyNumber || "",
      alternateNumbers: Array.isArray(item.alternateNumbers) ? item.alternateNumbers.join(", ") : "",
      tollFreeNumber: item.tollFreeNumber || "",
      is24x7: item.is24x7 ?? true,
      liveStatus: item.liveStatus || "operational",
      description: item.description || "",
      address: item.location?.address || "",
      area: item.location?.area || "",
      city: item.location?.city || "Jhansi",
      googleMapsUrl: item.location?.googleMapsUrl || "",
      facilities: Array.isArray(item.facilities) ? item.facilities.join(", ") : "",
      operatorType: item.ambulanceDetails?.operatorType || "",
      avgResponseTimeMinutes: item.ambulanceDetails?.avgResponseTimeMinutes || "",
      hasOxygenSupport: item.ambulanceDetails?.hasOxygenSupport || false,
      hasVentilator: item.ambulanceDetails?.hasVentilator || false,
      hasIcu: item.hospitalDetails?.hasIcu || false,
      hasEmergencyTraumaCenter: item.hospitalDetails?.hasEmergencyTraumaCenter || false,
      hasBloodBank: item.hospitalDetails?.hasBloodBank || false,
      stationCode: item.policeDetails?.stationCode || "",
      jurisdictionArea: item.policeDetails?.jurisdictionArea || "",
      numFireTenders: item.fireStationDetails?.numFireTenders || "",
    });
    setPhotoFiles([]);
    setShowModal(true);
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete emergency service '${title}'?`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Emergency service deleted successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete emergency service");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Service Title is required");
    if (!form.emergencyNumber.trim()) return toast.error("Emergency Number is required");

    try {
      let uploadedAssets = [];
      if (photoFiles.length > 0) {
        setIsUploadingR2(true);
        uploadedAssets = await uploadMultipleFilesDirectToR2(photoFiles, "services/emergency", "image");
      }

      const payload = {
        title: form.title.trim(),
        subCategory: form.subCategory,
        emergencyNumber: form.emergencyNumber.trim(),
        is24x7: form.is24x7,
        liveStatus: form.liveStatus,
        description: form.description,
        ...(form.tollFreeNumber ? { tollFreeNumber: form.tollFreeNumber } : {}),
        alternateNumbers: form.alternateNumbers
          ? form.alternateNumbers.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        facilities: form.facilities
          ? form.facilities.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        location: {
          address: form.address,
          area: form.area,
          city: form.city,
          googleMapsUrl: form.googleMapsUrl,
        },
        ...(form.subCategory === "ambulance" ? {
          ambulanceDetails: {
            operatorType: form.operatorType || "Government / Private",
            avgResponseTimeMinutes: Number(form.avgResponseTimeMinutes) || undefined,
            hasOxygenSupport: form.hasOxygenSupport,
            hasVentilator: form.hasVentilator,
          }
        } : {}),
        ...(form.subCategory === "hospital" ? {
          hospitalDetails: {
            hasIcu: form.hasIcu,
            hasEmergencyTraumaCenter: form.hasEmergencyTraumaCenter,
            hasBloodBank: form.hasBloodBank,
          }
        } : {}),
        ...(form.subCategory === "police" ? {
          policeDetails: {
            stationCode: form.stationCode,
            jurisdictionArea: form.jurisdictionArea,
          }
        } : {}),
        ...(form.subCategory === "fireStation" ? {
          fireStationDetails: {
            numFireTenders: Number(form.numFireTenders) || 0,
          }
        } : {}),
        ...(editingService
          ? (uploadedAssets.length > 0 ? { photos: [...(editingService.photos || []), ...uploadedAssets] } : {})
          : { photos: uploadedAssets }
        ),
      };

      if (editingService) {
        await updateMutation.mutateAsync({ id: editingService._id, formData: payload });
        toast.success("Emergency service updated successfully!");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Emergency service created successfully!");
      }
      setShowModal(false);
      setPhotoFiles([]);
      setIsUploadingR2(false);
    } catch (err) {
      setIsUploadingR2(false);
      toast.error(err?.response?.data?.message || err?.message || "Failed to save emergency service");
    }
  };

  const services = data?.data || data?.emergencyServices || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 shadow-xs">
              <ShieldAlert size={24} />
            </span>
            24/7 Emergency Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage instant-dispatch response services (Ambulance, Police, Fire, Hospitals) with 1-tap call analytics.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="Refresh directory"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white rounded-xl font-bold text-sm shadow-md shadow-rose-500/20 transition cursor-pointer"
          >
            <Plus size={18} />
            Add Emergency Service
          </button>
        </div>
      </div>

      {/* Subcategory Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {SUBCATEGORIES.map((tab) => {
          const Icon = tab.icon;
          const isSelected = selectedSubCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedSubCategory(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                isSelected
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                  : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
              }`}
            >
              <Icon size={14} className={isSelected ? "text-rose-400" : "text-slate-400"} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <input
          type="text"
          placeholder="Search emergency services by title, phone, or area..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent border-none text-xs sm:text-sm focus:outline-hidden text-slate-800 placeholder-slate-400"
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 size={36} className="animate-spin text-rose-500 mb-3" />
          <p className="text-sm font-semibold">Loading emergency services...</p>
        </div>
      ) : isError ? (
        <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center text-rose-700">
          <AlertCircle size={32} className="mx-auto mb-2 text-rose-500" />
          <p className="font-bold">Failed to load emergency services.</p>
          <button onClick={() => refetch()} className="mt-3 text-xs underline font-bold">Try Again</button>
        </div>
      ) : services.length === 0 ? (
        <div className="py-16 text-center bg-white border border-dashed border-slate-200 rounded-3xl p-8">
          <ShieldAlert size={40} className="mx-auto mb-3 text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">No emergency services found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Click the "Add Emergency Service" button above to add vital ambulance, police, or hospital contacts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((item) => {
            const photoUrl = item.photos?.[0]?.url || item.photos?.[0] || "";
            return (
              <div
                key={item._id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col"
              >
                {/* Card Header & Photo */}
                <div className="relative h-44 bg-slate-900 overflow-hidden">
                  {photoUrl ? (
                    <img src={photoUrl} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-rose-950 via-slate-900 to-indigo-950 text-rose-300/60 p-4">
                      <ShieldAlert size={48} className="mb-2" />
                      <span className="text-xs uppercase font-mono tracking-widest">{item.subCategory}</span>
                    </div>
                  )}

                  {/* 24x7 & Status Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                    {item.is24x7 && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-sm flex items-center gap-1">
                        <Clock size={10} /> 24/7 Response
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.liveStatus === "operational"
                          ? "bg-emerald-500/90 text-white backdrop-blur"
                          : "bg-amber-500 text-white"
                      }`}
                    >
                      {item.liveStatus}
                    </span>
                  </div>

                  {/* Subcategory Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-black/60 backdrop-blur text-white border border-white/20">
                      {item.subCategory}
                    </span>
                  </div>

                  {/* 1-Tap Dial Overlay Bar */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent p-3 pt-6 flex items-center justify-between text-white">
                    <a
                      href={`tel:${item.emergencyNumber}`}
                      className="flex items-center gap-2 font-black text-lg text-emerald-400 hover:text-emerald-300 transition"
                      title="Tap to Call"
                    >
                      <PhoneCall size={18} className="animate-pulse" />
                      {item.emergencyNumber}
                    </a>

                    <div className="flex items-center gap-1 text-[11px] text-slate-300 font-mono" title="Total User Calls">
                      <Phone size={12} className="text-rose-400" />
                      <span>{item.callCount || 0} calls</span>
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-black text-slate-900 text-base leading-snug line-clamp-1">{item.title}</h3>
                    {item.location?.address && (
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                        <MapPin size={12} className="shrink-0 text-slate-400" />
                        <span className="truncate">{item.location.address}, {item.location.city}</span>
                      </p>
                    )}
                  </div>

                  {/* Subcategory Specific Details */}
                  {item.subCategory === "ambulance" && item.ambulanceDetails && (
                    <div className="p-2.5 rounded-xl bg-rose-50/50 border border-rose-100/80 text-[11px] text-slate-700 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Operator:</span>
                        <span className="font-bold">{item.ambulanceDetails.operatorType || "Govt (108)"}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1 border-t border-rose-100">
                        {item.ambulanceDetails.hasOxygenSupport && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">O₂ Oxygen</span>
                        )}
                        {item.ambulanceDetails.hasVentilator && (
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/70 px-1.5 py-0.5 rounded">Ventilator</span>
                        )}
                      </div>
                    </div>
                  )}

                  {item.subCategory === "hospital" && item.hospitalDetails && (
                    <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-bold">
                      {item.hospitalDetails.hasIcu && <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg border border-indigo-200">ICU</span>}
                      {item.hospitalDetails.hasEmergencyTraumaCenter && <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-lg border border-rose-200">Trauma Center</span>}
                      {item.hospitalDetails.hasBloodBank && <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg border border-emerald-200">Blood Bank</span>}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Eye size={12} /> {item.views || 0} views
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                        title="Edit Service"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id, item.title)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Service"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Creation / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100">
            {/* Header */}
            <div className="sticky top-0 z-20 flex justify-between items-center px-6 py-4 bg-white/95 backdrop-blur border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    {editingService ? "Update Emergency Service" : "Add Emergency Service"}
                  </h2>
                  <p className="text-xs text-slate-500">Configure 24/7 hotline numbers and facility equipment</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <form id="emergency-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Category & Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Service Type *</label>
                  <select
                    value={form.subCategory}
                    onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="ambulance">Ambulance Service</option>
                    <option value="police">Police Station / Control Room</option>
                    <option value="fireStation">Fire Brigade / Station</option>
                    <option value="hospital">Hospital & Trauma Center</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Primary Emergency Dial *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 108, 112, 101, +91 9876543210"
                    value={form.emergencyNumber}
                    onChange={(e) => setForm({ ...form, emergencyNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-rose-600 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Live Status</label>
                  <select
                    value={form.liveStatus}
                    onChange={(e) => setForm({ ...form, liveStatus: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="operational">Operational</option>
                    <option value="busy">High Volume / Busy</option>
                    <option value="maintenance">Under Maintenance</option>
                  </select>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Service Name / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sanjeevani 108 Emergency Ambulance Jhansi"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Overview Description</label>
                  <textarea
                    rows={2}
                    placeholder="Brief details regarding coverage, response speed, and emergency facilities..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Alternate & Toll-Free Phone Numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alternate Numbers (comma separated)</label>
                  <input
                    type="text"
                    placeholder="0510-2444108, +91 9988776655"
                    value={form.alternateNumbers}
                    onChange={(e) => setForm({ ...form, alternateNumbers: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Toll-Free Number</label>
                  <input
                    type="text"
                    placeholder="1800-XXX-XXXX"
                    value={form.tollFreeNumber}
                    onChange={(e) => setForm({ ...form, tollFreeNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Location Details */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                  <MapPin size={14} className="text-rose-500" /> Location & Dispatch Coordinates
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Street Address / Station Location"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="City (Default: Jhansi)"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      placeholder="Google Maps Navigation URL"
                      value={form.googleMapsUrl}
                      onChange={(e) => setForm({ ...form, googleMapsUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Subcategory Details Section */}
              {form.subCategory === "ambulance" && (
                <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-100 space-y-3">
                  <h4 className="text-xs font-black uppercase text-rose-800 tracking-wider flex items-center gap-1.5">
                    <Ambulance size={14} /> Ambulance Equipment & Support
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Operator Type</label>
                      <input
                        type="text"
                        placeholder="Government (108) or Private Hospital"
                        value={form.operatorType}
                        onChange={(e) => setForm({ ...form, operatorType: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Avg Response Speed (Mins)</label>
                      <input
                        type="number"
                        placeholder="e.g. 15"
                        value={form.avgResponseTimeMinutes}
                        onChange={(e) => setForm({ ...form, avgResponseTimeMinutes: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden"
                      />
                    </div>
                    <div className="flex items-center gap-4 sm:col-span-2 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                        <input
                          type="checkbox"
                          checked={form.hasOxygenSupport}
                          onChange={(e) => setForm({ ...form, hasOxygenSupport: e.target.checked })}
                          className="w-4 h-4 text-rose-600 rounded"
                        />
                        Oxygen Cylinder Available
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                        <input
                          type="checkbox"
                          checked={form.hasVentilator}
                          onChange={(e) => setForm({ ...form, hasVentilator: e.target.checked })}
                          className="w-4 h-4 text-rose-600 rounded"
                        />
                        Advanced Ventilator Support
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {form.subCategory === "hospital" && (
                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-3">
                  <h4 className="text-xs font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1.5">
                    <Building2 size={14} /> Hospital Critical Care Facilities
                  </h4>
                  <div className="flex items-center gap-5 flex-wrap pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.hasIcu}
                        onChange={(e) => setForm({ ...form, hasIcu: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      ICU Beds Operational
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.hasEmergencyTraumaCenter}
                        onChange={(e) => setForm({ ...form, hasEmergencyTraumaCenter: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      Trauma Center 24/7
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.hasBloodBank}
                        onChange={(e) => setForm({ ...form, hasBloodBank: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      Blood Bank Attached
                    </label>
                  </div>
                </div>
              )}

              {/* Photos Upload Dropzone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Station Photos (Cloudflare R2)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setPhotoFiles(Array.from(e.target.files || []))}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 cursor-pointer"
                />
              </div>

              {/* Upload Progress Bar for feedback */}
              {isSaving && (
                <div className="pt-2">
                  <UploadProgressBar isUploading={isSaving} />
                </div>
              )}
            </form>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 z-20 flex justify-between items-center px-6 py-4 bg-white/95 backdrop-blur border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="emergency-form"
                disabled={isSaving}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-500/20 transition disabled:bg-rose-300 flex items-center gap-2 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Uploading Assets & Saving...</span>
                  </>
                ) : (
                  <span>{editingService ? "Update Emergency Service" : "Publish Emergency Service"}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyPage;
