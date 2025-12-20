import { apiClient } from "./client";

export type OrganizerType = "ARTIST" | "COMPANY" | "INDIVIDUAL" | "SPONSOR";

export interface Organizer {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoMediaId: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  type: OrganizerType;
  socialLinks: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
  logoMedia?: {
    id: string;
    url: string;
  } | null;
}

export interface CreateOrganizerDto {
  name: string;
  type: OrganizerType;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  logoMediaId?: string;
  socialLinks?: Record<string, string>;
}

export interface UpdateOrganizerDto {
  name?: string;
  type?: OrganizerType;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  logoMediaId?: string;
  socialLinks?: Record<string, string>;
}

export interface GetOrganizersParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: OrganizerType;
  sortBy?: "name" | "createdAt" | "type";
  sortOrder?: "asc" | "desc";
}

export interface OrganizersResponse {
  data: Organizer[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class OrganizersApi {
  private baseUrl = "/organizers";

  async getAll(params?: GetOrganizersParams): Promise<OrganizersResponse> {
    console.log("running OrganizersApi getAll");
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.search) searchParams.append("search", params.search);
    if (params?.type) searchParams.append("type", params.type);
    if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder);

    const queryString = searchParams.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    console.log("get URL: ", url);

    const organizers = (await apiClient.get<OrganizersResponse>(url)).data;
    console.log("getAll organizers: ", organizers);
    return organizers;
  }

  async getById(id: string): Promise<Organizer> {
    return (await apiClient.get<Organizer>(`${this.baseUrl}/${id}`)).data;
  }

  async getBySlug(slug: string): Promise<Organizer> {
    return (await apiClient.get<Organizer>(`${this.baseUrl}/slug/${slug}`)).data;
  }

  async create(data: CreateOrganizerDto): Promise<Organizer> {
    return (await apiClient.post<Organizer>(this.baseUrl, data)).data;
  }

  async update(id: string, data: UpdateOrganizerDto): Promise<Organizer> {
    return (await apiClient.patch<Organizer>(`${this.baseUrl}/${id}`, data)).data;
  }

  async delete(id: string): Promise<void> {
    return (await apiClient.delete<void>(`${this.baseUrl}/${id}`)).data;
  }

  async uploadLogo(id: string, file: File): Promise<Organizer> {
    const formData = new FormData();
    formData.append("logo", file);

    return (await apiClient.post<Organizer>(`${this.baseUrl}/${id}/logo`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })).data;
  }

  async deleteLogo(id: string): Promise<Organizer> {
    return (await apiClient.delete<Organizer>(`${this.baseUrl}/${id}/logo`)).data;
  }
}

export const organizersApi = new OrganizersApi();
