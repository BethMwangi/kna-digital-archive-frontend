import { apiClient, toNumber } from "./client";
import type { CartItemOut, CartOut } from "./types";

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

function fixCart(cart: CartOut): CartOut {
  return { ...cart, items: cart.items.map(fixCartItem), total: toNumber(cart.total) };
}

/** GET /cart/ — items, per-line subtotal, cart total, item_count. Requires auth. */
export async function getCart(): Promise<CartOut> {
  const data = await apiClient.get<CartOut>("/cart/");
  return fixCart(data);
}

/**
 * POST /cart/ — adds one licensed copy of an asset. 409 if that exact
 * asset+license pair is already in the cart (safe to ignore when replaying
 * a guest cart on login — see src/lib/cart/merge-guest-cart.ts). Returns the
 * full updated cart, not just the new line.
 */
export async function addToCart(input: AddToCartInput): Promise<CartOut> {
  const data = await apiClient.post<CartOut>("/cart/", input);
  return fixCart(data);
}

/**
 * POST /cart/sync/ — completely replaces the backend cart with these items.
 * Used during checkout to sync the frontend local cart state.
 * Returns the full cart detail (id, items, total, item_count).
 */
export async function syncCart(items: AddToCartInput[]): Promise<CartItemOut[]> {
  const data = await apiClient.post<{ id: string; items: CartItemOut[]; total: number; item_count: number }>("/cart/sync/", { items });
  return data.items.map(fixCartItem);
}

/** DELETE /cart/items/{itemId}/ — removes one line. Returns the updated cart. */
export async function removeCartItem(itemId: string): Promise<CartOut> {
  const data = await apiClient.delete<CartOut>(`/cart/items/${itemId}/`);
  return fixCart(data);
}

/** POST /cart/clear/ — empties the cart. Returns the updated (empty) cart. */
export async function clearCart(): Promise<CartOut> {
  const data = await apiClient.post<CartOut>("/cart/clear/");
  return fixCart(data);
}
