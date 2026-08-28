'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Phone,
  MessageCircle,
  Download,
  Search,
  Settings as SettingsIcon,
  RefreshCw,
  LogOut,
  Sliders,
  Shield,
  Layers,
} from 'lucide-react';
import { Order, OrderStatus, StoreSettings, Product } from '@/lib/types';

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'settings'>('orders');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch orders
  const {
    data: ordersData,
    isLoading: isOrdersLoading,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ['admin-orders', statusFilter, searchQuery],
    queryFn: async () => {
      const res = await axios.get(`/api/orders?status=${statusFilter}&search=${encodeURIComponent(searchQuery)}`);
      return res.data?.orders as Order[];
    },
  });

  // Fetch products
  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const res = await axios.get('/api/products');
      return res.data?.products as Product[];
    },
  });

  // Fetch settings
  const { data: settingsData, isLoading: isSettingsLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const res = await axios.get('/api/settings');
      return res.data?.settings as StoreSettings;
    },
  });

  // Settings form local state
  const [metaPixelId, setMetaPixelId] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryInside, setDeliveryInside] = useState(70);
  const [deliveryOutside, setDeliveryOutside] = useState(130);
  const [announcement, setAnnouncement] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // Sync settings when loaded
  React.useEffect(() => {
    if (settingsData) {
      setMetaPixelId(settingsData.metaPixelId || '');
      setWhatsappNumber(settingsData.whatsappNumber || '');
      setPhone(settingsData.phone || '');
      setDeliveryInside(settingsData.deliveryInsideDhaka || 70);
      setDeliveryOutside(settingsData.deliveryOutsideDhaka || 130);
      setAnnouncement(settingsData.announcementTextBn || '');
    }
  }, [settingsData]);

  // Order status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      const res = await axios.patch(`/api/orders/${orderId}`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });

  // Stock update mutation
  const updateStockMutation = useMutation({
    mutationFn: async ({
      slug,
      variantId,
      inStock,
      stockCount,
    }: {
      slug: string;
      variantId: string;
      inStock: boolean;
      stockCount: number;
    }) => {
      const res = await axios.post('/api/products', { slug, variantId, inStock, stockCount });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  // Save Settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<StoreSettings>) => {
      const res = await axios.post('/api/settings', newSettings);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['store-settings'] });
      setSettingsSuccess('সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
      setTimeout(() => setSettingsSuccess(''), 4000);
    },
  });

  const orders = ordersData || [];
  const totalRevenue = orders.reduce((sum, o) => (o.status !== 'Cancelled' ? sum + o.totalAmount : sum), 0);
  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
  const confirmedOrders = orders.filter((o) => o.status === 'Confirmed').length;
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    updateStatusMutation.mutate({ orderId, status });
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettingsMutation.mutate({
      metaPixelId,
      whatsappNumber,
      phone,
      deliveryInsideDhaka: Number(deliveryInside),
      deliveryOutsideDhaka: Number(deliveryOutside),
      announcementTextBn: announcement,
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Top Header */}
      <header className="bg-slate-950/80 border-b border-slate-800 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                স
              </div>
              <div>
                <span className="font-extrabold text-white text-base">সুবিন্যাস</span>
                <span className="text-xs text-rose-400 ml-1 font-semibold">অ্যাডমিন ড্যাশবোর্ড</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
            >
              ওয়েবসাইট দেখুন ↗
            </Link>
            <button
              onClick={() => refetchOrders()}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              href="/login"
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>লগইন / আউট</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>মোট রেভিনিউ (বিক্রয়)</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">৳{totalRevenue.toLocaleString()}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">ক্যান্সেল ব্যতীত মোট আয়</span>
          </div>

          <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>মোট অর্ডার সংখ্যা</span>
              <ShoppingBag className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">{orders.length} টি</div>
            <span className="text-[11px] text-slate-400 mt-1 block">সার্বমোট কাস্টমার রিকোয়েস্ট</span>
          </div>

          <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>অপেক্ষমাণ (Pending)</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400">{pendingOrders} টি</div>
            <span className="text-[11px] text-slate-400 mt-1 block">কনফার্মেশন বা অগ্রিম ফি বাকি</span>
          </div>

          <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>সফল ডেলিভারি</span>
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-teal-400">{deliveredOrders} টি</div>
            <span className="text-[11px] text-slate-400 mt-1 block">কনফার্মড: {confirmedOrders} টি</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'orders'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>অর্ডার ম্যানেজমেন্ট ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'inventory'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>প্রোডাক্ট ও স্টক কন্ট্রোল</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'settings'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Meta Pixel ও স্টোর সেটিংস</span>
          </button>
        </div>

        {/* TAB 1: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Filter and Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-800/60 p-4 rounded-2xl border border-slate-700">
              {/* Status Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                {['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      statusFilter === st
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {st === 'All' ? 'সকল অর্ডার' : st}
                  </button>
                ))}
              </div>

              {/* Search and CSV Export */}
              <div className="flex items-center gap-2.5">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="নাম, ফোন বা আইডি..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-900 rounded-lg text-xs border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <a
                  href="/api/orders/export"
                  download
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm shrink-0 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV ডাউনলোড (Courier)</span>
                </a>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-slate-800/60 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
              {isOrdersLoading ? (
                <div className="p-12 text-center text-slate-400 text-sm">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500" />
                  <span>অর্ডার লোড হচ্ছে...</span>
                </div>
              ) : orders.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm">
                  <Package className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                  <span>কোনো অর্ডার পাওয়া যায়নি।</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-700 uppercase tracking-wider">
                      <tr>
                        <th className="p-3.5">অর্ডার আইডি ও সময়</th>
                        <th className="p-3.5">গ্রাহকের তথ্য</th>
                        <th className="p-3.5">ঠিকানা ও এরিয়া</th>
                        <th className="p-3.5">প্যাকেজ ও কালার</th>
                        <th className="p-3.5">মোট মূল্য</th>
                        <th className="p-3.5">স্ট্যাটাস</th>
                        <th className="p-3.5 text-right">কুইক অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60 text-slate-200">
                      {orders.map((order) => {
                        const whatsappMsg = encodeURIComponent(
                          `আসসালামু আলাইকুম ${order.customerName} ম্যাম/স্যার! সুবিন্যাস (subinyas.shop) থেকে আপনার অর্ডার #${order.orderId} (${order.productNameBn}) কনফার্মেশনের জন্য যোগাযোগ করছি।`
                        );
                        return (
                          <tr key={order.orderId} className="hover:bg-slate-700/30 transition-colors">
                            {/* Order ID & Date */}
                            <td className="p-3.5 font-mono">
                              <div className="font-bold text-rose-400">{order.orderId}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {new Date(order.createdAt).toLocaleString('bn-BD', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </td>

                            {/* Customer details */}
                            <td className="p-3.5">
                              <div className="font-bold text-white">{order.customerName}</div>
                              <a
                                href={`tel:${order.phone}`}
                                className="text-slate-400 hover:text-rose-400 font-mono text-[11px] flex items-center gap-1 mt-0.5"
                              >
                                <Phone className="w-3 h-3" />
                                <span>{order.phone}</span>
                              </a>
                            </td>

                            {/* Address */}
                            <td className="p-3.5 max-w-[200px]">
                              <div className="truncate text-slate-300" title={order.address}>
                                {order.address}
                              </div>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-1 ${
                                  order.deliveryArea === 'inside_dhaka'
                                    ? 'bg-blue-500/20 text-blue-300'
                                    : 'bg-amber-500/20 text-amber-300'
                                }`}
                              >
                                {order.deliveryArea === 'inside_dhaka' ? 'ঢাকার ভিতরে (৳৭০)' : 'ঢাকার বাইরে (৳১৩০)'}
                              </span>
                            </td>

                            {/* Package / Variants */}
                            <td className="p-3.5">
                              <div className="font-semibold text-white">{order.comboTitleBn}</div>
                              <div className="text-[11px] text-rose-300 mt-0.5">
                                {order.selectedVariants?.join(', ')}
                              </div>
                            </td>

                            {/* Amount */}
                            <td className="p-3.5 font-bold">
                              <div className="text-emerald-400 text-sm">৳{order.totalAmount}</div>
                              <div className="text-[10px] text-slate-400">ডেলিভারি: ৳{order.deliveryCharge}</div>
                            </td>

                            {/* Status Dropdown */}
                            <td className="p-3.5">
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.orderId, e.target.value as OrderStatus)}
                                className={`text-xs font-bold py-1.5 px-2.5 rounded-lg border focus:outline-none cursor-pointer ${
                                  order.status === 'Pending'
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    : order.status === 'Confirmed'
                                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                    : order.status === 'Shipped'
                                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                    : order.status === 'Delivered'
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                }`}
                              >
                                <option value="Pending" className="bg-slate-900 text-white">🟡 Pending</option>
                                <option value="Confirmed" className="bg-slate-900 text-white">🔵 Confirmed</option>
                                <option value="Shipped" className="bg-slate-900 text-white">🟣 Shipped</option>
                                <option value="Delivered" className="bg-slate-900 text-white">🟢 Delivered</option>
                                <option value="Cancelled" className="bg-slate-900 text-white">🔴 Cancelled</option>
                              </select>
                            </td>

                            {/* Quick Action Buttons */}
                            <td className="p-3.5 text-right space-x-1.5 shrink-0">
                              <a
                                href={`tel:${order.phone}`}
                                className="inline-flex p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                                title="সরাসরি কল দিন"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                              <a
                                href={`https://wa.me/88${order.phone.replace(/^0/, '')}?text=${whatsappMsg}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                                title="হোয়াটসঅ্যাপ মেসেজ পাঠান"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
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
        )}

        {/* TAB 2: INVENTORY & STOCK CONTROL */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {isProductsLoading ? (
              <div className="p-12 text-center text-slate-400">প্রোডাক্ট লোড হচ্ছে...</div>
            ) : (
              (productsData || []).map((prod) => (
                <div key={prod.id} className="bg-slate-800/60 rounded-2xl border border-slate-700 p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{prod.nameBn}</h3>
                      <p className="text-xs text-slate-400">রুট: /products/{prod.slug}</p>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                      সক্রিয় পণ্য
                    </span>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-rose-300 flex items-center gap-1.5">
                      <Sliders className="w-4 h-4" />
                      <span>ভ্যারিয়েন্ট ও স্টক নিয়ন্ত্রণ</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {prod.variants.map((v) => (
                        <div key={v.id} className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-white">{v.nameBn}</span>
                            <div
                              className="w-4 h-4 rounded-full border border-white/20"
                              style={{ backgroundColor: v.colorHex }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>স্টক পরিমাণ:</span>
                            <input
                              type="number"
                              defaultValue={v.stockCount}
                              onBlur={(e) => {
                                updateStockMutation.mutate({
                                  slug: prod.slug,
                                  variantId: v.id,
                                  inStock: v.inStock,
                                  stockCount: Number(e.target.value),
                                });
                              }}
                              className="w-20 px-2 py-1 bg-slate-800 rounded border border-slate-700 text-white font-mono text-right"
                            />
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                            <span className="text-xs text-slate-400">স্ট্যাটাস:</span>
                            <button
                              type="button"
                              onClick={() => {
                                updateStockMutation.mutate({
                                  slug: prod.slug,
                                  variantId: v.id,
                                  inStock: !v.inStock,
                                  stockCount: v.stockCount,
                                });
                              }}
                              className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                                v.inStock
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {v.inStock ? '✓ In Stock' : '✗ Out of Stock'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: META PIXEL & STORE SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-6 max-w-2xl">
            <div className="border-b border-slate-700 pb-4 mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-rose-500" />
                <span>Meta Pixel ও স্টোর কনফিগারেশন</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                এখানে আপনার Facebook Pixel ID ও WhatsApp নম্বর দিলে সাইটে স্বয়ংক্রিয়ভাবে আপডেট হয়ে যাবে।
              </p>
            </div>

            {settingsSuccess && (
              <div className="mb-6 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs p-3.5 rounded-xl font-bold">
                ✓ {settingsSuccess}
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs sm:text-sm">
              {/* Meta Pixel ID */}
              <div>
                <label className="block font-bold text-slate-200 mb-1">
                  Meta Pixel (Facebook Pixel) ID:
                </label>
                <input
                  type="text"
                  value={metaPixelId}
                  onChange={(e) => setMetaPixelId(e.target.value)}
                  placeholder="যেমন: 1234567890123456"
                  className="w-full px-3.5 py-2.5 bg-slate-900 rounded-xl border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  ফেসবুক ইভেন্টস ম্যানেজার থেকে ১৬ ডিজিটের Pixel ID টি এখানে দিন।
                </p>
              </div>

              {/* Official WhatsApp Number */}
              <div>
                <label className="block font-bold text-slate-200 mb-1">
                  অফিসিয়াল WhatsApp নম্বর (দেশের কোড সহ):
                </label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="যেমন: 8801700000000"
                  className="w-full px-3.5 py-2.5 bg-slate-900 rounded-xl border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Helpline Phone */}
              <div>
                <label className="block font-bold text-slate-200 mb-1">
                  হেল্পলাইন ফোন নম্বর (হেডারে শো করবে):
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="যেমন: 01700000000"
                  className="w-full px-3.5 py-2.5 bg-slate-900 rounded-xl border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Delivery charges */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-200 mb-1">
                    ঢাকার ভিতরে ডেলিভারি ফি (৳):
                  </label>
                  <input
                    type="number"
                    value={deliveryInside}
                    onChange={(e) => setDeliveryInside(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-900 rounded-xl border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-200 mb-1">
                    ঢাকার বাইরে ডেলিভারি ফি (৳):
                  </label>
                  <input
                    type="number"
                    value={deliveryOutside}
                    onChange={(e) => setDeliveryOutside(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-900 rounded-xl border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Announcement */}
              <div>
                <label className="block font-bold text-slate-200 mb-1">
                  টপ অ্যানাউন্সমেন্ট টেক্সট:
                </label>
                <input
                  type="text"
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  placeholder="অ্যানাউন্সমেন্ট বার্তা লিখুন..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 rounded-xl border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                disabled={saveSettingsMutation.isPending}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all text-xs sm:text-sm mt-4 cursor-pointer"
              >
                {saveSettingsMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস সেভ করুন (Save Settings)'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
