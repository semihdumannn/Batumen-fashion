'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import Image from 'next/image';
import Link from 'next/link';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useUIStore } from '@/store/useUIStore';
import { api } from '@/lib/api';
import type { SearchSuggestion } from '@/types';

const STORAGE_KEY = 'recent-searches';

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); } catch { return []; }
}
function saveSearch(q: string) {
  const updated = [q, ...getRecentSearches().filter((s) => s !== q)].slice(0, 5);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function SearchOverlay() {
  const isSearchOpen = useUIStore((s) => s.isSearchOpen);
  const closeSearch = useUIStore((s) => s.closeSearch);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const { data: suggestions, isLoading } = useSWR<SearchSuggestion>(
    debouncedQuery.length >= 2 ? `suggest:${debouncedQuery}` : null,
    () => api.searchSuggest(debouncedQuery, 8),
    { revalidateOnFocus: false }
  );

  const hasResults = suggestions && (
    suggestions.products.length > 0 ||
    suggestions.categories.length > 0 ||
    suggestions.brands.length > 0
  );

  useEffect(() => {
    if (isSearchOpen) {
      setRecentSearches(getRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery(''); setDebouncedQuery('');
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSearch(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeSearch]);

  useEffect(() => {
    document.body.style.overflow = isSearchOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isSearchOpen]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(value), 250);
  };

  const handleSubmit = (q: string) => {
    if (!q.trim()) return;
    saveSearch(q.trim());
    closeSearch();
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const showPanel = isLoading || hasResults || (!query && recentSearches.length > 0) ||
    (suggestions && !hasResults && debouncedQuery.length >= 2);

  return (
    <div
      className={`fixed inset-0 z-[45] ${isSearchOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      inert={!isSearchOpen}
    >
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${isSearchOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={closeSearch}
      />

      <div
        className={`absolute top-0 left-0 right-0 bg-white shadow-lg transition-transform duration-300 ${isSearchOpen ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-4">
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(query); }} className="flex items-center gap-3">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Ürün, kategori veya marka ara..."
              className="flex-1 text-base text-gray-900 placeholder-gray-400 outline-none py-1"
            />
            {query && (
              <button type="button" onClick={() => { setQuery(''); setDebouncedQuery(''); }} className="text-gray-400 hover:text-gray-600 transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
            <button type="button" onClick={closeSearch} className="text-sm text-gray-500 hover:text-black transition-colors ml-2 shrink-0">
              Kapat
            </button>
          </form>
        </div>

        {showPanel && (
          <div className="border-t border-gray-100 max-w-[1280px] mx-auto px-4 sm:px-6 py-5 max-h-[60vh] overflow-y-auto">
            {!query && recentSearches.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-400 tracking-widest mb-3">SON ARAMALAR</p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((s) => (
                    <button key={s} onClick={() => { setQuery(s); handleQueryChange(s); }}
                      className="text-sm text-gray-600 border border-gray-200 px-3 py-1.5 hover:border-black hover:text-black transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center py-8"><div className="spinner" /></div>
            )}

            {suggestions && !hasResults && debouncedQuery.length >= 2 && (
              <p className="text-sm text-gray-400 py-6">"{debouncedQuery}" için sonuç bulunamadı</p>
            )}

            {suggestions && (suggestions.categories.length > 0 || suggestions.brands.length > 0) && (
              <div className="grid grid-cols-2 gap-6 mb-6">
                {suggestions.categories.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 tracking-widest mb-3">KATEGORİLER</p>
                    <div className="space-y-1">
                      {suggestions.categories.map((cat) => (
                        <Link key={cat.id} href={`/categories/${cat.slug}`}
                          onClick={() => { saveSearch(query); closeSearch(); }}
                          className="block text-sm text-gray-700 hover:text-black hover:underline underline-offset-2 transition-colors py-0.5">
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {suggestions.brands.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 tracking-widest mb-3">MARKALAR</p>
                    <div className="space-y-1">
                      {suggestions.brands.map((brand) => (
                        <Link key={brand.id} href={`/brands/${brand.slug}`}
                          onClick={() => { saveSearch(query); closeSearch(); }}
                          className="block text-sm text-gray-700 hover:text-black hover:underline underline-offset-2 transition-colors py-0.5">
                          {brand.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {suggestions && suggestions.products.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 tracking-widest mb-4">ÜRÜNLER</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                  {suggestions.products.map((product) => (
                    <Link key={product.id} href={`/products/${product.slug}`}
                      onClick={() => { saveSearch(query); closeSearch(); }}
                      className="group block">
                      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-2">
                        {product.image && (
                          <Image src={product.image} alt={product.name} fill sizes="120px" unoptimized
                            className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-900 line-clamp-1 group-hover:underline underline-offset-2">{product.name}</p>
                      <p className="text-xs font-semibold text-gray-900 mt-0.5">{product.price.toFixed(2)} ₺</p>
                    </Link>
                  ))}
                </div>
                <button onClick={() => handleSubmit(query)} className="mt-5 text-sm text-gray-500 hover:text-black underline underline-offset-4 transition-colors">
                  Tümünü ara: "{query}" →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
