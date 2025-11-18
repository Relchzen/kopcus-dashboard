"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { PageBuilder } from "@/components/editor/PageBuilder";
import EventForm from "@/components/events/EventForm";
import EventSideSettings from "@/components/events/EventSideSettings";
import { useEvents } from "@/hooks/use-events";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { EventStatus } from "@/lib/api/events";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z.string().optional(),
  shortDesc: z.string().max(500).optional(),
  longDesc: z.string().optional(),
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
  galleryMedia: z.array(z.any()).optional(),
  galleryMediaIds: z.array(z.string()).optional(),
  pageBuilder: z.any().optional(),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  features: z.any().optional(),
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
      longDesc: "",
      status: "DRAFT", // EventStatus
      visibility: "PRIVATE", // Visibility
      startAt: "",
      endAt: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      venue: null, // CreateVenueDto
      venueId: "",
      poster: null,
      banner: null,
      posterId: "",
      bannerId: "",
      organizers: [], // CreateOrganizerDto[]
      organizerIds: [],
      galleryMedia: [],
      galleryMediaIds: [],
      seoTitle: "",
      seoDescription: "",
      pageBuilder: undefined,
      features: undefined,
    },
  });

  const handleSubmit = async (
    data: EventFormValues,
    isDraft: boolean = false
  ) => {
    setIsSubmitting(true);
    try {
      const eventData = {
        title: data.title,
        slug: data.slug || undefined,
        shortDesc: data.shortDesc || undefined,
        longDesc: data.longDesc || undefined,
        status: (isDraft ? "DRAFT" : "PUBLISHED") as EventStatus,
        visibility: data.visibility || "PUBLIC",
        startAt: data.startAt ? new Date(data.startAt) : undefined,
        endAt: data.endAt ? new Date(data.endAt) : undefined,
        timezone:
          data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        venueId: data.venueId || undefined,
        posterId: data.posterId || undefined,
        bannerId: data.bannerId || undefined,
        pageBuilder: data.pageBuilder || undefined,
        seoTitle: data.seoTitle || undefined,
        seoDescription: data.seoDescription || undefined,
        features: data.features || undefined,
        organizers:
          data.organizers?.map((org, index) => ({
            organizerId: org.organizerId,
            role: org.role || "",
            order: org.order ?? index,
          })) || [],
        galleryMediaIds: data.galleryMediaIds || [],
      };

      const newEvent = await create(eventData);
      toast.success(
        isDraft
          ? "Event saved as draft successfully!"
          : "Event published successfully!"
      );

      router.push(`/events`);
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
    handleSubmit(data, false);
  };

  const onSaveDraft = () => {
    const data = form.getValues();
    handleSubmit(data, true);
  };

  return (
    <Form {...form}>
      <div className="container mx-auto py-2">
        <div className="flex items-start gap-6">
          {/* MAIN SECTION */}
          <div className="flex-1 w-4/5">
            <h1 className="text-2xl font-semibold mb-4">Create Event</h1>

            <Tabs defaultValue="information" className="w-full">
              <TabsList className="w-fit mb-4">
                <TabsTrigger value="information">Information</TabsTrigger>
                <TabsTrigger value="page-content">Page Content</TabsTrigger>
              </TabsList>

              {/* --- INFORMATION TAB --- */}
              <TabsContent value="information">
                <EventForm form={form} />
              </TabsContent>

              {/* --- PAGE CONTENT TAB --- */}
              <TabsContent value="page-content">
                <FormField
                  control={form.control}
                  name="pageBuilder"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <PageBuilder
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Start writing your event page content..."
                          minHeight="500px"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="w-1/5 min-w-60 space-y-4 hidden lg:block">
            <div className="flex justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onSaveDraft}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save as Draft"
                )}
              </Button>
              <Button
                type="submit"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  "Publish Event"
                )}
              </Button>
            </div>
            <EventSideSettings form={form} />
          </div>
        </div>
      </div>
    </Form>
  );
}
