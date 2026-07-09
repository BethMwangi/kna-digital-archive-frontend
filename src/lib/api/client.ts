import { API_BASE_URL } from "./config";
import { clearSession, getAccessToken, refreshAccessToken } from "../auth/token-store";
import type { ApiEnvelope, ApiErrorEnvelope } from "./types";

/**
 * Thrown for every non-2xx response, shaped after the SDD §16.19 error
 * envelope produced by core.exceptions.api_exception_handler.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly errors: ApiErrorEnvelope["errors"];

  constructor(status: number, body: ApiErrorEnvelope) {
    super(body.message);
    this.name = "ApiError";
    this.status = status;
    this.code = body.code;
    this.errors = body.errors;
  }

  /**
   * Field-keyed messages for mapping onto a form, e.g. `{ email: "..." }`.
   * DRF's generic non-field errors land under `non_field_errors` — callers
   * that only show a single top-level alert can read that key directly.
   */
  fieldErrors(): Record<string, string> {
    if (Array.isArray(this.errors) || this.errors == null) return {};
    return Object.fromEntries(
      Object.entries(this.errors).map(([field, messages]) => [
        field,
        Array.isArray(messages) ? messages.join(" ") : String(messages),
      ]),
    );
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** AllowAny endpoints (register/login/refresh/forgot/reset/verify) — skip attaching a token and skip the refresh-retry dance. */
  skipAuth?: boolean;
  /**
   * Most endpoints return the {success,message,data} envelope (core.api_response).
   * `/admin/users/**` is a plain DRF ModelViewSet with no override, so its
   * success responses are raw DRF payloads, not the envelope. Set false there.
   */
  unwrap?: boolean;
}

async function parseErrorBody(response: Response): Promise<ApiErrorEnvelope> {
  try {
    return (await response.json()) as ApiErrorEnvelope;
  } catch {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      message: response.statusText || "Something went wrong. Please try again.",
      errors: {},
      timestamp: new Date().toISOString(),
    };
  }
}

async function rawRequest<T>(path: string, options: RequestOptions): Promise<T> {
  const { body, skipAuth, unwrap = true, headers, ...rest } = options;
  const accessToken = skipAuth ? null : getAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) return undefined as T;

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorBody(response));
  }

  const payload = await response.json();
  return (unwrap ? (payload as ApiEnvelope<T>).data : payload) as T;
}

/** Authenticated request with a single silent-refresh-and-retry on 401. */
async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  try {
    return await rawRequest<T>(path, options);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401 && !options.skipAuth) {
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        return rawRequest<T>(path, options);
      }
      clearSession();
    }
    throw error;
  }
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
