'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Heart, User as UserIcon, LogOut, Package, ChevronDown, Shield } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';

export function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount, wishlistCount, setIsCartOpen } = useCart();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Sleek Minimalist Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl font-bold tracking-tight text-slate-900 font-serif">
            সুবিন্যাস
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          <span className="text-xs font-mono tracking-widest text-slate-400 font-light">
            subinyas.shop
          </span>
        </Link>

        {/* English Navigation Links */}
        <nav className="flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Home
          </Link>
          <Link
            href="/products/jewelry-box"
            className="hover:text-slate-900 transition-colors"
          >
            Products
          </Link>
        </nav>

        {/* Right Actions: Wishlist, Cart, Profile/Login */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Wishlist Button */}
          <Link
            href="/wishlist"
            className="relative p-2 text-slate-600 hover:text-rose-600 transition-colors"
            title="Wishlist"
          >
            <Heart className="w-5 h-5 stroke-[1.75]" />
            {wishlistCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-slate-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Profile / Login */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 py-1.5 px-3 rounded-full transition-colors cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                  {user.name ? user.name.slice(0, 1).toUpperCase() : 'U'}
                </div>
                <span className="max-w-[90px] truncate hidden sm:inline">{user.name || 'Account'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 text-xs text-slate-700 z-50 animate-in fade-in duration-150"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>

                  <Link
                    href="/my-orders"
                    className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 hover:text-slate-900 font-medium"
                  >
                    <Package className="w-4 h-4 text-slate-500" />
                    <span>My Orders</span>
                  </Link>

                  <Link
                    href="/wishlist"
                    className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 hover:text-slate-900 font-medium"
                  >
                    <Heart className="w-4 h-4 text-slate-500" />
                    <span>Wishlist ({wishlistCount})</span>
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-2.5 hover:bg-rose-50 text-rose-600 font-bold border-t border-slate-100"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  <button
                    onClick={() => logout()}
                    className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 text-rose-600 font-medium border-t border-slate-100 cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 py-1.5 px-3.5 rounded-full transition-colors"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
