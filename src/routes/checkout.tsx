import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SiteShell } from "@/components/kna/site-shell";
import { formatKES } from "@/lib/mock-data";
import { useCart } from "@/hooks/use-cart";
import { useInitiatePayment, useSimulatePayment } from "@/hooks/use-payments";
import { checkout } from "@/lib/api/orders";
import type { OrderOut, PaymentOut } from "@/lib/api/types";
import { queryKeys } from "@/lib/api/query-keys";
import { RequireAuth } from "@/lib/auth/protected-route";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Check, Lock, XCircle } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Urithi Digital Archive" }] }),
  component: () => (
    <RequireAuth>
      <CheckoutPage />
    </RequireAuth>
  ),
});

interface BillingDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organisation: string;
  address: string;
  city: string;
  postalCode: string;
}

const EMPTY_BILLING: BillingDetails = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  organisation: "",
  address: "",
  city: "",
  postalCode: "",
};

function CheckoutPage() {
  const [order, setOrder] = useState<OrderOut | null>(null);
  const [payment, setPayment] = useState<PaymentOut | null>(null);
  const [paid, setPaid] = useState(false);
  const [billing, setBilling] = useState<BillingDetails>(EMPTY_BILLING);
  const { data: cart, isPending } = useCart();
  const items = cart?.items ?? [];
  const queryClient = useQueryClient();

  const placeOrder = useMutation({
    mutationFn: () => checkout(),
    onError: () => toast.error("Couldn't complete checkout. Please try again."),
  });
  const initiate = useInitiatePayment();
  const simulate = useSimulatePayment();

  const handleCheckout = () => {
    if (!billing.firstName.trim() || !billing.lastName.trim()) {
      toast.error("Please enter your first and last name.");
      return;
    }
    if (!billing.email.trim() || !billing.email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!billing.phone.trim()) {
      toast.error("Please enter a phone number.");
      return;
    }

    placeOrder.mutate(undefined, {
      onSuccess: (created) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.cart });
        setOrder(created);
        initiate.mutate(
          { order_id: created.id, provider: "mock" },
          {
            onSuccess: (p) => setPayment(p),
            onError: () =>
              toast.error("Order placed, but starting payment failed. Try again below."),
          },
        );
      },
    });
  };

  const handleRetryPayment = () => {
    if (!order) return;
    initiate.mutate({ order_id: order.id, provider: "mock" }, { onSuccess: (p) => setPayment(p) });
  };

  const handleSimulate = (outcome: "success" | "failure") => {
    if (!payment) return;
    simulate.mutate(
      { paymentId: payment.id, input: { outcome } },
      {
        onSuccess: (updated) => {
          setPayment(updated);
          if (outcome === "success") setPaid(true);
          else toast.error("Payment failed. You can try again below.");
        },
        onError: () => toast.error("Couldn't reach the payment gateway. Try again."),
      },
    );
  };

  if (order && paid) return <SuccessScreen order={order} />;
  if (order) {
    return (
      <PaymentStep
        order={order}
        isInitiating={initiate.isPending}
        isSimulating={simulate.isPending}
        onSimulate={handleSimulate}
        onRetry={handleRetryPayment}
      />
    );
  }

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
                  items.map((item) => (
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
                <Field
                  label="First name"
                  required
                  value={billing.firstName}
                  onChange={(e) => setBilling((b) => ({ ...b, firstName: e.target.value }))}
                />
                <Field
                  label="Last name"
                  required
                  value={billing.lastName}
                  onChange={(e) => setBilling((b) => ({ ...b, lastName: e.target.value }))}
                />
                <Field
                  label="Email"
                  type="email"
                  required
                  value={billing.email}
                  onChange={(e) => setBilling((b) => ({ ...b, email: e.target.value }))}
                />
                <Field
                  label="Phone"
                  required
                  value={billing.phone}
                  onChange={(e) => setBilling((b) => ({ ...b, phone: e.target.value }))}
                />
                <Field
                  label="Organisation (optional)"
                  className="sm:col-span-2"
                  value={billing.organisation}
                  onChange={(e) => setBilling((b) => ({ ...b, organisation: e.target.value }))}
                />
                <Field
                  label="Address"
                  className="sm:col-span-2"
                  value={billing.address}
                  onChange={(e) => setBilling((b) => ({ ...b, address: e.target.value }))}
                />
                <Field
                  label="City"
                  value={billing.city}
                  onChange={(e) => setBilling((b) => ({ ...b, city: e.target.value }))}
                />
                <Field
                  label="Postal code"
                  value={billing.postalCode}
                  onChange={(e) => setBilling((b) => ({ ...b, postalCode: e.target.value }))}
                />
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
              <p className="mt-2 font-display text-4xl tabular-nums">
                {formatKES(cart?.total ?? 0)}
              </p>
              <dl className="mt-4 space-y-2 text-sm">
                <Row k="Records" v={String(cart?.item_count ?? items.length)} />
              </dl>
              <Button
                className="mt-6 w-full rounded-none bg-flag-green text-paper hover:bg-flag-green/90"
                size="lg"
                onClick={handleCheckout}
                disabled={placeOrder.isPending || initiate.isPending || items.length === 0}
              >
                <Lock className="mr-2 h-4 w-4" />
                {placeOrder.isPending || initiate.isPending
                  ? "Processing…"
                  : `Pay ${formatKES(cart?.total ?? 0)}`}
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

/**
 * Mock payment gateway step: order is created (pending) and a Payment has
 * been initiated — this stands in for redirecting to a real provider. The
 * two buttons call POST /payments/{id}/simulate/ directly, matching the
 * documented test sequence.
 */
function PaymentStep({
  order,
  isInitiating,
  isSimulating,
  onSimulate,
  onRetry,
}: {
  order: OrderOut;
  isInitiating: boolean;
  isSimulating: boolean;
  onSimulate: (outcome: "success" | "failure") => void;
  onRetry: () => void;
}) {
  return (
    <SiteShell>
      <div className="mx-auto max-w-md px-4 py-24 md:px-8">
        <div className="border border-border bg-paper-warm p-8 text-center">
          <p className="eyebrow">Mock payment gateway</p>
          <p className="mt-3 font-display text-3xl tabular-nums">{formatKES(order.total)}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Order {order.id} · this stands in for a real provider redirect.
          </p>

          {isInitiating ? (
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4 animate-pulse" /> Starting payment…
            </div>
          ) : (
            <div className="mt-8 space-y-2">
              <Button
                className="w-full rounded-none bg-flag-green text-paper hover:bg-flag-green/90"
                size="lg"
                onClick={() => onSimulate("success")}
                disabled={isSimulating}
              >
                {isSimulating ? "Processing…" : "Simulate successful payment"}
              </Button>
              <Button
                className="w-full rounded-none"
                variant="outline"
                size="lg"
                onClick={() => onSimulate("failure")}
                disabled={isSimulating}
              >
                <XCircle className="mr-2 h-4 w-4" /> Simulate failed payment
              </Button>
              <button
                onClick={onRetry}
                className="mt-2 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Start a new payment attempt
              </button>
            </div>
          )}
        </div>
      </div>
    </SiteShell>
  );
}

function SuccessScreen({ order }: { order: OrderOut }) {
  return (
    <SiteShell>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center md:px-8">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[oklch(0.55_0.14_150)]/10 text-[oklch(0.35_0.14_150)]">
          <Check className="h-6 w-6" />
        </div>
        <p className="eyebrow mt-6">Payment received</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">Thank you.</h1>
        <p className="mt-4 text-muted-foreground">
          Your downloads are ready, and a receipt is on its way to your email.
        </p>
        <div className="mt-8 inline-block border border-border bg-paper-warm px-8 py-6 text-left">
          <p className="eyebrow">Order number</p>
          <p className="mt-1 font-display text-2xl">{order.id}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Total paid{" "}
            <span className="tabular-nums text-foreground">{formatKES(order.total)}</span>
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
