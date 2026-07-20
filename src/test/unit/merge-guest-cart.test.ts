import { beforeEach, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../msw/server";
import * as guestCart from "@/lib/cart/guest-cart-store";
import { mergeGuestCartIntoServer } from "@/lib/cart/merge-guest-cart";
import * as tokenStore from "@/lib/auth/token-store";
import { testUser } from "../msw/handlers";

const API = "http://localhost:8000/api/v1";

const line = (asset_id: string) => ({
  asset_id,
  license_id: "lic-editorial",
  title: `Asset ${asset_id}`,
  thumbnail: `https://example.com/${asset_id}.jpg`,
  price: 1500,
  license_name: "Editorial",
});

beforeEach(() => {
  tokenStore.clearSession();
  guestCart.clearLines();
});

describe("mergeGuestCartIntoServer", () => {
  it("replays every guest line to the server and clears the guest cart", async () => {
    tokenStore.setSession({ access: "a1", refresh: "refresh-token-1" }, testUser);
    guestCart.addLine(line("asset-1"));
    guestCart.addLine(line("asset-2"));

    const posted: string[] = [];
    server.use(
      http.post(`${API}/cart/`, async ({ request }) => {
        const body = (await request.json()) as { asset_id: string };
        posted.push(body.asset_id);
        return HttpResponse.json({
          success: true,
          message: "Added to cart.",
          data: { items: [], total: 0, item_count: posted.length },
        });
      }),
    );

    await mergeGuestCartIntoServer();

    expect(posted.sort()).toEqual(["asset-1", "asset-2"]);
    expect(guestCart.getLines()).toEqual([]);
  });

  it("still clears the guest cart even when a line fails (e.g. 409 already in cart)", async () => {
    tokenStore.setSession({ access: "a1", refresh: "refresh-token-1" }, testUser);
    guestCart.addLine(line("asset-1"));

    server.use(
      http.post(`${API}/cart/`, () =>
        HttpResponse.json(
          { success: false, code: "CONFLICT", message: "Already in cart.", errors: {} },
          { status: 409 },
        ),
      ),
    );

    await mergeGuestCartIntoServer();

    expect(guestCart.getLines()).toEqual([]);
  });

  it("does nothing when the guest cart is already empty", async () => {
    guestCart.clearLines();
    let called = false;
    server.use(
      http.post(`${API}/cart/`, () => {
        called = true;
        return HttpResponse.json({ success: true, message: "", data: {} });
      }),
    );

    await mergeGuestCartIntoServer();

    expect(called).toBe(false);
  });
});
