// app/(admin)/events/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEvents } from "@/hooks/use-events";
import {
  Plus,
  Search,
  Calendar,
} from "lucide-react";
import type { EventStatus, Visibility } from "@/lib/api/events";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EventCard } from "@/components/events/EventCard";

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<EventStatus | "">("");
  const [visibilityFilter, setVisibilityFilter] = useState<Visibility | "">("");
  const router = useRouter();

  const {
    events,
    isLoading,
    error,
    refetch,
    remove,
  } = useEvents();

  // const { venues } = useVenues();
  // const { organizers } = useOrganizers();

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-destructive mb-4">
            Error: Fetch failed, please try again
          </p>
          <Button onClick={() => refetch}>Retry</Button>
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

  console.log(events);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Event Management</h1>
          <p className="text-muted-foreground">Create and manage your events</p>
        </div>
        <Button asChild>
          <Link href={"/events/create"}>
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
          onValueChange={(value: EventStatus | "") => setStatusFilter(value)}
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
          onValueChange={(value: Visibility | "") => setVisibilityFilter(value)}
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

      {/* Events Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {events?.map((event) => (
          <EventCard
            {...event}
            key={event.id}
            onDelete={async () => await remove(event.id)}
          />
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
          {!searchQuery && (
            <Button onClick={() => router.push("/events/create")}>
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          )}
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

{
  /* Stats */
}
{
  /* <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
      </div> */
}
