'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  ShoppingBag,
  Heart,
  User as UserIcon,
  LogOut,
  Package,
  LayoutDashboard,
  ShieldCheck,
  Layers,
  Sparkles,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  Phone,
  MessageCircle,
  Home,
  Grid,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { cartCount, wishlistCount, setIsCartOpen } = useCart();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isAdmin =
    user?.role?.toLowerCase() === 'admin' ||
    user?.email?.toLowerCase() === 'admin@subinyas.shop';

  const isNavActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100/80 shadow-xs transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Sleek Minimalist Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl font-bold tracking-tight text-slate-900 font-serif">
              সুবিন্যাস
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 group-hover:scale-125 transition-transform" />
            <span className="text-xs font-mono tracking-widest text-slate-400 font-light hidden sm:inline">
              subinyas.shop
            </span>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-7 text-xs sm:text-sm font-medium text-slate-600">
            <Link
              href="/"
              className={`transition-colors py-1 relative ${
                pathname === '/' ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Home
              {pathname === '/' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-rose-500 rounded-full" />
              )}
            </Link>
            <Link
              href="/products"
              className={`transition-colors py-1 relative ${
                pathname.startsWith('/products') ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              All Products
              {pathname.startsWith('/products') && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-rose-500 rounded-full" />
              )}
            </Link>
          </nav>

          {/* Right Action Controls: Wishlist, Cart & Right-Side Menu Drawer Button */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Wishlist Button (Auth Gated) */}
            {user ? (
              <Link
                href="/wishlist"
                className="relative p-2.5 rounded-full text-slate-600 hover:text-rose-600 hover:bg-rose-50/60 transition-colors"
                title="Wishlist"
              >
                <Heart className="w-5 h-5 stroke-[1.75]" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            ) : (
              <Link
                href={`/login?callbackUrl=${encodeURIComponent('/wishlist')}&authRequired=true&action=wishlist`}
                className="relative p-2.5 rounded-full text-slate-600 hover:text-rose-600 hover:bg-rose-50/60 transition-colors"
                title="Wishlist (Login Required)"
              >
                <Heart className="w-5 h-5 stroke-[1.75]" />
              </Link>
            )}

            {/* Shopping Cart Button (Auth Gated) */}
            {user ? (
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-slate-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in">
                    {cartCount}
                  </span>
                )}
              </button>
            ) : (
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(pathname)}&authRequired=true&action=cart`}
                className="relative p-2.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Shopping Cart (Login Required)"
              >
                <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
              </Link>
            )}

            {/* If User is Logged In: Show Profile Image + Menu Icon (No name text) */}
            {user ? (
              <button
                type="button"
                onClick={() => setIsDrawerOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 p-1 sm:pl-1 sm:pr-2.5 sm:py-1 rounded-full border transition-all cursor-pointer ${
                  isDrawerOpen
                    ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                }`}
                title={isDrawerOpen ? 'Close Menu' : 'Open Navigation Menu'}
              >
                {user.avatar ? (
                  <div className="relative w-7 h-7 rounded-full overflow-hidden border border-slate-200 shrink-0">
                    <Image
                      src={user.avatar}
                      alt={user.name || 'User'}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {user.name ? user.name.slice(0, 1).toUpperCase() : 'U'}
                  </div>
                )}

                {isDrawerOpen ? (
                  <X className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <Menu className="w-4 h-4 text-slate-600 shrink-0" />
                )}
              </button>
            ) : (
              /* If User is Logged Out: Show Login Action + Clean Menu Button */
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                  title="Sign In"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>Login</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen((prev) => !prev)}
                  className={`p-2 rounded-full border transition-all cursor-pointer ${
                    isDrawerOpen
                      ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                  title={isDrawerOpen ? 'Close Menu' : 'Navigation Menu'}
                >
                  {isDrawerOpen ? (
                    <X className="w-4 h-4 text-rose-600" />
                  ) : (
                    <Menu className="w-4 h-4 text-slate-700" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Slide-over Backdrop Overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[60] animate-in fade-in duration-200"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Right-Side Slide-Over Menu Drawer */}
      <aside
        className={`fixed top-0 bottom-0 right-0 w-80 sm:w-90 bg-white border-l border-slate-100 z-[70] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header: User Profile or Sign-In Prompt */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900 font-serif">
                সুবিন্যাস
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            </div>

            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {user ? (
            /* Logged In User Profile Card */
            <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200/70 shadow-xs">
              {user.avatar ? (
                <div className="relative w-11 h-11 rounded-full overflow-hidden border border-slate-200 shrink-0">
                  <Image
                    src={user.avatar}
                    alt={user.name || 'User'}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {user.name ? user.name.slice(0, 1).toUpperCase() : 'U'}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {user.name}
                  </h3>
                  {isAdmin && (
                    <ShieldCheck className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate font-mono">
                  {user.email}
                </p>
                <span
                  className={`inline-block text-[10px] font-bold px-2 py-0.2 rounded mt-1 border ${
                    isAdmin
                      ? 'bg-rose-50 text-rose-600 border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {isAdmin ? 'Store Administrator' : 'Verified Customer'}
                </span>
              </div>
            </div>
          ) : (
            /* Logged Out Welcome Card */
            <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs space-y-2.5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Welcome to Subinyas!</h3>
                <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                  Sign in to track orders, manage your wishlist and checkout faster.
                </p>
              </div>

              <Link
                href="/login"
                onClick={() => setIsDrawerOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold text-center flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Login or Create Account</span>
              </Link>
            </div>
          )}
        </div>

        {/* Drawer Middle: Navigation Route Links */}
        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 pb-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">
            Navigation Menu
          </div>

          <Link
            href="/"
            onClick={() => setIsDrawerOpen(false)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              isNavActive('/') && pathname === '/'
                ? 'bg-rose-50 text-rose-600 font-bold'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Home className="w-4 h-4 text-slate-500" />
              <span>Home</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <Link
            href="/products"
            onClick={() => setIsDrawerOpen(false)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              isNavActive('/products')
                ? 'bg-rose-50 text-rose-600 font-bold'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Grid className="w-4 h-4 text-slate-500" />
              <span>All Products</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          {/* Protected Customer Routes - Only shown when logged in */}
          {user && (
            <>
              <Link
                href="/my-orders"
                onClick={() => setIsDrawerOpen(false)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isNavActive('/my-orders')
                    ? 'bg-rose-50 text-rose-600 font-bold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-slate-500" />
                  <span>My Orders / Order Tracking</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                href="/wishlist"
                onClick={() => setIsDrawerOpen(false)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isNavActive('/wishlist')
                    ? 'bg-rose-50 text-rose-600 font-bold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>Wishlist</span>
                </div>
                {wishlistCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 text-[10px] font-bold">
                    {wishlistCount}
                  </span>
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </Link>

              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  setIsCartOpen(true);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-4 h-4 text-slate-500" />
                  <span>Shopping Cart</span>
                </div>
                {cartCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold">
                    {cartCount}
                  </span>
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
            </>
          )}

          {/* ADMIN SHORTCUTS (IF ADMIN USER) */}
          {isAdmin && (
            <div className="pt-3 border-t border-slate-100 space-y-1">
              <div className="px-3 pb-1 text-[10px] uppercase font-bold text-rose-500 tracking-wider font-mono">
                Store Administration
              </div>

              <Link
                href="/dashboard"
                onClick={() => setIsDrawerOpen(false)}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold text-slate-900 bg-rose-50/70 hover:bg-rose-100/70 transition-all"
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-4 h-4 text-rose-600" />
                  <span>Admin Dashboard</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-rose-600" />
              </Link>

              <Link
                href="/dashboard/orders"
                onClick={() => setIsDrawerOpen(false)}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-slate-500" />
                  <span>Order Management</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                href="/dashboard/banners"
                onClick={() => setIsDrawerOpen(false)}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-slate-500" />
                  <span>Hero Banner Manager</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          )}
        </nav>

        {/* Drawer Bottom: Logout (if user logged in) */}
        {user && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/80">
            <button
              type="button"
              onClick={() => {
                setIsDrawerOpen(false);
                logout();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200/60 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
