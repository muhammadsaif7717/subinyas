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
  Phone,
  MessageCircle,
  Download,
  Search,
  Settings as SettingsIcon,
  RefreshCw,
  LogOut,
  Sliders,
  Layers,
  Star,
  MessageSquare,
  Check,
  X,
  Trash2,
  Plus,
  Camera,
  Loader2,
  ExternalLink,
  Edit,
  Sparkles,
} from 'lucide-react';
import { Order, OrderStatus, StoreSettings, Product, Review, ProductVariant, ComboOption } from '@/lib/types';

const CATEGORY_OPTIONS = ['Organizers', 'Jewelry Box', 'Pouches', 'Travel', 'Accessories', 'Bags', 'Gifts'];

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'reviews' | 'settings'>('orders');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [reviewStatusFilter, setReviewStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductSlug, setEditingProductSlug] = useState<string | null>(null);
  const [productFormError, setProductFormError] = useState('');
  const [productFormSuccess, setProductFormSuccess] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Form Fields
  const [prodName, setProdName] = useState('');
  const [prodNameBn, setProdNameBn] = useState('');
  const [prodSlug, setProdSlug] = useState('');
  const [prodCategory, setProdCategory] = useState('Organizers');
  const [prodTaglineBn, setProdTaglineBn] = useState('');
  const [prodDescriptionBn, setProdDescriptionBn] = useState('');
  const [prodBasePrice, setProdBasePrice] = useState<number>(499);
  const [prodOriginalPrice, setProdOriginalPrice] = useState<number>(800);
  const [prodIsFeatured, setProdIsFeatured] = useState<boolean>(true);
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [prodVariants, setProdVariants] = useState<ProductVariant[]>([]);
  const [prodCombos, setProdCombos] = useState<ComboOption[]>([]);

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
  const { data: productsData, isLoading: isProductsLoading, refetch: refetchProducts } = useQuery<Product[]>({
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
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
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

  // Stock toggle update mutation
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

  // Delete Product Mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (slug: string) => {
      const res = await axios.delete(`/api/products?slug=${slug}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Save/Update Product Mutation
  const saveProductMutation = useMutation({
    mutationFn: async (productData: Product) => {
      const res = await axios.post('/api/products', { product: productData });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setProductFormSuccess('প্রোডাক্ট সফলভাবে ডাটাবেসে সেভ হয়েছে!');
      setTimeout(() => {
        setProductFormSuccess('');
        setIsProductModalOpen(false);
      }, 1200);
    },
    onError: (err: unknown) => {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'প্রোডাক্ট সেভ করতে সমস্যা হয়েছে।';
      setProductFormError(msg);
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

  // Open modal for NEW product
  const handleOpenAddProduct = () => {
    setEditingProductSlug(null);
    setProductFormError('');
    setProductFormSuccess('');
    setProdName('');
    setProdNameBn('');
    setProdSlug('');
    setProdCategory('Organizers');
    setProdTaglineBn('');
    setProdDescriptionBn('');
    setProdBasePrice(499);
    setProdOriginalPrice(800);
    setProdIsFeatured(true);
    setProdImages(['/images/products/hello-kitty-pair.png']);
    setProdVariants([
      {
        id: 'var-1',
        name: 'Pink',
        nameBn: 'বেবি পিঙ্ক (Baby Pink)',
        color: 'Pink',
        colorHex: '#F472B6',
        image: '/images/products/hello-kitty-pair.png',
        inStock: true,
        stockCount: 50,
      },
      {
        id: 'var-2',
        name: 'Pearl White',
        nameBn: 'পার্ল হোয়াইট (Pearl White)',
        color: 'White',
        colorHex: '#F8FAFC',
        image: '/images/products/hello-kitty-open.png',
        inStock: true,
        stockCount: 30,
      },
    ]);
    setProdCombos([
      {
        id: 'combo-single',
        title: '1 Piece Single Pack',
        titleBn: '১টি বক্স (সিঙ্গেল প্যাক)',
        subtitleBn: '১টি বক্স • রেগুলার অফার',
        quantity: 1,
        price: 499,
        originalPrice: 800,
        savingsBn: 'Save ৳301',
      },
      {
        id: 'combo-duo',
        title: '2 Pieces Duo Pack',
        titleBn: '২টি বক্স বেস্টি কম্বো (Best Deal)',
        subtitleBn: '২টি বক্স • বেস্ট ভ্যালু অফার',
        quantity: 2,
        price: 899,
        originalPrice: 1600,
        badge: 'Best Deal 🔥',
        isPopular: true,
        savingsBn: 'Save ৳701',
      },
    ]);
    setIsProductModalOpen(true);
  };

  // Open modal for EDITING existing product
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductSlug(prod.slug);
    setProductFormError('');
    setProductFormSuccess('');
    setProdName(prod.name || '');
    setProdNameBn(prod.nameBn || '');
    setProdSlug(prod.slug || '');
    setProdCategory(prod.category || 'Organizers');
    setProdTaglineBn(prod.taglineBn || '');
    setProdDescriptionBn(prod.descriptionBn || '');
    setProdBasePrice(prod.basePrice || 499);
    setProdOriginalPrice(prod.originalPrice || 800);
    setProdIsFeatured(prod.isFeatured !== false);
    setProdImages(prod.images?.length > 0 ? prod.images : ['/images/products/hello-kitty-pair.png']);
    setProdVariants(
      prod.variants?.length > 0
        ? prod.variants
        : [
            {
              id: 'var-1',
              name: 'Default',
              nameBn: 'ডিফল্ট কালার',
              color: 'Default',
              colorHex: '#E2E8F0',
              image: prod.images?.[0] || '/images/products/hello-kitty-pair.png',
              inStock: true,
              stockCount: 20,
            },
          ]
    );
    setProdCombos(
      prod.combos?.length > 0
        ? prod.combos
        : [
            {
              id: 'combo-single',
              title: '1 Piece Single Pack',
              titleBn: '১টি বক্স (সিঙ্গেল প্যাক)',
              subtitleBn: '১টি বক্স • রেগুলার অফার',
              quantity: 1,
              price: prod.basePrice,
              originalPrice: prod.originalPrice,
              savingsBn: `Save ৳${prod.originalPrice - prod.basePrice}`,
            },
          ]
    );
    setIsProductModalOpen(true);
  };

  // Handle Image Upload
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingImage(true);
    setProductFormError('');

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        const res = await axios.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data?.success && res.data?.url) {
          setProdImages((prev) => [...prev, res.data.url]);
        }
      }
    } catch {
      setProductFormError('ইমেজ আপলোড করতে সমস্যা হয়েছে।');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle Save (Create or Update)
  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    setProductFormError('');

    if (!prodName.trim() || !prodNameBn.trim() || !prodSlug.trim()) {
      setProductFormError('পণ্যের নাম (English & Bangla) এবং স্লাগ আবশ্যক।');
      return;
    }

    const cleanSlug = prodSlug.toLowerCase().trim().replace(/[^a-z0-9-_]/g, '-');

    const fullProduct: Product = {
      id: editingProductSlug ? `prod-${editingProductSlug}` : `prod-${Date.now()}`,
      slug: cleanSlug,
      name: prodName.trim(),
      nameBn: prodNameBn.trim(),
      category: prodCategory.trim(),
      taglineBn: prodTaglineBn.trim() || prodNameBn.trim(),
      descriptionBn: prodDescriptionBn.trim() || prodNameBn.trim(),
      rating: 5.0,
      reviewCount: 0,
      basePrice: Number(prodBasePrice) || 499,
      originalPrice: Number(prodOriginalPrice) || 800,
      images: prodImages.length > 0 ? prodImages : ['/images/products/hello-kitty-pair.png'],
      variants: prodVariants,
      combos: prodCombos,
      featuresBn: [
        { icon: 'Layers', title: 'মাল্টি-কম্পার্টমেন্ট', description: 'সুসংগঠিত পার্টিশন ও স্পেস' },
        { icon: 'ShieldCheck', title: 'প্রিমিয়াম কোয়ালিটি', description: 'টেকসই ও মার্জিত ফিনিশিং' },
        { icon: 'Gift', title: 'উপহারের সেরা চয়েস', description: 'প্রিয়জনকে উপহার দেওয়ার জন্য পারফেক্ট' },
      ],
      specificationsBn: [
        { key: 'উপাদান', value: 'প্রিমিয়াম সিন্থেটিক লেদার ও সফট ভেলভেট' },
        { key: 'সাইজ', value: 'কম্প্যাক্ট ট্রাভেল ফ্রেন্ডলি' },
      ],
      isFeatured: prodIsFeatured,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveProductMutation.mutate(fullProduct);
  };

  const orders = ordersData || [];
  const totalRevenue = orders.reduce((sum, o) => (o.status !== 'Cancelled' && o.status !== 'Returned' ? sum + o.totalAmount : sum), 0);
  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
  const confirmedOrders = orders.filter((o) => o.status === 'Confirmed').length;
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;
  const reviews = reviewsData || [];
  const pendingReviews = reviews.filter((r) => r.status === 'Pending').length;
  const products = productsData || [];

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
                refetchProducts();
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
              <span>মোট প্রডাক্ট সংখ্যা</span>
              <Layers className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-teal-400">{products.length} টি</div>
            <span className="text-[11px] text-slate-400 mt-1 block">ডেলিভার্ড: {deliveredOrders} টি</span>
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
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>প্রোডাক্ট ও স্টক কন্ট্রোল ({products.length})</span>
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
                {['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'].map((st) => (
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
                                  : ord.status === 'Returned'
                                  ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              }`}
                            >
                              <option value="Pending" className="bg-slate-900 text-amber-300">Pending</option>
                              <option value="Confirmed" className="bg-slate-900 text-blue-300">Confirmed (Stock -1)</option>
                              <option value="Shipped" className="bg-slate-900 text-purple-300">Shipped</option>
                              <option value="Delivered" className="bg-slate-900 text-teal-300">Delivered</option>
                              <option value="Returned" className="bg-slate-900 text-orange-300">Returned (Stock +1)</option>
                              <option value="Cancelled" className="bg-slate-900 text-rose-300">Cancelled (Stock +1)</option>
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

        {/* TAB 2: PRODUCTS & INVENTORY CONTROL */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700">
              <div>
                <h3 className="text-base font-bold text-white">Products Management</h3>
                <p className="text-xs text-slate-400">Manage products, pricing, featured status, variants, and live inventory in MongoDB</p>
              </div>

              <button
                onClick={handleOpenAddProduct}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>

            {isProductsLoading ? (
              <div className="p-12 text-center text-slate-400">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-slate-800/40 rounded-2xl border border-slate-700 space-y-3">
                <Layers className="w-12 h-12 mx-auto text-slate-500 stroke-1" />
                <p>No products found in MongoDB database.</p>
                <button
                  onClick={handleOpenAddProduct}
                  className="bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Create First Product
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {products.map((prod) => (
                  <div key={prod.slug} className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shrink-0">
                          <Image src={prod.images[0] || '/images/products/hello-kitty-pair.png'} alt={prod.nameBn} fill className="object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-base">{prod.nameBn}</h3>
                            <span className="bg-slate-700 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">
                              {prod.category}
                            </span>
                            {prod.isFeatured && (
                              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                <span>Featured</span>
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 font-mono">Slug: /products/{prod.slug}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
                          Base: ৳{prod.basePrice} (Orig: ৳{prod.originalPrice})
                        </span>

                        <button
                          onClick={() => handleOpenEditProduct(prod)}
                          className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <Link
                          href={`/products/${prod.slug}`}
                          target="_blank"
                          className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Live</span>
                        </Link>

                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${prod.nameBn}"?`)) {
                              deleteProductMutation.mutate(prod.slug);
                            }
                          }}
                          className="p-2 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Variants and Stock */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                        Color Variants & Stock Status
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {prod.variants?.map((v) => (
                          <div key={v.id} className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className="w-4 h-4 rounded-full border border-slate-600 shrink-0"
                                  style={{ backgroundColor: v.colorHex }}
                                />
                                <span className="font-bold text-white text-xs truncate">{v.nameBn}</span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">Stock: {v.stockCount || 0}</span>
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
                                <span className={v.inStock ? 'text-emerald-400 font-bold text-[11px]' : 'text-rose-400 text-[11px]'}>
                                  {v.inStock ? 'In Stock' : 'Out of Stock'}
                                </span>
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: REVIEW MODERATION */}
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

      {/* ADD / EDIT PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-500" />
                <span>{editingProductSlug ? 'প্রোডাক্ট এডিট করুন (Edit Product)' : 'নতুন প্রোডাক্ট যুক্ত করুন (Add Product)'}</span>
              </h2>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {productFormError && (
              <div className="bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs p-3.5 rounded-xl font-medium">
                ⚠️ {productFormError}
              </div>
            )}

            {productFormSuccess && (
              <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs p-3.5 rounded-xl font-medium">
                ✅ {productFormSuccess}
              </div>
            )}

            <form onSubmit={handleSaveProductForm} className="space-y-5 text-xs sm:text-sm">
              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Product Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setProdName(val);
                      if (!editingProductSlug) {
                        const autoSlug = val
                          .toLowerCase()
                          .trim()
                          .replace(/[^\w\s-]/g, '')
                          .replace(/[\s_-]+/g, '-')
                          .replace(/^-+|-+$/g, '');
                        setProdSlug(autoSlug);
                      }
                    }}
                    placeholder="e.g. Velvet Cosmetic Travel Pouch"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Product Name (বাংলা) *</label>
                  <input
                    type="text"
                    required
                    value={prodNameBn}
                    onChange={(e) => setProdNameBn(e.target.value)}
                    placeholder="যেমন: প্রিমিয়াম ভেলভেট ট্রাভেল মেকআপ ব্যাগ"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Slug, Category, Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Product Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={prodSlug}
                    onChange={(e) => setProdSlug(e.target.value)}
                    placeholder="velvet-pouch"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-rose-300 focus:outline-none focus:border-rose-500 font-mono text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category *</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Base Price (৳) *</label>
                  <input
                    type="number"
                    required
                    value={prodBasePrice}
                    onChange={(e) => setProdBasePrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Original Price (৳)</label>
                  <input
                    type="number"
                    value={prodOriginalPrice}
                    onChange={(e) => setProdOriginalPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Featured Checkbox */}
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <label className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Featured Product (হোমপেজ ও হিরো স্লাইডারে প্রদর্শন করুন)</span>
                  </label>
                  <p className="text-[11px] text-slate-400">টিক দেওয়া থাকলে এই পণ্যটি হোমপেজের হিরো স্লাইডার ও কালেকশনে শো করবে</p>
                </div>
                <input
                  type="checkbox"
                  checked={prodIsFeatured}
                  onChange={(e) => setProdIsFeatured(e.target.checked)}
                  className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
                />
              </div>

              {/* Tagline & Description */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Tagline (বাংলা ছোট বিবরণ)</label>
                <input
                  type="text"
                  value={prodTaglineBn}
                  onChange={(e) => setProdTaglineBn(e.target.value)}
                  placeholder="যেমন: আপনার প্রসাধনী ও জুয়েলারি সুরক্ষিত ও পরিপাটি রাখার জন্য"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description (বাংলা বিস্তারিত বিবরণ)</label>
                <textarea
                  rows={2}
                  value={prodDescriptionBn}
                  onChange={(e) => setProdDescriptionBn(e.target.value)}
                  placeholder="প্রোডাক্টের বিবরণ লিখুন..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Product Images (Upload via Cloudinary)</label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-200 px-3.5 py-2 rounded-xl text-xs cursor-pointer">
                    {isUploadingImage ? <Loader2 className="w-4 h-4 animate-spin text-rose-500" /> : <Camera className="w-4 h-4 text-rose-400" />}
                    <span>{isUploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                    <input type="file" accept="image/*" multiple onChange={handleProductImageUpload} className="hidden" />
                  </label>

                  {prodImages.map((url, idx) => (
                    <div key={idx} className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                      <Image src={url} alt={`Preview ${idx}`} fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => setProdImages((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-0.5 right-0.5 bg-slate-900/90 text-white rounded-full p-0.5"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveProductMutation.isPending || isUploadingImage}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {saveProductMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>{editingProductSlug ? 'Update Product' : 'Save Product to Database'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
