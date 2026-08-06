import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SiteShell } from "@/components/kna/site-shell";
import { LazyImage } from "@/components/kna/components";
import { formatKES } from "@/lib/mock-data";
import { useCart } from "@/hooks/use-cart";
import { useInitiatePayment, usePayments, useSimulatePayment } from "@/hooks/use-payments";
import { checkout } from "@/lib/api/orders";
import { normalizeKenyanPhone } from "@/components/kna/phone-field";
import type { OrderOut, PaymentOut } from "@/lib/api/types";
import { queryKeys } from "@/lib/api/query-keys";
import { useAuth } from "@/lib/auth/use-auth";
import { useLogin, useRegister } from "@/hooks/use-auth-mutations";
import { ApiError } from "@/lib/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { Check, Lock, XCircle, ExternalLink, Loader2 } from "lucide-react";

/**
 * DEV_MODE: set to true to use the mock provider instead of Pesaflow.
 * In production this should always be false.
 */
const USE_MOCK_PROVIDER = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_PAYMENTS === "true";

export const Route = createFileRoute("/checkout")({
  validateSearch: (search: Record<string, unknown>) => ({
    payment: (search.payment as string) || undefined,
    order: (search.order as string) || undefined,
  }),
  head: () => ({ meta: [{ title: "Checkout — Urithi Digital Archive" }] }),
  component: CheckoutPage,
});

interface BillingDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  /** National ID/passport number — required by Pesaflow's iframe API (clientIDNumber). */
  idNumber: string;
  /** Only collected/used for guests — becomes their account password (see handleCheckout). */
  password: string;
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
  idNumber: "",
  password: "",
  organisation: "",
  address: "",
  city: "",
  postalCode: "",
};

