'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '@/lib/cart-context';

export function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cart, removeFromCart, updateQuantity, cartSubtotal, cartCount } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-slate-900" />
              <h2 className="text-base font-bold text-slate-900">Your Cart ({cartCount})</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-3">
                <ShoppingBag className="w-12 h-12 mx-auto stroke-1 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">Your cart is currently empty</p>
                <Link
                  href="/products"
                  onClick={() => setIsCartOpen(false)}
                  className="inline-block text-xs font-semibold text-orange-600 hover:underline"
                >
                  Browse Products Catalog →
                </Link>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3.5 p-3 rounded-2xl border border-slate-100 bg-slate-50/50 relative group"
                >
                  <div className="relative w-18 h-18 rounded-xl overflow-hidden bg-white shrink-0 border border-slate-200">
                    <Image src={item.image} alt={item.productName} fill className="object-cover" />
                  </div>

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{item.productName}</h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-rose-500 p-0.5"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] font-bold text-orange-700 bg-orange-100/80 px-1.5 py-0.2 rounded border border-orange-200">
                          {item.comboTitle || 'Standard Package'}
                        </span>
                      </div>
                      {item.selectedVariants && item.selectedVariants.length > 0 && (
                        <p className="text-[10px] text-slate-600 font-medium mt-0.5 truncate">
                          {item.selectedVariants.length > 1
                            ? item.selectedVariants.map((v, i) => `#${i + 1} ${v}`).join(', ')
                            : item.selectedVariants[0]}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="text-xs font-bold text-slate-900">৳{item.price * item.quantity}</div>

                      <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-1.5 py-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="text-slate-500 hover:text-slate-900 p-0.5"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-slate-900 w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="text-slate-500 hover:text-slate-900 p-0.5"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Subtotal</span>
                <span className="text-slate-900 font-extrabold text-base">৳{cartSubtotal}</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Delivery charge will be calculated at checkout based on area (Inside Dhaka ৳70 / Outside ৳130).
              </p>

              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold py-3.5 px-4 rounded-2xl text-center flex items-center justify-center gap-2 text-sm shadow-md shadow-orange-500/20 transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
