// app/(admin)/events/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EventForm } from "@/components/events/event-form";
import { useEvents } from "@/hooks/use-events";
import { useVenues } from "@/hooks/use-venues";
import { useOrganizers } from "@/hooks/use-organizers";
import {
  Plus,
  Search,
  Calendar,
  MapPin,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Users,
  MoreVertical,
} from "lucide-react";
import type { Event, EventStatus, Visibility } from "@/lib/api/events";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<EventStatus | "">("");
  const [visibilityFilter, setVisibilityFilter] = useState<Visibility | "">("");

  const {
    events,
    meta,
    isLoading,
    error,
    refresh,
    create,
    update,
    remove,
    publish,
    unpublish,
  } = useEvents({
    search: searchQuery || undefined,
    status: statusFilter || undefined,
    visibility: visibilityFilter || undefined,
  });

  const { venues } = useVenues();
  const { organizers } = useOrganizers();

  const handleDelete = async (event: Event) => {
    if (!confirm(`Are you sure you want to delete "${event.title}"?`)) return;

    try {
      await remove(event.id);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete event");
    }
  };

  const handlePublish = async (event: Event) => {
    try {
      await publish(event.id);
    } catch (error) {
      console.error("Publish error:", error);
      alert("Failed to publish event");
    }
  };

  const handleUnpublish = async (event: Event) => {
    try {
      await unpublish(event.id);
    } catch (error) {
      console.error("Unpublish error:", error);
      alert("Failed to unpublish event");
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
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "SCHEDULED":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "DRAFT":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
      case "ARCHIVED":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400";
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

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-destructive mb-4">Error: {error}</p>
          <Button onClick={refresh}>Retry</Button>
        </div>
      </div>
    );
  }

  if (isLoading && events.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Event Management</h1>
          <p className="text-muted-foreground">Create and manage your events</p>
        </div>
        <Button asChild>
          <Link href={"events/create"}>
            <Plus className="h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={statusFilter}
          onValueChange={(value: any) => setStatusFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            {/* <SelectItem value="">All Statuses</SelectItem> */}
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>

        {/* Visibility Filter */}
        <Select
          value={visibilityFilter}
          onValueChange={(value: any) => setVisibilityFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Visibility" />
          </SelectTrigger>
          <SelectContent>
            {/* <SelectItem value="">All Visibility</SelectItem> */}
            <SelectItem value="PUBLIC">Public</SelectItem>
            <SelectItem value="PRIVATE">Private</SelectItem>
            <SelectItem value="UNLISTED">Unlisted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold">{meta.total}</div>
          <div className="text-sm text-muted-foreground">Total Events</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold">
            {events.filter((e) => e.status === "PUBLISHED").length}
          </div>
          <div className="text-sm text-muted-foreground">Published</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold">
            {events.filter((e) => e.status === "DRAFT").length}
          </div>
          <div className="text-sm text-muted-foreground">Drafts</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold">
            {events.filter((e) => new Date(e.startAt) > new Date()).length}
          </div>
          <div className="text-sm text-muted-foreground">Upcoming</div>
        </div>
      </div> */}

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events?.map((event) => (
          <div
            key={event.id}
            className="border rounded-lg overflow-hidden bg-card hover:shadow-lg transition-shadow"
          >
            {/* Event Image */}
            {event.poster && (
              <div className="aspect-video bg-muted relative">
                <img
                  src={event.poster.url}
                  alt={event.poster.altText || event.title}
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

            <div className="p-4 space-y-3">
              {/* Title */}
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-semibold text-lg line-clamp-2">
                  {event.title}
                </h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <MoreVertical className="h-4 w-4" />
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
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(event)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                      <Badge
                        key={eo.id}
                        variant="secondary"
                        className="text-xs"
                      >
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
              {event.tickets && event.tickets.length > 0 && (
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tickets:</span>
                    <span className="font-medium">
                      {event.tickets.reduce((sum, t) => sum + t.sold, 0)} /{" "}
                      {event.tickets.reduce((sum, t) => sum + t.available, 0)}{" "}
                      sold
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {events?.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No events found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? "Try a different search term"
              : "Create your first event to get started"}
          </p>
          {/* {!searchQuery && (
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          )} */}
        </div>
      )}

      {/* Pagination */}
      {/* {meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={meta.page === 1}
            onClick={() => {
              // Handle previous page
            }}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {meta.page} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={meta.page === meta.totalPages}
            onClick={() => {
              // Handle next page
            }}
          >
            Next
          </Button>
        </div>
      )} */}
    </div>
  );
}
