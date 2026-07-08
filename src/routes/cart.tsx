import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/kna/site-shell";
import { LicenseBadge } from "@/components/kna/components";
import { assets, formatKES } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your cart — KNA Digital Archive" }] }),
  component: CartPage,
});

const line = (i: number, license: "Editorial" | "Commercial" | "Educational", tier: string, price: number) => ({
  asset: assets[i], license, tier, price,
});
const cart = [
  line(0, "Editorial", "Print · 3000 × 2000", 4500),
  line(6, "Commercial", "Archive · 6000 × 4000", 12800),
  line(2, "Editorial", "Web · 1200 × 800", 1800),
];

function CartPage() {
  const subtotal = cart.reduce((s, l) => s + l.price, 0);
  const vat = Math.round(subtotal * 0.16);
  const total = subtotal + vat;
  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <p className="eyebrow">Step 1 of 2</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Your cart</h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="border-t border-border">
            {cart.map((l, i) => (
              <div key={i} className="grid grid-cols-[96px_1fr_auto] gap-4 border-b border-border py-6 sm:grid-cols-[128px_1fr_auto]">
                <Link to="/asset/$slug" params={{ slug: l.asset.slug }} className="watermark block overflow-hidden bg-ink aspect-square">
                  <img src={l.asset.image} alt={l.asset.title} className="bw h-full w-full object-cover" />
                </Link>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{l.asset.year} · {l.asset.category}</p>
                  <Link to="/asset/$slug" params={{ slug: l.asset.slug }} className="mt-1 block font-display text-lg leading-snug hover:underline">
                    {l.asset.title}
                  </Link>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <LicenseBadge type={l.license} />
                    <span className="text-xs text-muted-foreground">{l.tier}</span>
                  </div>
                  <button className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-flag-red">
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                </div>
                <p className="text-right font-medium tabular-nums">{formatKES(l.price)}</p>
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
              <Button className="mt-6 w-full rounded-none bg-ink text-paper hover:bg-ink/90" size="lg" asChild>
                <Link to="/checkout">Proceed to checkout <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">Secure payment via eCitizen · M-Pesa · Visa · Mastercard</p>
            </div>
          </aside>
        </div>
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
