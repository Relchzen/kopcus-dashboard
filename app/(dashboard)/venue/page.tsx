// app/(admin)/venues/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VenueForm } from "@/components/venues/VenueForm";
import { useVenues } from "@/hooks/use-venues";
import {
  Plus,
  Search,
  MapPin,
  Edit,
  Trash2,
  Users,
  Calendar,
  ExternalLink,
} from "lucide-react";
import type { Venue, CreateVenueDto } from "@/lib/api/venues";

export default function VenuesPage() {
  const { venues, isLoading, error, refresh, create, update, remove } =
    useVenues();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredVenues = venues.filter(
    (venue) =>
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.country?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setEditingVenue(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (venue: Venue) => {
    setEditingVenue(venue);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: CreateVenueDto) => {
    setIsSubmitting(true);
    try {
      if (editingVenue) {
        await update(editingVenue.id, data);
      } else {
        await create(data);
      }
      setIsDialogOpen(false);
      setEditingVenue(null);
    } catch (error) {
      console.error("Submit error:", error);
      alert("Failed to save venue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (venue: Venue) => {
    if (
      venue._count &&
      (venue._count.events > 0 || venue._count.schedules > 0)
    ) {
      alert("Cannot delete venue with associated events or schedules");
      return;
    }

    if (!confirm(`Are you sure you want to delete "${venue.name}"?`)) return;

    try {
      await remove(venue.id);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete venue");
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">Loading venues...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Venue Management</h1>
          <p className="text-muted-foreground">
            Manage event venues and locations
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4" />
          Add Venue
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search venues..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold">{venues.length}</div>
          <div className="text-sm text-muted-foreground">Total Venues</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold">
            {new Set(venues.map((v) => v.city).filter(Boolean)).size}
          </div>
          <div className="text-sm text-muted-foreground">Cities</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold">
            {venues.reduce((sum, v) => sum + (v._count?.events || 0), 0)}
          </div>
          <div className="text-sm text-muted-foreground">Total Events</div>
        </div>
      </div>

      {/* Venues List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVenues.map((venue) => (
          <div
            key={venue.id}
            className="border rounded-lg p-4 bg-card hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{venue.name}</h3>
                {venue.city && venue.country && (
                  <p className="text-sm text-muted-foreground">
                    {venue.city}, {venue.country}
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(venue)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(venue)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {venue.address && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground mb-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span className="line-clamp-2">{venue.address}</span>
              </div>
            )}

            <div className="flex items-center gap-4 text-sm mt-3 pt-3 border-t">
              {venue.capacity && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{venue.capacity}</span>
                </div>
              )}
              {venue._count && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{venue._count.events} events</span>
                </div>
              )}
              {venue.mapUrl && (
                <a
                  href={venue.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline ml-auto"
                >
                  <ExternalLink className="h-4 w-4" />
                  Map
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredVenues.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No venues found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? "Try a different search term"
              : "Add your first venue to get started"}
          </p>
          {!searchQuery && (
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4" />
              Add Venue
            </Button>
          )}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVenue ? "Edit Venue" : "Create New Venue"}
            </DialogTitle>
          </DialogHeader>
          <VenueForm
            venue={editingVenue}
            onSubmit={handleSubmit}
            onCancel={() => setIsDialogOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
