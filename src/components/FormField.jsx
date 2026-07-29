import React from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

/**
 * FormField — wraps any input/select/textarea with live validation UI.
 *
 * Props:
 *   label       {string}    Field label text
 *   required    {boolean}   Show red * and enforce required validation
 *   error       {string}    Error message (from parent state)
 *   hint        {string}    Example format hint shown under the field
 *   touched     {boolean}   Whether the user has interacted with this field
 *   valid       {boolean}   Whether field currently passes validation
 *   className   {string}    Extra classes on the wrapper div
 *   children    {ReactNode} The actual <input>, <select>, or <textarea>
 *   optional    {boolean}   Explicitly mark as optional in the label
 */
const FormField = ({
  label,
  required = false,
  optional = false,
  error,
  hint,
  touched = false,
  valid = false,
  className = "",
  children,
}) => {
  const showError = touched && !!error;
  const showSuccess = touched && !error && valid;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {/* Label row */}
      {label && (
        <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          {label}
          {required && <span className="text-red-500 font-extrabold text-xs leading-none">*</span>}
          {optional && <span className="text-[9px] font-semibold text-gray-400 normal-case tracking-normal bg-gray-100 px-1.5 py-0.5 rounded-full">optional</span>}
        </label>
      )}

      {/* Input wrapper with dynamic border color */}
      <div className={`relative rounded-xl ring-1 transition-all duration-200
        ${showError   ? "ring-red-400 bg-red-50/30"    : ""}
        ${showSuccess ? "ring-green-400 bg-green-50/20" : ""}
        ${!showError && !showSuccess ? "ring-gray-200 focus-within:ring-indigo-400" : ""}
      `}>
        {/* Clone children and inject border-none + outline-none so the ring owns it */}
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child, {
                className: [
                  child.props.className || "",
                  "border-0 ring-0 outline-none bg-transparent w-full",
                ].join(" "),
              })
            : child
        )}

        {/* Status icon */}
        {showError && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
            <AlertCircle size={16} />
          </span>
        )}
        {showSuccess && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none">
            <CheckCircle2 size={16} />
          </span>
        )}
      </div>

      {/* Error message */}
      {showError && (
        <p className="flex items-start gap-1 text-[11px] text-red-600 font-semibold leading-tight">
          <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
          {error}
        </p>
      )}

      {/* Format hint — shown when no error but has a hint */}
      {hint && !showError && (
        <p className="flex items-center gap-1 text-[11px] text-gray-400 font-medium italic">
          <Info size={11} className="flex-shrink-0" />
          {hint}
        </p>
      )}
    </div>
  );
};

export default FormField;
