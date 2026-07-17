import { apiClient, toNumber } from "./client";
import type { CartItemOut } from "./types";

export interface AddToCartInput {
  asset_id: string;
  license_id: string;
}

// DRF renders DecimalField as a JSON string ("1500.00") — coerce at the boundary (see assets.ts).
function fixCartItem(item: CartItemOut): CartItemOut {
  return {
    ...item,
    asset: { ...item.asset, price: toNumber(item.asset.price) },
    subtotal: toNumber(item.subtotal),
  };
}

/** POST /cart/ — adds one licensed copy of an asset to the cart. Requires auth. */
export async function addToCart(input: AddToCartInput): Promise<CartItemOut> {
  const data = await apiClient.post<CartItemOut>("/cart/", input);
  return fixCartItem(data);
}

/**
 * GET /cart/ — TODO(api): confirm the exact response shape once this ships;
 * assumed to be a bare array of cart items, matching the list convention
 * used elsewhere in this API (see assets.ts, admin-users.ts).
 */
export async function listCart(): Promise<CartItemOut[]> {
  const data = await apiClient.get<CartItemOut[]>("/cart/");
  return data.map(fixCartItem);
}

/** DELETE /cart/{id}/ — TODO(api): confirm this path once the endpoint ships. */
export function removeFromCart(id: string): Promise<void> {
  return apiClient.delete<void>(`/cart/${id}/`);
}
