export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  loyalty_points?: number;
  email_verified_at: string | null;
  created_at: string;
}

export interface ProductImage {
  id: number;
  image_url: string;
  thumbnail_url?: string;
  is_primary: boolean;
  sort_order?: number;
}

export interface MediaFile {
  id: number;
  url: string;
  alt_text?: string | null;
  is_primary: boolean;
  sort_order: number;
}

export interface ProductVariant {
  id: number;
  sku: string;
  options: Record<string, string | null> | string;
  price?: number | null;
  stock_quantity: number;
  is_active: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string;
  parent_id?: number;
  children?: Category[];
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description: string;
  short_description?: string;
  base_price: number;
  compare_at_price?: number | null;
  discount_percentage?: number | null;
  stock_quantity: number;
  is_in_stock?: boolean;
  has_variants: boolean;
  images: ProductImage[];
  media_files?: MediaFile[];
  primary_image?: string | null;
  brand?: Brand;
  categories: Category[];
  variants?: ProductVariant[];
  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
  is_bestseller?: boolean;
  average_rating?: number;
  reviews_count?: number;
}

export interface CartItem {
  id: number;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  price: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  subtotal: number;
  total: number;
  coupon_code?: string;
  discount?: number;
}

export interface Address {
  id: number;
  title: string;
  contact_name: string;
  contact_phone: string;
  city: string;
  district: string;
  street_address: string;
  postal_code?: string;
  address_type: 'billing' | 'shipping' | 'both';
  is_default: boolean;
}

export interface OrderItem {
  id: number;
  product_id?: number;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  variant_id?: number;
  variant_options?: Record<string, string>;
}

export interface Order {
  id: number;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  items: OrderItem[];
  shipping_address?: Address;
  tracking_number?: string | null;
  carrier_code?: string | null;
  carrier_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  user: Pick<User, 'id' | 'name' | 'avatar'>;
  rating: number;
  title?: string;
  body: string;
  is_verified_purchase: boolean;
  created_at: string;
}

export interface WishlistItem {
  id: number;
  product: Product;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links?: {
    next?: string;
    prev?: string;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  brand?: string;
  min_price?: number;
  max_price?: number;
  is_featured?: boolean;
  is_new?: boolean;
  on_sale?: boolean;
  in_stock?: boolean;
  size?: string;
  color?: string;
  min_rating?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  page?: number;
  per_page?: number;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover_image?: string;
  author?: { name: string; avatar?: string };
  tags?: string[];
  published_at: string;
  reading_time?: number;
}

export interface GuestInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export interface ReturnRequest {
  id: number;
  order_number: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  reason: string;
  description?: string;
  items: Array<{ order_item_id: number; quantity: number; product_name?: string }>;
  created_at: string;
}

export interface CouponResponse {
  discount: number;
  discount_type: 'percent' | 'fixed';
  code: string;
  message: string;
}

export interface PaymentInitResponse {
  checkout_form_content: string;
  order_number: string;
  payment_id: number;
}

export interface PaymentVerifyResponse {
  status: 'success' | 'failure';
  order_number: string;
  message?: string;
}

export interface ShippingMethod {
  id: number;
  name: string;
  code: string;
  price: number;
  estimated_days: string;
  is_free_threshold?: number;
}

export interface Campaign {
  id: number;
  title: string;
  description?: string;
  slug?: string;
  image?: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
}

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  button_text?: string;
  position: 'hero' | 'sidebar' | 'popup';
  placement?: string;
  is_active: boolean;
}

export interface Bundle {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  original_price: number;
  bundle_price: number;
  products: Product[];
  is_active: boolean;
}

export interface GiftCard {
  code: string;
  balance: number;
  is_active: boolean;
  expires_at?: string;
}

export interface LoyaltyTier {
  id: number;
  name: string;
  min_points: number;
  max_points?: number;
  discount_percent: number;
  benefits: string[];
}

export interface LoyaltyBalance {
  points: number;
  tier: LoyaltyTier;
  next_tier?: LoyaltyTier;
  points_to_next_tier?: number;
}

export interface LoyaltyTransaction {
  id: number;
  type: 'earn' | 'spend' | 'expire' | 'adjust';
  points: number;
  description: string;
  created_at: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read_at: string | null;
  data?: Record<string, unknown>;
  created_at: string;
}

export interface Ticket {
  id: number;
  ticket_number: string;
  subject: string;
  body: string;
  category: 'order' | 'payment' | 'shipping' | 'return' | 'product' | 'other';
  status: 'open' | 'in_progress' | 'closed';
  priority: 'low' | 'normal' | 'high';
  order_number?: string;
  replies: TicketReply[];
  created_at: string;
  updated_at: string;
}

export interface TicketReply {
  id: number;
  body: string;
  is_admin: boolean;
  created_at: string;
}

export interface SearchSuggestion {
  products: Array<{ id: number; name: string; slug: string; image?: string; price: number }>;
  categories: Array<{ id: number; name: string; slug: string }>;
  brands: Array<{ id: number; name: string; slug: string }>;
}

export interface Attribute {
  id: number;
  name: string;
  slug: string;
  type: 'color' | 'size' | 'select';
  values: Array<{ id: number; value: string; label: string; color_hex?: string }>;
}

export interface Installment {
  bank_name: string;
  bank_code: string;
  installments: Array<{
    count: number;
    monthly_amount: number;
    total_amount: number;
  }>;
}

export interface ShipmentTracking {
  tracking_number: string;
  carrier: string;
  status: string;
  events: Array<{
    date: string;
    location: string;
    description: string;
  }>;
}

export interface BlogComment {
  id: number;
  body: string;
  author: { name: string; avatar?: string };
  created_at: string;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  posts_count?: number;
}

export interface BlogTag {
  id: number;
  name: string;
  slug: string;
  posts_count?: number;
}

export interface ProductQuestion {
  id: number;
  body: string;
  author: { name: string };
  answers: Array<{ id: number; body: string; is_admin: boolean; created_at: string }>;
  created_at: string;
}

export interface SizeGuide {
  id: number;
  name: string;
  unit: string;
  rows: Array<{ size: string; measurements: Record<string, string> }>;
  columns: string[];
}

export interface SiteSettings {
  site_name?: string;
  site_logo?: string;
  site_favicon?: string;
  announcement_text?: string;
  announcement_enabled?: boolean;
  contact_email?: string;
  contact_phone?: string;
  contact_address?: string;
  social_instagram?: string;
  social_twitter?: string;
  social_facebook?: string;
  social_youtube?: string;
  social_tiktok?: string;
  ga_measurement_id?: string;
  gtm_container_id?: string;
  meta_pixel_id?: string;
  head_scripts?: string;
  body_scripts?: string;
  free_shipping_threshold?: number;
  footer_copyright?: string;
}
