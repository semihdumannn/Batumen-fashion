'use client';

import { useEffect, useState } from 'react';
import { TrashIcon, PencilIcon, PlusIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { AddressForm } from '@/components/checkout/AddressForm';
import { EditAddressForm } from '@/components/checkout/EditAddressForm';
import { api } from '@/lib/api';
import type { Address } from '@/types';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  useEffect(() => {
    api
      .getAddresses()
      .then(setAddresses)
      .catch(() => setAddresses([]))
      .finally(() => setIsLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Bu adresi silmek istediğinizden emin misiniz?')) return;
    await api.deleteAddress(id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddressCreated = (address: Address) => {
    setAddresses((prev) => [...prev, address]);
    setShowAddForm(false);
  };

  const handleAddressUpdated = (updated: Address) => {
    setAddresses((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setEditingAddress(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold tracking-tight">ADRESLERİM</h1>
        <button
          onClick={() => { setShowAddForm(!showAddForm); setEditingAddress(null); }}
          className="flex items-center gap-1 text-sm text-black border border-black px-3 py-2 hover:bg-black hover:text-white transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Yeni Adres
        </button>
      </div>

      {/* Yeni Adres Formu */}
      {showAddForm && (
        <div className="border border-gray-200 p-4 mb-6">
          <h2 className="text-sm font-semibold mb-4">Yeni Adres Ekle</h2>
          <AddressForm onSuccess={handleAddressCreated} onCancel={() => setShowAddForm(false)} />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-28 skeleton" />)}
        </div>
      ) : addresses.length === 0 ? (
        <p className="text-sm text-gray-500 py-8 text-center">Kayıtlı adresiniz bulunmuyor.</p>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div key={addr.id} className="border border-gray-100">
              {/* Adres Satırı */}
              {editingAddress?.id !== addr.id ? (
                <div className="p-4 flex justify-between items-start">
                  <div className="text-sm flex-1 min-w-0 pr-4">
                    <p className="font-medium text-black flex items-center gap-2">
                      {addr.title}
                      {addr.is_default && (
                        <span className="flex items-center gap-0.5 text-xs bg-black text-white px-2 py-0.5">
                          <CheckBadgeIcon className="w-3 h-3" />
                          Varsayılan
                        </span>
                      )}
                    </p>
                    <p className="text-gray-600 mt-1">{addr.contact_name}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {addr.street_address}, {addr.district} / {addr.city}
                    </p>
                    <p className="text-gray-500 text-xs">{addr.contact_phone}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => { setEditingAddress(addr); setShowAddForm(false); }}
                      className="p-2 text-gray-400 hover:text-black transition-colors"
                      aria-label="Düzenle"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Sil"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Düzenleme Formu */
                <div className="p-4">
                  <h3 className="text-sm font-semibold mb-4">Adresi Düzenle</h3>
                  <EditAddressForm
                    address={editingAddress}
                    onSuccess={handleAddressUpdated}
                    onCancel={() => setEditingAddress(null)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
