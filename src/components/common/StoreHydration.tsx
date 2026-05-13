'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useGuestStore } from '@/store/useGuestStore';

export function StoreHydration() {
  useEffect(() => {
    const result = useAuthStore.persist.rehydrate();
    const done = () => useAuthStore.setState({ _hasHydrated: true });
    if (result instanceof Promise) result.then(done);
    else done();
    void useGuestStore.persist.rehydrate();
  }, []);
  return null;
}
