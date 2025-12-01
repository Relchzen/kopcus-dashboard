"use client";

import { useState } from "react";
import { EventStatus, eventsApi } from "@/lib/api/events";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface EventStatusManagerProps {
  eventId: string;
  status: EventStatus;
}

export function EventStatusManager({
  eventId,
  status: initialStatus,
}: EventStatusManagerProps) {
  const [status, setStatus] = useState<EventStatus>(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (newStatus: EventStatus) => {
    setIsLoading(true);
    try {
      await eventsApi.updateStatus(eventId, newStatus);
      setStatus(newStatus);
      toast.success(`Event status updated to ${newStatus}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (s: EventStatus) => {
    switch (s) {
      case "PUBLISHED":
        return "default"; // Primary color usually
      case "DRAFT":
        return "secondary";
      case "COMPLETED":
        return "outline";
      case "CANCELLED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Status</CardTitle>
        <CardDescription>Manage the lifecycle of your event.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
          <span className="text-sm font-medium">Current Status</span>
          <Badge variant={getStatusColor(status)} className="capitalize">
            {status.toLowerCase()}
          </Badge>
        </div>

        <div className="flex flex-col gap-3">
          {status === "DRAFT" && (
            <Button
              onClick={() => handleStatusChange("PUBLISHED")}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Publish Event
            </Button>
          )}

          {status === "PUBLISHED" && (
            <>
              <Button
                variant="outline"
                onClick={() => handleStatusChange("DRAFT")}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Unpublish to Draft
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleStatusChange("COMPLETED")}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Mark as Completed
              </Button>
            </>
          )}

          {status === "COMPLETED" && (
            <div className="text-sm text-muted-foreground text-center p-2">
              This event has been completed.
            </div>
          )}
          
           {status === "CANCELLED" && (
            <div className="text-sm text-muted-foreground text-center p-2">
              This event was cancelled.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
