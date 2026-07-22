import type { AdminUserListParams } from "./admin-users";
import type { AssetListParams, AssetSearchParams } from "./assets";

export const queryKeys = {
  me: ["me"] as const,
  adminUsers: (params?: AdminUserListParams) => ["admin-users", params] as const,
  assets: {
    list: (params: AssetListParams = {}) => ["assets", "list", params] as const,
    detail: (id: string) => ["assets", "detail", id] as const,
    featured: ["assets", "featured"] as const,
    latest: ["assets", "latest"] as const,
    search: (params: AssetSearchParams) => ["assets", "search", params] as const,
    suggest: (q: string) => ["assets", "suggest", q] as const,
  },
  taxonomy: {
    categories: ["categories"] as const,
    collections: ["collections"] as const,
    tags: ["tags"] as const,
    licenses: ["licenses"] as const,
    counties: ["counties"] as const,
    photographers: ["photographers"] as const,
  },
  cart: ["cart"] as const,
  payments: {
    list: (orderId?: string) => ["payments", "list", orderId] as const,
    detail: (id: string) => ["payments", "detail", id] as const,
  },
  downloads: ["downloads"] as const,
  orders: {
    list: ["orders", "list"] as const,
    detail: (id: string) => ["orders", "detail", id] as const,
  },
};
