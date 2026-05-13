'use client';

import { useToastStore } from '@/store/useToastStore';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/solid';

const icons = {
  success: <CheckCircleIcon className="w-5 h-5 text-green-500 shrink-0" />,
  error: <ExclamationCircleIcon className="w-5 h-5 text-red-500 shrink-0" />,
  info: <InformationCircleIcon className="w-5 h-5 text-blue-500 shrink-0" />,
  warning: <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 shrink-0" />,
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2 pointer-events-none" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="toast-enter pointer-events-auto flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 shadow-lg text-sm text-gray-800 min-w-[260px] max-w-[340px]"
          role="alert"
        >
          {icons[toast.type]}
          <p className="flex-1 leading-snug">{toast.message}</p>
          <button onClick={() => removeToast(toast.id)} className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors" aria-label="Kapat">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
