import { useState, type ReactNode } from "react";
import { Navigate, useRouterState } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuth } from "./use-auth";

function FullScreenLoader() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

/**
 * Client-side auth gate. Tokens live in localStorage (token-store.ts — the
 * backend delivers bearer tokens only, no session cookie), so there's no
 * way to gate this during SSR; the guard runs after the client mounts and
 * the silent-refresh bootstrap resolves. Until then it shows a loader
 * rather than flashing protected content or bouncing straight to login.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Captured once at mount — useRouterState keeps tracking the live location,
  // which has already moved to /auth/login by the time <Navigate> re-renders,
  // so a live read here would redirect back to the login page itself instead
  // of the page that was actually being protected.
  const [protectedPathname] = useState(pathname);

  if (isLoading) return <FullScreenLoader />;
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" search={{ redirect: protectedPathname }} />;
  }
  return <>{children}</>;
}

/** Same as RequireAuth, plus mirrors the backend's IsAdminOrAbove gate (role in {admin, super_admin}). */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, isAdminOrAbove } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [protectedPathname] = useState(pathname);

  if (isLoading) return <FullScreenLoader />;
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" search={{ redirect: protectedPathname }} />;
  }
  if (!isAdminOrAbove) {
    return (
      <div className="grid min-h-dvh place-items-center px-4 text-center">
        <div>
          <p className="eyebrow">Access denied</p>
          <h1 className="mt-3 font-display text-3xl">You don't have access to this area</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This section is limited to Urithi staff accounts.
          </p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
