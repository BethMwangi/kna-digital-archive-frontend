/** Mirrors accounts/models.py Role.choices. */
export type Role = "customer" | "content_editor" | "admin" | "super_admin";

/** Mirrors accounts/models.py AccountStatus.choices. */
export type AccountStatus = "active" | "suspended";

/** Mirrors accounts/serializers.py UserSerializer. */
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: Role;
  account_status: AccountStatus;
  email_verified: boolean;
  last_login: string | null;
  created_at: string;
}

/** SDD §16.2 success envelope, returned by core.api_response. */
export interface ApiEnvelope<T> {
  success: true;
  message: string;
  data: T;
}

/**
 * SDD §16.19 error envelope, returned by core.exceptions.api_exception_handler.
 * `errors` is the raw DRF error detail: `{}` when the exception carried a
 * single top-level `detail` string (auth failures, permission errors, not
 * found, throttling), otherwise a field-keyed map of message arrays
 * (serializer validation errors) — occasionally a plain string array for
 * non-field errors.
 */
export interface ApiErrorEnvelope {
  success: false;
  code: string;
  message: string;
  errors: Record<string, string[]> | string[] | Record<string, never>;
  timestamp: string;
}

export interface LoginResult {
  access: string;
  refresh: string;
  user: User;
}

export interface RefreshResult {
  access: string;
  refresh: string;
}
