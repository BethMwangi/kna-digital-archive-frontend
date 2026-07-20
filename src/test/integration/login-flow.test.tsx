import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { z } from "zod";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
  useSearch,
} from "@tanstack/react-router";
import { LoginPage } from "@/components/kna/login-page";
import * as tokenStore from "@/lib/auth/token-store";

/**
 * Renders the real LoginPage component inside a minimal router tree built
 * with the code-based createRoute API. We can't reuse auth.login.tsx's
 * exported `Route` directly here: createFileRoute's output is meant to be
 * consumed via the codegen'd routeTree.gen.ts, and wiring it into a
 * hand-built tree throws ("Duplicate routes found with id: __root__"). So we
 * mirror auth.login.tsx's own wrapper here: a same-path createRoute reads
 * the `redirect` search param and passes it into LoginPage as a prop, same
 * as the real route does.
 */
function LoginRouteTestWrapper() {
  const { redirect } = useSearch({ from: "/auth/login" });
  return <LoginPage redirect={redirect} />;
}

function renderLoginPage() {
  const rootRoute = createRootRoute();
  const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/auth/login",
    validateSearch: (search) => z.object({ redirect: z.string().optional() }).parse(search),
    component: LoginRouteTestWrapper,
  });
  const accountRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/account",
    component: () => <div>Account overview</div>,
  });
  const routeTree = rootRoute.addChildren([loginRoute, accountRoute]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/auth/login"] }),
  });
  const queryClient = new QueryClient();

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );

  return router;
}

describe("LoginPage", () => {
  beforeEach(() => {
    tokenStore.clearSession();
  });

  it("logs in with valid credentials, persists the session, and navigates to /account", async () => {
    const user = userEvent.setup();
    const router = renderLoginPage();

    await screen.findByRole("heading", { name: "Sign in" });
    await user.type(screen.getByLabelText("Email"), "wanjiku@example.co.ke");
    await user.type(screen.getByLabelText("Password"), "correct-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/account"));
    expect(tokenStore.getState().status).toBe("authenticated");
    expect(tokenStore.getRefreshToken()).toBe("refresh-token-1");
  });

  it("shows the server's error message on invalid credentials without navigating away", async () => {
    const user = userEvent.setup();
    const router = renderLoginPage();

    await user.type(await screen.findByLabelText("Email"), "wanjiku@example.co.ke");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByText("No active account found with the given credentials"),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/auth/login");
    expect(tokenStore.getState().status).not.toBe("authenticated");
  });

  it("blocks submission client-side when the password is empty, without calling the API", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(await screen.findByLabelText("Email"), "wanjiku@example.co.ke");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Password is required.")).toBeInTheDocument();
    expect(tokenStore.getState().status).not.toBe("authenticated");
  });
});
