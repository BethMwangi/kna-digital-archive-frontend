import { createFileRoute } from "@tanstack/react-router";
import { BrowsePage } from "@/components/kna/browse-page";

export const Route = createFileRoute("/browse")({
  validateSearch: (
    search: Record<string, unknown>,
  ): {
    q?: string;
    category?: string;
    collection?: string;
    asset_type?: string;
    county?: string;
    photographer?: string;
    date_from?: string;
    date_to?: string;
    license?: string;
    sort?: string;
    page?: number;
  } => {
    return {
      q: search.q as string | undefined,
      category: search.category as string | undefined,
      collection: search.collection as string | undefined,
      asset_type: search.asset_type as string | undefined,
      county: search.county as string | undefined,
      photographer: search.photographer as string | undefined,
      date_from: search.date_from as string | undefined,
      date_to: search.date_to as string | undefined,
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
