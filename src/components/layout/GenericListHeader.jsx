import React from "react";
import { Plus, Filter } from "lucide-react";

export const GenericListHeader = ({
  title,
  subtitle,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  includeDeleted,
  onIncludeDeletedChange,
  onAddClick,
  addButtonLabel = "Add New",
  categories = [],
  selectedCategory,
  onCategoryChange,
  totalItemsCount = 0
}) => {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border space-y-4 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="w-full md:w-1/2">
          {title && <h1 className="text-2xl font-black text-gray-900">{title}</h1>}
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full border p-3 rounded-xl text-sm outline-none focus:border-blue-500 shadow-sm mt-3"
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-xl transition-colors border">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) => onIncludeDeletedChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
            />
            Show Only Deleted
          </label>

          <button
            onClick={onAddClick}
            className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-blue-700 shadow-md transition-all"
          >
            <Plus size={16} /> {addButtonLabel}
          </button>
        </div>
      </div>

      {categories && categories.length > 0 && (
        <div className="flex items-center gap-2 pt-3 border-t overflow-x-auto pb-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 flex items-center gap-1">
            <Filter size={12} /> Filter:
          </span>

          <button
            onClick={() => onCategoryChange("")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === ""
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All ({totalItemsCount})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => onCategoryChange(cat.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat.value
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.label} {cat.count !== undefined ? `(${cat.count})` : ""}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
