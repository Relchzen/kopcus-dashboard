import { getSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_NEST_API_URL;

export interface Venue {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  mapUrl: string | null;
  capacity: number | null;
  createdAt: string;
  _count?: {
    events: number;
    schedules: number;
  };
}

export interface CreateVenueDto {
  name: string;
  address?: string;
  city?: string;
  country?: string;
  lat?: number;
  lng?: number;
  mapUrl?: string;
  capacity?: number;
}

export type UpdateVenueDto = Partial<CreateVenueDto>;

export interface FilterVenueDto {
  city?: string;
  country?: string;
  search?: string;
}

/**
 * Get authorization headers
 */
async function getAuthHeaders() {
  const session = await getSession();
  return {
    Authorization: `Bearer ${session?.accessToken}`,
    "Content-Type": "application/json",
  };
}

/**
 * Fetch all venues
 */
export async function fetchVenues(filters?: FilterVenueDto): Promise<Venue[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.city) params.append("city", filters.city);
    if (filters?.country) params.append("country", filters.country);
    if (filters?.search) params.append("search", filters.search);

    const url = params.toString()
      ? `${API_URL}/venues?${params.toString()}`
      : `${API_URL}/venues`;

    const res = await fetch(url, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch venues: ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching venues:", error);
    throw error;
  }
}

/**
 * Fetch single venue by ID
 */
export async function fetchVenue(id: string): Promise<Venue> {
  try {
    const res = await fetch(`${API_URL}/venues/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("Venue not found");
      }
      throw new Error(`Failed to fetch venue: ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    console.error(`Error fetching venue ${id}:`, error);
    throw error;
  }
}

/**
 * Fetch venues by city
 */
export async function fetchVenuesByCity(city: string): Promise<Venue[]> {
  try {
    const res = await fetch(
      `${API_URL}/venues/city/${encodeURIComponent(city)}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch venues by city: ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    console.error(`Error fetching venues for city ${city}:`, error);
    throw error;
  }
}

/**
 * Fetch venues by country
 */
export async function fetchVenuesByCountry(country: string): Promise<Venue[]> {
  try {
    const res = await fetch(
      `${API_URL}/venues/country/${encodeURIComponent(country)}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch venues by country: ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    console.error(`Error fetching venues for country ${country}:`, error);
    throw error;
  }
}

/**
 * Create new venue
 */
export async function createVenue(data: CreateVenueDto): Promise<Venue> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/venues`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to create venue");
    }

    return res.json();
  } catch (error) {
    console.error("Error creating venue:", error);
    throw error;
  }
}

/**
 * Update venue
 */
export async function updateVenue(
  id: string,
  data: UpdateVenueDto
): Promise<Venue> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/venues/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to update venue");
    }

    return res.json();
  } catch (error) {
    console.error(`Error updating venue ${id}:`, error);
    throw error;
  }
}

/**
 * Delete venue
 */
export async function deleteVenue(id: string): Promise<void> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/venues/${id}`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to delete venue");
    }
  } catch (error) {
    console.error(`Error deleting venue ${id}:`, error);
    throw error;
  }
}
