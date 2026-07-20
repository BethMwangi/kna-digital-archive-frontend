import { useQuery } from "@tanstack/react-query";
import { getOrder, listOrders } from "@/lib/api/orders";
import { queryKeys } from "@/lib/api/query-keys";

export function useOrders() {
  return useQuery({ queryKey: queryKeys.orders.list, queryFn: listOrders });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id ?? ""),
    queryFn: () => getOrder(id!),
    enabled: Boolean(id),
  });
}
