import React, { useState, useEffect } from 'react';
import {
  Package,
  Layers,
  Heart,
  User,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Trash2,
  Edit,
  Clock,
  CheckCircle2,
  Plus,
  ShoppingBag,
} from 'lucide-react';
import { Order, CustomKit, Product } from '../types.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';
import { useWishlist } from '../context/WishlistContext.js';
import { useToast } from '../context/ToastContext.js';

interface UserDashboardViewProps {
  initialTab?: 'overview' | 'orders' | 'kits' | 'wishlist';
  products: Product[];
  onTrackOrder: (orderId: string) => void;
  onOpenKitBuilder: () => void;
  onSelectProduct: (product: Product) => void;
}

export function UserDashboardView({
  initialTab = 'overview',
  products,
  onTrackOrder,
  onOpenKitBuilder,
  onSelectProduct,
}: UserDashboardViewProps) {
  const { user } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'kits' | 'wishlist'>(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [savedKits, setSavedKits] = useState<CustomKit[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersRes, kitsRes] = await Promise.all([
        api.orders.getAll(),
        api.myKits.getAll(),
      ]);
      setOrders(ordersRes.orders);
      setSavedKits(kitsRes.kits || kitsRes.savedKits || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeOrders = orders.filter(o => o.status !== 'Delivered' && (o.status as any) !== 'Cancelled');
  const pastOrders = orders.filter(o => o.status === 'Delivered');

  // Reorder Kit handler
  const handleReorder = async (orderId: string) => {
    try {
      const res = await api.orders.reorder(orderId);
      showToast('savings', 'Kit Reordered', res.message || 'Items added to your MediBasket');
      setIsCartOpen(true);
    } catch (err: any) {
      showToast('error', 'Reorder failed', err.message);
    }
  };

  // Add saved custom kit to cart
  const handleAddSavedKitToCart = async (kit: CustomKit) => {
    const customItems = kit.items.map((item: any) => {
      const prod = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: prod?.price || 100,
        name: prod?.name || 'Essential Item',
      };
    });

    await addToCart({
      isCustomKit: true,
      customKitName: kit.name,
      customKitItems: customItems,
      quantity: 1,
    });
    setIsCartOpen(true);
  };

  // Delete saved kit
  const handleDeleteSavedKit = async (kitId: string) => {
    try {
      await api.myKits.delete(kitId);
      setSavedKits(prev => prev.filter(k => k.id !== kitId));
      showToast('info', 'Kit Deleted', 'Removed from your saved collections.');
    } catch (err: any) {
      showToast('error', 'Delete failed', err.message);
    }
  };

  // Wishlist products
  const wishlistedProducts = products.filter(p => wishlistIds.has(p.id));

  return (
    <div id="user-dashboard-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-teal-700 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-md mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-black text-2xl">
              {user?.name.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{user?.name || 'Customer Account'}</h1>
                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  VERIFIED
                </span>
              </div>
              <p className="text-teal-100 text-xs mt-0.5">{user?.email || 'customer@medibasket.com'}</p>
            </div>
          </div>

          <button
            onClick={onOpenKitBuilder}
            className="px-5 py-2.5 bg-white text-teal-800 rounded-xl font-bold text-xs hover:bg-teal-50 flex items-center gap-2 shadow-xs transition-colors"
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Build New Custom Kit</span>
          </button>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl">
            <div className="text-xs text-teal-100 font-medium">Total Orders</div>
            <div className="text-2xl font-black mt-0.5">{orders.length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl">
            <div className="text-xs text-teal-100 font-medium">Active Shipments</div>
            <div className="text-2xl font-black mt-0.5 text-amber-300">{activeOrders.length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl">
            <div className="text-xs text-teal-100 font-medium">Saved Kits</div>
            <div className="text-2xl font-black mt-0.5">{savedKits.length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl">
            <div className="text-xs text-teal-100 font-medium">Wishlist Items</div>
            <div className="text-2xl font-black mt-0.5">{wishlistIds.size}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-2">
        {[
          { id: 'overview', label: 'Overview', icon: User },
          { id: 'orders', label: `Orders (${orders.length})`, icon: Package },
          { id: 'kits', label: `My Saved Kits (${savedKits.length})`, icon: Layers },
          { id: 'wishlist', label: `Saved Favorites (${wishlistIds.size})`, icon: Heart },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-teal-600 text-teal-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Active Orders Highlight */}
          {activeOrders.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                Active Shipments in Transit
              </h3>
              <div className="space-y-3">
                {activeOrders.map(order => (
                  <div
                    key={order.id}
                    className="p-4 rounded-xl border border-teal-200 bg-teal-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">Order #{order.id}</span>
                        <span className="text-[10px] font-bold bg-teal-600 text-white px-2 py-0.5 rounded-full">
                          {order.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        {order.items.length} Emergency items • Estimated arrival: <strong>{order.estimatedDelivery || 'Within 2 business days'}</strong>
                      </div>
                    </div>
                    <button
                      onClick={() => onTrackOrder(order.id)}
                      className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-teal-700 flex items-center gap-1.5 w-fit"
                    >
                      <span>Track Order</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick links to My Kits & Orders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-600" />
                  <span>My Saved Kits</span>
                </h3>
                <button
                  onClick={() => setActiveTab('kits')}
                  className="text-xs text-teal-700 font-semibold hover:underline"
                >
                  View All &rarr;
                </button>
              </div>
              {savedKits.length === 0 ? (
                <p className="text-xs text-slate-500">No custom kits saved yet.</p>
              ) : (
                <div className="space-y-2">
                  {savedKits.slice(0, 3).map(k => (
                    <div key={k.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800">{k.name}</span>
                        <div className="text-[10px] text-slate-500">{k.items.length} items • {k.purpose}</div>
                      </div>
                      <button
                        onClick={() => handleAddSavedKitToCart(k)}
                        className="text-teal-700 font-semibold hover:underline flex items-center gap-1"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-teal-600" />
                  <span>Recent Orders</span>
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-teal-700 font-semibold hover:underline"
                >
                  View All &rarr;
                </button>
              </div>
              {orders.length === 0 ? (
                <p className="text-xs text-slate-500">No orders yet.</p>
              ) : (
                <div className="space-y-2">
                  {orders.slice(0, 3).map(o => (
                    <div key={o.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800">Order #{o.id}</span>
                        <div className="text-[10px] text-slate-500">₹{o.totalAmount} • {o.status}</div>
                      </div>
                      <button
                        onClick={() => onTrackOrder(o.id)}
                        className="text-teal-700 font-semibold hover:underline"
                      >
                        Track
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">Order History & Reordering</h2>
          {orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">You haven't placed any orders yet</p>
            </div>
          ) : (
            orders.map(order => (
              <div
                key={order.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-extrabold text-sm text-slate-900">Order #{order.id}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      order.status === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-teal-100 text-teal-800'
                    }`}>
                      {order.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-slate-600">
                    <span>{order.items.length} items: </span>
                    <span className="font-medium text-slate-800">
                      {order.items.map(i => i.name).slice(0, 3).join(', ')}
                      {order.items.length > 3 ? ` + ${order.items.length - 3} more` : ''}
                    </span>
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    Total: <strong className="text-slate-900">₹{order.totalAmount}</strong> • {order.paymentMethod}
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {/* UNIQUE FEATURE 4: 1-Click Reorder Kit */}
                  <button
                    onClick={() => handleReorder(order.id)}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 text-white font-semibold text-xs hover:bg-amber-600 flex items-center gap-1.5 transition-colors shadow-xs"
                    title="1-Click Reorder this Kit"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reorder Kit</span>
                  </button>

                  <button
                    onClick={() => onTrackOrder(order.id)}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
                  >
                    <span>View Tracking</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SAVED KITS TAB */}
      {activeTab === 'kits' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">My Custom Emergency Kits</h2>
            <button
              onClick={onOpenKitBuilder}
              className="px-3 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-teal-700 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Kit</span>
            </button>
          </div>

          {savedKits.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <Layers className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No custom kits saved yet</p>
              <button
                onClick={onOpenKitBuilder}
                className="mt-3 text-xs text-teal-700 font-semibold hover:underline"
              >
                Use the Custom Kit Builder &rarr;
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedKits.map(kit => (
                <div
                  key={kit.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                          {kit.purpose} Kit
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 mt-1">{kit.name}</h3>
                      </div>
                      <button
                        onClick={() => handleDeleteSavedKit(kit.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Delete Kit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-3 text-xs text-slate-600">
                      <strong>Contains {kit.items.length} Products:</strong>
                      <ul className="mt-1 space-y-1 text-slate-500">
                        {kit.items.slice(0, 3).map((item: any) => {
                          const p = products.find(prod => prod.id === item.productId);
                          return (
                            <li key={item.productId} className="truncate">
                              • {p ? p.name : 'Item'} (Qty: {item.quantity})
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      Saved on {new Date(kit.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleAddSavedKitToCart(kit)}
                      className="px-4 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700 flex items-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add Kit to Cart</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* WISHLIST TAB */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">Saved Favorite Essentials</h2>
          {wishlistedProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <Heart className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No favorites saved</p>
              <p className="text-xs text-slate-500 mt-0.5">Click the heart icon on any product card to bookmark it.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {wishlistedProducts.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <img src={p.image} alt={p.name} className="w-full h-36 object-cover rounded-xl mb-3" />
                    <span className="text-[10px] font-bold text-slate-500">{p.category}</span>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-2 mt-0.5">{p.name}</h3>
                    <div className="text-sm font-bold text-slate-900 mt-2">₹{p.price}</div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => toggleWishlist(p.id)}
                      className="text-xs text-rose-600 hover:underline"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => addToCart({ productId: p.id, quantity: 1 })}
                      className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
