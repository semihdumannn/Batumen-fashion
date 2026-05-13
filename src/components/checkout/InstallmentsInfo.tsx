'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { CreditCardIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import type { Installment } from '@/types';

export function InstallmentsInfo() {
  const [open, setOpen] = useState(false);

  const { data: installments } = useSWR<Installment[]>(
    open ? 'installments' : null,
    () => api.getInstallments(),
    { revalidateOnFocus: false }
  );

  return (
    <div className="border border-gray-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <CreditCardIcon className="w-4 h-4 text-gray-400" />
          Taksit Seçenekleri
        </span>
        <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {!installments ? (
            <p className="text-xs text-gray-400 py-3 text-center">Yükleniyor...</p>
          ) : installments.length === 0 ? (
            <p className="text-xs text-gray-400 py-3 text-center">Taksit bilgisi bulunamadı.</p>
          ) : (
            <div className="space-y-4 mt-3">
              {installments.map((bank) => (
                <div key={bank.bank_code}>
                  <p className="text-xs font-bold text-gray-700 mb-2">{bank.bank_name}</p>
                  <div className="grid grid-cols-3 gap-1 text-[10px]">
                    <div className="font-semibold text-gray-500">Taksit</div>
                    <div className="font-semibold text-gray-500">Aylık</div>
                    <div className="font-semibold text-gray-500">Toplam</div>
                    {bank.installments.map((inst) => (
                      <>
                        <div key={`${bank.bank_code}-${inst.count}-n`} className="text-gray-700">{inst.count}×</div>
                        <div key={`${bank.bank_code}-${inst.count}-m`} className="text-gray-700">{inst.monthly_amount.toFixed(2)} ₺</div>
                        <div key={`${bank.bank_code}-${inst.count}-t`} className="text-gray-700">{inst.total_amount.toFixed(2)} ₺</div>
                      </>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
