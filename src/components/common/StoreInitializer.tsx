'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';

export function StoreInitializer() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);

  useEffect(() => {
    fetchCart();
    if (isAuthenticated) fetchWishlist();
  }, [isAuthenticated, fetchCart, fetchWishlist]);

  return null;
}
