import * as React from "react";
import { IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * AmountDisplay - Consistent currency display component
 * @param {number} amount - The amount to display
 * @param {string} variant - "default" | "success" | "error" | "muted"
 * @param {string} size - "sm" | "md" | "lg" | "xl"
 */
const AmountDisplay = ({ amount, variant = "default", size = "md", className }) => {
  const variants = {
    default: "text-text-primary",
    success: "text-success",
    error: "text-error",
    muted: "text-text-muted",
  };

  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
    xl: "text-2xl",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1 font-semibold",
        variants[variant],
        sizes[size],
        className
      )}
    >
      <IndianRupee className={cn(
        size === "sm" && "w-3 h-3",
        size === "md" && "w-4 h-4",
        size === "lg" && "w-5 h-5",
        size === "xl" && "w-6 h-6",
      )} />
      <span>{typeof amount === "number" ? amount.toFixed(2) : amount}</span>
    </div>
  );
};

export { AmountDisplay };
