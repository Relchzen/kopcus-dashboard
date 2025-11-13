"use client";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { UploadMediaDialog } from "./components/upload-media";
import { type Media } from "@/lib/api/media";
import { useMedias } from "@/hooks/use-media";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Copy, Download, Trash2 } from "lucide-react";
import { MediaCard } from "./components/media-card";

export default function MediaPanel() {
  const { medias, isLoading, error, refresh, remove, bulkRemove } = useMedias();
  const { data: session } = useSession();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMedias, setSelectedMedias] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const filteredMedias = medias.filter((m) =>
    m.altText?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelectMedia = (id: string) => {
    setSelectedMedias((prev) => {
      const exists = prev.includes(id);
      let next: string[];
      if (exists) {
        next = prev.filter((sid) => sid !== id);
        // if no items remain, exit select mode
        if (next.length === 0) setIsSelectMode(false);
      } else {
        next = [...prev, id];
        // entering selection by clicking checkbox should enter select mode
        if (!isSelectMode) setIsSelectMode(true);
      }
      return next;
    });
  };

  const handleHoldSelect = (id: string) => {
    setIsSelectMode(true);
    setSelectedMedias((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const exitSelectMode = () => {
    setIsSelectMode(false);
    setSelectedMedias([]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this media?")) return;
    await remove(id);
    setSelectedMedias((prev) => prev.filter((sid) => sid !== id));
    if (selectedMedia?.id === id) setIsDetailsOpen(false);
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("URL copied to clipboard!");
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  if (error)
    return (
      <div className="container mx-auto p-6 text-center py-12">
        <p className="text-destructive mb-4">Error: {error}</p>
        <Button onClick={refresh}>Retry</Button>
      </div>
    );

  if (isLoading)
    return (
      <div className="container mx-auto p-6 text-center py-12">
        Loading media library...
      </div>
    );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <Button
          size="sm"
          className="text-xs font-bold"
          onClick={() => setIsUploadDialogOpen(true)}
        >
          Upload Media
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 mt-4">
        {filteredMedias.map((media) => (
          <MediaCard
            key={media.id}
            media={media}
            isSelected={selectedMedias.includes(media.id)}
            isSelectMode={isSelectMode}
            onToggleSelect={() => toggleSelectMedia(media.id)}
            onHoldSelect={() => handleHoldSelect(media.id)}
            onOpenDetails={(m) => {
              setSelectedMedia(m);
              setIsDetailsOpen(true);
            }}
            onCopyUrl={copyUrl}
          />
        ))}
      </div>

      {/* Upload dialog */}
      <UploadMediaDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
      />

      {/* Details dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl">
          {selectedMedia && (
            <>
              <DialogHeader>
                <DialogTitle>Media Details</DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[75vh]">
                <div className="border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.altText || "Media"}
                    className="max-h-[70vh] object-contain"
                  />
                </div>

                <div className="flex flex-col justify-between overflow-y-auto pr-2">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        File Name
                      </label>
                      <p className="font-medium">
                        {selectedMedia.altText || "Untitled"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Dimensions
                      </label>
                      <p className="font-medium">
                        {selectedMedia.width} × {selectedMedia.height} px
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Type
                      </label>
                      <p className="font-medium">{selectedMedia.mime}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Uploaded
                      </label>
                      <p className="font-medium">
                        {formatDate(selectedMedia.createdAt)}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        URL
                      </label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={selectedMedia.url}
                          readOnly
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyUrl(selectedMedia.url)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => window.open(selectedMedia.url, "_blank")}
                    >
                      <Download className="h-4 w-4 mr-2" /> Download
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => {
                        handleDelete(selectedMedia.id);
                        setIsDetailsOpen(false);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
