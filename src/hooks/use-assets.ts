import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getAsset,
  listAssets,
  listCategories,
  listCollections,
  listFeaturedAssets,
  listLatestAssets,
  listTags,
  type AssetListParams,
} from "@/lib/api/assets";
import { listLicenses } from "@/lib/api/licenses";
import { queryKeys } from "@/lib/api/query-keys";

const FIVE_MIN = 5 * 60 * 1000;

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

// The 4 license types rarely change — cache it for the session.
export function useLicenses() {
  return useQuery({
    queryKey: queryKeys.taxonomy.licenses,
    queryFn: listLicenses,
    staleTime: FIVE_MIN,
  });
}
