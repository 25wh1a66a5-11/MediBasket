import fs from 'fs';
import path from 'path';

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
  createdAt: string;
}

export interface KitItem {
  productId: string;
  quantity: number;
}

export interface Kit {
  id: string;
  name: string;
  description: string;
  category: string; // e.g., College, Travel, Sports, Home, Office, Monsoon, Hostel, Outdoor
  situation: string;
  image: string;
  items: KitItem[];
  normalPrice: number;
  bundlePrice: number;
  savings: number;
  isPopular?: boolean;
  createdAt: string;
}

export interface CartItem {
  id: string; // cart item unique id
  productId?: string;
  kitId?: string;
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
}

export interface OrderItem {
  productId?: string;
  kitId?: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  isKit?: boolean;
  kitItemsSummary?: string;
}

export interface Order {
  id: string; // e.g. MB-7842
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
  paymentMethod: 'cod' | 'online_simulated';
  status: 'Order Placed' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered';
  trackingHistory: Array<{
    status: 'Order Placed' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered';
    timestamp: string;
    description: string;
    location: string;
  }>;
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
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  orderId?: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface DatabaseSchema {
  users: User[];
  products: Product[];
  categories: Array<{ id: string; name: string; icon: string; description: string }>;
  kits: Kit[];
  cart: CartItem[];
  orders: Order[];
  savedKits: SavedKit[];
  wishlist: WishlistItem[];
  reviews: Review[];
}

// MongoDB Collection emulation class with persistent file storage
export class MongoCollection<T extends { id: string }> {
  private getItems: () => T[];
  private setItems: (items: T[]) => void;

  constructor(getter: () => T[], setter: (items: T[]) => void) {
    this.getItems = getter;
    this.setItems = setter;
  }

  find(filter?: Partial<Record<keyof T, any>> | ((item: T) => boolean)): T[] {
    const items = this.getItems();
    if (!filter) return [...items];
    if (typeof filter === 'function') {
      return items.filter(filter);
    }
    return items.filter(item => {
      for (const key in filter) {
        if (item[key] !== filter[key]) return false;
      }
      return true;
    });
  }

  findOne(filter: Partial<Record<keyof T, any>> | ((item: T) => boolean)): T | null {
    const results = this.find(filter);
    return results.length > 0 ? { ...results[0] } : null;
  }

  findById(id: string): T | null {
    return this.findOne({ id } as any);
  }

  insertOne(doc: T): T {
    const items = this.getItems();
    const newDoc = { ...doc };
    items.push(newDoc);
    this.setItems(items);
    return newDoc;
  }

  insertMany(docs: T[]): T[] {
    const items = this.getItems();
    const cloned = docs.map(d => ({ ...d }));
    items.push(...cloned);
    this.setItems(items);
    return cloned;
  }

  updateOne(
    filter: Partial<Record<keyof T, any>> | ((item: T) => boolean),
    update: Partial<T>
  ): boolean {
    const items = this.getItems();
    const index = items.findIndex(item => {
      if (typeof filter === 'function') return filter(item);
      for (const key in filter) {
        if (item[key] !== filter[key]) return false;
      }
      return true;
    });

    if (index === -1) return false;
    items[index] = { ...items[index], ...update };
    this.setItems(items);
    return true;
  }

  deleteOne(filter: Partial<Record<keyof T, any>> | ((item: T) => boolean)): boolean {
    const items = this.getItems();
    const initialLen = items.length;
    const filtered = items.filter(item => {
      if (typeof filter === 'function') return !filter(item);
      for (const key in filter) {
        if (item[key] !== filter[key]) return true;
      }
      return false;
    });

    if (filtered.length === initialLen) return false;
    this.setItems(filtered);
    return true;
  }

  deleteMany(filter: Partial<Record<keyof T, any>> | ((item: T) => boolean)): number {
    const items = this.getItems();
    const initialLen = items.length;
    const filtered = items.filter(item => {
      if (typeof filter === 'function') return !filter(item);
      for (const key in filter) {
        if (item[key] !== filter[key]) return true;
      }
      return false;
    });
    this.setItems(filtered);
    return initialLen - filtered.length;
  }

  countDocuments(filter?: Partial<Record<keyof T, any>> | ((item: T) => boolean)): number {
    return this.find(filter).length;
  }
}

class MediBasketDatabase {
  private dataFilePath: string;
  private db: DatabaseSchema;

  constructor() {
    this.dataFilePath = path.join(process.cwd(), 'server', 'data.json');
    this.db = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(this.dataFilePath)) {
        const raw = fs.readFileSync(this.dataFilePath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error loading db.json, initializing fresh data', e);
    }
    return {
      users: [],
      products: [],
      categories: [],
      kits: [],
      cart: [],
      orders: [],
      savedKits: [],
      wishlist: [],
      reviews: [],
    };
  }

  public saveData(): void {
    try {
      const dir = path.dirname(this.dataFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.dataFilePath, JSON.stringify(this.db, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist db.json', e);
    }
  }

  public getRawData(): DatabaseSchema {
    return this.db;
  }

  public setRawData(newData: DatabaseSchema): void {
    this.db = newData;
    this.saveData();
  }

  // MongoDB Collection Accessors
  get users(): MongoCollection<User> {
    return new MongoCollection(
      () => this.db.users,
      items => {
        this.db.users = items;
        this.saveData();
      }
    );
  }

  get products(): MongoCollection<Product> {
    return new MongoCollection(
      () => this.db.products,
      items => {
        this.db.products = items;
        this.saveData();
      }
    );
  }

  get categories(): MongoCollection<{ id: string; name: string; icon: string; description: string }> {
    return new MongoCollection(
      () => this.db.categories,
      items => {
        this.db.categories = items;
        this.saveData();
      }
    );
  }

  get kits(): MongoCollection<Kit> {
    return new MongoCollection(
      () => this.db.kits,
      items => {
        this.db.kits = items;
        this.saveData();
      }
    );
  }

  get cart(): MongoCollection<CartItem> {
    return new MongoCollection(
      () => this.db.cart,
      items => {
        this.db.cart = items;
        this.saveData();
      }
    );
  }

  get orders(): MongoCollection<Order> {
    return new MongoCollection(
      () => this.db.orders,
      items => {
        this.db.orders = items;
        this.saveData();
      }
    );
  }

  get savedKits(): MongoCollection<SavedKit> {
    return new MongoCollection(
      () => this.db.savedKits,
      items => {
        this.db.savedKits = items;
        this.saveData();
      }
    );
  }

  get wishlist(): MongoCollection<WishlistItem> {
    return new MongoCollection(
      () => this.db.wishlist,
      items => {
        this.db.wishlist = items;
        this.saveData();
      }
    );
  }

  get reviews(): MongoCollection<Review> {
    return new MongoCollection(
      () => this.db.reviews,
      items => {
        this.db.reviews = items;
        this.saveData();
      }
    );
  }
}

export const mongoDb = new MediBasketDatabase();
