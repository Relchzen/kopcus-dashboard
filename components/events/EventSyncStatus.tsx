import React from "react";
import { CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EventSyncStatusProps {
  isSynced: boolean;
  showLabel?: boolean;
  className?: string;
}

export const EventSyncStatus = ({
  isSynced,
  showLabel = false,
  className,
}: EventSyncStatusProps) => {
  if (showLabel) {
    return isSynced ? (
      <Badge
        variant="outline"
        className={cn(
          "bg-green-50 text-green-700 border-green-200 gap-1",
          className
        )}
      >
        <CheckCircle className="h-3 w-3" />
        Synced to CMS
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className={cn(
          "bg-yellow-50 text-yellow-700 border-yellow-200 gap-1",
          className
        )}
      >
        <Clock className="h-3 w-3 animate-pulse" />
        Syncing…
      </Badge>
    );
  }

  return isSynced ? (
    <CheckCircle className={cn("h-4 w-4 text-green-500", className)} />
  ) : (
    <Clock
      className={cn("h-4 w-4 text-yellow-500 animate-pulse", className)}
    />
  );
};
