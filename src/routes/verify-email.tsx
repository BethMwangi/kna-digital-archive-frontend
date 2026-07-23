import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

const searchSchema = z.object({
  email: z.string().optional(),
});

/**
 * Same mismatch as reset-password.tsx: the backend's verification email
 * links to `{FRONTEND_URL}/verify-email`, not `/auth/verify` (the real page).
 * Verification itself is now a 6-digit code entered on that page, not a
 * uid/token pair off the URL — so the only thing worth preserving here is
 * `email`, if the link happens to include it.
 */
export const Route = createFileRoute("/verify-email")({
  validateSearch: (search) => searchSchema.parse(search),
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/auth/verify", search });
  },
});
