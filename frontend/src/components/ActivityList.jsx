import React from "react";
import { Clock, PlusCircle, Users, Tag as TagIcon } from "lucide-react";
import { Badge } from "./ui/badge";

const ActivityCard = ({ activity }) => {
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      console.error("Invalid timestamp:", timestamp);
      return "Invalid date";
    }
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return "";
    }
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Determine icon based on activity type
  const getActivityIcon = () => {
    if (activity.activity_type === "Group Created") {
      return <Users className="w-5 h-5 text-primary" />;
    } else if (activity.activity_type === "Expense Added") {
      return <PlusCircle className="w-5 h-5 text-success" />;
    } else if (activity.activity_type === "Tag Created") {
      return <TagIcon className="w-5 h-5 text-accent" />;
    }
    return <Clock className="w-5 h-5 text-primary" />;
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-background-surface hover:bg-background-elevated transition-all group border border-transparent hover:border-primary/20">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        {/* Icon and Content */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="p-2.5 bg-primary/20 rounded-xl flex-shrink-0 mt-0.5">
            {getActivityIcon()}
          </div>
          <div className="flex-1 min-w-0 space-y-1.5">
            <h3 className="text-base sm:text-lg font-semibold text-text-primary group-hover:text-primary transition-colors">
              {activity.action}
            </h3>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-text-muted">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{formatDate(activity.timestamp)}</span>
              <span>•</span>
              <span>{formatTime(activity.timestamp)}</span>
            </div>
          </div>
        </div>

        {/* Activity Type Badge */}
        <Badge
          variant={
            activity.activity_type === "Group Created" ? "success" :
            activity.activity_type === "Expense Added" ? "default" :
            "accent"
          }
          className="flex-shrink-0"
        >
          {activity.activity_type}
        </Badge>
      </div>
    </div>
  );
};

const ActivityList = ({ activities }) => {
  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  );
};

export default ActivityList;
