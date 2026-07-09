import { API_BASE_URL } from "../api/config";
import type { ApiEnvelope, RefreshResult, User } from "../api/types";

/**
 * Session storage strategy (senior note):
 * The backend delivers tokens in the JSON body only — no HttpOnly cookies —
 * so there's no way to avoid keeping *something* in client-side storage.
 * - Access token: kept in memory only (module state), never persisted. It's
 *   short-lived (30 min) so losing it on a hard refresh is cheap — we just
 *   silently mint a new one from the refresh token on boot.
 * - Refresh token: persisted to localStorage so a page reload doesn't force
 *   a re-login. This is the standard trade-off for SPA + bearer-JWT APIs;
 *   XSS is the residual risk, mitigated here by rotate-on-use +
 *   blacklist-after-rotation on the backend (a stolen refresh token is only
 *   replayable once) and the short access-token lifetime. If this ever
 *   needs to be hardened further, the fix is on the backend: switch refresh
 *   delivery to an HttpOnly Secure cookie.
 */

const REFRESH_TOKEN_KEY = "kna.refreshToken";
const USER_CACHE_KEY = "kna.user";

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

export interface AuthState {
  status: AuthStatus;
  accessToken: string | null;
  user: User | null;
}

let state: AuthState = {
  status: "idle",
  accessToken: null,
  user: readCachedUser(),
};

const listeners = new Set<() => void>();

function readCachedUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_CACHE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function persistUser(user: User | null) {
  if (typeof window === "undefined") return;
  if (user) window.localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
  else window.localStorage.removeItem(USER_CACHE_KEY);
}

function readRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

function persistRefreshToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
  else window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

function setState(next: Partial<AuthState>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getState(): AuthState {
  return state;
}

export function getAccessToken(): string | null {
  return state.accessToken;
}

export function getRefreshToken(): string | null {
  return readRefreshToken();
}

export function setSession(tokens: RefreshResult, user: User) {
  persistRefreshToken(tokens.refresh);
  persistUser(user);
  setState({ status: "authenticated", accessToken: tokens.access, user });
}

export function setUser(user: User) {
  persistUser(user);
  setState({ user });
}

export function clearSession() {
  persistRefreshToken(null);
  persistUser(null);
  setState({ status: "unauthenticated", accessToken: null, user: null });
}

let refreshPromise: Promise<string | null> | null = null;

/**
 * Rotates the refresh token. ROTATE_REFRESH_TOKENS + BLACKLIST_AFTER_ROTATION
 * are on server-side, so the old refresh token is dead the instant this
 * succeeds — every caller must persist the *new* refresh token, never reuse
 * the one it started with. Concurrent 401s share one in-flight request so a
 * burst of requests doesn't fire N rotations racing each other.
 */
export function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  const refresh = readRefreshToken();
  if (!refresh) return Promise.resolve(null);

  refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  })
    .then(async (response) => {
      if (!response.ok) {
        clearSession();
        return null;
      }
      const body = (await response.json()) as ApiEnvelope<RefreshResult>;
      persistRefreshToken(body.data.refresh);
      setState({ status: "authenticated", accessToken: body.data.access });
      return body.data.access;
    })
    .catch(() => {
      clearSession();
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

/**
 * Runs once on client mount: if a refresh token survived from a previous
 * visit, silently mint a new access token and re-fetch the profile so the
 * user doesn't have to log in again on every page reload. `fetchProfile` is
 * injected (rather than importing api/users.ts here) to keep this module
 * free of a dependency on the HTTP client.
 */
export async function bootstrapSession(fetchProfile: () => Promise<User>): Promise<void> {
  if (typeof window === "undefined") return;

  const refresh = readRefreshToken();
  if (!refresh) {
    setState({ status: "unauthenticated" });
    return;
  }

  setState({ status: "loading" });
  const access = await refreshAccessToken();
  if (!access) {
    setState({ status: "unauthenticated" });
    return;
  }

  try {
    const user = await fetchProfile();
    setUser(user);
    setState({ status: "authenticated" });
  } catch {
    clearSession();
  }
}
