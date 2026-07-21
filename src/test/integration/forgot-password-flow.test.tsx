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
 * directly outside routeTree.gen.ts).
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
  const routeTree = rootRoute.addChildren([forgotRoute, loginRoute]);
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
}

describe("ForgotPasswordPage", () => {
  it("sends a reset link and offers a resend button afterward, initially on cooldown", async () => {
    const user = userEvent.setup();
    renderForgotPasswordPage();

    await user.type(await screen.findByLabelText("Email"), "wanjiku@example.co.ke");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));

    await screen.findByText("Reset link sent");

    const resendButton = screen.getByRole("button", { name: /resend link in \d+s/i });
    expect(resendButton).toBeDisabled();
  });

  it("blocks submission client-side on an invalid email, without calling the API", async () => {
    const user = userEvent.setup();
    renderForgotPasswordPage();

    await user.type(await screen.findByLabelText("Email"), "not-an-email");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
    expect(screen.queryByText("Reset link sent")).not.toBeInTheDocument();
  });
});
