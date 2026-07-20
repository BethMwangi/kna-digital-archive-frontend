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
import { BrowsePage } from "@/components/kna/browse-page";

/**
 * BrowsePage renders the full SiteShell (header/footer), so every path its
 * <Link>s reference needs a real route registered here or TanStack Router
 * can't build the href.
 */
function renderBrowsePage() {
  const rootRoute = createRootRoute();
  const stub = (path: string) =>
    createRoute({ getParentRoute: () => rootRoute, path, component: () => null });
  const browseRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/browse",
    component: BrowsePage,
  });
  const routeTree = rootRoute.addChildren([
    browseRoute,
    stub("/"),
    stub("/cart"),
    stub("/account"),
    stub("/auth/login"),
    createRoute({ getParentRoute: () => rootRoute, path: "/asset/$slug", component: () => null }),
  ]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/browse"] }),
  });
  // Disable retries so a flaky/slow response fails fast instead of retrying
  // through vitest's default timeout — the app itself keeps retries on.
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );

  return router;
}

describe("BrowsePage pagination", () => {
  it("fetches the next page from the server when Next is clicked", async () => {
    const user = userEvent.setup();
    renderBrowsePage();

    await screen.findByText("Archive record 1");
    expect(screen.getByText(/Showing 1–20 of 243/)).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: /go to next page/i }));

    await screen.findByText("Archive record 21");
    expect(screen.getByText(/Showing 21–40 of 243/)).toBeInTheDocument();
    expect(screen.queryByText("Archive record 1")).not.toBeInTheDocument();
  });

  it("disables Previous on the first page and re-enables it after Next", async () => {
    const user = userEvent.setup();
    renderBrowsePage();

    await screen.findByText("Archive record 1");
    expect(screen.getByRole("link", { name: /go to previous page/i })).toHaveAttribute(
      "aria-disabled",
      "true",
    );

    await user.click(screen.getByRole("link", { name: /go to next page/i }));
    await screen.findByText("Archive record 21");

    expect(screen.getByRole("link", { name: /go to previous page/i })).toHaveAttribute(
      "aria-disabled",
      "false",
    );
  });
});
