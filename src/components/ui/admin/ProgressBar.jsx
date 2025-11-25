import React, { useState } from "react";

const checkpoints = [
  { id: 1, label: "Central" },
  { id: 2, label: "State" },
  { id: 3, label: "District" },
  { id: 4, label: "Alloted" },
  { id: 5, label: "Deployment" },
];

const ProgressBar = () => {
  const [currentStep, setCurrentStep] = useState(3); // Example: currently at step 3

  return (
    <div className="w-full flex flex-col items-center mt-10 " >
      {/* Progress Bar Container */}
      <div className="relative flex items-center justify-between w-3/4">
        {/* Line (the snake path) */}
        <div className="absolute top-1/2 left-0 w-full h-2 bg-gray-300 rounded-full transform -translate-y-1/2" />

        {/* Filled Progress (snake moving forward) */}
        <div
          className="absolute top-1/2 left-0 h-2 bg-green-500 rounded-full transform -translate-y-1/2 transition-all duration-700 ease-in-out"
          style={{
            width: `${((currentStep - 1) / (checkpoints.length - 1)) * 100}%`,
          }}
        />

        {/* Checkpoints */}
        {checkpoints.map((step, index) => {
          const isCompleted = index + 1 <= currentStep;
          return (
            <div key={step.id} className="relative flex flex-col items-center">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full font-semibold text-white transition-all duration-500 ${
                  isCompleted ? "bg-green-500 scale-110" : "bg-gray-400"
                }`}
              >
                {step.id}
              </div>
              <p className="mt-2 text-sm text-gray-700">{step.label}</p>
            </div>
          );
        })}
      </div>

      {/* Buttons for demo */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          Prev
        </button>
        <button
          onClick={() =>
            setCurrentStep((prev) =>
              Math.min(prev + 1, checkpoints.length)
            )
          }
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProgressBar;
