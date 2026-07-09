import { useEffect, type ReactNode } from "react";
import { bootstrapSession } from "./token-store";
import { getMe } from "../api/users";

/**
 * Mounted once at the app root. On first client render, tries to silently
 * restore a session from the persisted refresh token (see token-store.ts)
 * so a page reload doesn't force a re-login.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    void bootstrapSession(getMe);
  }, []);

  return children;
}
