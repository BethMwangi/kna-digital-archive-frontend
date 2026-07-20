import { createFileRoute } from "@tanstack/react-router";
import { BrowsePage } from "@/components/kna/browse-page";

export const Route = createFileRoute("/browse")({
  validateSearch: (
    search: Record<string, unknown>,
  ): {
    q?: string;
    category?: string;
    collection?: string;
    license?: string;
    sort?: string;
    page?: number;
  } => {
    return {
      q: search.q as string | undefined,
      category: search.category as string | undefined,
      collection: search.collection as string | undefined,
      license: search.license as string | undefined,
      sort: search.sort as string | undefined,
      page: Number(search.page) || 1,
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
