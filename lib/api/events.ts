// lib/api/events.ts
import { apiClient, ApiResponse } from "./client";

/* ------------------------------------------
 * Types & Interfaces
 * ------------------------------------------ */

export type EventStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
export type Visibility = "PUBLIC" | "PRIVATE" | "UNLISTED";
export type ContentStatus = "INCOMPLETE" | "COMPLETE" | "OUTDATED";

export interface Event {
  id: string;
  slug: string;
  title: string;
  shortDesc: string | null;

  status: EventStatus;
  visibility: Visibility;

  startAt: string;
  endAt: string | null;
  timezone: string | null;

  // Strapi sync fields
  strapiDocumentId: string | null;
  strapiSyncedAt: string | null;
  strapiNeedsSync: boolean;
  contentStatus: ContentStatus;

  venueId: string | null;
  posterId: string | null;
  bannerId: string | null;

  features: any | null;

  createdById: string | null;
  updatedById: string | null;
  publishedById: string | null;
  publishedAt: string | null;

  createdAt: string;
  updatedAt: string;

  // Optional relations returned by backend
  poster?: any;
  banner?: any;
  venue?: any;
  organizers?: Array<{
    organizerId: string;
    role: string;
    order: number;
    organizer?: any;
  }>;
  gallery?: any[];
  schedules?: any[];
  tickets?: any[];
}

export interface CreateEventDto {
  title: string;
  slug: string;
  shortDesc?: string;

  status?: EventStatus;
  visibility?: Visibility;

  startAt: string;
  endAt?: string | null;

  timezone?: string;

  venueId?: string;
  posterId?: string;
  bannerId?: string;

  organizerIds?: string[];

  organizers?: Array<{
    organizerId: string;
    role: string;
    order: number;
  }>;

  galleryMediaIds?: string[];

  features?: any;
}


export interface UpdateEventDto extends Partial<CreateEventDto> {
  title: string; // required
}

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
    console.log(url);
    return (await apiClient.get<EventsResponse>(url)).data;
  }

  async getById(id: string): Promise<Event> {
    return (await apiClient.get<Event>(`${this.baseUrl}/${id}`)).data;
  }

  async getBySlug(slug: string): Promise<Event> {
    return (await apiClient.get<Event>(`${this.baseUrl}/slug/${slug}`)).data;
  }

  /* ---------------------- Create / Update ---------------------- */
  async create(data: CreateEventDto): Promise<Event> {
    console.log("POST data:", data);

    const response = await apiClient.post<Event>(this.baseUrl, data)
    console.log("Received Create Event Response @api/events.ts:", response);
    console.log("@/lib/api/events.ts create returning: ", response)
    return response;
  }

  async update(id: string, data: UpdateEventDto): Promise<Event> {
    console.log("UpdateEventDTO @api/events.ts update: ", data)
    return (await apiClient.put<Event>(`${this.baseUrl}/${id}`, data)).data;
  }

  async delete(id: string): Promise<void> {
    return (await apiClient.delete<void>(`${this.baseUrl}/${id}`)).data;
  }

  async updateStatus(id: string, status: EventStatus): Promise<Event> {
    return (await apiClient.patch<Event>(`${this.baseUrl}/${id}/status`, { status })).data;
  }

  /* ---------------------- Publish / Unpublish ---------------------- */
  async publish(id: string): Promise<Event> {
    return (await apiClient.post<Event>(`${this.baseUrl}/${id}/publish`));
  }

  async unpublish(id: string): Promise<Event> {
    return (await apiClient.post<Event>(`${this.baseUrl}/${id}/unpublish`));
  }



  /* ---------------------- Organizer Management ---------------------- */
  // async addOrganizer(
  //   eventId: string,
  //   payload: {
  //     organizerId: string;
  //     role?: string;
  //     order?: number;
  //   }
  // ): Promise<any> {
  //   return (await apiClient.post(`${this.baseUrl}/${eventId}/organizers`, payload)).data;
  // }

  // async updateOrganizer(
  //   eventId: string,
  //   organizerId: string,
  //   payload: { role?: string; order?: number }
  // ): Promise<any> {
  //   return (await apiClient.put(
  //     `${this.baseUrl}/${eventId}/organizers/${organizerId}`,
  //     payload
  //   )).data;
  // }

  // async removeOrganizer(eventId: string, organizerId: string): Promise<void> {
  //   return (await apiClient.delete<void>(
  //     `${this.baseUrl}/${eventId}/organizers/${organizerId}`
  //   )).data;
  // }

  /* ---------------------- Gallery Management ---------------------- */
  // async addGalleryMedia(eventId: string, mediaIds: string[]): Promise<any> {
  //   return (await apiClient.post(`${this.baseUrl}/${eventId}/gallery`, {
  //     mediaIds,
  //   })).data;
  // }

  // async removeGalleryMedia(eventId: string, mediaId: string): Promise<void> {
  //   return (await apiClient.delete<void>(`${this.baseUrl}/${eventId}/gallery/${mediaId}`)).data;
  // }
}

export const eventsApi = new EventsApi();
