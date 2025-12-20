// components/venues/venue-form.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Venue, CreateVenueDto } from "@/lib/api/venues";

interface VenueFormProps {
  venue?: Venue | null;
  onSubmit: (data: CreateVenueDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function VenueForm({
  venue,
  onSubmit,
  onCancel,
  isSubmitting,
}: VenueFormProps) {
  const [formData, setFormData] = useState<CreateVenueDto>({
    name: "",
    address: "",
    city: "",
    country: "",
    lat: undefined,
    lng: undefined,
    mapUrl: "",
    capacity: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Valid pattern: Sync form data with venue prop changes
  useEffect(() => {
    if (venue) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: venue.name,
        address: venue.address || "",
        city: venue.city || "",
        country: venue.country || "",
        lat: venue.lat || undefined,
        lng: venue.lng || undefined,
        mapUrl: venue.mapUrl || "",
        capacity: venue.capacity || undefined,
      });
    }
  }, [venue]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Venue name is required";
    }

    if (
      formData.lat !== undefined &&
      (formData.lat < -90 || formData.lat > 90)
    ) {
      newErrors.lat = "Latitude must be between -90 and 90";
    }

    if (
      formData.lng !== undefined &&
      (formData.lng < -180 || formData.lng > 180)
    ) {
      newErrors.lng = "Longitude must be between -180 and 180";
    }

    if (formData.capacity !== undefined && formData.capacity < 0) {
      newErrors.capacity = "Capacity must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Venue Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter venue name"
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          placeholder="Enter venue address"
          rows={3}
        />
      </div>

      {/* City and Country */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="e.g., Jakarta"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={formData.country}
            onChange={(e) =>
              setFormData({ ...formData, country: e.target.value })
            }
            placeholder="e.g., Indonesia"
          />
        </div>
      </div>

      {/* Coordinates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="lat">Latitude</Label>
          <Input
            id="lat"
            type="number"
            step="any"
            value={formData.lat ?? ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                lat: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
            placeholder="-6.2088"
            className={errors.lat ? "border-destructive" : ""}
          />
          {errors.lat && (
            <p className="text-sm text-destructive">{errors.lat}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lng">Longitude</Label>
          <Input
            id="lng"
            type="number"
            step="any"
            value={formData.lng ?? ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                lng: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
            placeholder="106.8456"
            className={errors.lng ? "border-destructive" : ""}
          />
          {errors.lng && (
            <p className="text-sm text-destructive">{errors.lng}</p>
          )}
        </div>
      </div>

      {/* Map URL */}
      <div className="space-y-2">
        <Label htmlFor="mapUrl">Map URL</Label>
        <Input
          id="mapUrl"
          value={formData.mapUrl}
          onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
          placeholder="https://maps.google.com/..."
        />
      </div>

      {/* Capacity */}
      <div className="space-y-2">
        <Label htmlFor="capacity">Capacity</Label>
        <Input
          id="capacity"
          type="number"
          value={formData.capacity ?? ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              capacity: e.target.value ? parseInt(e.target.value) : undefined,
            })
          }
          placeholder="e.g., 1000"
          className={errors.capacity ? "border-destructive" : ""}
        />
        {errors.capacity && (
          <p className="text-sm text-destructive">{errors.capacity}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : venue ? "Update Venue" : "Create Venue"}
        </Button>
      </div>
    </form>
  );
}
