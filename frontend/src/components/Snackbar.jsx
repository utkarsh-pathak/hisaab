// src/components/Snackbar.jsx
import React, { useEffect } from "react";
import { createPortal } from "react-dom";

const Snackbar = ({ message, type = "error", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getSnackbarStyle = () => {
    switch (type) {
      case "success":
        return "bg-green-500 text-white";
      case "error":
        return "bg-red-500 text-white";
      case "warning":
        return "bg-yellow-500 text-black";
      default:
        return "bg-blue-500 text-white";
    }
  };

  const snackbarElement = (
    <div
      className={`fixed top-8 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg ${getSnackbarStyle()}`}
      style={{ zIndex: 100 }} // Higher z-index than loader and modals
    >
      {message}
    </div>
  );

  return createPortal(snackbarElement, document.body);
};

export default Snackbar;
