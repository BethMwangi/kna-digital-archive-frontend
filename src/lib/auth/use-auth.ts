import { useSyncExternalStore } from "react";
import { getState, subscribe, type AuthState } from "./token-store";

// Must be a stable reference — useSyncExternalStore re-renders whenever
// getServerSnapshot returns a value that differs from the last call, and a
// fresh object literal here differs from itself on every single call.
const SERVER_SNAPSHOT: AuthState = { status: "idle", accessToken: null, user: null };

function getServerSnapshot(): AuthState {
  return SERVER_SNAPSHOT;
}

/**
 * Role flags mirror accounts/models.py's is_customer / is_content_editor /
 * is_admin / is_super_admin exactly — role is NOT a linear hierarchy
 * (content_editor isn't "between" customer and admin), so route guards
 * should check the specific flag they need rather than a rank.
 */
export function useAuth() {
  const state = useSyncExternalStore(subscribe, getState, getServerSnapshot);
  const user = state.user;

  return {
    status: state.status,
    user,
    isAuthenticated: state.status === "authenticated" && user !== null,
    isLoading: state.status === "idle" || state.status === "loading",
    isCustomer: user?.role === "customer",
    isContentEditor: user?.role === "content_editor",
    /** Mirrors the IsAdminOrAbove permission class: role in {admin, super_admin}. */
    isAdminOrAbove: user?.role === "admin" || user?.role === "super_admin",
    isSuperAdmin: user?.role === "super_admin",
  };
}
