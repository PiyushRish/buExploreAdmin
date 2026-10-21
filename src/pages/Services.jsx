import React, { useState, useMemo } from "react";
import {
  Folder, FolderOpen, Layers, Plus, Trash2, Edit, Loader2, Sparkles, X, Check,
  ChevronRight, ArrowLeft, Hotel, Utensils, Car, ShieldAlert,
  Compass, ShoppingBag, Search, CheckCircle, RefreshCw, AlertCircle,
  SlidersHorizontal, Info, Eye, BookmarkCheck, ArrowRight, ShieldCheck, FileText
} from "lucide-react";
import toast from "react-hot-toast";
import {
  useServiceTemplatesQuery,
} from "../queries/serviceTemplateQueries.js";
import {
  useCreateServiceTemplateMutation,
  useUpdateServiceTemplateMutation,
  useDeleteServiceTemplateMutation,
} from "../mutations/serviceTemplateMutation.js";

/* ─── 7 CORE SERVICE CATEGORIES ─── */
const SERVICE_CATEGORIES = [
  {
    key: "hotel/resorts",
    name: "Hotels & Resorts",
    singular: "Hotel / Resort",
    icon: Hotel,
    gradient: "from-blue-600 to-indigo-700",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    accentColor: "indigo",
    description: "Luxury resorts, boutique stays, lodges, homestays & heritage palaces",
  },
  {
    key: "restaurants/bars",
    name: "Restaurants & Bars",
    singular: "Restaurant / Bar",
    icon: Utensils,
    gradient: "from-amber-500 to-orange-600",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
    accentColor: "amber",
    description: "Fine dining, rooftop cafes, specialty bars, family bistros & street hubs",
  },
  {
    key: "vehicle",
    name: "Vehicles & Rentals",
    singular: "Vehicle Rental",
    icon: Car,
    gradient: "from-emerald-500 to-teal-700",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    accentColor: "emerald",
    description: "Self-drive cars, bike rentals, airport taxis, e-rickshaws & tourist vans",
  },
  {
    key: "emergency",
    name: "Emergency 24/7",
    singular: "Emergency Service",
    icon: ShieldAlert,
    gradient: "from-rose-500 to-red-700",
    badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
    accentColor: "rose",
    description: "24/7 ambulances, emergency hospitals, police stations & roadside help",
  },
  {
    key: "guide/travel agency",
    name: "Guides & Agencies",
    singular: "Guide / Agency",
    icon: Compass,
    gradient: "from-cyan-500 to-blue-600",
    badgeBg: "bg-cyan-50 text-cyan-700 border-cyan-200",
    accentColor: "cyan",
    description: "Certified heritage guides, local tour operators, custom trip planners",
  },
  {
    key: "shopping",
    name: "Shopping & Stores",
    singular: "Store / Shop",
    icon: ShoppingBag,
    gradient: "from-violet-500 to-purple-700",
    badgeBg: "bg-violet-50 text-violet-700 border-violet-200",
    accentColor: "violet",
    description: "Handicraft emporiums, brassware markets, local souvenir shops & boutiques",
  },
  {
    key: "others",
    name: "Other Services",
    singular: "Service",
    icon: Layers,
    gradient: "from-slate-700 to-slate-900",
    badgeBg: "bg-slate-100 text-slate-700 border-slate-200",
    accentColor: "slate",
    description: "Luggage storage, photo/drone shoots, equipment rental & local conveniences",
  },
];

