'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
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
  Star,
  MessageSquare,
  Check,
  X,
  Trash2,
} from 'lucide-react';
import { Order, OrderStatus, StoreSettings, Product, Review } from '@/lib/types';

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'reviews' | 'settings'>('orders');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [reviewStatusFilter, setReviewStatusFilter] = useState<string>('All');
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

  // Fetch reviews for moderation
  const { data: reviewsData, isLoading: isReviewsLoading, refetch: refetchReviews } = useQuery<Review[]>({
    queryKey: ['admin-reviews', reviewStatusFilter],
    queryFn: async () => {
      const res = await axios.get(`/api/reviews?admin=true&status=${reviewStatusFilter}`);
      return res.data?.reviews || [];
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

  // Review status update mutation
  const updateReviewStatusMutation = useMutation({
    mutationFn: async ({ reviewId, status }: { reviewId: string; status: 'Approved' | 'Declined' }) => {
      const res = await axios.patch('/api/reviews', { reviewId, status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await axios.delete(`/api/reviews?id=${reviewId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
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
  const reviews = reviewsData || [];
  const pendingReviews = reviews.filter((r) => r.status === 'Pending').length;

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    updateStatusMutation.mutate({ orderId, status });
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettingsMutation.mutate({
      metaPixelId: metaPixelId.trim(),
      whatsappNumber: whatsappNumber.trim(),
      phone: phone.trim(),
      deliveryInsideDhaka: Number(deliveryInside),
      deliveryOutsideDhaka: Number(deliveryOutside),
      announcementTextBn: announcement.trim(),
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
                <span className="text-xs text-rose-400 ml-1 font-semibold">Admin Dashboard</span>
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
              onClick={() => {
                refetchOrders();
                refetchReviews();
              }}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700 cursor-pointer"
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
              <span>মোট রেভিনিউ</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">৳{totalRevenue.toLocaleString()}</div>
            <span className="text-[11px] text-emerald-400 mt-1 block">ক্যাশ অন ডেলিভারি</span>
          </div>

          <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>মোট অর্ডার সংখ্যা</span>
              <Package className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">{orders.length} টি</div>
            <span className="text-[11px] text-slate-400 mt-1 block">সকল কাস্টমার অর্ডার</span>
          </div>

          <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>অপেক্ষমাণ (Pending)</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400">{pendingOrders} টি</div>
            <span className="text-[11px] text-slate-400 mt-1 block">পেন্ডিং রিভিউ: {pendingReviews} টি</span>
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
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>অর্ডার ম্যানেজমেন্ট ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>রিভিউ মডারেশন ({reviews.length})</span>
            {pendingReviews > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                {pendingReviews} new
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
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
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>স্টোর ও মেটা পিক্সেল কনফিগ</span>
          </button>
        </div>

        {/* TAB 1: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-800/40 p-4 rounded-2xl border border-slate-700">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="অর্ডার আইডি, ফোন বা কাস্টমারের নাম দিয়ে খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto">
                {['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      statusFilter === st
                        ? 'bg-slate-200 text-slate-900'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <a
                href="/api/orders/export"
                download="subinyas_orders.csv"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span>কুরিয়ার CSV এক্সপোর্ট</span>
              </a>
            </div>

            {/* Orders Table */}
            <div className="bg-slate-800/60 rounded-2xl border border-slate-700 overflow-hidden shadow-lg">
              {isOrdersLoading ? (
                <div className="p-12 text-center text-slate-400 text-sm">অর্ডার লোড হচ্ছে...</div>
              ) : orders.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm">কোনো অর্ডার পাওয়া যায়নি।</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                      <tr>
                        <th className="py-3 px-4">অর্ডার আইডি</th>
                        <th className="py-3 px-4">কাস্টমার</th>
                        <th className="py-3 px-4">পণ্য ও ভ্যারিয়েন্ট</th>
                        <th className="py-3 px-4">মোট টাকা</th>
                        <th className="py-3 px-4">স্ট্যাটাস</th>
                        <th className="py-3 px-4 text-right">কুইক অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60">
                      {orders.map((ord) => (
                        <tr key={ord.orderId} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-4 px-4 font-mono font-bold text-white">
                            {ord.orderId}
                            <span className="block text-[10px] font-normal text-slate-400">
                              {new Date(ord.createdAt).toLocaleDateString('bn-BD', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-bold text-white text-sm">{ord.customerName}</div>
                            <div className="text-slate-400 font-mono mt-0.5">{ord.phone}</div>
                            <div className="text-[11px] text-slate-400 max-w-[180px] truncate mt-0.5" title={ord.address}>
                              📍 {ord.address}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-semibold text-rose-300">{ord.productNameBn}</div>
                            <div className="text-[11px] text-slate-300">{ord.comboTitleBn}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              কালার: {ord.selectedVariants?.join(', ')}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-extrabold text-white text-sm">৳{ord.totalAmount}</div>
                            <div className="text-[10px] text-slate-400">
                              {ord.deliveryArea === 'inside_dhaka' ? 'ঢাকা (৳৭০)' : 'ঢাকার বাইরে (৳১৩০)'}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <select
                              value={ord.status}
                              onChange={(e) => handleStatusChange(ord.orderId, e.target.value as OrderStatus)}
                              className={`text-xs font-bold py-1.5 px-3 rounded-lg border focus:outline-none cursor-pointer ${
                                ord.status === 'Pending'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                  : ord.status === 'Confirmed'
                                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                  : ord.status === 'Shipped'
                                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                  : ord.status === 'Delivered'
                                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              }`}
                            >
                              <option value="Pending" className="bg-slate-900 text-amber-300">Pending</option>
                              <option value="Confirmed" className="bg-slate-900 text-blue-300">Confirmed</option>
                              <option value="Shipped" className="bg-slate-900 text-purple-300">Shipped</option>
                              <option value="Delivered" className="bg-slate-900 text-teal-300">Delivered</option>
                              <option value="Cancelled" className="bg-slate-900 text-rose-300">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <a
                                href={`tel:${ord.phone}`}
                                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200"
                                title="কল করুন"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                              <a
                                href={`https://wa.me/88${ord.phone}?text=${encodeURIComponent(
                                  `আসসালামু আলাইকুম ${ord.customerName}! সুবিন্যাস (subinyas.shop) থেকে আপনার অর্ডার ${ord.orderId} কনফার্মেশনের জন্য যোগাযোগ করছি।`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg transition-colors"
                                title="হোয়াটসঅ্যাপে মেসেজ পাঠান"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: REVIEW MODERATION */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-800/40 p-4 rounded-2xl border border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">ফিল্টার:</span>
                {['All', 'Pending', 'Approved', 'Declined'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setReviewStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      reviewStatusFilter === st
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <span className="text-xs text-slate-400">
                মোট রিভিউ: <strong className="text-white">{reviews.length} টি</strong>
              </span>
            </div>

            {isReviewsLoading ? (
              <div className="p-12 text-center text-slate-400 text-sm">রিভিউ লোড হচ্ছে...</div>
            ) : reviews.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm bg-slate-800/40 rounded-2xl border border-slate-700">
                কোনো রিভিউ পাওয়া যায়নি।
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{rev.userName}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                rev.status === 'Approved'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : rev.status === 'Declined'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {rev.status || 'Pending'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Product: <strong className="text-slate-300">{rev.productSlug}</strong> •{' '}
                            {new Date(rev.createdAt).toLocaleDateString('bn-BD')}
                          </span>
                        </div>

                        <div className="flex text-amber-400">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                        "{rev.comment}"
                      </p>

                      {/* Photo/video thumbnails */}
                      {rev.mediaUrls && rev.mediaUrls.length > 0 && (
                        <div className="flex gap-2 pt-1">
                          {rev.mediaUrls.map((url, idx) => (
                            <div
                              key={idx}
                              className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-700 bg-slate-900"
                            >
                              <Image src={url} alt="Review media" fill className="object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-700/60">
                      {rev.status !== 'Approved' && (
                        <button
                          onClick={() => updateReviewStatusMutation.mutate({ reviewId: rev.id, status: 'Approved' })}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve (এপ্রুভ)</span>
                        </button>
                      )}

                      {rev.status !== 'Declined' && (
                        <button
                          onClick={() => updateReviewStatusMutation.mutate({ reviewId: rev.id, status: 'Declined' })}
                          className="bg-amber-600/30 hover:bg-amber-600 text-amber-300 hover:text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Decline (ডিক্লাইন)</span>
                        </button>
                      )}

                      <button
                        onClick={() => deleteReviewMutation.mutate(rev.id)}
                        className="bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Delete Review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: INVENTORY */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {productsData?.map((prod) => (
              <div key={prod.slug} className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <div>
                    <h3 className="font-bold text-white text-base">{prod.nameBn}</h3>
                    <span className="text-xs text-slate-400 font-mono">Slug: {prod.slug}</span>
                  </div>
                  <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20">
                    বেস প্রাইস: ৳{prod.basePrice}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {prod.variants.map((v) => (
                    <div key={v.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full border border-slate-600"
                          style={{ backgroundColor: v.colorHex }}
                        />
                        <span className="font-bold text-white text-xs">{v.nameBn}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={v.inStock}
                            onChange={(e) =>
                              updateStockMutation.mutate({
                                slug: prod.slug,
                                variantId: v.id,
                                inStock: e.target.checked,
                                stockCount: v.stockCount,
                              })
                            }
                            className="accent-rose-500 rounded"
                          />
                          <span className={v.inStock ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                            {v.inStock ? 'In Stock (মজুদ আছে)' : 'Stock Out (শেষ)'}
                          </span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-slate-800/60 p-6 rounded-2xl border border-slate-700 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-rose-400" />
              <span>স্টোর সেটিংস ও মেটা পিক্সেল কনফিগারেশন</span>
            </h3>

            {settingsSuccess && (
              <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs p-3 rounded-xl">
                {settingsSuccess}
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Meta Pixel ID (Facebook Ads Pixel)</label>
                <input
                  type="text"
                  value={metaPixelId}
                  onChange={(e) => setMetaPixelId(e.target.value)}
                  placeholder="যেমন: 1234567890123456"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">অফিসিয়াল হোয়াটসঅ্যাপ নম্বর (৮৮০...)</label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="8801617492486"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ঢাকার ভিতরে ডেলিভারি চার্জ (৳)</label>
                  <input
                    type="number"
                    value={deliveryInside}
                    onChange={(e) => setDeliveryInside(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ঢাকার বাইরে ডেলিভারি চার্জ (৳)</label>
                  <input
                    type="number"
                    value={deliveryOutside}
                    onChange={(e) => setDeliveryOutside(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saveSettingsMutation.isPending}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl shadow-lg transition-colors cursor-pointer"
              >
                {saveSettingsMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস আপডেট করুন'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
