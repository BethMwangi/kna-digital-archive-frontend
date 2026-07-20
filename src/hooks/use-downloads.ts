import { useMutation, useQuery } from "@tanstack/react-query";
import { getDownloadLink, listDownloads } from "@/lib/api/downloads";
import { queryKeys } from "@/lib/api/query-keys";

export function useDownloads() {
  return useQuery({ queryKey: queryKeys.downloads, queryFn: listDownloads });
}

/** Mints a fresh signed URL on demand — never cache the result, it expires in 15 min. */
export function useDownloadLink() {
  return useMutation({ mutationFn: (id: string) => getDownloadLink(id) });
}
