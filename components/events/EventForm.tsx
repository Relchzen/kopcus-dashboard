import React, { useEffect } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VenueSelector } from "@/components/venues/VenueSelector";
import { MediaSelector } from "@/components/media/media-selector";
import { OrganizerSelector } from "@/components/organizers/OrganizerSelector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { slugify } from "@/lib/utils";

export default function EventForm({ form }: { form: any }) {
  const title = form.watch("title");

  useEffect(() => {
    if (title && !form.formState.dirtyFields.slug) {
      form.setValue("slug", slugify(title));
    }
  }, [title, form]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          <FormField
            control={form.control}
            name="bannerId"
            render={({ field }) => (
              <MediaSelector
                className="h-60"
                label="Banner Image"
                value={field.value ?? null}
                selectedMedia={form.watch("banner")}
                onChange={(id, media) => {
                  field.onChange(id || null);
                  form.setValue("banner", media);
                }}
                required
              />
            )}
          />
        </div>

        <div className="md:col-span-1">
          <FormField
            control={form.control}
            name="posterId"
            render={({ field }) => (
              <MediaSelector
                className="h-60"
                label="Poster Image"
                value={field.value ?? null}
                selectedMedia={form.watch("poster")}
                onChange={(id, media) => {
                  field.onChange(id || null);
                  form.setValue("poster", media);
                }}
                required
              />
            )}
          />
        </div>
      </div>

      {/* Basic Informations */}
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <div className="space-y-2">
              <Label>Title</Label>
              <Input {...field} placeholder="Enter event title" />
            </div>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input {...field} placeholder="Leave empty to auto generate" />
            </div>
          )}
        />

        <FormField
          control={form.control}
          name="shortDesc"
          render={({ field }) => (
            <div className="space-y-2">
              <Label>Short Description</Label>
              <Textarea {...field} placeholder="Describe event shortly" />
            </div>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="visibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visibility</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PUBLIC">Public</SelectItem>
                    <SelectItem value="PRIVATE">Private</SelectItem>
                    <SelectItem value="UNLISTED">Unlisted</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div className="gap-4 flex flex-col">
            <FormField
              control={form.control}
              name="startAt"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input {...field} type="datetime-local" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endAt"
              render={({ field }) => (
                <FormItem className="w-full">
                  <div className="flex items-center gap-2">
                    <FormLabel>End Date</FormLabel>
                    <span className="text-xs px-2 py-0.5 rounded-full border border-muted text-muted-foreground">
                      optional
                    </span>
                  </div>
                  <FormControl>
                    <Input {...field} type="datetime-local" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Venue Location */}
          <div>
            <FormField
              name="venueId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue Location</FormLabel>
                  <FormControl>
                    <VenueSelector
                      value={field.value}
                      selectedVenue={form.watch("venue")}
                      onChange={(venueId, venue) => {
                        field.onChange(venueId);
                        form.setValue("venue", venue);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* ORGANIZERS SECTION - ADD THIS */}
        <FormField
          control={form.control}
          name="organizers"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organizers</FormLabel>
              <FormControl>
                <OrganizerSelector
                  value={field.value || []} // Make sure it's an array
                  onChange={(organizers) => {
                    field.onChange(organizers);
                    const ids = organizers.map((o) => o.organizerId);
                    form.setValue("organizerIds", ids);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
