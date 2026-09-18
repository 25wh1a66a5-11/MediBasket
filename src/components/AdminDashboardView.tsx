import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  Users,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Truck,
  RotateCcw,
  Sparkles,
  Layers,
  Save,
  X,
  Search,
} from 'lucide-react';
import { Product, Kit, Order, OrderStatus, AdminAnalytics } from '../types.js';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';

interface AdminDashboardViewProps {
  products: Product[];
  kits: Kit[];
  onRefreshProducts: () => void;
  onRefreshKits: () => void;
}

export function AdminDashboardView({
  products,
  kits,
  onRefreshProducts,
  onRefreshKits,
}: AdminDashboardViewProps) {
  const { showToast } = useToast();

  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminTab, setAdminTab] = useState<'analytics' | 'inventory' | 'orders' | 'kits'>('analytics');

  // Stock edit states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // New product form
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'First Aid',
    brand: 'MediCare Pro',
    price: 150,
    originalPrice: 199,
    stock: 25,
    description: '',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400',
    usageInfo: 'Open packaging in clean dry area. For external emergency use only.',
    specifications: { Sterility: 'Gamma-Sterilized', Expiry: '36 Months' },
  });

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [analyticsData, ordersData] = await Promise.all([
        api.admin.getAnalytics(),
        api.admin.getOrders(),
      ]);
      setAnalytics(analyticsData);
      setOrders(ordersData.orders);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await api.admin.updateOrderStatus(orderId, newStatus);
      showToast('success', 'Order Updated', `Order #${orderId} moved to "${newStatus}"`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err: any) {
      showToast('error', 'Update failed', err.message);
    }
  };

  // Quick Restock (+10 units)
  const handleQuickRestock = async (productId: string) => {
    const p = products.find(prod => prod.id === productId);
    if (!p) return;
    try {
      await api.admin.updateProduct(productId, { stock: p.stock + 10 });
      showToast('success', 'Stock Replenished', `Added 10 units to ${p.name}`);
      onRefreshProducts();
      loadAdminData();
    } catch (err: any) {
      showToast('error', 'Restock failed', err.message);
    }
  };

  // Save edited product
  const handleSaveProductEdit = async () => {
    if (!editingProduct) return;
    try {
      await api.admin.updateProduct(editingProduct.id, {
        price: Number(editingProduct.price),
        stock: Number(editingProduct.stock),
        name: editingProduct.name,
      });
      showToast('success', 'Product Updated', `${editingProduct.name} saved successfully.`);
      setEditingProduct(null);
      onRefreshProducts();
      loadAdminData();
    } catch (err: any) {
      showToast('error', 'Save failed', err.message);
    }
  };

  // Create new product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.admin.createProduct(newProduct as any);
      showToast('success', 'Product Created', `Added ${newProduct.name} to catalog`);
      setShowAddProductModal(false);
      onRefreshProducts();
      loadAdminData();
      setNewProduct({
        name: '',
        category: 'First Aid',
        brand: 'MediCare Pro',
        price: 150,
        originalPrice: 199,
        stock: 25,
        description: '',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400',
        usageInfo: 'Open packaging in clean dry area. For external emergency use only.',
        specifications: { Sterility: 'Gamma-Sterilized', Expiry: '36 Months' },
      });
    } catch (err: any) {
      showToast('error', 'Create failed', err.message);
    }
  };

  // Reset demo seed data
  const handleResetData = async () => {
    if (window.confirm('Reset database to clean seed state? This is ideal for resetting the demo.')) {
      try {
        await api.admin.resetData();
        showToast('info', 'Reset Complete', 'Database restored to initial pristine seed data.');
        onRefreshProducts();
        onRefreshKits();
        loadAdminData();
      } catch (err: any) {
        showToast('error', 'Reset failed', err.message);
      }
    }
  };

  const statusOptions: OrderStatus[] = [
    'Order Placed',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered',
  ];

  return (
    <div id="admin-dashboard-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Admin Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded tracking-wider">
                ADMIN CONTROL CENTER
              </span>
              <span className="text-slate-400 text-xs">MediBasket Operations Hub</span>
            </div>
            <h1 className="text-2xl font-black mt-1">Platform Metrics & Emergency Inventory</h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowAddProductModal(true)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Product</span>
            </button>

            <button
              onClick={handleResetData}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium text-xs flex items-center gap-1.5 border border-slate-700"
              title="Restore initial seed catalog"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Seed Demo</span>
            </button>
          </div>
        </div>

        {/* 4 Metrics Cards */}
        {analytics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Total Revenue</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white mt-1">₹{analytics.totalSales}</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">+18.4% from last week</div>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Total Orders</span>
                <Package className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-black text-white mt-1">{analytics.totalOrders}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Across all situation categories</div>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Total Customers</span>
                <Users className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-white mt-1">{analytics.totalCustomers}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Active verified sessions</div>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Low Stock Items</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-300 mt-1">
                {analytics.lowStockCount} Items
              </div>
              <div className="text-[10px] text-amber-400 mt-0.5">Threshold &le; 5 units</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-2">
        {[
          { id: 'analytics', label: 'Analytics & Trends' },
          { id: 'inventory', label: `Inventory & Pricing (${products.length})` },
          { id: 'orders', label: `Customer Orders (${orders.length})` },
          { id: 'kits', label: `Pre-Built Situation Kits (${kits.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setAdminTab(tab.id as any)}
            className={`pb-3 px-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              adminTab === tab.id
                ? 'border-teal-600 text-teal-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: ANALYTICS */}
      {adminTab === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* Low Stock Urgent Callout */}
          {analytics.lowStockProducts.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <h3 className="font-bold text-sm text-rose-900">
                    Low Stock Alert ({analytics.lowStockProducts.length} items &le; 5 units)
                  </h3>
                </div>
                <span className="text-[11px] text-rose-700 font-medium">Auto-Flagged by MediBasket Engine</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {analytics.lowStockProducts.map(p => (
                  <div key={p.id} className="p-2.5 bg-white rounded-xl border border-rose-200 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-xs text-slate-800 truncate max-w-[160px]">{p.name}</div>
                      <div className="text-[11px] text-rose-600 font-bold">Only {p.stock} units remaining!</div>
                    </div>
                    <button
                      onClick={() => handleQuickRestock(p.id)}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-semibold"
                    >
                      +10 Restock
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popular Items Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Popular Emergency Items (Demand Leaderboard)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(analytics.popularItems || []).map((item, idx) => (
                <div key={item.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-black text-xs flex items-center justify-center">
                    #{idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900 truncate">{item.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {item.orderCount} kit/order inclusions • ₹{item.price}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVENTORY & PRICING TABLE */}
      {adminTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Products Catalog Management</h3>
            <span className="text-xs text-slate-500">Edit price, stock, or restock in real-time</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price (₹)</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 flex items-center gap-2.5">
                      <img src={p.image} alt={p.name} className="w-8 h-8 rounded object-cover" />
                      <div>
                        <div className="font-semibold text-slate-900 truncate max-w-[200px]">{p.name}</div>
                        <div className="text-[10px] text-slate-400">{p.brand}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{p.category}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">₹{p.price}</td>
                    <td className="py-3 px-4">
                      <span className={`font-bold px-2 py-0.5 rounded-full ${
                        p.stock <= 5 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-3 px-4 text-amber-600 font-semibold">{p.rating} ★</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleQuickRestock(p.id)}
                        className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded font-semibold text-[11px]"
                      >
                        +10
                      </button>
                      <button
                        onClick={() => setEditingProduct({ ...p })}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-[11px]"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOMER ORDERS MANAGEMENT */}
      {adminTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Customer Orders Live Management</h3>
            <span className="text-xs text-slate-500">Update status to advance tracking timeline</span>
          </div>

          <div className="divide-y divide-slate-100">
            {orders.map(order => (
              <div key={order.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">Order #{order.id}</span>
                    <span className="text-xs text-slate-400">
                      • {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                      ₹{order.totalAmount}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 mt-1">
                    <strong>Customer:</strong> {order.address?.fullName || order.shippingDetails?.name || 'Customer'} ({order.address?.phone || order.shippingDetails?.phone || ''}), {order.address?.city || order.shippingDetails?.city || ''}
                  </div>

                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Set Status:</span>
                  <select
                    value={order.status}
                    onChange={e => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 focus:outline-none focus:border-teal-500 cursor-pointer"
                  >
                    {statusOptions.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PRE-BUILT KITS */}
      {adminTab === 'kits' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {kits.map(kit => (
            <div key={kit.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                  {kit.situation}
                </span>
                <h4 className="font-bold text-sm text-slate-900 mt-1">{kit.name}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{kit.description}</p>
                <div className="mt-3 text-xs text-slate-600">
                  Includes {kit.items.length} products • Savings: <strong>₹{kit.savings}</strong>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 line-through">₹{kit.normalPrice}</span>
                  <span className="text-base font-bold text-slate-900 ml-1.5">₹{kit.bundlePrice}</span>
                </div>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  Pre-Configured Bundle
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Edit {editingProduct.name}</h3>
              <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={editingProduct.price}
                  onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Stock Units</label>
                <input
                  type="number"
                  value={editingProduct.stock}
                  onChange={e => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProductEdit}
                className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <form onSubmit={handleCreateProduct} className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-200 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Add New Healthcare Essential</h3>
              <button type="button" onClick={() => setShowAddProductModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. Sterile Eye Wash 250ml"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                <select
                  value={newProduct.category}
                  onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="First Aid">First Aid</option>
                  <option value="Hygiene">Hygiene</option>
                  <option value="Personal Care">Personal Care</option>
                  <option value="Emergency Essentials">Emergency Essentials</option>
                  <option value="Travel Essentials">Travel Essentials</option>
                  <option value="Sports Care">Sports Care</option>
                  <option value="College Essentials">College Essentials</option>
                  <option value="Home Essentials">Home Essentials</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Brand *</label>
                <input
                  type="text"
                  required
                  value={newProduct.brand}
                  onChange={e => setNewProduct({ ...newProduct, brand: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={newProduct.price}
                  onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial Stock Units *</label>
                <input
                  type="number"
                  required
                  value={newProduct.stock}
                  onChange={e => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  required
                  rows={2}
                  value={newProduct.description}
                  onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Over-the-counter sterile healthcare emergency item..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddProductModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700"
              >
                Add Product to Catalog
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
