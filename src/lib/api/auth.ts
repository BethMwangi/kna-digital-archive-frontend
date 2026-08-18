import { apiClient } from "./client";
import * as tokenStore from "../auth/token-store";
import type { LoginResult, User } from "./types";

export interface RegisterInput {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  password_confirm: string;
}

/** POST /auth/register — always creates a customer; no tokens are returned. */
export function register(input: RegisterInput): Promise<User> {
  return apiClient.post<User>("/auth/register", input, { skipAuth: true });
}

export interface LoginInput {
  email: string;
  password: string;
}

/** POST /auth/login — persists the session as a side effect and returns the profile. */
export async function login(input: LoginInput): Promise<User> {
  const result = await apiClient.post<LoginResult>("/auth/login", input, { skipAuth: true });
  tokenStore.setSession({ access: result.access, refresh: result.refresh }, result.user);
  return result.user;
}

/** POST /auth/logout — blacklists the given refresh token. Requires auth. */
export function logout(refresh: string): Promise<void> {
  return apiClient.post<void>("/auth/logout", { refresh });
}

export interface ForgotPasswordInput {
  email: string;
}

/**
 * POST /auth/forgot-password — issues a 6-digit code and dispatches it by
 * email and, if a phone number is on file, SMS too (same code either way).
 * Always responds the same way, whether or not the email exists.
 */
export function forgotPassword(input: ForgotPasswordInput): Promise<void> {
  return apiClient.post<void>("/auth/forgot-password", input, { skipAuth: true });
}

export interface ResetPasswordInput {
  email: string;
  code: string;
  new_password: string;
  new_password_confirm: string;
}

/**
 * POST /auth/reset-password — code is the same 6-digit code
 * forgotPassword() dispatched by email and/or SMS, not a uid/token link.
 * One-time use: a successful reset clears the code server-side.
 */
export function resetPassword(input: ResetPasswordInput): Promise<void> {
  return apiClient.post<void>("/auth/reset-password", input, { skipAuth: true });
}

export interface VerifyEmailInput {
  email: string;
  code: string;
}

/** POST /auth/verify-email — a 6-digit code emailed to the address at registration, not a link. */
export function verifyEmail(input: VerifyEmailInput): Promise<void> {
  return apiClient.post<void>("/auth/verify-email", input, { skipAuth: true });
}

export interface ResendVerificationInput {
  email: string;
}

/** POST /auth/resend-verification — always the same response, whether or not the account exists/is already verified. */
export function resendVerification(input: ResendVerificationInput): Promise<void> {
  return apiClient.post<void>("/auth/resend-verification", input, { skipAuth: true });
}
