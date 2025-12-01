// hooks/use-events.ts
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  eventsApi,
  type Event,
  type CreateEventDto,
  type UpdateEventDto,
  type GetEventsParams,
} from "@/lib/api/events";
import { ApiResponse } from "@/lib/api/client";

interface UseEventsOptions {
  autoFetch?: boolean;
  params?: GetEventsParams;
  id?: string;
  slug?: string;
}

export function useEvents(options: UseEventsOptions = {}) {
  const { autoFetch = true, params, id, slug } = options;
  const { data: session } = useSession();
  const [event, setEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  const isSingleMode = !!(id || slug);

  const fetchEvents = useCallback(
    async (fetchParams?: GetEventsParams) => {
      setIsLoading(true);
      setError(null);

      try {
        console.log("running fetchEvents");
        const res = await eventsApi.getAll({ ...params, ...fetchParams });
        setEvents(res.data);
        setMeta(res.meta);
      } catch (err) {
        setError(err as Error);
        console.error("Failed to fetch events: ", err);
      } finally {
        setIsLoading(false);
      }
    },
    [params]
  );

  const fetchEvent = useCallback(async () => {
    if (!id && !slug) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = id
        ? await eventsApi.getById(id)
        : await eventsApi.getBySlug(slug!);
      setEvent(data);
    } catch (err) {
      setError(err as Error);
      console.error("Failed to fetch event: ", err);
    } finally {
      setIsLoading(false);
    }
  }, [id, slug]);

  // const loadEvents = async () => {
  //   try {
  //     setIsLoading(true);
  //     setError(null);
  //     const response = await fetchEvents(filters);
  //     setEvents(response.data);
  //     setMeta(response.meta);
  //   } catch (err: any) {
  //     setError(err.message);
  //     console.error("Error loading events:", err);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   loadEvents();
  // }, [JSON.stringify(filters)]);

  // const refresh = () => {
  //   loadEvents();
  // };

  const create = useCallback(
    async (data: CreateEventDto): Promise<Event> => {
      console.log("create useEvent hook called");
      console.log("Sending Event Data to be created: ", data);
      const newEvent = await eventsApi.create(data);

      if (!isSingleMode) {
        setEvents((prev) => [newEvent, ...(prev || [])]);
        setMeta((prev) => ({ ...prev, total: (prev?.total || 0) + 1 }));
      }

      console.log("@use-event returning: ", newEvent);
      return newEvent;
    },
    [isSingleMode]
  );

  const update = useCallback(
    async (updateId: string, data: UpdateEventDto): Promise<Event> => {
      const updatedEvent = await eventsApi.update(updateId, data);
      if (!isSingleMode) {
        setEvents((prev) =>
          (prev || []).map((evt) => (evt.id === updateId ? updatedEvent : evt))
        );
      }

      if (isSingleMode && event?.id === updateId) {
        setEvent(updatedEvent);
      }

      console.log("Updated Event: ", updatedEvent);

      return updatedEvent;
    },
    [isSingleMode, event?.id]
  );

  const remove = useCallback(
    async (deleteId: string): Promise<void> => {
      await eventsApi.delete(deleteId);

      if (!isSingleMode) {
        setEvents((prev) => (prev || []).filter((evt) => evt.id !== deleteId));
        setMeta((prev) => ({ ...prev, total: (prev?.total || 0) - 1 }));
      }
    },
    [isSingleMode]
  );

  const publish = useCallback(
    async (publishId: string): Promise<Event> => {
      const publishedEvent = await eventsApi.publish(publishId);

      if (!isSingleMode) {
        setEvents((prev) =>
          (prev || []).map((evt) =>
            evt.id === publishId ? publishedEvent : evt
          )
        );
      }

      if (isSingleMode && event?.id === publishId) {
        setEvent(publishedEvent);
      }

      return publishedEvent;
    },
    [isSingleMode, event?.id]
  );

  const unpublish = useCallback(
    async (unpublishId: string): Promise<Event> => {
      const unpublishedEvent = await eventsApi.unpublish(unpublishId);

      if (!isSingleMode) {
        setEvents((prev) =>
          (prev || []).map((evt) =>
            evt.id === unpublishId ? unpublishedEvent : evt
          )
        );
      }

      if (isSingleMode && event?.id === unpublishId) {
        setEvent(unpublishedEvent);
      }

      return unpublishedEvent;
    },
    [isSingleMode, event?.id]
  );



  useEffect(() => {
    if (autoFetch) {
      if (isSingleMode) {
        fetchEvent();
      } else {
        fetchEvents();
      }
    }
  }, [autoFetch, isSingleMode, fetchEvent, fetchEvents]);

  return {
    events,
    event,
    setEvent,
    meta,
    isLoading,
    error,
    fetchEvent,
    fetchEvents,
    create,
    update,
    remove,
    publish,
    unpublish,
    refetch: isSingleMode ? fetchEvent : fetchEvents,
  };
}
