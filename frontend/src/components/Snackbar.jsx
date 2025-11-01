// src/components/Snackbar.jsx
import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

const Snackbar = ({ message, type = "error", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getSnackbarConfig = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-success/20",
          border: "border-success",
          text: "text-success",
          icon: CheckCircle,
        };
      case "error":
        return {
          bg: "bg-error/20",
          border: "border-error",
          text: "text-error",
          icon: XCircle,
        };
      case "warning":
        return {
          bg: "bg-accent/20",
          border: "border-accent",
          text: "text-accent",
          icon: AlertCircle,
        };
      default:
        return {
          bg: "bg-primary/20",
          border: "border-primary",
          text: "text-primary",
          icon: Info,
        };
    }
  };

  const config = getSnackbarConfig();
  const Icon = config.icon;

  const snackbarElement = (
    <div
      className={`fixed top-20 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-xl
                  ${config.bg} ${config.text} border-2 ${config.border}
                  backdrop-blur-sm shadow-lg animate-slide-down
                  flex items-center gap-3 max-w-md mx-4`}
      style={{ zIndex: 100 }}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="font-medium text-sm">{message}</span>
    </div>
  );

  return createPortal(snackbarElement, document.body);
};

export default Snackbar;
