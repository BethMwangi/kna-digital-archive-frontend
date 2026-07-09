import { beforeEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../msw/server";
import * as tokenStore from "@/lib/auth/token-store";
import { testUser } from "../msw/handlers";

const API = "http://localhost:8000/api/v1";

beforeEach(() => {
  tokenStore.clearSession();
});

describe("setSession / clearSession", () => {
  it("persists the refresh token and user, and notifies subscribers", () => {
    const listener = vi.fn();
    const unsubscribe = tokenStore.subscribe(listener);

    tokenStore.setSession({ access: "a1", refresh: "r1" }, testUser);

    expect(tokenStore.getState()).toEqual({
      status: "authenticated",
      accessToken: "a1",
      user: testUser,
    });
    expect(tokenStore.getRefreshToken()).toBe("r1");
    expect(listener).toHaveBeenCalled();

    unsubscribe();
  });

  it("clears the access token from memory and the refresh token from localStorage", () => {
    tokenStore.setSession({ access: "a1", refresh: "r1" }, testUser);
    tokenStore.clearSession();

    expect(tokenStore.getState()).toEqual({
      status: "unauthenticated",
      accessToken: null,
      user: null,
    });
    expect(tokenStore.getRefreshToken()).toBeNull();
  });
});

describe("refreshAccessToken", () => {
  it("rotates the refresh token and updates the access token on success", async () => {
    tokenStore.setSession({ access: "stale-access", refresh: "refresh-token-1" }, testUser);

    const access = await tokenStore.refreshAccessToken();

    expect(access).toBe("access-token-2");
    expect(tokenStore.getRefreshToken()).toBe("refresh-token-2");
    expect(tokenStore.getState().accessToken).toBe("access-token-2");
  });

  it("clears the session when the refresh token is rejected", async () => {
    tokenStore.setSession({ access: "stale-access", refresh: "not-a-real-token" }, testUser);

    const access = await tokenStore.refreshAccessToken();

    expect(access).toBeNull();
    expect(tokenStore.getState().status).toBe("unauthenticated");
    expect(tokenStore.getRefreshToken()).toBeNull();
  });

  it("returns null immediately with no network call when there's no refresh token", async () => {
    let calls = 0;
    server.use(
      http.post(`${API}/auth/refresh`, () => {
        calls += 1;
        return HttpResponse.json({
          success: true,
          message: "",
          data: { access: "x", refresh: "y" },
        });
      }),
    );

    const access = await tokenStore.refreshAccessToken();

    expect(access).toBeNull();
    expect(calls).toBe(0);
  });

  it("coalesces concurrent calls into a single in-flight request", async () => {
    let calls = 0;
    server.use(
      http.post(`${API}/auth/refresh`, async () => {
        calls += 1;
        await new Promise((resolve) => setTimeout(resolve, 20));
        return HttpResponse.json({
          success: true,
          message: "",
          data: { access: "access-token-2", refresh: "refresh-token-2" },
        });
      }),
    );
    tokenStore.setSession({ access: "stale-access", refresh: "refresh-token-1" }, testUser);

    const [first, second] = await Promise.all([
      tokenStore.refreshAccessToken(),
      tokenStore.refreshAccessToken(),
    ]);

    expect(calls).toBe(1);
    expect(first).toBe("access-token-2");
    expect(second).toBe("access-token-2");
  });
});

describe("bootstrapSession", () => {
  it("restores a session by rotating the refresh token then fetching the profile", async () => {
    tokenStore.setSession({ access: "stale-access", refresh: "refresh-token-1" }, testUser);
    // Simulate a fresh page load: only the refresh token survives (access token is memory-only).
    tokenStore.clearSession();
    window.localStorage.setItem("kna.refreshToken", "refresh-token-1");

    const fetchProfile = vi.fn().mockResolvedValue(testUser);
    await tokenStore.bootstrapSession(fetchProfile);

    expect(fetchProfile).toHaveBeenCalled();
    expect(tokenStore.getState()).toEqual({
      status: "authenticated",
      accessToken: "access-token-2",
      user: testUser,
    });
  });

  it("ends unauthenticated when there's no persisted refresh token", async () => {
    const fetchProfile = vi.fn();
    await tokenStore.bootstrapSession(fetchProfile);

    expect(fetchProfile).not.toHaveBeenCalled();
    expect(tokenStore.getState().status).toBe("unauthenticated");
  });

  it("clears the session if the profile fetch fails after a successful token rotation", async () => {
    window.localStorage.setItem("kna.refreshToken", "refresh-token-1");
    const fetchProfile = vi.fn().mockRejectedValue(new Error("boom"));

    await tokenStore.bootstrapSession(fetchProfile);

    expect(tokenStore.getState().status).toBe("unauthenticated");
    expect(tokenStore.getRefreshToken()).toBeNull();
  });
});
