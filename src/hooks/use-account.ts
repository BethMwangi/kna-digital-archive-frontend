import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as usersApi from "@/lib/api/users";
import * as tokenStore from "@/lib/auth/token-store";
import { queryKeys } from "@/lib/api/query-keys";
import { useAuth } from "@/lib/auth/use-auth";

export function useMe() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: usersApi.getMe,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.updateMe,
    onSuccess: (user) => {
      tokenStore.setUser(user);
      queryClient.setQueryData(queryKeys.me, user);
    },
  });
}

export function useChangePassword() {
  return useMutation({ mutationFn: usersApi.changePassword });
}
