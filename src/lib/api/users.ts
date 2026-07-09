import { apiClient } from "./client";
import type { User } from "./types";

/** GET /users/me */
export function getMe(): Promise<User> {
  return apiClient.get<User>("/users/me");
}

export interface UpdateProfileInput {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}

/** PUT /users/me — email/role/account_status/email_verified are server-controlled and read-only. */
export function updateMe(input: UpdateProfileInput): Promise<User> {
  return apiClient.put<User>("/users/me", input);
}

export interface ChangePasswordInput {
  current_password: string;
  new_password: string;
  new_password_confirm: string;
}

/** PUT /users/password */
export function changePassword(input: ChangePasswordInput): Promise<void> {
  return apiClient.put<void>("/users/password", input);
}
