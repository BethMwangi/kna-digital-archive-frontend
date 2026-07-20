import { apiClient } from "./client";
import type { DownloadLinkOut, DownloadOut, Paginated } from "./types";

/** GET /downloads/ — purchased entitlements (one per licensed asset). */
export async function listDownloads(): Promise<DownloadOut[]> {
  const data = await apiClient.get<Paginated<DownloadOut> | DownloadOut[]>("/downloads/");
  return Array.isArray(data) ? data : data.results;
}

/**
 * GET /downloads/{id}/link/ — mints a fresh signed URL, expires in 15 min.
 * Call this on click, never cache/store the resulting URL — see the "Will
 * the email send the download link?" note: the same expiry is why the
 * receipt email links to /account/downloads instead of a raw file URL.
 */
export function getDownloadLink(id: string): Promise<DownloadLinkOut> {
  return apiClient.get<DownloadLinkOut>(`/downloads/${id}/link/`);
}
