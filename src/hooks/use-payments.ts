import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPayment,
  initiatePayment,
  listPayments,
  simulatePayment,
  type InitiatePaymentInput,
  type SimulatePaymentInput,
} from "@/lib/api/payments";
import { queryKeys } from "@/lib/api/query-keys";

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

/** Retry UI: pass an orderId to scope to that order's payment attempts. */
export function usePayments(orderId?: string) {
  return useQuery({
    queryKey: queryKeys.payments.list(orderId),
    queryFn: () => listPayments(orderId),
  });
}

export function usePayment(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.payments.detail(id ?? ""),
    queryFn: () => getPayment(id!),
    enabled: Boolean(id),
  });
}
