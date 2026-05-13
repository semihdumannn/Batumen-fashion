'use client';

import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { useUIStore } from '@/store/useUIStore';

export function MobileFilterButton() {
  const openFilter = useUIStore((s) => s.openFilter);
  return (
    <button
      onClick={openFilter}
      className="md:hidden flex items-center gap-2 border border-gray-200 px-4 py-2 text-xs font-semibold tracking-widest text-gray-900 hover:border-[#0A0A0A] transition-colors"
    >
      <AdjustmentsHorizontalIcon className="w-4 h-4" />
      FİLTRELE
    </button>
  );
}
