'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  TrendingUp,
  Package,
  Clock,
  ShoppingBag,
  Sparkles,
  Folder,
  MessageSquare,
  Settings as SettingsIcon,
  DollarSign,
  Truck,
  AlertCircle,
  ArrowUpRight,
  ChevronRight,
  ExternalLink,
  Star,
  Layers,
  Phone,
} from 'lucide-react';
import { Order, Product, Review } from '@/lib/types';
import { CategoryItem } from '@/app/api/categories/route';

const STATUS_STYLES: Record<string, string> = {
  Pending: 'bg-[#D6A24E]/15 text-[#E4BC79] border-[#D6A24E]/30',
  Confirmed: 'bg-[#6C93C4]/15 text-[#8FB0D9] border-[#6C93C4]/30',
  Shipped: 'bg-[#9C7FC4]/15 text-[#BAA3DE] border-[#9C7FC4]/30',
  Delivered: 'bg-[#6FAE8C]/15 text-[#8FC7A9] border-[#6FAE8C]/30',
  Returned: 'bg-[#CB8A4E]/15 text-[#DDA876] border-[#CB8A4E]/30',
  Cancelled: 'bg-[#C1495A]/15 text-[#DD8A94] border-[#C1495A]/30',
};

export default function DashboardOverviewPage() {
  const cardCls = 'bg-[#211C28] rounded-2xl border border-[#2E2733]';

  // Fetch Orders
  const { data: orders = [], isLoading: isOrdersLoading } = useQuery<Order[]>({
    queryKey: ['admin-orders-overview'],
    queryFn: async () => {
      const res = await axios.get('/api/orders');
      return res.data?.orders || [];
    },
  });

  // Fetch Products
  const { data: products = [], isLoading: isProductsLoading } = useQuery<Product[]>({
    queryKey: ['admin-products-overview'],
    queryFn: async () => {
      const res = await axios.get('/api/products');
      return res.data?.products || [];
    },
  });

  // Fetch Categories
  const { data: categories = [] } = useQuery<CategoryItem[]>({
    queryKey: ['admin-categories-overview'],
    queryFn: async () => {
      const res = await axios.get('/api/categories');
      return res.data?.categories || [];
    },
  });

  // Fetch Reviews
  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ['admin-reviews-overview'],
    queryFn: async () => {
      const res = await axios.get('/api/reviews?admin=true');
      return res.data?.reviews || [];
    },
  });

  // Metrics Calculations
  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.totalAmount ?? o.total ?? 0), 0);

  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;
  const activeProducts = products.filter((p) => p.isActive !== false).length;
  const heroProducts = products.filter((p) => p.isHeroSlider === true).length;
  const pendingReviews = reviews.filter((r) => r.status === 'Pending' || r.status === 'pending').length;

  // Low stock check
  const lowStockVariants: { productName: string; variantName: string; stock: number }[] = [];
  products.forEach((p) => {
    p.variants?.forEach((v) => {
      const stockLevel = v.stock ?? v.stockCount ?? 50;
      if (stockLevel <= 5) {
        lowStockVariants.push({
          productName: p.name || 'Product',
          variantName: v.name,
          stock: stockLevel,
        });
      }
    });
  });

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className={`${cardCls} p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-[#292233] via-[#211C28] to-[#1C1724]`}>
        <div className="max-w-2xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C4587A]/20 border border-[#C4587A]/30 text-[#E39BB4] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>সুবিন্যাস এডমিন কন্ট্রোল সেন্টার</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            স্টোর পারফরম্যান্স ও লাইভ স্ট্যাটাস
          </h1>
          <p className="text-xs sm:text-sm text-[#9C8FA8] leading-relaxed">
            এখানে আপনার স্টোরের মোট বিক্রয়, অর্ডার প্রসেসিং, ইনভেন্টরি স্টক ও লাইভ ব্যানার স্লাইডারের সার্বিক অগ্রগতি দেখতে পারবেন।
          </p>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#C4587A]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Revenue */}
        <div className={`${cardCls} p-5 sm:p-6 space-y-3`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8A7D97]">মোট বিক্রয় (Total Revenue)</span>
            <div className="w-9 h-9 rounded-xl bg-[#6FAE8C]/15 border border-[#6FAE8C]/30 flex items-center justify-center text-[#8FC7A9]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              ৳{totalRevenue.toLocaleString()}
            </h3>
            <p className="text-[11px] text-[#8FC7A9] font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>সফল অর্ডারসমূহ থেকে অর্জিত</span>
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className={`${cardCls} p-5 sm:p-6 space-y-3`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8A7D97]">মোট অর্ডার (Total Orders)</span>
            <div className="w-9 h-9 rounded-xl bg-[#6C93C4]/15 border border-[#6C93C4]/30 flex items-center justify-center text-[#8FB0D9]">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {orders.length}
            </h3>
            <p className="text-[11px] text-[#8FB0D9] font-medium">
              ডেলিভার্ড: {deliveredOrders} টি অর্ডার
            </p>
          </div>
        </div>

        {/* Pending Orders */}
        <div className={`${cardCls} p-5 sm:p-6 space-y-3`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8A7D97]">পেন্ডিং অর্ডার (Pending)</span>
            <div className="w-9 h-9 rounded-xl bg-[#D6A24E]/15 border border-[#D6A24E]/30 flex items-center justify-center text-[#E4BC79]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {pendingOrders}
            </h3>
            <p className="text-[11px] text-[#E4BC79] font-medium">
              {pendingOrders > 0 ? 'দ্রুত কনফার্মেশন প্রয়োজন' : 'সব অর্ডার প্রসেসড'}
            </p>
          </div>
        </div>

        {/* Active Products */}
        <div className={`${cardCls} p-5 sm:p-6 space-y-3`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8A7D97]">সক্রিয় প্রোডাক্ট (Products)</span>
            <div className="w-9 h-9 rounded-xl bg-[#C4587A]/15 border border-[#C4587A]/30 flex items-center justify-center text-[#E39BB4]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {activeProducts}
            </h3>
            <p className="text-[11px] text-[#E39BB4] font-medium">
              হিরো ব্যানারে সক্রিয়: {heroProducts} টি
            </p>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards Grid */}
      <div>
        <h2 className="text-sm font-bold text-white mb-3.5 flex items-center gap-2">
          <span>ম্যানেজমেন্ট শর্টকাটস (Quick Modules)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Orders Module */}
          <Link
            href="/dashboard/orders"
            className={`${cardCls} p-5 hover:border-[#C4587A]/50 hover:bg-[#272130] transition-all group cursor-pointer space-y-3`}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#6C93C4]/15 text-[#8FB0D9] flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold bg-[#14111A] text-[#8FB0D9] px-2.5 py-1 rounded-lg border border-[#2E2733]">
                {orders.length} Orders
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#E39BB4] transition-colors flex items-center justify-between">
                <span>Orders Management</span>
                <ChevronRight className="w-4 h-4 text-[#8A7D97] group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-[#8A7D97] mt-1">
                অর্ডার ফিল্টারিং, স্ট্যাটাস আপডেট ও এক্সেল এক্সপোর্ট
              </p>
            </div>
          </Link>

          {/* Products & Inventory Module */}
          <Link
            href="/dashboard/products"
            className={`${cardCls} p-5 hover:border-[#C4587A]/50 hover:bg-[#272130] transition-all group cursor-pointer space-y-3`}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#C4587A]/15 text-[#E39BB4] flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold bg-[#14111A] text-[#E39BB4] px-2.5 py-1 rounded-lg border border-[#2E2733]">
                {products.length} Products
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#E39BB4] transition-colors flex items-center justify-between">
                <span>Products & Stock</span>
                <ChevronRight className="w-4 h-4 text-[#8A7D97] group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-[#8A7D97] mt-1">
                নতুন প্রোডাক্ট যোগ, স্টক লেভেল, কম্বো ও প্রাইসিং কন্ট্রোল
              </p>
            </div>
          </Link>

          {/* Manage Banners Module */}
          <Link
            href="/dashboard/banners"
            className={`${cardCls} p-5 hover:border-[#C4587A]/50 hover:bg-[#272130] transition-all group cursor-pointer space-y-3`}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#D3A45E]/15 text-[#E4BC79] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold bg-[#14111A] text-[#E4BC79] px-2.5 py-1 rounded-lg border border-[#2E2733]">
                16:9 Hero Pool
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#E39BB4] transition-colors flex items-center justify-between">
                <span>Hero Banner Manager</span>
                <ChevronRight className="w-4 h-4 text-[#8A7D97] group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-[#8A7D97] mt-1">
                ১৬:৯ ব্যানার আপলোড, লেআউট পজিশন ও হোমপেজ স্লাইডার
              </p>
            </div>
          </Link>

          {/* Categories Module */}
          <Link
            href="/dashboard/categories"
            className={`${cardCls} p-5 hover:border-[#C4587A]/50 hover:bg-[#272130] transition-all group cursor-pointer space-y-3`}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#6FAE8C]/15 text-[#8FC7A9] flex items-center justify-center">
                <Folder className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold bg-[#14111A] text-[#8FC7A9] px-2.5 py-1 rounded-lg border border-[#2E2733]">
                {categories.length} Categories
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#E39BB4] transition-colors flex items-center justify-between">
                <span>Categories Manager</span>
                <ChevronRight className="w-4 h-4 text-[#8A7D97] group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-[#8A7D97] mt-1">
                কালেকশন ক্যাটাগরি তৈরি, নাম ও আইকন পরিবর্তন
              </p>
            </div>
          </Link>

          {/* Reviews Module */}
          <Link
            href="/dashboard/reviews"
            className={`${cardCls} p-5 hover:border-[#C4587A]/50 hover:bg-[#272130] transition-all group cursor-pointer space-y-3`}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#9C7FC4]/15 text-[#BAA3DE] flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold bg-[#14111A] text-[#BAA3DE] px-2.5 py-1 rounded-lg border border-[#2E2733]">
                {pendingReviews} Pending
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#E39BB4] transition-colors flex items-center justify-between">
                <span>Customer Reviews</span>
                <ChevronRight className="w-4 h-4 text-[#8A7D97] group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-[#8A7D97] mt-1">
                গ্রাহকদের রিভিউ অ্যাপ্রুভ ও সামাজিক প্রমাণ নিয়ন্ত্রণ
              </p>
            </div>
          </Link>

          {/* Store Settings Module */}
          <Link
            href="/dashboard/settings"
            className={`${cardCls} p-5 hover:border-[#C4587A]/50 hover:bg-[#272130] transition-all group cursor-pointer space-y-3`}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#CB8A4E]/15 text-[#DDA876] flex items-center justify-center">
                <SettingsIcon className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold bg-[#14111A] text-[#DDA876] px-2.5 py-1 rounded-lg border border-[#2E2733]">
                Config
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#E39BB4] transition-colors flex items-center justify-between">
                <span>Store Settings</span>
                <ChevronRight className="w-4 h-4 text-[#8A7D97] group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-[#8A7D97] mt-1">
                পিক্সেল আইডি, ডেলিভারি চার্জ ও নোটিশ ব্যানার
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Low Stock Alerts (if any) */}
      {lowStockVariants.length > 0 && (
        <div className={`${cardCls} p-5 sm:p-6 border-[#C1495A]/30 bg-[#261C24] space-y-3`}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#DD8A94]" />
              <span>লো স্টক সতর্কতা (Low Stock Alerts)</span>
            </h3>
            <Link
              href="/dashboard/products"
              className="text-xs text-[#E39BB4] hover:underline font-semibold"
            >
              ইনভেন্টরি আপডেট করুন &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {lowStockVariants.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#191520] p-3 rounded-xl border border-[#2E2733] flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-white truncate">{item.productName}</p>
                  <p className="text-[#8A7D97] text-[11px]">ভ্যারিয়েন্ট: {item.variantName}</p>
                </div>
                <span className="font-mono font-bold text-[#DD8A94] bg-[#C1495A]/15 px-2 py-0.5 rounded border border-[#C1495A]/30">
                  {item.stock} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders Overview Table */}
      <div className={`${cardCls} p-5 sm:p-6 space-y-4`}>
        <div className="flex items-center justify-between border-b border-[#2E2733] pb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-[#8FB0D9]" />
              <span>সাম্প্রতিক অর্ডারসমূহ (Recent Orders)</span>
            </h3>
            <p className="text-xs text-[#8A7D97] mt-0.5">
              সর্বশেষ আসা অর্ডার ও গ্রাহক তথ্যের সারসংক্ষেপ
            </p>
          </div>
          <Link
            href="/dashboard/orders"
            className="text-xs text-[#E39BB4] hover:underline font-semibold flex items-center gap-1"
          >
            <span>সকল অর্ডার দেখুন</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#8A7D97]">
            কোনো অর্ডার পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#2E2733] text-[#8A7D97] font-semibold">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Items</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E2733]/60">
                {orders.slice(0, 8).map((order, idx) => {
                  const orderIdentifier = order.orderId || order.id || `order-${idx}`;
                  const orderTotal = order.totalAmount ?? order.total ?? 0;

                  return (
                    <tr key={orderIdentifier} className="hover:bg-[#272130]/50 transition-colors">
                      <td className="py-3 font-mono font-bold text-white">
                        <Link href="/dashboard/orders" className="hover:text-[#E39BB4]">
                          #{orderIdentifier.slice(-6)}
                        </Link>
                      </td>
                      <td className="py-3">
                        <p className="font-bold text-white">{order.customerName}</p>
                        <p className="text-[11px] text-[#8A7D97] font-mono">{order.phone}</p>
                      </td>
                      <td className="py-3 text-[#D8CFE0]">
                        {order.items?.length || 1} item(s)
                      </td>
                      <td className="py-3 font-mono font-bold text-white">
                        ৳{orderTotal}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md font-bold text-[10px] border ${
                            STATUS_STYLES[order.status] || STATUS_STYLES.Pending
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-right text-[11px] text-[#8A7D97] font-mono">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('bn-BD') : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}