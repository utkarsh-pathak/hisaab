import * as React from "react";
import { Inbox } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

/**
 * EmptyState - Consistent empty state component
 * Shows when lists/data are empty
 */
const EmptyState = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  actionLabel,
  className,
}) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center p-12 text-center",
      "rounded-2xl bg-background-elevated/50 border border-border",
      className
    )}
  >
    <div className="mb-4 p-4 rounded-full bg-primary/10">
      <Icon className="w-12 h-12 text-primary/70" />
    </div>
    <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
    {description && (
      <p className="text-sm text-text-secondary max-w-sm mb-6">{description}</p>
    )}
    {action && actionLabel && (
      <Button onClick={action} variant="default">
        {actionLabel}
      </Button>
    )}
  </div>
);

export { EmptyState };
