import React from "react";
import { ArrowLeft, Save, Edit2, Trash2, RotateCcw, AlertTriangle } from "lucide-react";

export const GenericDetailsHeader = ({
  onBack,
  isDeleted,
  isEditing,
  isPending,
  onRestore,
  onSoftDeleteClick,
  onHardDeleteClick,
  onSave,
  onEditClick,
  backLabel = "Back"
}) => {
  return (
    <div className="h-16 border-b px-8 flex items-center justify-between bg-white sticky top-0 z-20">
      <button onClick={onBack} className="flex items-center text-gray-600 font-semibold hover:text-gray-900">
        <ArrowLeft size={18} className="mr-2" /> {backLabel}
      </button>

      <div className="flex items-center gap-2">
        {isDeleted ? (
          <button
            onClick={onRestore}
            className="flex items-center px-4 py-2 rounded-xl bg-green-50 text-green-700 font-bold text-xs border border-green-200 hover:bg-green-100"
          >
            <RotateCcw size={14} className="mr-1.5" /> Restore
          </button>
        ) : (
          <button
            onClick={onSoftDeleteClick}
            className="flex items-center px-4 py-2 rounded-xl bg-yellow-50 text-yellow-700 font-bold text-xs border border-yellow-200 hover:bg-yellow-100"
          >
            <Trash2 size={14} className="mr-1.5" /> Soft Delete
          </button>
        )}

        <button
          onClick={onHardDeleteClick}
          className="flex items-center px-4 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-xs border border-red-200 hover:bg-red-100"
        >
          <AlertTriangle size={14} className="mr-1.5" /> Permanent Delete
        </button>

        <button
          onClick={() => (isEditing ? onSave() : onEditClick())}
          disabled={isPending}
          className={`flex items-center px-6 py-2 rounded-xl font-bold text-xs transition-colors ${
            isEditing
              ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 border"
          }`}
        >
          {isEditing ? (
            <><Save size={14} className="mr-1.5" /> {isPending ? "Saving..." : "Save Changes"}</>
          ) : (
            <><Edit2 size={14} className="mr-1.5" /> Edit Mode</>
          )}
        </button>
      </div>
    </div>
  );
};
