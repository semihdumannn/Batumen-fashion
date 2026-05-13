import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';
import type {
  Product,
  Cart,
  CartItem,
  Order,
  Address,
  Review,
  WishlistItem,
  User,
  PaginatedResponse,
  ProductFilters,
  BlogPost,
  GuestInfo,
  ReturnRequest,
  CouponResponse,
  PaymentInitResponse,
  PaymentVerifyResponse,
  ShippingMethod,
  Campaign,
  Banner,
  Bundle,
  GiftCard,
  LoyaltyBalance,
  LoyaltyTier,
  LoyaltyTransaction,
  Notification,
  Ticket,
  TicketReply,
  SearchSuggestion,
  Attribute,
  Installment,
  ShipmentTracking,
  BlogComment,
  BlogCategory,
  BlogTag,
  ProductQuestion,
  SizeGuide,
} from '@/types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      withCredentials: true,
    });

    this.client.interceptors.request.use((config) => {
      const token = Cookies.get('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          Cookies.remove('auth_token');
          // Store'u async olarak temizle — router loop'u önlemek için hard redirect YAPMA
          import('@/store/useAuthStore').then(({ useAuthStore }) => {
            useAuthStore.setState({ user: null, isAuthenticated: false });
          });
        }
        return Promise.reject(error);
      }
    );
  }

  // ─── Auth ────────────────────────────────────────────────────────────────

  async login(email: string, password: string) {
    const { data } = await this.client.post('/auth/login', { email, password });
    if (data.data?.token) {
      Cookies.set('auth_token', data.data.token, { expires: 7 });
    }
    return data.data as { user: User; token: string };
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
  }) {
    const { data } = await this.client.post('/auth/register', userData);
    if (data.data?.token) {
      Cookies.set('auth_token', data.data.token, { expires: 7 });
    }
    return data.data as { user: User; token: string; is_email_verified: boolean };
  }

  async logout() {
    await this.client.post('/auth/logout');
    Cookies.remove('auth_token');
  }

  async refreshToken(): Promise<{ token: string }> {
    const { data } = await this.client.post('/auth/refresh');
    if (data.data?.token) {
      Cookies.set('auth_token', data.data.token, { expires: 7 });
    }
    return data.data;
  }

  async getUser(): Promise<User> {
    const { data } = await this.client.get('/auth/user');
    return data.data;
  }

  async updateProfile(userData: { name?: string; phone?: string; email?: string }): Promise<User> {
    const { data } = await this.client.put('/auth/user', userData);
    return data.data;
  }

  async changePassword(payload: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<void> {
    await this.client.post('/auth/change-password', payload);
  }

  async resendVerificationEmail(): Promise<void> {
    await this.client.post('/auth/email/resend');
  }

  async getEmailVerificationStatus(): Promise<{
    is_verified: boolean;
    email: string;
    verified_at: string | null;
  }> {
    const { data } = await this.client.get('/auth/email/status');
    return data.data;
  }

  async verifyEmailWithUrl(verifyUrl: string): Promise<{ user: User; already_verified?: boolean }> {
    const res = await fetch(verifyUrl, {
      headers: {
        Authorization: `Bearer ${Cookies.get('auth_token') ?? ''}`,
        Accept: 'application/json',
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? 'Doğrulama başarısız');
    }
    return res.json().then((d) => d.data ?? d);
  }

  async forgotPassword(email: string): Promise<void> {
    await this.client.post('/auth/forgot-password', { email });
  }

  async resetPassword(payload: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<void> {
    await this.client.post('/auth/reset-password', payload);
  }

  // ─── Products ────────────────────────────────────────────────────────────

  async getProducts(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (filters?.search) params['filter[search]'] = filters.search;
    if (filters?.category) params['filter[category]'] = filters.category;
    if (filters?.brand) params['filter[brand]'] = filters.brand;
    if (filters?.min_price) params['filter[min_price]'] = filters.min_price;
    if (filters?.max_price) params['filter[max_price]'] = filters.max_price;
    if (filters?.is_featured) params['filter[is_featured]'] = true;
    if (filters?.is_new) params['filter[is_new]'] = true;
    if (filters?.on_sale) params['filter[on_sale]'] = true;
    if (filters?.in_stock) params['filter[in_stock]'] = true;
    if (filters?.size) params['filter[size]'] = filters.size;
    if (filters?.color) params['filter[color]'] = filters.color;
    if (filters?.min_rating) params['filter[min_rating]'] = filters.min_rating;
    if (filters?.sort) params['sort'] = filters.sort;
    if (filters?.page) params['page'] = filters.page;
    if (filters?.per_page) params['per_page'] = filters.per_page;

    const { data } = await this.client.get('/products', { params });
    return data;
  }

  async getProduct(slug: string): Promise<Product> {
    const { data } = await this.client.get(`/products/${slug}`);
    return data.data;
  }

  async getRelatedProducts(slug: string): Promise<Product[]> {
    const { data } = await this.client.get(`/products/${slug}/related`);
    return data.data;
  }

  async getProductStock(slug: string): Promise<{ stock_quantity: number; variants?: Array<{ id: number; stock_quantity: number }> }> {
    const { data } = await this.client.get(`/products/${slug}/stock`);
    return data.data;
  }

  async getProductSizeGuide(slug: string): Promise<SizeGuide> {
    const { data } = await this.client.get(`/products/${slug}/size-guide`);
    return data.data;
  }

  async getSizeGuide(id: number): Promise<SizeGuide> {
    const { data } = await this.client.get(`/size-guides/${id}`);
    return data.data;
  }

  async subscribeStockNotification(slug: string, email: string, variantId?: number): Promise<void> {
    await this.client.post(`/products/${slug}/notify`, { email, variant_id: variantId });
  }

  async unsubscribeStockNotification(slug: string): Promise<void> {
    await this.client.delete(`/products/${slug}/notify`);
  }

  async getMyStockNotifications(): Promise<Array<{ product: Product; variant_id?: number; created_at: string }>> {
    const { data } = await this.client.get('/stock-notifications');
    return data.data;
  }

  async semanticSearch(query: string): Promise<Product[]> {
    const { data } = await this.client.post('/products/search/semantic', {
      query,
      limit: 20,
    });
    return data.data;
  }

  async searchSuggest(q: string, limit = 8): Promise<SearchSuggestion> {
    const { data } = await this.client.get('/search/suggest', { params: { q, limit } });
    return data;
  }

  async getRecentlyViewed(): Promise<Product[]> {
    const { data } = await this.client.get('/recently-viewed');
    return data.data;
  }

  async addRecentlyViewed(productId: number): Promise<void> {
    await this.client.post('/recently-viewed', { product_id: productId });
  }

  // ─── Categories ──────────────────────────────────────────────────────────

  async getCategories() {
    const { data } = await this.client.get('/categories');
    return data.data;
  }

  async getCategory(slug: string) {
    const { data } = await this.client.get(`/categories/${slug}`);
    return data.data;
  }

  // ─── Brands ──────────────────────────────────────────────────────────────

  async getBrands() {
    const { data } = await this.client.get('/brands');
    return data.data;
  }

  // ─── Attributes ──────────────────────────────────────────────────────────

  async getAttributes(category?: string): Promise<Attribute[]> {
    const { data } = await this.client.get('/attributes', { params: category ? { category } : undefined });
    return data.data;
  }

  // ─── Locations ───────────────────────────────────────────────────────────

  async getCities(): Promise<string[]> {
    const { data } = await this.client.get('/locations/cities');
    return data.data;
  }

  async getDistricts(city: string): Promise<string[]> {
    const { data } = await this.client.get(`/locations/cities/${encodeURIComponent(city)}/districts`);
    return data.data;
  }

  // ─── Shipping ────────────────────────────────────────────────────────────

  async getShippingMethods(): Promise<ShippingMethod[]> {
    const { data } = await this.client.get('/shipping-methods');
    return data.data;
  }

  async calculateShipping(cartTotal: number): Promise<ShippingMethod[]> {
    const { data } = await this.client.get('/shipping-methods/calculate', { params: { cart_total: cartTotal } });
    return data.data;
  }

  // ─── Campaigns & Banners ─────────────────────────────────────────────────

  async getCampaigns(): Promise<Campaign[]> {
    const { data } = await this.client.get('/campaigns');
    return data.data;
  }

  async getCampaign(id: number): Promise<Campaign> {
    const { data } = await this.client.get(`/campaigns/${id}`);
    return data.data;
  }

  async getBanners(position?: 'hero' | 'sidebar' | 'popup'): Promise<Banner[]> {
    const { data } = await this.client.get('/banners', { params: position ? { position } : undefined });
    return data.data;
  }

  // ─── Settings ────────────────────────────────────────────────────────────

  async getSettings(): Promise<Record<string, unknown>> {
    const { data } = await this.client.get('/settings');
    return data.data;
  }

  async getCurrencies(): Promise<Array<{ code: string; symbol: string; name: string; rate: number }>> {
    const { data } = await this.client.get('/currencies');
    return data.data;
  }

  async getInstallments(bankCode?: string): Promise<Installment[]> {
    const { data } = await this.client.get('/installments', { params: bankCode ? { bank_code: bankCode } : undefined });
    return data.data;
  }

  // ─── Bundles ─────────────────────────────────────────────────────────────

  async getBundles(): Promise<Bundle[]> {
    const { data } = await this.client.get('/bundles');
    return data.data;
  }

  async getBundle(slug: string): Promise<Bundle> {
    const { data } = await this.client.get(`/bundles/${slug}`);
    return data.data;
  }

  // ─── Cart ────────────────────────────────────────────────────────────────

  async getCart(): Promise<Cart> {
    const { data } = await this.client.get('/cart');
    return data.data;
  }

  async addToCart(productId: number, quantity: number, variantId?: number): Promise<CartItem> {
    const { data } = await this.client.post('/cart', {
      product_id: productId,
      quantity,
      variant_id: variantId,
    });
    return data.data;
  }

  async updateCartItem(itemId: number, quantity: number): Promise<CartItem> {
    const { data } = await this.client.put(`/cart/${itemId}`, { quantity });
    return data.data;
  }

  async removeFromCart(itemId: number): Promise<void> {
    await this.client.delete(`/cart/${itemId}`);
  }

  // ─── Coupon ──────────────────────────────────────────────────────────────

  async applyCoupon(code: string): Promise<CouponResponse> {
    const { data } = await this.client.post('/cart/coupon', { code });
    return data.data;
  }

  async removeCoupon(): Promise<void> {
    await this.client.delete('/cart/coupon');
  }

  async validateCoupon(code: string, cartTotal?: number): Promise<CouponResponse> {
    const { data } = await this.client.post('/coupons/validate', { code, cart_total: cartTotal });
    return data.data;
  }

  // ─── Gift Cards ──────────────────────────────────────────────────────────

  async getGiftCard(code: string): Promise<GiftCard> {
    const { data } = await this.client.get(`/gift-cards/${code}`);
    return data.data;
  }

  async applyGiftCard(code: string): Promise<{ balance_used: number; message: string }> {
    const { data } = await this.client.post('/cart/gift-card', { code });
    return data.data;
  }

  async removeGiftCard(): Promise<void> {
    await this.client.delete('/cart/gift-card');
  }

  // ─── Orders ──────────────────────────────────────────────────────────────

  async createOrder(orderData: {
    shipping_address: Omit<Address, 'id'>;
    billing_address: Omit<Address, 'id'>;
    shipping_method_id?: number;
    customer_note?: string;
    coupon_code?: string;
  }): Promise<Order> {
    const { data } = await this.client.post('/orders', orderData);
    return data.data;
  }

  async getOrders(params?: { status?: string; per_page?: number }): Promise<PaginatedResponse<Order>> {
    const { data } = await this.client.get('/orders', { params });
    return data;
  }

  async getOrder(orderNumber: string): Promise<Order> {
    const { data } = await this.client.get(`/orders/${orderNumber}`);
    return data.data;
  }

  async cancelOrder(orderNumber: string, reason?: string): Promise<Order> {
    const { data } = await this.client.post(`/orders/${orderNumber}/cancel`, { reason });
    return data.data;
  }

  getOrderInvoiceUrl(orderNumber: string): string {
    const token = Cookies.get('auth_token') ?? '';
    return `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderNumber}/invoice?token=${token}`;
  }

  async getOrderShipment(orderNumber: string): Promise<{ tracking_number: string; carrier: string; status: string }> {
    const { data } = await this.client.get(`/orders/${orderNumber}/shipment`);
    return data.data;
  }

  async getOrderTracking(orderNumber: string): Promise<ShipmentTracking> {
    const { data } = await this.client.get(`/orders/${orderNumber}/tracking`);
    return data.data;
  }

  // ─── Addresses ───────────────────────────────────────────────────────────

  async getAddresses(): Promise<Address[]> {
    const { data } = await this.client.get('/addresses');
    return data.data;
  }

  async getAddress(id: number): Promise<Address> {
    const { data } = await this.client.get(`/addresses/${id}`);
    return data.data;
  }

  async createAddress(addressData: Omit<Address, 'id'>): Promise<Address> {
    const { data } = await this.client.post('/addresses', addressData);
    return data.data;
  }

  async updateAddress(id: number, addressData: Partial<Omit<Address, 'id'>>): Promise<Address> {
    const { data } = await this.client.put(`/addresses/${id}`, addressData);
    return data.data;
  }

  async deleteAddress(id: number): Promise<void> {
    await this.client.delete(`/addresses/${id}`);
  }

  // ─── Wishlist ────────────────────────────────────────────────────────────

  async getWishlist(): Promise<WishlistItem[]> {
    const { data } = await this.client.get('/wishlist');
    return data.data;
  }

  async addToWishlist(productId: number, variantId?: number): Promise<WishlistItem> {
    const { data } = await this.client.post('/wishlist', { product_id: productId, variant_id: variantId });
    return data.data;
  }

  async removeFromWishlist(productId: number): Promise<void> {
    await this.client.delete(`/wishlist/${productId}`);
  }

  // ─── Compare ─────────────────────────────────────────────────────────────

  async getCompare(): Promise<Product[]> {
    const { data } = await this.client.get('/compare');
    return data.data;
  }

  async addToCompare(productId: number): Promise<void> {
    await this.client.post('/compare', { product_id: productId });
  }

  async removeFromCompare(productId: number): Promise<void> {
    await this.client.delete(`/compare/${productId}`);
  }

  async clearCompare(): Promise<void> {
    await this.client.delete('/compare');
  }

  // ─── Reviews ─────────────────────────────────────────────────────────────

  async getProductReviews(
    slug: string,
    params?: { page?: number; sort?: 'newest' | 'highest' | 'lowest' }
  ): Promise<PaginatedResponse<Review>> {
    const { data } = await this.client.get(`/products/${slug}/reviews`, { params });
    return data;
  }

  async createReview(
    slug: string,
    reviewData: { rating: number; title?: string; body?: string }
  ): Promise<Review> {
    const { data } = await this.client.post(`/products/${slug}/reviews`, reviewData);
    return data.data;
  }

  // ─── Questions ───────────────────────────────────────────────────────────

  async getProductQuestions(slug: string): Promise<ProductQuestion[]> {
    const { data } = await this.client.get(`/products/${slug}/questions`);
    return data.data;
  }

  async createQuestion(slug: string, body: string): Promise<ProductQuestion> {
    const { data } = await this.client.post(`/products/${slug}/questions`, { body });
    return data.data;
  }

  async answerQuestion(slug: string, questionId: number, body: string): Promise<void> {
    await this.client.post(`/products/${slug}/questions/${questionId}/answers`, { body });
  }

  // ─── Blog ────────────────────────────────────────────────────────────────

  async getBlogPosts(params?: {
    page?: number;
    per_page?: number;
    tag?: string;
    category?: string;
  }): Promise<PaginatedResponse<BlogPost>> {
    const { data } = await this.client.get('/blog/posts', { params });
    return data;
  }

  async getBlogPost(slug: string): Promise<BlogPost> {
    const { data } = await this.client.get(`/blog/posts/${slug}`);
    return data.data;
  }

  async getBlogCategories(): Promise<BlogCategory[]> {
    const { data } = await this.client.get('/blog/categories');
    return data.data;
  }

  async getBlogTags(): Promise<BlogTag[]> {
    const { data } = await this.client.get('/blog/tags');
    return data.data;
  }

  async getBlogComments(slug: string): Promise<BlogComment[]> {
    const { data } = await this.client.get(`/blog/posts/${slug}/comments`);
    return data.data;
  }

  async createBlogComment(slug: string, body: string): Promise<BlogComment> {
    const { data } = await this.client.post(`/blog/posts/${slug}/comments`, { body });
    return data.data;
  }

  // ─── Loyalty ─────────────────────────────────────────────────────────────

  async getLoyaltyTiers(): Promise<LoyaltyTier[]> {
    const { data } = await this.client.get('/loyalty/tiers');
    return data.data;
  }

  async getLoyaltyBalance(): Promise<LoyaltyBalance> {
    const { data } = await this.client.get('/loyalty/balance');
    return data.data;
  }

  async getLoyaltyHistory(perPage = 20): Promise<PaginatedResponse<LoyaltyTransaction>> {
    const { data } = await this.client.get('/loyalty/history', { params: { per_page: perPage } });
    return data;
  }

  // ─── Newsletter ──────────────────────────────────────────────────────────

  async subscribeNewsletter(email: string, name?: string): Promise<void> {
    await this.client.post('/newsletter/subscribe', { email, name });
  }

  async unsubscribeNewsletter(token: string): Promise<void> {
    await this.client.delete(`/newsletter/unsubscribe/${token}`);
  }

  // ─── Notifications ───────────────────────────────────────────────────────

  async getNotifications(params?: { unread_only?: boolean; per_page?: number }): Promise<PaginatedResponse<Notification>> {
    const { data } = await this.client.get('/notifications', { params });
    return data;
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.client.post('/notifications/read-all');
  }

  async deleteNotification(id: string): Promise<void> {
    await this.client.delete(`/notifications/${id}`);
  }

  async registerPushToken(token: string, platform: 'ios' | 'android' | 'web'): Promise<void> {
    await this.client.post('/notifications/token', { token, platform });
  }

  // ─── Payment ─────────────────────────────────────────────────────────────

  async initializePayment(payload: {
    order_id: number;
    payment_method: 'credit_card' | 'bank_transfer';
    card?: Record<string, unknown>;
    installments?: number;
  }): Promise<PaymentInitResponse> {
    const { data } = await this.client.post('/payments/initialize', payload);
    return data.data;
  }

  async getPaymentStatus(paymentId: number): Promise<PaymentVerifyResponse> {
    const { data } = await this.client.get(`/payments/${paymentId}/status`);
    return data.data;
  }

  // ─── Returns ─────────────────────────────────────────────────────────────

  async getReturns(): Promise<PaginatedResponse<ReturnRequest>> {
    const { data } = await this.client.get('/returns');
    return data;
  }

  async getReturn(returnId: number): Promise<ReturnRequest> {
    const { data } = await this.client.get(`/returns/${returnId}`);
    return data.data;
  }

  async getOrderReturns(orderNumber: string): Promise<ReturnRequest[]> {
    const { data } = await this.client.get(`/orders/${orderNumber}/returns`);
    return data.data;
  }

  async createReturnRequest(
    orderNumber: string,
    payload: {
      items: Array<{ order_item_id: number; quantity: number }>;
      reason: string;
      description?: string;
    }
  ): Promise<ReturnRequest> {
    const { data } = await this.client.post(`/orders/${orderNumber}/returns`, payload);
    return data.data;
  }

  // ─── Support Tickets ─────────────────────────────────────────────────────

  async getTickets(status?: string): Promise<PaginatedResponse<Ticket>> {
    const { data } = await this.client.get('/tickets', { params: status ? { status } : undefined });
    return data;
  }

  async createTicket(payload: {
    subject: string;
    body: string;
    category: 'order' | 'payment' | 'shipping' | 'return' | 'product' | 'other';
    order_number?: string;
    priority?: 'low' | 'normal' | 'high';
  }): Promise<Ticket> {
    const { data } = await this.client.post('/tickets', payload);
    return data.data;
  }

  async getTicket(ticketNumber: string): Promise<Ticket> {
    const { data } = await this.client.get(`/tickets/${ticketNumber}`);
    return data.data;
  }

  async replyToTicket(ticketNumber: string, body: string): Promise<TicketReply> {
    const { data } = await this.client.post(`/tickets/${ticketNumber}/replies`, { body });
    return data.data;
  }

  async closeTicket(ticketNumber: string): Promise<void> {
    await this.client.put(`/tickets/${ticketNumber}/close`);
  }
}

export const api = new ApiClient();
