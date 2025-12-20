import { getSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_NEST_API_URL;

export interface Media {
  id: string;
  url: string;
  type: string;
  mime: string | null;
  width: number | null;
  height: number | null;
  altText: string | null;
  createdById: string | null;
  createdAt: string;
}

export interface UploadMediaResponse {
  id: string;
  url: string;
  width?: number;
  height?: number;
}

export interface BulkDeleteResponse {
  message: string;
  deleted: number;
  failed: string[];
}

async function getAuthHeaders() {
  const session = await getSession();
  return {
    Authorization: `Bearer ${session?.accessToken}`,
  };
}

/**
 * Fetch all media
 */
export async function fetchMedias(type?: string): Promise<Media[]> {
  try {
    const headers = await getAuthHeaders();
    const url = type
      ? `${API_URL}/media?type=${encodeURIComponent(type)}`
      : `${API_URL}/media`;

    const res = await fetch(url, {
      headers,
      cache: "no-store", // Always get fresh data
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch medias: ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching medias:", error);
    throw error;
  }
}

/**
 * Fetch single media by ID
 */
export async function fetchMedia(id: string): Promise<Media> {
  try {
    const res = await fetch(`${API_URL}/media/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("Media not found");
      }
      throw new Error(`Failed to fetch media: ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    console.error(`Error fetching media ${id}:`, error);
    throw error;
  }
}

/**
 * Fetch medias by user
 */
export async function fetchMediasByUser(userId: string): Promise<Media[]> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/media/user/${userId}`, {
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch user medias: ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    console.error(`Error fetching medias for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Upload media file
 */
export async function uploadMedia(
  file: File,
  folder?: string
): Promise<UploadMediaResponse> {
  try {
    const headers = await getAuthHeaders();
    const formData = new FormData();
    formData.append("file", file);

    if (folder) {
      formData.append("folder", folder);
    }

    const res = await fetch(`${API_URL}/media/upload`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Upload failed");
    }

    return res.json();
  } catch (error) {
    console.error("Error uploading media:", error);
    throw error;
  }
}

/**
 * Update media alt text
 */
export async function updateMediaAltText(
  id: string,
  altText: string
): Promise<Media> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/media/${id}/alt-text`, {
      method: "PUT",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ altText }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to update alt text");
    }

    return res.json();
  } catch (error) {
    console.error(`Error updating alt text for media ${id}:`, error);
    throw error;
  }
}

/**
 * Update media record
 */
export async function updateMedia(
  id: string,
  data: { altText?: string; width?: number; height?: number }
): Promise<Media> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/media/${id}`, {
      method: "PUT",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to update media");
    }

    return res.json();
  } catch (error) {
    console.error(`Error updating media ${id}:`, error);
    throw error;
  }
}

/**
 * Delete single media
 */
export async function deleteMedia(id: string): Promise<void> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/media/${id}`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to delete media");
    }
  } catch (error) {
    console.error(`Error deleting media ${id}:`, error);
    throw error;
  }
}

/**
 * Bulk delete medias
 */
export async function bulkDeleteMedias(
  ids: string[]
): Promise<BulkDeleteResponse> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/media/bulk-delete`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to delete medias");
    }

    return res.json();
  } catch (error) {
    console.error("Error bulk deleting medias:", error);
    throw error;
  }
}
