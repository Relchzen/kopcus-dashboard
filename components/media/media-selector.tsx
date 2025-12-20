// components/media/media-selector.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { MediaPickerDialog } from "./media-picker";

interface Media {
  id: string;
  url: string;
  altText: string | null;
}

interface MediaSelectorProps {
  label?: string;
  value?: string | null; // Media ID
  selectedMedia?: Media | null;
  onChange: (mediaId: string | null, media: Media | null) => void;
  folder?: string;
  required?: boolean;
  className?: string;
}

export function MediaSelector({
  className,
  label = "Select Media",
  selectedMedia,
  onChange,
  folder = "media",
  required = false,
}: MediaSelectorProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<Media | null>(
    selectedMedia || null
  );

  const handleSelect = (media: Media) => {
    setPreviewMedia(media);
    onChange(media.id, media);
  };

  const handleRemove = () => {
    setPreviewMedia(null);
    onChange(null, null);
  };

  return (
    <div className={`space-y-2 ${className} mb-8`}>
      {label && (
        <Label>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}

      <div className="relative w-full h-full overflow-hidden group">
        {previewMedia ? (
          <>
            {/* Image fully fills container but keeps aspect ratio */}
            {/* eslint-disable-next-line @next/next/no-img-element */}`n
            <img
              src={previewMedia.url}
              alt={previewMedia.altText || "Selected media"}
              className="absolute inset-0 w-full h-full object-contain"
            />

            {/* Overlay actions */}
            <div
              className="
    absolute inset-0 
    bg-black/60 
    opacity-0 group-hover:opacity-100 
    transition-opacity 
    flex items-center justify-center 
    gap-2 p-2
  "
            >
              <div className="flex flex-wrap gap-2 justify-center items-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsPickerOpen(true)}
                >
                  <Upload className="h-4 w-4" />
                  Change
                </Button>

                <Button variant="destructive" size="sm" onClick={handleRemove}>
                  <X className="h-4 w-4" />
                  Remove
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div
            className="absolute inset-0 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => setIsPickerOpen(true)}
          >
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm font-medium mb-1">Click to select media</p>
            <p className="text-xs text-muted-foreground">
              Choose from library or upload new
            </p>
          </div>
        )}
      </div>

      <MediaPickerDialog
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        onSelect={handleSelect}
        folder={folder}
      />
    </div>
  );
}
