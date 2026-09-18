import React from 'react';
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Calendar,
  CreditCard,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';
import { Order } from '../types.js';

interface OrderConfirmationViewProps {
  order: Order;
  onTrackOrder: (orderId: string) => void;
  onContinueShopping: () => void;
}

export function OrderConfirmationView({
  order,
  onTrackOrder,
  onContinueShopping,
}: OrderConfirmationViewProps) {
  return (
    <div id="order-confirmation-container" className="max-w-3xl mx-auto px-4 py-12 animate-in zoom-in-95">
      {/* Success Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
          Order Confirmed & Logged
        </span>

        <h1 className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
          Thank you for ordering with MediBasket!
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
          Your emergency essentials order has been assigned reference{' '}
          <span className="font-bold text-slate-900">#{order.id}</span> and is being prepped in our sterile fulfillment hub.
        </p>

        {/* Key Delivery Facts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 my-8 text-left">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>Estimated Delivery</span>
            </div>
            <div className="text-sm font-bold text-slate-900">
              {order.estimatedDelivery || 'Within 2 business days'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <CreditCard className="w-4 h-4 text-teal-600" />
              <span>Payment Mode</span>
            </div>
            <div className="text-sm font-bold text-slate-900">
              {order.paymentMethod === 'online_simulated' ? 'Online Simulated' : 'Cash on Delivery'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <Package className="w-4 h-4 text-teal-600" />
              <span>Items Total</span>
            </div>
            <div className="text-sm font-bold text-teal-700">₹{order.totalAmount} ({order.items.length} items)</div>
          </div>
        </div>

        {/* Shipping Address Box */}
        <div className="text-left p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-8 text-xs flex items-start gap-3">
          <MapPin className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900">Shipping To: </span>
            <span className="text-slate-700">
              {(order.address?.fullName || order.shippingDetails?.name || 'Customer')} • {(order.address?.phone || order.shippingDetails?.phone || '')}
            </span>
            <div className="text-slate-500 mt-0.5">
              {(order.address?.streetAddress || order.shippingDetails?.address || '')}, {(order.address?.city || order.shippingDetails?.city || '')} - {(order.address?.pincode || order.shippingDetails?.pincode || '')}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            id="confirmation-track-order-btn"
            onClick={() => onTrackOrder(order.id)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition-all shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>Track Order Timeline</span>
          </button>

          <button
            id="confirmation-continue-shopping-btn"
            onClick={onContinueShopping}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-slate-500" />
            <span>Continue Shopping</span>
          </button>
        </div>
      </div>
    </div>
  );
}
