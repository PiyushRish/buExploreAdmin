import React from "react";

/**
 * Props:
 * - title: string => The name of the task or action
 * - status: string => "Completed", "In Progress", "Pending"
 * - progress: number => 0-100 for progress percentage
 */
const ActionView = ({ title, status, progress }) => {
  // Determine badge and bar color based on status
  const statusColor = {
    "Completed": "green",
    "In Progress": "yellow",
    "Pending": "gray",
  }[status] || "gray";

  return (
    <div className="w-80 p-4 bg-white rounded-lg shadow-md border border-gray-200">
      {/* Title and status */}
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span
          className={`px-2 py-1 text-xs font-medium rounded bg-${statusColor}-100 text-${statusColor}-800`}
        >
          {status}
          Pending
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-${statusColor}-500`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Progress text */}
      <p className="text-xs text-gray-500 mt-1">{progress}% completed</p>
    </div>
  );
};

export default ActionView;
