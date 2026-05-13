'use client';

import { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const sizeData = [
  { size: 'XS', chest: '84-88', waist: '68-72', hip: '90-94' },
  { size: 'S',  chest: '88-92', waist: '72-76', hip: '94-98' },
  { size: 'M',  chest: '92-96', waist: '76-80', hip: '98-102' },
  { size: 'L',  chest: '96-100', waist: '80-84', hip: '102-106' },
  { size: 'XL', chest: '100-104', waist: '84-88', hip: '106-110' },
  { size: 'XXL', chest: '104-110', waist: '88-94', hip: '110-116' },
  { size: '3XL', chest: '110-118', waist: '94-102', hip: '116-124' },
];

interface Props {
  trigger?: React.ReactNode;
}

export function SizeGuideModal({ trigger }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-xs text-gray-500 underline underline-offset-4 hover:text-gray-900 transition-colors"
      >
        {trigger ?? 'Beden Rehberi'}
      </button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-[50]">
        <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-lg bg-[#F8F7F5] border border-gray-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <DialogTitle className="text-sm font-bold tracking-widest text-gray-900">
                BEDEN REHBERİ
              </DialogTitle>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-900 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-xs text-gray-500 mb-5">
                Ölçüler santimetre (cm) cinsindendir. Sınır değerlerindeyseniz bir büyük bedeni tercih etmenizi öneririz.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 pr-4 font-bold tracking-widest text-gray-900">BEDEN</th>
                      <th className="text-left py-2 px-4 font-bold tracking-widest text-gray-900">GÖĞÜS</th>
                      <th className="text-left py-2 px-4 font-bold tracking-widest text-gray-900">BEL</th>
                      <th className="text-left py-2 pl-4 font-bold tracking-widest text-gray-900">KALÇA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizeData.map((row, i) => (
                      <tr
                        key={row.size}
                        className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                      >
                        <td className="py-2.5 pr-4 font-bold text-gray-900">{row.size}</td>
                        <td className="py-2.5 px-4 text-gray-600">{row.chest}</td>
                        <td className="py-2.5 px-4 text-gray-600">{row.waist}</td>
                        <td className="py-2.5 pl-4 text-gray-600">{row.hip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 pt-5 border-t border-gray-200">
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  💡 <strong>İpucu:</strong> Göğüs, bel ve kalça ölçülerini almak için mezura kullanın ve en geniş noktaları ölçün.
                </p>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
