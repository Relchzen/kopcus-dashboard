"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { User, X } from "lucide-react";
import { OrganizerSelectorDialog } from "./OrganizerSelectorDialog";
import { cn } from "@/lib/utils";
import type { Organizer } from "@/lib/api/organizers";

interface OrganizerItem {
  organizerId: string;
  organizer: Organizer;
  role: string;
  order: number;
}

interface OrganizerSelectorProps {
  value?: OrganizerItem[];
  onChange: (organizers: OrganizerItem[]) => void;
  className?: string;
}

const ORGANIZER_ROLES = [
  "Headliner",
  "Supporting Act",
  "Sponsor",
  "Host",
  "Co-organizer",
  "Partner",
];

export function OrganizerSelector({
  value = [],
  onChange,
  className,
}: OrganizerSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrganizers, setSelectedOrganizers] =
    useState<OrganizerItem[]>(value);

  // Sync internal state with prop changes
  useEffect(() => {
    setSelectedOrganizers(value);
  }, [value]);

  const handleAddOrganizers = (newOrganizers: OrganizerItem[]) => {
    setSelectedOrganizers(newOrganizers);
    onChange(newOrganizers);
  };

  const handleRemove = (index: number) => {
    const updated = selectedOrganizers.filter((_, i) => i !== index);
    setSelectedOrganizers(updated);
    onChange(updated);
  };

  const handleUpdateRole = (index: number, role: string) => {
    const updated = [...selectedOrganizers];
    updated[index] = { ...updated[index], role };
    setSelectedOrganizers(updated);
    onChange(updated);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Selected Organizers */}
      {selectedOrganizers.length > 0 && (
        <div className="space-y-2">
          {selectedOrganizers.map((item, index) => (
            <div
              key={item.organizerId}
              className="border rounded-md p-3 bg-card"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium mb-1">{item.organizer.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.organizer.type}
                  </p>
                  {item.organizer.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.organizer.description}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 items-start shrink-0">
                  <select
                    value={item.role || ""}
                    onChange={(e) => handleUpdateRole(index, e.target.value)}
                    className="text-sm border rounded-md px-2 py-1 bg-background min-w-[120px]"
                  >
                    <option value="">Select role...</option>
                    {ORGANIZER_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Organizer Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full justify-start h-9"
        onClick={() => setIsDialogOpen(true)}
      >
        <User className="h-4 w-4 mr-2" />
        {selectedOrganizers.length > 0
          ? "Add another organizer"
          : "Select organizers"}
      </Button>

      <OrganizerSelectorDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedOrganizers={selectedOrganizers}
        onUpdate={handleAddOrganizers}
      />
    </div>
  );
}
