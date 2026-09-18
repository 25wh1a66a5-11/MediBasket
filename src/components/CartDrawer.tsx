import React from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '../context/CartContext.js';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
  onExploreProducts: () => void;
}

export function CartDrawer({ onProceedToCheckout, onExploreProducts }: CartDrawerProps) {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeItem, clearCart } = useCart();

  if (!isCartOpen) return null;

  const percentToFreeDelivery = Math.min(
    100,
    Math.round((cart.subtotal / cart.freeDeliveryThreshold) * 100)
  );

  return (
    <div id="cart-drawer-backdrop" className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Your MediBasket</h2>
              <div className="text-[11px] text-slate-500 font-medium">{cart.itemCount} items ready for safe dispatch</div>
            </div>
          </div>
          <button
            id="close-cart-drawer-btn"
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Tracker */}
        <div className="px-5 py-2.5 bg-teal-50/80 border-b border-teal-100 text-xs">
          <div className="flex items-center justify-between text-teal-900 font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-teal-600" />
              {cart.amountForFreeDelivery <= 0 ? (
                <span>🎉 Qualified for FREE Standard Delivery!</span>
              ) : (
                <span>Add ₹{cart.amountForFreeDelivery} more for FREE Delivery</span>
              )}
            </span>
            <span className="text-[10px] text-teal-700 font-bold">{percentToFreeDelivery}%</span>
          </div>
          <div className="w-full h-1.5 bg-teal-200/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-600 transition-all duration-300 rounded-full"
              style={{ width: `${percentToFreeDelivery}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 divide-y divide-slate-100">
          {cart.items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Your MediBasket is empty</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Select from our curated situation kits or browse essential healthcare and first-aid supplies.
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onExploreProducts();
                }}
                className="mt-5 px-5 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-teal-700 transition-colors"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            cart.items.map(item => (
              <div key={item.id} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-100 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      {item.isKit && (
                        <span className="text-[9px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.2 rounded">
                          KIT BUNDLE
                        </span>
                      )}
                      <h4 className="font-semibold text-xs text-slate-900 truncate max-w-[180px]">
                        {item.name}
                      </h4>
                    </div>

                    {item.isKit && item.customKitItems && (
                      <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {item.customKitItems.map(i => i.name).join(', ')}
                      </div>
                    )}

                    <div className="text-xs font-bold text-slate-900 mt-1">
                      ₹{item.price}{' '}
                      <span className="text-[11px] font-normal text-slate-400">× {item.quantity}</span>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center mt-2 border border-slate-200 rounded-lg bg-slate-50 w-fit">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-0.5 text-slate-500 hover:text-slate-900"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold px-2">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-0.5 text-slate-500 hover:text-slate-900"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between h-full pt-1">
                  <div className="text-xs font-black text-slate-900">
                    ₹{item.price * item.quantity}
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition-colors mt-4"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer Summary & Checkout */}
        {cart.items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/80 space-y-3">
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900">₹{cart.subtotal}</span>
              </div>

              {cart.bundleDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Kit Bundle Savings:
                  </span>
                  <span>-₹{cart.bundleDiscount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Fee:</span>
                <span>
                  {cart.deliveryFee === 0 ? (
                    <span className="text-teal-700 font-bold">FREE</span>
                  ) : (
                    <span>₹{cart.deliveryFee}</span>
                  )}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-extrabold text-slate-900">
                <span>Total Amount:</span>
                <span className="text-teal-700">₹{cart.finalTotal}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                id="cart-proceed-checkout-btn"
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 active:scale-98 transition-all cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="mt-2 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3 text-teal-600" />
                <span>Simulated secure checkout • 100% Non-Prescription</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
