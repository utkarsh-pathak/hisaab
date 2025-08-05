// UserIcon.js
import React from "react";

const UserIcon = ({ user, size = 40 }) => {
  return (
    <div className="flex flex-col items-center">
      <div
        className="rounded-full bg-gray-200 overflow-hidden"
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={user.image || "/default-avatar.png"} // Fallback to default avatar
          alt={user.name}
          className="object-cover"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      <span className="text-xs mt-1 text-center text-gray-700">
        {user.name}
      </span>
    </div>
  );
};

export default UserIcon;
