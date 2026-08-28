'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { CartItem, WishlistItem } from './types';
import { useAuth } from './auth-context';
import axios from 'axios';

interface CartContextType {
  cart: CartItem[];
  wishlist: WishlistItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, 'id'>, redirectIfLoggedOut?: boolean) => boolean;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  addToWishlist: (item: WishlistItem, redirectIfLoggedOut?: boolean) => boolean;
  removeFromWishlist: (productSlug: string) => void;
  isInWishlist: (productSlug: string) => boolean;
  wishlistCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('subinyas_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedWishlist = localStorage.getItem('subinyas_wishlist');
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    } catch {
      // ignore
    }
  }, []);

  // Save to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem('subinyas_cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('subinyas_wishlist', JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist]);

  // Sync with user's MongoDB profile if logged in
  useEffect(() => {
    if (user?.id) {
      axios.post('/api/user/sync', { cart, wishlist }).catch(() => {});
    }
  }, [cart, wishlist, user?.id]);

  // Direct internal add item without auth check (used for restore & logged-in users)
  const executeAddToCart = useCallback((newItem: Omit<CartItem, 'id'>) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.productSlug === newItem.productSlug &&
          item.comboId === newItem.comboId &&
          JSON.stringify(item.selectedVariants) === JSON.stringify(newItem.selectedVariants)
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += newItem.quantity;
        return updated;
      }

      const id = `cart-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      return [...prev, { ...newItem, id }];
    });
    setIsCartOpen(true);
  }, []);

  const executeAddToWishlist = useCallback((item: WishlistItem) => {
    setWishlist((prev) => {
      if (prev.some((w) => w.productSlug === item.productSlug)) return prev;
      return [...prev, item];
    });
  }, []);

  // Check and execute pending action on user login
  useEffect(() => {
    if (user?.id) {
      try {
        const rawPending = sessionStorage.getItem('subinyas_pending_action');
        if (rawPending) {
          const pending = JSON.parse(rawPending);
          sessionStorage.removeItem('subinyas_pending_action');

          if (pending && Date.now() - (pending.timestamp || 0) < 15 * 60 * 1000) {
            if (pending.type === 'cart' && pending.item) {
              executeAddToCart(pending.item);
            } else if (pending.type === 'wishlist' && pending.item) {
              executeAddToWishlist(pending.item);
            }
          }
        }
      } catch {
        // ignore
      }
    }
  }, [user?.id, executeAddToCart, executeAddToWishlist]);

  // Public addToCart with Login Requirement
  const addToCart = (newItem: Omit<CartItem, 'id'>, redirectIfLoggedOut = true): boolean => {
    if (!user) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'subinyas_pending_action',
          JSON.stringify({
            type: 'cart',
            item: newItem,
            timestamp: Date.now(),
          })
        );

        if (redirectIfLoggedOut) {
          const currentUrl = window.location.pathname + window.location.search;
          router.push(`/login?callbackUrl=${encodeURIComponent(currentUrl)}&authRequired=true&action=cart`);
        }
      }
      return false;
    }

    executeAddToCart(newItem);
    return true;
  };

  // Public addToWishlist with Login Requirement
  const addToWishlist = (item: WishlistItem, redirectIfLoggedOut = true): boolean => {
    if (!user) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'subinyas_pending_action',
          JSON.stringify({
            type: 'wishlist',
            item,
            timestamp: Date.now(),
          })
        );

        if (redirectIfLoggedOut) {
          const currentUrl = window.location.pathname + window.location.search;
          router.push(`/login?callbackUrl=${encodeURIComponent(currentUrl)}&authRequired=true&action=wishlist`);
        }
      }
      return false;
    }

    executeAddToWishlist(item);
    return true;
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const removeFromWishlist = (productSlug: string) => {
    setWishlist((prev) => prev.filter((item) => item.productSlug !== productSlug));
  };

  const isInWishlist = (productSlug: string) => {
    return wishlist.some((item) => item.productSlug === productSlug);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const wishlistCount = wishlist.length;

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        wishlistCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
