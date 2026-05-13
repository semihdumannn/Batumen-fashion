'use client';

import { create } from 'zustand';
import type { Toast } from '@/types';

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const duration = toast.duration ?? 3500;
    set((state) => ({
      toasts: [...state.toasts.slice(-3), { ...toast, id, duration }],
    }));
    setTimeout(() => get().removeToast(id), duration);
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  success: (message, duration) => get().addToast({ type: 'success', message, duration }),
  error: (message, duration) => get().addToast({ type: 'error', message, duration }),
  info: (message, duration) => get().addToast({ type: 'info', message, duration }),
  warning: (message, duration) => get().addToast({ type: 'warning', message, duration }),
}));
