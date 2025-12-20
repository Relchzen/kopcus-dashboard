// components/venues/venue-selector-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VenueForm } from "./VenueForm";
import { useVenues } from "@/hooks/use-venues";
import { Search, MapPin, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Venue, CreateVenueDto } from "@/lib/api/venues";

interface VenueSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (venue: Venue) => void;
  selectedVenueId?: string | null;
}

export function VenueSelectorDialog({
  open,
  onOpenChange,
  onSelect,
  selectedVenueId,
}: VenueSelectorDialogProps) {
  const { venues, isLoading, create } = useVenues();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("select");
  const [isCreating, setIsCreating] = useState(false);

  const filteredVenues = venues.filter(
    (venue) =>
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.country?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (venue: Venue) => {
    onSelect(venue);
    onOpenChange(false);
  };

  const handleCreate = async (data: CreateVenueDto) => {
    setIsCreating(true);
    try {
      const newVenue = await create(data);
      onSelect(newVenue);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create venue:", error);
      alert("Failed to create venue");
    } finally {
      setIsCreating(false);
    }
  };

  // Reset to select tab when dialog opens
  useEffect(() => {
    if (open) {
      setActiveTab("select");
      setSearchQuery("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select or Create Venue</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="select">Select Existing</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>

          <TabsContent
            value="select"
            className="flex-1 flex flex-col overflow-hidden mt-4"
          >
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Venues List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading venues...
                </div>
              ) : filteredVenues.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? "No venues found" : "No venues available"}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("create")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Venue
                  </Button>
                </div>
              ) : (
                filteredVenues.map((venue) => (
                  <button
                    key={venue.id}
                    onClick={() => handleSelect(venue)}
                    className={cn(
                      "w-full text-left p-4 rounded-lg border-2 transition-all hover:bg-accent",
                      selectedVenueId === venue.id
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">
                            {venue.name}
                          </h3>
                          {selectedVenueId === venue.id && (
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          )}
                        </div>

                        {(venue.city || venue.country) && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {[venue.city, venue.country]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        )}

                        {venue.address && (
                          <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">
                              {venue.address}
                            </span>
                          </div>
                        )}

                        {venue.capacity && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Capacity: {venue.capacity}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-4 border-t mt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="create" className="flex-1 overflow-y-auto mt-4">
            <VenueForm
              onSubmit={handleCreate}
              onCancel={() => setActiveTab("select")}
              isSubmitting={isCreating}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
