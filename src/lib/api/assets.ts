import { apiClient } from "./client";
import { API_BASE_URL } from "./config";
import type {
  AssetDetail,
  AssetListItem,
  CategoryOut,
  CollectionOut,
  Paginated,
  TagOut,
} from "./types";

/**
 * Filters map 1:1 to DigitalAssetViewSet's backends:
 * DjangoFilterBackend (category/collection/asset_type by UUID),
 * SearchFilter (?search=), OrderingFilter (?ordering=).
 */
export interface AssetListParams {
  page?: number;
  search?: string;
  category?: string; // Category UUID
  collection?: string; // Collection UUID
  asset_type?: string; // "photograph" | "newspaper" | ...
  ordering?: "publication_date" | "-publication_date" | "created_at" | "-created_at";
}

function qs(params: object): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== "");
  if (!entries.length) return "";
  return "?" + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

/**
 * The dev API serves `thumbnail`/`image` from BACKEND_URL, which currently
 * defaults to :8080 while the API itself runs on :8000 — every media URL
 * 404s until that's fixed server-side. Rewrite the origin to match
 * API_BASE_URL's so images load today and this becomes a no-op once the
 * backend's BACKEND_URL is corrected.
 */
function fixMediaUrl(url: string): string {
  try {
    const media = new URL(url);
    const apiOrigin = new URL(API_BASE_URL).origin;
    return media.origin === apiOrigin ? url : `${apiOrigin}${media.pathname}${media.search}`;
  } catch {
    return url;
  }
}

function fixListItem(item: AssetListItem): AssetListItem {
  return { ...item, thumbnail: fixMediaUrl(item.thumbnail) };
}

function fixDetail(item: AssetDetail): AssetDetail {
  return { ...item, thumbnail: fixMediaUrl(item.thumbnail), image: fixMediaUrl(item.image) };
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

/** GET /categories/ — enveloped + paginated; normalized to a bare array. */
export async function listCategories(): Promise<CategoryOut[]> {
  const data = await apiClient.get<Paginated<CategoryOut> | CategoryOut[]>("/categories/", {
    skipAuth: true,
  });
  return Array.isArray(data) ? data : data.results;
}

/** GET /collections/ — enveloped + paginated; normalized to a bare array. None seeded yet. */
export async function listCollections(): Promise<CollectionOut[]> {
  const data = await apiClient.get<Paginated<CollectionOut> | CollectionOut[]>("/collections/", {
    skipAuth: true,
  });
  return Array.isArray(data) ? data : data.results;
}

/** GET /tags/ — enveloped + paginated; normalized to a bare array. */
export async function listTags(): Promise<TagOut[]> {
  const data = await apiClient.get<Paginated<TagOut> | TagOut[]>("/tags/", { skipAuth: true });
  return Array.isArray(data) ? data : data.results;
}
