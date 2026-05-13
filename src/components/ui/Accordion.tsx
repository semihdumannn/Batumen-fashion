'use client';

import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface AccordionItem {
  question: string;
  answer: string;
}

interface Props {
  items: AccordionItem[];
}

export function Accordion({ items }: Props) {
  return (
    <div className="divide-y divide-gray-200">
      {items.map((item) => (
        <Disclosure key={item.question}>
          {({ open }) => (
            <>
              <DisclosureButton className="flex items-center justify-between w-full py-5 text-left gap-4">
                <span className="text-sm font-semibold text-gray-900">{item.question}</span>
                <ChevronDownIcon
                  className={`w-5 h-5 text-gray-500 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
              </DisclosureButton>
              <DisclosurePanel className="pb-5">
                <p className="text-sm text-gray-600 leading-relaxed">{item.answer}</p>
              </DisclosurePanel>
            </>
          )}
        </Disclosure>
      ))}
    </div>
  );
}
