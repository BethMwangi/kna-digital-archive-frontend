import { apiClient, toNumber } from "./client";
import type { OrderOut, Paginated } from "./types";

function fixOrder(order: OrderOut): OrderOut {
  return {
    ...order,
    total: toNumber(order.total),
    items: order.items.map((item) => ({
      ...item,
      asset: { ...item.asset, price: toNumber(item.asset.price) },
      price_at_purchase: toNumber(item.price_at_purchase),
    })),
  };
}

export interface CheckoutInput {
  notes?: string;
}

/**
 * POST /orders/checkout/ — creates the order from the current cart (status
 * "pending"), creates download entitlements, and empties the cart server-side.
 */
export async function checkout(input: CheckoutInput = {}): Promise<OrderOut> {
  const data = await apiClient.post<OrderOut>("/orders/checkout/", input);
  return fixOrder(data);
}

/** GET /orders/ — TODO(api): confirm paginated vs bare-array shape once verified. */
export async function listOrders(): Promise<OrderOut[]> {
  const data = await apiClient.get<Paginated<OrderOut> | OrderOut[]>("/orders/");
  const orders = Array.isArray(data) ? data : data.results;
  return orders.map(fixOrder);
}

/** GET /orders/{id}/ */
export async function getOrder(id: string): Promise<OrderOut> {
  const data = await apiClient.get<OrderOut>(`/orders/${id}/`);
  return fixOrder(data);
}
