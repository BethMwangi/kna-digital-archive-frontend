import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
} from "@tanstack/react-router";
import { Route as ForgotPasswordRoute } from "@/routes/auth.forgot";

/**
 * Mirrors login-flow.test.tsx's approach: render the real route component in
 * a minimal hand-built router tree (createFileRoute's output can't be reused
 * directly outside routeTree.gen.ts). /auth/reset is stubbed just enough to
 * observe the ?email= handoff from a successful submit — see auth.reset.tsx
 * for the real code-entry page.
 */
function renderForgotPasswordPage() {
  const rootRoute = createRootRoute();
  const forgotRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/auth/forgot",
    component: ForgotPasswordRoute.options.component,
  });
  const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/auth/login",
    component: () => <div>Sign in page</div>,
  });
  const resetRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/auth/reset",
    validateSearch: (search: Record<string, unknown>) => ({
      email: search.email as string | undefined,
    }),
    component: function ResetStub() {
      const { email } = resetRoute.useSearch();
      return <div>Reset page reached with email={email}</div>;
    },
  });
  const routeTree = rootRoute.addChildren([forgotRoute, loginRoute, resetRoute]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/auth/forgot"] }),
  });
  const queryClient = new QueryClient();

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );

  return router;
}

describe("ForgotPasswordPage", () => {
  it("sends a code and hands off to the reset page with the email prefilled", async () => {
    const user = userEvent.setup();
    const router = renderForgotPasswordPage();

    await user.type(await screen.findByLabelText("Email"), "wanjiku@example.co.ke");
    await user.click(screen.getByRole("button", { name: "Send code" }));

    await screen.findByText("Reset page reached with email=wanjiku@example.co.ke");
    expect(router.state.location.pathname).toBe("/auth/reset");
  });

  it("blocks submission client-side on an invalid email, without calling the API", async () => {
    const user = userEvent.setup();
    renderForgotPasswordPage();

    await user.type(await screen.findByLabelText("Email"), "not-an-email");
    await user.click(screen.getByRole("button", { name: "Send code" }));

    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
    expect(screen.queryByText(/Reset page reached/)).not.toBeInTheDocument();
  });
});
