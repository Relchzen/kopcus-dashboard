"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import EventForm from "@/components/events/EventForm";
import { EventFormBanner } from "@/components/events/EventFormBanner";
import { useEvents } from "@/hooks/use-events";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { EventStatus } from "@/lib/api/events";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Checkbox } from "@/components/ui/checkbox";
import { slugify } from "@/lib/utils";

const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")
    .optional(),
  shortDesc: z.string().max(500).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "UNLISTED"]).optional(),
  startAt: z.string().min(1, "Start date is required"),
  endAt: z.string().optional(),
  timezone: z.string().optional(),
  venueId: z.string().optional(),
  venue: z.any().optional(),
  posterId: z.string().optional(),
  poster: z.any().optional(),
  bannerId: z.string().optional(),
  banner: z.any().optional(),
  organizers: z.array(z.any()).optional(),
  organizerIds: z.array(z.string()).optional(),
  publishImmediately: z.boolean(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

export default function CreateEventPage() {
  const router = useRouter();
  const { create } = useEvents({ autoFetch: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      shortDesc: "",
      status: "DRAFT",
      visibility: "PUBLIC",
      startAt: "",
      endAt: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      venue: null,
      venueId: "",
      poster: null,
      banner: null,
      posterId: "",
      bannerId: "",
      organizers: [],
      organizerIds: [],
      publishImmediately: false,
    },
  });

  const handleSubmit = async (data: EventFormValues) => {
    setIsSubmitting(true);
    try {
      const status: EventStatus = data.publishImmediately ? "PUBLISHED" : "DRAFT";
      
      const eventData = {
        title: data.title,
        slug: data.slug || slugify(data.title),
        shortDesc: data.shortDesc || undefined,
        status: status,
        visibility: data.visibility || "PUBLIC",
        startAt: new Date(data.startAt).toISOString(),
        endAt: data.endAt ? new Date(data.endAt).toISOString() : undefined,
        timezone:
          data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        venueId: data.venueId || undefined,
        posterId: data.posterId || undefined,
        bannerId: data.bannerId || undefined,
        organizers:
          data.organizers?.map((org, index) => ({
            organizerId: org.organizerId,
            role: org.role || "",
            order: org.order ?? index,
          })) || [],
        organizerIds: data.organizerIds,
      };

      const newEvent = await create(eventData);
      
      console.log('newEvent Received: ', newEvent)
      // Mock Strapi data for now since backend might not be updated yet
      // In a real scenario, these would come from newEvent
      const strapiSynced = !newEvent.strapiNeedsSync;

      if (status === "PUBLISHED") {
        toast.success("Event published successfully!");
      } else {
        toast.success("Draft created successfully!");
      }

      router.push(
        `/events/success?eventId=${newEvent.id}&eventTitle=${encodeURIComponent(
          newEvent.title
        )}&synced=${strapiSynced}&status=${status}`
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create event. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = (data: EventFormValues) => {
    handleSubmit(data);
  };

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <PageHeader
        title="Create Event"
        description="Get started by filling in the basic details for your event."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Events", href: "/events" },
          { label: "Create", href: "#" },
        ]}
        backButton={{ label: "Back to Events", href: "/events" }}
      />

      <EventFormBanner />

      <Form {...form}>
        <div className="mt-6 space-y-8">
          <EventForm form={form} />

          {/* Bottom Actions */}
          <div className="flex items-center justify-between mt-6 border-t pt-6">
            <FormField
              control={form.control}
              name="publishImmediately"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Publish immediately
                    </FormLabel>
                    <FormDescription>
                      If checked, the event will be publicly visible immediately.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <Button
              type="submit"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Event"
              )}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
