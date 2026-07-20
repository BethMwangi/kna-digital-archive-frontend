import { useSyncExternalStore } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addToCart, clearCart, getCart, removeCartItem } from "@/lib/api/cart";
import type { CartItemOut, CartOut } from "@/lib/api/types";
import { queryKeys } from "@/lib/api/query-keys";
import { useAuth } from "@/lib/auth/use-auth";
import * as guestCart from "@/lib/cart/guest-cart-store";
import type { GuestCartLine } from "@/lib/cart/guest-cart-store";

function useGuestCartLines(): GuestCartLine[] {
  return useSyncExternalStore(guestCart.subscribe, guestCart.getLines, guestCart.getServerLines);
}

function guestLineToCartItem(line: GuestCartLine): CartItemOut {
  return {
    // Synthetic id doubles as the (asset_id, license_id) pair for removal —
    // see useRemoveFromCart, which never needs a real cart-item id for guests.
    id: `${line.asset_id}:${line.license_id}`,
    asset: { id: line.asset_id, title: line.title, thumbnail: line.thumbnail, price: line.price },
    license: { id: line.license_id, name: line.license_name, slug: "", description: "" },
    subtotal: line.price,
  };
}

interface UseCartResult {
  data: CartOut | undefined;
  isPending: boolean;
  isError: boolean;
  isFetching: boolean;
}

/** Guests see their localStorage cart; logged-in users see the real server cart. */
export function useCart(): UseCartResult {
  const { isAuthenticated } = useAuth();
  const guestLines = useGuestCartLines();
  const server = useQuery({
    queryKey: queryKeys.cart,
    queryFn: getCart,
    enabled: isAuthenticated,
  });

  if (isAuthenticated) {
    return {
      data: server.data,
      isPending: server.isPending,
      isError: server.isError,
      isFetching: server.isFetching,
    };
  }

  const items = guestLines.map(guestLineToCartItem);
  return {
    data: {
      items,
      total: items.reduce((sum, item) => sum + item.subtotal, 0),
      item_count: items.length,
    },
    isPending: false,
    isError: false,
    isFetching: false,
  };
}

export interface AddToCartLineInput {
  asset_id: string;
  license_id: string;
  title: string;
  thumbnail: string;
  price: number;
  license_name: string;
}

/** Adds to the server cart when logged in, the localStorage cart otherwise. */
export function useAddToCart() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AddToCartLineInput): Promise<CartOut | null> => {
      if (isAuthenticated) {
        return addToCart({ asset_id: input.asset_id, license_id: input.license_id });
      }
      guestCart.addLine(input);
      return null;
    },
    onSuccess: (cart) => {
      if (cart) queryClient.setQueryData(queryKeys.cart, cart);
    },
  });
}

/** Item id is `${asset_id}:${license_id}` for guest lines — see guestLineToCartItem. */
export function useRemoveFromCart() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string): Promise<CartOut | null> => {
      if (isAuthenticated) {
        return removeCartItem(itemId);
      }
      const [assetId, licenseId] = itemId.split(":");
      guestCart.removeLine(assetId, licenseId);
      return null;
    },
    onSuccess: (cart) => {
      if (cart) queryClient.setQueryData(queryKeys.cart, cart);
    },
  });
}

export function useClearCart() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<CartOut | null> => {
      if (isAuthenticated) {
        return clearCart();
      }
      guestCart.clearLines();
      return null;
    },
    onSuccess: (cart) => {
      if (cart) queryClient.setQueryData(queryKeys.cart, cart);
    },
  });
}
