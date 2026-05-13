'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircleIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { Container } from '@/components/layout/Container';
import { AddressForm } from '@/components/checkout/AddressForm';
import { GuestInfoForm } from '@/components/checkout/GuestInfoForm';
import { IyzicoPaymentForm } from '@/components/checkout/IyzicoPaymentForm';
import { LoyaltyPointsInput } from '@/components/checkout/LoyaltyPointsInput';
import { InstallmentsInfo } from '@/components/checkout/InstallmentsInfo';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useGuestStore } from '@/store/useGuestStore';
import { useToastStore } from '@/store/useToastStore';
import { api } from '@/lib/api';
import type { Address } from '@/types';

type Step = 'guest-info' | 'address' | 'payment' | 'success';

const STEPS: { key: Step; label: string }[] = [
  { key: 'guest-info', label: 'Bilgiler' },
  { key: 'address', label: 'Adres' },
  { key: 'payment', label: 'Ödeme' },
];

function StepIndicator({ current }: { current: Step }) {
  const visibleSteps = STEPS.filter((s) => s.key !== 'success');
  const currentIndex = visibleSteps.findIndex((s) => s.key === current);
  return (
    <div className="flex items-center gap-2 mb-10">
      {visibleSteps.map((step, i) => (
        <div key={step.key} className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 text-xs tracking-widest font-medium ${
              i <= currentIndex ? 'text-white' : 'text-gray-600'
            }`}
          >
            <span
              className={`w-6 h-6 flex items-center justify-center border text-[10px] font-bold ${
                i < currentIndex
                  ? 'bg-[#E8001A] border-[#E8001A] text-white'
                  : i === currentIndex
                  ? 'border-[#F8F7F5] text-white'
                  : 'border-gray-700 text-gray-600'
              }`}
            >
              {i < currentIndex ? '✓' : i + 1}
            </span>
            {step.label}
          </div>
          {i < visibleSteps.length - 1 && (
            <ChevronRightIcon className="w-3 h-3 text-gray-700" />
          )}
        </div>
      ))}
    </div>
  );
}

function SummaryPanel({
  subtotal,
  couponDiscount,
  total,
}: {
  subtotal: number;
  couponDiscount: number;
  total: number;
}) {
  const items = useCartStore((s) => s.items);
  return (
    <div className="bg-gray-50 border border-gray-200 p-6">
      <h3 className="text-xs font-bold tracking-widest text-white mb-5">SİPARİŞ ÖZETİ</h3>
      <div className="space-y-3 mb-5 max-h-64 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <div className="relative w-14 h-16 bg-gray-100 shrink-0 overflow-hidden">
              {item.product.images?.[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.product.images[0].thumbnail_url ?? item.product.images[0].image_url}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white line-clamp-1">{item.product.name}</p>
              {item.variant && (
                <p className="text-[10px] text-gray-500">
                  {Object.values(item.variant.options).filter(Boolean).join(' / ')}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-0.5">×{item.quantity}</p>
            </div>
            <p className="text-xs font-bold text-white shrink-0">
              {(item.price * item.quantity).toFixed(2)} ₺
            </p>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Ara Toplam</span>
          <span>{subtotal.toFixed(2)} ₺</span>
        </div>
        {couponDiscount > 0 && (
          <div className="flex justify-between text-xs text-green-400">
            <span>İndirim</span>
            <span>-{couponDiscount.toFixed(2)} ₺</span>
          </div>
        )}
        <div className="flex justify-between text-xs text-gray-400">
          <span>Kargo</span>
          <span>{subtotal >= 500 ? 'Ücretsiz' : '39.90 ₺'}</span>
        </div>
        <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-gray-200">
          <span>TOPLAM</span>
          <span>{total.toFixed(2)} ₺</span>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { items, fetchCart, getTotal, getDiscountedTotal, couponDiscount, clearCart } = useCartStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const guestInfo = useGuestStore((s) => s.guestInfo);
  const clearGuestInfo = useGuestStore((s) => s.clearGuestInfo);
  const toast = useToastStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [guestAddress, setGuestAddress] = useState<Omit<Address, 'id'> | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [checkoutFormContent, setCheckoutFormContent] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);

  const initialStep: Step = !isAuthenticated && !guestInfo ? 'guest-info' : 'address';
  const [step, setStep] = useState<Step>(initialStep);

  useEffect(() => {
    fetchCart();
    if (isAuthenticated) loadAddresses();
  }, [isAuthenticated, fetchCart]);

  const loadAddresses = async () => {
    try {
      const data = await api.getAddresses();
      setAddresses(data);
      const defaultAddr = data.find((a) => a.is_default);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
    } catch {
      // API may not be available
    }
  };

  const handleAddressCreated = (address: Address) => {
    setAddresses((prev) => [...prev, address]);
    setSelectedAddressId(address.id);
    setShowAddressForm(false);
  };

  const handleGuestAddressCreated = (address: Omit<Address, 'id'>) => {
    setGuestAddress(address);
    proceedToPayment(address);
  };

  const proceedToPayment = async (addr?: Omit<Address, 'id'>) => {
    setIsInitializing(true);
    try {
      let shippingAddress: Omit<Address, 'id'>;

      if (isAuthenticated) {
        const selected = addresses.find((a) => a.id === selectedAddressId);
        if (!selected) throw new Error('Adres seçilmedi');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, ...rest } = selected;
        shippingAddress = rest;
      } else {
        shippingAddress = addr ?? guestAddress!;
      }

      const order = await api.createOrder({
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
        coupon_code: useCartStore.getState().couponCode ?? undefined,
      });

      const result = await api.initializePayment({
        order_id: order.id,
        payment_method: 'credit_card',
      });

      setCheckoutFormContent(result.checkout_form_content);
      setOrderNumber(result.order_number);
      setStep('payment');
    } catch {
      toast.error('Ödeme başlatılamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleAddressNext = () => {
    if (isAuthenticated && !selectedAddressId) {
      toast.error('Lütfen bir teslimat adresi seçin');
      return;
    }
    if (!isAuthenticated && !guestAddress) {
      setShowAddressForm(true);
      return;
    }
    proceedToPayment();
  };

  if (step === 'success') {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Container className="py-24 text-center">
          <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-6" />
          <p className="text-[10px] tracking-widest text-gray-600 mb-3">SİPARİŞİNİZ ALINDI</p>
          <h1 className="font-display text-5xl font-bold text-white mb-3">TEŞEKKÜRLER!</h1>
          <p className="text-sm text-gray-500 mb-2">
            Sipariş No: <strong className="text-white">{orderNumber}</strong>
          </p>
          <p className="text-xs text-gray-600 mb-10">E-posta ile bilgilendireceğiz.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated && (
              <Link
                href={`/account/orders/${orderNumber}`}
                className="bg-[#F8F7F5] text-gray-900 px-10 py-4 text-xs font-bold tracking-widest hover:bg-gray-200 transition-colors"
              >
                SİPARİŞİ GÖRÜNTÜLE
              </Link>
            )}
            <Link
              href="/products"
              className="border border-gray-200 text-white px-10 py-4 text-xs font-bold tracking-widest hover:bg-gray-50 transition-colors"
            >
              ALIŞVERİŞE DEVAM ET
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  if (items.length === 0 && step !== 'payment') {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <Container className="text-center py-20">
          <p className="text-sm text-gray-500 mb-4">Sepetiniz boş.</p>
          <Link href="/products" className="text-xs tracking-widest text-white underline underline-offset-4">
            Ürünlere git
          </Link>
        </Container>
      </div>
    );
  }

  const subtotal = getTotal();
  const total = getDiscountedTotal();

  return (
    <div className="bg-gray-50 min-h-screen">
      <Container className="py-10">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-xl font-bold tracking-[0.25em] text-white font-display">
            BATUMEN
          </Link>
          <Link href="/cart" className="text-xs text-gray-500 hover:text-white underline underline-offset-4 transition-colors">
            ← Sepete Dön
          </Link>
        </div>

        <StepIndicator current={step} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            {step === 'guest-info' && (
              <div>
                <h2 className="text-xs font-bold tracking-widest text-white mb-6">KİŞİSEL BİLGİLER</h2>
                <GuestInfoForm onNext={() => setStep('address')} />
              </div>
            )}

            {step === 'address' && (
              <div>
                <h2 className="text-xs font-bold tracking-widest text-white mb-6">TESLİMAT ADRESİ</h2>

                {isAuthenticated && (
                  <>
                    {addresses.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {addresses.map((addr) => (
                          <label
                            key={addr.id}
                            className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${
                              selectedAddressId === addr.id
                                ? 'border-[#F8F7F5] bg-gray-50'
                                : 'border-gray-200 hover:border-gray-600'
                            }`}
                          >
                            <input
                              type="radio"
                              name="address"
                              value={addr.id}
                              checked={selectedAddressId === addr.id}
                              onChange={() => setSelectedAddressId(addr.id)}
                              className="mt-0.5 accent-[#E8001A]"
                            />
                            <div className="text-xs">
                              <p className="font-semibold text-white tracking-wide">{addr.title}</p>
                              <p className="text-gray-400 mt-0.5">{addr.contact_name}</p>
                              <p className="text-gray-500 mt-0.5">
                                {addr.street_address}, {addr.district} / {addr.city}
                              </p>
                              <p className="text-gray-500">{addr.contact_phone}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                    {!showAddressForm ? (
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="text-xs text-gray-400 underline underline-offset-4 hover:text-white transition-colors mb-6 block"
                      >
                        + Yeni Adres Ekle
                      </button>
                    ) : (
                      <div className="border border-gray-200 p-5 mb-6 bg-gray-50">
                        <h3 className="text-xs font-bold tracking-widest text-white mb-4">YENİ ADRES</h3>
                        <AddressForm
                          onSuccess={handleAddressCreated}
                          onCancel={() => setShowAddressForm(false)}
                        />
                      </div>
                    )}
                    <LoyaltyPointsInput />
                    <button
                      onClick={handleAddressNext}
                      disabled={!selectedAddressId || isInitializing}
                      className="w-full bg-[#F8F7F5] text-gray-900 py-4 text-xs font-bold tracking-widest hover:bg-gray-200 transition-colors disabled:opacity-40"
                    >
                      {isInitializing ? 'YÜKLENIYOR...' : 'DEVAM ET — ÖDEME'}
                    </button>
                  </>
                )}

                {!isAuthenticated && (
                  <>
                    {guestAddress ? (
                      <div className="border border-gray-200 p-4 mb-6 bg-gray-50">
                        <p className="text-xs text-white font-semibold mb-1">
                          {guestAddress.contact_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {guestAddress.street_address}, {guestAddress.district} / {guestAddress.city}
                        </p>
                        <button
                          onClick={() => setGuestAddress(null)}
                          className="text-[10px] text-gray-600 underline mt-2"
                        >
                          Değiştir
                        </button>
                      </div>
                    ) : (
                      <div className="border border-gray-200 p-5 mb-6 bg-gray-50">
                        <AddressForm
                          onSuccess={(addr) => handleGuestAddressCreated(addr as unknown as Omit<Address, 'id'>)}
                          onCancel={() => setStep('guest-info')}
                          isGuest
                        />
                      </div>
                    )}
                    {guestAddress && (
                      <>
                        <LoyaltyPointsInput />
                        <button
                          onClick={() => proceedToPayment()}
                          disabled={isInitializing}
                          className="w-full bg-[#F8F7F5] text-gray-900 py-4 text-xs font-bold tracking-widest hover:bg-gray-200 transition-colors disabled:opacity-40"
                        >
                          {isInitializing ? 'YÜKLENIYOR...' : 'DEVAM ET — ÖDEME'}
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            )}

            {step === 'payment' && (
              <div>
                <h2 className="text-xs font-bold tracking-widest text-white mb-6">ÖDEME</h2>
                <div className="mb-4">
                  <InstallmentsInfo />
                </div>
                {checkoutFormContent ? (
                  <div className="bg-white">
                    <IyzicoPaymentForm checkoutFormContent={checkoutFormContent} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border border-[#E8001A]/50 p-4 bg-[#E8001A]/5">
                      <p className="text-xs text-[#E8001A]">
                        Ödeme altyapısı entegrasyon sürecinde.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        clearCart();
                        clearGuestInfo();
                        setStep('success');
                      }}
                      className="w-full bg-[#E8001A] hover:bg-[#C40017] text-white py-4 text-xs font-bold tracking-widest transition-colors"
                    >
                      DEMO: SİPARİŞİ TAMAMLA
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <SummaryPanel subtotal={subtotal} couponDiscount={couponDiscount} total={total} />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
