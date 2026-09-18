export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  address?: string;
  city?: string;
  pincode?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  originalPrice?: number;
  brand: string;
  image: string;
  stock: number;
  rating: number;
  reviewsCount: number;
  specifications: Record<string, string>;
  usageInfo: string;
  isEssential?: boolean;
  requiresPrescription?: boolean;
  dosageForm?: string;
  scheduleType?: string;
  createdAt: string;
}

export interface KitItem {
  productId: string;
  quantity: number;
  name?: string;
  price?: number;
}

export interface KitCalculationItem {
  product: Product;
  quantity: number;
  itemTotal: number;
}

export interface KitCalculation {
  normalPrice: number;
  bundlePrice: number;
  savings: number;
  discountPercentage: number;
  items: KitCalculationItem[];
}

export interface Kit {
  id: string;
  name: string;
  description: string;
  category: string;
  situation: string;
  image: string;
  items: KitItem[];
  normalPrice: number;
  bundlePrice: number;
  totalPrice?: number;
  savings: number;
  discountPercentage?: number;
  isPopular?: boolean;
  calculated?: KitCalculation;
  createdAt: string;
}

export type OrderStatus = 'Order Placed' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface CartItem {
  id: string;
  productId?: string;
  kitId?: string;
  isKit?: boolean;
  isCustomKit?: boolean;
  customKitName?: string;
  customKitItems?: Array<{ productId: string; quantity: number; price: number; name: string }>;
  quantity: number;
  price: number;
  normalPrice?: number;
  savings?: number;
  name: string;
  image: string;
  category?: string;
  requiresPrescription?: boolean;
}

export interface CartSummary {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  bundleDiscount: number;
  deliveryFee: number;
  finalTotal: number;
  freeDeliveryThreshold: number;
  amountForFreeDelivery: number;
  hasPrescriptionItems?: boolean;
}

export interface OrderItem {
  id?: string;
  productId?: string;
  kitId?: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  isKit?: boolean;
  kitItemsSummary?: string;
  requiresPrescription?: boolean;
  prescriptionId?: string;
}

export interface TrackingHistoryStep {
  status: OrderStatus;
  timestamp: string;
  description: string;
  location: string;
}

export interface Prescription {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  patientName: string;
  doctorName: string;
  hospitalOrClinic?: string;
  prescriptionDate: string;
  fileUrl: string;
  fileName: string;
  fileSize?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  uploadedAt: string;
  createdAt?: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  kitId?: string;
  kitName?: string;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  totalAmount: number;
  address: {
    fullName: string;
    phone: string;
    email: string;
    streetAddress: string;
    city: string;
    pincode: string;
  };
  shippingDetails?: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    pincode: string;
  };
  estimatedDelivery?: string;
  paymentMethod: 'cod' | 'online_simulated';
  status: OrderStatus;
  hasPrescriptionItems?: boolean;
  requiresPrescription?: boolean;
  prescriptionRequired?: boolean;
  prescriptionId?: string;
  prescriptionStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  trackingHistory: TrackingHistoryStep[];
  createdAt: string;
  deliveredAt?: string;
}

export interface SavedKit {
  id: string;
  userId: string;
  name: string;
  purpose: string;
  items: Array<{ productId: string; quantity: number }>;
  bundlePrice: number;
  normalPrice: number;
  savings: number;
  calculation?: KitCalculation;
  createdAt: string;
  updatedAt: string;
}

export type CustomKit = SavedKit;

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  orderId?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AdminAnalytics {
  metrics: {
    totalSales: number;
    totalOrders: number;
    totalCustomers: number;
    lowStockCount: number;
    activeOrdersCount: number;
    pendingPrescriptionsCount?: number;
  };
  totalSales?: number;
  totalOrders?: number;
  totalCustomers?: number;
  lowStockCount?: number;
  pendingPrescriptionsCount?: number;
  popularItems?: Array<{ id: string; name: string; orderCount: number; price: number }>;
  lowStockProducts: Product[];
  topProducts: Array<{ name: string; count: number; revenue: number; image: string }>;
  topKits: Array<{ name: string; count: number; revenue: number }>;
  recentOrders: Order[];
  categoryCounts: Array<{ name: string; count: number }>;
  prescriptions?: Prescription[];
}
