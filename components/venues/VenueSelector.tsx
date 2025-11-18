// components/venues/venue-selector.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, X } from "lucide-react";
import { VenueSelectorDialog } from "./VenueSelectorDialog";
import { cn } from "@/lib/utils";
import type { Venue } from "@/lib/api/venues";

interface VenueSelectorProps {
  value?: string | null;
  selectedVenue?: Venue | null;
  onChange: (venueId: string | null, venue: Venue | null) => void;
  required?: boolean;
  className?: string;
}

export function VenueSelector({
  value,
  selectedVenue,
  onChange,
  required = false,
  className,
}: VenueSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [venue, setVenue] = useState<Venue | null>(selectedVenue || null);

  const handleSelect = (selectedVenue: Venue) => {
    setVenue(selectedVenue);
    onChange(selectedVenue.id, selectedVenue);
  };

  const handleRemove = () => {
    setVenue(null);
    onChange(null, null);
  };

  return (
    <div className={cn("", className)}>
      {venue ? (
        <div className="border rounded-md p-3 bg-card">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium mb-1">{venue.name}</h4>
              {(venue.city || venue.country) && (
                <p className="text-sm text-muted-foreground mb-2">
                  {[venue.city, venue.country].filter(Boolean).join(", ")}
                </p>
              )}
              {venue.address && (
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{venue.address}</span>
                </div>
              )}
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(true)}
              >
                Change
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start h-9" // Match input height
          onClick={() => setIsDialogOpen(true)}
        >
          <MapPin className="h-4 w-4 mr-2" />
          Select venue
        </Button>
      )}

      <VenueSelectorDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSelect={handleSelect}
        selectedVenueId={value}
      />
    </div>
  );
}
