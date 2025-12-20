export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

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

  private buildHeaders(
    existing: HeadersInit | undefined,
    body: unknown
  ): Headers {
    const headers = new Headers(existing);

    // Only set Content-Type when the request has a JSON body
    // We assume string body is JSON because post/put/patch stringify data
    const isJsonBody =
      body &&
      (typeof body === "object" || typeof body === "string") &&
      !(body instanceof FormData);

    if (isJsonBody && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    return headers;
  }

  private async safeParseJson(response: Response) {
    const contentType = response.headers.get("Content-Type") || "";

    if (!contentType.includes("application/json")) {
      return null;
    }

    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  private async handleUnauthorized(response: Response) {
    if (response.status !== 401) return;

    if (typeof window !== "undefined") {
      try {
        const { signOut } = await import("next-auth/react");
        signOut({ callbackUrl: "/login" });
      } catch {
        // fail silently; do not block request flow
      }
    }
  }

  private buildDetailedError(
    message: string,
    url: string,
    response: Response,
    body: unknown
  ) {
    const error = new Error(message) as Error & {
      status?: number;
      url?: string;
      body?: unknown;
    };
    error.status = response.status;
    error.url = url;
    error.body = body;
    return error;
  }



  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log("running request ", url);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      const headers = this.buildHeaders(options.headers, options.body);

      const token = await this.getToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      const config: RequestInit = {
        ...options,
        headers,
        credentials: "include",
        signal: controller.signal,
      };

      const response = await fetch(url, config);

      // Handle error before parsing
      if (!response.ok) {
        await this.handleUnauthorized(response);

        const errorBody = await this.safeParseJson(response);
        const message =
          errorBody?.message ||
          response.statusText ||
          "An error occurred";

        throw this.buildDetailedError(message, url, response, errorBody);
      }

      // No content
      if (response.status === 204) {
        return { success: true, data: undefined as unknown as T };
      }

      // Parse JSON or fall back to text ( safer )
      const data = await this.safeParseJson(response);
      return { success: true, data: data as T };

    } finally {
      clearTimeout(timeout);
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    console.log("Running get method API Client");
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    console.log("POST data: ", data);
    const response = await this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
    console.log("Returning from post method API Client ", response);
    return response;
  }

  async patch<T>(endpoint: string, data: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
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
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // HTTP DELETE - for removing resources
  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
