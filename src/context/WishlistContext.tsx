import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api.js';
import { useToast } from './ToastContext.js';

interface WishlistContextType {
  wishlistIds: Set<string>;
  toggleWishlist: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const { showToast } = useToast();

  const refreshWishlist = async () => {
    try {
      const res = await api.wishlist.getAll();
      const ids = new Set(res.wishlist.map(w => w.productId));
      setWishlistIds(ids);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, []);

  const toggleWishlist = async (productId: string) => {
    try {
      const res = await api.wishlist.toggle(productId);
      const newSet = new Set(wishlistIds);
      if (res.inWishlist) {
        newSet.add(productId);
        showToast('success', 'Wishlist', 'Saved to your favorites');
      } else {
        newSet.delete(productId);
        showToast('info', 'Wishlist', 'Removed from favorites');
      }
      setWishlistIds(newSet);
    } catch (err: any) {
      showToast('error', 'Wishlist failed', err.message);
    }
  };

  const isWishlisted = (productId: string) => wishlistIds.has(productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        toggleWishlist,
        isWishlisted,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
}
