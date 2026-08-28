'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', href: '/dashboard', icon: TrendingUp },
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
    subtitle: 'Store performance metrics, revenue summary, and quick operational insights',
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
    subtitle: 'Configure store product collections, category icons, and Bengali display labels',
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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
    <div className="min-h-screen bg-[#191520] text-[#D8CFE0] flex font-sans">
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#211C28] border-r border-[#2E2733] shrink-0 sticky top-0 h-screen z-30">
        {/* Brand Header */}
        <div className="p-6 border-b border-[#2E2733] flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C4587A] flex items-center justify-center text-white shadow-lg shadow-[#C4587A]/25">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-wide">সুবিন্যাস</h1>
              <p className="text-[11px] text-[#8A7D97] tracking-wider uppercase font-mono font-semibold">
                Admin Panel
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 pb-2 text-[10px] uppercase font-bold text-[#6E6278] tracking-wider font-mono">
            Navigation Menu
          </div>
          {NAV_ITEMS.map((item) => {
            const active = isNavActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 ${
                  active
                    ? 'bg-[#C4587A] text-white shadow-md shadow-[#C4587A]/25'
                    : 'text-[#9C8FA8] hover:bg-[#2A2332] hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-[#8A7D97]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Live Storefront Shortcut */}
        <div className="p-4 border-t border-[#2E2733]">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D8CFE0] bg-[#191520] hover:bg-[#2A2332] hover:text-white border border-[#2E2733] transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#C4587A]" />
            <span>View Live Storefront</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 bottom-0 left-0 w-72 bg-[#211C28] border-r border-[#2E2733] z-50 lg:hidden flex flex-col transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-[#2E2733] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C4587A] flex items-center justify-center text-white">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">সুবিন্যাস Admin</h2>
              <span className="text-[10px] text-[#8A7D97]">Dashboard Menu</span>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-[#9C8FA8] hover:text-white hover:bg-[#2E2733] rounded-xl cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = isNavActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-xs transition-all ${
                  active
                    ? 'bg-[#C4587A] text-white shadow-md shadow-[#C4587A]/25'
                    : 'text-[#9C8FA8] hover:bg-[#2A2332] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#2E2733]">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#191520] border border-[#2E2733]"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#C4587A]" />
            <span>View Live Store</span>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-[#211C28]/95 backdrop-blur-md border-b border-[#2E2733] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#9C8FA8] hover:text-white hover:bg-[#2E2733] cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-sm sm:text-base font-bold text-white leading-tight">
                {currentRouteMeta.title}
              </h2>
              <p className="text-[11px] text-[#8A7D97] hidden sm:block">
                {currentRouteMeta.subtitle}
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#D8CFE0] bg-[#191520] hover:bg-[#2E2733] hover:text-white border border-[#2E2733] transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#C4587A]" />
              <span>Live Store</span>
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                type="button"
                onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl hover:bg-[#2E2733] border border-transparent hover:border-[#2E2733] transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[#C4587A]/20 border border-[#C4587A]/40 flex items-center justify-center text-[#E39BB4] text-xs font-bold font-mono">
                  {user?.name ? user.name[0].toUpperCase() : 'A'}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold text-white leading-none flex items-center gap-1.5">
                    <span>{user?.name || 'Administrator'}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-[#6FAE8C]" />
                  </div>
                  <span className="text-[10px] text-[#8A7D97] font-mono">Super Admin</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#8A7D97]" />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#211C28] rounded-2xl shadow-2xl border border-[#2E2733] p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-[#2E2733] mb-1">
                    <p className="text-xs font-bold text-white truncate">{user?.name || 'Admin'}</p>
                    <p className="text-[11px] text-[#8A7D97] truncate">{user?.email || 'admin@subinyas.shop'}</p>
                  </div>

                  <Link
                    href="/dashboard/settings"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#D8CFE0] hover:text-white hover:bg-[#2E2733] transition-colors"
                  >
                    <SettingsIcon className="w-4 h-4 text-[#8A7D97]" />
                    <span>Store Settings</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      logout();
                      router.push('/login');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#DD8A94] hover:bg-[#C1495A]/15 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Sub-Route Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
