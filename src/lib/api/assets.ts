import { apiClient, toNumber } from "./client";
import { API_BASE_URL } from "./config";
import type {
  AssetDetail,
  AssetListItem,
  AssetSearchOut,
  AssetSuggestionOut,
  CategoryOut,
  CollectionOut,
  CountyOut,
  PhotographerOut,
  Paginated,
  TagOut,
} from "./types";

/**
 * Filters map 1:1 to DigitalAssetViewSet's backends:
 * DjangoFilterBackend (category/collection/asset_type/county/photographer),
 * SearchFilter (?search=), OrderingFilter (?ordering=). date_from/date_to/year
 * are the same date filters the search endpoint uses, also honored here for
 * plain browse/category pages. category/collection/asset_type/county/
 * photographer all accept a comma-separated list of values for an OR match
 * within that filter (e.g. `county=Kiambu,Nairobi`); combining different
 * filter params still ANDs across them.
 */
export interface AssetListParams {
  page?: number;
  search?: string;
  category?: string; // Category UUID, comma-separated for multiple
  collection?: string; // Collection UUID, comma-separated for multiple
  asset_type?: string; // "photograph" | "newspaper" | ... , comma-separated
  county?: string; // comma-separated for multiple
  photographer?: string; // comma-separated for multiple
  ordering?: "publication_date" | "-publication_date" | "created_at" | "-created_at";
  date_from?: string;
  date_to?: string;
  year?: number;
}

/** GET /assets/search/ takes the same filters as listAssets, minus ordering, plus the query itself. */
export interface AssetSearchParams {
  q: string;
  category?: string;
  collection?: string;
  asset_type?: string;
  county?: string;
  photographer?: string;
  date_from?: string;
  date_to?: string;
  year?: number;
  page?: number;
}

function qs(params: object): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== "");
  if (!entries.length) return "";
  return "?" + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

/**
 * Local-dev-only fixup: the dev API used to serve `thumbnail`/`image` from
 * BACKEND_URL, which defaulted to :8080 while the API itself ran on :8000 —
 * same host, wrong port. Only rewrite that exact same-hostname mismatch.
 *
 * In production, media lives on a legitimately different host (Supabase
 * Storage, S3, a CDN) — those absolute URLs must be left untouched, or
 * real images get rewritten into broken ones on the API's own domain.
 */
function fixMediaUrl(url: string): string {
  try {
    const media = new URL(url);
    const api = new URL(API_BASE_URL);
    if (media.hostname !== api.hostname || media.origin === api.origin) return url;
    return `${api.origin}${media.pathname}${media.search}`;
  } catch {
    return url;
  }
}

function fixListItem(item: AssetListItem): AssetListItem {
  return { ...item, thumbnail: fixMediaUrl(item.thumbnail), price: toNumber(item.price) };
}

function fixDetail(item: AssetDetail): AssetDetail {
  return {
    ...item,
    thumbnail: fixMediaUrl(item.thumbnail),
    image: fixMediaUrl(item.image),
    image_back: item.image_back ? fixMediaUrl(item.image_back) : item.image_back,
    price: toNumber(item.price),
  };
}

/** GET /assets/ — enveloped; `data` is a DRF-paginated payload. */
export async function listAssets(params: AssetListParams = {}): Promise<Paginated<AssetListItem>> {
  const data = await apiClient.get<Paginated<AssetListItem>>(`/assets/${qs(params)}`, {
    skipAuth: true,
  });
  return { ...data, results: data.results.map(fixListItem) };
}

/** GET /assets/{id}/ — detail by UUID (backend has no slug field; route param is the id). */
export async function getAsset(id: string): Promise<AssetDetail> {
  const data = await apiClient.get<AssetDetail>(`/assets/${id}/`, { skipAuth: true });
  return fixDetail(data);
}

/** GET /assets/featured/ — plain array in `data` (no pagination). Not curated — the 5 most recently created. */
export async function listFeaturedAssets(): Promise<AssetListItem[]> {
  const data = await apiClient.get<AssetListItem[]>("/assets/featured/", { skipAuth: true });
  return data.map(fixListItem);
}

/** GET /assets/latest/ — plain array in `data` (no pagination). Top 10 by publication_date desc. */
export async function listLatestAssets(): Promise<AssetListItem[]> {
  const data = await apiClient.get<AssetListItem[]>("/assets/latest/", { skipAuth: true });
  return data.map(fixListItem);
}

/**
 * Taxonomy endpoints (categories/collections/tags) are enveloped + paginated
 * (e.g. 21 categories across 2 pages) — follow `next` so callers always get
 * the full set instead of silently truncating at the first page.
 */
async function listAllPaginated<T>(path: string): Promise<T[]> {
  const results: T[] = [];
  let next: string | null = path;
  while (next) {
    const data: Paginated<T> = await apiClient.get<Paginated<T>>(next, { skipAuth: true });
    results.push(...data.results);
    next = data.next ? `${path}${new URL(data.next).search}` : null;
  }
  return results;
}

/** GET /categories/ */
export function listCategories(): Promise<CategoryOut[]> {
  return listAllPaginated<CategoryOut>("/categories/");
}

/** GET /collections/ */
export function listCollections(): Promise<CollectionOut[]> {
  return listAllPaginated<CollectionOut>("/collections/");
}

/** GET /tags/ */
export function listTags(): Promise<TagOut[]> {
  return listAllPaginated<TagOut>("/tags/");
}

/** GET /assets/counties/ — distinct county values in use, sorted by count desc. Plain array, not paginated. */
export function listCounties(): Promise<CountyOut[]> {
  return apiClient.get<CountyOut[]>("/assets/counties/", { skipAuth: true });
}

/** GET /assets/photographers/ — distinct photographer values in use, sorted by count desc. Plain array, not paginated. */
export function listPhotographers(): Promise<PhotographerOut[]> {
  return apiClient.get<PhotographerOut[]>("/assets/photographers/", { skipAuth: true });
}

/**
 * GET /assets/search/ — ranked full-text (Meilisearch primary, Postgres
 * exact/fuzzy fallback). Enveloped like every other endpoint; `match_type`/
 * `query` sit alongside the DRF pagination fields inside `data`.
 */
export async function searchAssets(params: AssetSearchParams): Promise<AssetSearchOut> {
  const data = await apiClient.get<AssetSearchOut>(`/assets/search/${qs(params)}`, {
    skipAuth: true,
  });
  return { ...data, results: data.results.map(fixListItem) };
}

/** GET /assets/suggest/ — top 8, minimal payload for a live dropdown. Debounce on keystroke. */
export async function suggestAssets(q: string): Promise<AssetSuggestionOut[]> {
  if (!q) return [];
  const data = await apiClient.get<{ results: AssetSuggestionOut[] }>(
    `/assets/suggest/${qs({ q })}`,
    { skipAuth: true },
  );
  return data.results.map((item) => ({
    ...item,
    thumbnail: fixMediaUrl(item.thumbnail),
    price: toNumber(item.price),
  }));
}
