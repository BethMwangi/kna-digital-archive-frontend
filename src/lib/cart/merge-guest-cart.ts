import { addToCart } from "@/lib/api/cart";
import * as guestCart from "./guest-cart-store";

/**
 * Replays the anonymous localStorage cart into the real server cart right
 * after login. Best-effort: an item failing (409 already-in-cart, or the
 * asset/license having disappeared since it was added) never blocks login —
 * we simply drop that line and move on, matching the guest-cart model where
 * the server cart becomes the source of truth from this point forward.
 */
export async function mergeGuestCartIntoServer(): Promise<void> {
  const lines = guestCart.getLines();
  if (lines.length === 0) return;

  await Promise.allSettled(
    lines.map((line) => addToCart({ asset_id: line.asset_id, license_id: line.license_id })),
  );
  guestCart.clearLines();
}
