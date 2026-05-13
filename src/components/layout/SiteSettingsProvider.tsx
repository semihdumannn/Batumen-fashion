'use client';

import { createContext, useContext } from 'react';
import type { SiteSettings } from '@/types';

const SiteSettingsContext = createContext<SiteSettings>({});

export function SiteSettingsProvider({
  settings,
  children,
}: {
  settings: SiteSettings;
  children: React.ReactNode;
}) {
  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): SiteSettings {
  return useContext(SiteSettingsContext);
}
