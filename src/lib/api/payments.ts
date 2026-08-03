import { apiClient, toNumber } from "./client";
import type { PaymentOut } from "./types";

function fixPayment(payment: PaymentOut): PaymentOut {
  return {
    ...payment,
    amount: payment.amount === undefined ? undefined : toNumber(payment.amount),
  };
}

export interface BillingDetails {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  /** National ID/passport number — Pesaflow's iframe API requires this (clientIDNumber);
   *  the backend serializer accepts it blank but rejects the *request* when provider is
   *  "pesaflow" and it's missing (see InitiatePaymentSerializer.validate()). */
  id_number?: string;
}

export interface InitiatePaymentInput {
  order_id: string;
  /** "pesaflow" for real payments; "mock" for local dev/testing. */
  provider: "pesaflow" | "mock";
  /** Required for Pesaflow — forwarded to the gateway for the invoice. */
  billing?: BillingDetails;
}

/** POST /payments/initiate/ — creates a Payment; for Pesaflow returns `checkout_url` to redirect to. */
export async function initiatePayment(input: InitiatePaymentInput): Promise<PaymentOut> {
  const data = await apiClient.post<PaymentOut>("/payments/initiate/", input);
  return fixPayment(data);
}

export interface SimulatePaymentInput {
  outcome: "success" | "failure";
}

/**
 * POST /payments/{id}/simulate/ — mock-gateway-only "Pay Now" test button.
 * On success: order moves to paid, download entitlements are created, and a
 * receipt is emailed (see src/lib/api/downloads.ts, src/lib/api/orders.ts).
 */
export async function simulatePayment(
  paymentId: string,
  input: SimulatePaymentInput,
): Promise<PaymentOut> {
  const data = await apiClient.post<PaymentOut>(`/payments/${paymentId}/simulate/`, input);
  return fixPayment(data);
}

/** GET /payments/ — the current user's payment attempts; pass orderId to scope to one order (retry UI). */
export async function listPayments(orderId?: string): Promise<PaymentOut[]> {
  const qs = orderId ? `?order=${encodeURIComponent(orderId)}` : "";
  const data = await apiClient.get<{ results: PaymentOut[] } | PaymentOut[]>(`/payments/${qs}`);
  const payments = Array.isArray(data) ? data : data.results;
  return payments.map(fixPayment);
}

/** GET /payments/{id}/ — one payment's current status. */
export async function getPayment(id: string): Promise<PaymentOut> {
  const data = await apiClient.get<PaymentOut>(`/payments/${id}/`);
  return fixPayment(data);
}
