import React, { useState, useMemo } from "react";
import {
  Folder, FolderOpen, Layers, Plus, Trash2, Edit, Loader2, Sparkles, X, Check,
  Eye, MousePointerClick, RefreshCw, Filter, CheckCircle2, AlertCircle,
  ArrowRight, ChevronRight, ArrowLeft, Hotel, Utensils, Car, ShieldAlert,
  Compass, ShoppingBag, Search, UploadCloud, Globe, Phone, Mail, MapPin,
  SlidersHorizontal, CheckCircle, Clock, ExternalLink, Send, Info, HelpCircle,
  ChevronDown, ChevronUp, Copy, BookmarkCheck
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
import { uploadMultipleFilesDirectToR2 } from "../utils/r2DirectUpload.js";

/* ─── 8 SERVICE CATEGORIES CONFIGURATION ─── */
export const SERVICE_CATEGORIES = [
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
    key: "events",
    name: "Surprise Events",
    singular: "Surprise Event",
    icon: Sparkles,
    gradient: "from-pink-500 to-rose-600",
    badgeBg: "bg-pink-50 text-pink-700 border-pink-200",
    accentColor: "pink",
    description: "Standalone surprise service: rooftop popups, secret gigs, birthday reveals, flash mobs & custom experiences",
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

/* ─── PREBUILT BLUEPRINTS FOR EVERY SERVICE CATEGORY ─── */
export const PREBUILT_TEMPLATES_BY_CATEGORY = {
  "hotel/resorts": [
    {
      templateName: "Luxury Resort & Heritage Palace",
      subService: "resort",
      description: "Blueprint for 3-5 star luxury resorts, heritage havelis & palaces",
      fields: [
        { fieldKey: "amenities", label: "Amenities", fieldType: "multiselect", defaultValue: ["Swimming Pool", "Spa & Wellness", "Free High-Speed WiFi", "Multi-Cuisine Restaurant"] },
        { fieldKey: "room_types", label: "Available Room Categories", fieldType: "multiselect", defaultValue: ["Deluxe Heritage Room", "Royal Suite", "Executive Villa"] },
        { fieldKey: "check_in_time", label: "Check-in Timings", fieldType: "text", defaultValue: "02:00 PM" },
        { fieldKey: "check_out_time", label: "Check-out Timings", fieldType: "text", defaultValue: "11:00 AM" },
        { fieldKey: "starting_price", label: "Starting Price Per Night (₹)", fieldType: "number", defaultValue: 4500 },
        { fieldKey: "breakfast_included", label: "Complimentary Breakfast", fieldType: "boolean", defaultValue: true },
      ],
    },
    {
      templateName: "Boutique Hotel & Homestay",
      subService: "homestay",
      description: "Blueprint for cozy boutique stays, family homestays & guest houses",
      fields: [
        { fieldKey: "amenities", label: "Homestay Amenities", fieldType: "multiselect", defaultValue: ["Home-Cooked Food", "WiFi", "Hot Water", "Parking"] },
        { fieldKey: "host_languages", label: "Languages Spoken by Host", fieldType: "text", defaultValue: "Hindi, English" },
        { fieldKey: "pet_friendly", label: "Pet Friendly", fieldType: "boolean", defaultValue: false },
        { fieldKey: "starting_price", label: "Starting Price Per Night (₹)", fieldType: "number", defaultValue: 1800 },
      ],
    },
  ],
  "restaurants/bars": [
    {
      templateName: "Specialty Cafe & Roastery",
      subService: "cafe",
      description: "Blueprint for artisan cafes, coffee roasters, bakeries and workspaces",
      fields: [
        { fieldKey: "coffee_specialties", label: "Coffee Specialties", fieldType: "multiselect", defaultValue: ["Espresso", "Cold Brew", "Pour-Over", "Matcha Latte"] },
        { fieldKey: "outdoor_seating", label: "Outdoor / Garden Seating", fieldType: "boolean", defaultValue: true },
        { fieldKey: "wifi_available", label: "High-Speed WiFi for Working", fieldType: "boolean", defaultValue: true },
        { fieldKey: "avg_cost_for_two", label: "Average Cost for Two (₹)", fieldType: "number", defaultValue: 450 },
        { fieldKey: "opening_hours", label: "Operating Timings", fieldType: "text", defaultValue: "08:30 AM - 10:30 PM" },
      ],
    },
    {
      templateName: "Pub & Restro-Bar",
      subService: "pub",
      description: "Blueprint for craft lounges, restro-bars, and night clubs",
      fields: [
        { fieldKey: "happy_hours", label: "Happy Hours Deals & Timings", fieldType: "text", defaultValue: "04:00 PM - 08:00 PM" },
        { fieldKey: "dj_music_nights", label: "Live DJ / Band Performances", fieldType: "boolean", defaultValue: true },
        { fieldKey: "liquor_served", label: "Cocktails & Alcoholic Beverages", fieldType: "boolean", defaultValue: true },
        { fieldKey: "rooftop_lounge", label: "Rooftop City View", fieldType: "boolean", defaultValue: false },
        { fieldKey: "avg_cost_for_two", label: "Average Cost for Two (₹)", fieldType: "number", defaultValue: 1400 },
      ],
    },
  ],
  "vehicle": [
    {
      templateName: "Self-Drive Car & Bike Rental",
      subService: "vehicle_rental",
      description: "Blueprint for self-drive motorbikes, scooties, sedans & SUVs",
      fields: [
        { fieldKey: "vehicle_types", label: "Available Fleet", fieldType: "multiselect", defaultValue: ["Activa / Scooty", "Royal Enfield", "Swift Dzire", "Thar 4x4"] },
        { fieldKey: "security_deposit", label: "Refundable Security Deposit (₹)", fieldType: "number", defaultValue: 1000 },
        { fieldKey: "helmets_included", label: "Helmets Included for Free", fieldType: "boolean", defaultValue: true },
        { fieldKey: "daily_rate_starting", label: "Daily Rate Starting From (₹)", fieldType: "number", defaultValue: 400 },
        { fieldKey: "docs_required", label: "Documents Required (DL, Aadhaar)", fieldType: "text", defaultValue: "Original Driving License + Aadhaar Card" },
      ],
    },
    {
      templateName: "City Cab & Airport Taxi Service",
      subService: "taxi",
      description: "Blueprint for 24/7 outstation cabs, railway station transfers, and local city taxis",
      fields: [
        { fieldKey: "cab_types", label: "Cab Categories", fieldType: "multiselect", defaultValue: ["Sedan (AC)", "SUV (Ertiga/Innova)", "Tempo Traveller"] },
        { fieldKey: "rate_per_km", label: "Rate Per KM Starting (₹)", fieldType: "number", defaultValue: 12 },
        { fieldKey: "is_24x7", label: "24/7 Availability", fieldType: "boolean", defaultValue: true },
      ],
    },
  ],
  "emergency": [
    {
      templateName: "24/7 Ambulance & Trauma Transport",
      subService: "ambulance",
      description: "Blueprint for cardiac ICU ambulances, oxygen ambulances, and trauma vehicles",
      fields: [
        { fieldKey: "ambulance_type", label: "Vehicle Type", fieldType: "text", defaultValue: "Advanced Life Support (ICU on Wheels)" },
        { fieldKey: "oxygen_equipped", label: "Oxygen & Ventilator Equipped", fieldType: "boolean", defaultValue: true },
        { fieldKey: "emergency_hotline", label: "Direct Emergency Hotline Number", fieldType: "text", defaultValue: "+91 9999999999" },
        { fieldKey: "average_response_mins", label: "Average Response Time (mins)", fieldType: "number", defaultValue: 15 },
      ],
    },
    {
      templateName: "Hospital & Multi-Specialty Clinic",
      subService: "hospital",
      description: "Blueprint for emergency hospitals, multi-specialty trauma centers, and diagnostic clinics",
      fields: [
        { fieldKey: "emergency_ward_24x7", label: "24/7 Emergency Ward Available", fieldType: "boolean", defaultValue: true },
        { fieldKey: "icu_beds_count", label: "ICU Beds Capacity", fieldType: "number", defaultValue: 20 },
        { fieldKey: "specialties", label: "Key Specialties", fieldType: "multiselect", defaultValue: ["Cardiology", "Trauma & Ortho", "Pediatrics", "Gynecology"] },
        { fieldKey: "consultation_fee", label: "OPD Consultation Fee (₹)", fieldType: "number", defaultValue: 400 },
      ],
    },
  ],
  "guide/travel agency": [
    {
      templateName: "Certified Heritage Tour Guide",
      subService: "heritage_guide",
      description: "Blueprint for Ministry of Tourism certified local guides and heritage walk leaders",
      fields: [
        { fieldKey: "languages", label: "Languages Fluently Spoken", fieldType: "multiselect", defaultValue: ["Hindi", "English", "French", "German"] },
        { fieldKey: "circuit_expertise", label: "Circuit Expertise", fieldType: "multiselect", defaultValue: ["Jhansi Fort & Rani Mahal", "Orchha Temples", "Khajuraho Heritage", "Bundelkhand History"] },
        { fieldKey: "hourly_rate", label: "Standard Guide Fee Per Hour (₹)", fieldType: "number", defaultValue: 500 },
        { fieldKey: "govt_approved", label: "Govt. Tourism Approved Badge", fieldType: "boolean", defaultValue: true },
      ],
    },
    {
      templateName: "Travel Agency & Outstation Operator",
      subService: "travel_agency",
      description: "Blueprint for verified travel planners, custom itinerary designers, and bus/train booking operators",
      fields: [
        { fieldKey: "packages_offered", label: "Package Types", fieldType: "multiselect", defaultValue: ["Weekend Bundelkhand Circuit", "Orchha Heritage Tour", "Wildlife & Sanctuary Expedition"] },
        { fieldKey: "custom_itinerary", label: "Custom Tailored Itineraries", fieldType: "boolean", defaultValue: true },
        { fieldKey: "group_discounts", label: "Special Group Discounts Available", fieldType: "boolean", defaultValue: true },
      ],
    },
  ],
  "events": [
    {
      templateName: "Surprise Pop-up & Celebration Experience",
      subService: "surprise_event",
      description: "Standalone surprise service: rooftop popups, candlelight dinners, birthday reveals, flash mobs",
      fields: [
        { fieldKey: "experience_type", label: "Type of Experience", fieldType: "text", defaultValue: "Candlelight Rooftop Dinner & Acoustic Serenade" },
        { fieldKey: "custom_decor_included", label: "Custom Theme Decor Included", fieldType: "boolean", defaultValue: true },
        { fieldKey: "cake_food_included", label: "Cake & Multi-Course Dinner Included", fieldType: "boolean", defaultValue: true },
        { fieldKey: "duration_hours", label: "Experience Duration (Hours)", fieldType: "number", defaultValue: 3 },
        { fieldKey: "advance_booking_days", label: "Advance Notice Required (Days)", fieldType: "number", defaultValue: 2 },
        { fieldKey: "pricing_package", label: "Package Price Starting (₹)", fieldType: "number", defaultValue: 3500 },
      ],
    },
    {
      templateName: "Cultural Night & Secret Acoustic Gig",
      subService: "secret_gig",
      description: "Intimate secret concerts, poetry open-mics, heritage storytelling and festival popups",
      fields: [
        { fieldKey: "entry_fee", label: "Entry Fee (Free or ₹)", fieldType: "text", defaultValue: "Free with Registration" },
        { fieldKey: "performer_lineup", label: "Featured Artists / Storytellers", fieldType: "text", defaultValue: "Local Indie Musicians & Heritage Storytellers" },
        { fieldKey: "seating_capacity", label: "Intimate Seating Capacity", fieldType: "number", defaultValue: 60 },
        { fieldKey: "timings", label: "Event Timings", fieldType: "text", defaultValue: "07:00 PM - 10:00 PM" },
      ],
    },
  ],
  "shopping": [
    {
      templateName: "Local Handicraft & Brassware Emporium",
      subService: "handicraft",
      description: "Blueprint for local Bundelkhand brass crafts, handloom textiles & souvenir shops",
      fields: [
        { fieldKey: "craft_types", label: "Specialty Crafts", fieldType: "multiselect", defaultValue: ["Brass Artifacts", "Handloom Chanderi Sarees", "Clay Pottery", "Local Spices"] },
        { fieldKey: "digital_payment", label: "Credit Cards & UPI Accepted", fieldType: "boolean", defaultValue: true },
        { fieldKey: "national_shipping", label: "Domestic Shipping / Courier Available", fieldType: "boolean", defaultValue: true },
        { fieldKey: "operating_hours", label: "Opening Hours", fieldType: "text", defaultValue: "10:00 AM - 09:00 PM" },
      ],
    },
  ],
  "others": [
    {
      templateName: "Luggage Storage & Cloakroom Service",
      subService: "luggage_storage",
      description: "Safe traveler cloakroom and luggage lockers near transit hubs",
      fields: [
        { fieldKey: "hourly_rate", label: "Rate Per Bag Per Day (₹)", fieldType: "number", defaultValue: 80 },
        { fieldKey: "cctv_monitored", label: "24/7 CCTV & Security Monitored", fieldType: "boolean", defaultValue: true },
        { fieldKey: "operating_hours", label: "Operating Hours", fieldType: "text", defaultValue: "06:00 AM - 11:30 PM" },
      ],
    },
    {
      templateName: "Travel & Drone Photography",
      subService: "photography",
      description: "Professional photo shoots, drone video coverage, and vacation reel production",
      fields: [
        { fieldKey: "deliverables", label: "Deliverables Included", fieldType: "multiselect", defaultValue: ["50 Edited High-Res Photos", "1 Cinematic 4K Reel", "Full Raw Drone Footage"] },
        { fieldKey: "turnaround_hours", label: "Delivery Turnaround (Hours)", fieldType: "number", defaultValue: 24 },
        { fieldKey: "package_rate", label: "Session Rate (₹)", fieldType: "number", defaultValue: 2500 },
      ],
    },
  ],
};

const FIELD_TYPES = [
  { id: "text", label: "Single Line Text" },
  { id: "number", label: "Number" },
  { id: "boolean", label: "Yes / No (Toggle)" },
  { id: "multiselect", label: "Multi-Select (Comma-separated Tags)" },
  { id: "textarea", label: "Long Paragraph" },
  { id: "time_range", label: "Operating Hours (e.g. 09:00 AM - 10:00 PM)" },
];

const Services = () => {
  // Navigation State: null = Folder Hub View; categoryKey = Inside that Folder
  const [selectedFolderKey, setSelectedFolderKey] = useState(null);
  const [folderSubserviceTab, setFolderSubserviceTab] = useState("live"); // "live" (published) | "draft"
  const [globalSearch, setGlobalSearch] = useState("");
  const [subserviceSearch, setSubserviceSearch] = useState("");
  const [showAdminGuide, setShowAdminGuide] = useState(true);

  // ==========================================
  // Template Modal State (Base Template Name is EDITABLE!)
  // ==========================================
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({
    templateName: "",
    category: "hotel/resorts",
    subService: "",
    description: "",
    icon: "layers",
    fields: [],
  });

  // ==========================================
  // Subservice Listing Modal State
  // ==========================================
  const [showSubserviceModal, setShowSubserviceModal] = useState(false);
  const [editingSubservice, setEditingSubservice] = useState(null);
  const [subserviceForm, setSubserviceForm] = useState({
    templateId: "",
    title: "",
    category: "hotel/resorts",
    subService: "",
    status: "published",
    description: "",
    phone: "",
    email: "",
    address: "",
    city: "Jhansi",
    customDetails: {},
    tags: "",
  });
  const [customFieldsList, setCustomFieldsList] = useState([]);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);

  // ==========================================
  // Queries & Mutations
  // ==========================================
  const {
    data: templatesData,
    isLoading: isTemplatesLoading,
    refetch: refetchTemplates,
  } = useServiceTemplatesQuery();

  const {
    data: subservicesData,
    isLoading: isSubservicesLoading,
    refetch: refetchSubservices,
  } = useCustomServicesQuery();

  const createTemplateMutation = useCreateServiceTemplateMutation();
  const updateTemplateMutation = useUpdateServiceTemplateMutation();
  const deleteTemplateMutation = useDeleteServiceTemplateMutation();
  const seedTemplatesMutation   = useSeedDefaultTemplatesMutation();

  const createCustomServiceMutation = useCreateCustomServiceMutation();
  const updateCustomServiceMutation = useUpdateCustomServiceMutation();
  const deleteCustomServiceMutation = useDeleteCustomServiceMutation();

  const [isUploadingR2, setIsUploadingR2] = useState(false);
  const isSavingSubservice =
    createCustomServiceMutation.isPending ||
    updateCustomServiceMutation.isPending ||
    isUploadingR2;
  const isSavingTemplate =
    createTemplateMutation.isPending ||
    updateTemplateMutation.isPending;

  const allTemplates = templatesData?.data || [];
  const allSubservices = subservicesData?.data || [];

  // Active Folder Config
  const activeFolder = useMemo(() => {
    if (!selectedFolderKey) return null;
    return SERVICE_CATEGORIES.find((c) => c.key === selectedFolderKey) || null;
  }, [selectedFolderKey]);

  // Statistics per Category
  const categoryStats = useMemo(() => {
    const map = {};
    SERVICE_CATEGORIES.forEach((cat) => {
      const templates = allTemplates.filter((t) => t.category === cat.key);
      const subservices = allSubservices.filter((s) => s.category === cat.key);
      const live = subservices.filter((s) => s.status === "published");
      const drafts = subservices.filter((s) => s.status === "draft");

      map[cat.key] = {
        templateCount: templates.length,
        liveCount: live.length,
        draftCount: drafts.length,
        totalSubservices: subservices.length,
      };
    });
    return map;
  }, [allTemplates, allSubservices]);

  // Folder-Filtered Templates
  const folderTemplates = useMemo(() => {
    if (!selectedFolderKey) return [];
    return allTemplates.filter((t) => t.category === selectedFolderKey);
  }, [allTemplates, selectedFolderKey]);

  // Prebuilt starter templates for the active folder
  const prebuiltStarterTemplates = useMemo(() => {
    if (!selectedFolderKey) return [];
    return PREBUILT_TEMPLATES_BY_CATEGORY[selectedFolderKey] || [];
  }, [selectedFolderKey]);

  // Folder-Filtered Subservices (Live vs Draft)
  const folderSubservices = useMemo(() => {
    if (!selectedFolderKey) return { live: [], drafts: [] };
    let items = allSubservices.filter((s) => s.category === selectedFolderKey);

    if (subserviceSearch.trim()) {
      const q = subserviceSearch.toLowerCase().trim();
      items = items.filter(
        (s) =>
          s.title?.toLowerCase().includes(q) ||
          s.subService?.toLowerCase().includes(q) ||
          s.location?.address?.toLowerCase().includes(q) ||
          s.contact?.phone?.includes(q)
      );
    }

    return {
      live: items.filter((s) => s.status === "published"),
      drafts: items.filter((s) => s.status === "draft"),
    };
  }, [allSubservices, selectedFolderKey, subserviceSearch]);

  // ==========================================
  // Handlers: Seed Built-in Defaults
  // ==========================================
  const handleSeedDefaults = async () => {
    if (
      !window.confirm(
        "Seed production default subservice templates (Hotels, Cafes, Vehicles, Emergency)? This will safely add missing templates without deleting existing ones."
      )
    )
      return;

    try {
      const res = await seedTemplatesMutation.mutateAsync();
      toast.success(res?.message || "Default templates seeded successfully!");
      refetchTemplates();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to seed default templates");
    }
  };

  // 1-Click Save a Prebuilt Template directly to DB
  const handleSavePrebuiltTemplate = async (prebuilt) => {
    try {
      await createTemplateMutation.mutateAsync({
        templateName: prebuilt.templateName,
        category: selectedFolderKey,
        subService: prebuilt.subService,
        description: prebuilt.description,
        icon: "layers",
        fields: prebuilt.fields,
      });
      toast.success(`Prebuilt template '${prebuilt.templateName}' saved into your folder!`);
      refetchTemplates();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save template");
    }
  };

  // ==========================================
  // Handlers: Template Management (EDITABLE NAME!)
  // ==========================================
  const handleOpenCreateTemplate = (presetCategory = null, prefillData = null) => {
    setEditingTemplate(null);
    setTemplateForm({
      templateName: prefillData?.templateName || "",
      category: presetCategory || selectedFolderKey || "hotel/resorts",
      subService: prefillData?.subService || "",
      description: prefillData?.description || "",
      icon: "layers",
      fields: prefillData?.fields || [
        { fieldKey: "amenities", label: "Special Amenities", fieldType: "multiselect", defaultValue: [] },
        { fieldKey: "openingHours", label: "Operating Hours", fieldType: "text", defaultValue: "09:00 AM - 10:00 PM" },
      ],
    });
    setShowTemplateModal(true);
  };

  const handleOpenEditTemplate = (tpl) => {
    setEditingTemplate(tpl);
    // Explicitly set templateName so base template name is fully editable!
    setTemplateForm({
      templateName: tpl.templateName || "",
      category: tpl.category || "hotel/resorts",
      subService: tpl.subService || "",
      description: tpl.description || "",
      icon: tpl.icon || "layers",
      fields: Array.isArray(tpl.fields)
        ? tpl.fields.map((f) => ({
            fieldKey: f.fieldKey || "",
            label: f.label || "",
            fieldType: f.fieldType || "text",
            defaultValue: f.defaultValue ?? "",
            required: Boolean(f.required),
          }))
        : [],
    });
    setShowTemplateModal(true);
  };

  const handleAddFieldToTemplate = () => {
    setTemplateForm((prev) => ({
      ...prev,
      fields: [
        ...prev.fields,
        {
          fieldKey: `attr_${Date.now()}`,
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
    if (!templateForm.templateName.trim()) {
      return toast.error("Template Name is required");
    }
    if (!templateForm.subService.trim()) {
      return toast.error("SubService slug is required (e.g. cafe, luxury_resort)");
    }

    try {
      if (editingTemplate) {
        // Updating template - templateName is preserved & editable!
        await updateTemplateMutation.mutateAsync({
          id: editingTemplate._id,
          data: {
            templateName: templateForm.templateName.trim(),
            category: templateForm.category,
            subService: templateForm.subService.trim().toLowerCase(),
            description: templateForm.description,
            icon: templateForm.icon,
            fields: templateForm.fields,
          },
        });
        toast.success(`Template '${templateForm.templateName}' updated successfully!`);
      } else {
        await createTemplateMutation.mutateAsync({
          templateName: templateForm.templateName.trim(),
          category: templateForm.category,
          subService: templateForm.subService.trim().toLowerCase(),
          description: templateForm.description,
          icon: templateForm.icon,
          fields: templateForm.fields,
        });
        toast.success(`Template '${templateForm.templateName}' created successfully!`);
      }
      setShowTemplateModal(false);
      refetchTemplates();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save template");
    }
  };

  const handleDeleteTemplate = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the template '${name}'? Existing subservices using it will not be lost.`))
      return;

    try {
      await deleteTemplateMutation.mutateAsync(id);
      toast.success("Template deleted successfully");
      refetchTemplates();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete template");
    }
  };

  // ==========================================
  // Handlers: Subservice Management (Live vs Drafts)
  // ==========================================
  const handleOpenAddSubservice = (baseTemplate = null) => {
    setEditingSubservice(null);
    setPhotoFiles([]);
    setExistingPhotos([]);

    const cat = baseTemplate?.category || selectedFolderKey || "hotel/resorts";
    const sub = baseTemplate?.subService || "";

    // Load custom attributes schema from selected template
    const tFields = baseTemplate?.fields || [];
    const initialFields = tFields.map((f) => ({
      key: f.fieldKey,
      label: f.label,
      type: f.fieldType,
      value: f.defaultValue !== undefined ? f.defaultValue : "",
    }));

    setCustomFieldsList(initialFields);
    setSubserviceForm({
      templateId: baseTemplate?._id || "",
      title: "",
      category: cat,
      subService: sub,
      status: folderSubserviceTab === "draft" ? "draft" : "published",
      description: "",
      phone: "",
      email: "",
      address: "",
      city: "Jhansi",
      customDetails: {},
      tags: "",
    });
    setShowSubserviceModal(true);
  };

  const handleOpenEditSubservice = (item) => {
    setEditingSubservice(item);
    setPhotoFiles([]);
    setExistingPhotos(item.photos || []);

    // Reconstruct custom attributes list
    const details = item.customDetails || {};
    const fieldDefs = item.fieldDefinitions || [];
    const fieldsMap = {};

    fieldDefs.forEach((fd) => {
      fieldsMap[fd.fieldKey] = {
        key: fd.fieldKey,
        label: fd.label,
        type: fd.fieldType,
        value: details[fd.fieldKey] !== undefined ? details[fd.fieldKey] : "",
      };
    });

    // Also include any customDetails keys not in fieldDefinitions
    Object.entries(details).forEach(([k, v]) => {
      if (!fieldsMap[k]) {
        fieldsMap[k] = {
          key: k,
          label: k.replace(/([A-Z])/g, " $1").replace(/_/g, " "),
          type: Array.isArray(v) ? "multiselect" : typeof v === "boolean" ? "boolean" : "text",
          value: v,
        };
      }
    });

    setCustomFieldsList(Object.values(fieldsMap));
    setSubserviceForm({
      templateId: item.template?._id || item.template || "",
      title: item.title || "",
      category: item.category || selectedFolderKey || "hotel/resorts",
      subService: item.subService || "",
      status: item.status || "published",
      description: item.description || "",
      phone: item.contact?.phone || "",
      email: item.contact?.email || "",
      address: item.location?.address || "",
      city: item.location?.city || "Jhansi",
      customDetails: details,
      tags: Array.isArray(item.tags) ? item.tags.join(", ") : "",
    });
    setShowSubserviceModal(true);
  };

  const handleSelectTemplateForSubservice = (tplId) => {
    const t = allTemplates.find((item) => item._id === tplId);
    if (!t) return;

    setSubserviceForm((prev) => ({
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

  const handleAddDynamicAttribute = () => {
    setCustomFieldsList((prev) => [
      ...prev,
      {
        key: `attr_${Date.now()}`,
        label: "Custom Attribute",
        type: "text",
        value: "",
      },
    ]);
  };

  const handleRemoveDynamicAttribute = (index) => {
    setCustomFieldsList((prev) => prev.filter((_, i) => i !== index));
  };

  // 1-Click Quick Toggle between Live (published) and Draft
  const handleToggleSubserviceStatus = async (item) => {
    const newStatus = item.status === "published" ? "draft" : "published";
    const actionLabel = newStatus === "published" ? "Publish to Live" : "Move to Drafts";

    try {
      await updateCustomServiceMutation.mutateAsync({
        id: item._id,
        formData: { status: newStatus },
      });
      toast.success(
        newStatus === "published"
          ? `🚀 '${item.title}' is now LIVE on BuXplore!`
          : `📥 '${item.title}' moved to Drafts.`
      );
      refetchSubservices();
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to ${actionLabel}`);
    }
  };

  const handleSaveSubservice = async (e) => {
    e.preventDefault();
    if (!subserviceForm.title.trim()) {
      return toast.error("Business / Service Title is required");
    }
    if (!subserviceForm.subService.trim()) {
      return toast.error("Subservice type (slug) is required");
    }

    // Package dynamic attributes
    const cleanDetails = {};
    customFieldsList.forEach((item) => {
      if (item.key) {
        let val = item.value;
        if (item.type === "number") val = Number(val) || 0;
        if (item.type === "boolean") val = val === true || val === "true";
        if (item.type === "multiselect" && typeof val === "string") {
          val = val.split(",").map((s) => s.trim()).filter(Boolean);
        }
        cleanDetails[item.key] = val;
      }
    });

    try {
      let uploadedAssets = [];
      if (photoFiles.length > 0) {
        setIsUploadingR2(true);
        uploadedAssets = await uploadMultipleFilesDirectToR2(
          photoFiles,
          `services/${subserviceForm.category}`,
          "image"
        );
      }

      const finalPhotos = editingSubservice
        ? [...existingPhotos, ...uploadedAssets]
        : uploadedAssets;

      const payload = {
        title: subserviceForm.title.trim(),
        category: subserviceForm.category,
        subService: subserviceForm.subService.trim().toLowerCase(),
        status: subserviceForm.status,
        description: subserviceForm.description,
        ...(subserviceForm.templateId ? { templateId: subserviceForm.templateId } : {}),
        contact: {
          phone: subserviceForm.phone,
          email: subserviceForm.email,
        },
        location: {
          address: subserviceForm.address,
          city: subserviceForm.city,
        },
        customDetails: cleanDetails,
        tags: subserviceForm.tags
          ? subserviceForm.tags.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        photos: finalPhotos,
      };

      if (editingSubservice) {
        await updateCustomServiceMutation.mutateAsync({
          id: editingSubservice._id,
          formData: payload,
        });
        toast.success(`'${payload.title}' updated successfully!`);
      } else {
        await createCustomServiceMutation.mutateAsync(payload);
        toast.success(
          payload.status === "published"
            ? `🚀 '${payload.title}' published Live!`
            : `💾 '${payload.title}' saved to Drafts.`
        );
      }

      setShowSubserviceModal(false);
      setPhotoFiles([]);
      setIsUploadingR2(false);
      refetchSubservices();
    } catch (err) {
      setIsUploadingR2(false);
      toast.error(err?.response?.data?.message || err?.message || "Failed to save subservice");
    }
  };

  const handleDeleteSubservice = async (id, title) => {
    if (!window.confirm(`Delete subservice '${title}' permanently?`)) return;

    try {
      await deleteCustomServiceMutation.mutateAsync(id);
      toast.success("Subservice deleted successfully");
      refetchSubservices();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete subservice");
    }
  };

  const handleRemoveExistingPhoto = (index) => {
    setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ──────────────────────────────────────────────────────────── */}
      {/* TOP HEADER & ACTION BAR */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-7 rounded-3xl text-white shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Layers size={14} />
            <span>BuXplore Services & Subservices Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            {activeFolder ? (
              <>
                <button
                  onClick={() => setSelectedFolderKey(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                  title="Back to All Folders"
                >
                  <ArrowLeft size={18} />
                </button>
                <span>{activeFolder.name}</span>
              </>
            ) : (
              "All Services & Category Folders"
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            {activeFolder
              ? activeFolder.description
              : "Organized by service folders. Create customizable subservice templates on the top bar and manage live or draft listings."}
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowAdminGuide((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white backdrop-blur border border-white/10 transition cursor-pointer"
          >
            <HelpCircle size={13} className="text-indigo-300" />
            <span>{showAdminGuide ? "Hide Guide" : "Admin Guide"}</span>
          </button>

          <button
            onClick={handleSeedDefaults}
            disabled={seedTemplatesMutation.isPending}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white backdrop-blur border border-white/10 transition cursor-pointer"
            title="Seed built-in starter templates for cafe, hotel, vehicle, emergency"
          >
            {seedTemplatesMutation.isPending ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Sparkles size={13} className="text-amber-300" />
            )}
            <span>Seed Starter Templates</span>
          </button>

          <button
            onClick={() => handleOpenCreateTemplate(selectedFolderKey)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/30 transition cursor-pointer"
          >
            <Plus size={14} />
            <span>Create Template</span>
          </button>

          <button
            onClick={() => handleOpenAddSubservice()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-white hover:bg-slate-100 text-slate-900 shadow-md transition cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Subservice</span>
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* ADMIN QUICK GUIDE (HOW TO USE ALL OF THIS) */}
      {/* ──────────────────────────────────────────────────────────── */}
      {showAdminGuide && (
        <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-3xl border border-indigo-100/80 p-5 sm:p-6 shadow-xs relative">
          <button
            onClick={() => setShowAdminGuide(false)}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            title="Dismiss Guide"
          >
            <X size={16} />
          </button>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-md shadow-indigo-500/20">
              <Info size={20} />
            </div>
            <div className="space-y-2 flex-1">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Admin Quick Guide: How to Use Services & Subservices
                </h3>
                <p className="text-xs text-slate-500">
                  A simple reference designed for non-tech admins to manage custom services without touching code.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
                <div className="bg-white/80 p-3 rounded-2xl border border-indigo-100/70 shadow-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-black text-indigo-900">
                    <Folder size={14} className="text-indigo-600" />
                    <span>1. Category Folders</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Click any service folder (Hotels, Cafes, Vehicles, Emergency, etc.). Surprise Events is kept standalone because it can host any experience.
                  </p>
                </div>

                <div className="bg-white/80 p-3 rounded-2xl border border-indigo-100/70 shadow-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-black text-indigo-900">
                    <Edit size={14} className="text-indigo-600" />
                    <span>2. Editable Templates</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    The top bar in each folder shows templates. You can rename base template names freely and add/remove schema fields (timings, amenities, tags).
                  </p>
                </div>

                <div className="bg-white/80 p-3 rounded-2xl border border-indigo-100/70 shadow-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-black text-indigo-900">
                    <CheckCircle size={14} className="text-emerald-600" />
                    <span>3. Live vs Drafts</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Subservices are divided into 🟢 Live and 🟡 Drafts. You can prepare listings in draft mode and publish them to live with 1 click anytime!
                  </p>
                </div>

                <div className="bg-white/80 p-3 rounded-2xl border border-indigo-100/70 shadow-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-black text-indigo-900">
                    <Sparkles size={14} className="text-amber-500" />
                    <span>4. Prebuilt Starter Sets</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Every service category comes with ready-to-use prebuilt blueprints so you never have to guess what fields are needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* ROOT VIEW: 8 CATEGORY FOLDERS GRID */}
      {/* ──────────────────────────────────────────────────────────── */}
      {!selectedFolderKey ? (
        <div className="space-y-6">
          {/* Summary Metric Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Folder size={20} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Service Folders</p>
                <p className="text-lg font-black text-slate-900">{SERVICE_CATEGORIES.length}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Layers size={20} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Configured Templates</p>
                <p className="text-lg font-black text-slate-900">{allTemplates.length}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle size={20} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Live Subservices</p>
                <p className="text-lg font-black text-emerald-600">
                  {allSubservices.filter((s) => s.status === "published").length}
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Drafts (Unpublished)</p>
                <p className="text-lg font-black text-amber-600">
                  {allSubservices.filter((s) => s.status === "draft").length}
                </p>
              </div>
            </div>
          </div>

          {/* Search Across All Folders */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search subservices or templates across all folders..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-400 outline-none transition"
              />
              {globalSearch && (
                <button
                  onClick={() => setGlobalSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
              <span>Click any folder below to manage templates & listings</span>
            </div>
          </div>

          {/* 8 Folder Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {SERVICE_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const stats = categoryStats[cat.key] || {
                templateCount: 0,
                liveCount: 0,
                draftCount: 0,
                totalSubservices: 0,
              };

              return (
                <div
                  key={cat.key}
                  onClick={() => {
                    setSelectedFolderKey(cat.key);
                    setFolderSubserviceTab("live");
                  }}
                  className="group bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-indigo-300 transition-all duration-200 p-5 flex flex-col justify-between cursor-pointer relative overflow-hidden"
                >
                  {/* Top folder tab styling */}
                  <div className={`h-1.5 w-20 rounded-full bg-gradient-to-r ${cat.gradient} mb-4`} />

                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-800 group-hover:scale-105 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition">
                        <Icon size={24} />
                      </div>
                      <span className="p-1.5 rounded-xl bg-slate-50 text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition">
                        <FolderOpen size={16} />
                      </span>
                    </div>

                    <div>
                      <h3 className="font-black text-slate-900 text-base group-hover:text-indigo-600 transition">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>

                    {/* Folder Metrics Pills */}
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700">
                        {stats.templateCount} Templates
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {stats.liveCount} Live
                      </span>
                      {stats.draftCount > 0 && (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                          {stats.draftCount} Drafts
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Open Folder Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600 group-hover:text-indigo-600 transition">
                    <span>Explore Folder</span>
                    <ChevronRight size={15} className="group-hover:translate-x-1 transition" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ──────────────────────────────────────────────────────────── */
        /* INSIDE FOLDER VIEW: CATEGORY TEMPLATES & SUBSERVICES */
        /* ──────────────────────────────────────────────────────────── */
        <div className="space-y-8">
          {/* Breadcrumb Navigation Bar */}
          <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold">
              <button
                onClick={() => setSelectedFolderKey(null)}
                className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 transition cursor-pointer"
              >
                <Folder size={14} />
                <span>All Services</span>
              </button>
              <ChevronRight size={13} className="text-slate-300" />
              <span className="text-indigo-600 flex items-center gap-1.5">
                {React.createElement(activeFolder.icon, { size: 14 })}
                {activeFolder.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  refetchTemplates();
                  refetchSubservices();
                }}
                className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition cursor-pointer"
                title="Refresh Folder"
              >
                <RefreshCw size={14} />
              </button>
              <button
                onClick={() => setSelectedFolderKey(null)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Switch Folder</span>
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════ */}
          {/* TOP BAR: TEMPLATE CREATION & CONFIGURATION */}
          {/* ══════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  <h2 className="text-base font-black text-slate-900">
                    Templates for {activeFolder.name}
                  </h2>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {folderTemplates.length} configured
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Blueprints defining schema fields (amenities, opening hours, etc.). You can rename templates anytime!
                </p>
              </div>

              <button
                onClick={() => handleOpenCreateTemplate(activeFolder.key)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition cursor-pointer self-start sm:self-auto"
              >
                <Plus size={14} />
                <span>Create New Template</span>
              </button>
            </div>

            {/* Configured Custom Templates */}
            {folderTemplates.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-wider">
                  <BookmarkCheck size={14} className="text-indigo-600" />
                  <span>Your Active Templates in this Folder ({folderTemplates.length})</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {folderTemplates.map((tpl) => (
                    <div
                      key={tpl._id}
                      className="bg-slate-50/80 hover:bg-white rounded-2xl border border-slate-200/90 p-4 transition-all hover:shadow-md flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">
                            {tpl.subService}
                          </span>
                          <div className="flex items-center gap-1">
                            {/* EDIT TEMPLATE BUTTON (BASE TEMPLATE NAME IS EDITABLE!) */}
                            <button
                              onClick={() => handleOpenEditTemplate(tpl)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                              title="Edit Template & Rename"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteTemplate(tpl._id, tpl.templateName)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Delete Template"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <div>
                          {/* Base Template Name */}
                          <h4 className="font-black text-slate-900 text-sm">{tpl.templateName}</h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {tpl.description || "Reusable subservice blueprint"}
                          </p>
                        </div>

                        {/* Fields Preview */}
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <span>Configured Fields ({tpl.fields?.length || 0})</span>
                          </div>
                          <div className="flex items-center gap-1 flex-wrap">
                            {(tpl.fields || []).slice(0, 4).map((f) => (
                              <span
                                key={f.fieldKey}
                                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-50 text-slate-700 border border-slate-200"
                              >
                                {f.label}
                              </span>
                            ))}
                            {(tpl.fields?.length || 0) > 4 && (
                              <span className="text-[10px] font-bold text-slate-400">
                                +{tpl.fields.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between">
                        <button
                          onClick={() => handleOpenAddSubservice(tpl)}
                          className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                        >
                          <Plus size={13} />
                          <span>Use This Template</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditTemplate(tpl)}
                          className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline decoration-slate-300 cursor-pointer"
                        >
                          Rename / Fields
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── PREBUILT BLUEPRINTS SECTION (READY FOR EVERY SERVICE CATEGORY) ── */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>Ready-to-Use Prebuilt Templates for {activeFolder.name}</span>
                </div>
                <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">
                  Click 'Save to My Templates' or 'Use Blueprint' to instantly create subservices
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {prebuiltStarterTemplates.map((prebuilt, pbIdx) => (
                  <div
                    key={pbIdx}
                    className="p-4 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 rounded-2xl border border-indigo-100/90 shadow-2xs flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                            ⚡
                          </span>
                          <span className="font-black text-slate-900 text-xs sm:text-sm">
                            {prebuilt.templateName}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-600">
                          {prebuilt.subService}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {prebuilt.description}
                      </p>

                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {prebuilt.fields.slice(0, 4).map((f) => (
                          <span
                            key={f.fieldKey}
                            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white text-indigo-900 border border-indigo-100"
                          >
                            {f.label}
                          </span>
                        ))}
                        {prebuilt.fields.length > 4 && (
                          <span className="text-[10px] font-bold text-slate-400">
                            +{prebuilt.fields.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-indigo-100/60 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenAddSubservice(prebuilt)}
                        className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                      >
                        <Plus size={13} />
                        <span>Use Blueprint</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenCreateTemplate(activeFolder.key, prebuilt)}
                          className="text-[11px] font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                          title="Customize fields before saving"
                        >
                          Customize & Rename
                        </button>
                        <button
                          onClick={() => handleSavePrebuiltTemplate(prebuilt)}
                          className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition cursor-pointer shadow-2xs"
                        >
                          Save to My Templates
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════ */}
          {/* MAIN SECTION: LIVE & DRAFT SUBSERVICES */}
          {/* ══════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-5">
            {/* Subservices Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>Subservices in {activeFolder.name}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage active listings for users or draft listings being prepared.
                </p>
              </div>

              {/* Add Subservice Action */}
              <button
                onClick={() => handleOpenAddSubservice()}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition cursor-pointer self-start sm:self-auto"
              >
                <Plus size={14} />
                <span>Add New Subservice</span>
              </button>
            </div>

            {/* Filter Bar: Live vs Draft Tabs + Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Tabs: Live vs Draft */}
              <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
                <button
                  onClick={() => setFolderSubserviceTab("live")}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    folderSubserviceTab === "live"
                      ? "bg-white text-emerald-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Live Subservices</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 font-black">
                    {folderSubservices.live.length}
                  </span>
                </button>

                <button
                  onClick={() => setFolderSubserviceTab("draft")}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    folderSubserviceTab === "draft"
                      ? "bg-white text-amber-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Drafts (Unpublished)</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-50 text-amber-700 font-black">
                    {folderSubservices.drafts.length}
                  </span>
                </button>
              </div>

              {/* Search Within this folder */}
              <div className="relative w-full sm:w-64">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={subserviceSearch}
                  onChange={(e) => setSubserviceSearch(e.target.value)}
                  placeholder={`Search ${activeFolder.singular.toLowerCase()}...`}
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-400 outline-none transition"
                />
                {subserviceSearch && (
                  <button
                    onClick={() => setSubserviceSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Subservices Grid */}
            {isSubservicesLoading ? (
              <div className="py-20 flex justify-center text-slate-400">
                <Loader2 size={32} className="animate-spin text-indigo-500" />
              </div>
            ) : (
              (() => {
                const list =
                  folderSubserviceTab === "live"
                    ? folderSubservices.live
                    : folderSubservices.drafts;

                if (list.length === 0) {
                  return (
                    <div className="py-16 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 p-8">
                      <Sparkles size={36} className="mx-auto mb-2 text-slate-300" />
                      <h3 className="text-sm font-bold text-slate-700">
                        {folderSubserviceTab === "live"
                          ? `No live ${activeFolder.name.toLowerCase()} found`
                          : `No drafts in ${activeFolder.name.toLowerCase()}`}
                      </h3>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                        {folderSubserviceTab === "live"
                          ? "Add a new subservice or publish one from your drafts section."
                          : "Drafts will appear here when you save a subservice with Draft status."}
                      </p>
                      <button
                        onClick={() => handleOpenAddSubservice()}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer"
                      >
                        Add {activeFolder.singular}
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {list.map((item) => {
                      const photoUrl =
                        item.photos?.[0]?.url || item.photos?.[0] || "";
                      const customEntries = Object.entries(item.customDetails || {});

                      return (
                        <div
                          key={item._id}
                          className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between"
                        >
                          <div>
                            {/* Card Media Header */}
                            <div className="h-44 bg-slate-900 relative overflow-hidden group">
                              {photoUrl ? (
                                <img
                                  src={photoUrl}
                                  alt={item.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-800">
                                  {React.createElement(activeFolder.icon, {
                                    size: 36,
                                    className: "mb-1 text-slate-600",
                                  })}
                                  <span className="text-[10px] font-mono uppercase text-slate-400">
                                    {item.subService}
                                  </span>
                                </div>
                              )}

                              {/* Badges Overlay */}
                              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur text-white border border-white/20">
                                  {item.subService}
                                </span>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    item.status === "published"
                                      ? "bg-emerald-500 text-white"
                                      : "bg-amber-500 text-white"
                                  }`}
                                >
                                  {item.status === "published" ? "Live" : "Draft"}
                                </span>
                              </div>

                              {/* Views & Clicks overlay */}
                              <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/50 backdrop-blur text-white text-[10px] font-mono flex items-center gap-2">
                                <span className="flex items-center gap-1">
                                  <Eye size={11} /> {item.views || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MousePointerClick size={11} /> {item.clicks || 0}
                                </span>
                              </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-4 space-y-3">
                              <div>
                                <h3 className="font-black text-slate-900 text-base leading-snug line-clamp-1">
                                  {item.title}
                                </h3>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                                  <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                                  <span className="truncate">
                                    {item.location?.address || item.location?.city || "Jhansi"}
                                  </span>
                                </div>
                                {item.contact?.phone && (
                                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                                    <Phone size={12} className="text-slate-400 flex-shrink-0" />
                                    <span>{item.contact.phone}</span>
                                  </div>
                                )}
                              </div>

                              {/* Custom Attributes Preview */}
                              {customEntries.length > 0 && (
                                <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                                    Configured Attributes ({customEntries.length})
                                  </span>
                                  <div className="space-y-1 pt-0.5">
                                    {customEntries.slice(0, 3).map(([k, v]) => (
                                      <div key={k} className="flex justify-between text-[11px]">
                                        <span className="text-slate-500 capitalize">
                                          {k.replace(/([A-Z])/g, " $1")}:
                                        </span>
                                        <span className="font-bold text-slate-800 truncate max-w-[140px]">
                                          {Array.isArray(v) ? v.join(", ") : String(v)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Card Action Footer */}
                          <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                            {/* 1-Click Status Toggle */}
                            <button
                              onClick={() => handleToggleSubserviceStatus(item)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                                item.status === "published"
                                  ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200"
                                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                              }`}
                              title={
                                item.status === "published"
                                  ? "Move to Drafts (hide from live site)"
                                  : "Publish to Live Site"
                              }
                            >
                              {item.status === "published" ? (
                                <>
                                  <Clock size={12} />
                                  <span>Move to Draft</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle size={12} />
                                  <span>Publish Live</span>
                                </>
                              )}
                            </button>

                            <div className="flex items-center gap-1">
                              {/* Edit Subservice */}
                              <button
                                onClick={() => handleOpenEditSubservice(item)}
                                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition cursor-pointer"
                                title="Edit Subservice Details"
                              >
                                <Edit size={15} />
                              </button>

                              {/* Delete Subservice */}
                              <button
                                onClick={() => handleDeleteSubservice(item._id, item.title)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                                title="Delete Subservice"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MODAL 1: TEMPLATE CREATION / EDIT (BASE NAME IS EDITABLE!) */}
      {/* ──────────────────────────────────────────────────────────── */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  {editingTemplate ? "Edit Subservice Template" : "Create New Subservice Template"}
                </h2>
                <p className="text-xs text-slate-500">
                  {editingTemplate
                    ? "Modify template name, subservice slug, or add/remove dynamic fields."
                    : "Define a reusable blueprint for a specific subservice type."}
                </p>
              </div>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveTemplate} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* BASE TEMPLATE NAME (FULLY EDITABLE!) */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Template Name * <span className="text-slate-400 font-normal">(Editable)</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Specialty Cafe & Roastery, Luxury Heritage Resort"
                    value={templateForm.templateName}
                    onChange={(e) =>
                      setTemplateForm({ ...templateForm, templateName: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-indigo-500 outline-none transition"
                  />
                </div>

                {/* Subservice Slug */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    SubService Slug * <span className="text-slate-400 font-normal">(e.g. cafe, pub, resort)</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. cafe, pub, resort, ambulance"
                    value={templateForm.subService}
                    onChange={(e) =>
                      setTemplateForm({ ...templateForm, subService: e.target.value })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:bg-white focus:border-indigo-500 outline-none transition"
                  />
                </div>

                {/* Service Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Folder Category</label>
                  <select
                    value={templateForm.category}
                    onChange={(e) =>
                      setTemplateForm({ ...templateForm, category: e.target.value })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none transition cursor-pointer"
                  >
                    {SERVICE_CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Template Description</label>
                  <input
                    type="text"
                    placeholder="Brief note about what kind of subservices use this blueprint..."
                    value={templateForm.description}
                    onChange={(e) =>
                      setTemplateForm({ ...templateForm, description: e.target.value })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Dynamic Schema Fields Builder */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2.5">
                  <div>
                    <span className="text-xs font-black uppercase text-slate-700 tracking-wider">
                      Schema Custom Fields ({templateForm.fields.length})
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Fields that will appear when adding a subservice using this template
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFieldToTemplate}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-100 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Add Field</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {templateForm.fields.map((f, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-2.5"
                    >
                      <input
                        type="text"
                        placeholder="fieldKey"
                        value={f.fieldKey}
                        onChange={(e) => {
                          const updated = [...templateForm.fields];
                          updated[idx].fieldKey = e.target.value;
                          setTemplateForm({ ...templateForm, fields: updated });
                        }}
                        className="w-28 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                        title="Key name in JSON"
                      />

                      <input
                        type="text"
                        placeholder="Display Label (e.g. WiFi, Pool)"
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
                        className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        {FIELD_TYPES.map((ft) => (
                          <option key={ft.id} value={ft.id}>
                            {ft.label}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoveFieldFromTemplate(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title="Remove Field"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingTemplate}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  {isSavingTemplate && <Loader2 size={14} className="animate-spin" />}
                  <span>{editingTemplate ? "Update Template" : "Save Template"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MODAL 2: ADD / EDIT SUBSERVICE LISTING */}
      {/* ──────────────────────────────────────────────────────────── */}
      {showSubserviceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  {editingSubservice ? "Edit Subservice Listing" : "Add New Subservice Listing"}
                </h2>
                <p className="text-xs text-slate-500">
                  Configure business details, select status (Live or Draft), and fill custom attributes.
                </p>
              </div>
              <button
                onClick={() => setShowSubserviceModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveSubservice} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Template Picker */}
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black text-indigo-950">Subservice Template Blueprint</p>
                  <p className="text-[11px] text-indigo-700">
                    Applying a template pre-configures category, subservice slug & dynamic attributes
                  </p>
                </div>
                <select
                  value={subserviceForm.templateId}
                  onChange={(e) => handleSelectTemplateForSubservice(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-indigo-900 outline-none cursor-pointer"
                >
                  <option value="">-- Choose Base Template (Optional) --</option>
                  {allTemplates.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.templateName} ({t.subService})
                    </option>
                  ))}
                </select>
              </div>

              {/* Core Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Business / Place Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Roastery Coffee House, Jhansi Central Hospital"
                    value={subserviceForm.title}
                    onChange={(e) =>
                      setSubserviceForm({ ...subserviceForm, title: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-indigo-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={subserviceForm.category}
                    onChange={(e) =>
                      setSubserviceForm({ ...subserviceForm, category: e.target.value })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none transition cursor-pointer"
                  >
                    {SERVICE_CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    SubService Slug * <span className="text-slate-400 font-normal">(e.g. cafe, resort)</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. cafe, pub, resort, rental"
                    value={subserviceForm.subService}
                    onChange={(e) =>
                      setSubserviceForm({ ...subserviceForm, subService: e.target.value })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:bg-white focus:border-indigo-500 outline-none transition"
                  />
                </div>

                {/* Status: Live vs Draft */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Publication Status</label>
                  <select
                    value={subserviceForm.status}
                    onChange={(e) =>
                      setSubserviceForm({ ...subserviceForm, status: e.target.value })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-indigo-500 outline-none transition cursor-pointer"
                  >
                    <option value="published">🟢 Published (Live on Site)</option>
                    <option value="draft">🟡 Draft (Hidden / In-progress)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 9876543210"
                    value={subserviceForm.phone}
                    onChange={(e) =>
                      setSubserviceForm({ ...subserviceForm, phone: e.target.value })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    placeholder="e.g. contact@business.com"
                    value={subserviceForm.email}
                    onChange={(e) =>
                      setSubserviceForm({ ...subserviceForm, email: e.target.value })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="Jhansi"
                    value={subserviceForm.city}
                    onChange={(e) =>
                      setSubserviceForm({ ...subserviceForm, city: e.target.value })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-500 outline-none transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Near Fort Gate, Sadar Bazar, Jhansi"
                    value={subserviceForm.address}
                    onChange={(e) =>
                      setSubserviceForm({ ...subserviceForm, address: e.target.value })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-500 outline-none transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Short description highlighting what makes this service special..."
                    value={subserviceForm.description}
                    onChange={(e) =>
                      setSubserviceForm({ ...subserviceForm, description: e.target.value })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Dynamic Custom Fields Section */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-black uppercase text-slate-700 tracking-wider">
                      Custom Attributes & Schema Data ({customFieldsList.length})
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Configured from template schema or added on-the-fly
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddDynamicAttribute}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Add Custom Field</span>
                  </button>
                </div>

                {customFieldsList.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    No custom fields configured yet. Select a template above or click 'Add Custom Field'.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                    {customFieldsList.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 capitalize">
                            {item.label}
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveDynamicAttribute(idx)}
                            className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title="Remove attribute"
                          >
                            <X size={13} />
                          </button>
                        </div>

                        {item.type === "boolean" ? (
                          <label className="flex items-center gap-2 cursor-pointer pt-1">
                            <input
                              type="checkbox"
                              checked={Boolean(item.value)}
                              onChange={(e) => {
                                const updated = [...customFieldsList];
                                updated[idx].value = e.target.checked;
                                setCustomFieldsList(updated);
                              }}
                              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                            />
                            <span className="text-xs font-semibold text-slate-700">
                              {item.value ? "Yes (Enabled)" : "No (Disabled)"}
                            </span>
                          </label>
                        ) : item.type === "textarea" ? (
                          <textarea
                            rows={2}
                            value={item.value || ""}
                            onChange={(e) => {
                              const updated = [...customFieldsList];
                              updated[idx].value = e.target.value;
                              setCustomFieldsList(updated);
                            }}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        ) : (
                          <input
                            type={item.type === "number" ? "number" : "text"}
                            placeholder={
                              item.type === "multiselect"
                                ? "Comma-separated (e.g. WiFi, AC, Parking)"
                                : `Enter ${item.label}...`
                            }
                            value={item.value || ""}
                            onChange={(e) => {
                              const updated = [...customFieldsList];
                              updated[idx].value = e.target.value;
                              setCustomFieldsList(updated);
                            }}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Photos & Media Upload Section */}
              <div className="pt-3 border-t border-slate-100">
                <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1.5">
                  Photos & Media Upload (Direct to Cloudflare R2)
                </label>

                {/* Existing Photos Thumbnails */}
                {existingPhotos.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {existingPhotos.map((p, pIdx) => {
                      const url = typeof p === "string" ? p : p?.url || "";
                      return (
                        <div
                          key={pIdx}
                          className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 group"
                        >
                          <img src={url} alt="Photo" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingPhoto(pIdx)}
                            className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white hover:bg-rose-600 transition cursor-pointer"
                            title="Remove photo"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* File Drop Area */}
                <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/70 text-center hover:bg-indigo-50/20 hover:border-indigo-300 transition cursor-pointer relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setPhotoFiles(Array.from(e.target.files || []))}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <UploadCloud size={24} className="mx-auto text-slate-400 mb-1" />
                  <p className="text-xs font-bold text-slate-700">
                    {photoFiles.length > 0
                      ? `${photoFiles.length} new photos selected for R2 upload`
                      : "Drag & drop photos or click to browse"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Images will upload directly to R2 with lightning speed
                  </p>
                </div>
              </div>

              {/* Save / Cancel Action Bar */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSubserviceModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingSubservice}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  {isSavingSubservice && <Loader2 size={14} className="animate-spin" />}
                  <span>
                    {editingSubservice
                      ? "Update Subservice"
                      : subserviceForm.status === "published"
                      ? "Publish Live"
                      : "Save to Drafts"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
