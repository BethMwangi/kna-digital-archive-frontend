import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addToCart, listCart, removeFromCart, type AddToCartInput } from "@/lib/api/cart";
import { queryKeys } from "@/lib/api/query-keys";
import { useAuth } from "@/lib/auth/use-auth";

export function useCart() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.cart,
    queryFn: listCart,
    enabled: isAuthenticated,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddToCartInput) => addToCart(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.cart }),
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeFromCart(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.cart }),
  });
}
