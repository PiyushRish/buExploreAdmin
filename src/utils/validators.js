/**
 * Common validators for admin forms.
 * Each returns `null` if valid, or an error string + hint if invalid.
 */

export const validators = {
  required: (value, label = "This field") => {
    if (!value || (typeof value === "string" && !value.trim())) {
      return { error: `${label} is required.`, hint: null };
    }
    return null;
  },

  minLength: (min) => (value, label = "This field") => {
    if (value && value.trim().length < min) {
      return { error: `${label} must be at least ${min} characters.`, hint: `e.g. at least ${min} characters long` };
    }
    return null;
  },

  maxLength: (max) => (value, label = "This field") => {
    if (value && value.trim().length > max) {
      return { error: `${label} cannot exceed ${max} characters.`, hint: null };
    }
    return null;
  },

  email: (value, label = "Email") => {
    if (!value) return null;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(value.trim())) {
      return { error: `${label} is not a valid email address.`, hint: "e.g. contact@example.com" };
    }
    return null;
  },

  phone: (value, label = "Phone") => {
    if (!value) return null;
    const re = /^[+]?[\d\s\-().]{7,15}$/;
    if (!re.test(value.trim())) {
      return { error: `${label} is not a valid phone number.`, hint: "e.g. +91 98765 43210 or 9876543210" };
    }
    return null;
  },

  url: (value, label = "URL") => {
    if (!value) return null;
    try {
      new URL(value.trim());
      return null;
    } catch {
      return { error: `${label} is not a valid URL.`, hint: "e.g. https://www.example.com" };
    }
  },

  youtubeUrl: (value, label = "YouTube URL") => {
    if (!value) return null;
    const re = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w\-]+/;
    if (!re.test(value.trim())) {
      return { error: `${label} must be a valid YouTube link.`, hint: "e.g. https://youtube.com/watch?v=abc123" };
    }
    return null;
  },

  number: ({ min, max } = {}) => (value, label = "Value") => {
    if (value === "" || value === null || value === undefined) return null;
    const num = Number(value);
    if (isNaN(num)) {
      return { error: `${label} must be a number.`, hint: min !== undefined && max !== undefined ? `e.g. a number between ${min} and ${max}` : "e.g. 42" };
    }
    if (min !== undefined && num < min) {
      return { error: `${label} must be at least ${min}.`, hint: `e.g. ${min}` };
    }
    if (max !== undefined && num > max) {
      return { error: `${label} cannot exceed ${max}.`, hint: `e.g. ${max}` };
    }
    return null;
  },

  positiveInt: (value, label = "Value") => {
    if (value === "" || value === null || value === undefined) return null;
    const num = Number(value);
    if (!Number.isInteger(num) || num < 1) {
      return { error: `${label} must be a positive whole number.`, hint: "e.g. 1, 100, 10000" };
    }
    return null;
  },

  rating: (value, label = "Rating") => {
    if (value === "" || value === null || value === undefined) return null;
    const num = Number(value);
    if (isNaN(num) || num < 0 || num > 5) {
      return { error: `${label} must be between 0.0 and 5.0.`, hint: "e.g. 4.5" };
    }
    return null;
  },

  date: (value, label = "Date") => {
    if (!value) return null;
    const d = new Date(value);
    if (isNaN(d.getTime())) {
      return { error: `${label} must be a valid date.`, hint: "e.g. 2026-08-01" };
    }
    return null;
  },

  endAfterStart: (startValue) => (endValue, label = "End Date") => {
    if (!endValue || !startValue) return null;
    if (new Date(endValue) <= new Date(startValue)) {
      return { error: `${label} must be after the Start Date.`, hint: null };
    }
    return null;
  },

  latitude: (value, label = "Latitude") => {
    if (value === "" || value === null || value === undefined) return null;
    const num = Number(value);
    if (isNaN(num) || num < -90 || num > 90) {
      return { error: `${label} must be between -90 and 90.`, hint: "e.g. 25.4484" };
    }
    return null;
  },

  longitude: (value, label = "Longitude") => {
    if (value === "" || value === null || value === undefined) return null;
    const num = Number(value);
    if (isNaN(num) || num < -180 || num > 180) {
      return { error: `${label} must be between -180 and 180.`, hint: "e.g. 78.5685" };
    }
    return null;
  },
};

/**
 * Run a list of validators against a value.
 * Returns the first error found, or null if all pass.
 * @param {string} value
 * @param {Function[]} rules - array of validator functions
 * @param {string} label - field label for error messages
 */
export function runValidators(value, rules, label) {
  for (const rule of rules) {
    const result = rule(value, label);
    if (result) return result; // { error, hint }
  }
}

/**
 * Validates the MIME type of an uploaded file.
 * Returns a string error message if invalid, or true if valid.
 */
export function validateMediaType(file, expectedType) {
  if (!file) return true; // Let required validator handle empty
  
  if (!file.type.startsWith(expectedType + "/")) {
    const uploadedType = file.type || "unknown format";
    const example = expectedType === "image" ? "image/jpeg, image/png" : "video/mp4, video/mov";
    return `Invalid media format! You uploaded "${uploadedType}". Only ${expectedType.toUpperCase()} formats (e.g. ${example}) are accepted for this field.`;
  }
  
  return true;
}