/* ─── CURATED RELATABLE SUBSERVICES & SLUGS PER SERVICE CATEGORY ─── */
const RELATABLE_SUBSERVICES_BY_CATEGORY = {
  "hotel/resorts": [
    { name: "Resorts & Retreats", slug: "resort", description: "Luxury resorts, wellness retreats and palace stays" },
    { name: "Homestays & Guest Houses", slug: "homestay", description: "Local family homestays, bed & breakfasts and guest houses" },
    { name: "Heritage Havelis & Palaces", slug: "heritage_palace", description: "Historic forts, royal havelis and heritage properties" },
    { name: "Boutique & City Hotels", slug: "boutique_hotel", description: "Modern boutique hotels, business stays and lodges" },
    { name: "Farmstays & Campsites", slug: "farmstay_camp", description: "Eco cottages, nature camps and rural farmstays" },
  ],
  "restaurants/bars": [
    { name: "Cafes & Roasteries", slug: "cafe", description: "Artisan cafes, specialty coffee roasters, and bakeries" },
    { name: "Fine Dining & Bistros", slug: "fine_dining", description: "Multi-cuisine family restaurants, bistros and gourmet dining" },
    { name: "Rooftop Lounges & Bars", slug: "rooftop_bar", description: "Scenic rooftop lounges, craft cocktail bars and pubs" },
    { name: "Street Food Hubs", slug: "street_food", description: "Famous street food stalls, chaat corners and evening eateries" },
    { name: "Family Dhabas", slug: "dhaba", description: "Traditional roadside and highway dhabas with authentic thalis" },
    { name: "Bakeries & Sweet Shops", slug: "bakery_sweets", description: "Heritage sweet shops, patisseries and confectioneries" },
  ],
  "vehicle": [
    { name: "Self-Drive Cars", slug: "self_drive_car", description: "Self-drive hatchbacks, sedans and SUVs" },
    { name: "Bikes & Scooters", slug: "bike_scooter", description: "Daily two-wheeler and scooty rentals" },
    { name: "City Taxis & Cabs", slug: "taxi_cab", description: "Chauffeur-driven local cabs and outstation taxis" },
    { name: "E-Rickshaws & Autos", slug: "auto_rickshaw", description: "Local electric rickshaws and tourist autos" },
    { name: "Tempo Travelers & Buses", slug: "tempo_bus", description: "Large group tempo travelers and luxury tourist mini-buses" },
  ],
  "emergency": [
    { name: "24/7 Ambulances", slug: "ambulance", description: "Emergency basic and ICU ambulance response units" },
    { name: "Emergency Trauma Hospitals", slug: "emergency_hospital", description: "24/7 emergency casualty wards and multi-specialty hospitals" },
    { name: "Police Stations & Helpdesks", slug: "police_station", description: "District police stations, tourist police posts & PCRs" },
    { name: "Roadside Assistance", slug: "roadside_assistance", description: "24/7 towing, breakdown support and mechanical help" },
    { name: "Blood Banks & Diagnostic Centers", slug: "blood_bank", description: "24-hour blood bank reserves and critical diagnostic labs" },
  ],
  "guide/travel agency": [
    { name: "Certified Heritage Tour Guides", slug: "heritage_guide", description: "Government-certified regional historians and monument guides" },
    { name: "Travel & Tour Agencies", slug: "tour_agency", description: "Custom tour planners, itinerary operators and ticket booking" },
    { name: "Adventure & Safari Organizers", slug: "adventure_organizer", description: "Trekking expeditions, river rafting, and wildlife safaris" },
    { name: "Pilgrimage & Spiritual Guides", slug: "pilgrimage_guide", description: "Temple trails, spiritual walks and cultural circuit guides" },
  ],
  "shopping": [
    { name: "Handicrafts & Artisans", slug: "handicrafts", description: "Handmade local crafts, pottery, terracotta and wood art" },
    { name: "Brassware & Metal Arts", slug: "brassware", description: "Famous regional brass crafts, metal idols and heritage utensils" },
    { name: "Traditional Apparel & Textiles", slug: "textiles", description: "Chanderi sarees, handloom silks, and traditional ethnic wear" },
    { name: "Local Sweets & Food Specialties", slug: "sweets_specialties", description: "Regional spices, peda, sweets and authentic edible souvenirs" },
  ],
  "others": [
    { name: "Luggage Storage & Cloakrooms", slug: "luggage_storage", description: "Safe travel luggage drop-off, lockers and transit cloakrooms" },
    { name: "Photography & Drone Shoots", slug: "photo_video_shoot", description: "Heritage photographers, pre-wedding & drone videography" },
    { name: "Equipment & Gear Rentals", slug: "equipment_rental", description: "Camping gear, audio guides, cameras and travel accessories" },
  ],
};

