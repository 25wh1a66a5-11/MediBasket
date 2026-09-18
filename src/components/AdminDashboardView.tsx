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
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { Product, Kit, Order, OrderStatus, AdminAnalytics, Prescription } from '../types.js';
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
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminTab, setAdminTab] = useState<'analytics' | 'inventory' | 'orders' | 'kits' | 'prescriptions'>('analytics');

  // Prescription verification states
  const [prescriptionFilter, setPrescriptionFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [rejectingPrescriptionId, setRejectingPrescriptionId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [verifierName, setVerifierName] = useState('Chief Pharmacist R. Verma, Reg #DL-74921');
  const [viewingPrescriptionDoc, setViewingPrescriptionDoc] = useState<Prescription | null>(null);

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
    requiresPrescription: false,
    dosageForm: 'Tablets',
    scheduleType: 'OTC',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400',
    usageInfo: 'Follow physician instructions or label guidelines.',
    specifications: { Sterility: 'Medical Grade', Expiry: '36 Months' },
  });

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [analyticsData, ordersData, prescriptionsData] = await Promise.all([
        api.admin.getAnalytics(),
        api.admin.getOrders(),
        api.prescriptions.getAll({ all: true }),
      ]);
      setAnalytics(analyticsData);
      setOrders(ordersData.orders);
      setPrescriptions(prescriptionsData.prescriptions);
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

  // Pharmacist verify prescription
  const handleVerifyPrescription = async (
    prescriptionId: string,
    status: 'approved' | 'rejected' | 'pending',
    reason?: string
  ) => {
    try {
      const res = await api.prescriptions.verify(prescriptionId, {
        status,
        rejectionReason: status === 'rejected' ? (reason || 'Prescription expired or incomplete doctor details') : undefined,
        verifiedBy: status === 'approved' ? verifierName : undefined,
      });

      showToast(
        status === 'approved' ? 'success' : 'info',
        `Prescription ${status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Updated'}`,
        `Prescription #${prescriptionId} marked as ${status}.`
      );

      setPrescriptions(prev => prev.map(p => p.id === prescriptionId ? res.prescription : p));
      setRejectingPrescriptionId(null);
      setRejectionReasonInput('');
      loadAdminData();
    } catch (err: any) {
      showToast('error', 'Action failed', err.message);
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
        requiresPrescription: Boolean(editingProduct.requiresPrescription),
        dosageForm: editingProduct.dosageForm,
        scheduleType: editingProduct.scheduleType,
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
        requiresPrescription: false,
        dosageForm: 'Tablets',
        scheduleType: 'OTC',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400',
        usageInfo: 'Follow physician instructions or label guidelines.',
        specifications: { Sterility: 'Medical Grade', Expiry: '36 Months' },
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

  const pendingPrescriptions = prescriptions.filter(p => p.status === 'pending');
  const filteredPrescriptions = prescriptions.filter(p => {
    if (prescriptionFilter === 'all') return true;
    return p.status === prescriptionFilter;
  });

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
            <h1 className="text-2xl font-black mt-1">Platform Metrics & Medical Inventory</h1>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setShowAddProductModal(true)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Product</span>
            </button>

            <button
              onClick={handleResetData}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-xs flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
              title="Restore initial seed catalog"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Seed Demo</span>
            </button>
          </div>
        </div>

        {/* 5 Metrics Cards */}
        {analytics && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-800">
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
              <div className="text-[10px] text-amber-400 mt-0.5">Threshold ≤ 5 units</div>
            </div>

            {/* Pending Prescriptions Count Card */}
            <div
              onClick={() => setAdminTab('prescriptions')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                pendingPrescriptions.length > 0
                  ? 'bg-amber-950/40 border-amber-500/70 hover:bg-amber-900/40 ring-1 ring-amber-500/40'
                  : 'bg-slate-800/80 border-slate-700/60 hover:bg-slate-700/50'
              }`}
            >
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span className="text-amber-300">Pending Rx</span>
                <FileText className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400 mt-1">
                {pendingPrescriptions.length}
              </div>
              <div className="text-[10px] text-amber-300/80 mt-0.5">
                {pendingPrescriptions.length > 0 ? 'Requires pharmacist review' : 'All prescriptions clear'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-2 overflow-x-auto">
        {[
          { id: 'analytics', label: 'Analytics & Trends' },
          { id: 'prescriptions', label: `Rx Verifications (${pendingPrescriptions.length} Pending)`, highlight: pendingPrescriptions.length > 0 },
          { id: 'inventory', label: `Inventory & Catalog (${products.length})` },
          { id: 'orders', label: `Customer Orders (${orders.length})` },
          { id: 'kits', label: `Pre-Built Situation Kits (${kits.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setAdminTab(tab.id as any)}
            className={`pb-3 px-3.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              adminTab === tab.id
                ? 'border-teal-600 text-teal-700 font-bold'
                : tab.highlight
                ? 'border-transparent text-amber-600 font-bold hover:text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: ANALYTICS */}
      {adminTab === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* Prescription Alert Banner if any pending */}
          {pendingPrescriptions.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-950">
                    {pendingPrescriptions.length} Prescription(s) Awaiting Medical Review
                  </h4>
                  <p className="text-xs text-amber-800">
                    Patients have placed orders with regulated medicines. Review and approve prescriptions to unlock checkout and packaging.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAdminTab('prescriptions')}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                Review Now
              </button>
            </div>
          )}

          {/* Low Stock Urgent Callout */}
          {analytics.lowStockProducts.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Low Stock Warning (Threshold ≤ 5 Units)</span>
                </div>
                <span className="text-[11px] text-rose-600 font-semibold">
                  {analytics.lowStockProducts.length} items require replenishment
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {analytics.lowStockProducts.map(p => (
                  <div key={p.id} className="p-2.5 rounded-xl bg-white border border-rose-100 flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-slate-900 truncate">{p.name}</div>
                      <div className="text-[10px] text-rose-600 font-semibold">
                        Stock: {p.stock} units left
                      </div>
                    </div>
                    <button
                      onClick={() => handleQuickRestock(p.id)}
                      className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[11px] font-semibold cursor-pointer shrink-0"
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

      {/* TAB 2: PRESCRIPTION VERIFICATION WORKFLOW (ADMIN / PHARMACIST) */}
      {adminTab === 'prescriptions' && (
        <div className="space-y-6">
          {/* Header & Pharmacist Verification Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <span>Authorized Pharmacist Prescription Verification Hub</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit uploaded medical prescriptions, cross-check doctor credentials, and approve or reject with legal compliance audit trails.
              </p>
            </div>

            {/* Verifier Badge */}
            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 font-semibold">Active Verifier:</span>
              <input
                type="text"
                value={verifierName}
                onChange={e => setVerifierName(e.target.value)}
                className="font-bold text-teal-800 bg-transparent border-b border-dashed border-teal-400 focus:outline-none text-xs"
                title="Edit pharmacist signature"
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: `All Prescriptions (${prescriptions.length})` },
              { id: 'pending', label: `Pending Verification (${pendingPrescriptions.length})` },
              { id: 'approved', label: `Approved (${prescriptions.filter(p => p.status === 'approved').length})` },
              { id: 'rejected', label: `Rejected (${prescriptions.filter(p => p.status === 'rejected').length})` },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setPrescriptionFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  prescriptionFilter === f.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Prescriptions List */}
          {filteredPrescriptions.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h4 className="font-bold text-slate-800 text-sm">No Prescriptions Found</h4>
              <p className="text-xs text-slate-500 mt-1">No uploaded records in the "{prescriptionFilter}" category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredPrescriptions.map(prescription => (
                <div
                  key={prescription.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                    prescription.status === 'pending'
                      ? 'border-amber-300 ring-1 ring-amber-400/30'
                      : prescription.status === 'approved'
                      ? 'border-emerald-200'
                      : 'border-rose-200'
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Top Row: ID, Date, Status */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-slate-900">Rx #{prescription.id}</span>
                          <span className="text-[10px] text-slate-400">
                            Uploaded {new Date(prescription.createdAt || prescription.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5">
                          Patient: <strong className="text-slate-900">{prescription.patientName}</strong>
                        </div>
                      </div>

                      <div>
                        {prescription.status === 'approved' && (
                          <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-2.5 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Approved
                          </span>
                        )}
                        {prescription.status === 'pending' && (
                          <span className="bg-amber-100 text-amber-900 font-bold text-xs px-2.5 py-1 rounded-full border border-amber-300 flex items-center gap-1 animate-pulse">
                            <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Review
                          </span>
                        )}
                        {prescription.status === 'rejected' && (
                          <span className="bg-rose-100 text-rose-800 font-bold text-xs px-2.5 py-1 rounded-full border border-rose-300 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Rejected
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Doctor and Clinic info */}
                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Doctor & Reg No.</span>
                        <span className="font-bold text-slate-900">{prescription.doctorName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Hospital / Clinic</span>
                        <span className="text-slate-700 font-medium">{prescription.hospitalOrClinic || 'Health Clinic'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Prescription Date</span>
                        <span className="text-slate-700 font-medium">{prescription.prescriptionDate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Doctor's Notes</span>
                        <span className="text-slate-700 font-medium truncate block" title={prescription.notes || 'None'}>
                          {prescription.notes || 'Standard medical Rx'}
                        </span>
                      </div>
                    </div>

                    {/* Prescription Document Preview Thumbnail */}
                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={prescription.fileUrl}
                          alt="Prescription document"
                          className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0 text-xs">
                          <span className="font-bold text-slate-900 block truncate">{prescription.fileName || 'prescription_scan.pdf'}</span>
                          <span className="text-[10px] text-slate-400">{prescription.fileSize || '1.2 MB'} • Digital Upload</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setViewingPrescriptionDoc(prescription)}
                        className="text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 px-2.5 py-1.5 rounded-lg border border-teal-200 flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Document</span>
                      </button>
                    </div>

                    {/* Rejection / Approval info */}
                    {prescription.status === 'rejected' && prescription.rejectionReason && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                        <strong>Rejection Reason:</strong> {prescription.rejectionReason}
                      </div>
                    )}

                    {prescription.status === 'approved' && prescription.verifiedBy && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 flex items-center justify-between">
                        <span><strong>Verified by:</strong> {prescription.verifiedBy}</span>
                        <span className="text-emerald-700">{prescription.verifiedAt ? new Date(prescription.verifiedAt).toLocaleString() : 'Verified'}</span>
                      </div>
                    )}
                  </div>

                  {/* Pharmacist Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {prescription.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => setRejectingPrescriptionId(prescription.id)}
                          className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject Rx</span>
                        </button>

                        <button
                          onClick={() => handleVerifyPrescription(prescription.id, 'approved')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve & Certify Rx</span>
                        </button>
                      </>
                    ) : (
                      <div className="w-full flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          {prescription.status === 'approved' ? 'Active prescription authorized for dispatch' : 'Rejected prescription blocked from checkout'}
                        </span>
                        <button
                          onClick={() => handleVerifyPrescription(prescription.id, 'pending')}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Re-evaluate
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Inline Rejection Reason Modal/Drawer */}
                  {rejectingPrescriptionId === prescription.id && (
                    <div className="mt-3 p-3 bg-rose-50/90 rounded-xl border border-rose-300 space-y-2 animate-in fade-in">
                      <div className="text-xs font-bold text-rose-950">Specify Medical Rejection Reason:</div>
                      <select
                        onChange={e => setRejectionReasonInput(e.target.value)}
                        className="w-full text-xs p-1.5 rounded border border-rose-300 bg-white"
                      >
                        <option value="">-- Choose common rejection reason --</option>
                        <option value="Prescription expired (older than 90 days)">Prescription expired (older than 90 days)</option>
                        <option value="Medical practitioner registration number missing or unverifiable">Medical practitioner registration number missing</option>
                        <option value="Illegible handwriting or incomplete dosage instructions">Illegible handwriting / dosage unclear</option>
                        <option value="Name on prescription does not match order recipient">Patient name mismatch</option>
                        <option value="Medicine formulation not listed on provided prescription">Medicine requested not listed on prescription</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Or enter custom reason..."
                        value={rejectionReasonInput}
                        onChange={e => setRejectionReasonInput(e.target.value)}
                        className="w-full text-xs p-1.5 rounded border border-rose-300 bg-white"
                      />

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => setRejectingPrescriptionId(null)}
                          className="px-2.5 py-1 text-xs text-slate-600 hover:bg-white rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleVerifyPrescription(prescription.id, 'rejected', rejectionReasonInput)}
                          className="px-3 py-1 bg-rose-600 text-white rounded text-xs font-bold hover:bg-rose-700 cursor-pointer"
                        >
                          Confirm Rejection
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: INVENTORY & PRICING TABLE */}
      {adminTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Products Catalog Management</h3>
              <p className="text-xs text-slate-500">Manage pricing, inventory, and prescription requirement classifications</p>
            </div>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
              Total {products.length} Products
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Type</th>
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
                      <img src={p.image} alt={p.name} className="w-8 h-8 rounded object-cover border border-slate-200" />
                      <div>
                        <div className="font-semibold text-slate-900 truncate max-w-[200px]">{p.name}</div>
                        <div className="text-[10px] text-slate-400">{p.brand}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{p.category}</td>
                    <td className="py-3 px-4">
                      {p.requiresPrescription ? (
                        <span className="bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2 py-0.5 rounded-md border border-amber-300 flex items-center gap-1 w-fit">
                          <FileText className="w-3 h-3 text-amber-700" />
                          <span>Rx • {p.scheduleType || 'Schedule H'}</span>
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-800 font-semibold text-[10px] px-2 py-0.5 rounded-md border border-emerald-200 w-fit block">
                          OTC Direct
                        </span>
                      )}
                    </td>
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
                        className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded font-semibold text-[11px] cursor-pointer"
                      >
                        +10
                      </button>
                      <button
                        onClick={() => setEditingProduct({ ...p })}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-[11px] cursor-pointer"
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

      {/* TAB 4: CUSTOMER ORDERS MANAGEMENT */}
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">Order #{order.id}</span>
                    <span className="text-xs text-slate-400">
                      • {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                      ₹{order.totalAmount}
                    </span>

                    {/* Prescription indicator */}
                    {order.prescriptionRequired && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-amber-700" />
                        Rx Order • {order.prescriptionId ? `Prescription #${order.prescriptionId}` : 'Verified'}
                      </span>
                    )}
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

      {/* TAB 5: PRE-BUILT KITS */}
      {adminTab === 'kits' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {kits.map(kit => (
            <div key={kit.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {kit.situation}
                    </span>
                    <h4 className="font-bold text-base text-slate-900 mt-1.5">{kit.name}</h4>
                  </div>
                  <span className="font-black text-slate-900 text-lg">₹{kit.bundlePrice || kit.totalPrice || kit.normalPrice}</span>
                </div>

                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{kit.description}</p>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-700">Included Essentials:</span>
                  <div className="text-xs text-slate-600 mt-1 space-y-1">
                    {kit.items.slice(0, 4).map(item => {
                      const prod = products.find(p => p.id === item.productId);
                      return (
                        <div key={item.productId} className="flex justify-between">
                          <span className="truncate max-w-[200px]">{item.name || prod?.name || 'Essential'}</span>
                          <span className="font-semibold text-slate-500">x{item.quantity}</span>
                        </div>
                      );
                    })}
                    {kit.items.length > 4 && (
                      <div className="text-[11px] text-teal-700 font-semibold">
                        +{kit.items.length - 4} more essentials
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Discount: {kit.calculated?.discountPercentage || kit.discountPercentage || 15}% applied</span>
                <span className="font-bold text-emerald-700">Verified Ready</span>
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
              <h3 className="font-bold text-sm text-slate-900">Edit Product & Prescription Rules</h3>
              <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Name</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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

              {/* Prescription Requirements Fields */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct.requiresPrescription)}
                    onChange={e => setEditingProduct({ ...editingProduct, requiresPrescription: e.target.checked })}
                    className="accent-amber-600 w-4 h-4"
                  />
                  <span>Requires Doctor's Prescription (Rx)</span>
                </label>

                {editingProduct.requiresPrescription && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Schedule Type</label>
                      <select
                        value={editingProduct.scheduleType || 'Schedule H'}
                        onChange={e => setEditingProduct({ ...editingProduct, scheduleType: e.target.value })}
                        className="w-full px-2 py-1 border border-amber-300 rounded bg-white text-xs"
                      >
                        <option value="Schedule H">Schedule H</option>
                        <option value="Schedule H1">Schedule H1</option>
                        <option value="Schedule X">Schedule X</option>
                        <option value="OTC">OTC</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Dosage Form</label>
                      <input
                        type="text"
                        value={editingProduct.dosageForm || 'Tablets'}
                        onChange={e => setEditingProduct({ ...editingProduct, dosageForm: e.target.value })}
                        placeholder="e.g. Inhaler, Tablets"
                        className="w-full px-2 py-1 border border-amber-300 rounded bg-white text-xs"
                      >
                      </input>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProductEdit}
                className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 flex items-center gap-1.5 cursor-pointer"
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
          <form onSubmit={handleCreateProduct} className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-200 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Add Healthcare Product to Catalog</h3>
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
                  placeholder="e.g. Sterile Eye Wash 250ml or Asthalin Inhaler"
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
                  <option value="Prescription Medicines (Rx)">Prescription Medicines (Rx)</option>
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

              {/* Prescription Required Field */}
              <div className="col-span-2 p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={newProduct.requiresPrescription}
                    onChange={e => setNewProduct({
                      ...newProduct,
                      requiresPrescription: e.target.checked,
                      category: e.target.checked ? 'Prescription Medicines (Rx)' : newProduct.category,
                      scheduleType: e.target.checked ? 'Schedule H' : 'OTC',
                    })}
                    className="accent-amber-600 w-4 h-4"
                  />
                  <span>Prescription Required (Doctor's Rx mandatory for checkout)</span>
                </label>

                {newProduct.requiresPrescription && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Schedule Regulation</label>
                      <select
                        value={newProduct.scheduleType}
                        onChange={e => setNewProduct({ ...newProduct, scheduleType: e.target.value })}
                        className="w-full px-2 py-1 border border-amber-300 rounded bg-white text-xs"
                      >
                        <option value="Schedule H">Schedule H</option>
                        <option value="Schedule H1">Schedule H1</option>
                        <option value="Schedule X">Schedule X</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Dosage Form</label>
                      <input
                        type="text"
                        value={newProduct.dosageForm}
                        onChange={e => setNewProduct({ ...newProduct, dosageForm: e.target.value })}
                        placeholder="Tablets, Capsule, Syrup, Inhaler"
                        className="w-full px-2 py-1 border border-amber-300 rounded bg-white text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  required
                  rows={2}
                  value={newProduct.description}
                  onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Medical item description and purpose..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddProductModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 cursor-pointer"
              >
                Add Product to Catalog
              </button>
            </div>
          </form>
        </div>
      )}

      {/* INSPECT PRESCRIPTION DOCUMENT MODAL */}
      {viewingPrescriptionDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Prescription #{viewingPrescriptionDoc.id} • {viewingPrescriptionDoc.patientName}
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Prescribed by {viewingPrescriptionDoc.doctorName} ({viewingPrescriptionDoc.prescriptionDate})
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewingPrescriptionDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-slate-100/60">
              <img
                src={viewingPrescriptionDoc.fileUrl}
                alt="Prescription document high resolution"
                className="max-h-[60vh] object-contain rounded-xl shadow-md border border-slate-200"
              />

              <div className="mt-4 p-3 bg-white rounded-xl border border-slate-200 w-full text-xs space-y-1 text-slate-700">
                <div className="flex justify-between">
                  <span className="font-semibold">Clinic/Hospital:</span>
                  <span>{viewingPrescriptionDoc.hospitalOrClinic}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Doctor's Notes:</span>
                  <span>{viewingPrescriptionDoc.notes || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Status:</span>
                  <span className="font-bold capitalize">{viewingPrescriptionDoc.status}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50">
              <button
                onClick={() => setViewingPrescriptionDoc(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Close Preview
              </button>
              {viewingPrescriptionDoc.status === 'pending' && (
                <button
                  onClick={() => {
                    handleVerifyPrescription(viewingPrescriptionDoc.id, 'approved');
                    setViewingPrescriptionDoc(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Authorize & Approve
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
