import * as React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * FloatingActionButton - FAB for mobile-first design
 * Touch-friendly, animated, warm dark mode styling
 * Positioned to avoid bottom navigation on mobile
 */
const FloatingActionButton = React.forwardRef(
  ({ className, icon: Icon = Plus, label = "Add", disabled = false, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        "group fixed z-40",
        // Mobile: Position above bottom nav (88px = 72px nav height + 16px padding)
        "bottom-[88px] right-4",
        // Desktop: Standard FAB position
        "md:bottom-8 md:right-8",
        "flex items-center gap-2 px-6 py-3 rounded-full",
        "bg-primary text-black font-medium",
        "transition-all duration-300",
        "hover:bg-primary-light hover:-translate-y-1 active:scale-95",
        "tap-target",
        disabled && "opacity-50 cursor-not-allowed hover:translate-y-0",
        className
      )}
      {...props}
    >
      <Icon
        className={cn(
          "w-5 h-5 transition-transform duration-300",
          !disabled && "group-hover:rotate-90"
        )}
      />
      <span className="font-semibold text-base">{label}</span>
    </button>
  )
);
FloatingActionButton.displayName = "FloatingActionButton";

export { FloatingActionButton };
