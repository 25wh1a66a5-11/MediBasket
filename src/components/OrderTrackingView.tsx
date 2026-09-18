import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  MapPin,
  Calendar,
  AlertCircle,
  ExternalLink,
  ShoppingBag,
} from 'lucide-react';
import { Order, OrderStatus } from '../types.js';
import { api } from '../services/api.js';
import { useCart } from '../context/CartContext.js';
import { useToast } from '../context/ToastContext.js';

interface OrderTrackingViewProps {
  orderId: string;
  onBack: () => void;
  onSelectProductForReview?: (productId: string) => void;
}

export function OrderTrackingView({
  orderId,
  onBack,
  onSelectProductForReview,
}: OrderTrackingViewProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);

  const { addToCart, setIsCartOpen } = useCart();
  const { showToast } = useToast();

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await api.orders.getById(orderId);
      setOrder(data.order);
    } catch (err: any) {
      showToast('error', 'Order not found', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto" />
        <p className="text-xs text-slate-500 mt-2">Loading order timeline...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
        <h3 className="font-bold text-slate-800">Order #{orderId} Not Found</h3>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  // 5 Status Steps from requirement:
  // Order Placed -> Packed -> Shipped -> Out for Delivery -> Delivered
  const steps: Array<{ key: OrderStatus; label: string; desc: string }> = [
    { key: 'Order Placed', label: 'Order Placed', desc: 'Received & verified by fulfillment hub' },
    { key: 'Packed', label: 'Packed', desc: 'Sealed in sterile moisture-proof medical container' },
    { key: 'Shipped', label: 'Shipped', desc: 'Dispatched with logistics carrier partner' },
    { key: 'Out for Delivery', label: 'Out for Delivery', desc: 'Courier agent on final transit leg to address' },
    { key: 'Delivered', label: 'Delivered', desc: 'Safely handed over & confirmed at doorstep' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === order.status);

  // UNIQUE FEATURE 4: Reorder this Kit (1-click reorder!)
  const handleReorderKit = async () => {
    try {
      setReordering(true);
      const res = await api.orders.reorder(order.id);
      showToast('savings', '1-Click Kit Reordered!', res.message || 'All items from this kit added to your cart.');
      setIsCartOpen(true);
    } catch (err: any) {
      showToast('error', 'Reorder failed', err.message);
    } finally {
      setReordering(false);
    }
  };

  return (
    <div id="order-tracking-view" className="max-w-3xl mx-auto px-4 py-10">
      {/* Back button */}
      <button
        onClick={onBack}
        className="text-xs font-semibold text-slate-600 hover:text-teal-700 flex items-center gap-1.5 mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Order History</span>
      </button>

      {/* Header Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-100 px-2 py-0.5 rounded">
                Order #{order.id}
              </span>
              <span className="text-xs text-slate-400">
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">Live Order & Dispatch Tracking</h1>
          </div>

          {/* UNIQUE FEATURE 4: "Reorder this Kit" Button */}
          <button
            id="reorder-kit-btn"
            onClick={handleReorderKit}
            disabled={reordering}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${reordering ? 'animate-spin' : ''}`} />
            <span>Reorder this Kit</span>
          </button>
        </div>

        {/* 5-Step Vertical / Horizontal Timeline */}
        <div className="mt-8 py-2">
          <div className="relative pl-6 sm:pl-0 sm:flex sm:justify-between space-y-8 sm:space-y-0">
            {/* Horizontal Line for Desktop */}
            <div className="hidden sm:block absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
            <div
              className="hidden sm:block absolute top-4 left-6 h-0.5 bg-teal-600 transition-all duration-500 -z-0"
              style={{ width: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 90)}%` }}
            />

            {steps.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const isFuture = idx > currentStepIndex;

              return (
                <div
                  key={step.key}
                  className="relative flex sm:flex-col sm:items-center sm:text-center group"
                >
                  {/* Step Dot */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all z-10 shrink-0 ${
                      isCurrent
                        ? 'bg-teal-600 text-white ring-4 ring-teal-100 shadow-md scale-110'
                        : isPast
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-white border-2 border-slate-300 text-slate-400'
                    }`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isCurrent ? (
                      <Clock className="w-4 h-4 animate-spin" />
                    ) : (
                      idx + 1
                    )}
                  </div>

                  {/* Step Info */}
                  <div className="ml-4 sm:ml-0 sm:mt-3">
                    <div
                      className={`text-xs font-bold ${
                        isCurrent
                          ? 'text-teal-900'
                          : isPast
                          ? 'text-slate-900'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </div>
                    <div className="text-[10px] text-slate-500 max-w-[120px] hidden sm:block mt-0.5">
                      {step.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current status detail card */}
        <div className="mt-10 p-4 rounded-2xl bg-teal-50/70 border border-teal-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-teal-950">Status: {order.status}</div>
              <div className="text-teal-800">
                Estimated Doorstep Arrival: <strong>{order.estimatedDelivery || 'Within 2 business days'}</strong>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-teal-700 bg-white px-2.5 py-1 rounded-lg border border-teal-200">
            {order.paymentMethod === 'online_simulated' ? 'Online Simulated' : 'Cash on Delivery'}
          </span>
        </div>
      </div>

      {/* Package Contents Breakdown */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
          <span>Supplies in this Package ({order.items.length})</span>
          <span className="text-xs font-bold text-teal-700">Total: ₹{order.totalAmount}</span>
        </h3>

        <div className="divide-y divide-slate-100">
          {order.items.map((item, idx) => (
            <div key={item.productId || item.kitId || idx} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-slate-100" />
                <div>
                  <div className="font-semibold text-xs text-slate-900">{item.name}</div>
                  <div className="text-[11px] text-slate-500">
                    ₹{item.price} each • Qty: {item.quantity}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-xs font-bold text-slate-900 text-right">
                  ₹{item.price * item.quantity}
                </div>

                {/* If delivered, allow reviewing */}
                {order.status === 'Delivered' && item.productId && onSelectProductForReview && (
                  <button
                    onClick={() => onSelectProductForReview(item.productId!)}
                    className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200"
                  >
                    Review Product
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Shipping details */}
        <div className="pt-4 border-t border-slate-100 text-xs text-slate-600 flex items-start gap-2">
          <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-900">Destination:</strong>{' '}
            {order.address?.fullName || order.shippingDetails?.name || 'Customer'},{' '}
            {order.address?.streetAddress || order.shippingDetails?.address || ''},{' '}
            {order.address?.city || order.shippingDetails?.city || ''} -{' '}
            {order.address?.pincode || order.shippingDetails?.pincode || ''}{' '}
            (Tel: {order.address?.phone || order.shippingDetails?.phone || ''})
          </div>
        </div>
      </div>
    </div>
  );
}
