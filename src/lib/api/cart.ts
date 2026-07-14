import { apiClient } from "./client";
import type { CartItemOut } from "./types";

export interface AddToCartInput {
  asset_id: string;
  license_id: string;
}

/** POST /cart/ — adds one licensed copy of an asset to the cart. Requires auth. */
export function addToCart(input: AddToCartInput): Promise<CartItemOut> {
  return apiClient.post<CartItemOut>("/cart/", input);
}

/**
 * GET /cart/ — TODO(api): confirm the exact response shape once this ships;
 * assumed to be a bare array of cart items, matching the list convention
 * used elsewhere in this API (see assets.ts, admin-users.ts).
 */
export function listCart(): Promise<CartItemOut[]> {
  return apiClient.get<CartItemOut[]>("/cart/");
}

/** DELETE /cart/{id}/ — TODO(api): confirm this path once the endpoint ships. */
export function removeFromCart(id: string): Promise<void> {
  return apiClient.delete<void>(`/cart/${id}/`);
}
