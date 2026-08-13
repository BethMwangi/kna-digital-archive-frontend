import { createFileRoute, redirect } from "@tanstack/react-router";

/** No overview/dashboard page — /account lands users on their downloads instead. */
export const Route = createFileRoute("/account/")({
  beforeLoad: () => {
    throw redirect({ to: "/account/downloads" });
  },
});
