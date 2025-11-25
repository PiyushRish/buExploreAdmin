import React, { useState } from "react";
import MyBarGraph from "../components/ui/admin/BarChart.jsx";
import MyPieChart from "../components/ui/admin/PieChart.jsx";
import Map from "../components/ui/admin/Map.jsx";
import AlertsAndRecommendations from "../components/ui/admin/AlertIcons.jsx";
import { BarChart2, MapPin, Bell } from "lucide-react";
import DataTable from "../components/ui/admin/Table.jsx";
import ProgressBar from "../components/ui/admin/ProgressBar.jsx";
import Navbar from "../components/Navbar.jsx";
import Places from "./Places.jsx";
import PlaceDetails from "./PlaceDetails.jsx"; // Import the details component
import { useContext } from "react";
import { PlaceContext } from "../contextApi/places.jsx";

const DashBoard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedPlace, setSelectedPlace] = useState(null); 
  const {clickedPlace,setClickedPlaceHandler} = useContext(PlaceContext); // State to track selected place
  console.log("Clicked Place in Dashboard:", clickedPlace);


  // Example alert data
  const alertsData = [
    {
      type: "warning",
      title: "High Server Load",
      description: "Server 3 is experiencing high CPU usage.",
    },
    {
      type: "info",
      title: "Update Available",
      description: "A new version of the system is ready to install.",
    },
    {
      type: "success",
      title: "Backup Completed",
      description: "Daily database backup completed successfully.",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">Admin Panel</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-3">
          <button
            onClick={() => { setActiveTab("dashboard"); setSelectedPlace(null); }}
            className={`flex items-center w-full p-2 rounded-lg text-left ${
              activeTab === "dashboard"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            <BarChart2 className="w-5 h-5 mr-3" />
            Dashboard
          </button>

          <button
            onClick={() => { setActiveTab("map"); setSelectedPlace(null); }}
            className={`flex items-center w-full p-2 rounded-lg text-left ${
              activeTab === "map"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            <MapPin className="w-5 h-5 mr-3" />
            Map View
          </button>

          <button
            onClick={() => setActiveTab("Places")}
            className={`flex items-center w-full p-2 rounded-lg text-left ${
              activeTab === "Places"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            <Bell className="w-5 h-5 mr-3" />
            Places
          </button>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <Navbar/>
        {activeTab === "dashboard" && (
          <>
            {/* Top Section with 3 Components */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow p-4">
                <MyBarGraph />
              </div>
              <div className="bg-white rounded-2xl shadow p-4">
                <MyPieChart />
              </div>
              <div className="bg-white rounded-2xl shadow p-4">
                <ProgressBar/>
              </div>
            </div>

            {/* Spacer */}
            <div className="my-6"></div>

            {/* Full-Width Table */}
            <div className="bg-white rounded-2xl shadow p-6 w-full">
              <DataTable />
            </div>
          </>
        )}

        {activeTab === "map" && (
          <div className="bg-white rounded-2xl shadow p-4 h-[80vh]">
            <Map />
          </div>
        )}

        {activeTab === "Places" && (
          <div className="bg-white rounded-2xl shadow p-4">
            {/* LOGIC SWITCH: If a place is selected, show Details, otherwise show Grid */}
            {clickedPlace ? (
              <PlaceDetails 
                initialData={clickedPlace} 
                onBack={() => setClickedPlaceHandler(null)} 
              />
            ) : (
              <Places onSelectPlace={(place) => setClickedPlaceHandler(place)} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashBoard;