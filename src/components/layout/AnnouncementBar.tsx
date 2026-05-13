'use client';

import { useSiteSettings } from './SiteSettingsProvider';

export function AnnouncementBar() {
  const { announcement_text, announcement_enabled, free_shipping_threshold } = useSiteSettings();

  // Eğer duyuru devre dışı bırakıldıysa gösterme
  if (announcement_enabled === false) return null;

  const text = announcement_text
    ?? (free_shipping_threshold
      ? `${free_shipping_threshold} ₺ ve üzeri siparişlerde ücretsiz kargo`
      : '500 ₺ ve üzeri siparişlerde ücretsiz kargo');

  return (
    <div className="bg-gray-900 text-white text-xs py-2 text-center tracking-wide">
      {text}
    </div>
  );
}