/* ─── RECOMMENDED STARTER BLUEPRINT SCHEMAS PER SUBSERVICE SLUG ─── */
const RECOMMENDED_BLUEPRINT_FIELDS = {
  resort: [
    { fieldKey: "amenities", label: "Amenities", fieldType: "multiselect", defaultValue: ["Swimming Pool", "Spa & Wellness", "Free WiFi", "Multi-Cuisine Dining"] },
    { fieldKey: "room_types", label: "Available Room Categories", fieldType: "multiselect", defaultValue: ["Deluxe Heritage Room", "Royal Suite", "Executive Villa"] },
    { fieldKey: "check_in_time", label: "Check-in Timings", fieldType: "text", defaultValue: "02:00 PM" },
    { fieldKey: "check_out_time", label: "Check-out Timings", fieldType: "text", defaultValue: "11:00 AM" },
    { fieldKey: "starting_price", label: "Starting Price Per Night (₹)", fieldType: "number", defaultValue: 4500 },
    { fieldKey: "complimentary_breakfast", label: "Complimentary Breakfast", fieldType: "boolean", defaultValue: true },
  ],
  homestay: [
    { fieldKey: "homestay_amenities", label: "Homestay Amenities", fieldType: "multiselect", defaultValue: ["Home-Cooked Food", "WiFi", "Hot Water", "Parking"] },
    { fieldKey: "host_languages", label: "Host Languages Spoken", fieldType: "text", defaultValue: "Hindi, English" },
    { fieldKey: "pet_friendly", label: "Pet Friendly", fieldType: "boolean", defaultValue: false },
    { fieldKey: "starting_price", label: "Starting Price (₹)", fieldType: "number", defaultValue: 1800 },
  ],
  cafe: [
    { fieldKey: "coffee_specialties", label: "Coffee Specialties", fieldType: "multiselect", defaultValue: ["Espresso", "Cold Brew", "Pour-Over", "Matcha Latte"] },
    { fieldKey: "outdoor_seating", label: "Outdoor / Garden Seating", fieldType: "boolean", defaultValue: true },
    { fieldKey: "wifi_available", label: "High-Speed WiFi for Working", fieldType: "boolean", defaultValue: true },
    { fieldKey: "average_cost_for_two", label: "Avg Cost for Two (₹)", fieldType: "number", defaultValue: 400 },
  ],
  fine_dining: [
    { fieldKey: "cuisines", label: "Cuisine Types", fieldType: "multiselect", defaultValue: ["North Indian", "Bundelkhandi Special", "Mughlai", "Continental"] },
    { fieldKey: "table_reservation_required", label: "Reservation Recommended", fieldType: "boolean", defaultValue: true },
    { fieldKey: "alcohol_served", label: "Bar / Alcohol Served", fieldType: "boolean", defaultValue: false },
    { fieldKey: "valet_parking", label: "Valet Parking Available", fieldType: "boolean", defaultValue: true },
  ],
  ambulance: [
    { fieldKey: "ambulance_type", label: "Ambulance Category", fieldType: "select", options: ["Basic Life Support (BLS)", "Advanced ICU Ambulance", "Oxygen Ambulance"], defaultValue: "Basic Life Support (BLS)" },
    { fieldKey: "oxygen_equipped", label: "Oxygen Cylinder Onboard", fieldType: "boolean", defaultValue: true },
    { fieldKey: "doctor_paramedic_onboard", label: "Paramedic / Doctor Accompanied", fieldType: "boolean", defaultValue: true },
    { fieldKey: "response_time_mins", label: "Avg Response Time (Mins)", fieldType: "number", defaultValue: 15 },
  ],
  self_drive_car: [
    { fieldKey: "available_car_types", label: "Vehicle Fleet Types", fieldType: "multiselect", defaultValue: ["Hatchback (Swift/i20)", "Sedan (Dzire)", "SUV (Creta/Scorpio)"] },
    { fieldKey: "fuel_included", label: "Fuel Included in Rent", fieldType: "boolean", defaultValue: false },
    { fieldKey: "security_deposit", label: "Security Deposit (₹)", fieldType: "number", defaultValue: 3000 },
    { fieldKey: "per_day_starting_price", label: "Per Day Starting Rate (₹)", fieldType: "number", defaultValue: 1500 },
  ],
  heritage_guide: [
    { fieldKey: "certified_monuments", label: "Certified Monument Circuits", fieldType: "multiselect", defaultValue: ["Jhansi Fort & Museum", "Orchha Palaces & Temples", "Khajuraho Group of Temples"] },
    { fieldKey: "languages", label: "Languages Fluently Spoken", fieldType: "text", defaultValue: "Hindi, English, French" },
    { fieldKey: "hourly_rate", label: "Half-Day Tour Rate (₹)", fieldType: "number", defaultValue: 1200 },
  ],
};

