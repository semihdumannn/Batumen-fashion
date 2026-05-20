'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCompareStore } from '@/store/useCompareStore';

export function StoreInitializer() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);
  const syncCompare = useCompareStore((s) => s.syncFromServer);

  useEffect(() => {
    if (!hasHydrated) return;
    fetchCart();
    if (isAuthenticated) {
      fetchWishlist();
      syncCompare();
    }
  }, [hasHydrated, isAuthenticated, fetchCart, fetchWishlist, syncCompare]);

  return null;
}
