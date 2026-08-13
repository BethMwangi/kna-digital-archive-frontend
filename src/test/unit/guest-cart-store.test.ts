import { beforeEach, describe, expect, it, vi } from "vitest";
import * as guestCart from "@/lib/cart/guest-cart-store";

const line = (asset_id: string) => ({
  asset_id,
  title: `Asset ${asset_id}`,
  thumbnail: `https://example.com/${asset_id}.jpg`,
  price: 1500,
});

beforeEach(() => {
  guestCart.clearLines();
});

describe("addLine / removeLine / clearLines", () => {
  it("adds a line, persists it, and notifies subscribers", () => {
    const listener = vi.fn();
    const unsubscribe = guestCart.subscribe(listener);

    guestCart.addLine(line("asset-1"));

    expect(guestCart.getLines()).toEqual([line("asset-1")]);
    expect(JSON.parse(window.localStorage.getItem("kna.guestCart")!)).toEqual([line("asset-1")]);
    expect(listener).toHaveBeenCalled();

    unsubscribe();
  });

  it("does not add a duplicate asset", () => {
    guestCart.addLine(line("asset-1"));
    guestCart.addLine(line("asset-1"));

    expect(guestCart.getLines()).toHaveLength(1);
  });

  it("removes only the matching asset", () => {
    guestCart.addLine(line("asset-1"));
    guestCart.addLine(line("asset-2"));

    guestCart.removeLine("asset-1");

    expect(guestCart.getLines()).toEqual([line("asset-2")]);
  });

  it("empties the cart and clears localStorage", () => {
    guestCart.addLine(line("asset-1"));
    guestCart.clearLines();

    expect(guestCart.getLines()).toEqual([]);
    expect(JSON.parse(window.localStorage.getItem("kna.guestCart")!)).toEqual([]);
  });
});
