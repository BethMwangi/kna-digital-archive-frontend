import { createFileRoute } from "@tanstack/react-router";
import { BrowsePage } from "@/components/kna/browse-page";

export const Route = createFileRoute("/browse")({
  validateSearch: (search: Record<string, unknown>): { q?: string } => {
    return {
      q: search.q as string | undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Browse the archive — Urithi" },
      {
        name: "description",
        content:
          "Search and filter historical Kenyan photographs, newspapers and records by category, collection, date and photographer.",
      },
    ],
  }),
  component: BrowsePage,
});