function CheckoutPage() {
  const searchParams = useSearch({ from: "/checkout" });
  const [order, setOrder] = useState<OrderOut | null>(null);
  const [payment, setPayment] = useState<PaymentOut | null>(null);
  const [paid, setPaid] = useState(false);
  const [showIframe, setShowIframe] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [billing, setBilling] = useState<BillingDetails>(() => ({
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone_number || "",
    idNumber: "",
    password: "",
    organisation: "",
    address: "",
    city: "",
    postalCode: "",
  }));
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [accountExistsError, setAccountExistsError] = useState(false);
  const { data: cart, isPending } = useCart();
  const items = cart?.items ?? [];
  const queryClient = useQueryClient();

  const placeOrder = useMutation({
    mutationFn: () => checkout(),
    onError: () => toast.error("Couldn't complete checkout. Please try again."),
  });
  const initiate = useInitiatePayment();
  const simulate = useSimulatePayment();
  const register = useRegister();
  const login = useLogin();

  // Pesaflow's success/fail redirect lands here *inside* our own iframe —
  // browsers won't let the parent read a cross-origin iframe's location,
  // but by the time the redirect fires we're same-origin, so this is safe:
  // break out to the full top-level window instead of rendering the result
  // page trapped in the 600px embedded box.
  useEffect(() => {
    if (window.top && window.top !== window.self) {
      window.top.location.href = window.location.href;
    }
  }, []);

  // Handle Pesaflow return redirects (success/failure query params). The
  // query param alone isn't proof of payment — it's just a URL, trivially
  // guessable/bookmarkable — so this confirms against our own backend
  // (updated independently by Pesaflow's IPN callback) with a single fetch,
  // not polling. If that confirmation is inconclusive (e.g. still settling),
  // it falls back to trusting the redirect rather than leaving the customer
  // stuck on a spinner after they've actually paid.
  const { data: returnPayments, isFetched: confirmFetched } = usePayments(
    searchParams.payment ? searchParams.order : undefined,
  );

  useEffect(() => {
    if (!searchParams.payment || !confirmFetched) return;
    const latest = returnPayments
      ?.slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    const status = latest?.status ?? searchParams.payment;

    if (status === "completed" || status === "success") {
      setPaid(true);
      queryClient.invalidateQueries({ queryKey: queryKeys.downloads });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.list });
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    } else if (status === "failed") {
      toast.error(
        latest?.error
          ? `Payment gateway error: ${latest.error}`
          : "Payment was not completed. You can try again.",
      );
    }
  }, [searchParams.payment, confirmFetched, returnPayments, queryClient]);

  // Pesaflow's iframe API requires clientIDNumber (billing.id_number below) —
  // the mock provider never touches Pesaflow, so it's the only exemption.
  const provider: "mock" | "pesaflow" = USE_MOCK_PROVIDER ? "mock" : "pesaflow";

  function buildBillingPayload() {
    return {
      first_name: billing.firstName,
      last_name: billing.lastName,
      email: billing.email,
      // Re-normalized here (not just at input time) because billing.phone can
      // still be a pre-existing malformed value pulled straight from the
      // user's stored profile (e.g. "+2540727029973") — Pesaflow's
      // clientMSISDN 422s on anything but a clean 254 + 9-digit shape.
      phone: normalizeKenyanPhone(billing.phone),
      id_number: billing.idNumber,
    };
  }

  // Even when Pesaflow rejects the payment, POST /payments/initiate/ still
  // returns 201 — the failure shows up as payment.status === "failed" (with
  // payment.error as the human-readable reason), not as a 4xx/5xx. Branching
  // on HTTP success alone would misread a failed payment as a success and
  // try to embed an empty checkout_url, so this checks status first.
  function handlePaymentResult(p: PaymentOut) {
    setPayment(p);
    if (provider === "pesaflow" && p.checkout_url) {
      setShowIframe(true);
    } else if (provider === "pesaflow" && p.status === "failed") {
      toast.error(p.error ? `Payment gateway error: ${p.error}` : "Payment could not be started.");
    }
  }

  function proceedToOrder() {
    placeOrder.mutate(undefined, {
      onSuccess: (created) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.cart });
        setOrder(created);

        initiate.mutate(
          {
            order_id: created.id,
            provider,
            ...(provider === "pesaflow" ? { billing: buildBillingPayload() } : {}),
          },
          {
            onSuccess: handlePaymentResult,
            onError: () =>
              toast.error("Order placed, but starting payment failed. Try again below."),
          },
        );
      },
    });
  }

  const handleCheckout = () => {
    setAccountExistsError(false);
    if (!billing.firstName.trim() || !billing.lastName.trim()) {
      toast.error("Please enter your first and last name.");
      return;
    }
    if (!billing.email.trim() || !billing.email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!isAuthenticated && billing.password.length < 8) {
      toast.error("Please create a password (at least 8 characters) for your account.");
      return;
    }
    if (!/^\+254\d{9}$/.test(normalizeKenyanPhone(billing.phone))) {
      toast.error("Please enter a valid Kenyan phone number, e.g. 0712 345 678.");
      return;
    }
    if (provider === "pesaflow" && !billing.idNumber.trim()) {
      toast.error("Please enter your national ID or passport number.");
      return;
    }
    if (!agreedToTerms) {
      setTermsError(true);
      toast.error("Please agree to the licensing terms to continue.");
      return;
    }

    if (isAuthenticated) {
      proceedToOrder();
      return;
    }

    // No account yet — create one from the billing details they're already
    // filling in to pay, rather than gating checkout behind a separate
    // sign-up step. register() doesn't return tokens, so login() runs right
    // after with the same credentials; its own onSuccess replays the guest
    // cart into the new server-side cart (see merge-guest-cart.ts) before
    // proceedToOrder ever runs, so nothing here has to wait on that itself.
    register.mutate(
      {
        first_name: billing.firstName,
        last_name: billing.lastName,
        email: billing.email,
        phone_number: normalizeKenyanPhone(billing.phone),
        password: billing.password,
        password_confirm: billing.password,
      },
      {
        onSuccess: () => {
          login.mutate(
            { email: billing.email, password: billing.password },
            {
              onSuccess: proceedToOrder,
              onError: () =>
                toast.error(
                  "Account created, but signing you in failed. Please try signing in manually.",
                ),
            },
          );
        },
        onError: (error) => {
          if (error instanceof ApiError && error.fieldErrors().email) {
            setAccountExistsError(true);
            toast.error("That email already has an account — sign in to continue.");
            return;
          }
          toast.error("Couldn't create your account. Please check your details and try again.");
        },
      },
    );
  };

  const handleRetryPayment = () => {
    if (!order) return;
    if (provider === "pesaflow" && !billing.idNumber.trim()) {
      toast.error("Please enter your national ID or passport number.");
      return;
    }
    initiate.mutate(
      {
        order_id: order.id,
        provider,
        ...(provider === "pesaflow" ? { billing: buildBillingPayload() } : {}),
      },
      {
        onSuccess: handlePaymentResult,
        onError: () => toast.error("Couldn't reach the payment gateway. Try again."),
      },
    );
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

  // Show success screen once confirmed (either via mock simulate, in-page
  // Pesaflow status, or a confirmed Pesaflow redirect)
  if (paid) {
    return <SuccessScreen order={order} orderNumber={searchParams.order} />;
  }

  // Returned from Pesaflow — confirming against our own backend before
  // showing anything, so we don't flash the billing form while that
  // one-shot check is in flight (see the confirm effect above).
  if (searchParams.payment && !confirmFetched) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-md px-4 py-24 md:px-8">
          <div className="border border-border bg-paper-warm p-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-4 font-display text-xl">Confirming your payment…</p>
          </div>
        </div>
      </SiteShell>
    );
  }

  // Pesaflow's hosted checkout, embedded — the redirect useEffect above
  // handles detecting completion, not this component watching the iframe.
  if (showIframe && order && payment?.checkout_url) {
    return (
      <PesaflowIframeStep
        order={order}
        checkoutUrl={payment.checkout_url}
        onCancel={() => setShowIframe(false)}
      />
    );
  }

  // Show mock payment step (dev only)
  if (order && USE_MOCK_PROVIDER) {
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

  // Show payment pending/failed state for Pesaflow (after returning from failed payment)
  if (order && payment) {
    return (
      <PesaflowPendingStep
        order={order}
        payment={payment}
        isRetrying={initiate.isPending}
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
                      <LazyImage
                        src={item.asset.thumbnail}
                        alt=""
                        containerClassName="h-16 w-20 shrink-0"
                        className="bw"
                      />
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

            {/* Payment method */}
            <section>
              <SectionTitle n="02" title="Payment method" />
              <div className="mt-4 flex items-center gap-3 border border-ink bg-background p-4 ring-1 ring-ink">
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg">
                    {USE_MOCK_PROVIDER ? "Mock Gateway" : "Pesaflow"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {USE_MOCK_PROVIDER
                      ? "Development testing mode"
                      : "M-Pesa, Visa, Mastercard & bank transfer"}
                  </p>
                </div>
                <div className="grid h-8 w-14 place-items-center border border-border bg-paper-warm text-[0.6rem] font-semibold uppercase tracking-widest text-muted-foreground">
                  {USE_MOCK_PROVIDER ? "DEV" : <ExternalLink className="h-3.5 w-3.5" />}
                </div>
              </div>
              {!USE_MOCK_PROVIDER && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Pesaflow's secure checkout page opens here on this page to complete payment.
                </p>
              )}
            </section>

            {/* Billing */}
            <section>
              <SectionTitle n="03" title={isAuthenticated ? "Billing details" : "Your details"} />
              {!isAuthenticated && (
                <p className="mt-2 text-xs text-muted-foreground">
                  No account needed to browse or check out — this also sets up your account, so your
                  receipt and downloads are waiting for you afterward.
                </p>
              )}
              {accountExistsError && (
                <div className="mt-4 border border-destructive bg-destructive/5 p-4 text-sm">
                  That email already has an account.{" "}
                  <Link
                    to="/auth/login"
                    search={{ redirect: "/checkout" } as never}
                    className="underline underline-offset-4"
                  >
                    Sign in
                  </Link>{" "}
                  to continue — your cart will still be here.
                </div>
              )}
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
                {!isAuthenticated && (
                  <Field
                    label="Create a password"
                    type="password"
                    required
                    value={billing.password}
                    onChange={(e) => setBilling((b) => ({ ...b, password: e.target.value }))}
                  />
                )}
                <Field
                  label="Phone"
                  required
                  value={billing.phone}
                  onChange={(e) => setBilling((b) => ({ ...b, phone: e.target.value }))}
                />
                <Field
                  label="National ID / passport"
                  required={!USE_MOCK_PROVIDER}
                  className="sm:col-span-2"
                  value={billing.idNumber}
                  onChange={(e) => setBilling((b) => ({ ...b, idNumber: e.target.value }))}
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

              <div
                className={`mt-6 flex items-start gap-3 border bg-paper-warm p-4 ${
                  termsError && !agreedToTerms ? "border-destructive" : "border-border"
                }`}
              >
                <Checkbox
                  id="terms"
                  className="mt-0.5"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => {
                    setAgreedToTerms(Boolean(checked));
                    if (checked) setTermsError(false);
                  }}
                />
                <Label htmlFor="terms" className="text-xs leading-relaxed text-muted-foreground">
                  I agree to the Urithi <a className="underline">Licensing Terms</a> and confirm I
                  have read the usage rights for each selected license type. Records are
                  non-transferable and use outside declared license scope is prohibited.
                  <span className="text-destructive"> *</span>
                </Label>
              </div>
              {termsError && !agreedToTerms && (
                <p className="mt-2 text-xs text-destructive">
                  You must agree to the licensing terms before paying.
                </p>
              )}
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
                disabled={
                  placeOrder.isPending ||
                  initiate.isPending ||
                  register.isPending ||
                  login.isPending ||
                  items.length === 0
                }
              >
                <Lock className="mr-2 h-4 w-4" />
                {register.isPending
                  ? "Creating your account…"
                  : login.isPending
                    ? "Signing you in…"
                    : placeOrder.isPending || initiate.isPending
                      ? "Processing…"
                      : `Pay ${formatKES(cart?.total ?? 0)}`}
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {USE_MOCK_PROVIDER
                  ? "Mock payment — development mode"
                  : "Secured by Pesaflow · TLS 1.3 encrypted"}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </SiteShell>
  );
}

