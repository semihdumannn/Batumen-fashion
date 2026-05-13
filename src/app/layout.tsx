import type { Metadata } from 'next';
import { Inter, Barlow_Condensed } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { EmailVerificationBanner } from '@/components/account/EmailVerificationBanner';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { SearchOverlay } from '@/components/search/SearchOverlay';
import { Toaster } from '@/components/ui/Toaster';
import { CompareBar } from '@/components/products/CompareBar';
import { SiteSettingsProvider } from '@/components/layout/SiteSettingsProvider';
import { StoreHydration } from '@/components/common/StoreHydration';
import { StoreInitializer } from '@/components/common/StoreInitializer';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { getCachedSettings } from '@/lib/cache';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  variable: '--font-barlow',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: {
    default: 'Batumen Fashion - Erkek Giyim',
    template: '%s | Batumen Fashion',
  },
  description: 'Modern erkek giyim ve aksesuar. Yeni sezon koleksiyonunu keşfet.',
  keywords: ['erkek giyim', 'moda', 'batumen', 'aksesuar'],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getCachedSettings();

  const {
    ga_measurement_id,
    gtm_container_id,
    meta_pixel_id,
    head_scripts,
    body_scripts,
  } = settings;

  return (
    <html lang="tr">
      <head>
        {/* Google Tag Manager — <head> snippet */}
        {gtm_container_id && (
          <Script
            id="gtm-head"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtm_container_id}');`,
            }}
          />
        )}

        {/* Google Analytics 4 — sadece GTM yoksa */}
        {ga_measurement_id && !gtm_container_id && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${ga_measurement_id}`}
              strategy="afterInteractive"
            />
            <Script
              id="ga4"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga_measurement_id}');`,
              }}
            />
          </>
        )}

        {/* Meta (Facebook) Pixel */}
        {meta_pixel_id && (
          <Script
            id="meta-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${meta_pixel_id}');fbq('track','PageView');`,
            }}
          />
        )}

        {/* Özel head scriptleri */}
        {head_scripts && (
          <Script
            id="custom-head-scripts"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: head_scripts }}
          />
        )}
      </head>
      <body className={`${inter.variable} ${barlowCondensed.variable} font-sans antialiased`}>
        {/* Google Tag Manager — <body> noscript */}
        {gtm_container_id && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtm_container_id}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}

        <SiteSettingsProvider settings={settings}>
          <StoreHydration />
          <StoreInitializer />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-black text-white p-2 z-50"
          >
            Ana içeriğe geç
          </a>
          <AnnouncementBar />
          <Header />
          <EmailVerificationBanner />
          <ErrorBoundary>
            <main id="main-content" className="min-h-screen">
              {children}
            </main>
          </ErrorBoundary>
          <Footer />
          <CartDrawer />
          <SearchOverlay />
          <CompareBar />
          <Toaster />
        </SiteSettingsProvider>

        {/* Özel body scriptleri */}
        {body_scripts && (
          <Script
            id="custom-body-scripts"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: body_scripts }}
          />
        )}
      </body>
    </html>
  );
}
