import { beforeEach, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../msw/server";
import { apiClient, ApiError } from "@/lib/api/client";
import * as tokenStore from "@/lib/auth/token-store";
import { testUser } from "../msw/handlers";

const API = "http://localhost:8000/api/v1";

beforeEach(() => {
  tokenStore.clearSession();
});

describe("apiClient", () => {
  it("unwraps the {success,message,data} envelope for enveloped endpoints", async () => {
    tokenStore.setSession({ access: "access-token-1", refresh: "refresh-token-1" }, testUser);
    const user = await apiClient.get("/users/me");
    expect(user).toEqual(testUser);
  });

  it("returns the raw payload (no unwrap) for endpoints like /admin/users/", async () => {
    const result = await apiClient.get("/admin/users/", { unwrap: false });
    expect(result).toEqual({ count: 1, next: null, previous: null, results: [testUser] });
  });

  it("throws an ApiError carrying the SDD §16.19 fields on a non-2xx response", async () => {
    await expect(
      apiClient.post("/auth/login", { email: "nobody@example.co.ke", password: "wrong" }),
    ).rejects.toMatchObject({
      status: 401,
      message: "No active account found with the given credentials",
    });
  });

  it("is an instance of ApiError so callers can narrow with instanceof", async () => {
    try {
      await apiClient.post("/auth/login", { email: "nobody@example.co.ke", password: "wrong" });
      throw new Error("expected apiClient.post to reject");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
    }
  });

  it("silently refreshes and retries once on a 401, transparent to the caller", async () => {
    tokenStore.setSession({ access: "expired-token", refresh: "refresh-token-1" }, testUser);

    const user = await apiClient.get("/users/me");

    expect(user).toEqual(testUser);
    // The retry should have picked up the rotated access token from token-store.
    expect(tokenStore.getState().accessToken).toBe("access-token-2");
  });

  it("clears the session and rejects if the refresh itself fails after a 401", async () => {
    tokenStore.setSession({ access: "expired-token", refresh: "dead-refresh-token" }, testUser);

    await expect(apiClient.get("/users/me")).rejects.toBeInstanceOf(ApiError);
    expect(tokenStore.getState().status).toBe("unauthenticated");
  });

  it("does not attempt a refresh for skipAuth endpoints (e.g. login with wrong password)", async () => {
    let refreshCalls = 0;
    server.use(
      http.post(`${API}/auth/refresh`, () => {
        refreshCalls += 1;
        return HttpResponse.json({
          success: true,
          message: "",
          data: { access: "x", refresh: "y" },
        });
      }),
    );

    await expect(
      apiClient.post("/auth/login", { email: "x", password: "wrong" }),
    ).rejects.toBeInstanceOf(ApiError);
    expect(refreshCalls).toBe(0);
  });
});
