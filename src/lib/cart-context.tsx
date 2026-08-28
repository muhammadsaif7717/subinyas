'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, WishlistItem } from './types';
import { useAuth } from './auth-context';
import axios from 'axios';

interface CartContextType {
  cart: CartItem[];
  wishlist: WishlistItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (productSlug: string) => void;
  isInWishlist: (productSlug: string) => boolean;
  wishlistCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
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

  const addToCart = (newItem: Omit<CartItem, 'id'>) => {
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

  const addToWishlist = (item: WishlistItem) => {
    setWishlist((prev) => {
      if (prev.some((w) => w.productSlug === item.productSlug)) return prev;
      return [...prev, item];
    });
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
