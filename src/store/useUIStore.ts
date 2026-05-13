'use client';

import { create } from 'zustand';

interface UIState {
  isMobileMenuOpen: boolean;
  isCartOpen: boolean;
  isSearchOpen: boolean;
  isFilterOpen: boolean;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  openCart: () => void;
  closeCart: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  openFilter: () => void;
  closeFilter: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  isCartOpen: false,
  isSearchOpen: false,
  isFilterOpen: false,

  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  openFilter: () => set({ isFilterOpen: true }),
  closeFilter: () => set({ isFilterOpen: false }),
}));
