// lib/api/events.ts
import { apiClient } from "./client";

/* ------------------------------------------
 * Types & Interfaces
 * ------------------------------------------ */

export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
export type Visibility = "PUBLIC" | "PRIVATE" | "UNLISTED";

export interface Event {
  id: string;
  title: string;
  slug: string;
  shortDesc: string | null;
  longDesc: string | null;
  status: EventStatus;
  visibility: Visibility;
  startAt: string;
  endAt: string | null;
  timezone: string;
  venueId: string | null;
  posterId: string | null;
  bannerId: string | null;
  pageBuilder: any | null;
  seoTitle: string | null;
  seoDescription: string | null;
  meta: any | null;
  features: any | null;
  createdAt: string;
  updatedAt: string;

  // Relations
  venue?: any;
  poster?: any;
  banner?: any;
  organizers?: any[];
  galleryMedia?: any[];
}

export interface CreateEventDto {
  title: string;
  slug?: string;
  shortDesc?: string;
  longDesc?: string;
  status?: EventStatus;
  visibility?: Visibility;
  startAt: Date | undefined;
  endAt?: Date | undefined;
  timezone?: string;
  venueId?: string;
  posterId?: string;
  bannerId?: string;
  pageBuilder?: any;
  seoTitle?: string;
  seoDescription?: string;
  meta?: any;
  features?: any;

  // Relations
  organizerIds?: string[];
  organizers?: Array<{
    organizerId: string;
    role: string;
    order: number;
  }>;

  galleryMediaIds?: string[];
}

export interface UpdateEventDto extends Partial<CreateEventDto> {}

export interface GetEventsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: EventStatus;
  visibility?: Visibility;
  sortBy?: "title" | "startAt" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface EventsResponse {
  data: Event[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/* ------------------------------------------
 * Events API Class
 * ------------------------------------------ */

class EventsApi {
  private baseUrl = "/events";

  /* ---------------------- List & Retrieve ---------------------- */
  async getAll(params?: GetEventsParams): Promise<EventsResponse> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.search) searchParams.append("search", params.search);
    if (params?.status) searchParams.append("status", params.status);
    if (params?.visibility)
      searchParams.append("visibility", params.visibility);
    if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder);

    const qs = searchParams.toString();
    const url = qs ? `${this.baseUrl}?${qs}` : this.baseUrl;

    return apiClient.get<EventsResponse>(url);
  }

  async getById(id: string): Promise<Event> {
    return apiClient.get<Event>(`${this.baseUrl}/${id}`);
  }

  async getBySlug(slug: string): Promise<Event> {
    return apiClient.get<Event>(`${this.baseUrl}/slug/${slug}`);
  }

  /* ---------------------- Create / Update ---------------------- */
  async create(data: CreateEventDto): Promise<Event> {
    console.log("running create event API");
    return apiClient.post<Event>(this.baseUrl, data);
  }

  async update(id: string, data: UpdateEventDto): Promise<Event> {
    return apiClient.put<Event>(`${this.baseUrl}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }

  /* ---------------------- Publish / Unpublish ---------------------- */
  async publish(id: string): Promise<Event> {
    return apiClient.post<Event>(`${this.baseUrl}/${id}/publish`);
  }

  async unpublish(id: string): Promise<Event> {
    return apiClient.post<Event>(`${this.baseUrl}/${id}/unpublish`);
  }

  /* ---------------------- Organizer Management ---------------------- */
  async addOrganizer(
    eventId: string,
    payload: {
      organizerId: string;
      role?: string;
      order?: number;
    }
  ): Promise<any> {
    return apiClient.post(`${this.baseUrl}/${eventId}/organizers`, payload);
  }

  async updateOrganizer(
    eventId: string,
    organizerId: string,
    payload: { role?: string; order?: number }
  ): Promise<any> {
    return apiClient.put(
      `${this.baseUrl}/${eventId}/organizers/${organizerId}`,
      payload
    );
  }

  async removeOrganizer(eventId: string, organizerId: string): Promise<void> {
    return apiClient.delete(
      `${this.baseUrl}/${eventId}/organizers/${organizerId}`
    );
  }

  /* ---------------------- Gallery Management ---------------------- */
  async addGalleryMedia(eventId: string, mediaIds: string[]): Promise<any> {
    return apiClient.post(`${this.baseUrl}/${eventId}/gallery`, {
      mediaIds,
    });
  }

  async removeGalleryMedia(eventId: string, mediaId: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${eventId}/gallery/${mediaId}`);
  }
}

export const eventsApi = new EventsApi();
