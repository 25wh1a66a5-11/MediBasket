import React, { useState } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Banknote,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { api } from '../services/api.js';
import { Order } from '../types.js';

interface CheckoutViewProps {
  onBackToShopping: () => void;
  onOrderPlaced: (order: Order) => void;
}

export function CheckoutView({ onBackToShopping, onOrderPlaced }: CheckoutViewProps) {
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [shippingDetails, setShippingDetails] = useState({
    name: user?.name || 'Aarav Sharma',
    phone: '9876543210',
    address: 'Room 402, Block B, Campus Residence Hostel',
    city: 'Bengaluru',
    pincode: '560001',
  });

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'simulated_card'>('simulated_card');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingDetails.name || !shippingDetails.phone || !shippingDetails.address || !shippingDetails.city || !shippingDetails.pincode) {
      showToast('error', 'Incomplete Details', 'Please fill in all shipping fields');
      return;
    }

    try {
      setSubmitting(true);
      const addressPayload = {
        fullName: shippingDetails.name,
        phone: shippingDetails.phone,
        email: user?.email || 'customer@medibasket.com',
        streetAddress: shippingDetails.address,
        city: shippingDetails.city,
        pincode: shippingDetails.pincode,
      };
      const res = await api.orders.create({
        address: addressPayload,
        paymentMethod: paymentMethod === 'cod' ? 'cod' : 'online_simulated',
      });
      await refreshCart();
      showToast('success', 'Order Confirmed!', `Order #${res.order.id} placed successfully.`);
      onOrderPlaced(res.order);
    } catch (err: any) {
      showToast('error', 'Checkout failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="checkout-view-container" className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <button
          onClick={onBackToShopping}
          className="text-xs font-semibold text-slate-600 hover:text-teal-700 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shopping</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Lock className="w-3.5 h-3.5 text-teal-600" />
          <span>Encrypted Simulated Checkout</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Shipping & Payment */}
        <div className="lg:col-span-7 space-y-6">
          {/* Shipping Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs flex items-center justify-center font-bold">1</span>
              <span>Delivery Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  id="checkout-name"
                  type="text"
                  required
                  value={shippingDetails.name}
                  onChange={e => setShippingDetails({ ...shippingDetails, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile Phone *</label>
                <input
                  id="checkout-phone"
                  type="tel"
                  required
                  value={shippingDetails.phone}
                  onChange={e => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">PIN Code *</label>
                <input
                  id="checkout-pincode"
                  type="text"
                  required
                  value={shippingDetails.pincode}
                  onChange={e => setShippingDetails({ ...shippingDetails, pincode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Street / Hostel / Dorm Address *</label>
                <textarea
                  id="checkout-address"
                  required
                  rows={2}
                  value={shippingDetails.address}
                  onChange={e => setShippingDetails({ ...shippingDetails, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">City & State *</label>
                <input
                  id="checkout-city"
                  type="text"
                  required
                  value={shippingDetails.city}
                  onChange={e => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs flex items-center justify-center font-bold">2</span>
              <span>Payment Option</span>
            </h3>

            <div className="space-y-2.5">
              <label
                id="payment-simulated-card"
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'simulated_card'
                    ? 'border-teal-500 bg-teal-50/60 ring-2 ring-teal-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'simulated_card'}
                    onChange={() => setPaymentMethod('simulated_card')}
                    className="accent-teal-600"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-teal-600" />
                      <span>Simulated Instant Online Payment (Demo)</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Immediate demo authorization • No actual charge applied
                    </div>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">FAST</span>
              </label>

              <label
                id="payment-cod"
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-teal-500 bg-teal-50/60 ring-2 ring-teal-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-teal-600"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Banknote className="w-4 h-4 text-slate-600" />
                      <span>Cash on Delivery (COD)</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Pay cash or UPI upon package doorstep arrival
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100">
              Order Summary ({cart.itemCount} Items)
            </h3>

            {/* Items review */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {cart.items.map(item => (
                <div key={item.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={item.image} alt={item.name} className="w-9 h-9 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate max-w-[150px]">{item.name}</div>
                      <div className="text-[10px] text-slate-400">Qty: {item.quantity}</div>
                    </div>
                  </div>
                  <div className="font-bold text-slate-800">₹{item.price * item.quantity}</div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">₹{cart.subtotal}</span>
              </div>

              {cart.bundleDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Kit Bundle Savings
                  </span>
                  <span>-₹{cart.bundleDiscount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{cart.deliveryFee === 0 ? <strong className="text-teal-700">FREE</strong> : `₹${cart.deliveryFee}`}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-extrabold text-slate-900">
                <span>Final Amount:</span>
                <span className="text-teal-700">₹{cart.finalTotal}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              id="place-order-btn"
              type="submit"
              disabled={submitting || cart.items.length === 0}
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Confirming Order...' : `Place Order • ₹${cart.finalTotal}`}</span>
            </button>

            <div className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Certified sterile emergency supplies dispatched within 2 hours</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
