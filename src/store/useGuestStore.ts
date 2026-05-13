'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GuestInfo } from '@/types';

interface GuestState {
  guestInfo: GuestInfo | null;
  setGuestInfo: (info: GuestInfo) => void;
  clearGuestInfo: () => void;
}

export const useGuestStore = create<GuestState>()(
  persist(
    (set) => ({
      guestInfo: null,
      setGuestInfo: (info) => set({ guestInfo: info }),
      clearGuestInfo: () => set({ guestInfo: null }),
    }),
    { name: 'guest-info', skipHydration: true }
  )
);
