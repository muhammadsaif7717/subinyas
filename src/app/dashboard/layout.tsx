'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Sparkles,
  Folder,
  MessageSquare,
  Settings as SettingsIcon,
  Store,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview & Stats', href: '/dashboard', icon: TrendingUp },
  { id: 'orders', label: 'Orders', href: '/dashboard/orders', icon: Package },
  { id: 'products', label: 'Products & Stock', href: '/dashboard/products', icon: ShoppingBag },
  { id: 'banners', label: 'Manage Banners', href: '/dashboard/banners', icon: Sparkles },
  { id: 'categories', label: 'Categories', href: '/dashboard/categories', icon: Folder },
  { id: 'reviews', label: 'Reviews', href: '/dashboard/reviews', icon: MessageSquare },
  { id: 'settings', label: 'Settings', href: '/dashboard/settings', icon: SettingsIcon },
];

const ROUTE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: 'Dashboard Overview',
    subtitle: 'Store performance metrics, revenue summary, and operational insights',
  },
  '/dashboard/orders': {
    title: 'Order Management',
    subtitle: 'Track, filter, process, and export customer orders across all statuses',
  },
  '/dashboard/products': {
    title: 'Products & Inventory',
    subtitle: 'Create, update, manage stock levels, pricing, combos, and product variations',
  },
  '/dashboard/banners': {
    title: 'Hero Banner Manager',
    subtitle: 'Manage 16:9 hero slider pool, visual assets, banner orientation, and live order CTAs',
  },
  '/dashboard/categories': {
    title: 'Category Settings',
    subtitle: 'Configure store product collections, category icons, and display labels',
  },
  '/dashboard/reviews': {
    title: 'Customer Reviews',
    subtitle: 'Moderate, approve, and manage customer product ratings and social testimonials',
  },
  '/dashboard/settings': {
    title: 'Store Configuration',
    subtitle: 'Manage Meta Pixel ID, delivery fees, WhatsApp support number, and announcements',
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
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

  const currentRouteMeta = ROUTE_TITLES[pathname] || {
    title: 'Admin Dashboard',
    subtitle: 'Subinyas Store Administration Control Panel',
  };

  const isNavActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#191520] text-[#D8CFE0] flex flex-col font-sans relative overflow-x-hidden">
      {/* Top Header Bar (Full Width) */}
      <header className="h-16 bg-[#211C28]/95 backdrop-blur-md border-b border-[#2E2733] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-md">
        {/* Left Side: Brand Logo & Title */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-[#C4587A] flex items-center justify-center text-white shadow-lg shadow-[#C4587A]/25 group-hover:scale-105 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base text-white tracking-wide leading-none">সুবিন্যাস</h1>
                <span className="text-[10px] font-bold text-[#E39BB4] bg-[#C4587A]/15 border border-[#C4587A]/30 px-2 py-0.5 rounded-md font-mono">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-[#8A7D97] tracking-wider uppercase font-mono font-medium hidden sm:block mt-0.5">
                Control Panel
              </p>
            </div>
          </Link>

          <div className="h-6 w-px bg-[#2E2733] hidden md:block mx-1" />

          {/* Current Page Title */}
          <div className="hidden md:block">
            <h2 className="text-sm font-bold text-white leading-tight">
              {currentRouteMeta.title}
            </h2>
            <p className="text-[11px] text-[#8A7D97]">
              {currentRouteMeta.subtitle}
            </p>
          </div>
        </div>

        {/* Right Side: Right Menu Drawer Button */}
        <div className="flex items-center gap-3">
          {/* Right Corner Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen((prev) => !prev)}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 cursor-pointer ${
              isDrawerOpen
                ? 'bg-[#C4587A] text-white border-[#C4587A] shadow-lg shadow-[#C4587A]/25'
                : 'bg-[#191520] hover:bg-[#2A2332] text-white border-[#2E2733]'
            }`}
            title={isDrawerOpen ? 'Close Menu' : 'Open Navigation Menu'}
          >
            {isDrawerOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <>
                <Menu className="w-5 h-5" />
                <span className="text-xs font-bold hidden sm:inline pr-1">Menu</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Slide-over Backdrop Overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-40 animate-in fade-in duration-200"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Right-Side Slide-Over Navigation Drawer */}
      <aside
        className={`fixed top-0 bottom-0 right-0 w-80 sm:w-88 bg-[#211C28] border-l border-[#2E2733] z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header: User Profile Info */}
        <div className="p-5 border-b border-[#2E2733] bg-[#1C1822] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user?.avatar ? (
              <div className="relative w-11 h-11 rounded-2xl overflow-hidden border-2 border-[#C4587A]/40 shrink-0">
                <Image src={user.avatar} alt={user.name} fill unoptimized className="object-cover" />
              </div>
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-[#C4587A]/20 border border-[#C4587A]/40 flex items-center justify-center text-[#E39BB4] text-base font-bold font-mono shrink-0">
                {user?.name ? user.name[0].toUpperCase() : 'A'}
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                  {user?.name || 'Administrator'}
                </h3>
                <ShieldCheck className="w-3.5 h-3.5 text-[#6FAE8C] shrink-0" />
              </div>
              <p className="text-[11px] text-[#8A7D97] truncate font-mono">
                {user?.email || 'admin@subinyas.shop'}
              </p>
              <span className="inline-block text-[10px] font-bold text-[#8FC7A9] bg-[#6FAE8C]/15 px-2 py-0.2 rounded border border-[#6FAE8C]/25 mt-0.5">
                Super Admin
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            className="p-2 rounded-xl text-[#8A7D97] hover:text-white hover:bg-[#2E2733] transition-colors cursor-pointer"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Middle: Navigation Route Links */}
        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 pb-2 text-[10px] uppercase font-bold text-[#6E6278] tracking-wider font-mono">
            Navigation Routes
          </div>

          {NAV_ITEMS.map((item) => {
            const active = isNavActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsDrawerOpen(false)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-xs transition-all duration-200 ${
                  active
                    ? 'bg-[#C4587A] text-white shadow-md shadow-[#C4587A]/25 font-bold'
                    : 'text-[#9C8FA8] hover:bg-[#2A2332] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-[#8A7D97]'}`} />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${active ? 'text-white opacity-100' : ''}`} />
              </Link>
            );
          })}
        </nav>

        {/* Drawer Bottom: Live Storefront & Log Out Actions */}
        <div className="p-4 border-t border-[#2E2733] bg-[#1C1822] space-y-2">
          <Link
            href="/"
            target="_blank"
            onClick={() => setIsDrawerOpen(false)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D8CFE0] bg-[#211C28] hover:bg-[#2A2332] hover:text-white border border-[#2E2733] transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#C4587A]" />
            <span>View Live Storefront</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              setIsDrawerOpen(false);
              logout();
              router.push('/login');
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#DD8A94] bg-[#C1495A]/12 hover:bg-[#C1495A] hover:text-white border border-[#C1495A]/25 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Full-Width Page Content */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
