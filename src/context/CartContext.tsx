import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartSummary } from '../types.js';
import { api } from '../services/api.js';
import { useToast } from './ToastContext.js';

interface CartContextType {
  cart: CartSummary;
  loading: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (payload: {
    productId?: string;
    kitId?: string;
    isCustomKit?: boolean;
    customKitName?: string;
    customKitItems?: Array<{ productId: string; quantity: number; price: number; name: string }>;
    quantity?: number;
  }) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const initialCart: CartSummary = {
  items: [],
  itemCount: 0,
  subtotal: 0,
  bundleDiscount: 0,
  deliveryFee: 0,
  finalTotal: 0,
  freeDeliveryThreshold: 500,
  amountForFreeDelivery: 500,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartSummary>(initialCart);
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { showToast } = useToast();

  const refreshCart = async () => {
    try {
      const data = await api.cart.get();
      setCart(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const addToCart = async (payload: {
    productId?: string;
    kitId?: string;
    isCustomKit?: boolean;
    customKitName?: string;
    customKitItems?: Array<{ productId: string; quantity: number; price: number; name: string }>;
    quantity?: number;
  }) => {
    try {
      setLoading(true);
      const res = await api.cart.add(payload);
      await refreshCart();

      if (payload.kitId || payload.isCustomKit) {
        showToast(
          'savings',
          'Emergency Kit Added!',
          res.message || 'Smart bundle savings applied to your cart.'
        );
      } else {
        showToast('success', 'Item Added', 'Product added to your MediBasket');
      }
    } catch (err: any) {
      showToast('error', 'Could not add to cart', err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    try {
      await api.cart.updateQuantity(id, quantity);
      await refreshCart();
    } catch (err: any) {
      showToast('error', 'Update failed', err.message);
    }
  };

  const removeItem = async (id: string) => {
    try {
      await api.cart.removeItem(id);
      await refreshCart();
      showToast('info', 'Item Removed', 'Product removed from cart');
    } catch (err: any) {
      showToast('error', 'Remove failed', err.message);
    }
  };

  const clearCart = async () => {
    try {
      await api.cart.clear();
      await refreshCart();
    } catch (err: any) {
      showToast('error', 'Clear failed', err.message);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
