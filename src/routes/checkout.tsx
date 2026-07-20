import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/kna/site-shell";
import { formatKES } from "@/lib/mock-data";
import { useCart, useCartStore } from "@/hooks/use-cart";
import { RequireAuth } from "@/lib/auth/protected-route";
import { syncCart } from "@/lib/api/cart";
import { apiClient } from "@/lib/api/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Check, Lock, Loader2 } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Urithi Digital Archive" }] }),
  component: () => (
    <RequireAuth>
      <CheckoutPage />
    </RequireAuth>
  ),
});

function CheckoutPage() {
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const clearCart = useCartStore((s) => s.clearCart);
  const { data: items, isPending } = useCart();
  const subtotal = (items ?? []).reduce((s, i) => s + i.subtotal, 0);
  const vat = Math.round(subtotal * 0.16);
  const total = subtotal + vat;

  const handleCheckout = async () => {
    if (!items || items.length === 0) return;
    setIsSubmitting(true);
    try {
      await syncCart(items.map((i) => ({ asset_id: i.asset.id, license_id: i.license.id })));
      await apiClient.post("/orders/checkout/", { notes: "" });
      clearCart();
      setDone(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to checkout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (done) return <SuccessScreen total={total} />;

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <p className="eyebrow">Step 2 of 2</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Checkout</h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]">
          <div className="space-y-10">
            {/* Order review */}
            <section>
              <SectionTitle n="01" title="Order review" />
              <div className="mt-4 border border-border">
                {isPending ? (
                  <div className="space-y-2 p-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : (
                  (items ?? []).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 border-b border-border p-4 last:border-b-0"
                    >
                      <div className="h-16 w-20 shrink-0 overflow-hidden bg-ink">
                        <img
                          src={item.asset.thumbnail}
                          alt=""
                          className="bw h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-medium">{item.asset.title}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="outline">{item.license.name}</Badge>
                        </div>
                      </div>
                      <p className="tabular-nums text-sm">{formatKES(item.subtotal)}</p>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Payment */}
            <section>
              <SectionTitle n="02" title="Payment method" />
              <div className="mt-4 flex items-center gap-3 border border-ink bg-background p-4 ring-1 ring-ink">
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg">eCitizen</p>
                  <p className="text-xs text-muted-foreground">Government payment portal</p>
                </div>
                <div className="h-8 w-14 border border-border bg-paper-warm grid place-items-center text-[0.6rem] font-semibold uppercase tracking-widest text-muted-foreground">
                  Logo
                </div>
              </div>
            </section>

            {/* Billing */}
            <section>
              <SectionTitle n="03" title="Billing details" />
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="First name" defaultValue="Wanjiku" />
                <Field label="Last name" defaultValue="Kamau" />
                <Field label="Email" type="email" defaultValue="wanjiku@example.co.ke" />
                <Field label="Phone" defaultValue="+254 712 000 000" />
                <Field
                  label="Organisation (optional)"
                  defaultValue="Nation Media Group"
                  className="sm:col-span-2"
                />
                <Field
                  label="Address"
                  defaultValue="P.O. Box 49010, Nairobi"
                  className="sm:col-span-2"
                />
                <Field label="City" defaultValue="Nairobi" />
                <Field label="Postal code" defaultValue="00100" />
              </div>

              <div className="mt-6 flex items-start gap-3 border border-border bg-paper-warm p-4">
                <Checkbox id="terms" className="mt-0.5" />
                <Label htmlFor="terms" className="text-xs leading-relaxed text-muted-foreground">
                  I agree to the Urithi <a className="underline">Licensing Terms</a> and confirm I
                  have read the usage rights for each selected license type. Records are
                  non-transferable and use outside declared license scope is prohibited.
                </Label>
              </div>
            </section>
          </div>

          {/* Sticky total */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="border border-border bg-paper-warm p-6">
              <p className="eyebrow">Total due</p>
              <p className="mt-2 font-display text-4xl tabular-nums">{formatKES(total)}</p>
              <dl className="mt-4 space-y-2 text-sm">
                <Row k="Subtotal" v={formatKES(subtotal)} />
                <Row k="VAT (16%)" v={formatKES(vat)} />
                <Row k="Records" v={String((items ?? []).length)} />
              </dl>
              <Button
                className="mt-6 w-full rounded-none bg-flag-green text-paper hover:bg-flag-green/90"
                size="lg"
                onClick={handleCheckout}
                disabled={isSubmitting || !items?.length}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />} Pay {formatKES(total)}
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Secured with TLS 1.3 · PCI DSS compliant
              </p>
            </div>
          </aside>
        </div>
      </div>
    </SiteShell>
  );
}

function SuccessScreen({ total }: { total: number }) {
  return (
    <SiteShell>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center md:px-8">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[oklch(0.55_0.14_150)]/10 text-[oklch(0.35_0.14_150)]">
          <Check className="h-6 w-6" />
        </div>
        <p className="eyebrow mt-6">Payment received</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">Thank you.</h1>
        <p className="mt-4 text-muted-foreground">
          Your order has been recorded and your downloads are ready.
        </p>
        <div className="mt-8 inline-block border border-border bg-paper-warm px-8 py-6 text-left">
          <p className="eyebrow">Order number</p>
          <p className="mt-1 font-display text-2xl">Urithi-2024-00913</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Total paid <span className="tabular-nums text-foreground">{formatKES(total)}</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Receipt sent to wanjiku@example.co.ke
          </p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="rounded-none bg-ink text-paper hover:bg-ink/90">
            <Link to="/account/downloads">Go to downloads</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/browse">Continue browsing</Link>
          </Button>
        </div>
      </div>
    </SiteShell>
  );
}

function SectionTitle({ n, title }: { n: string; title: string }) {
  return (
    <div className="flex items-baseline gap-4 border-b border-border pb-2">
      <span className="font-display text-2xl text-muted-foreground">{n}</span>
      <h2 className="font-display text-2xl">{title}</h2>
    </div>
  );
}
function Field({
  label,
  className,
  ...rest
}: React.ComponentProps<typeof Input> & { label: string }) {
  const id = `f-${label}`;
  return (
    <div className={className}>
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <Input id={id} {...rest} className="mt-1.5" />
    </div>
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
