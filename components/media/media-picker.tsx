// components/media/media-picker-dialog.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Upload, Check } from "lucide-react";
import { UploadMediaDialog } from "./upload-media";
import { cn } from "@/lib/utils";

interface Media {
  id: string;
  url: string;
  type: string;
  mime: string | null;
  width: number | null;
  height: number | null;
  altText: string | null;
  createdAt: string;
}

interface MediaPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (media: Media) => void;
  folder?: string;
  title?: string;
  description?: string;
}

export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
  folder = "media",
  title = "Select Media",
  description = "Choose an existing image or upload a new one",
}: MediaPickerDialogProps) {
  const { data: session } = useSession();
  const [medias, setMedias] = useState<Media[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const fetchMedias = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL}/media`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      const data = await res.json();
      setMedias(data);
    } catch (error) {
      console.error("Failed to fetch medias:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    if (open && session?.accessToken) {
      fetchMedias();
    }
  }, [open, session?.accessToken, fetchMedias]);

  const filteredMedias = medias.filter((media) =>
    media.altText?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = () => {
    const media = medias.find((m) => m.id === selectedMediaId);
    if (media) {
      onSelect(media);
      onOpenChange(false);
    }
  };

  const handleUploadSuccess = (uploadedMedia: { id: string; url: string; width?: number; height?: number }) => {
    fetchMedias();
    setSelectedMediaId(uploadedMedia.id);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>

          <Tabs defaultValue="library" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="library">Media Library</TabsTrigger>
              <TabsTrigger value="upload">Upload New</TabsTrigger>
            </TabsList>

            <TabsContent value="library" className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search media..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Media Grid */}
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto">
                {isLoading ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    Loading...
                  </div>
                ) : filteredMedias.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    No media found
                  </div>
                ) : (
                  filteredMedias.map((media) => (
                    <div
                      key={media.id}
                      className={cn(
                        "relative aspect-square border-2 rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md",
                        selectedMediaId === media.id
                          ? "border-primary ring-2 ring-primary"
                          : "border-border"
                      )}
                      onClick={() => setSelectedMediaId(media.id)}
                    >
                      <Image
                        src={media.url}
                        alt={media.altText || "Media"}
                        fill
                        className="object-cover"
                      />
                      {selectedMediaId === media.id && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="bg-primary text-primary-foreground rounded-full p-1">
                            <Check className="h-4 w-4" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSelect} disabled={!selectedMediaId}>
                  Select
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="upload">
              <div className="py-4 text-center">
                <Button onClick={() => setIsUploadDialogOpen(true)} size="lg">
                  <Upload className="h-4 w-4" />
                  Upload New Media
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <UploadMediaDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onUploadSuccess={handleUploadSuccess}
        folder={folder}
      />
    </>
  );
}
