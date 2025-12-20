import React from "react";
import type { Event, EventStatus, Visibility } from "@/lib/api/events";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Users,
  MoreVertical,
  EyeOff,
  Eye,
  Edit,
  Calendar,
  Trash2,
  MapPin,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEvents } from "@/hooks/use-events";
import { EventSyncStatus } from "./EventSyncStatus";

interface EventCardProps extends Event {
  onDelete?: (event: Event) => Promise<void>;
}

export const EventCard = ({ onDelete, ...event }: EventCardProps) => {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const {
    remove,
    publish,
    unpublish,
  } = useEvents();

  const handleDelete = async () => {
    try {
      if (onDelete) {
        await onDelete(event);
      } else {
        await remove(event.id);
      }
      toast.success("Event deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete event");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handlePublish = async (event: Event) => {
    try {
      await publish(event.id);
      toast.success(`"${event.title}" has been published`);
    } catch (error) {
      console.error("Publish error:", error);
      toast.error(`Failed to publish "${event.title}"`);
    }
  };

  const handleUnpublish = async (event: Event) => {
    try {
      await unpublish(event.id);
      toast.success(`"${event.title}" has been unpublished`);
    } catch (error) {
      console.error("Unpublish error:", error);
      toast.error(`Failed to unpublish "${event.title}"`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-500 text-green-900 dark:text-green-100";
      case "SCHEDULED":
        return "bg-blue-500 text-blue-900 dark:text-blue-100";
      case "DRAFT":
        return "bg-gray-500 text-gray-900 dark:text-gray-100";
      case "ARCHIVED":
        return "bg-red-500 text-red-900 dark:text-red-100";
      default:
        return "";
    }
  };

  const getVisibilityIcon = (visibility: Visibility) => {
    switch (visibility) {
      case "PUBLIC":
        return <Eye className="h-3 w-3" />;
      case "PRIVATE":
        return <EyeOff className="h-3 w-3" />;
      case "UNLISTED":
        return <Eye className="h-3 w-3 opacity-50" />;
      default:
        return null;
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-card hover:shadow-lg transition-shadow">
      {/* Event Image */}
      {event.banner && (
        <div className="aspect-video bg-muted relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}`n
          <img
            src={event.banner.url}
            alt={event.banner.altText || event.title}
            className="w-full h-full object-cover"
          />
          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            <Badge className={getStatusColor(event.status)}>
              {event.status}
            </Badge>
          </div>
          {/* Visibility Icon */}
          <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm p-1.5 rounded">
            {getVisibilityIcon(event.visibility)}
          </div>
        </div>
      )}

      <div className="p-3 space-y-3">
        {/* Title */}
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-lg line-clamp-2">{event.title}</h3>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 bg-neutral-800 -mr-1 -mt-1"
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* <DropdownMenuItem onClick={() => handleEdit(event)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem> */}
              {event.status === "PUBLISHED" ? (
                <DropdownMenuItem onClick={() => handleUnpublish(event)}>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Unpublish
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handlePublish(event)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Publish
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => router.push(`/events/${event.id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  event &quot;{event.title}&quot; and remove it from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Description */}
        {event.shortDesc && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.shortDesc}
          </p>
        )}

        {/* Date */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>
            {formatDate(event.startAt)} at {formatTime(event.startAt)}
          </span>
        </div>

        {/* Venue */}
        {event.venue && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="truncate">
              {event.venue.name}
              {event.venue.city && `, ${event.venue.city}`}
            </span>
          </div>
        )}

        {/* Organizers */}
        {event.organizers && event.organizers.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1 flex-wrap">
              {event.organizers.slice(0, 2).map((eo) => (
                <Badge key={eo.organizerId} variant="secondary" className="text-xs">
                  {eo.organizer.name}
                </Badge>
              ))}
              {event.organizers.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{event.organizers.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Tickets */}
        {/* {event.tickets && event.tickets.length > 0 && (
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tickets:</span>
              <span className="font-medium">
                {event.tickets.reduce((sum, t) => sum + t.sold, 0)} /{" "}
                {event.tickets.reduce((sum, t) => sum + t.available, 0)} sold
              </span>
            </div>
          </div>
        )} */}

        {/* Content Management Actions */}
        <div className="pt-3 border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Mocking strapi data for now */}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <EventSyncStatus isSynced={(event as any).strapiSynced || false} />
            <span className="text-xs text-muted-foreground">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(event as any).strapiSynced ? "Synced" : "Syncing"}
            </span>
          </div>
          <button
            onClick={() => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const url = (event as any).strapiEditUrl || `${process.env.NEXT_PUBLIC_STRAPI_ADMIN_URL}/admin/content-manager/collection-types/api::event.event/${event.strapiDocumentId}`;
              window.open(url, "_blank");
            }}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            Edit Content
          </button>
        </div>
      </div>
    </div>
  );
};
