import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/15 text-primary-light hover:bg-primary/25",
        secondary:
          "border-transparent bg-background-elevated text-text-secondary hover:bg-background-elevated/80",
        destructive:
          "border-transparent bg-error/15 text-error hover:bg-error/25",
        success:
          "border-transparent bg-success/15 text-success hover:bg-success/25",
        accent:
          "border-transparent bg-accent/15 text-accent hover:bg-accent/25",
        outline: "text-text-primary border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
