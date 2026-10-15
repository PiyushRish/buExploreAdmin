/**
 * Centralized media URL resolver.
 * Handles all asset shapes returned by the backend:
 *  - plain string URL  (legacy Cloudinary / direct URL)
 *  - { url }           (Cloudinary object shape)
 *  - { secure_url }    (Cloudinary alternate shape)
 *  - { legacyCloudinary: { url } } (R2 migrated records preserving legacy Cloudinary fallback)
 *  - { qualities: [...] } (Transcoded video/image variants)
 *  - { key, storageProvider } (R2 — construct URL from env or CDN prefix)
 */

const R2_PUBLIC_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_R2_PUBLIC_URL) ||
  "https://pub-placeholder.r2.dev"; // fallback; override via .env

/**
 * Resolve a photo/image asset to a displayable URL.
 * @param {string|object} asset
 * @param {string} fallback
 * @returns {string}
 */
export const getMediaUrl = (asset, fallback = "https://picsum.photos/600/400") => {
  if (!asset) return fallback;
  if (typeof asset === "string") return asset || fallback;
  if (asset.url) return asset.url;
  if (asset.secure_url) return asset.secure_url;
  if (asset.legacyCloudinary?.url) return asset.legacyCloudinary.url;
  if (Array.isArray(asset.qualities) && asset.qualities.length > 0) {
    const highest = asset.qualities[asset.qualities.length - 1];
    if (highest?.url) return highest.url;
    if (highest?.key) return `${R2_PUBLIC_BASE}/${highest.key}`;
  }
  if (asset.key) return `${R2_PUBLIC_BASE}/${asset.key}`;
  return fallback;
};

/**
 * Resolve a video asset to a playable URL.
 * @param {string|object} asset
 * @returns {string|null}
 */
export const getVideoUrl = (asset) => {
  if (!asset) return null;
  if (typeof asset === "string") return asset || null;
  if (asset.url) return asset.url;
  if (asset.secure_url) return asset.secure_url;
  if (asset.legacyCloudinary?.url) return asset.legacyCloudinary.url;
  if (Array.isArray(asset.qualities) && asset.qualities.length > 0) {
    const first = asset.qualities[0];
    if (first?.url) return first.url;
    if (first?.key) return `${R2_PUBLIC_BASE}/${first.key}`;
  }
  if (asset.key) return `${R2_PUBLIC_BASE}/${asset.key}`;
  return null;
};

/**
 * Get the first photo URL from an array of assets.
 */
export const getCoverPhoto = (photos, fallback = "https://picsum.photos/600/400") => {
  if (!Array.isArray(photos) || photos.length === 0) return fallback;
  return getMediaUrl(photos[0], fallback);
};

/**
 * Get the first video URL from an array of assets.
 */
export const getCoverVideo = (videos) => {
  if (!Array.isArray(videos) || videos.length === 0) return null;
  return getVideoUrl(videos[0]);
};

