import type { AdminUserListParams } from "./admin-users";

export const queryKeys = {
  me: ["me"] as const,
  adminUsers: (params?: AdminUserListParams) => ["admin-users", params] as const,
};
