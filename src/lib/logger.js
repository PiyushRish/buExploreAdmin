// src/lib/logger.js
const LOG_LEVELS = {
  DEBUG: 1,
  INFO: 2,
  WARN: 3,
  ERROR: 4,
};

const currentLevel = import.meta.env.MODE === "production" ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG;

export const logger = {
  debug: (message, ...args) => {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`, ...args);
    }
  },
  info: (message, ...args) => {
    if (currentLevel <= LOG_LEVELS.INFO) {
      console.info(`[INFO] ${new Date().toISOString()}: ${message}`, ...args);
    }
  },
  warn: (message, ...args) => {
    if (currentLevel <= LOG_LEVELS.WARN) {
      console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, ...args);
    }
  },
  error: (message, ...args) => {
    if (currentLevel <= LOG_LEVELS.ERROR) {
      console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, ...args);
    }
  },
};
