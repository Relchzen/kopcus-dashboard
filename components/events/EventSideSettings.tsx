"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type Props = {};

export default function EventSideSettings({ form }: { form: any }) {
  return (
    <div className="sticky top-6 flex flex-col border rounded-lg bg-background">
      {/* Header */}
      <div className="px-4 py-3 border-b">
        <h2 className="text-sm font-semibold">Additional Settings</h2>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1 px-2 py-4">
        <div className="space-y-6">
          <div className="pb-4 border-b">
            <Label className="text-sm mb-2 block">Page Info</Label>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium">
                  {form.watch("status") || "Draft"}
                </span>
              </div>

              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value} // ⬅ use value instead of defaultValue
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PUBLIC">Public</SelectItem>
                          <SelectItem value="PRIVATE">Private</SelectItem>
                          <SelectItem value="UNLISTED">Unlisted</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* SEO Title */}
          <FormField
            control={form.control}
            name="seoTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">SEO Title</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={form.watch("title") || "Event title"}
                    className="text-sm w-full"
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  {field.value?.length || 0}/60 characters
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* SEO Description */}
          <FormField
            control={form.control}
            name="seoDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">SEO Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={form.watch("shortDesc") || "Event description"}
                    rows={4}
                    className="text-sm w-full"
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  {field.value?.length || 0}/160 characters
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* SEO Preview */}
          <div className="pt-4 border-t">
            <Label className="text-sm mb-2 block">Search Preview</Label>
            <div className="space-y-1 p-3 bg-muted/50 rounded-md">
              <div className="text-sm text-blue-600 truncate">
                {form.watch("seoTitle") || form.watch("title") || "Event Title"}
              </div>
              <div className="text-xs text-green-700 truncate">
                yourdomain.com/events/
                {form.watch("slug") || "event-slug"}
              </div>
              <div className="text-xs text-muted-foreground line-clamp-2">
                {form.watch("seoDescription") ||
                  form.watch("shortDesc") ||
                  "Event description will appear here..."}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
