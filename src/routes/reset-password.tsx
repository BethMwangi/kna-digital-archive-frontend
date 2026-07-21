import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

const searchSchema = z.object({
  uid: z.string().optional(),
  token: z.string().optional(),
});

/**
 * The backend's password-reset email links to `{FRONTEND_URL}/reset-password`,
 * not `/auth/reset` (the real page) — this bridges that mismatch so the
 * emailed link works. See CLAUDE.md/auth.reset.tsx for the actual page.
 */
export const Route = createFileRoute("/reset-password")({
  validateSearch: (search) => searchSchema.parse(search),
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/auth/reset", search });
  },
});
