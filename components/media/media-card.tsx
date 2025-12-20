"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy } from "lucide-react";
import { Media } from "@/lib/api/media";
import { useHoldAction } from "@/hooks/use-hold-action";

interface MediaCardProps {
  media: Media;
  isSelected: boolean;
  isSelectMode: boolean;
  onOpenDetails: (media: Media) => void;
  onToggleSelect: (id: string) => void; // toggles selection in parent
  onHoldSelect: (id: string) => void; // activates select mode + selects
  onCopyUrl?: (url: string) => void;
}

export function MediaCard({
  media,
  isSelected,
  isSelectMode,
  onToggleSelect,
  onOpenDetails,
  onHoldSelect,
  onCopyUrl,
}: MediaCardProps) {
  const hold = useHoldAction({
    onHold: () => onHoldSelect(media.id),
    holdDuration: 600,
  });

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCopyUrl) onCopyUrl(media.url);
    else {
      navigator.clipboard.writeText(media.url);
      // optional UX: toast instead of alert
      alert("URL copied to clipboard!");
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div
      className={`group relative border rounded-lg overflow-hidden bg-card hover:shadow-lg transition-shadow ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      {...hold}
      onClick={(e) => {
        // ensure parent click sees no bubbling
        e.stopPropagation();

        // If hold triggered, do nothing (wasHeld() consumes the flag)
        if (hold.wasHeld()) return;

        // If already in select mode: toggle selection
        if (isSelectMode) {
          onToggleSelect(media.id);
          return;
        }

        // Otherwise open details
        onOpenDetails(media);
      }}
      onDoubleClick={(e) => {
        // double-click should toggle selection when in select mode OR open details otherwise
        e.stopPropagation();
        if (isSelectMode) {
          onToggleSelect(media.id);
        } else {
          onOpenDetails(media);
        }
      }}
    >
      {/* Image */}
      <div className="aspect-video bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}`n
        <img
          src={media.url}
          alt={media.altText || "Media"}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Checkbox (always visible? you can hide when not select mode) */}
        <div className="absolute top-2 left-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => {
              // stopPropagation so it doesn't open details
              // parent handles toggling and select mode state
              // if the checkbox is used to select, ensure select mode is active - parent will set it
              onToggleSelect(media.id);
            }}
            className="bg-background shadow-sm"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Copy button */}
        <div className="absolute top-2 right-2">
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/20"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="font-medium text-sm truncate">
          {media.altText || "Untitled"}
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-muted-foreground">
            {media.width} × {media.height}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDate(media.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
