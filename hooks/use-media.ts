// hooks/use-media.ts
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  fetchMedias,
  fetchMedia,
  uploadMedia,
  updateMediaAltText,
  deleteMedia,
  bulkDeleteMedias,
  type Media,
} from "@/lib/api/media";

export function useMedias(type?: string) {
  const { data: session } = useSession();
  const [medias, setMedias] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMedias = async () => {
    if (!session?.accessToken) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchMedias(type);
      setMedias(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Error loading medias:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMedias();
  }, [session, type]);

  const refresh = () => {
    loadMedias();
  };

  const upload = async (file: File, folder?: string) => {
    const result = await uploadMedia(file, folder);
    await loadMedias(); // Refresh list
    return result;
  };

  const updateAltText = async (id: string, altText: string) => {
    const result = await updateMediaAltText(id, altText);
    await loadMedias(); // Refresh list
    return result;
  };

  const remove = async (id: string) => {
    await deleteMedia(id);
    setMedias((prev) => prev.filter((m) => m.id !== id));
  };

  const bulkRemove = async (ids: string[]) => {
    const result = await bulkDeleteMedias(ids);
    await loadMedias(); // Refresh list
    return result;
  };

  return {
    medias,
    isLoading,
    error,
    refresh,
    upload,
    updateAltText,
    remove,
    bulkRemove,
  };
}
