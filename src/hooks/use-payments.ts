import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import {
  getPayment,
  initiatePayment,
  listPayments,
  simulatePayment,
  type InitiatePaymentInput,
  type SimulatePaymentInput,
} from "@/lib/api/payments";
import { queryKeys } from "@/lib/api/query-keys";

const SETTLED_PAYMENT_STATUSES = new Set(["completed", "success", "failed"]);

export function isSettledPaymentStatus(status: string | undefined): boolean {
  return Boolean(status && SETTLED_PAYMENT_STATUSES.has(status));
}

const POLL_INTERVAL_MS = 4000;
// Matches the backend's own reconciliation sweep cadence (it re-checks
// stuck Pesaflow payments every ~3 min regardless of this page) — polling
// past that point buys nothing, the sweep or the receipt email will
// resolve it either way.
const POLL_TIMEOUT_MS = 150_000;

export function useInitiatePayment() {
  return useMutation({
    mutationFn: (input: InitiatePaymentInput) => initiatePayment(input),
  });
}

export function useSimulatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, input }: { paymentId: string; input: SimulatePaymentInput }) =>
      simulatePayment(paymentId, input),
    onSuccess: () => {
      // Success mints download entitlements and moves the order to paid.
      queryClient.invalidateQueries({ queryKey: queryKeys.downloads });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.list });
    },
  });
}

/**
 * Retry UI: pass an orderId to scope to that order's payment attempts.
 * Gated on orderId being present — without this, checkout.tsx's usage (only
 * meaningful once returning from a Pesaflow redirect) would otherwise fire
 * GET /payments/ on every mount of the checkout page, including while the
 * customer is still just creating an account, long before any payment
 * exists to check.
 */
export function usePayments(orderId?: string) {
  return useQuery({
    queryKey: queryKeys.payments.list(orderId),
    queryFn: () => listPayments(orderId),
    enabled: Boolean(orderId),
  });
}

/**
 * `poll: true` re-checks GET /payments/{id}/ every few seconds while the
 * payment is still pending/initiated, stopping once it settles. Each poll
 * also actively re-queries Pesaflow server-side (see checkout.tsx's confirm
 * effect) — it's a real status re-check, not just a passive read waiting on
 * the redirect. Gives up after POLL_TIMEOUT_MS; `pollTimedOut` lets the
 * caller show a "still processing" message instead of spinning forever.
 */
export function usePayment(id: string | undefined, options?: { poll?: boolean }) {
  const pollState = useRef<{ id: string; startedAt: number } | null>(null);

  const query = useQuery({
    queryKey: queryKeys.payments.detail(id ?? ""),
    queryFn: () => getPayment(id!),
    enabled: Boolean(id),
    refetchInterval: options?.poll
      ? (q) => {
          if (!id || isSettledPaymentStatus(q.state.data?.status)) return false;
          if (pollState.current?.id !== id) pollState.current = { id, startedAt: Date.now() };
          const startedAt = pollState.current.startedAt;
          return Date.now() - startedAt > POLL_TIMEOUT_MS ? false : POLL_INTERVAL_MS;
        }
      : false,
  });

  const activePoll = pollState.current?.id === id ? pollState.current : null;
  const pollTimedOut = Boolean(
    options?.poll &&
    activePoll &&
    !isSettledPaymentStatus(query.data?.status) &&
    Date.now() - activePoll.startedAt > POLL_TIMEOUT_MS,
  );

  return { ...query, pollTimedOut };
}
