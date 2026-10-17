import React, { useState } from "react";
import {
  Layers, Plus, Trash2, Edit, Loader2, Sparkles, X, Check,
  Eye, MousePointerClick, RefreshCw, Filter, FileCode, CheckCircle2,
  AlertCircle, Tag, Settings, ArrowRight, ShieldCheck, ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";
import {
  useServiceTemplatesQuery,
  useCustomServicesQuery,
} from "../queries/serviceTemplateQueries.js";
import {
  useCreateServiceTemplateMutation,
  useUpdateServiceTemplateMutation,
  useDeleteServiceTemplateMutation,
  useSeedDefaultTemplatesMutation,
  useCreateCustomServiceMutation,
  useUpdateCustomServiceMutation,
  useDeleteCustomServiceMutation,
} from "../mutations/serviceTemplateMutation.js";
import UploadProgressBar from "../components/UploadProgressBar.jsx";

const CATEGORIES = [
  "restaurants/bars",
  "hotel/resorts",
  "vehicle",
  "emergency",
  "events",
  "shopping",
  "guide/travel agency",
  "others",
];

const FIELD_TYPES = [
  { id: "text", label: "Single Text" },
  { id: "number", label: "Number" },
  { id: "boolean", label: "Yes / No (Boolean)" },
  { id: "multiselect", label: "Multi-Select (Tags / List)" },
  { id: "textarea", label: "Long Paragraph" },
  { id: "time_range", label: "Operating Time Range" },
];

const ServiceTemplatesPage = () => {
  const [activeTab, setActiveTab] = useState("templates"); // "templates" | "custom_listings"
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [search, setSearch] = useState("");

  // ==========================================
  // Template Modal State
  // ==========================================
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({
    templateName: "",
    category: "restaurants/bars",
    subService: "",
    description: "",
    icon: "layers",
    fields: [],
  });

  // ==========================================
  // Custom Listing Modal State
  // ==========================================
  const [showListingModal, setShowListingModal] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [listingForm, setListingForm] = useState({
    templateId: "",
    title: "",
    category: "restaurants/bars",
    subService: "cafe",
    status: "published",
    description: "",
    phone: "",
    email: "",
    address: "",
    city: "Jhansi",
    customDetails: {},
    tags: "",
  });
  const [customFieldsList, setCustomFieldsList] = useState([]); // Array of { key, label, type, value }
  const [photoFiles, setPhotoFiles] = useState([]);

  // Queries
  const {
    data: templatesData,
    isLoading: isTemplatesLoading,
    refetch: refetchTemplates,
  } = useServiceTemplatesQuery({
    category: selectedCategory === "ALL" ? undefined : selectedCategory,
    search: search || undefined,
  });

  const {
    data: listingsData,
    isLoading: isListingsLoading,
    refetch: refetchListings,
  } = useCustomServicesQuery({
    category: selectedCategory === "ALL" ? undefined : selectedCategory,
    search: search || undefined,
  });

  // Mutations
  const createTemplateMutation = useCreateServiceTemplateMutation();
  const updateTemplateMutation = useUpdateServiceTemplateMutation();
  const deleteTemplateMutation = useDeleteServiceTemplateMutation();
  const seedTemplatesMutation = useSeedDefaultTemplatesMutation();

  const createListingMutation = useCreateCustomServiceMutation();
  const updateListingMutation = useUpdateCustomServiceMutation();
  const deleteListingMutation = useDeleteCustomServiceMutation();

  const isSavingListing = createListingMutation.isPending || updateListingMutation.isPending;
  const isSavingTemplate = createTemplateMutation.isPending || updateTemplateMutation.isPending;

  // ==========================================
  // Handlers: Seed Defaults
  // ==========================================
  const handleSeedDefaults = async () => {
    if (!window.confirm("Seed default production templates for Cafe, Pub, Vehicle Rental, and Hospitals?")) return;
    try {
      const res = await seedTemplatesMutation.mutateAsync();
      toast.success(res?.message || "Default templates seeded successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to seed default templates");
    }
  };

  // ==========================================
  // Handlers: Subservice Template
  // ==========================================
  const handleOpenAddTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm({
      templateName: "",
      category: selectedCategory === "ALL" ? "restaurants/bars" : selectedCategory,
      subService: "",
      description: "",
      icon: "layers",
      fields: [
        { fieldKey: "amenities", label: "Special Amenities", fieldType: "multiselect", defaultValue: [] },
        { fieldKey: "openingHours", label: "Opening Hours", fieldType: "text", defaultValue: "09:00 AM - 10:00 PM" },
      ],
    });
    setShowTemplateModal(true);
  };

  const handleAddFieldToTemplate = () => {
    setTemplateForm((prev) => ({
      ...prev,
      fields: [
        ...prev.fields,
        {
          fieldKey: `field_${Date.now()}`,
          label: "New Field Label",
          fieldType: "text",
          defaultValue: "",
          required: false,
        },
      ],
    }));
  };

  const handleRemoveFieldFromTemplate = (index) => {
    setTemplateForm((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    if (!templateForm.templateName.trim()) return toast.error("Template Name is required");
    if (!templateForm.subService.trim()) return toast.error("SubService slug is required (e.g. cafe, pub)");

    try {
      if (editingTemplate) {
        await updateTemplateMutation.mutateAsync({ id: editingTemplate._id, data: templateForm });
        toast.success("Template updated successfully!");
      } else {
        await createTemplateMutation.mutateAsync(templateForm);
        toast.success("Template created successfully!");
      }
      setShowTemplateModal(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save template");
    }
  };

  const handleDeleteTemplate = async (id, name) => {
    if (!window.confirm(`Delete template '${name}'?`)) return;
    try {
      await deleteTemplateMutation.mutateAsync(id);
      toast.success("Template deleted successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete template");
    }
  };

  // ==========================================
  // Handlers: Dynamic Custom Listings
  // ==========================================
  const handleOpenAddListing = (baseTemplate = null) => {
    setEditingListing(null);

    // Initial fields from template
    const templateFields = baseTemplate?.fields || [];
    const initialCustomFields = templateFields.map((f) => ({
      key: f.fieldKey,
      label: f.label,
      type: f.fieldType,
      value: f.defaultValue !== undefined ? f.defaultValue : "",
    }));

    setCustomFieldsList(initialCustomFields);

    setListingForm({
      templateId: baseTemplate?._id || "",
      title: "",
      category: baseTemplate?.category || "restaurants/bars",
      subService: baseTemplate?.subService || "cafe",
      status: "published",
      description: "",
      phone: "",
      email: "",
      address: "",
      city: "Jhansi",
      customDetails: {},
      tags: baseTemplate ? baseTemplate.subService : "",
    });

    setPhotoFiles([]);
    setShowListingModal(true);
  };

  const handleTemplateSelection = (templateId) => {
    const templates = templatesData?.data || [];
    const t = templates.find((item) => item._id === templateId);
    if (!t) return;

    setListingForm((prev) => ({
      ...prev,
      templateId: t._id,
      category: t.category,
      subService: t.subService,
    }));

    const fields = (t.fields || []).map((f) => ({
      key: f.fieldKey,
      label: f.label,
      type: f.fieldType,
      value: f.defaultValue !== undefined ? f.defaultValue : "",
    }));

    setCustomFieldsList(fields);
  };

  const handleAddDynamicField = () => {
    setCustomFieldsList((prev) => [
      ...prev,
      {
        key: `custom_${Date.now()}`,
        label: "Custom Attribute",
        type: "text",
        value: "",
      },
    ]);
  };

  const handleRemoveDynamicField = (index) => {
    setCustomFieldsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveListing = async (e) => {
    e.preventDefault();
    if (!listingForm.title.trim()) return toast.error("Service Title is required");

    // Package dynamic fields into a clean customDetails object
    const customDetails = {};
    customFieldsList.forEach((item) => {
      if (item.key) {
        let val = item.value;
        if (item.type === "number") val = Number(val) || 0;
        if (item.type === "boolean") val = val === true || val === "true";
        if (item.type === "multiselect" && typeof val === "string") {
          val = val.split(",").map((s) => s.trim()).filter(Boolean);
        }
        customDetails[item.key] = val;
      }
    });

    const formData = new FormData();
    formData.append("title", listingForm.title);
    formData.append("category", listingForm.category);
    formData.append("subService", listingForm.subService);
    formData.append("status", listingForm.status);
    formData.append("description", listingForm.description);

    if (listingForm.templateId) {
      formData.append("templateId", listingForm.templateId);
    }

    formData.append(
      "contact",
      JSON.stringify({
        phone: listingForm.phone,
        email: listingForm.email,
      })
    );

    formData.append(
      "location",
      JSON.stringify({
        address: listingForm.address,
        city: listingForm.city,
      })
    );

    formData.append("customDetails", JSON.stringify(customDetails));

    if (listingForm.tags) {
      const tagsArr = listingForm.tags.split(",").map((s) => s.trim()).filter(Boolean);
      formData.append("tags", JSON.stringify(tagsArr));
    }

    photoFiles.forEach((file) => {
      formData.append("ServicePhotos", file);
    });

    try {
      if (editingListing) {
        await updateListingMutation.mutateAsync({ id: editingListing._id, formData });
        toast.success("Custom service updated successfully!");
      } else {
        await createListingMutation.mutateAsync(formData);
        toast.success("Custom service created & published successfully!");
      }
      setShowListingModal(false);
      setPhotoFiles([]);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save listing");
    }
  };

  const handleDeleteListing = async (id, title) => {
    if (!window.confirm(`Delete listing '${title}'?`)) return;
    try {
      await deleteListingMutation.mutateAsync(id);
      toast.success("Listing deleted successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete listing");
    }
  };

  const templates = templatesData?.data || [];
  const listings = listingsData?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs">
              <Layers size={24} />
            </span>
            Service Templates & Dynamic Builder
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Build custom schemas for any subservice (cafes, pubs, rentals, hospitals), instantiate listings, and add or remove fields dynamically.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleSeedDefaults}
            disabled={seedTemplatesMutation.isPending}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-xs transition cursor-pointer"
            title="Seed built-in starter templates"
          >
            {seedTemplatesMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} className="text-amber-400" />}
            Seed Defaults
          </button>

          {activeTab === "templates" ? (
            <button
              onClick={handleOpenAddTemplate}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-500/20 transition cursor-pointer"
            >
              <Plus size={16} /> Create Template
            </button>
          ) : (
            <button
              onClick={() => handleOpenAddListing()}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-500/20 transition cursor-pointer"
            >
              <Plus size={16} /> Publish Listing
            </button>
          )}
        </div>
      </div>

      {/* Main Mode Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab("templates")}
            className={`pb-3 text-xs sm:text-sm font-black transition relative cursor-pointer ${
              activeTab === "templates" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-400 hover:text-slate-700"
            }`}
          >
            Subservice Templates ({templates.length})
          </button>
          <button
            onClick={() => setActiveTab("custom_listings")}
            className={`pb-3 text-xs sm:text-sm font-black transition relative cursor-pointer ${
              activeTab === "custom_listings" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-400 hover:text-slate-700"
            }`}
          >
            Published Custom Listings ({listings.length})
          </button>
        </div>

        <button
          onClick={() => (activeTab === "templates" ? refetchTemplates() : refetchListings())}
          className="p-1.5 text-slate-400 hover:text-slate-600 mb-2"
          title="Refresh"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedCategory === "ALL" ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === cat ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search by title, subservice, or key..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden w-full sm:w-64"
        />
      </div>

      {/* ============================================================ */}
      {/* TAB 1: SUBSERVICE TEMPLATES */}
      {/* ============================================================ */}
      {activeTab === "templates" && (
        <>
          {isTemplatesLoading ? (
            <div className="py-20 flex justify-center text-slate-400">
              <Loader2 size={32} className="animate-spin text-indigo-500" />
            </div>
          ) : templates.length === 0 ? (
            <div className="py-16 text-center bg-white border border-dashed border-slate-200 rounded-3xl p-8">
              <FileCode size={40} className="mx-auto mb-3 text-slate-300" />
              <h3 className="text-base font-bold text-slate-800">No subservice templates found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Click "Seed Defaults" to instantly load pre-configured templates, or create one from scratch.
              </p>
              <button
                onClick={handleSeedDefaults}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl font-bold text-xs"
              >
                Seed Default Templates
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {templates.map((tpl) => (
                <div
                  key={tpl._id}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                        <Layers size={18} />
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                        {tpl.subService}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-black text-slate-900 text-base">{tpl.templateName}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{tpl.description || "Reusable subservice template"}</p>
                    </div>

                    {/* Defined Fields list */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                      <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Configured Fields</span>
                        <span>{tpl.fields?.length || 0} fields</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(tpl.fields || []).slice(0, 5).map((f) => (
                          <span
                            key={f.fieldKey}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white text-slate-700 border border-slate-200"
                          >
                            {f.label}
                          </span>
                        ))}
                        {(tpl.fields?.length || 0) > 5 && (
                          <span className="text-[10px] font-bold text-slate-400">+{tpl.fields.length - 5} more</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleOpenAddListing(tpl)}
                      className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                    >
                      <span>Use Template</span>
                      <ArrowRight size={14} />
                    </button>

                    <button
                      onClick={() => handleDeleteTemplate(tpl._id, tpl.templateName)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                      title="Delete Template"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ============================================================ */}
      {/* TAB 2: DYNAMIC CUSTOM LISTINGS */}
      {/* ============================================================ */}
      {activeTab === "custom_listings" && (
        <>
          {isListingsLoading ? (
            <div className="py-20 flex justify-center text-slate-400">
              <Loader2 size={32} className="animate-spin text-indigo-500" />
            </div>
          ) : listings.length === 0 ? (
            <div className="py-16 text-center bg-white border border-dashed border-slate-200 rounded-3xl p-8">
              <Sparkles size={40} className="mx-auto mb-3 text-slate-300" />
              <h3 className="text-base font-bold text-slate-800">No dynamic custom listings published yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Use one of your templates to instantiate and publish a cafe, pub, or specialty service with custom details.
              </p>
              <button
                onClick={() => handleOpenAddListing()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs"
              >
                Create First Custom Listing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {listings.map((item) => {
                const photoUrl = item.photos?.[0]?.url || item.photos?.[0] || "";
                const detailsEntries = Object.entries(item.customDetails || {});
                return (
                  <div
                    key={item._id}
                    className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Photo Thumbnail */}
                      <div className="h-40 bg-slate-900 relative">
                        {photoUrl ? (
                          <img src={photoUrl} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-800">
                            <Layers size={36} className="mb-1" />
                            <span className="text-[10px] font-mono uppercase">{item.subService}</span>
                          </div>
                        )}

                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur text-white border border-white/20">
                            {item.subService}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              item.status === "published" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="font-black text-slate-900 text-base">{item.title}</h3>
                          <p className="text-xs text-slate-500">{item.location?.address || item.location?.city || "Jhansi"}</p>
                        </div>

                        {/* Custom Attributes Badges */}
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                            Custom Details ({detailsEntries.length})
                          </span>
                          <div className="space-y-1 pt-1">
                            {detailsEntries.slice(0, 4).map(([k, v]) => (
                              <div key={k} className="flex justify-between text-xs">
                                <span className="text-slate-500 capitalize">{k.replace(/([A-Z])/g, " $1")}:</span>
                                <span className="font-bold text-slate-800 truncate max-w-[140px]">
                                  {Array.isArray(v) ? v.join(", ") : String(v)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3 text-slate-400 text-[11px] font-mono">
                        <span className="flex items-center gap-1"><Eye size={12} /> {item.views || 0}</span>
                        <span className="flex items-center gap-1"><MousePointerClick size={12} /> {item.clicks || 0}</span>
                      </div>

                      <button
                        onClick={() => handleDeleteListing(item._id, item.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                        title="Delete Listing"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: CREATE TEMPLATE */}
      {/* ============================================================ */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900">
                {editingTemplate ? "Update Subservice Template" : "Create New Subservice Template"}
              </h2>
              <button onClick={() => setShowTemplateModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Template Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Specialty Cafe & Roastery"
                    value={templateForm.templateName}
                    onChange={(e) => setTemplateForm({ ...templateForm, templateName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">SubService Slug *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. cafe, pub, car_rental"
                    value={templateForm.subService}
                    onChange={(e) => setTemplateForm({ ...templateForm, subService: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={templateForm.category}
                    onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Fields Builder */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase text-slate-700 tracking-wider">
                    Template Schema Fields
                  </span>
                  <button
                    type="button"
                    onClick={handleAddFieldToTemplate}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Field
                  </button>
                </div>

                <div className="space-y-2.5">
                  {templateForm.fields.map((f, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-3">
                      <input
                        type="text"
                        placeholder="fieldKey"
                        value={f.fieldKey}
                        onChange={(e) => {
                          const updated = [...templateForm.fields];
                          updated[idx].fieldKey = e.target.value;
                          setTemplateForm({ ...templateForm, fields: updated });
                        }}
                        className="w-32 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Label"
                        value={f.label}
                        onChange={(e) => {
                          const updated = [...templateForm.fields];
                          updated[idx].label = e.target.value;
                          setTemplateForm({ ...templateForm, fields: updated });
                        }}
                        className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                      />
                      <select
                        value={f.fieldType}
                        onChange={(e) => {
                          const updated = [...templateForm.fields];
                          updated[idx].fieldType = e.target.value;
                          setTemplateForm({ ...templateForm, fields: updated });
                        }}
                        className="w-28 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                      >
                        {FIELD_TYPES.map((t) => (
                          <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveFieldFromTemplate(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {isSavingTemplate && <UploadProgressBar isUploading={isSavingTemplate} />}

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingTemplate}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSavingTemplate && <Loader2 size={14} className="animate-spin" />}
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: PUBLISH LISTING WITH DYNAMIC CUSTOM FIELDS */}
      {/* ============================================================ */}
      {showListingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  {editingListing ? "Update Dynamic Listing" : "Publish Dynamic Subservice Listing"}
                </h2>
                <p className="text-xs text-slate-500">
                  Start from a template, then freely add, modify, or remove fields for this specific listing.
                </p>
              </div>
              <button onClick={() => setShowListingModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form id="listing-form" onSubmit={handleSaveListing} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Template Picker */}
              <div className="p-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center gap-4">
                <div className="shrink-0 text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCode size={16} /> Base Template:
                </div>
                <select
                  value={listingForm.templateId}
                  onChange={(e) => handleTemplateSelection(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="">-- None (Build from scratch) --</option>
                  {templates.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.templateName} ({t.subService})
                    </option>
                  ))}
                </select>
              </div>

              {/* General Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Service Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. The Roasted Bean Artisan Cafe"
                    value={listingForm.title}
                    onChange={(e) => setListingForm({ ...listingForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Publish Status</label>
                  <select
                    value={listingForm.status}
                    onChange={(e) => setListingForm({ ...listingForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                  >
                    <option value="published">Published (Live to users)</option>
                    <option value="draft">Draft (Admin only)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Key-Value Editor */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                      <Settings size={14} className="text-indigo-600" />
                      Dynamic Attributes & Details
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Add, adjust, or remove attributes on the fly for this specific listing.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddDynamicField}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 px-3 py-1 bg-white border border-indigo-200 rounded-xl shadow-2xs"
                  >
                    <Plus size={14} /> Add Detail
                  </button>
                </div>

                <div className="space-y-2.5">
                  {customFieldsList.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">
                      No custom attributes added yet. Click "+ Add Detail" above or choose a base template.
                    </p>
                  ) : (
                    customFieldsList.map((item, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                        <input
                          type="text"
                          placeholder="Attribute Key"
                          value={item.key}
                          onChange={(e) => {
                            const updated = [...customFieldsList];
                            updated[idx].key = e.target.value;
                            setCustomFieldsList(updated);
                          }}
                          className="w-36 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                        />
                        <input
                          type="text"
                          placeholder="Value (or comma-separated for lists)"
                          value={item.value}
                          onChange={(e) => {
                            const updated = [...customFieldsList];
                            updated[idx].value = e.target.value;
                            setCustomFieldsList(updated);
                          }}
                          className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveDynamicField(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Remove attribute"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Photos Dropzone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Listing Photos (Cloudflare R2)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setPhotoFiles(Array.from(e.target.files || []))}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>

              {/* Live Upload Progress Feedback */}
              {isSavingListing && (
                <div className="pt-2">
                  <UploadProgressBar isUploading={isSavingListing} />
                </div>
              )}
            </form>

            {/* Footer */}
            <div className="sticky bottom-0 z-20 flex justify-between items-center px-6 py-4 bg-white/95 backdrop-blur border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowListingModal(false)}
                disabled={isSavingListing}
                className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="listing-form"
                disabled={isSavingListing}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-500/20 transition disabled:bg-indigo-300 flex items-center gap-2 cursor-pointer"
              >
                {isSavingListing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Uploading Assets & Publishing...</span>
                  </>
                ) : (
                  <span>Publish Custom Service</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceTemplatesPage;
