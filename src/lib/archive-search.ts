/** Search params shared by every page that hosts the archive grid ("/" and
 *  "/browse") — values are passed straight through to the backend filters. */
export interface ArchiveSearch {
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
}

export function validateArchiveSearch(search: Record<string, unknown>): ArchiveSearch {
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
}
