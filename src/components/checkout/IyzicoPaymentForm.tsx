'use client';

import { useEffect, useRef } from 'react';

interface Props {
  checkoutFormContent: string;
}

export function IyzicoPaymentForm({ checkoutFormContent }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !checkoutFormContent) return;
    containerRef.current.innerHTML = '';
    const range = document.createRange();
    const fragment = range.createContextualFragment(checkoutFormContent);
    containerRef.current.appendChild(fragment);
  }, [checkoutFormContent]);

  return (
    <div
      ref={containerRef}
      id="iyzipay-checkout-form"
      className="min-h-[400px] w-full"
    />
  );
}
