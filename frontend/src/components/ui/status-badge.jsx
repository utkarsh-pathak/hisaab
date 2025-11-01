import * as React from "react";
import { Check, IndianRupee, AlertCircle } from "lucide-react";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";

/**
 * StatusBadge - Standardized status indicators
 * @param {string} status - "settled" | "active" | "pending" | "owed" | "owes"
 */
const StatusBadge = ({ status, amount, className }) => {
  const statusConfig = {
    settled: {
      variant: "success",
      icon: Check,
      label: "Settled",
    },
    active: {
      variant: "default",
      icon: IndianRupee,
      label: "Active",
    },
    pending: {
      variant: "secondary",
      icon: AlertCircle,
      label: "Pending",
    },
    owed: {
      variant: "success",
      icon: IndianRupee,
      label: amount ? `+₹${amount}` : "You're owed",
    },
    owes: {
      variant: "destructive",
      icon: IndianRupee,
      label: amount ? `-₹${amount}` : "You owe",
    },
  };

  const config = statusConfig[status] || statusConfig.active;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={cn("flex items-center gap-1.5", className)}>
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </Badge>
  );
};

export { StatusBadge };
