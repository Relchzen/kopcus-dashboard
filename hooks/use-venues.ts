// hooks/use-venues.ts
import { useState, useEffect } from "react";
import {
  fetchVenues,
  fetchVenue,
  createVenue,
  updateVenue,
  deleteVenue,
  type Venue,
  type CreateVenueDto,
  type UpdateVenueDto,
  type FilterVenueDto,
} from "@/lib/api/venues";

export function useVenues(filters?: FilterVenueDto) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVenues = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchVenues(filters);
      setVenues(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Error loading venues:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVenues();
  }, [JSON.stringify(filters)]);

  const refresh = () => {
    loadVenues();
  };

  const create = async (data: CreateVenueDto) => {
    const result = await createVenue(data);
    await loadVenues();
    return result;
  };

  const update = async (id: string, data: UpdateVenueDto) => {
    const result = await updateVenue(id, data);
    await loadVenues();
    return result;
  };

  const remove = async (id: string) => {
    await deleteVenue(id);
    setVenues((prev) => prev.filter((v) => v.id !== id));
  };

  return {
    venues,
    isLoading,
    error,
    refresh,
    create,
    update,
    remove,
  };
}

export function useVenue(id: string) {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVenue = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchVenue(id);
        setVenue(data);
      } catch (err: any) {
        setError(err.message);
        console.error(`Error loading venue ${id}:`, err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadVenue();
    }
  }, [id]);

  return { venue, isLoading, error };
}