/**
 * Pesaflow's hosted checkout page, embedded in an iframe (per the backend's
 * PesaflowGateway.create_invoice — format="iframe" returns working checkout
 * HTML directly). The customer picks a payment method, triggers an STK
 * push, pays, and Pesaflow eventually redirects *inside this iframe* to
 * callBackURLOnSuccess — our own /checkout route, which busts out to the
 * top-level window and confirms the real status there (see the two
 * useEffects in CheckoutPage). Nothing here watches the iframe directly.
 */
function PesaflowIframeStep({
  order,
  checkoutUrl,
  onCancel,
}: {
  order: OrderOut;
  checkoutUrl: string;
  onCancel: () => void;
}) {
  return (
    <SiteShell>
      <div className="mx-auto max-w-2xl px-4 py-12 md:px-8">
        <div className="flex items-center justify-between border border-border bg-paper-warm p-4">
          <div>
            <p className="text-sm font-medium">Order {order.order_number}</p>
            <p className="text-xs text-muted-foreground">{formatKES(order.total)}</p>
          </div>
        </div>
        <div className="mt-4 border border-border">
          <iframe
            src={checkoutUrl}
            title="Pesaflow secure checkout"
            width="100%"
            height={600}
            className="block w-full"
          />
        </div>
        <button
          onClick={onCancel}
          className="mt-4 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Cancel and edit billing details
        </button>
      </div>
    </SiteShell>
  );
}

