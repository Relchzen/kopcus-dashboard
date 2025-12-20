"use client";
import React, { useEffect, useState } from "react";
import { useEvents } from "@/hooks/use-events";
import { useParams } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import * as z from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import EventForm from "@/components/events/EventForm";
import { toast } from "sonner";
import { StrapiEditButton } from "@/components/events/StrapiEditButton";
import { EventSyncStatus } from "@/components/events/EventSyncStatus";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EventStatusManager } from "@/components/events/EventStatusManager";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")
    .optional(),
  shortDesc: z.string().max(500).optional(),
  // Status removed from schema to prevent accidental updates
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
});

type EventFormValues = z.infer<typeof eventFormSchema>;

export default function EditEventPage() {
  const params = useParams();
  const { id } = params;
  const eventId = (Array.isArray(id) ? id[0] : id) as string;
  const { isLoading, error, event, update } = useEvents({
    id: eventId,
    autoFetch: true,
  });
  const [isFormReady, setIsFormReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [strapiSynced, setStrapiSynced] = useState(false);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      shortDesc: "",
      visibility: "PRIVATE",
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
    },
  });

  useEffect(() => {
    if (!event) return;

    const formatDate = (date: string | null | undefined) => {
      if (!date) return "";
      const d = new Date(date);
      return d.toISOString().slice(0, 16);
    };

    const transformedOrganizers =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      event?.organizers?.map((eo: any) => ({
        organizerId: eo.organizerId,
        organizer: eo.organizer,
        role: eo.role || "",
        order: eo.order || 0,
      })) || [];

    const formData = {
      title: event?.title || "",
      slug: event?.slug || "",
      shortDesc: event?.shortDesc || "",
      visibility: event?.visibility || "PUBLIC",
      startAt: formatDate(event?.startAt),
      endAt: formatDate(event?.endAt),
      timezone:
        event?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      venueId: event?.venueId || "",
      venue: event?.venue,
      posterId: event?.posterId || "",
      poster: event?.poster,
      bannerId: event?.bannerId || "",
      banner: event?.banner,
      organizers: transformedOrganizers,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      organizerIds: transformedOrganizers.map((o: any) => o.organizerId),
    };

    // Reset the form with the data
    form.reset(formData, { keepDefaultValues: false });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setStrapiSynced(!(event as any).strapiNeedsSync);

    // Set form as ready after a brief delay to ensure all watchers are updated
    setTimeout(() => setIsFormReady(true), 0);
  }, [event, form]);

  const handleSubmit = async (data: EventFormValues) => {
    if (!eventId) {
      toast.error("Invalid event");
      return;
    }

    setIsSubmitting(true);
    try {
      const eventData = {
        title: data.title,
        slug: data.slug || undefined,
        shortDesc: data.shortDesc || undefined,
        // Status is NOT included here, handled by EventStatusManager
        visibility: data.visibility || "PUBLIC",
        startAt: data.startAt ? new Date(data.startAt).toISOString() : undefined,
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

      console.log("Event Data: ", eventData);

      const updatedEvent = await update(eventId, eventData);
      console.log("Updated Event: ", updatedEvent);
      toast.success("Event updated successfully!");

    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update event. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = (data: EventFormValues) => {
    handleSubmit(data);
  };

  if (isLoading || !isFormReady) {
    return (
      <div className="flex justify-center items-center w-full min-h-full">
        <Loader2 className="animate-spin h-6 w-6 mr-2" /> Loading ...
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>
            {error?.message || "Event not found"}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" asChild>
            <Link href="/events">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Mock Strapi data for now
  const strapiEditUrl =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event as any).strapiEditUrl ||
    `${process.env.NEXT_PUBLIC_STRAPI_ADMIN_URL}/admin/content-manager/collection-types/api::event.event/${
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (event as any).strapiDocumentId || event.id
    }`;

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <PageHeader
        title="Edit Event"
        description="Manage your event details and content."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Events", href: "/events" },
          { label: event?.title || "Event", href: "#" },
          { label: "Edit", href: "#" },
        ]}
        backButton={{ label: "Back to Events", href: "/events" }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          <Form {...form}>
            <div className="space-y-8">
              <EventForm form={form} />

              {/* Bottom Actions */}
              <div className="flex justify-end gap-2 border-t pt-6">
                <Button
                  type="submit"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          </Form>
        </div>

        {/* Right Column: Status & Strapi */}
        <div className="space-y-6">
          <EventStatusManager eventId={eventId} status={event.status} />

          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
              <CardDescription>
                Manage rich content, images, and page layouts in the Content
                Management System.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Sync Status</span>
                  <EventSyncStatus isSynced={strapiSynced} showLabel={false} />
                </div>
                <StrapiEditButton strapiEditUrl={strapiEditUrl} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
