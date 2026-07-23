import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
  redirect,
} from "@tanstack/react-router";
import { z } from "zod";

/**
 * Regression test for the "resend link → page not found" bug: the backend's
 * emails used to link to /reset-password and /verify-email, but the real
 * pages live at /auth/reset and /auth/verify. reset-password.tsx and
 * verify-email.tsx bridge that with a beforeLoad redirect — mirrored here
 * rather than imported, since createFileRoute's output is typed against the
 * full app's router context and can't drop into a standalone test tree (see
 * login-flow.test.tsx's comment for the same constraint).
 *
 * Password reset is still uid/token link-based; email verification moved to
 * a 6-digit code entered on the page (see auth.verify.tsx), so /verify-email
 * only has an `email` param worth preserving now.
 */
const resetSearchSchema = z.object({
  uid: z.string().optional(),
  token: z.string().optional(),
});
const verifySearchSchema = z.object({
  email: z.string().optional(),
});

function renderRedirectFrom(initialPath: string) {
  const rootRoute = createRootRoute();

  const resetPasswordRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/reset-password",
    validateSearch: (search) => resetSearchSchema.parse(search),
    beforeLoad: ({ search }) => {
      throw redirect({ to: "/auth/reset", search });
    },
  });
  const verifyEmailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/verify-email",
    validateSearch: (search) => verifySearchSchema.parse(search),
    beforeLoad: ({ search }) => {
      throw redirect({ to: "/auth/verify", search });
    },
  });
  const authResetRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/auth/reset",
    validateSearch: (search) => resetSearchSchema.parse(search),
    component: function AuthReset() {
      const { uid, token } = authResetRoute.useSearch();
      return (
        <div>
          Reset page reached with uid={uid} token={token}
        </div>
      );
    },
  });
  const authVerifyRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/auth/verify",
    validateSearch: (search) => verifySearchSchema.parse(search),
    component: function AuthVerify() {
      const { email } = authVerifyRoute.useSearch();
      return <div>Verify page reached with email={email}</div>;
    },
  });

  const routeTree = rootRoute.addChildren([
    resetPasswordRoute,
    verifyEmailRoute,
    authResetRoute,
    authVerifyRoute,
  ]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
  const queryClient = new QueryClient();

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );

  return router;
}

describe("email link path redirects", () => {
  it("redirects /reset-password?uid&token to /auth/reset, preserving both params", async () => {
    const router = renderRedirectFrom("/reset-password?uid=u-123&token=t-456");

    await screen.findByText("Reset page reached with uid=u-123 token=t-456");
    expect(router.state.location.pathname).toBe("/auth/reset");
  });

  it("redirects /verify-email?email to /auth/verify, preserving the param", async () => {
    const router = renderRedirectFrom("/verify-email?email=wanjiku%40example.co.ke");

    await screen.findByText("Verify page reached with email=wanjiku@example.co.ke");
    expect(router.state.location.pathname).toBe("/auth/verify");
  });
});
