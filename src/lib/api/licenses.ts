import { apiClient } from "./client";
import type { LicenseOut, Paginated } from "./types";

/** GET /licenses/ — enveloped + paginated; normalized to a bare array. 4 fixed license types. */
export async function listLicenses(): Promise<LicenseOut[]> {
  const data = await apiClient.get<Paginated<LicenseOut> | LicenseOut[]>("/licenses/", {
    skipAuth: true,
  });
  return Array.isArray(data) ? data : data.results;
}
