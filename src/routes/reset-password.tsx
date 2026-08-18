import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

const searchSchema = z.object({
  email: z.string().optional(),
});

/**
 * The backend's password-reset email used to link to
 * `{FRONTEND_URL}/reset-password?uid&token`; reset is now a 6-digit code
 * entered on the page (see auth.reset.tsx), not a link, but this bridge
 * stays in case an old email is still sitting in someone's inbox — it just
 * forwards `email` now, same as verify-email.tsx does for /auth/verify.
 */
export const Route = createFileRoute("/reset-password")({
  validateSearch: (search) => searchSchema.parse(search),
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/auth/reset", search });
  },
});
