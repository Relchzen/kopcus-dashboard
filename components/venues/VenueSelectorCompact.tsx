// components/venues/venue-selector-compact.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { VenueSelectorDialog } from "./VenueSelectorDialog";
import { useVenues } from "@/hooks/use-venues";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Venue } from "@/lib/api/venues";

interface VenueSelectorCompactProps {
  value?: string | null;
  onChange: (venueId: string | null, venue: Venue | null) => void;
  placeholder?: string;
}

export function VenueSelectorCompact({
  value,
  onChange,
  placeholder = "Select venue...",
}: VenueSelectorCompactProps) {
  const { venues } = useVenues();
  const [open, setOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const selectedVenue = venues.find((v) => v.id === value);

  const handleSelect = (venue: Venue) => {
    onChange(venue.id, venue);
    setOpen(false);
  };

  const handleCreateNew = () => {
    setOpen(false);
    setIsDialogOpen(true);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedVenue ? (
              <span className="truncate">
                {selectedVenue.name}
                {selectedVenue.city && ` - ${selectedVenue.city}`}
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search venues..." />
            <CommandList>
              <CommandEmpty>No venue found.</CommandEmpty>
              <CommandGroup>
                {venues.map((venue) => (
                  <CommandItem
                    key={venue.id}
                    value={venue.id}
                    onSelect={() => handleSelect(venue)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === venue.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{venue.name}</div>
                      {venue.city && (
                        <div className="text-xs text-muted-foreground">
                          {venue.city}
                          {venue.country && `, ${venue.country}`}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem onSelect={handleCreateNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create new venue
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <VenueSelectorDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSelect={(venue) => {
          onChange(venue.id, venue);
          setIsDialogOpen(false);
        }}
        selectedVenueId={value}
      />
    </>
  );
}
