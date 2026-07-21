import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

const searchSchema = z.object({
  uid: z.string().optional(),
  token: z.string().optional(),
});

/**
 * Same mismatch as reset-password.tsx: the backend's verification email
 * links to `{FRONTEND_URL}/verify-email`, not `/auth/verify` (the real page).
 */
export const Route = createFileRoute("/verify-email")({
  validateSearch: (search) => searchSchema.parse(search),
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/auth/verify", search });
  },
});
