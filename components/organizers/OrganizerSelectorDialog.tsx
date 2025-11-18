"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { OrganizerForm } from "./OrganizerForm";
import { Search, User, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CreateOrganizerDto, Organizer } from "../../lib/api/organizers";
import { useOrganizers } from "@/hooks/use-organizers";

interface OrganizerItem {
  organizerId: string;
  organizer: Organizer;
  role: string;
  order: number;
}

interface OrganizerSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOrganizers: OrganizerItem[];
  onUpdate: (organizer: OrganizerItem[]) => void;
}

export function OrganizerSelectorDialog({
  open,
  onOpenChange,
  selectedOrganizers,
  onUpdate,
}: OrganizerSelectorDialogProps) {
  const { organizers, isLoading, create } = useOrganizers();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("select");
  const [isCreating, setIsCreating] = useState(false);
  const [tempSelected, setTempSelected] =
    useState<OrganizerItem[]>(selectedOrganizers);

  const filteredOrganizers = (organizers || []).filter(
    (organizer) =>
      organizer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      organizer.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      organizer.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isSelected = (organizerId: string) => {
    return tempSelected.some((item) => item.organizerId === organizerId);
  };

  const handleToggleOrganizer = (organizer: Organizer) => {
    if (isSelected(organizer.id)) {
      setTempSelected(
        tempSelected.filter((item) => item.organizerId !== organizer.id)
      );
    } else {
      const newItem: OrganizerItem = {
        organizerId: organizer.id,
        organizer,
        role: "",
        order: tempSelected.length,
      };

      setTempSelected([...tempSelected, newItem]);
    }
  };

  const handleCreate = async (data: CreateOrganizerDto) => {
    setIsCreating(true);
    try {
      const newOrganizer = await create(data);
      const newItem: OrganizerItem = {
        organizerId: newOrganizer.id,
        organizer: newOrganizer,
        role: "",
        order: tempSelected.length,
      };

      setTempSelected([...tempSelected, newItem]);
      setActiveTab("select");
    } catch (error) {
      console.error("Failed to create organizer: ", error);
      alert("Failed to create organizer. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDone = () => {
    onUpdate(tempSelected);
    onOpenChange(false);
  };

  useEffect(() => {
    if (open) {
      setActiveTab("select");
      setSearchQuery("");
      setTempSelected(selectedOrganizers);
    }
  }, [open, selectedOrganizers]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select or Create Organizers</DialogTitle>
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
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search organizers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {tempSelected.length > 0 && (
              <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm font-medium">
                  {tempSelected.length} organizer
                  {tempSelected.length !== 1 ? "s" : ""} selected
                </p>
              </div>
            )}

            {/* Organizers List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading organizers...
                </div>
              ) : filteredOrganizers.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "No organizers found"
                      : "No organizers available"}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("create")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Organizer
                  </Button>
                </div>
              ) : (
                filteredOrganizers.map((organizer) => {
                  const selected = isSelected(organizer.id);
                  return (
                    <button
                      key={organizer.id}
                      onClick={() => handleToggleOrganizer(organizer)}
                      className={cn(
                        "w-full text-left p-4 rounded-lg border-2 transition-all hover:bg-accent",
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">
                              {organizer.name}
                            </h3>
                            {selected && (
                              <Check className="h-4 w-4 text-primary shrink-0" />
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground mb-2">
                            {organizer.type}
                          </p>

                          {organizer.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {organizer.description}
                            </p>
                          )}

                          {(organizer.email || organizer.website) && (
                            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                              {organizer.email && (
                                <span>{organizer.email}</span>
                              )}
                              {organizer.website && (
                                <span>{organizer.website}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            {/* Actions */}
            <div className="flex gap-2 justify-end pt-4 border-t mt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleDone}>Done ({tempSelected.length})</Button>
            </div>
          </TabsContent>

          <TabsContent value="create" className="flex-1 overflow-y-auto mt-4">
            <OrganizerForm
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
