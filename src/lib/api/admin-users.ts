import { apiClient } from "./client";
import type { AccountStatus, Role, User } from "./types";

/**
 * AdminUserViewSet is a plain ModelViewSet with no response overrides, so
 * unlike the rest of the auth API its success payloads are raw DRF (not the
 * {success,message,data} envelope) — every call here passes `unwrap: false`.
 */

export interface AdminUserListParams {
  role?: Role;
  account_status?: AccountStatus;
  email_verified?: boolean;
  search?: string;
  page?: number;
}

export interface AdminUserListResult {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

function buildQuery(params: AdminUserListParams): string {
  const query = new URLSearchParams();
  if (params.role) query.set("role", params.role);
  if (params.account_status) query.set("account_status", params.account_status);
  if (params.email_verified !== undefined)
    query.set("email_verified", String(params.email_verified));
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", String(params.page));
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

/** GET /admin/users/ — normalizes both paginated ({count,results}) and unpaginated (bare array) responses. */
export async function listAdminUsers(
  params: AdminUserListParams = {},
): Promise<AdminUserListResult> {
  const payload = await apiClient.get<AdminUserListResult | User[]>(
    `/admin/users/${buildQuery(params)}`,
    {
      unwrap: false,
    },
  );
  return Array.isArray(payload)
    ? { count: payload.length, next: null, previous: null, results: payload }
    : payload;
}

export function getAdminUser(id: string): Promise<User> {
  return apiClient.get<User>(`/admin/users/${id}/`, { unwrap: false });
}

export interface CreateAdminUserInput {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  role: Role;
  /** Omit to let the backend generate a random password (see note in admin.users.tsx — no invite email is sent yet). */
  password?: string;
}

/** POST /admin/users/ — creating admin/super_admin roles requires the requester to already be a super_admin (enforced server-side). */
export function createAdminUser(input: CreateAdminUserInput): Promise<User> {
  return apiClient.post<User>("/admin/users/", input, { unwrap: false });
}

export interface UpdateAdminUserInput {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  role?: Role;
  account_status?: AccountStatus;
  password?: string;
}

/** PATCH /admin/users/:id/ */
export function updateAdminUser(id: string, input: UpdateAdminUserInput): Promise<User> {
  return apiClient.patch<User>(`/admin/users/${id}/`, input, { unwrap: false });
}

/** DELETE /admin/users/:id/ — super_admin only (enforced server-side). */
export function deleteAdminUser(id: string): Promise<void> {
  return apiClient.delete<void>(`/admin/users/${id}/`, { unwrap: false });
}
