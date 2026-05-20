'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { Container } from '@/components/layout/Container';
import { AddressForm } from '@/components/checkout/AddressForm';
import { GuestInfoForm } from '@/components/checkout/GuestInfoForm';
import { IyzicoPaymentForm } from '@/components/checkout/IyzicoPaymentForm';
import { LoyaltyPointsInput } from '@/components/checkout/LoyaltyPointsInput';
import { InstallmentsInfo } from '@/components/checkout/InstallmentsInfo';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useGuestStore } from '@/store/useGuestStore';
import type { User } from '@/types';
import { useToastStore } from '@/store/useToastStore';
import { api } from '@/lib/api';
import type { Address, ShippingMethod } from '@/types';

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
    <div className="flex items-center mb-8">
      {visibleSteps.map((step, i) => (
        <div key={step.key} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                i < currentIndex
                  ? 'bg-gray-900 border-gray-900 text-white'
                  : i === currentIndex
                  ? 'bg-gray-900 border-gray-900 text-white'
                  : 'bg-white border-gray-300 text-gray-400'
              }`}
            >
              {i < currentIndex ? '✓' : i + 1}
            </div>
            <span
              className={`text-xs mt-1.5 font-medium whitespace-nowrap ${
                i <= currentIndex ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < visibleSteps.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-3 mb-5 transition-colors ${
                i < currentIndex ? 'bg-gray-900' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function SummaryPanel({
  subtotal,
  couponDiscount,
  shippingCost,
}: {
  subtotal: number;
  couponDiscount: number;
  shippingCost: number | null;
}) {
  const items = useCartStore((s) => s.items);
  const discountedSubtotal = Math.max(0, subtotal - couponDiscount);
  const total = shippingCost !== null ? discountedSubtotal + shippingCost : discountedSubtotal;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-sm font-bold text-gray-900 mb-5 tracking-wide">Sipariş Özeti</h3>
      <div className="space-y-3 mb-5 max-h-64 overflow-y-auto pr-1">
        {items.map((item) => {
          const imgSrc: string | undefined =
            (item.product as unknown as { image?: string }).image ??
            item.product.images?.[0]?.thumbnail_url ??
            item.product.images?.[0]?.image_url;

          const rawOpts = item.variant?.options;
          let variantLabel = '';
          if (rawOpts) {
            const opts: Record<string, unknown> =
              typeof rawOpts === 'string'
                ? (() => { try { return JSON.parse(rawOpts); } catch { return {}; } })()
                : (rawOpts as Record<string, unknown>);
            variantLabel = Object.values(opts)
              .filter((v) => v !== null && v !== undefined && v !== '')
              .join(' / ');
          }

          return (
            <div key={item.id} className="flex items-start gap-3">
              <div className="relative w-14 h-16 bg-gray-100 rounded-lg shrink-0 overflow-hidden">
                {imgSrc && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imgSrc} alt={item.product.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 line-clamp-2">{item.product.name}</p>
                {variantLabel && (
                  <p className="text-[11px] text-gray-500 mt-0.5">{variantLabel}</p>
                )}
                <p className="text-[11px] text-gray-400 mt-0.5">Adet: {item.quantity}</p>
              </div>
              <p className="text-xs font-bold text-gray-900 shrink-0">
                {(Number(item.price) * item.quantity).toFixed(2)} ₺
              </p>
            </div>
          );
        })}
      </div>
      <div className="border-t border-gray-100 pt-4 space-y-2.5">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Ara Toplam</span>
          <span>{subtotal.toFixed(2)} ₺</span>
        </div>
        {couponDiscount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>İndirim</span>
            <span>-{couponDiscount.toFixed(2)} ₺</span>
          </div>
        )}
        <div className="flex justify-between text-sm text-gray-600">
          <span>Kargo</span>
          <span>
            {shippingCost === null
              ? '—'
              : shippingCost === 0
              ? 'Ücretsiz'
              : `${shippingCost.toFixed(2)} ₺`}
          </span>
        </div>
        <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
          <span>Toplam</span>
          <span>{total.toFixed(2)} ₺</span>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { items, fetchCart, getTotal, couponDiscount, clearCart } = useCartStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authUser = useAuthStore((s) => s.user) as User | null;
  const guestInfo = useGuestStore((s) => s.guestInfo);
  const clearGuestInfo = useGuestStore((s) => s.clearGuestInfo);
  const toast = useToastStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [guestAddress, setGuestAddress] = useState<Omit<Address, 'id'> | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [separateBilling, setSeparateBilling] = useState(false);
  const [billingAddress, setBillingAddress] = useState<Address | null>(null);
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState<number | null>(null);
  const [showBillingForm, setShowBillingForm] = useState(false);

  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);

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

  const loadShippingMethods = async (cartTotal: number) => {
    setLoadingShipping(true);
    try {
      const methods = await api.calculateShipping(cartTotal);
      setShippingMethods(methods);
      if (methods.length > 0) {
        const cheapest = methods.reduce((a, b) => (a.price <= b.price ? a : b));
        setSelectedShipping(cheapest);
      }
    } catch {
      // Fallback: no shipping methods available
    } finally {
      setLoadingShipping(false);
    }
  };

  const handleAddressCreated = (address: Address) => {
    setAddresses((prev) => [...prev, address]);
    setSelectedAddressId(address.id);
    setShowAddressForm(false);
  };

  const handleBillingAddressCreated = (address: Address) => {
    setBillingAddress(address);
    setSelectedBillingAddressId(address.id);
    setShowBillingForm(false);
  };

  const handleGuestAddressCreated = (address: Omit<Address, 'id'>) => {
    setGuestAddress(address);
    loadShippingMethods(getTotal());
  };

  const handleAddressNext = async () => {
    if (isAuthenticated && !selectedAddressId) {
      toast.error('Lütfen bir teslimat adresi seçin');
      return;
    }
    if (!isAuthenticated && !guestAddress) {
      setShowAddressForm(true);
      return;
    }
    if (separateBilling && isAuthenticated && !selectedBillingAddressId && !billingAddress) {
      toast.error('Lütfen bir fatura adresi seçin');
      return;
    }
    if (shippingMethods.length === 0) {
      await loadShippingMethods(getTotal());
    }
    if (!selectedShipping) {
      toast.error('Lütfen bir kargo yöntemi seçin');
      return;
    }
    await proceedToPayment();
  };

  const proceedToPayment = async (addr?: Omit<Address, 'id'>) => {
    if (items.length === 0) {
      toast.error('Sepetiniz boş.');
      return;
    }
    setIsInitializing(true);
    try {
      let shippingAddress: Omit<Address, 'id'>;
      let billingAddr: Omit<Address, 'id'>;

      if (isAuthenticated) {
        const selected = addresses.find((a) => a.id === selectedAddressId);
        if (!selected) throw new Error('Adres seçilmedi');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, ...rest } = selected;
        shippingAddress = rest;

        if (separateBilling) {
          const selectedBilling = billingAddress ?? addresses.find((a) => a.id === selectedBillingAddressId);
          if (selectedBilling) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: _bid, ...billingRest } = selectedBilling;
            billingAddr = billingRest;
          } else {
            billingAddr = shippingAddress;
          }
        } else {
          billingAddr = shippingAddress;
        }
      } else {
        shippingAddress = addr ?? guestAddress!;
        billingAddr = shippingAddress;
      }

      // Build buyer info
      let buyerName = '';
      let buyerSurname = '';
      let buyerPhone = '';
      let buyerEmail = '';

      if (isAuthenticated && authUser) {
        const parts = authUser.name.trim().split(' ');
        buyerName    = parts[0] ?? authUser.name;
        buyerSurname = parts.slice(1).join(' ') || parts[0];
        buyerPhone   = authUser.phone ?? shippingAddress.contact_phone;
        buyerEmail   = authUser.email;
      } else if (guestInfo) {
        buyerName    = guestInfo.first_name;
        buyerSurname = guestInfo.last_name;
        buyerPhone   = guestInfo.phone;
        buyerEmail   = guestInfo.email;
      }

      // Create order
      let order: { order_number: string; total: number };
      if (isAuthenticated) {
        order = await api.createOrder({
          shipping_address: shippingAddress,
          billing_address: billingAddr,
          shipping_method_id: selectedShipping?.id,
          coupon_code: useCartStore.getState().couponCode ?? undefined,
        });
      } else {
        order = await api.createGuestOrder({
          guest_name:  `${buyerName} ${buyerSurname}`.trim(),
          guest_email: buyerEmail,
          guest_phone: buyerPhone,
          shipping_address: shippingAddress,
          billing_address: billingAddr,
          shipping_method_id: selectedShipping?.id,
          coupon_code: useCartStore.getState().couponCode ?? undefined,
        });
      }

      let checkoutContent = '';
      try {
        const result = await api.initializePayment({
          order_number: order.order_number,
          buyer: { name: buyerName, surname: buyerSurname, phone: buyerPhone, email: buyerEmail },
          guest_email: isAuthenticated ? undefined : buyerEmail,
        });
        checkoutContent = result.checkout_form_content ?? '';
      } catch {
        // iyzico not configured — fall through to demo payment step
      }

      setCheckoutFormContent(checkoutContent);
      setOrderNumber(order.order_number);
      setStep('payment');
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const axiosErr = err as any;
      console.error('[checkout] status:', axiosErr?.response?.status);
      console.error('[checkout] data:', JSON.stringify(axiosErr?.response?.data));
      console.error('[checkout] message:', axiosErr instanceof Error ? axiosErr.message : String(axiosErr));
      const msg =
        axiosErr?.response?.data?.message ??
        (axiosErr?.response?.data?.errors
          ? Object.values(axiosErr.response.data.errors as Record<string, string[]>).flat().join(' ')
          : null) ??
        (axiosErr instanceof Error ? axiosErr.message : null) ??
        'Ödeme başlatılamadı. Lütfen tekrar deneyin.';
      toast.error(msg);
    } finally {
      setIsInitializing(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="bg-gray-100 min-h-screen">
        <Container className="py-24 text-center">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <p className="text-xs tracking-widest text-gray-500 mb-3">SİPARİŞİNİZ ALINDI</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Teşekkürler!</h1>
          <p className="text-sm text-gray-600 mb-2">
            Sipariş No: <strong className="text-gray-900">{orderNumber}</strong>
          </p>
          <p className="text-sm text-gray-500 mb-10">E-posta ile bilgilendireceğiz.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated && (
              <Link
                href={`/account/orders/${orderNumber}`}
                className="bg-gray-900 text-white px-10 py-4 text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
              >
                Siparişi Görüntüle
              </Link>
            )}
            <Link
              href="/products"
              className="border border-gray-300 text-gray-700 px-10 py-4 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Alışverişe Devam Et
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  if (items.length === 0 && step !== 'payment') {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <Container className="text-center py-20">
          <p className="text-sm text-gray-500 mb-4">Sepetiniz boş.</p>
          <Link href="/products" className="text-sm font-semibold text-gray-900 underline underline-offset-4">
            Ürünlere git
          </Link>
        </Container>
      </div>
    );
  }

  const subtotal = getTotal();

  return (
    <div className="bg-gray-100 min-h-screen">
      <Container className="py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-xl font-bold tracking-[0.25em] text-gray-900">
            BATUMEN
          </Link>
          <Link href="/cart" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            ← Sepete Dön
          </Link>
        </div>

        <StepIndicator current={step} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — Step Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              {step === 'guest-info' && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Kişisel Bilgiler</h2>
                  <GuestInfoForm onNext={() => setStep('address')} />
                </div>
              )}

              {step === 'address' && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Teslimat Adresi</h2>

                  {isAuthenticated && (
                    <>
                      {addresses.length > 0 && (
                        <div className="space-y-3 mb-4">
                          {addresses.map((addr) => (
                            <label
                              key={addr.id}
                              className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                                selectedAddressId === addr.id
                                  ? 'border-gray-900 bg-gray-50'
                                  : 'border-gray-200 hover:border-gray-400'
                              }`}
                            >
                              <input
                                type="radio"
                                name="address"
                                value={addr.id}
                                checked={selectedAddressId === addr.id}
                                onChange={() => {
                                  setSelectedAddressId(addr.id);
                                  setShippingMethods([]);
                                  setSelectedShipping(null);
                                  loadShippingMethods(getTotal());
                                }}
                                className="mt-0.5 accent-gray-900"
                              />
                              <div className="text-sm">
                                <p className="font-semibold text-gray-900">{addr.title}</p>
                                <p className="text-gray-500 mt-0.5">{addr.contact_name}</p>
                                <p className="text-gray-500 mt-0.5">
                                  {addr.street_address}, {addr.district} / {addr.city}
                                </p>
                                <p className="text-gray-400">{addr.contact_phone}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}

                      {selectedAddressId !== null && shippingMethods.length === 0 && !loadingShipping && (
                        <div className="hidden" ref={(el) => { if (el) loadShippingMethods(getTotal()); }} />
                      )}

                      {!showAddressForm ? (
                        <button
                          onClick={() => setShowAddressForm(true)}
                          className="text-sm text-gray-500 hover:text-gray-900 underline underline-offset-4 transition-colors mb-6 block"
                        >
                          + Yeni Adres Ekle
                        </button>
                      ) : (
                        <div className="border border-gray-200 rounded-xl p-5 mb-6 bg-gray-50">
                          <h3 className="text-sm font-bold text-gray-900 mb-4">Yeni Adres</h3>
                          <AddressForm
                            onSuccess={handleAddressCreated}
                            onCancel={() => setShowAddressForm(false)}
                          />
                        </div>
                      )}

                      <div className="mb-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={separateBilling}
                            onChange={(e) => setSeparateBilling(e.target.checked)}
                            className="accent-gray-900 w-4 h-4"
                          />
                          <span className="text-sm text-gray-600">Farklı fatura adresi kullan</span>
                        </label>
                      </div>

                      {separateBilling && (
                        <div className="mb-6">
                          <h3 className="text-sm font-bold text-gray-900 mb-4">Fatura Adresi</h3>
                          {addresses.length > 0 && (
                            <div className="space-y-3 mb-4">
                              {addresses.map((addr) => (
                                <label
                                  key={addr.id}
                                  className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                                    selectedBillingAddressId === addr.id
                                      ? 'border-gray-900 bg-gray-50'
                                      : 'border-gray-200 hover:border-gray-400'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="billing-address"
                                    value={addr.id}
                                    checked={selectedBillingAddressId === addr.id}
                                    onChange={() => setSelectedBillingAddressId(addr.id)}
                                    className="mt-0.5 accent-gray-900"
                                  />
                                  <div className="text-sm">
                                    <p className="font-semibold text-gray-900">{addr.title}</p>
                                    <p className="text-gray-500 mt-0.5">{addr.contact_name}</p>
                                    <p className="text-gray-500 mt-0.5">
                                      {addr.street_address}, {addr.district} / {addr.city}
                                    </p>
                                  </div>
                                </label>
                              ))}
                            </div>
                          )}
                          {!showBillingForm ? (
                            <button
                              onClick={() => setShowBillingForm(true)}
                              className="text-sm text-gray-500 hover:text-gray-900 underline underline-offset-4 transition-colors mb-4 block"
                            >
                              + Yeni Fatura Adresi Ekle
                            </button>
                          ) : (
                            <div className="border border-gray-200 rounded-xl p-5 mb-4 bg-gray-50">
                              <AddressForm
                                onSuccess={handleBillingAddressCreated}
                                onCancel={() => setShowBillingForm(false)}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Shipping methods */}
                      {loadingShipping && (
                        <div className="mb-6">
                          <p className="text-sm font-semibold text-gray-700 mb-3">Kargo Yöntemi</p>
                          <div className="space-y-2">
                            {[1, 2].map((i) => (
                              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                            ))}
                          </div>
                        </div>
                      )}

                      {!loadingShipping && shippingMethods.length > 0 && (
                        <div className="mb-6">
                          <p className="text-sm font-semibold text-gray-700 mb-3">Kargo Yöntemi</p>
                          <div className="space-y-2">
                            {shippingMethods.map((method) => (
                              <label
                                key={method.id}
                                className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                                  selectedShipping?.id === method.id
                                    ? 'border-gray-900 bg-gray-50'
                                    : 'border-gray-200 hover:border-gray-400'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type="radio"
                                    name="shipping"
                                    value={method.id}
                                    checked={selectedShipping?.id === method.id}
                                    onChange={() => setSelectedShipping(method)}
                                    className="accent-gray-900"
                                  />
                                  <div className="text-sm">
                                    <p className="font-semibold text-gray-900">{method.name}</p>
                                    <p className="text-gray-500">{method.estimated_days} gün</p>
                                  </div>
                                </div>
                                <span className="text-sm font-bold text-gray-900">
                                  {Number(method.price) === 0 ? 'Ücretsiz' : `${Number(method.price).toFixed(2)} ₺`}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      <LoyaltyPointsInput />
                      <button
                        onClick={handleAddressNext}
                        disabled={!selectedAddressId || isInitializing || loadingShipping}
                        className="w-full bg-gray-900 text-white py-4 text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-40 mt-2"
                      >
                        {isInitializing ? 'Yükleniyor...' : 'Devam Et — Ödeme'}
                      </button>
                    </>
                  )}

                  {!isAuthenticated && (
                    <>
                      {guestAddress ? (
                        <>
                          <div className="border border-gray-200 rounded-xl p-4 mb-6 bg-gray-50">
                            <p className="text-sm font-semibold text-gray-900 mb-1">
                              {guestAddress.contact_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {guestAddress.street_address}, {guestAddress.district} / {guestAddress.city}
                            </p>
                            <button
                              onClick={() => {
                                setGuestAddress(null);
                                setShippingMethods([]);
                                setSelectedShipping(null);
                              }}
                              className="text-xs text-gray-500 hover:text-gray-900 underline mt-2 transition-colors"
                            >
                              Değiştir
                            </button>
                          </div>

                          {loadingShipping && (
                            <div className="mb-6">
                              <p className="text-sm font-semibold text-gray-700 mb-3">Kargo Yöntemi</p>
                              <div className="space-y-2">
                                {[1, 2].map((i) => (
                                  <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                                ))}
                              </div>
                            </div>
                          )}

                          {!loadingShipping && shippingMethods.length > 0 && (
                            <div className="mb-6">
                              <p className="text-sm font-semibold text-gray-700 mb-3">Kargo Yöntemi</p>
                              <div className="space-y-2">
                                {shippingMethods.map((method) => (
                                  <label
                                    key={method.id}
                                    className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                                      selectedShipping?.id === method.id
                                        ? 'border-gray-900 bg-gray-50'
                                        : 'border-gray-200 hover:border-gray-400'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <input
                                        type="radio"
                                        name="shipping"
                                        value={method.id}
                                        checked={selectedShipping?.id === method.id}
                                        onChange={() => setSelectedShipping(method)}
                                        className="accent-gray-900"
                                      />
                                      <div className="text-sm">
                                        <p className="font-semibold text-gray-900">{method.name}</p>
                                        <p className="text-gray-500">{method.estimated_days} gün</p>
                                      </div>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">
                                      {Number(method.price) === 0 ? 'Ücretsiz' : `${Number(method.price).toFixed(2)} ₺`}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}

                          <LoyaltyPointsInput />
                          <button
                            onClick={() => proceedToPayment()}
                            disabled={isInitializing || loadingShipping || !selectedShipping}
                            className="w-full bg-gray-900 text-white py-4 text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-40 mt-2"
                          >
                            {isInitializing ? 'Yükleniyor...' : 'Devam Et — Ödeme'}
                          </button>
                        </>
                      ) : (
                        <div className="border border-gray-200 rounded-xl p-5 mb-6 bg-gray-50">
                          <AddressForm
                            onSuccess={(addr) => handleGuestAddressCreated(addr as unknown as Omit<Address, 'id'>)}
                            onCancel={() => setStep('guest-info')}
                            isGuest
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {step === 'payment' && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Ödeme</h2>
                  <div className="mb-4">
                    <InstallmentsInfo />
                  </div>
                  {checkoutFormContent ? (
                    <div className="bg-white">
                      <IyzicoPaymentForm checkoutFormContent={checkoutFormContent} />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="border border-amber-200 rounded-xl p-4 bg-amber-50">
                        <p className="text-sm text-amber-700">
                          Ödeme altyapısı entegrasyon sürecinde.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          clearCart();
                          clearGuestInfo();
                          setStep('success');
                        }}
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 text-sm font-semibold rounded-xl transition-colors"
                      >
                        DEMO: Siparişi Tamamla
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right — Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <SummaryPanel
                subtotal={subtotal}
                couponDiscount={couponDiscount}
                shippingCost={selectedShipping ? Number(selectedShipping.price) : null}
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
