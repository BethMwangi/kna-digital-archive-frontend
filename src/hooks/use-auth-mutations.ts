import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as authApi from "@/lib/api/auth";
import * as tokenStore from "@/lib/auth/token-store";
import { queryKeys } from "@/lib/api/query-keys";
import { mergeGuestCartIntoServer } from "@/lib/cart/merge-guest-cart";

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.login,
    // Replay whatever the visitor collected as a guest into their real
    // account cart the moment a session exists (see merge-guest-cart.ts).
    // Caught locally: TanStack Query awaits this hook-level onSuccess before
    // dispatching the mutation as successful, so an unhandled rejection here
    // would flip the whole login into an error state — including skipping
    // the caller's onSuccess (LoginPage's post-login redirect) — even though
    // the session was already established by authApi.login.
    onSuccess: async () => {
      try {
        await mergeGuestCartIntoServer();
        queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      } catch (error) {
        console.error("Guest cart merge failed after login", error);
      }
    },
  });
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

export function useResendVerification() {
  return useMutation({ mutationFn: authApi.resendVerification });
}
