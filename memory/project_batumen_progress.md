---
name: project-batumen-progress
description: Batumen Fashion frontend proje ilerleme durumu ve tamamlanan implementasyon aşamaları
metadata:
  type: project
---

Tüm 13 API entegrasyon stage'i tamamlandı (2026-05-16). Build: sıfır TS hatası.

**Why:** API dokümantasyonuna (https://adm.batumen-fashion.test/docs?api-docs.json) göre frontend tamamen senkronize edildi.

**How to apply:** Yeni özellik eklerken api.ts'deki metodları kullan; Address tipinin artık contact_name/contact_phone/street_address/address_type alanlarını kullandığını unutma.

## Tamamlanan Aşamalar

### Stage 1 — Kritik Düzeltmeler ✅
- Address tipi: `first_name`+`last_name` → `contact_name`, `phone` → `contact_phone`, `address_line1` → `street_address`, `address_type` eklendi
- Blog paths: `/posts` → `/blog/posts`
- Coupon paths: `/coupons/apply` → `/cart/coupon`
- Payment paths: `/payment/initialize` → `/payments/initialize`
- Return endpoint: `POST /returns` → `POST /orders/{num}/returns` (order_item_id bazlı)
- Checkout flow: address_id → shipping_address/billing_address nesneleri

### Stage 2 — Eksik API Metodları ✅
- api.ts tamamen yeniden yazıldı: 40+ yeni metod eklendi
- Yeni tipler: ShippingMethod, Campaign, Banner, Bundle, GiftCard, LoyaltyBalance/Tier/Transaction, Notification, Ticket, SearchSuggestion, Attribute, Installment, ShipmentTracking, BlogComment/Category/Tag, ProductQuestion, SizeGuide

### Stage 3 — Location Dropdown ✅
- AddressForm ve EditAddressForm: `/locations/cities` ve `/locations/cities/{city}/districts` ile dinamik il/ilçe dropdown

### Stage 4 — Search Autocomplete ✅
- SearchOverlay: `/search/suggest` endpoint'i (ürün + kategori + marka)

### Stage 5 — Ürün Detayı ✅
- Related products: `/products/{slug}/related` (gerçek API)
- ProductQuestions bileşeni: soru listesi + yeni soru formu
- StockNotifyButton: stok bildirimi e-posta kaydı

### Stage 6 — Banner & Kampanya ✅
- Ana sayfa: hero banners API'den
- Kampanyalar sayfası: `/app/campaigns/page.tsx`
- cache.ts: getCachedHeroBanners, getCachedCampaigns

### Stage 7 — Sadakat Programı ✅
- loyalty-points sayfası: tier gösterimi, balance, progress bar, puan geçmişi tablosu

### Stage 8 — Bildirimler ✅
- NotificationBell: header'da okunmamış sayısı badge (60s polling)
- `/account/notifications/page.tsx`: liste, okundu işareti, sil

### Stage 9 — Destek Talepleri ✅
- `/account/support/`: liste sayfası
- `/account/support/new/`: yeni talep formu
- `/account/support/[ticketNumber]/`: detay + yanıt

### Stage 10 — Sipariş Geliştirmeleri ✅
- Kargo takibi: `getOrderTracking` + açılır panel
- Fatura PDF: `getOrderInvoiceUrl` + indirme linki
- `/account/returns/[returnId]/`: iade detay sayfası

### Stage 11 — Paketler ✅
- `/app/bundles/page.tsx`: paket listesi
- `/app/bundles/[slug]/page.tsx`: paket detayı

### Stage 12 — Blog Yorumları & Filtreler ✅
- BlogComments bileşeni: yorum listesi + yorum formu
- Blog listesi: kategori ve tag filtreleri
- cache.ts: getCachedBlogCategories, getCachedBlogTags

### Stage 13 — Sepet Geliştirmeleri ✅
- GiftCardInput bileşeni: hediye kartı uygula/kaldır
- InstallmentsInfo bileşeni: taksit seçenekleri accordion
- CartDrawer'a GiftCardInput eklendi
- Checkout'a InstallmentsInfo eklendi
- NewsletterForm API'ye bağlandı: `/newsletter/subscribe`
