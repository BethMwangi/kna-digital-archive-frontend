import { createFileRoute } from "@tanstack/react-router";
import { BrowsePage } from "@/components/kna/browse-page";
import { validateArchiveSearch } from "@/lib/archive-search";

export const Route = createFileRoute("/browse")({
  validateSearch: validateArchiveSearch,
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
