// EventCreateSuccess.tsx
"use client";

import React, { useEffect } from "react";
import { CheckCircle, ArrowRight, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StrapiEditButton } from "./StrapiEditButton";
import { EventSyncStatus } from "./EventSyncStatus";
import Link from "next/link";

interface EventCreateSuccessProps {
  eventId: string;
  eventTitle: string;
  strapiEditUrl?: string | null;
  strapiSynced: boolean;
  status?: string;
}

export const EventCreateSuccess = ({
  eventId,
  eventTitle,
  strapiEditUrl,
  strapiSynced,
  status = "DRAFT",
}: EventCreateSuccessProps) => {

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 30; // ~60 seconds

    const poll = async () => {
      try {
        attempts++;
        const res = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL}/events/${eventId}/summary`);
        const data = await res.json();

        if (!data) return;

        if (data.strapiDocumentId && !data.strapiNeedsSync) {
          return; // stop polling
        }

        if (attempts >= maxAttempts) {
          console.warn("Sync timed out");
          return;
        }

        setTimeout(poll, 2000);
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    poll();
  }, [eventId]);

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-2">
          {status === "PUBLISHED"
            ? "Event Published Successfully!"
            : "Draft Created Successfully!"}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {status === "PUBLISHED"
            ? `Your event "${eventTitle}" is live. You can enhance it further in Strapi.`
            : `Your event draft "${eventTitle}" is ready. Add rich content in Strapi before publishing.`}
        </p>
      </div>

      <Card className="mb-8 border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-900/10">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">
            Next Steps: Add Rich Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-blue-800 dark:text-blue-200">
            Enhance your event with detailed descriptions, images, speaker bios,
            schedules, and custom sections in our Content Management System.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center pt-2">
            <StrapiEditButton
              strapiEditUrl={strapiEditUrl}
              size="lg"
              className="w-full sm:w-auto"
            />

            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Sync Status:</span>
              <EventSyncStatus isSynced={strapiSynced} showLabel />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4">
        <Link href="/events">
          <Button variant="outline">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            View All Events
          </Button>
        </Link>
        <Link href={`/events/${eventId}/edit`}>
          <Button variant="ghost">
            View Event Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
