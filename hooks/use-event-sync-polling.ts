"use client";

import { useEffect, useState } from "react";

interface EventSummary {
    eventId: string;
    title: string;
    status: string;
    strapiDocumentId: string | null;
    strapiEditUrl: string | null;
    strapiSynced: boolean;
}

export function useEventSyncPolling(eventId: string) {
    const [data, setData] = useState<EventSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        async function fetchData() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL}/events/${eventId}/summary`, {
                    cache: "no-store",
                });
                const json = await res.json();
                if (active) setData(json);

                // Stop polling when synced.
                if (json.strapiSynced === true) {
                    active = false;
                    return;
                }
            } catch (err) {
                console.error("Polling failed", err);
            }
        }

        // initial fetch
        fetchData();


        // poll every 3 seconds
        const interval = setInterval(fetchData, 3000);

        setLoading(false);
        return () => {
            active = false;
            clearInterval(interval);
        };
    }, [eventId]);

    return { data, loading };
}
