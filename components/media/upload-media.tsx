// components/media/media-upload-dialog.tsx
"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Upload,
  X,
  FileImage,
  Calendar,
  HardDrive,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess?: (media: {
    id: string;
    url: string;
    width?: number;
    height?: number;
  }) => void;
  folder?: string;
  title?: string;
  description?: string;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
}

interface ImageDimensions {
  width: number;
  height: number;
}

export function UploadMediaDialog({
  open,
  onOpenChange,
  onUploadSuccess,
  folder = "media",
  title = "Upload Media",
  description = "Upload an image file to your media library",
  acceptedFileTypes = "image/*",
  maxSizeMB = 5,
}: MediaUploadDialogProps) {
  const { data: session } = useSession();
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] =
    useState<ImageDimensions | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [altText, setAltText] = useState("");

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getImageDimensions = (file: File): Promise<ImageDimensions> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image"));
      };

      img.src = url;
    });
  };

  const handleFileSelect = async (file: File) => {
    setError(null);

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    const allowedTypes = acceptedFileTypes.split(",").map((t) => t.trim());
    const isValidType = allowedTypes.some((type) => {
      if (type === "image/*") return file.type.startsWith("image/");
      return file.type === type;
    });

    if (!isValidType) {
      setError("Invalid file type. Please upload an image.");
      return;
    }

    setUploadFile(file);
    setAltText(file.name.replace(/\.[^/.]+$/, "")); // Remove extension

    // Generate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Get image dimensions
    try {
      const dimensions = await getImageDimensions(file);
      setImageDimensions(dimensions);
    } catch (err) {
      console.error("Failed to get image dimensions:", err);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUpload = async () => {
    if (!uploadFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("folder", folder);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NEST_API_URL}/media/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: formData,
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Upload failed");
      }

      const data = await res.json();

      // Update alt text if provided
      if (altText && altText !== uploadFile.name.replace(/\.[^/.]+$/, "")) {
        await fetch(
          `${process.env.NEXT_PUBLIC_NEST_API_URL}/media/${data.id}/alt-text`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.accessToken}`,
            },
            body: JSON.stringify({ altText }),
          }
        );
      }

      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess(data);
      }

      // Reset and close
      handleClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setUploadFile(null);
    setUploadPreview(null);
    setImageDimensions(null);
    setError(null);
    setAltText("");
    setIsDragging(false);
    onOpenChange(false);
  };

  const handleRemoveFile = () => {
    setUploadFile(null);
    setUploadPreview(null);
    setImageDimensions(null);
    setAltText("");
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}

          {/* File Input / Preview with Side-by-Side Layout */}
          {!uploadPreview ? (
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-accent/50"
              )}
              onClick={() => document.getElementById("file-input")?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">
                {isDragging
                  ? "Drop file here"
                  : "Click to upload or drag and drop"}
              </p>
              <p className="text-sm text-muted-foreground">
                PNG, JPG, WebP, GIF up to {maxSizeMB}MB
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Image Preview */}
              <div className="space-y-4">
                <div className="relative border rounded-lg overflow-hidden bg-muted aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}`n
                  <img
                    src={uploadPreview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 shadow-lg"
                    onClick={handleRemoveFile}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Alt Text Input */}
                <div className="space-y-2">
                  <Label htmlFor="alt-text">
                    Alt Text{" "}
                    <span className="text-xs text-muted-foreground font-normal">
                      (Recommended)
                    </span>
                  </Label>
                  <Input
                    id="alt-text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Describe the image"
                  />
                  <p className="text-xs text-muted-foreground">
                    Helps with accessibility and SEO
                  </p>
                </div>
              </div>

              {/* Right: File Details */}
              <div className="space-y-4">
                <h3 className="font-semibold">File Details</h3>

                {/* File Name */}
                <div className="flex items-start gap-3 p-4 border rounded-lg bg-card">
                  <FileImage className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      File Name
                    </div>
                    <div className="text-sm font-medium break-all">
                      {uploadFile?.name}
                    </div>
                  </div>
                </div>

                {/* Two Column Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Dimensions */}
                  {imageDimensions && (
                    <div className="flex items-start gap-3 p-4 border rounded-lg bg-card">
                      <ImageIcon className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          Dimensions
                        </div>
                        <div className="text-sm font-medium">
                          {imageDimensions.width} × {imageDimensions.height}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {(
                            imageDimensions.width / imageDimensions.height
                          ).toFixed(2)}
                          :1
                        </div>
                      </div>
                    </div>
                  )}

                  {/* File Size */}
                  <div className="flex items-start gap-3 p-4 border rounded-lg bg-card">
                    <HardDrive className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Size
                      </div>
                      <div className="text-sm font-medium">
                        {uploadFile && formatFileSize(uploadFile.size)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {uploadFile &&
                          `${(
                            (uploadFile.size / (maxSizeMB * 1024 * 1024)) *
                            100
                          ).toFixed(0)}% of max`}
                      </div>
                    </div>
                  </div>

                  {/* File Type */}
                  <div className="flex items-start gap-3 p-4 border rounded-lg bg-card">
                    <FileImage className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Type
                      </div>
                      <div className="text-sm font-medium">
                        {uploadFile?.type.split("/")[1].toUpperCase()}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 truncate">
                        {uploadFile?.type}
                      </div>
                    </div>
                  </div>

                  {/* Last Modified */}
                  <div className="flex items-start gap-3 p-4 border rounded-lg bg-card">
                    <Calendar className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Modified
                      </div>
                      <div className="text-sm font-medium">
                        {uploadFile &&
                          new Date(
                            uploadFile.lastModified
                          ).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {uploadFile &&
                          new Date(uploadFile.lastModified).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    💡 <strong>Tip:</strong> Adding alt text improves
                    accessibility and helps search engines understand your
                    images.
                  </p>
                </div>
              </div>
            </div>
          )}

          <input
            id="file-input"
            type="file"
            accept={acceptedFileTypes}
            className="hidden"
            onChange={handleFileInputChange}
          />

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!uploadFile || isUploading}
            >
              {isUploading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
