import React, { createContext, useContext, useState, useEffect } from "react";
import { subscribeUploadProgress } from "../api/axiosClient.js";

const UploadProgressContext = createContext({
  isUploading: false,
  percent: 0,
  loaded: 0,
  total: 0,
  formattedLoaded: "0 B",
  formattedTotal: "0 B",
  status: "",
  finished: false,
  error: false,
});

export const formatBytes = (bytes, decimals = 1) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

export const UploadProgressProvider = ({ children }) => {
  const [state, setState] = useState({
    isUploading: false,
    percent: 0,
    loaded: 0,
    total: 0,
    status: "",
    finished: false,
    error: false,
  });

  useEffect(() => {
    let dismissTimer = null;

    const unsubscribe = subscribeUploadProgress((event) => {
      if (dismissTimer) {
        clearTimeout(dismissTimer);
        dismissTimer = null;
      }

      if (event.active) {
        setState({
          isUploading: true,
          percent: event.percent || 0,
          loaded: event.loaded || 0,
          total: event.total || 0,
          status: event.status || "Uploading...",
          finished: false,
          error: false,
        });
      } else if (event.finished) {
        setState((prev) => ({
          ...prev,
          isUploading: false,
          percent: 100,
          status: "Upload complete! Assets saved successfully ✨",
          finished: true,
          error: false,
        }));

        dismissTimer = setTimeout(() => {
          setState({
            isUploading: false,
            percent: 0,
            loaded: 0,
            total: 0,
            status: "",
            finished: false,
            error: false,
          });
        }, 2500);
      } else if (event.error) {
        setState((prev) => ({
          ...prev,
          isUploading: false,
          error: true,
          status: event.status || "Upload interrupted or failed",
        }));

        dismissTimer = setTimeout(() => {
          setState({
            isUploading: false,
            percent: 0,
            loaded: 0,
            total: 0,
            status: "",
            finished: false,
            error: false,
          });
        }, 3500);
      }
    });

    return () => {
      if (dismissTimer) clearTimeout(dismissTimer);
      unsubscribe();
    };
  }, []);

  return (
    <UploadProgressContext.Provider
      value={{
        ...state,
        formattedLoaded: formatBytes(state.loaded),
        formattedTotal: formatBytes(state.total),
      }}
    >
      {children}
    </UploadProgressContext.Provider>
  );
};

export const useUploadProgress = () => useContext(UploadProgressContext);
