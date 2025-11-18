import { signOut } from "next-auth/react";

class ApiClient {
  private baseUrl: string;
  private getTokenFn: (() => Promise<string | null>) | null = null;
  private isInitialized: boolean = false;
  constructor(
    baseUrl: string = process.env.NEXT_PUBLIC_NEST_API_URL || "/api"
  ) {
    this.baseUrl = baseUrl;
    this.initializeAuth();
  }

  private async initializeAuth() {
    if (typeof window === "undefined" || this.isInitialized) {
      return;
    }

    try {
      const { getSession } = await import("next-auth/react");

      this.getTokenFn = async () => {
        const session = await getSession();
        return session?.accessToken ?? null;
      };

      this.isInitialized = true;
    } catch (error) {
      console.warn(
        "NextAuth not available, API requests will be made without authentication:",
        error
      );
    }
  }

  setTokenGetter(fn: () => Promise<string | null>) {
    this.getTokenFn = fn;
    this.isInitialized = true;
  }

  private async getToken(): Promise<string | null> {
    if (!this.getTokenFn) return null;

    try {
      return await this.getTokenFn();
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Build a Headers instance so we can safely mutate it
    const headers = new Headers(options.headers);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const token = await this.getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: "include",
    };

    console.log("url:", url);
    console.log("config:", config);
    const response = await fetch(url, config);

    if (!response.ok) {
      // Handle 401 Unauthorized - session might be expired
      if (response.status === 401) {
        // Optionally redirect to login or trigger session refresh
        if (typeof window !== "undefined") {
          import("next-auth/react").then(({ signOut }) => {
            signOut({ callbackUrl: "/login" });
          });
        }
      }

      const error = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw new Error(error.message || "An error occurred");
    }

    if (response.status === 204) {
      return undefined as T;
    }

    console.log("returned data: ", response);
    return response.json();
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<T> {
    console.log("POST data: ", data);
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: unknown, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async put<T>(
    endpoint: string,
    data: unknown,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // HTTP DELETE - for removing resources
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
