import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const multipleOrganisation = [
  "Central Level (MoSJE)",
  "State Level (State/UT Dept)",
  "District Level (Collector’s Office)",
  "Executing Agency",
  "Field / Beneficiary Level"
];
const components = [
  "Adarsh Gram",
  "GIA (Grant-in-Aid)",
  "Hostel"
];


const jobLevelsMap = {
  "Central Level (MoSJE)": [
    "Central Admin (PM-AJAY Cell)",
    "Central Auditor / Monitoring Agency"
  ],
  "State Level (State/UT Dept)": [
    "State Admin / Nodal Officer",
    "State Auditor"
  ],
  "District Level (Collector’s Office)": [
    "District Officer"
  ],
  "Executing Agency": [
    "Agency Admin (Head of Agency)",
    "Agency Staff (Operators)"
  ],
  "Field / Beneficiary Level": [
    "Enumerator (Field Worker)",
    "Beneficiary (SC Community Member)"
  ]
};

const Login = () => {
  const navigate = useNavigate();

  const [isOrgOpen, setIsOrgOpen] = useState(false);
  const [organisation, setOrganisation] = useState("");

  const [isJobOpen, setIsJobOpen] = useState(false);
  const [jobLevel, setJobLevel] = useState("");
  const [jobOptions, setJobOptions] = useState([]);

  const orgRef = useRef(null);
  const jobRef = useRef(null);

  const handleSelectOrganisation = (value) => {
    setOrganisation(value);
    setIsOrgOpen(false);
    setJobOptions(jobLevelsMap[value] || []);
    setJobLevel("");
  };

  const handleSelectJob = (value) => {
    setJobLevel(value);
    setIsJobOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (orgRef.current && !orgRef.current.contains(event.target)) {
        setIsOrgOpen(false);
      }
      if (jobRef.current && !jobRef.current.contains(event.target)) {
        setIsJobOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="h-screen w-screen bg-amber-200 flex justify-center items-center">
      <div className="h-[80%] w-[40%] bg-white p-8 rounded shadow flex flex-col">
        <h1 className="text-2xl font-bold mb-8 self-center">Login Page</h1>
        <div className="flex flex-col gap-6 items-center">

          {/* Username */}
          <div className="grid w-[90%] items-center gap-2">
            <Label htmlFor="userName">User Name</Label>
            <Input id="userName" placeholder="Enter your username" />
          </div>

          {/* Password */}
          <div className="grid w-[90%] items-center gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>

          {/* Organisation Dropdown */}
          <div ref={orgRef} className="relative w-[90%]">
            <Label>Organisation Level</Label>
            <button
              onClick={() => setIsOrgOpen(!isOrgOpen)}
              className="mt-2 w-full p-2 bg-white border rounded-md text-left"
            >
              {organisation || "Select an Organisation"}
            </button>

            {isOrgOpen && (
              <div className="absolute z-10 mt-2 w-full rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  {multipleOrganisation.map((org) => (
                    <a
                      key={org}
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSelectOrganisation(org);
                      }}
                    >
                      {org}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Job Level Dropdown */}
          <div ref={jobRef} className="relative w-[90%]">
            <Label>Role / Job Level</Label>
            <button
              onClick={() => setIsJobOpen(!isJobOpen)}
              className="mt-2 w-full p-2 bg-white border rounded-md text-left"
              disabled={!organisation}
            >
              {jobLevel || "Select a Job Level"}
            </button>

            {isJobOpen && (
              <div className="absolute z-10 mt-2 w-full rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  {jobOptions.map((job) => (
                    <a
                      key={job}
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSelectJob(job);
                      }}
                    >
                      {job}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Login Button */}
          <Button
            onClick={() => navigate("/dashboard")}
            className="mt-6 w-[90%]"
          >
            Log In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
