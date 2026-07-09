import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as authApi from "@/lib/api/auth";
import * as tokenStore from "@/lib/auth/token-store";

export function useLogin() {
  return useMutation({ mutationFn: authApi.login });
}

export function useRegister() {
  return useMutation({ mutationFn: authApi.register });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const refresh = tokenStore.getRefreshToken();
      if (refresh) await authApi.logout(refresh);
    },
    // Clearing the local session is the actual goal of "logout" — do it
    // even if the API call fails (token already expired/blacklisted,
    // offline, etc.) so the user is never stuck appearing logged in.
    onSettled: () => {
      tokenStore.clearSession();
      queryClient.clear();
    },
  });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: authApi.forgotPassword });
}

export function useResetPassword() {
  return useMutation({ mutationFn: authApi.resetPassword });
}

export function useVerifyEmail() {
  return useMutation({ mutationFn: authApi.verifyEmail });
}
