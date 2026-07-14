import type { AdminUserListParams } from "./admin-users";
import type { AssetListParams } from "./assets";

export const queryKeys = {
  me: ["me"] as const,
  adminUsers: (params?: AdminUserListParams) => ["admin-users", params] as const,
  assets: {
    list: (params: AssetListParams = {}) => ["assets", "list", params] as const,
    detail: (id: string) => ["assets", "detail", id] as const,
    featured: ["assets", "featured"] as const,
    latest: ["assets", "latest"] as const,
  },
  taxonomy: {
    categories: ["categories"] as const,
    collections: ["collections"] as const,
    tags: ["tags"] as const,
    licenses: ["licenses"] as const,
  },
  cart: ["cart"] as const,
};