/**
 * Pesaflow payment pending/retry step: shown when the user returns from
 * Pesaflow after a failed or abandoned payment. Offers a retry button.
 */
function PesaflowPendingStep({
  order,
  payment,
  isRetrying,
  onRetry,
}: {
  order: OrderOut;
  payment: PaymentOut;
  isRetrying: boolean;
  onRetry: () => void;
}) {
  const isFailed = payment.status === "failed";
  return (
    <SiteShell>
      <div className="mx-auto max-w-md px-4 py-24 md:px-8">
        <div className="border border-border bg-paper-warm p-8 text-center">
          {isFailed ? (
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
              <XCircle className="h-6 w-6" />
            </div>
          ) : (
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          )}
          <p className="mt-4 font-display text-2xl">
            {isFailed ? "Payment unsuccessful" : "Payment pending"}
          </p>
          <p className="mt-3 font-display text-3xl tabular-nums">{formatKES(order.total)}</p>
          <p className="mt-2 text-sm text-muted-foreground">Order {order.order_number}</p>
          {isFailed && (
            <p className="mt-3 text-sm text-muted-foreground">
              No charge was made. Your order is still open — you can try again.
            </p>
          )}
          <div className="mt-8 space-y-2">
            <Button
              className="w-full rounded-none bg-flag-green text-paper hover:bg-flag-green/90"
              size="lg"
              onClick={onRetry}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting payment…
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {isFailed ? "Try again" : "Complete payment"}
                </>
              )}
            </Button>
            <Button className="w-full rounded-none" variant="outline" size="lg" asChild>
              <Link to="/browse">Continue browsing</Link>
            </Button>
          </div>
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

function SuccessScreen({ order, orderNumber }: { order: OrderOut | null; orderNumber?: string }) {
  const displayOrderNumber = order?.order_number || orderNumber || "—";
  const displayTotal = order ? formatKES(order.total) : null;

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
          <p className="mt-1 font-display text-2xl">{displayOrderNumber}</p>
          {displayTotal && (
            <p className="mt-3 text-sm text-muted-foreground">
              Total paid <span className="tabular-nums text-foreground">{displayTotal}</span>
            </p>
          )}
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
