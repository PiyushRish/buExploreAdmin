import React from "react";

const alertIcons = {
  info: "ℹ️",
  warning: "⚠️",
  success: "✅",
};

const AlertsAndRecommendations = ({ items }) => {
  return (
    <div className="w-full max-w-md p-4 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">Alerts & Recommendations</h2>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li
            key={index}
            className={`flex items-start p-3 rounded-lg border-l-4 ${
              item.type === "warning"
                ? "border-yellow-500 bg-yellow-50"
                : item.type === "success"
                ? "border-green-500 bg-green-50"
                : "border-blue-500 bg-blue-50"
            }`}
          >
            <span className="mr-3 text-xl">{alertIcons[item.type]}</span>
            <div>
              <p className="text-sm font-medium">{item.title}</p>
              {item.description && (
                <p className="text-xs text-gray-600 mt-1">{item.description}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AlertsAndRecommendations;
