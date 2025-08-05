// GroupIcon.js
import React from "react";

const GroupIcon = ({ name, imageUrl, size = 50, hasUpdates = false }) => {
  const initials = name
    ? name
        .split(" ")
        .map((word) => (word[0] ? word[0].toUpperCase() : "")) // Add a check for word[0]
        .slice(0, 2)
        .join("")
    : "";

  return (
    <div
      className="relative flex items-center justify-center rounded-full bg-purple-600 text-white font-bold"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        backgroundImage: imageUrl ? `url(${imageUrl})` : "",
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: imageUrl ? "transparent" : "white",
      }}
    >
      {/* Display initials if no image is provided */}
      {!imageUrl && <span>{initials}</span>}

      {/* Badge for updates */}
      {hasUpdates && (
        <span
          className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"
          style={{ transform: "translate(25%, -25%)" }}
        ></span>
      )}
    </div>
  );
};

export default GroupIcon;
