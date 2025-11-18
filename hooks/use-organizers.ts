import { useState, useEffect, useCallback } from "react";
import {
  organizersApi,
  type Organizer,
  type CreateOrganizerDto,
  type UpdateOrganizerDto,
  type GetOrganizersParams,
} from "@/lib/api/organizers";

interface UseOrganizersOptions {
  autoFetch?: boolean;
  params?: GetOrganizersParams;
  id?: string;
  slug?: string;
}

export function useOrganizers(options: UseOrganizersOptions = {}) {
  const { autoFetch = true, params, id, slug } = options;

  // For list of organizers
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  });

  // For single organizer
  const [organizer, setOrganizer] = useState<Organizer | null>(null);

  // Shared state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Determine if we're fetching single or multiple
  const isSingleMode = !!(id || slug);

  // Fetch multiple organizers
  const fetchOrganizers = useCallback(
    async (fetchParams?: GetOrganizersParams) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await organizersApi.getAll({
          ...params,
          ...fetchParams,
        });
        setOrganizers(response.data);
        setMeta(response.meta);
      } catch (err) {
        setError(err as Error);
        console.error("Failed to fetch organizers:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [params]
  );

  // Fetch single organizer
  const fetchOrganizer = useCallback(async () => {
    if (!id && !slug) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = id
        ? await organizersApi.getById(id)
        : await organizersApi.getBySlug(slug!);
      setOrganizer(data);
    } catch (err) {
      setError(err as Error);
      console.error("Failed to fetch organizer:", err);
    } finally {
      setIsLoading(false);
    }
  }, [id, slug]);

  const create = useCallback(
    async (data: CreateOrganizerDto): Promise<Organizer> => {
      const newOrganizer = await organizersApi.create(data);

      // Update list if in list mode
      if (!isSingleMode) {
        setOrganizers((prev) => [newOrganizer, ...(prev || [])]);
        setMeta((prev) => ({ ...prev, total: (prev?.total || 0) + 1 }));
      }

      return newOrganizer;
    },
    [isSingleMode]
  );

  const update = useCallback(
    async (updateId: string, data: UpdateOrganizerDto): Promise<Organizer> => {
      const updatedOrganizer = await organizersApi.update(updateId, data);

      // Update in list mode
      if (!isSingleMode) {
        setOrganizers((prev) =>
          (prev || []).map((org) =>
            org.id === updateId ? updatedOrganizer : org
          )
        );
      }

      // Update in single mode
      if (isSingleMode && organizer?.id === updateId) {
        setOrganizer(updatedOrganizer);
      }

      return updatedOrganizer;
    },
    [isSingleMode, organizer?.id]
  );

  const remove = useCallback(
    async (deleteId: string): Promise<void> => {
      await organizersApi.delete(deleteId);

      // Update list if in list mode
      if (!isSingleMode) {
        setOrganizers((prev) =>
          (prev || []).filter((org) => org.id !== deleteId)
        );
        setMeta((prev) => ({ ...prev, total: (prev?.total || 0) - 1 }));
      }
    },
    [isSingleMode]
  );

  const uploadLogo = useCallback(
    async (uploadId: string, file: File): Promise<Organizer> => {
      const updatedOrganizer = await organizersApi.uploadLogo(uploadId, file);

      // Update in list mode
      if (!isSingleMode) {
        setOrganizers((prev) =>
          (prev || []).map((org) =>
            org.id === uploadId ? updatedOrganizer : org
          )
        );
      }

      // Update in single mode
      if (isSingleMode && organizer?.id === uploadId) {
        setOrganizer(updatedOrganizer);
      }

      return updatedOrganizer;
    },
    [isSingleMode, organizer?.id]
  );

  const deleteLogo = useCallback(
    async (deleteLogoId: string): Promise<Organizer> => {
      const updatedOrganizer = await organizersApi.deleteLogo(deleteLogoId);

      // Update in list mode
      if (!isSingleMode) {
        setOrganizers((prev) =>
          (prev || []).map((org) =>
            org.id === deleteLogoId ? updatedOrganizer : org
          )
        );
      }

      // Update in single mode
      if (isSingleMode && organizer?.id === deleteLogoId) {
        setOrganizer(updatedOrganizer);
      }

      return updatedOrganizer;
    },
    [isSingleMode, organizer?.id]
  );

  useEffect(() => {
    if (autoFetch) {
      if (isSingleMode) {
        fetchOrganizer();
      } else {
        fetchOrganizers();
      }
    }
  }, [autoFetch, isSingleMode, fetchOrganizer, fetchOrganizers]);

  return {
    // List data
    organizers,
    meta,

    // Single organizer data
    organizer,

    // Shared
    isLoading,
    error,

    // Methods
    fetchOrganizers,
    fetchOrganizer,
    create,
    update,
    remove,
    uploadLogo,
    deleteLogo,
    refetch: isSingleMode ? fetchOrganizer : fetchOrganizers,
  };
}