const ServicesPage = () => {
  // Folder Navigation State
  const [selectedCategoryKey, setSelectedCategoryKey] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "live" | "draft"
  const [searchQuery, setSearchQuery] = useState("");

  // Subservice Category Modal State (Class creation/editing)
  const [showSubserviceModal, setShowSubserviceModal] = useState(false);
  const [editingSubservice, setEditingSubservice] = useState(null); // null = new, object = edit
  const [subserviceForm, setSubserviceForm] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: true,
  });

  // Blueprint Template Modal State (For that subservice only)
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [activeTemplateSubservice, setActiveTemplateSubservice] = useState(null);
  const [templateForm, setTemplateForm] = useState({
    id: null,
    templateName: "",
    description: "",
    fields: [],
  });

  // Backend Queries & Mutations
  const {
    data: templatesRes,
    isLoading: loadingTemplates,
    refetch: refetchTemplates,
  } = useServiceTemplatesQuery({ all: "true", includeInactive: "true" });

  const createTemplateMut = useCreateServiceTemplateMutation();
  const updateTemplateMut = useUpdateServiceTemplateMutation();
  const deleteTemplateMut = useDeleteServiceTemplateMutation();

  const allTemplates = useMemo(() => {
    return templatesRes?.data || templatesRes?.templates || (Array.isArray(templatesRes) ? templatesRes : []);
  }, [templatesRes]);

  // Selected Category Object
  const selectedCategory = useMemo(() => {
    return SERVICE_CATEGORIES.find((c) => c.key === selectedCategoryKey) || null;
  }, [selectedCategoryKey]);

  // Overall Catalog Statistics
  const catalogStats = useMemo(() => {
    const totalCategories = SERVICE_CATEGORIES.length;
    const totalTemplates = allTemplates.length;
    const liveTemplates = allTemplates.filter((t) => t.isActive !== false).length;
    const draftTemplates = allTemplates.filter((t) => t.isActive === false).length;

    // Subservices count by category
    const byCategory = {};
    SERVICE_CATEGORIES.forEach((cat) => {
      const templatesForCat = allTemplates.filter((t) => t.category === cat.key);
      const presets = RELATABLE_SUBSERVICES_BY_CATEGORY[cat.key] || [];
      // Total unique subservices known in this category
      const uniqueSlugs = new Set([
        ...templatesForCat.map((t) => t.subService?.toLowerCase()),
        ...presets.map((p) => p.slug?.toLowerCase()),
      ]);
      byCategory[cat.key] = {
        subservicesCount: uniqueSlugs.size,
        liveCount: templatesForCat.filter((t) => t.isActive !== false).length,
        draftCount: templatesForCat.filter((t) => t.isActive === false).length,
        templateCount: templatesForCat.length,
      };
    });

    const totalSubservicesAcross = Object.values(byCategory).reduce(
      (sum, item) => sum + item.subservicesCount,
      0
    );

    return {
      totalCategories,
      totalTemplates,
      liveTemplates,
      draftTemplates,
      totalSubservicesAcross,
      byCategory,
    };
  }, [allTemplates]);

  // Subservices for the selected category folder
  const currentCategorySubservices = useMemo(() => {
    if (!selectedCategoryKey) return [];

    const catTemplates = allTemplates.filter((t) => t.category === selectedCategoryKey);
    const presets = RELATABLE_SUBSERVICES_BY_CATEGORY[selectedCategoryKey] || [];

    const map = new Map();

    // 1. Seed from curated relatable presets
    presets.forEach((preset) => {
      map.set(preset.slug.toLowerCase(), {
        name: preset.name,
        slug: preset.slug.toLowerCase(),
        description: preset.description,
        template: null,
        isActive: true, // default live
        isPreset: true,
      });
    });

    // 2. Attach or override with templates from database
    catTemplates.forEach((t) => {
      const slug = (t.subService || "").toLowerCase();
      if (!slug) return;

      const existing = map.get(slug);
      map.set(slug, {
        name: existing ? existing.name : t.templateName.replace(/ Blueprint$/i, ""),
        slug,
        description: t.description || existing?.description || "",
        template: t,
        isActive: t.isActive !== false,
        isPreset: !!existing,
      });
    });

    let list = Array.from(map.values());

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.slug.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
      );
    }

    // Status filter (Live vs Draft)
    if (statusFilter === "live") {
      list = list.filter((item) => item.isActive);
    } else if (statusFilter === "draft") {
      list = list.filter((item) => !item.isActive);
    }

    return list;
  }, [selectedCategoryKey, allTemplates, searchQuery, statusFilter]);

  /* ─── HANDLERS: SUBSERVICE CATEGORY (CLASS) ─── */
  const handleOpenAddSubservice = () => {
    setEditingSubservice(null);
    setSubserviceForm({
      name: "",
      slug: "",
      description: "",
      isActive: true,
    });
    setShowSubserviceModal(true);
  };

  const handleOpenEditSubservice = (subservice) => {
    setEditingSubservice(subservice);
    setSubserviceForm({
      name: subservice.name,
      slug: subservice.slug,
      description: subservice.description,
      isActive: subservice.isActive,
    });
    setShowSubserviceModal(true);
  };

  const handleSelectPresetChip = (preset) => {
    setSubserviceForm((prev) => ({
      ...prev,
      name: preset.name,
      slug: preset.slug,
      description: preset.description,
    }));
  };

  const handleSaveSubservice = async (e) => {
    e.preventDefault();
    const cleanSlug = subserviceForm.slug.trim().toLowerCase().replace(/[\s.-]+/g, "_");
    if (!cleanSlug) {
      toast.error("Please provide a relatable slug");
      return;
    }

    try {
      const existingTemplate = editingSubservice?.template;

      if (existingTemplate?._id) {
        // Update existing template
        await updateTemplateMut.mutateAsync({
          id: existingTemplate._id,
          data: {
            subService: cleanSlug,
            description: subserviceForm.description,
            isActive: subserviceForm.isActive,
          },
        });
        toast.success(`Subservice class "${subserviceForm.name}" updated!`);
      } else {
        // Create initial blueprint template for this subservice class
        const defaultFields = RECOMMENDED_BLUEPRINT_FIELDS[cleanSlug] || [
          { fieldKey: "amenities", label: "Special Features / Amenities", fieldType: "tags", defaultValue: [] },
          { fieldKey: "starting_price", label: "Starting Price (₹)", fieldType: "number", defaultValue: 1000 },
        ];

        await createTemplateMut.mutateAsync({
          templateName: `${subserviceForm.name} Blueprint`,
          category: selectedCategoryKey,
          subService: cleanSlug,
          description: subserviceForm.description,
          fields: defaultFields,
          isActive: subserviceForm.isActive,
        });
        toast.success(`Subservice class "${subserviceForm.name}" created with starter blueprint!`);
      }

      setShowSubserviceModal(false);
      refetchTemplates();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save subservice");
    }
  };

  const handleToggleSubserviceStatus = async (subservice) => {
    try {
      if (subservice.template?._id) {
        await updateTemplateMut.mutateAsync({
          id: subservice.template._id,
          data: {
            isActive: !subservice.isActive,
          },
        });
        toast.success(
          `Subservice "${subservice.name}" set to ${!subservice.isActive ? "🟢 Live" : "🟡 Draft"}!`
        );
      } else {
        // Create template in draft or live
        const defaultFields = RECOMMENDED_BLUEPRINT_FIELDS[subservice.slug] || [
          { fieldKey: "amenities", label: "Amenities", fieldType: "tags", defaultValue: [] },
        ];
        await createTemplateMut.mutateAsync({
          templateName: `${subservice.name} Blueprint`,
          category: selectedCategoryKey,
          subService: subservice.slug,
          description: subservice.description,
          fields: defaultFields,
          isActive: !subservice.isActive,
        });
        toast.success(`Subservice "${subservice.name}" initialized and set to ${!subservice.isActive ? "🟢 Live" : "🟡 Draft"}!`);
      }
      refetchTemplates();
    } catch (err) {
      toast.error("Failed to toggle subservice status");
    }
  };

  const handleDeleteSubservice = async (subservice) => {
    if (!subservice.template?._id) {
      toast.success("Preset reset to default.");
      return;
    }
    if (!window.confirm(`Delete blueprint template for subservice "${subservice.name}"?`)) {
      return;
    }

    try {
      await deleteTemplateMut.mutateAsync(subservice.template._id);
      toast.success(`Template for "${subservice.name}" deleted.`);
      refetchTemplates();
    } catch (err) {
      toast.error("Failed to delete template");
    }
  };

  /* ─── HANDLERS: BLUEPRINT TEMPLATE (FOR THAT SUBSERVICE ONLY) ─── */
  const handleOpenConfigureTemplate = (subservice) => {
    setActiveTemplateSubservice(subservice);
    if (subservice.template) {
      setTemplateForm({
        id: subservice.template._id,
        templateName: subservice.template.templateName || `${subservice.name} Blueprint`,
        description: subservice.template.description || subservice.description || "",
        fields: subservice.template.fields || [],
      });
    } else {
      const defaultFields = RECOMMENDED_BLUEPRINT_FIELDS[subservice.slug] || [
        { fieldKey: "amenities", label: "Special Features / Amenities", fieldType: "tags", defaultValue: [] },
        { fieldKey: "starting_price", label: "Starting Price (₹)", fieldType: "number", defaultValue: 1000 },
      ];
      setTemplateForm({
        id: null,
        templateName: `${subservice.name} Blueprint`,
        description: subservice.description || "",
        fields: defaultFields,
      });
    }
    setShowTemplateModal(true);
  };

  const handleAddTemplateField = () => {
    setTemplateForm((prev) => ({
      ...prev,
      fields: [
        ...prev.fields,
        {
          fieldKey: `custom_field_${Date.now()}`,
          label: "New Field",
          fieldType: "text",
          defaultValue: "",
          required: false,
        },
      ],
    }));
  };

  const handleUpdateTemplateField = (index, key, val) => {
    setTemplateForm((prev) => ({
      ...prev,
      fields: prev.fields.map((f, i) => (i === index ? { ...f, [key]: val } : f)),
    }));
  };

  const handleRemoveTemplateField = (index) => {
    setTemplateForm((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));
  };

  const handleApplyRecommendedBlueprint = () => {
    if (!activeTemplateSubservice) return;
    const recommended = RECOMMENDED_BLUEPRINT_FIELDS[activeTemplateSubservice.slug];
    if (recommended && recommended.length > 0) {
      setTemplateForm((prev) => ({
        ...prev,
        fields: recommended,
      }));
      toast.success(`Loaded recommended blueprint schema for "${activeTemplateSubservice.name}"!`);
    } else {
      toast("No preset schema found; you can define custom fields freely.");
    }
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    if (!templateForm.templateName.trim()) {
      toast.error("Template name is required");
      return;
    }

    try {
      const payload = {
        templateName: templateForm.templateName.trim(),
        category: selectedCategoryKey,
        subService: activeTemplateSubservice.slug,
        description: templateForm.description,
        fields: templateForm.fields,
        isActive: activeTemplateSubservice.isActive,
      };

      if (templateForm.id) {
        await updateTemplateMut.mutateAsync({ id: templateForm.id, data: payload });
        toast.success(`Template "${templateForm.templateName}" updated successfully!`);
      } else {
        await createTemplateMut.mutateAsync(payload);
        toast.success(`Template "${templateForm.templateName}" created successfully!`);
      }

      setShowTemplateModal(false);
      refetchTemplates();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save template");
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* ════════════════════════════════════════════════════════════
          1. EXECUTIVE CATALOG OVERVIEW & STATISTICS HUB
          ════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                <Layers size={22} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Services & Subservices Catalog
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Class architecture: Service Folders ➔ Subservice Categories (Classes) ➔ Blueprint Templates
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => refetchTemplates()}
              disabled={loadingTemplates}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              title="Refresh Catalog Data"
            >
              <RefreshCw size={16} className={loadingTemplates ? "animate-spin text-indigo-600" : ""} />
            </button>
          </div>
        </div>

        {/* 4 Key Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Service Domains
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {catalogStats.totalCategories}
              </span>
              <span className="text-xs font-semibold text-slate-500">Core Folders</span>
            </div>
          </div>

          <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-500 block mb-1">
              Subservice Classes
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-indigo-950">
                {catalogStats.totalSubservicesAcross}
              </span>
              <span className="text-xs font-semibold text-indigo-600">Total Defined</span>
            </div>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
              Live Subservices
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-950">
                {catalogStats.liveTemplates}
              </span>
              <span className="text-xs font-semibold text-emerald-600">Active & Published</span>
            </div>
          </div>

          <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
              Draft / Private
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-amber-950">
                {catalogStats.draftTemplates}
              </span>
              <span className="text-xs font-semibold text-amber-600">Draft Schemas</span>
            </div>
          </div>
        </div>

        {/* Category Pill Quick Selectors */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategoryKey(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                selectedCategoryKey === null
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Folder size={13} />
              <span>All 7 Folders</span>
            </button>

            {SERVICE_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategoryKey === cat.key;
              const count = catalogStats.byCategory[cat.key]?.subservicesCount || 0;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategoryKey(cat.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Icon size={13} />
                  <span>{cat.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      isSelected ? "bg-white/20 text-white" : "bg-white text-slate-700"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          VIEW A: ALL 7 FOLDERS DIRECTORY
          ════════════════════════════════════════════════════════════ */}
      {selectedCategoryKey === null ? (
        <div className="space-y-6">
          {/* Regional Happenings / Surprise Events Spotlight */}
          <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 border border-purple-200/80 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/20 shrink-0">
                <Sparkles size={22} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    Regional Surprise Events (Occasional Happenings)
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200">
                    Vast Regional Domain · Standalone Service
                  </span>
                </div>
                <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                  Surprise Events does not have subservices — it is an expansive service for occasional regional happenings across Bundelkhand (festivals, pop-ups, cultural nights, secret gigs). Managed independently in the sidebar with flexible key-value variables.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent("navigate-tab", { detail: "Surprise Events" }));
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 transition cursor-pointer whitespace-nowrap self-start sm:self-auto"
            >
              <Sparkles size={14} />
              <span>Open Surprise Events</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* 7 Core Service Folders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICE_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const stats = catalogStats.byCategory[cat.key] || { subservicesCount: 0, liveCount: 0, draftCount: 0 };
              return (
                <div
                  key={cat.key}
                  onClick={() => setSelectedCategoryKey(cat.key)}
                  className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.gradient} text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/10 group-hover:scale-105 transition`}
                      >
                        <Icon size={24} />
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-700 border border-slate-200">
                        {stats.subservicesCount} Subservices
                      </span>
                    </div>

                    <div>
                      <h3 className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] font-bold">
                      <span className="text-emerald-600">● {stats.liveCount} Live</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-amber-600">● {stats.draftCount} Draft</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition">
                      <span>Open Folder</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ════════════════════════════════════════════════════════════
            VIEW B: INSIDE A SELECTED FOLDER (SUBSERVICE CLASSES & TEMPLATES)
            ════════════════════════════════════════════════════════════ */
        <div className="space-y-6">
          {/* Breadcrumb Navigation Header */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedCategoryKey(null)}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  title="Back to all folders"
                >
                  <ArrowLeft size={16} />
                </button>

                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <span>Services</span>
                    <ChevronRight size={12} />
                    <span className="text-indigo-600">{selectedCategory.name}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                    {selectedCategory.name} Subservices
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenAddSubservice}
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Add Subservice Category</span>
                </button>
              </div>
            </div>

            {/* Explanation Note for Non-Tech Users */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-slate-600">
              <Info size={16} className="text-indigo-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-slate-800">Class Definition:</strong> Each card below is a <strong>Subservice Category (Class)</strong> under {selectedCategory.name}. Businesses/Listings created in the app inherit the blueprint template of their subservice. Subservice categories do not have owners or contact numbers.
              </p>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    statusFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All ({currentCategorySubservices.length})
                </button>
                <button
                  onClick={() => setStatusFilter("live")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    statusFilter === "live" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🟢 Live Only
                </button>
                <button
                  onClick={() => setStatusFilter("draft")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    statusFilter === "draft" ? "bg-amber-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🟡 Drafts Only
                </button>
              </div>

              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search subservice or slug..."
                  className="w-full pl-9 pr-3.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-hidden transition"
                />
              </div>
            </div>
          </div>

          {/* Subservices Grid */}
          {currentCategorySubservices.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Layers size={22} />
              </div>
              <h4 className="text-sm font-bold text-slate-700">No subservices found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Click "Add Subservice Category" to create a new category class for {selectedCategory.name}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {currentCategorySubservices.map((subservice) => {
                const hasTemplate = !!subservice.template;
                const fieldCount = subservice.template?.fields?.length || 0;
                const templateName = subservice.template?.templateName || `${subservice.name} Blueprint`;

                return (
                  <div
                    key={subservice.slug}
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Card Header: Name + Relatable Slug + Status Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-black text-slate-900 text-base leading-snug">
                              {subservice.name}
                            </h3>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              slug: {subservice.slug}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {subservice.description || "Subservice class category"}
                          </p>
                        </div>

                        {subservice.isActive ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                            🟢 Live
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-700 border border-amber-200 whitespace-nowrap">
                            🟡 Draft
                          </span>
                        )}
                      </div>

                      {/* Blueprint Template Card Section */}
                      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <FileText size={12} className="text-indigo-600" />
                            Blueprint Schema
                          </span>
                          {hasTemplate ? (
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                              {fieldCount} Schema Field{fieldCount !== 1 ? "s" : ""}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              Starter Blueprint Ready
                            </span>
                          )}
                        </div>

                        <div>
                          <p className="text-xs font-black text-slate-800 truncate">
                            Template: {templateName}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {hasTemplate
                              ? `Defines custom attributes for ${subservice.name} businesses`
                              : "Click configure to review and customize fields schema"}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenConfigureTemplate(subservice)}
                          className="w-full mt-1 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 active:scale-98 text-indigo-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <SlidersHorizontal size={13} />
                          <span>{hasTemplate ? "Edit Blueprint Template" : "Configure Blueprint Template"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Bottom Actions: Toggle Status, Edit, Delete */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleSubserviceStatus(subservice)}
                        className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          subservice.isActive
                            ? "bg-amber-50 hover:bg-amber-100 text-amber-700"
                            : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        <CheckCircle size={13} />
                        <span>{subservice.isActive ? "Move to Draft" : "Publish to Live"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditSubservice(subservice)}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                        title="Edit subservice class details"
                      >
                        <Edit size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSubservice(subservice)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                        title="Delete template"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          MODAL 1: CREATE / EDIT SUBSERVICE CATEGORY (CLASS DEFINITION ONLY)
          (Zero contact info, zero email/phone, zero address, zero notifications)
          ════════════════════════════════════════════════════════════ */}
      {showSubserviceModal && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {editingSubservice ? "Edit Subservice Category" : "Add Subservice Category"}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Define a subservice class for <strong>{selectedCategory.name}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowSubserviceModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSubservice} className="p-6 space-y-4">
              {/* Relatable Presets Picker (Click to auto-fill) */}
              {!editingSubservice && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Relatable Presets for {selectedCategory.name} (Click to Fill):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(RELATABLE_SUBSERVICES_BY_CATEGORY[selectedCategoryKey] || []).map((preset) => (
                      <button
                        key={preset.slug}
                        type="button"
                        onClick={() => handleSelectPresetChip(preset)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border cursor-pointer ${
                          subserviceForm.slug === preset.slug
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                            : "bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 border-indigo-200"
                        }`}
                      >
                        + {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Subservice Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subservice Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subserviceForm.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSubserviceForm((prev) => ({
                      ...prev,
                      name: val,
                      slug: prev.slug || val.toLowerCase().replace(/[\s.-]+/g, "_"),
                    }));
                  }}
                  placeholder="e.g. Heritage Havelis & Palaces"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden transition"
                />
              </div>

              {/* Relatable Slug */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Relatable Slug (Identifier) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subserviceForm.slug}
                  onChange={(e) =>
                    setSubserviceForm({
                      ...subserviceForm,
                      slug: e.target.value.toLowerCase().replace(/[\s.-]+/g, "_"),
                    })
                  }
                  placeholder="e.g. heritage_palace"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono font-bold text-indigo-700 border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-hidden transition"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Must be relatable to {selectedCategory.name} (lowercase, underscores).
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subservice Description
                </label>
                <textarea
                  rows={2}
                  value={subserviceForm.description}
                  onChange={(e) => setSubserviceForm({ ...subserviceForm, description: e.target.value })}
                  placeholder="Brief explanation of what belongs to this category class..."
                  className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 bg-white focus:border-indigo-500 outline-hidden transition resize-none"
                />
              </div>

              {/* Status Switch */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Publication Status</span>
                  <span className="text-[11px] text-slate-400">
                    {subserviceForm.isActive ? "🟢 Live & Visible to App" : "🟡 Draft (Hidden from App)"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSubserviceForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    subserviceForm.isActive ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
                  }`}
                >
                  {subserviceForm.isActive ? "Live" : "Draft"}
                </button>
              </div>

              {/* Form Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSubserviceModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTemplateMut.isPending || updateTemplateMut.isPending}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  {createTemplateMut.isPending || updateTemplateMut.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                  <span>Save Subservice Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          MODAL 2: CONFIGURE BLUEPRINT TEMPLATE (FOR THAT SUBSERVICE ONLY)
          (Shows template name clearly as Template on top, NOT business name)
          ════════════════════════════════════════════════════════════ */}
      {showTemplateModal && activeTemplateSubservice && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
            {/* Header: Displays Template Name Clearly as Template */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200">
                    Template Blueprint
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    Subservice: <strong>{activeTemplateSubservice.name}</strong> ({activeTemplateSubservice.slug})
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Template: {templateForm.templateName || "Untitled Blueprint"}
                </h3>
              </div>

              <button
                onClick={() => setShowTemplateModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveTemplate} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Template Name & Description */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Template Blueprint Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={templateForm.templateName}
                    onChange={(e) => setTemplateForm({ ...templateForm, templateName: e.target.value })}
                    placeholder="e.g. Luxury Resort & Palace Blueprint"
                    className="w-full px-3.5 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white focus:border-indigo-500 outline-hidden transition"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Shown to admins as the blueprint schema for <strong>{activeTemplateSubservice.name}</strong>.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Blueprint Description
                  </label>
                  <input
                    type="text"
                    value={templateForm.description}
                    onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                    placeholder="e.g. Schema definition for 3-5 star luxury resort listings"
                    className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 bg-white focus:border-indigo-500 outline-hidden transition"
                  />
                </div>
              </div>

              {/* Schema Fields Builder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <SlidersHorizontal size={13} className="text-indigo-600" />
                      Blueprint Fields ({templateForm.fields.length})
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Attributes that businesses under this subservice class will possess.
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {RECOMMENDED_BLUEPRINT_FIELDS[activeTemplateSubservice.slug] && (
                      <button
                        type="button"
                        onClick={handleApplyRecommendedBlueprint}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition cursor-pointer"
                        title="Load recommended starter fields for this subservice"
                      >
                        Reset to Preset Fields
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleAddTemplateField}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>Add Field</span>
                    </button>
                  </div>
                </div>

                {/* Fields List */}
                {templateForm.fields.length === 0 ? (
                  <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
                    No fields defined yet. Click "Add Field" or "Reset to Preset Fields".
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {templateForm.fields.map((field, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                              Field Label
                            </label>
                            <input
                              type="text"
                              required
                              value={field.label}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleUpdateTemplateField(idx, "label", val);
                                if (!field.fieldKey || field.fieldKey.startsWith("custom_field_")) {
                                  handleUpdateTemplateField(idx, "fieldKey", val.toLowerCase().replace(/[\s.-]+/g, "_"));
                                }
                              }}
                              placeholder="e.g. Amenities"
                              className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 focus:bg-white outline-hidden"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                              Field Key (Slug)
                            </label>
                            <input
                              type="text"
                              required
                              value={field.fieldKey}
                              onChange={(e) =>
                                handleUpdateTemplateField(
                                  idx,
                                  "fieldKey",
                                  e.target.value.toLowerCase().replace(/[\s.-]+/g, "_")
                                )
                              }
                              placeholder="e.g. amenities"
                              className="w-full px-2.5 py-1.5 text-xs font-mono font-bold text-indigo-700 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white outline-hidden"
                            />
                          </div>

                          <div className="flex items-center gap-1.5">
                            <div className="flex-1">
                              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                                Type
                              </label>
                              <select
                                value={field.fieldType}
                                onChange={(e) => handleUpdateTemplateField(idx, "fieldType", e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 focus:bg-white outline-hidden"
                              >
                                <option value="text">Text</option>
                                <option value="number">Number</option>
                                <option value="boolean">Yes / No (Boolean)</option>
                                <option value="multiselect">Multi-Select List</option>
                                <option value="select">Dropdown Select</option>
                                <option value="tags">Tags</option>
                                <option value="textarea">Long Text</option>
                              </select>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveTemplateField(idx)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition self-end cursor-pointer"
                              title="Delete field"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTemplateMut.isPending || updateTemplateMut.isPending}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  {createTemplateMut.isPending || updateTemplateMut.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                  <span>Save Blueprint Template</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
