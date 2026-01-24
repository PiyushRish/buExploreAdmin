import React, { useState, useContext } from "react";
import { Heart, Share2, Plus, X } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import { PlaceContext } from "../contextApi/places.jsx";
import GuideDetails from "./GuideDetails.jsx";

import { useGuidesQuery } from "../queries/guideQueries.js";
import { useAddGuideMutation } from "../mutations/guideMutation.js";

/* ---------------- GUIDE CARD ---------------- */

const GuideCard = ({ guide }) => {
  const { setClickedPlaceHandler } = useContext(PlaceContext);

  return (
    <div
      className="bg-white rounded-xl shadow-lg border flex flex-col cursor-pointer"
      onClick={() => setClickedPlaceHandler(guide)}
    >
      <div className="h-56 bg-blue-700 flex items-center justify-center relative">
        <h2 className="text-4xl font-extrabold text-white">GUIDE</h2>
        <div className="absolute top-3 right-3">
          <Share2 size={18} className="text-white" />
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-xl">
          {guide?.languages?.join(", ")}
        </h3>

        <p className="text-sm text-gray-600 mt-2">
          Experience: {guide?.experienceYears} yrs
        </p>

        <div className="mt-auto pt-4 border-t flex justify-between">
          <span>{guide?.subCategory}</span>
          <span>₹{guide?.fee}</span>
        </div>
      </div>
    </div>
  );
};

/* ---------------- GRID ---------------- */

const Guides = () => {
  const { data, isLoading, isError } = useGuidesQuery();
  const { clickedPlace } = useContext(PlaceContext);
  const addMutation = useAddGuideMutation();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    subCategory: "",
    languages: "",
    experienceYears: "",
    fee: "",
    speciality: "",
    phone: "",
    email: "",
    website: ""
  });

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) =>
      formData.append(k, v)
    );
    await addMutation.mutateAsync(formData);
    setShowModal(false);
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;
  if (clickedPlace) return <GuideDetails />;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <Navbar />

      <div className="grid grid-cols-3 gap-8">
        {data?.guides?.map(g => (
          <GuideCard key={g._id} guide={g} />
        ))}
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 bg-blue-700 text-white p-4 rounded-full"
      >
        <Plus size={28} />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 w-[600px] rounded-xl">
            <div className="flex justify-between mb-4">
              <h2>Create Guide</h2>
              <X onClick={() => setShowModal(false)} />
            </div>

            {Object.keys(form).map(f => (
              <input
                key={f}
                name={f}
                placeholder={f}
                onChange={handleChange}
                className="w-full border p-2 rounded mb-3"
              />
            ))}

            <button
              onClick={handleSubmit}
              className="w-full bg-blue-700 text-white py-2 rounded"
            >
              Create Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return <Guides />;
}
