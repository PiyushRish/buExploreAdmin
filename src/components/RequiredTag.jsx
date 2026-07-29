import React from "react";

/**
 * Renders a bold red asterisk "* Required" badge inline.
 * Usage: <Req /> after a field label
 */
export const Req = () => (
  <span className="ml-1 text-red-500 font-extrabold text-xs">*</span>
);

/**
 * Renders a "Required" pill tag — use inside a label or standalone.
 */
export const RequiredPill = () => (
  <span className="ml-2 inline-flex items-center bg-red-100 text-red-600 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-widest">
    Required
  </span>
);

/**
 * Top-of-form notice strip for modals
 */
export const RequiredNotice = () => (
  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs font-bold px-3 py-2 rounded-xl">
    <span className="text-red-500 text-base font-extrabold leading-none">*</span>
    Fields marked with an asterisk are <span className="underline">required</span>. The form will not submit without them.
  </div>
);
