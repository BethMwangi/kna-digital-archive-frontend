import { http, HttpResponse } from "msw";
import type { User } from "@/lib/api/types";

/**
 * Mirrors the Django API contract described in accounts/api.py and
 * accounts/serializers.py: {success,message,data} envelope for auth/users
 * endpoints, raw DRF payloads for /admin/users/ (see admin-users.ts).
 */
const API = "http://localhost:8000/api/v1";

export const testUser: User = {
  id: "11111111-1111-1111-1111-111111111111",
  first_name: "Wanjiku",
  last_name: "Kamau",
  full_name: "Wanjiku Kamau",
  email: "wanjiku@example.co.ke",
  phone_number: "+254712000000",
  role: "customer",
  account_status: "active",
  email_verified: true,
  last_login: null,
  created_at: "2026-01-01T00:00:00Z",
};

function envelope<T>(data: T, message = "OK") {
  return { success: true, message, data };
}

function errorEnvelope(status: number, message: string, errors: Record<string, string[]> = {}) {
  return HttpResponse.json(
    { success: false, code: "ERROR", message, errors, timestamp: new Date().toISOString() },
    { status },
  );
}

export const handlers = [
  http.post(`${API}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as Record<string, string>;
    if (body.email === "taken@example.co.ke") {
      return errorEnvelope(400, "Validation failed.", {
        email: ["An account with this email already exists."],
      });
    }
    return HttpResponse.json(
      envelope(
        {
          ...testUser,
          email: body.email,
          first_name: body.first_name,
          last_name: body.last_name,
          email_verified: false,
        },
        "Account created. Please check your email to verify your address.",
      ),
      { status: 201 },
    );
  }),

  http.post(`${API}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.email !== testUser.email || body.password !== "correct-password") {
      return errorEnvelope(401, "No active account found with the given credentials");
    }
    return HttpResponse.json(
      envelope(
        { access: "access-token-1", refresh: "refresh-token-1", user: testUser },
        "Login successful.",
      ),
    );
  }),

  http.post(`${API}/auth/refresh`, async ({ request }) => {
    const body = (await request.json()) as { refresh: string };
    if (body.refresh !== "refresh-token-1" && body.refresh !== "refresh-token-2") {
      return errorEnvelope(401, "Token is invalid or expired");
    }
    return HttpResponse.json(
      envelope({ access: "access-token-2", refresh: "refresh-token-2" }, "Token refreshed."),
    );
  }),

  http.post(`${API}/auth/logout`, () =>
    HttpResponse.json(envelope(null, "Logged out successfully.")),
  ),

  http.post(`${API}/auth/forgot-password`, () =>
    HttpResponse.json(envelope(null, "If that email is registered, a reset link has been sent.")),
  ),

  http.post(`${API}/auth/reset-password`, async ({ request }) => {
    const body = (await request.json()) as { uid: string; token: string };
    if (body.token !== "valid-token") {
      return errorEnvelope(400, "Validation failed.", {
        token: ["Invalid or expired reset link."],
      });
    }
    return HttpResponse.json(envelope(null, "Password has been reset. You can now log in."));
  }),

  http.post(`${API}/auth/verify-email`, async ({ request }) => {
    const body = (await request.json()) as { uid: string; token: string };
    if (body.token !== "valid-token") {
      return errorEnvelope(400, "Invalid or expired verification link.");
    }
    return HttpResponse.json(envelope(null, "Email verified successfully."));
  }),

  http.get(`${API}/users/me`, ({ request }) => {
    const auth = request.headers.get("Authorization");
    if (!auth || auth === "Bearer expired-token") {
      return errorEnvelope(401, "Given token not valid for any token type");
    }
    return HttpResponse.json(envelope(testUser, "Profile retrieved."));
  }),

  http.put(`${API}/users/me`, async ({ request }) => {
    const body = (await request.json()) as Partial<User>;
    return HttpResponse.json(envelope({ ...testUser, ...body }, "Profile updated."));
  }),

  http.put(`${API}/users/password`, async ({ request }) => {
    const body = (await request.json()) as { current_password: string };
    if (body.current_password !== "correct-password") {
      return errorEnvelope(400, "Validation failed.", {
        current_password: ["Current password is incorrect."],
      });
    }
    return HttpResponse.json(envelope(null, "Password changed successfully."));
  }),

  // AdminUserViewSet is a plain ModelViewSet — raw DRF payload, no envelope.
  http.get(`${API}/admin/users/`, () =>
    HttpResponse.json({ count: 1, next: null, previous: null, results: [testUser] }),
  ),

  // 243 fake records across 20/page, so pagination tests can exercise a real "next" page.
  http.get(`${API}/assets/`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    const pageSize = 20;
    const total = 243;
    const start = (page - 1) * pageSize;
    const results = Array.from(
      { length: Math.max(0, Math.min(pageSize, total - start)) },
      (_, i) => {
        const n = start + i + 1;
        return {
          id: `asset-${n}`,
          asset_number: `KNA-${n}`,
          title: `Archive record ${n}`,
          asset_type: "photograph",
          status: "published",
          visibility: "public",
          category: null,
          collection: null,
          tags: [],
          photographer: "Staff Photographer",
          publication_date: null,
          created_at: "2026-01-01T00:00:00Z",
          thumbnail: `https://example.com/${n}.jpg`,
          price: "1500.00",
          currency: "KES",
        };
      },
    );
    return HttpResponse.json(
      envelope(
        {
          count: total,
          next: start + pageSize < total ? `${API}/assets/?page=${page + 1}` : null,
          previous: page > 1 ? `${API}/assets/?page=${page - 1}` : null,
          results,
        },
        "Assets retrieved.",
      ),
    );
  }),
];
