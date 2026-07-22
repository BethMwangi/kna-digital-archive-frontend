import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getAsset,
  listAssets,
  listCategories,
  listCollections,
  listCounties,
  listFeaturedAssets,
  listLatestAssets,
  listPhotographers,
  listTags,
  searchAssets,
  suggestAssets,
  type AssetListParams,
  type AssetSearchParams,
} from "@/lib/api/assets";
import { listLicenses } from "@/lib/api/licenses";
import { queryKeys } from "@/lib/api/query-keys";

const FIVE_MIN = 5 * 60 * 1000;
const SUGGEST_DEBOUNCE_MS = 300;
// Below this, every keystroke would fire a request for a near-meaningless
// 1-2 letter query — wait for a query specific enough to be useful.
const MIN_SUGGEST_LENGTH = 3;

/** Paginated, filterable browse query. keepPreviousData stops the grid
 *  flashing empty while a new page/filter loads. */
export function useAssets(params: AssetListParams = {}) {
  return useQuery({
    queryKey: queryKeys.assets.list(params),
    queryFn: () => listAssets(params),
    placeholderData: keepPreviousData,
  });
}

export function useAsset(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.assets.detail(id ?? ""),
    queryFn: () => getAsset(id!),
    enabled: Boolean(id),
  });
}

export function useFeaturedAssets() {
  return useQuery({ queryKey: queryKeys.assets.featured, queryFn: listFeaturedAssets });
}

export function useLatestAssets() {
  return useQuery({ queryKey: queryKeys.assets.latest, queryFn: listLatestAssets });
}

// Taxonomy changes rarely — cache it for the session.
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.taxonomy.categories,
    queryFn: listCategories,
    staleTime: FIVE_MIN,
  });
}

export function useCollections() {
  return useQuery({
    queryKey: queryKeys.taxonomy.collections,
    queryFn: listCollections,
    staleTime: FIVE_MIN,
  });
}

export function useTags() {
  return useQuery({ queryKey: queryKeys.taxonomy.tags, queryFn: listTags, staleTime: FIVE_MIN });
}

export function useCounties() {
  return useQuery({
    queryKey: queryKeys.taxonomy.counties,
    queryFn: listCounties,
    staleTime: FIVE_MIN,
  });
}

export function usePhotographers() {
  return useQuery({
    queryKey: queryKeys.taxonomy.photographers,
    queryFn: listPhotographers,
    staleTime: FIVE_MIN,
  });
}

// The 4 license types rarely change — cache it for the session.
export function useLicenses() {
  return useQuery({
    queryKey: queryKeys.taxonomy.licenses,
    queryFn: listLicenses,
    staleTime: FIVE_MIN,
  });
}

/** Full results page — fires on Enter/submit, not on every keystroke (see useAssetSuggestions for that). */
export function useAssetSearch(params: AssetSearchParams) {
  return useQuery({
    queryKey: queryKeys.assets.search(params),
    queryFn: () => searchAssets(params),
    enabled: Boolean(params.q),
    placeholderData: keepPreviousData,
  });
}

/** Live dropdown — debounced internally so callers can just pass the raw input value on every keystroke. */
export function useAssetSuggestions(q: string) {
  const [debouncedQ, setDebouncedQ] = useState(q);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q), SUGGEST_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [q]);

  return useQuery({
    queryKey: queryKeys.assets.suggest(debouncedQ),
    queryFn: () => suggestAssets(debouncedQ),
    enabled: debouncedQ.trim().length >= MIN_SUGGEST_LENGTH,
    placeholderData: keepPreviousData,
  });
}
