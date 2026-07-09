import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as adminUsersApi from "@/lib/api/admin-users";
import type { AdminUserListParams, UpdateAdminUserInput } from "@/lib/api/admin-users";
import { queryKeys } from "@/lib/api/query-keys";

export function useAdminUsers(params: AdminUserListParams = {}) {
  return useQuery({
    queryKey: queryKeys.adminUsers(params),
    queryFn: () => adminUsersApi.listAdminUsers(params),
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminUsersApi.createAdminUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAdminUserInput }) =>
      adminUsersApi.updateAdminUser(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminUsersApi.deleteAdminUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });
}
