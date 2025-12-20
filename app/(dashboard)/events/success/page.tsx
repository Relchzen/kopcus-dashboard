"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useEventSyncPolling } from "@/hooks/use-event-sync-polling";
import { EventCreateSuccess } from "@/components/events/EventCreateSuccess";

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");

  // Call hook unconditionally (React rules)
  const { data, loading } = useEventSyncPolling(eventId || "");

  if (!eventId) return <div>Invalid request</div>;
  if (loading || !data) return <div>Loading...</div>;

  return (
    <EventCreateSuccess
      eventId={data.eventId}
      eventTitle={data.title}
      strapiEditUrl={data.strapiEditUrl}
      strapiSynced={data.strapiSynced}
      status={data.status}
    />
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessPageContent />
    </Suspense>
  );
}
