import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/kna/site-shell";
import { EmptyState } from "@/components/kna/components";
import { formatKES } from "@/lib/mock-data";
import { useCart, useRemoveFromCart } from "@/hooks/use-cart";
import { RequireAuth } from "@/lib/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your cart — Urithi Digital Archive" }] }),
  component: () => (
    <RequireAuth>
      <CartPage />
    </RequireAuth>
  ),
});

function CartPage() {
  const { data: items, isPending, isError } = useCart();
  const removeItem = useRemoveFromCart();

  const subtotal = (items ?? []).reduce((s, i) => s + i.subtotal, 0);
  const vat = Math.round(subtotal * 0.16);
  const total = subtotal + vat;

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <p className="eyebrow">Step 1 of 2</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Your cart</h1>

        {isPending ? (
          <div className="mt-10 space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="mt-10">
            <EmptyState
              title="Couldn't load your cart"
              description="Something went wrong reaching the server. Try refreshing the page."
            />
          </div>
        ) : (items ?? []).length === 0 ? (
          <div className="mt-10">
            <EmptyState
              title="Your cart is empty"
              description="Browse the archive and license a record to see it here."
              action={
                <Button asChild variant="outline">
                  <Link to="/browse">Browse the archive</Link>
                </Button>
              }
            />
          </div>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
            <div className="border-t border-border">
              {items!.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[96px_1fr_auto] gap-4 border-b border-border py-6 sm:grid-cols-[128px_1fr_auto]"
                >
                  <Link
                    to="/asset/$slug"
                    params={{ slug: item.asset.id }}
                    className="block overflow-hidden bg-ink aspect-square"
                  >
                    <img
                      src={item.asset.thumbnail}
                      alt={item.asset.title}
                      className="bw h-full w-full object-cover"
                    />
                  </Link>
                  <div className="min-w-0">
                    <Link
                      to="/asset/$slug"
                      params={{ slug: item.asset.id }}
                      className="mt-1 block font-display text-lg leading-snug hover:underline"
                    >
                      {item.asset.title}
                    </Link>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{item.license.name}</Badge>
                    </div>
                    <button
                      onClick={() => removeItem.mutate(item.id)}
                      disabled={removeItem.isPending}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-flag-red disabled:opacity-50"
                    >
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  </div>
                  <p className="text-right font-medium tabular-nums">{formatKES(item.subtotal)}</p>
                </div>
              ))}
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="border border-border bg-paper-warm p-6">
                <p className="eyebrow">Order summary</p>
                <dl className="mt-4 space-y-2 text-sm">
                  <Row k="Subtotal" v={formatKES(subtotal)} />
                  <Row k="VAT (16%)" v={formatKES(vat)} />
                </dl>
                <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
                  <span className="font-display text-lg">Total</span>
                  <span className="font-display text-2xl tabular-nums">{formatKES(total)}</span>
                </div>
                <Button
                  className="mt-6 w-full rounded-none bg-flag-green text-paper hover:bg-flag-green/90"
                  size="lg"
                  asChild
                >
                  <Link to="/checkout">
                    Proceed to checkout <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Secure payment via eCitizen
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </SiteShell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <dt>{k}</dt>
      <dd className="tabular-nums text-foreground">{v}</dd>
    </div>
  );
}
