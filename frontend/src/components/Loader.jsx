// src/components/Loader.jsx
import React from "react";

const Loader = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const baseCircleStyles = {
    fill: "none",
    strokeWidth: "3",
    strokeLinecap: "round",
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black/50 z-[100] ${className}`}
      style={{ zIndex: 1000 }} // Inline style for maximum z-index control
    >
      <svg
        className={`${sizeClasses[size]} animate-spin`}
        viewBox="0 0 50 50"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          className="stroke-primary/30"
          {...baseCircleStyles}
        />
        <circle
          cx="25"
          cy="25"
          r="20"
          className="stroke-primary opacity-75"
          {...baseCircleStyles}
          strokeDasharray="80"
          strokeDashoffset="60"
        >
          <animate
            attributeName="stroke-dashoffset"
            dur="1.5s"
            repeatCount="indefinite"
            values="60;160"
          />
          <animate
            attributeName="stroke"
            dur="6s"
            repeatCount="indefinite"
            values="#fb923c;#fdba74;#84cc16;#fb923c"
          />
        </circle>
      </svg>
    </div>
  );
};

export default Loader;
