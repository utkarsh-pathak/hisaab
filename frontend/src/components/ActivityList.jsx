import React from "react";
import { Clock, CheckCircle, XCircle } from "lucide-react";

const ActivityCard = ({ activity }) => {
  const formatDate = (timestamp) => {
    // Create a new Date object from the UTC timestamp string
    const date = new Date(timestamp);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.error("Invalid timestamp:", timestamp);
      return "Invalid date"; // Fallback for invalid date
    }

    // Use toLocaleString to convert to local timezone with formatting
    return date.toLocaleString("en-US", {
      year: "numeric", // Full year (e.g., 2024)
      month: "short", // Abbreviated month (e.g., Nov)
      day: "numeric", // Day of the month (e.g., 6)
      hour: "numeric", // Hour (e.g., 3)
      minute: "numeric", // Minute (e.g., 15)
      hour12: true, // 12-hour format (AM/PM)
    });
  };

  return (
    <div
      className="relative overflow-hidden bg-gradient-to-br from-dark-surface to-dark/60 
    backdrop-blur-md rounded-2xl
    transition-all duration-300 ease-in-out
    border border-gray-800/40 hover:border-gray-700/40
    group cursor-pointer shadow-xl hover:shadow-2xl 
    hover:-translate-y-1 p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Clock className="w-5 h-5 text-purple-300" />
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-white">
              {activity.action}
            </h2>
            <span className="text-sm text-gray-400">
              {formatDate(activity.timestamp)}
            </span>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            activity.activity_type === "Group Created"
              ? "bg-green-500/15 text-green-300"
              : "bg-amber-500/15 text-amber-300"
          }`}
        >
          {activity.activity_type}
        </span>
      </div>
    </div>
  );
};

const ActivityList = ({ activities }) => {
  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-dark rounded-2xl shadow-xl space-y-4">
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  );
};

export default ActivityList;
