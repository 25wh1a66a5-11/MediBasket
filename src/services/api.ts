import {
  Product,
  Kit,
  KitCalculation,
  CartSummary,
  Order,
  User,
  SavedKit,
  Review,
  Category,
  AdminAnalytics,
} from '../types.js';

const BASE_URL = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    let errorMsg = 'Network request failed';
    try {
      const data = await res.json();
      errorMsg = data.error || data.message || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  // Auth
  auth: {
    me: () => fetchJson<{ user: User }>('/auth/me'),
    login: (credentials: { email: string; password?: string }) =>
      fetchJson<{ message: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (data: Partial<User>) =>
      fetchJson<{ message: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    logout: () => fetchJson<{ message: string }>('/auth/logout', { method: 'POST' }),
    switchRole: (role: 'user' | 'admin') =>
      fetchJson<{ message: string; user: User }>('/auth/switch-role', {
        method: 'POST',
        body: JSON.stringify({ role }),
      }),
    updateProfile: (data: Partial<User>) =>
      fetchJson<{ message: string; user: User }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  // Categories
  categories: {
    getAll: () => fetchJson<{ categories: Category[] }>('/categories'),
  },

  // Products
  products: {
    getAll: (params?: {
      search?: string;
      category?: string;
      brand?: string;
      minPrice?: number;
      maxPrice?: number;
      rating?: number;
      inStock?: boolean;
      sort?: string;
    }) => {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.category) query.append('category', params.category);
      if (params?.brand) query.append('brand', params.brand);
      if (params?.minPrice !== undefined) query.append('minPrice', String(params.minPrice));
      if (params?.maxPrice !== undefined) query.append('maxPrice', String(params.maxPrice));
      if (params?.rating) query.append('rating', String(params.rating));
      if (params?.inStock) query.append('inStock', 'true');
      if (params?.sort) query.append('sort', params.sort);
      return fetchJson<{ products: Product[]; total: number; brands: string[] }>(`/products?${query.toString()}`);
    },
    getById: (id: string) => fetchJson<{ product: Product; reviews: Review[] }>(`/products/${id}`),
    create: (data: Partial<Product>) =>
      fetchJson<{ message: string; product: Product }>('/products', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Product>) =>
      fetchJson<{ message: string; product: Product }>(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) => fetchJson<{ message: string }>(`/products/${id}`, { method: 'DELETE' }),
  },

  // Kits
  kits: {
    getAll: (situation?: string) => {
      const q = situation && situation !== 'All' ? `?situation=${encodeURIComponent(situation)}` : '';
      return fetchJson<{ kits: Kit[] }>(`/kits${q}`);
    },
    getById: (id: string) => fetchJson<{ kit: Kit & { calculation: KitCalculation } }>(`/kits/${id}`),
    calculate: (items: Array<{ productId: string; quantity: number }>) =>
      fetchJson<KitCalculation>('/kits/calculate', {
        method: 'POST',
        body: JSON.stringify({ items }),
      }),
    create: (data: any) =>
      fetchJson<{ message: string; kit: Kit }>('/kits', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchJson<{ message: string; kit: Kit }>(`/kits/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) => fetchJson<{ message: string }>(`/kits/${id}`, { method: 'DELETE' }),
  },

  // Cart
  cart: {
    get: () => fetchJson<CartSummary>('/cart'),
    add: (payload: {
      productId?: string;
      kitId?: string;
      isCustomKit?: boolean;
      customKitName?: string;
      customKitItems?: Array<{ productId: string; quantity: number; price: number; name: string }>;
      quantity?: number;
    }) =>
      fetchJson<{ message: string; item: any }>('/cart/add', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    updateQuantity: (id: string, quantity: number) =>
      fetchJson<{ message: string; item: any }>(`/cart/item/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      }),
    removeItem: (id: string) => fetchJson<{ message: string }>(`/cart/item/${id}`, { method: 'DELETE' }),
    clear: () => fetchJson<{ message: string }>('/cart/clear', { method: 'DELETE' }),
  },

  // Orders
  orders: {
    create: (payload: { address: any; paymentMethod: string; directItem?: any }) =>
      fetchJson<{ message: string; order: Order }>('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    getAll: () => fetchJson<{ orders: Order[] }>('/orders'),
    getById: (id: string) => fetchJson<{ order: Order }>(`/orders/${id}`),
    track: (id: string) =>
      fetchJson<{
        orderId: string;
        status: string;
        currentStepIndex: number;
        steps: Array<{ name: string; isCompleted: boolean; isCurrent: boolean; historyEntry?: any }>;
        trackingHistory: any[];
        items: any[];
        totalAmount: number;
        address: any;
        canReorderKit: boolean;
        kitId?: string;
      }>(`/orders/${id}/track`),
    reorderKit: (orderId: string) =>
      fetchJson<{ message: string; cartItem: any }>(`/orders/${orderId}/reorder-kit`, {
        method: 'POST',
      }),
    reorder: (orderId: string) =>
      fetchJson<{ message: string; cartItem: any }>(`/orders/${orderId}/reorder-kit`, {
        method: 'POST',
      }),
    updateStatus: (orderId: string, status: string, note?: string) =>
      fetchJson<{ message: string; order: Order }>(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, note }),
      }),
  },

  // Saved Kits (My Kits)
  myKits: {
    getAll: () => fetchJson<{ savedKits: SavedKit[]; kits?: SavedKit[] }>('/my-kits').then(res => ({
      savedKits: res.savedKits,
      kits: res.savedKits,
    })),
    create: (data: { name: string; purpose: string; items: Array<{ productId: string; quantity: number }> }) =>
      fetchJson<{ message: string; savedKit: SavedKit }>('/my-kits', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchJson<{ message: string; savedKit: SavedKit }>(`/my-kits/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) => fetchJson<{ message: string }>(`/my-kits/${id}`, { method: 'DELETE' }),
    addToCart: (id: string) =>
      fetchJson<{ message: string; cartItem: any }>(`/my-kits/${id}/add-to-cart`, {
        method: 'POST',
      }),
  },

  // Wishlist
  wishlist: {
    getAll: () => fetchJson<{ wishlist: Array<{ id: string; productId: string; product: Product }> }>('/wishlist'),
    toggle: (productId: string) =>
      fetchJson<{ message: string; inWishlist: boolean }>('/wishlist/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId }),
      }),
  },

  // Reviews
  reviews: {
    getByProduct: (productId: string) => fetchJson<{ reviews: Review[] }>(`/reviews/product/${productId}`),
    submit: (data: { productId: string; rating: number; comment: string; orderId?: string }) =>
      fetchJson<{ message: string; review: Review; updatedProductRating: number; reviewsCount: number }>('/reviews', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Admin
  admin: {
    getAnalytics: () =>
      fetchJson<AdminAnalytics>('/admin/analytics').then(data => ({
        ...data,
        totalSales: data.metrics?.totalSales || 0,
        totalOrders: data.metrics?.totalOrders || 0,
        totalCustomers: data.metrics?.totalCustomers || 0,
        lowStockCount: data.metrics?.lowStockCount || data.lowStockProducts?.length || 0,
        popularItems: data.topProducts?.map(tp => ({
          id: tp.name,
          name: tp.name,
          orderCount: tp.count,
          price: Math.round(tp.revenue / Math.max(1, tp.count)),
        })) || [],
      })),
    getOrders: () => fetchJson<{ orders: Order[] }>('/orders'),
    updateOrderStatus: (orderId: string, status: string, note?: string) =>
      fetchJson<{ message: string; order: Order }>(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, note }),
      }),
    updateProduct: (id: string, data: Partial<Product>) =>
      fetchJson<{ message: string; product: Product }>(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    createProduct: (data: Partial<Product>) =>
      fetchJson<{ message: string; product: Product }>('/products', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    restock: (productId: string, quantity?: number) =>
      fetchJson<{ message: string; product: Product }>(`/admin/restock/${productId}`, {
        method: 'POST',
        body: JSON.stringify({ quantity }),
      }),
    resetData: () => fetchJson<{ message: string }>('/admin/reset-data', { method: 'POST' }),
  },
};
