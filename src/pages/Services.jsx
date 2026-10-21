import React, { useState, useMemo } from "react";
import {
  Folder, Layers, Plus, Trash2, Edit, Loader2, Sparkles, X, Check,
  ChevronRight, ArrowLeft, Hotel, Utensils, Car, ShieldAlert,
  Compass, ShoppingBag, Search, CheckCircle, RefreshCw, AlertCircle,
  SlidersHorizontal, Info, Eye, BookmarkCheck, ArrowRight, ShieldCheck,
  FileText, MapPin, Phone, Mail, Globe, ExternalLink, RotateCcw, AlertTriangle,
  UploadCloud, Tag
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

/* ─── 7 CORE SERVICE CATEGORIES ─── */
const SERVICE_CATEGORIES = [
  {
    key: "hotel/resorts",
    name: "Hotels & Resorts",
    singular: "Hotel / Resort",
    icon: Hotel,
    gradient: "from-blue-600 to-indigo-700",
    description: "Luxury resorts, boutique stays, lodges, homestays & heritage palaces",
  },
  {
    key: "restaurants/bars",
    name: "Restaurants & Bars",
    singular: "Restaurant / Bar",
    icon: Utensils,
    gradient: "from-amber-500 to-orange-600",
    description: "Fine dining, rooftop cafes, specialty bars, family bistros & street hubs",
  },
  {
    key: "vehicle",
    name: "Vehicles & Rentals",
    singular: "Vehicle Rental",
    icon: Car,
    gradient: "from-emerald-500 to-teal-700",
    description: "Self-drive cars, bike rentals, airport taxis, e-rickshaws & tourist vans",
  },
  {
    key: "emergency",
    name: "Emergency 24/7",
    singular: "Emergency Service",
    icon: ShieldAlert,
    gradient: "from-rose-500 to-red-700",
    description: "24/7 ambulances, emergency hospitals, police stations & roadside help",
  },
  {
    key: "guide/travel agency",
    name: "Guides & Agencies",
    singular: "Guide / Agency",
    icon: Compass,
    gradient: "from-cyan-500 to-blue-600",
    description: "Certified heritage guides, local tour operators, custom trip planners",
  },
  {
    key: "shopping",
    name: "Shopping & Stores",
    singular: "Store / Shop",
    icon: ShoppingBag,
    gradient: "from-violet-500 to-purple-700",
    description: "Handicraft emporiums, brassware markets, local souvenir shops & boutiques",
  },
  {
    key: "others",
    name: "Other Services",
    singular: "Service",
    icon: Layers,
    gradient: "from-slate-700 to-slate-900",
    description: "Luggage storage, photo/drone shoots, equipment rental & local conveniences",
  },
];

/* ─── CURATED RELATABLE SUBSERVICES PER SERVICE CATEGORY ─── */
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

/* ─── RECOMMENDED STARTER BLUEPRINTS PER SUBSERVICE SLUG ─── */
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
  // Navigation Hierarchy:
  // Level 1: selectedCategoryKey === null (7 Folders)
  // Level 2: selectedCategoryKey !== null && selectedSubserviceSlug === null (Subservices of that service)
  // Level 3: selectedCategoryKey !== null && selectedSubserviceSlug !== null (Inside that subservice: Template + Objects)
  const [selectedCategoryKey, setSelectedCategoryKey] = useState(null);
  const [selectedSubserviceSlug, setSelectedSubserviceSlug] = useState(null);

  // Filters
  const [subserviceStatusFilter, setSubserviceStatusFilter] = useState("all"); // "all" | "live" | "draft"
  const [objectStatusFilter, setObjectStatusFilter] = useState("all"); // "all" | "published" | "draft" | "archived"
  const [searchQuery, setSearchQuery] = useState("");

  // Subservice Category Modal State (Class creation only)
  const [showSubserviceModal, setShowSubserviceModal] = useState(false);
  const [editingSubservice, setEditingSubservice] = useState(null);
  const [subserviceForm, setSubserviceForm] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: true,
  });

  // Blueprint Template Modal State (Strictly for that subservice)
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    id: null,
    templateName: "",
    description: "",
    fields: [],
  });

  // Object (Listing) Modal State (Creating an object from that template)
  const [showObjectModal, setShowObjectModal] = useState(false);
  const [editingObject, setEditingObject] = useState(null);
  const [isSubmittingObject, setIsSubmittingObject] = useState(false);
  const [objectForm, setObjectForm] = useState({
    title: "",
    description: "",
    contact: { phone: "", email: "", website: "" },
    location: { address: "", city: "Jhansi", googleMapsUrl: "" },
    customDetails: {},
    photos: [],
    status: "published",
  });

  // Object Details Modal View (Full details view with Edit, Soft Delete, Hard Delete)
  const [selectedObjectForDetails, setSelectedObjectForDetails] = useState(null);

  // Queries & Mutations
  const {
    data: templatesRes,
    isLoading: loadingTemplates,
    refetch: refetchTemplates,
  } = useServiceTemplatesQuery({ all: "true", includeInactive: "true" });

  const {
    data: customServicesRes,
    isLoading: loadingCustomServices,
    refetch: refetchCustomServices,
  } = useCustomServicesQuery({
    category: selectedCategoryKey || undefined,
    subService: selectedSubserviceSlug || undefined,
    status: "ALL",
  });

  const createTemplateMut = useCreateServiceTemplateMutation();
  const updateTemplateMut = useUpdateServiceTemplateMutation();
  const deleteTemplateMut = useDeleteServiceTemplateMutation();
  const seedTemplatesMut = useSeedDefaultTemplatesMutation();

  const createCustomServiceMut = useCreateCustomServiceMutation();
  const updateCustomServiceMut = useUpdateCustomServiceMutation();
  const deleteCustomServiceMut = useDeleteCustomServiceMutation();

  const allTemplates = useMemo(() => {
    return templatesRes?.data || templatesRes?.templates || (Array.isArray(templatesRes) ? templatesRes : []);
  }, [templatesRes]);

  const allCustomServices = useMemo(() => {
    return customServicesRes?.data || (Array.isArray(customServicesRes) ? customServicesRes : []);
  }, [customServicesRes]);

  // Current Selected Category Object
  const selectedCategory = useMemo(() => {
    return SERVICE_CATEGORIES.find((c) => c.key === selectedCategoryKey) || null;
  }, [selectedCategoryKey]);

  // Subservices list for the selected category folder
  const currentCategorySubservices = useMemo(() => {
    if (!selectedCategoryKey) return [];

    const catTemplates = allTemplates.filter((t) => t.category === selectedCategoryKey);
    const presets = RELATABLE_SUBSERVICES_BY_CATEGORY[selectedCategoryKey] || [];

    const map = new Map();

    presets.forEach((preset) => {
      map.set(preset.slug.toLowerCase(), {
        name: preset.name,
        slug: preset.slug.toLowerCase(),
        description: preset.description,
        template: null,
        isActive: true,
        isPreset: true,
      });
    });

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

    if (searchQuery.trim() && !selectedSubserviceSlug) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.slug.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
      );
    }

    if (subserviceStatusFilter === "live") {
      list = list.filter((item) => item.isActive);
    } else if (subserviceStatusFilter === "draft") {
      list = list.filter((item) => !item.isActive);
    }

    return list;
  }, [selectedCategoryKey, allTemplates, searchQuery, subserviceStatusFilter, selectedSubserviceSlug]);

  // Currently Selected Subservice Object (when inside level 3)
  const currentSubservice = useMemo(() => {
    if (!selectedSubserviceSlug || !selectedCategoryKey) return null;
    return (
      currentCategorySubservices.find((s) => s.slug === selectedSubserviceSlug) || {
        name: selectedSubserviceSlug,
        slug: selectedSubserviceSlug,
        description: "",
        template: allTemplates.find(
          (t) => t.category === selectedCategoryKey && t.subService === selectedSubserviceSlug
        ),
        isActive: true,
      }
    );
  }, [selectedSubserviceSlug, selectedCategoryKey, currentCategorySubservices, allTemplates]);

  // Objects (Listings) belonging to this selected subservice
  const currentSubserviceObjects = useMemo(() => {
    if (!selectedSubserviceSlug || !selectedCategoryKey) return [];

    let list = allCustomServices.filter(
      (obj) =>
        obj.category === selectedCategoryKey &&
        obj.subService?.toLowerCase() === selectedSubserviceSlug.toLowerCase()
    );

    if (objectStatusFilter === "published") {
      list = list.filter((obj) => obj.status === "published");
    } else if (objectStatusFilter === "draft") {
      list = list.filter((obj) => obj.status === "draft");
    } else if (objectStatusFilter === "archived") {
      list = list.filter((obj) => obj.status === "archived");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (obj) =>
          obj.title?.toLowerCase().includes(q) ||
          obj.location?.city?.toLowerCase().includes(q) ||
          obj.location?.address?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [selectedSubserviceSlug, selectedCategoryKey, allCustomServices, objectStatusFilter, searchQuery]);

  // Catalog Statistics
  const catalogStats = useMemo(() => {
    const totalCategories = SERVICE_CATEGORIES.length;
    const totalTemplates = allTemplates.length;
    const totalObjects = allCustomServices.length;
    const publishedObjects = allCustomServices.filter((o) => o.status === "published").length;

    const byCategory = {};
    SERVICE_CATEGORIES.forEach((cat) => {
      const catTemplates = allTemplates.filter((t) => t.category === cat.key);
      const catObjects = allCustomServices.filter((o) => o.category === cat.key);
      const presets = RELATABLE_SUBSERVICES_BY_CATEGORY[cat.key] || [];
      const uniqueSlugs = new Set([
        ...catTemplates.map((t) => t.subService?.toLowerCase()),
        ...presets.map((p) => p.slug?.toLowerCase()),
      ]);
      byCategory[cat.key] = {
        subservicesCount: uniqueSlugs.size,
        objectsCount: catObjects.length,
      };
    });

    return { totalCategories, totalTemplates, totalObjects, publishedObjects, byCategory };
  }, [allTemplates, allCustomServices]);

  /* ─── LEVEL 2: SUBSERVICE CLASS CREATION / EDITING ─── */
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

  const handleOpenEditSubservice = (subservice, e) => {
    e?.stopPropagation();
    setEditingSubservice(subservice);
    setSubserviceForm({
      name: subservice.name,
      slug: subservice.slug,
      description: subservice.description,
      isActive: subservice.isActive,
    });
    setShowSubserviceModal(true);
  };

  const handleSaveSubservice = async (e) => {
    e.preventDefault();
    const cleanSlug = subserviceForm.slug.trim().toLowerCase().replace(/[\s.-]+/g, "_");
    if (!cleanSlug) {
      toast.error("Please enter a relatable slug");
      return;
    }

    try {
      const existingTemplate = editingSubservice?.template;
      if (existingTemplate?._id) {
        await updateTemplateMut.mutateAsync({
          id: existingTemplate._id,
          data: {
            subService: cleanSlug,
            description: subserviceForm.description,
            isActive: subserviceForm.isActive,
          },
        });
        toast.success(`Subservice "${subserviceForm.name}" updated!`);
      } else {
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
        toast.success(`Subservice "${subserviceForm.name}" created!`);
      }
      setShowSubserviceModal(false);
      refetchTemplates();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save subservice");
    }
  };

  /* ─── LEVEL 3: TEMPLATE BLUEPRINT CONFIGURATION (FOR THIS SUBSERVICE ONLY) ─── */
  const handleOpenConfigureTemplate = () => {
    if (!currentSubservice) return;
    const t = currentSubservice.template;
    if (t) {
      setTemplateForm({
        id: t._id,
        templateName: t.templateName || `${currentSubservice.name} Blueprint`,
        description: t.description || currentSubservice.description || "",
        fields: t.fields || [],
      });
    } else {
      const defaultFields = RECOMMENDED_BLUEPRINT_FIELDS[currentSubservice.slug] || [
        { fieldKey: "amenities", label: "Special Features", fieldType: "tags", defaultValue: [] },
        { fieldKey: "starting_price", label: "Starting Price (₹)", fieldType: "number", defaultValue: 1000 },
      ];
      setTemplateForm({
        id: null,
        templateName: `${currentSubservice.name} Blueprint`,
        description: currentSubservice.description || "",
        fields: defaultFields,
      });
    }
    setShowTemplateModal(true);
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
        subService: currentSubservice.slug,
        description: templateForm.description,
        fields: templateForm.fields,
        isActive: currentSubservice.isActive,
      };

      if (templateForm.id) {
        await updateTemplateMut.mutateAsync({ id: templateForm.id, data: payload });
        toast.success(`Template "${templateForm.templateName}" updated!`);
      } else {
        await createTemplateMut.mutateAsync(payload);
        toast.success(`Template "${templateForm.templateName}" created!`);
      }

      setShowTemplateModal(false);
      refetchTemplates();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save template");
    }
  };

  const handleSeedCurrentSubserviceTemplate = async () => {
    if (!currentSubservice) return;
    const defaultFields = RECOMMENDED_BLUEPRINT_FIELDS[currentSubservice.slug] || [
      { fieldKey: "amenities", label: "Amenities & Highlights", fieldType: "tags", defaultValue: [] },
      { fieldKey: "starting_price", label: "Starting Price (₹)", fieldType: "number", defaultValue: 1000 },
    ];
    try {
      await createTemplateMut.mutateAsync({
        templateName: `${currentSubservice.name} Blueprint`,
        category: selectedCategoryKey,
        subService: currentSubservice.slug,
        description: currentSubservice.description,
        fields: defaultFields,
        isActive: true,
      });
      toast.success(`Seeded blueprint template for "${currentSubservice.name}"!`);
      refetchTemplates();
    } catch (err) {
      toast.error("Template already exists or failed to seed");
    }
  };

  /* ─── LEVEL 3: OBJECT (LISTING) CREATION / EDITING USING TEMPLATE ─── */
  const handleOpenCreateObject = () => {
    setEditingObject(null);
    const initialCustomDetails = {};
    const templateFields = currentSubservice?.template?.fields || [];
    templateFields.forEach((f) => {
      initialCustomDetails[f.fieldKey] = f.defaultValue !== null ? f.defaultValue : "";
    });

    setObjectForm({
      title: "",
      description: "",
      contact: { phone: "", email: "", website: "" },
      location: { address: "", city: "Jhansi", googleMapsUrl: "" },
      customDetails: initialCustomDetails,
      photos: [],
      status: "published",
    });
    setShowObjectModal(true);
  };

  const handleOpenEditObject = (obj) => {
    setEditingObject(obj);
    setObjectForm({
      title: obj.title || "",
      description: obj.description || "",
      contact: {
        phone: obj.contact?.phone || "",
        email: obj.contact?.email || "",
        website: obj.contact?.website || "",
      },
      location: {
        address: obj.location?.address || "",
        city: obj.location?.city || "Jhansi",
        googleMapsUrl: obj.location?.googleMapsUrl || "",
      },
      customDetails: obj.customDetails || {},
      photos: [],
      status: obj.status || "published",
    });
    setShowObjectModal(true);
  };

  const handleSaveObject = async (e) => {
    e.preventDefault();
    if (!objectForm.title.trim()) {
      toast.error("Object / Business title is required");
      return;
    }

    setIsSubmittingObject(true);
    try {
      let uploadedPhotoAssets = [];
      if (objectForm.photos && objectForm.photos.length > 0) {
        uploadedPhotoAssets = await uploadMultipleFilesDirectToR2(
          objectForm.photos,
          `services/${selectedSubserviceSlug}`,
          "image"
        );
      }

      const payload = {
        title: objectForm.title.trim(),
        category: selectedCategoryKey,
        subService: selectedSubserviceSlug,
        templateId: currentSubservice?.template?._id || undefined,
        description: objectForm.description,
        contact: objectForm.contact,
        location: objectForm.location,
        customDetails: objectForm.customDetails,
        status: objectForm.status,
        photos: editingObject
          ? [...(editingObject.photos || []), ...uploadedPhotoAssets]
          : uploadedPhotoAssets,
      };

      if (editingObject?._id) {
        await updateCustomServiceMut.mutateAsync({ id: editingObject._id, data: payload });
        toast.success(`Object "${objectForm.title}" updated successfully!`);
        if (selectedObjectForDetails?._id === editingObject._id) {
          setSelectedObjectForDetails((prev) => ({ ...prev, ...payload }));
        }
      } else {
        await createCustomServiceMut.mutateAsync(payload);
        toast.success(`New ${currentSubservice.name} object created!`);
      }

      setShowObjectModal(false);
      refetchCustomServices();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save object");
    } finally {
      setIsSubmittingObject(false);
    }
  };

  /* ─── OBJECT DETAILS: SOFT DELETE, RESTORE, HARD DELETE ─── */
  const handleSoftDeleteObject = async (obj) => {
    try {
      await updateCustomServiceMut.mutateAsync({
        id: obj._id,
        data: { status: "archived" },
      });
      toast.success(`Moved "${obj.title}" to Trash (soft-deleted).`);
      setSelectedObjectForDetails(null);
      refetchCustomServices();
    } catch (err) {
      toast.error("Failed to soft-delete object");
    }
  };

  const handleRestoreObject = async (obj) => {
    try {
      await updateCustomServiceMut.mutateAsync({
        id: obj._id,
        data: { status: "published" },
      });
      toast.success(`Restored "${obj.title}" to Live!`);
      setSelectedObjectForDetails(null);
      refetchCustomServices();
    } catch (err) {
      toast.error("Failed to restore object");
    }
  };

  const handleHardDeleteObject = async (obj) => {
    const confirmed = window.confirm(
      `⚠️ PERMANENT DELETION:\n\nAre you sure you want to permanently delete "${obj.title}"?\nThis cannot be undone and will delete all photos from Cloud storage.`
    );
    if (!confirmed) return;

    try {
      await deleteCustomServiceMut.mutateAsync(obj._id);
      toast.success(`Permanently deleted "${obj.title}".`);
      setSelectedObjectForDetails(null);
      refetchCustomServices();
    } catch (err) {
      toast.error("Failed to delete object");
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* ════════════════════════════════════════════════════════════
          TOP EXECUTIVE STATS HUB
          ════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
              <Layers size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Services & Subservices Architecture
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {selectedSubserviceSlug
                  ? `Level 3: ${currentSubservice?.name} Template & Live Objects`
                  : selectedCategoryKey
                  ? `Level 2: ${selectedCategory?.name} Subservice Categories`
                  : "Level 1: 7 Core Service Folders Directory"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                refetchTemplates();
                refetchCustomServices();
              }}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw
                size={16}
                className={loadingTemplates || loadingCustomServices ? "animate-spin text-indigo-600" : ""}
              />
            </button>
          </div>
        </div>

        {/* 4 Stat Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Service Domains
            </span>
            <span className="text-2xl font-black text-slate-900">{catalogStats.totalCategories}</span>
          </div>

          <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block mb-0.5">
              Blueprint Schemas
            </span>
            <span className="text-2xl font-black text-indigo-950">{catalogStats.totalTemplates}</span>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-0.5">
              Live Business Objects
            </span>
            <span className="text-2xl font-black text-emerald-950">{catalogStats.publishedObjects}</span>
          </div>

          <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block mb-0.5">
              Total Instances
            </span>
            <span className="text-2xl font-black text-purple-950">{catalogStats.totalObjects}</span>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          LEVEL 1: ALL 7 SERVICE FOLDERS
          ════════════════════════════════════════════════════════════ */}
      {!selectedCategoryKey ? (
        <div className="space-y-6">
          {/* Surprise Events Regional Domain Spotlight */}
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

          {/* 7 Clean Folder Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICE_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const stats = catalogStats.byCategory[cat.key] || { subservicesCount: 0, objectsCount: 0 };
              return (
                <div
                  key={cat.key}
                  onClick={() => {
                    setSelectedCategoryKey(cat.key);
                    setSelectedSubserviceSlug(null);
                    setSearchQuery("");
                  }}
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

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500">{stats.objectsCount} Live Objects</span>
                    <div className="flex items-center gap-1 text-indigo-600 group-hover:translate-x-1 transition">
                      <span>Open Folder</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : !selectedSubserviceSlug ? (
        /* ════════════════════════════════════════════════════════════
            LEVEL 2: SUBSERVICES OF THIS SERVICE
            (Only "+ Create Subservice" option here! No direct template or seed)
            ════════════════════════════════════════════════════════════ */
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedCategoryKey(null)}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  title="Back to All 7 Folders"
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

              {/* ONLY OPTION HERE: Create Subservice for this particular service */}
              <button
                onClick={handleOpenAddSubservice}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition cursor-pointer self-start sm:self-auto"
              >
                <Plus size={16} />
                <span>Create Subservice</span>
              </button>
            </div>

            {/* Filter Tabs & Search */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setSubserviceStatusFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    subserviceStatusFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All ({currentCategorySubservices.length})
                </button>
                <button
                  onClick={() => setSubserviceStatusFilter("live")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    subserviceStatusFilter === "live" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🟢 Live Only
                </button>
                <button
                  onClick={() => setSubserviceStatusFilter("draft")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    subserviceStatusFilter === "draft" ? "bg-amber-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
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
                  placeholder="Search subservices..."
                  className="w-full pl-9 pr-3.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-hidden transition"
                />
              </div>
            </div>
          </div>

          {/* Subservices List (Clicking opens Level 3) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentCategorySubservices.map((subservice) => {
              const objectsCount = allCustomServices.filter(
                (o) => o.category === selectedCategoryKey && o.subService === subservice.slug
              ).length;

              return (
                <div
                  key={subservice.slug}
                  onClick={() => {
                    setSelectedSubserviceSlug(subservice.slug);
                    setSearchQuery("");
                  }}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-black text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition">
                            {subservice.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-600">
                            slug: {subservice.slug}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {subservice.description || "Subservice category class"}
                        </p>
                      </div>

                      {subservice.isActive ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700">
                          🟢 Live
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-700">
                          🟡 Draft
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">
                      {objectsCount} Listing Object{objectsCount !== 1 ? "s" : ""}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleOpenEditSubservice(subservice, e)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                        title="Edit Subservice Category"
                      >
                        <Edit size={14} />
                      </button>

                      <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition">
                        <span>Open Subservice</span>
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ════════════════════════════════════════════════════════════
            LEVEL 3: INSIDE THAT PARTICULAR SUBSERVICE
            (Admin sees template available for this subservice, seed option, and objects grid)
            ════════════════════════════════════════════════════════════ */
        <div className="space-y-6">
          {/* Subservice Breadcrumbs Header */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedSubserviceSlug(null)}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  title={`Back to ${selectedCategory?.name} Subservices`}
                >
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <span
                      onClick={() => setSelectedCategoryKey(null)}
                      className="cursor-pointer hover:underline"
                    >
                      Services
                    </span>
                    <ChevronRight size={12} />
                    <span
                      onClick={() => setSelectedSubserviceSlug(null)}
                      className="cursor-pointer hover:underline"
                    >
                      {selectedCategory?.name}
                    </span>
                    <ChevronRight size={12} />
                    <span className="text-indigo-600">{currentSubservice?.name}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                    {currentSubservice?.name}
                  </h2>
                </div>
              </div>

              {/* Primary Action: Create Object from that template */}
              <button
                onClick={handleOpenCreateObject}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition cursor-pointer self-start sm:self-auto"
              >
                <Plus size={16} />
                <span>Create {currentSubservice?.name} Object</span>
              </button>
            </div>

            {/* Template Available for this Subservice Card */}
            <div className="bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-slate-50 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white">
                    Available Blueprint Template
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    slug: <code className="text-indigo-700 font-bold">{currentSubservice?.slug}</code>
                  </span>
                </div>
                <h4 className="text-sm font-black text-slate-900">
                  Template: {currentSubservice?.template?.templateName || `${currentSubservice?.name} Blueprint`}
                </h4>
                <p className="text-xs text-slate-600">
                  {currentSubservice?.template?.fields?.length || 0} blueprint schema fields configured (
                  {currentSubservice?.template?.fields?.map((f) => f.label).join(", ") || "No fields yet"}
                  )
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!currentSubservice?.template && (
                  <button
                    type="button"
                    onClick={handleSeedCurrentSubserviceTemplate}
                    className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
                  >
                    Seed Starter Template
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleOpenConfigureTemplate}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <SlidersHorizontal size={13} />
                  <span>Configure Template</span>
                </button>
              </div>
            </div>

            {/* Objects Filter Bar: Live vs Drafts vs Trash */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setObjectStatusFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    objectStatusFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All Objects ({currentSubserviceObjects.length})
                </button>
                <button
                  onClick={() => setObjectStatusFilter("published")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    objectStatusFilter === "published" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🟢 Live / Published
                </button>
                <button
                  onClick={() => setObjectStatusFilter("draft")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    objectStatusFilter === "draft" ? "bg-amber-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🟡 Drafts
                </button>
                <button
                  onClick={() => setObjectStatusFilter("archived")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    objectStatusFilter === "archived" ? "bg-rose-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🗑️ Trash / Soft-Deleted
                </button>
              </div>

              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${currentSubservice?.name} objects...`}
                  className="w-full pl-9 pr-3.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-hidden transition"
                />
              </div>
            </div>
          </div>

          {/* Objects (Listings) Grid */}
          {currentSubserviceObjects.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
                <FileText size={22} />
              </div>
              <h4 className="text-sm font-bold text-slate-700">No objects found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Click "Create {currentSubservice?.name} Object" to instantiate a new listing using this subservice's template blueprint.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {currentSubserviceObjects.map((obj) => (
                <div
                  key={obj._id}
                  onClick={() => setSelectedObjectForDetails(obj)}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Media Thumbnail */}
                    <div className="relative h-44 bg-slate-100 overflow-hidden">
                      {obj.photos?.[0]?.url ? (
                        <img
                          src={obj.photos[0].url}
                          alt={obj.title}
                          className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-indigo-400 font-bold bg-indigo-50">
                          {obj.title}
                        </div>
                      )}

                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        {obj.status === "published" ? (
                          <span className="px-2.5 py-1 bg-emerald-900/80 backdrop-blur-xs text-white text-[10px] font-extrabold rounded-full uppercase flex items-center gap-1">
                            <CheckCircle size={10} /> Live
                          </span>
                        ) : obj.status === "archived" ? (
                          <span className="px-2.5 py-1 bg-rose-900/80 backdrop-blur-xs text-white text-[10px] font-extrabold rounded-full uppercase flex items-center gap-1">
                            <AlertTriangle size={10} /> Trash
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-extrabold rounded-full uppercase">
                            Draft
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition truncate">
                        {obj.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {obj.description || "No description provided"}
                      </p>

                      <div className="space-y-1 text-xs text-slate-500 pt-2 border-t border-slate-100">
                        {obj.location?.city && (
                          <div className="flex items-center gap-1.5 truncate">
                            <MapPin size={13} className="text-indigo-600 shrink-0" />
                            <span>{obj.location.address || obj.location.city}</span>
                          </div>
                        )}
                        {obj.contact?.phone && (
                          <div className="flex items-center gap-1.5 truncate">
                            <Phone size={13} className="text-indigo-600 shrink-0" />
                            <span>{obj.contact.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* Custom Template Attributes Preview */}
                      {obj.customDetails && Object.keys(obj.customDetails).length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {Object.entries(obj.customDetails).slice(0, 3).map(([k, v]) => {
                            if (!v) return null;
                            return (
                              <span
                                key={k}
                                className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-semibold border border-indigo-100 truncate max-w-[140px]"
                              >
                                {k}: {Array.isArray(v) ? v.join(", ") : String(v)}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedObjectForDetails(obj);
                      }}
                      className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Eye size={13} />
                      <span>View Object Details</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          MODAL A: CREATE / EDIT SUBSERVICE CATEGORY (CLASS ONLY)
          (Zero contact info, zero email/phone, zero address, zero notifications)
          ════════════════════════════════════════════════════════════ */}
      {showSubserviceModal && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {editingSubservice ? "Edit Subservice Category" : "Create Subservice Category"}
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
              {!editingSubservice && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Relatable Presets for {selectedCategory.name}:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(RELATABLE_SUBSERVICES_BY_CATEGORY[selectedCategoryKey] || []).map((preset) => (
                      <button
                        key={preset.slug}
                        type="button"
                        onClick={() => {
                          setSubserviceForm({
                            name: preset.name,
                            slug: preset.slug,
                            description: preset.description,
                            isActive: true,
                          });
                        }}
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
                  placeholder="e.g. Resorts & Retreats"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white focus:border-indigo-500 outline-hidden transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Relatable Slug <span className="text-red-500">*</span>
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
                  placeholder="e.g. resort"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono font-bold text-indigo-700 border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-hidden transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={subserviceForm.description}
                  onChange={(e) => setSubserviceForm({ ...subserviceForm, description: e.target.value })}
                  placeholder="Brief explanation of this subservice class..."
                  className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 bg-white focus:border-indigo-500 outline-hidden transition resize-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-800">Publication Status</span>
                <button
                  type="button"
                  onClick={() => setSubserviceForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    subserviceForm.isActive ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
                  }`}
                >
                  {subserviceForm.isActive ? "🟢 Live" : "🟡 Draft"}
                </button>
              </div>

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
                  <span>Save Subservice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          MODAL B: CONFIGURE BLUEPRINT TEMPLATE (FOR THIS SUBSERVICE ONLY)
          (Shows template name clearly as Template on top, NOT business name)
          ════════════════════════════════════════════════════════════ */}
      {showTemplateModal && currentSubservice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200">
                    Template Blueprint
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    Subservice: <strong>{currentSubservice.name}</strong> ({currentSubservice.slug})
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

            <form onSubmit={handleSaveTemplate} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Template Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={templateForm.templateName}
                    onChange={(e) => setTemplateForm({ ...templateForm, templateName: e.target.value })}
                    placeholder="e.g. Luxury Resort & Palace Blueprint"
                    className="w-full px-3.5 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white focus:border-indigo-500 outline-hidden transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={templateForm.description}
                    onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 bg-white focus:border-indigo-500 outline-hidden transition"
                  />
                </div>
              </div>

              {/* Schema Fields Builder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <SlidersHorizontal size={13} className="text-indigo-600" />
                    Blueprint Schema Fields ({templateForm.fields.length})
                  </h4>

                  <button
                    type="button"
                    onClick={() => {
                      setTemplateForm((prev) => ({
                        ...prev,
                        fields: [
                          ...prev.fields,
                          {
                            fieldKey: `field_${Date.now()}`,
                            label: "New Field",
                            fieldType: "text",
                            defaultValue: "",
                            required: false,
                          },
                        ],
                      }));
                    }}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Add Field</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {templateForm.fields.map((field, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                            Label
                          </label>
                          <input
                            type="text"
                            required
                            value={field.label}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = [...templateForm.fields];
                              updated[idx].label = val;
                              if (!field.fieldKey || field.fieldKey.startsWith("field_")) {
                                updated[idx].fieldKey = val.toLowerCase().replace(/[\s.-]+/g, "_");
                              }
                              setTemplateForm({ ...templateForm, fields: updated });
                            }}
                            className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 focus:bg-white outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                            Key
                          </label>
                          <input
                            type="text"
                            required
                            value={field.fieldKey}
                            onChange={(e) => {
                              const updated = [...templateForm.fields];
                              updated[idx].fieldKey = e.target.value.toLowerCase().replace(/[\s.-]+/g, "_");
                              setTemplateForm({ ...templateForm, fields: updated });
                            }}
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
                              onChange={(e) => {
                                const updated = [...templateForm.fields];
                                updated[idx].fieldType = e.target.value;
                                setTemplateForm({ ...templateForm, fields: updated });
                              }}
                              className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 focus:bg-white outline-hidden"
                            >
                              <option value="text">Text</option>
                              <option value="number">Number</option>
                              <option value="boolean">Yes / No</option>
                              <option value="multiselect">Multi-Select</option>
                              <option value="tags">Tags</option>
                              <option value="textarea">Textarea</option>
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setTemplateForm({
                                ...templateForm,
                                fields: templateForm.fields.filter((_, i) => i !== idx),
                              });
                            }}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition self-end cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

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

      {/* ════════════════════════════════════════════════════════════
          MODAL C: CREATE / EDIT OBJECT (LISTING INSTANCE FROM TEMPLATE)
          ════════════════════════════════════════════════════════════ */}
      {showObjectModal && currentSubservice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {editingObject ? `Edit ${editingObject.title}` : `Create New ${currentSubservice.name} Object`}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Instantiating an object under <strong>{currentSubservice.name}</strong> ({currentSubservice.slug})
                </p>
              </div>
              <button
                onClick={() => setShowObjectModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveObject} className="flex-1 overflow-y-auto p-6 space-y-5">
              {isSubmittingObject && <UploadProgressBar isUploading={isSubmittingObject} className="mb-4" />}

              {/* 1. Basic Info */}
              <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">
                  1. Business / Listing Identity
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Business Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={objectForm.title}
                      onChange={(e) => setObjectForm({ ...objectForm, title: e.target.value })}
                      placeholder="e.g. Betwa Retreat Orchha"
                      className="w-full px-3.5 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white focus:border-indigo-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Publication Status</label>
                    <select
                      value={objectForm.status}
                      onChange={(e) => setObjectForm({ ...objectForm, status: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white focus:border-indigo-500 outline-hidden"
                    >
                      <option value="published">🟢 Published / Live</option>
                      <option value="draft">🟡 Draft</option>
                      <option value="archived">🗑️ Trash / Archived</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={objectForm.description}
                    onChange={(e) => setObjectForm({ ...objectForm, description: e.target.value })}
                    placeholder="Full description of this business listing..."
                    className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 bg-white focus:border-indigo-500 outline-hidden resize-none"
                  />
                </div>
              </div>

              {/* 2. Contact & Location */}
              <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">
                  2. Contact & Location Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={objectForm.contact.phone}
                      onChange={(e) =>
                        setObjectForm({
                          ...objectForm,
                          contact: { ...objectForm.contact, phone: e.target.value },
                        })
                      }
                      placeholder="+91 9876543210"
                      className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 bg-white focus:border-indigo-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={objectForm.contact.email}
                      onChange={(e) =>
                        setObjectForm({
                          ...objectForm,
                          contact: { ...objectForm.contact, email: e.target.value },
                        })
                      }
                      placeholder="info@business.com"
                      className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 bg-white focus:border-indigo-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      value={objectForm.location.city}
                      onChange={(e) =>
                        setObjectForm({
                          ...objectForm,
                          location: { ...objectForm.location, city: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 bg-white focus:border-indigo-500 outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={objectForm.location.address}
                      onChange={(e) =>
                        setObjectForm({
                          ...objectForm,
                          location: { ...objectForm.location, address: e.target.value },
                        })
                      }
                      placeholder="e.g. Near Betwa River, Orchha"
                      className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 bg-white focus:border-indigo-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Google Maps Link</label>
                    <input
                      type="url"
                      value={objectForm.location.googleMapsUrl}
                      onChange={(e) =>
                        setObjectForm({
                          ...objectForm,
                          location: { ...objectForm.location, googleMapsUrl: e.target.value },
                        })
                      }
                      placeholder="https://maps.google.com/..."
                      className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 bg-white focus:border-indigo-500 outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Custom Template Attributes from Subservice Blueprint */}
              {currentSubservice?.template?.fields && currentSubservice.template.fields.length > 0 && (
                <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-purple-700">
                    3. Template Schema Attributes ({currentSubservice.template.templateName})
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentSubservice.template.fields.map((f) => (
                      <div key={f.fieldKey}>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {f.label} {f.required && <span className="text-red-500">*</span>}
                        </label>
                        {f.fieldType === "boolean" ? (
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="checkbox"
                              checked={!!objectForm.customDetails[f.fieldKey]}
                              onChange={(e) =>
                                setObjectForm({
                                  ...objectForm,
                                  customDetails: {
                                    ...objectForm.customDetails,
                                    [f.fieldKey]: e.target.checked,
                                  },
                                })
                              }
                              className="w-4 h-4 text-indigo-600 rounded"
                            />
                            <span className="text-xs text-slate-600">Yes / Enabled</span>
                          </div>
                        ) : f.fieldType === "multiselect" || f.fieldType === "tags" ? (
                          <input
                            type="text"
                            value={
                              Array.isArray(objectForm.customDetails[f.fieldKey])
                                ? objectForm.customDetails[f.fieldKey].join(", ")
                                : objectForm.customDetails[f.fieldKey] || ""
                            }
                            onChange={(e) =>
                              setObjectForm({
                                ...objectForm,
                                customDetails: {
                                  ...objectForm.customDetails,
                                  [f.fieldKey]: e.target.value.split(",").map((s) => s.trim()),
                                },
                              })
                            }
                            placeholder="Comma separated values..."
                            className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 bg-white focus:border-indigo-500 outline-hidden"
                          />
                        ) : (
                          <input
                            type={f.fieldType === "number" ? "number" : "text"}
                            value={objectForm.customDetails[f.fieldKey] ?? ""}
                            onChange={(e) =>
                              setObjectForm({
                                ...objectForm,
                                customDetails: {
                                  ...objectForm.customDetails,
                                  [f.fieldKey]:
                                    f.fieldType === "number" ? Number(e.target.value) : e.target.value,
                                },
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 bg-white focus:border-indigo-500 outline-hidden"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Photos Upload */}
              <div className="border-2 border-dashed border-indigo-200 p-4 rounded-2xl text-center bg-indigo-50/40">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  id="objectPhotosUpload"
                  onChange={(e) => setObjectForm({ ...objectForm, photos: e.target.files })}
                  className="hidden"
                />
                <label
                  htmlFor="objectPhotosUpload"
                  className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                >
                  <UploadCloud size={24} className="text-indigo-600" />
                  <span className="text-xs font-bold text-indigo-700">
                    {objectForm.photos && objectForm.photos.length > 0
                      ? `✓ ${objectForm.photos.length} Photo(s) Selected`
                      : "Upload Business Photos"}
                  </span>
                  <span className="text-[10px] text-slate-400">Direct R2 high-speed upload</span>
                </label>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowObjectModal(false)}
                  disabled={isSubmittingObject}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingObject}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmittingObject ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                  <span>Save Object Listing</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          MODAL D: OBJECT DETAILS VIEW
          (Shows all details + Edit, Soft Delete, Hard Delete)
          ════════════════════════════════════════════════════════════ */}
      {selectedObjectForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200">
                    {selectedObjectForDetails.subService}
                  </span>
                  {selectedObjectForDetails.status === "published" ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700">
                      🟢 Live
                    </span>
                  ) : selectedObjectForDetails.status === "archived" ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700">
                      🗑️ Trash
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-700">
                      🟡 Draft
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  {selectedObjectForDetails.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedObjectForDetails(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Photos Gallery */}
              {selectedObjectForDetails.photos && selectedObjectForDetails.photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedObjectForDetails.photos.map((p, idx) => (
                    <div key={idx} className="h-28 rounded-xl overflow-hidden bg-slate-100">
                      <img src={p.url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {/* Description */}
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Description
                </span>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedObjectForDetails.description || "No description provided"}
                </p>
              </div>

              {/* Contact & Location Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Contact</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {selectedObjectForDetails.contact?.phone || "No phone"}
                  </p>
                  <p className="text-slate-500">{selectedObjectForDetails.contact?.email || "No email"}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Location</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {selectedObjectForDetails.location?.address || selectedObjectForDetails.location?.city}
                  </p>
                  {selectedObjectForDetails.location?.googleMapsUrl && (
                    <a
                      href={selectedObjectForDetails.location.googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:underline flex items-center gap-1 font-semibold text-[11px] mt-0.5"
                    >
                      <ExternalLink size={11} /> Open in Google Maps
                    </a>
                  )}
                </div>
              </div>

              {/* Custom Details from Blueprint */}
              {selectedObjectForDetails.customDetails &&
                Object.keys(selectedObjectForDetails.customDetails).length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block">
                      Custom Template Attributes
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(selectedObjectForDetails.customDetails).map(([k, v]) => (
                        <div key={k} className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">{k}</span>
                          <span className="text-xs font-bold text-slate-800">
                            {Array.isArray(v) ? v.join(", ") : String(v)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Bottom Actions: Edit, Soft Delete / Restore, Hard Delete */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  handleOpenEditObject(selectedObjectForDetails);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Edit size={14} />
                <span>Edit Object</span>
              </button>

              <div className="flex items-center gap-2">
                {selectedObjectForDetails.status === "archived" ? (
                  <button
                    type="button"
                    onClick={() => handleRestoreObject(selectedObjectForDetails)}
                    className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw size={14} />
                    <span>Restore to Live</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSoftDeleteObject(selectedObjectForDetails)}
                    className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>Move to Trash (Soft Delete)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleHardDeleteObject(selectedObjectForDetails)}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <AlertTriangle size={14} />
                  <span>Hard Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
