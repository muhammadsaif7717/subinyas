'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  TrendingUp,
  Clock,
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
  CheckSquare,
  FolderPlus,
  Folder,
  ChevronDown,
  GripVertical,
} from 'lucide-react';
import { Order, OrderStatus, StoreSettings, Product, Review, ProductVariant, ComboOption } from '@/lib/types';
import { CategoryItem } from '@/app/api/categories/route';
import { useAuth } from '@/lib/auth-context';

type TabType = 'orders' | 'products' | 'categories' | 'reviews' | 'settings';

function DashboardContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, logout } = useAuth();

  // URL Tab state with query param persistence
  const tabFromUrl = (searchParams.get('tab') as TabType) || 'orders';
  const [activeTab, setActiveTab] = useState<TabType>(tabFromUrl);

  // Sync tab with URL
  useEffect(() => {
    const currentTabParam = searchParams.get('tab') as TabType;
    if (currentTabParam && ['orders', 'products', 'categories', 'reviews', 'settings'].includes(currentTabParam)) {
      setActiveTab(currentTabParam);
    }
  }, [searchParams]);

  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
    router.push(`/dashboard?tab=${tab}`, { scroll: false });
  };

  // Profile dropdown state
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [reviewStatusFilter, setReviewStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Category Add / Form State (Left Form)
  const [newCatName, setNewCatName] = useState('');
  const [newCatNameBn, setNewCatNameBn] = useState('');
  const [catError, setCatError] = useState('');
  const [catSuccess, setCatSuccess] = useState('');

  // Add / Edit Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductSlug, setEditingProductSlug] = useState<string | null>(null);
  const [productFormError, setProductFormError] = useState('');
  const [productFormSuccess, setProductFormSuccess] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Form Fields (100% MongoDB Product Schema Support)
  const [prodName, setProdName] = useState('');
  const [prodNameBn, setProdNameBn] = useState('');
  const [prodSlug, setProdSlug] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodTaglineBn, setProdTaglineBn] = useState('');
  const [prodDescriptionBn, setProdDescriptionBn] = useState('');
  const [prodBasePrice, setProdBasePrice] = useState<number>(499);
  const [prodOriginalPrice, setProdOriginalPrice] = useState<number>(800);
  const [prodIsFeatured, setProdIsFeatured] = useState<boolean>(true);
  const [prodIsActive, setProdIsActive] = useState<boolean>(true);
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [prodVariants, setProdVariants] = useState<ProductVariant[]>([]);
  const [prodCombos, setProdCombos] = useState<ComboOption[]>([]);
  const [prodFeaturesBn, setProdFeaturesBn] = useState<{ icon: string; title: string; description: string }[]>([]);
  const [prodSpecificationsBn, setProdSpecificationsBn] = useState<{ key: string; value: string }[]>([]);
  const [prodRating, setProdRating] = useState<number>(5.0);
  const [prodReviewCount, setProdReviewCount] = useState<number>(0);

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

  // Fetch categories from MongoDB (sorted by order)
  const { data: categoriesData, isLoading: isCategoriesLoading, refetch: refetchCategories } = useQuery<{
    success: boolean;
    categories: CategoryItem[];
  }>({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await axios.get('/api/categories');
      return res.data;
    },
  });

  const categories = categoriesData?.categories || [];

  // Update default order when categories change

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
  useEffect(() => {
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

  // Category Add Mutation
  const addCategoryMutation = useMutation({
    mutationFn: async ({ name, order }: { name: string; order: number }) => {
      const res = await axios.post('/api/categories', { name, order });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setNewCatName('');
      setCatSuccess('ক্যাটাগরি সফলভাবে সংরক্ষিত হয়েছে!');
      setTimeout(() => setCatSuccess(''), 3000);
    },
    onError: (err: unknown) => {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'ক্যাটাগরি যুক্ত করতে সমস্যা হয়েছে।';
      setCatError(msg);
    },
  });

  // Category Reorder Mutation
  const reorderCategoriesMutation = useMutation({
    mutationFn: async (items: { id: string; order: number }[]) => {
      const res = await axios.patch('/api/categories', { items });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  // Category Delete Mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (catId: string) => {
      const res = await axios.delete(`/api/categories?id=${catId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  // Drag and Drop States for Category Reordering
  const [draggedCategoryIndex, setDraggedCategoryIndex] = useState<number | null>(null);
  const [dragOverCategoryIndex, setDragOverCategoryIndex] = useState<number | null>(null);

  const handleCategoryDragStart = (e: React.DragEvent, index: number) => {
    setDraggedCategoryIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleCategoryDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCategoryIndex !== index) {
      setDragOverCategoryIndex(index);
    }
  };

  const handleCategoryDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = draggedCategoryIndex;
    if (sourceIndex === null || sourceIndex === targetIndex) {
      setDraggedCategoryIndex(null);
      setDragOverCategoryIndex(null);
      return;
    }

    const updatedList = [...categories];
    const [movedItem] = updatedList.splice(sourceIndex, 1);
    updatedList.splice(targetIndex, 0, movedItem);

    // Update order numbers sequentially
    const reorderedList = updatedList.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));

    // Optimistically update React Query cache immediately for instant UI feedback
    queryClient.setQueryData(['admin-categories'], {
      success: true,
      categories: reorderedList,
    });

    // Send PATCH to MongoDB
    reorderCategoriesMutation.mutate(
      reorderedList.map((item) => ({
        id: (item._id || item.id) as string,
        order: item.order,
      }))
    );

    setDraggedCategoryIndex(null);
    setDragOverCategoryIndex(null);
  };

  const handleCategoryDragEnd = () => {
    setDraggedCategoryIndex(null);
    setDragOverCategoryIndex(null);
  };

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
    setProdCategory(categories[0]?.name || 'Organizers');
    setProdTaglineBn('');
    setProdDescriptionBn('');
    setProdBasePrice(499);
    setProdOriginalPrice(800);
    setProdIsFeatured(true);
    setProdIsActive(true);
    setProdRating(5.0);
    setProdReviewCount(0);
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
    setProdFeaturesBn([
      { icon: 'Layers', title: 'মাল্টি-কম্পার্টমেন্ট', description: 'সুসংগঠিত পার্টিশন ও স্পেস' },
      { icon: 'ShieldCheck', title: 'প্রিমিয়াম কোয়ালিটি', description: 'টেকসই ও মার্জিত ফিনিশিং' },
      { icon: 'Gift', title: 'উপহারের সেরা চয়েস', description: 'প্রিয়জনকে উপহার দেওয়ার জন্য পারফেক্ট' },
    ]);
    setProdSpecificationsBn([
      { key: 'উপাদান', value: 'প্রিমিয়াম সিন্থেটিক লেদার ও সফট ভেলভেট' },
      { key: 'সাইজ', value: 'কম্প্যাক্ট ট্রাভেল ফ্রেন্ডলি' },
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
    setProdCategory(prod.category || (categories[0]?.name ?? ''));
    setProdTaglineBn(prod.taglineBn || '');
    setProdDescriptionBn(prod.descriptionBn || '');
    setProdBasePrice(prod.basePrice || 499);
    setProdOriginalPrice(prod.originalPrice || 800);
    setProdIsFeatured(prod.isFeatured !== false);
    setProdIsActive(prod.isActive !== false);
    setProdRating(prod.rating || 5.0);
    setProdReviewCount(prod.reviewCount || 0);
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
    setProdFeaturesBn(
      prod.featuresBn?.length > 0
        ? prod.featuresBn
        : [
            { icon: 'Layers', title: 'মাল্টি-কম্পার্টমেন্ট', description: 'সুসংগঠিত পার্টিশন ও স্পেস' },
            { icon: 'ShieldCheck', title: 'প্রিমিয়াম কোয়ালিটি', description: 'টেকসই ও মার্জিত ফিনিশিং' },
          ]
    );
    setProdSpecificationsBn(
      prod.specificationsBn?.length > 0
        ? prod.specificationsBn
        : [
            { key: 'উপাদান', value: 'প্রিমিয়াম কোয়ালিটি' },
            { key: 'সাইজ', value: 'স্ট্যান্ডার্ড' },
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
      rating: prodRating || 5.0,
      reviewCount: prodReviewCount || 0,
      basePrice: Number(prodBasePrice) || 499,
      originalPrice: Number(prodOriginalPrice) || 800,
      images: prodImages.length > 0 ? prodImages : ['/images/products/hello-kitty-pair.png'],
      variants: prodVariants,
      combos: prodCombos,
      featuresBn: prodFeaturesBn,
      specificationsBn: prodSpecificationsBn,
      isFeatured: prodIsFeatured,
      isActive: prodIsActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveProductMutation.mutate(fullProduct);
  };

  // Handle Add Category Form (Auto-calculated sequence order)
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setCatError('');
    if (!newCatName.trim()) {
      setCatError('ক্যাটাগরির নাম দিন।');
      return;
    }
    const nextOrder =
      categories.length > 0 ? Math.max(...categories.map((c) => c.order || 0), 0) + 1 : 1;

    addCategoryMutation.mutate({
      name: newCatName.trim(),
      order: nextOrder,
    });
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
      {/* Sleek Admin Navbar with Profile Dropdown */}
      <header className="bg-slate-950/90 border-b border-slate-800 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-rose-500/20">
                স
              </div>
              <div>
                <span className="font-extrabold text-white text-base">সুবিন্যাস</span>
                <span className="text-xs text-rose-400 ml-1.5 font-semibold">Admin Panel</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Refresh Button */}
            <button
              onClick={() => {
                refetchOrders();
                refetchReviews();
                refetchProducts();
                refetchCategories();
              }}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700 cursor-pointer transition-colors"
              title="তথ্য রিফ্রেশ করুন"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Admin Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 py-1.5 px-3 rounded-full border border-slate-700 transition-all cursor-pointer shadow-xs"
              >
                {user?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar}
                    alt={user.name || 'Admin'}
                    className="w-5 h-5 rounded-full object-cover border border-rose-500/50"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {user?.name ? user.name.slice(0, 1).toUpperCase() : 'A'}
                  </div>
                )}
                <span className="max-w-[100px] truncate hidden sm:inline">{user?.name || 'Admin'}</span>
                <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-1.5 py-0.2 rounded border border-rose-500/30">
                  Admin
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-950 rounded-2xl shadow-2xl border border-slate-800 py-2 text-xs text-slate-200 z-50 animate-in fade-in duration-150">
                  {/* Admin Info Header */}
                  <div className="px-4 py-2.5 border-b border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-white text-sm truncate">{user?.name || 'Store Admin'}</p>
                      <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        Admin
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono truncate">{user?.email || 'admin@subinyas.shop'}</p>
                  </div>

                  {/* Navigation Links inside Dropdown */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        switchTab('orders');
                        setIsProfileDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-900 transition-colors text-left cursor-pointer ${
                        activeTab === 'orders' ? 'text-rose-400 font-bold bg-slate-900/50' : 'text-slate-300'
                      }`}
                    >
                      <Package className="w-4 h-4 text-rose-400" />
                      <span>অর্ডার ম্যানেজমেন্ট ({orders.length})</span>
                    </button>

                    <button
                      onClick={() => {
                        switchTab('products');
                        setIsProfileDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-900 transition-colors text-left cursor-pointer ${
                        activeTab === 'products' ? 'text-rose-400 font-bold bg-slate-900/50' : 'text-slate-300'
                      }`}
                    >
                      <Layers className="w-4 h-4 text-teal-400" />
                      <span>প্রোডাক্ট ও স্টক কন্ট্রোল ({products.length})</span>
                    </button>

                    <button
                      onClick={() => {
                        switchTab('categories');
                        setIsProfileDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-900 transition-colors text-left cursor-pointer ${
                        activeTab === 'categories' ? 'text-rose-400 font-bold bg-slate-900/50' : 'text-slate-300'
                      }`}
                    >
                      <Folder className="w-4 h-4 text-amber-400" />
                      <span>ক্যাটাগরি সেটিংস ({categories.length})</span>
                    </button>

                    <button
                      onClick={() => {
                        switchTab('reviews');
                        setIsProfileDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-900 transition-colors text-left cursor-pointer ${
                        activeTab === 'reviews' ? 'text-rose-400 font-bold bg-slate-900/50' : 'text-slate-300'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 text-purple-400" />
                      <span>রিভিউ মডারেশন ({reviews.length})</span>
                      {pendingReviews > 0 && (
                        <span className="ml-auto bg-amber-400 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                          {pendingReviews}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        switchTab('settings');
                        setIsProfileDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-900 transition-colors text-left cursor-pointer ${
                        activeTab === 'settings' ? 'text-rose-400 font-bold bg-slate-900/50' : 'text-slate-300'
                      }`}
                    >
                      <SettingsIcon className="w-4 h-4 text-blue-400" />
                      <span>স্টোর ও মেটা পিক্সেল কনফিগ</span>
                    </button>

                    {/* Website view inside dropdown */}
                    <Link
                      href="/"
                      target="_blank"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-900 text-emerald-400 font-medium transition-colors border-t border-slate-800/80"
                    >
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        <span>ওয়েবসাইট দেখুন</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">↗</span>
                    </Link>

                    <button
                      onClick={() => logout()}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-900 text-rose-400 font-semibold border-t border-slate-800 cursor-pointer text-left transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>লগআউট (Log Out)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
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
            <span className="text-[11px] text-slate-400 mt-1 block">ক্যাটাগরি: {categories.length} টি</span>
          </div>
        </div>

        {/* Tab Navigation (Synchronized with ?tab= query parameter) */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => switchTab('orders')}
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
            onClick={() => switchTab('products')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>প্রোডাক্ট ও স্টক কন্ট্রোল ({products.length})</span>
          </button>

          <button
            onClick={() => switchTab('categories')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>ক্যাটাগরি সেটিংস ({categories.length})</span>
          </button>

          <button
            onClick={() => switchTab('reviews')}
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
            onClick={() => switchTab('settings')}
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
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700">
              <div>
                <h3 className="text-base font-bold text-white">Products Management</h3>
                <p className="text-xs text-slate-400">Manage products, dynamic categories, pricing, variants, and live inventory in MongoDB</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => switchTab('categories')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
                >
                  <FolderPlus className="w-4 h-4 text-amber-400" />
                  <span>ক্যাটাগরি ম্যানেজমেন্ট ({categories.length})</span>
                </button>

                <button
                  onClick={handleOpenAddProduct}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>
            </div>

            {isProductsLoading ? (
              <div className="p-12 text-center text-slate-400">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-slate-800/40 rounded-2xl border border-slate-700 space-y-3">
                <Layers className="w-12 h-12 mx-auto text-slate-500 stroke-1" />
                <p>No products found in MongoDB database.</p>
                <button
                  onClick={handleOpenAddProduct}
                  className="bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
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
                            {!prod.isActive && (
                              <span className="bg-slate-700 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded">
                                Draft / Hidden
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

        {/* TAB 3: CATEGORY SETTINGS (LEFT FORM, RIGHT LIST WITH RE-ORDER) */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT SIDE: Add Category Form (5 cols) */}
            <div className="lg:col-span-5 bg-slate-800/60 p-6 rounded-2xl border border-slate-700 space-y-5 shadow-lg">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FolderPlus className="w-5 h-5 text-amber-400" />
                  <span>নতুন ক্যাটাগরি তৈরি করুন</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  ক্যাটাগরির নাম দিন (এটি স্বয়ংক্রিয়ভাবে তালিকার শেষে যুক্ত হবে)
                </p>
              </div>

              {catError && (
                <div className="bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs p-3.5 rounded-xl font-medium">
                  ⚠️ {catError}
                </div>
              )}

              {catSuccess && (
                <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs p-3.5 rounded-xl font-medium">
                  ✅ {catSuccess}
                </div>
              )}

              <form onSubmit={handleCreateCategory} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="text-slate-300 font-medium block mb-1.5">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="যেমন: Travel, Organizers, Jewelry Box..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={addCategoryMutation.isPending}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl shadow-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {addCategoryMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>ক্যাটাগরি ডাটাবেসে সেভ করুন</span>
                </button>
              </form>
            </div>

            {/* RIGHT SIDE: Categories List & Drag-and-Drop Reordering (7 cols) */}
            <div className="lg:col-span-7 bg-slate-800/60 rounded-2xl border border-slate-700 overflow-hidden shadow-lg space-y-4">
              <div className="p-5 border-b border-slate-700 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Folder className="w-4 h-4 text-amber-400" />
                    <span>সকল ক্যাটাগরি তালিকা ({categories.length} টি)</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    যেকোনো ক্যাটাগরি মাউস দিয়ে ড্র্যাগ (Drag & Drop) করে উপরে বা নিচে সাজিয়ে নিন
                  </p>
                </div>
              </div>

              {isCategoriesLoading ? (
                <div className="p-12 text-center text-slate-400 text-xs">ক্যাটাগরি লোড হচ্ছে...</div>
              ) : categories.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs space-y-2">
                  <Folder className="w-10 h-10 mx-auto text-slate-600 stroke-1" />
                  <p>ডাটাবেসে কোনো ক্যাটাগরি নেই।</p>
                  <p className="text-[11px] text-slate-500">বামপাশের ফর্মটি ব্যবহার করে প্রথম ক্যাটাগরি যুক্ত করুন।</p>
                </div>
              ) : (
                <div className="p-4 space-y-2.5 max-h-[600px] overflow-y-auto">
                  {categories.map((cat, idx) => (
                    <div
                      key={cat._id || cat.id || cat.name || idx}
                      draggable
                      onDragStart={(e) => handleCategoryDragStart(e, idx)}
                      onDragOver={(e) => handleCategoryDragOver(e, idx)}
                      onDrop={(e) => handleCategoryDrop(e, idx)}
                      onDragEnd={handleCategoryDragEnd}
                      className={`p-3.5 bg-slate-950/60 rounded-xl border transition-all cursor-grab active:cursor-grabbing flex items-center justify-between gap-3 select-none ${
                        draggedCategoryIndex === idx
                          ? 'opacity-30 border-amber-500/60 bg-amber-500/10 scale-[0.98]'
                          : dragOverCategoryIndex === idx
                          ? 'border-amber-400 bg-amber-500/20 shadow-md ring-2 ring-amber-400/30'
                          : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      {/* Left: Drag Handle, Order Badge & Name */}
                      <div className="flex items-center gap-3">
                        <div
                          className="text-slate-500 hover:text-amber-400 cursor-grab active:cursor-grabbing p-1 rounded transition-colors shrink-0"
                          title="ড্র্যাগ করে ক্রম পরিবর্তন করুন (Drag to Reorder)"
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>

                        <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                          #{cat.order || idx + 1}
                        </div>

                        <div>
                          <span className="font-bold text-white text-sm">{cat.name}</span>
                        </div>
                      </div>

                      {/* Right: Individual Delete button */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">Drag to move</span>
                        <button
                          onClick={() => {
                            if (confirm(`"${cat.name}" ক্যাটাগরি মুছে ফেলতে চান?`)) {
                              deleteCategoryMutation.mutate(cat._id || (cat.id as string) || cat.name);
                            }
                          }}
                          className="p-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="ক্যাটাগরি মুছুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: REVIEW MODERATION */}
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

        {/* TAB 5: SETTINGS */}
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

      {/* FULL-FEATURED ADD / EDIT PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-500" />
                <span>{editingProductSlug ? 'প্রোডাক্ট এডিট ও আপডেট করুন' : 'নতুন প্রোডাক্ট যুক্ত করুন (Add Product)'}</span>
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-medium">Category *</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsProductModalOpen(false);
                        switchTab('categories');
                      }}
                      className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                    >
                      + Manage
                    </button>
                  </div>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    {categories.length === 0 ? (
                      <option value="">কোনো ক্যাটাগরি নেই (প্রথমে ক্যাটাগরি তৈরি করুন)</option>
                    ) : (
                      categories.map((cat, i) => (
                        <option key={cat._id || cat.id || i} value={cat.name}>
                          {cat.name}
                        </option>
                      ))
                    )}
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

              {/* Status Toggles (isFeatured & isActive) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <label className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Featured Product (হোমপেজ স্লাইডার)</span>
                    </label>
                    <p className="text-[10px] text-slate-400">হোমপেজের হিরো স্লাইডার ও কালেকশনে প্রদর্শন করবে</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prodIsFeatured}
                    onChange={(e) => setProdIsFeatured(e.target.checked)}
                    className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
                  />
                </div>

                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <label className="font-bold text-white text-xs flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                      <span>Is Active (ওয়েবসাইটে সক্রিয় রাখুন)</span>
                    </label>
                    <p className="text-[10px] text-slate-400">আনচেক করলে প্রোডাক্টটি ড্রাফট থাকবে</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prodIsActive}
                    onChange={(e) => setProdIsActive(e.target.checked)}
                    className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>
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

              {/* Color Variants Builder */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-xs">কালার ভ্যারিয়েন্ট ও স্টক সংখ্যা (Color Variants)</h3>
                    <p className="text-[11px] text-slate-400">প্রতিটি কালারের নাম, রঙ এবং লাইভ স্টক সংখ্যা দিন</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newId = `var-${Date.now()}`;
                      setProdVariants((prev) => [
                        ...prev,
                        {
                          id: newId,
                          name: 'New Color',
                          nameBn: 'নতুন কালার',
                          color: 'Custom',
                          colorHex: '#3B82F6',
                          image: prodImages[0] || '/images/products/hello-kitty-pair.png',
                          inStock: true,
                          stockCount: 20,
                        },
                      ]);
                    }}
                    className="bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>➕ Add Color</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {prodVariants.map((v, idx) => (
                    <div
                      key={v.id || idx}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 items-center"
                    >
                      <div className="sm:col-span-5">
                        <label className="text-[10px] text-slate-400 block mb-0.5">কালারের নাম (বাংলা/ইংলিশ)</label>
                        <input
                          type="text"
                          required
                          value={v.nameBn}
                          onChange={(e) => {
                            const val = e.target.value;
                            const detectedHex = (name: string) => {
                              const lower = name.toLowerCase();
                              if (lower.includes('কালো') || lower.includes('black')) return '#1E293B';
                              if (lower.includes('সাদা') || lower.includes('white')) return '#F8FAFC';
                              if (lower.includes('পিঙ্ক') || lower.includes('pink') || lower.includes('গোলাপি')) return '#F472B6';
                              if (lower.includes('লাল') || lower.includes('red')) return '#EF4444';
                              if (lower.includes('নীল') || lower.includes('blue')) return '#3B82F6';
                              if (lower.includes('সবুজ') || lower.includes('green')) return '#10B981';
                              if (lower.includes('হলুদ') || lower.includes('yellow')) return '#EAB308';
                              if (lower.includes('বেগুনি') || lower.includes('purple')) return '#8B5CF6';
                              if (lower.includes('গোল্ড') || lower.includes('gold')) return '#D97706';
                              if (lower.includes('রোজ গোল্ড') || lower.includes('rose gold')) return '#B76E79';
                              if (lower.includes('বাদামি') || lower.includes('brown')) return '#78350F';
                              if (lower.includes('ধূসর') || lower.includes('gray') || lower.includes('grey')) return '#64748B';
                              return v.colorHex;
                            };
                            setProdVariants((prev) =>
                              prev.map((item, i) =>
                                i === idx ? { ...item, nameBn: val, name: val, colorHex: detectedHex(val) } : item
                              )
                            );
                          }}
                          placeholder="যেমন: কালো (Black), সাদা (White)"
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-slate-400 block mb-0.5">রঙের কোড (Color)</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={v.colorHex || '#F472B6'}
                            onChange={(e) => {
                              const hex = e.target.value;
                              setProdVariants((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, colorHex: hex } : item))
                              );
                            }}
                            className="w-8 h-8 rounded-lg border border-slate-700 bg-transparent cursor-pointer p-0.5 shrink-0"
                          />
                          <input
                            type="text"
                            value={v.colorHex}
                            onChange={(e) => {
                              const hex = e.target.value;
                              setProdVariants((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, colorHex: hex } : item))
                              );
                            }}
                            className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-[11px] font-mono"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-400 block mb-0.5">স্টক সংখ্যা</label>
                        <input
                          type="number"
                          min="0"
                          value={v.stockCount}
                          onChange={(e) => {
                            const cnt = Number(e.target.value);
                            setProdVariants((prev) =>
                              prev.map((item, i) =>
                                i === idx ? { ...item, stockCount: cnt, inStock: cnt > 0 } : item
                              )
                            );
                          }}
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2 flex items-center justify-between gap-2 pt-3 sm:pt-0">
                        <label className="flex items-center gap-1 text-[11px] cursor-pointer text-slate-300">
                          <input
                            type="checkbox"
                            checked={v.inStock}
                            onChange={(e) => {
                              const chk = e.target.checked;
                              setProdVariants((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, inStock: chk } : item))
                              );
                            }}
                            className="accent-rose-500 rounded"
                          />
                          <span>{v.inStock ? 'In Stock' : 'Out'}</span>
                        </label>

                        {prodVariants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setProdVariants((prev) => prev.filter((_, i) => i !== idx))}
                            className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Combo Deals Builder */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-xs">কম্বো ও অফার প্যাকেজ (Combo Deals)</h3>
                    <p className="text-[11px] text-slate-400">১টি বা ২টি প্যাকের স্পেশাল ডিসকাউন্ট মূল্য সেট করুন</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const count = prodCombos.length + 1;
                      setProdCombos((prev) => [
                        ...prev,
                        {
                          id: `combo-${count}`,
                          title: `${count} Pieces Combo`,
                          titleBn: `${count}টি বক্স স্পেশাল প্যাক`,
                          subtitleBn: `${count}টি বক্স • মেগা সেভার অফার`,
                          quantity: count,
                          price: prodBasePrice * count - 100,
                          originalPrice: prodOriginalPrice * count,
                          savingsBn: `Save ৳${prodOriginalPrice * count - (prodBasePrice * count - 100)}`,
                          badge: 'Special Offer',
                        },
                      ]);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>➕ Add Combo Deal</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {prodCombos.map((c, idx) => (
                    <div
                      key={c.id || idx}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 items-center text-xs"
                    >
                      <div className="sm:col-span-4">
                        <label className="text-[10px] text-slate-400 block">কম্বো টাইটেল (বাংলা)</label>
                        <input
                          type="text"
                          value={c.titleBn}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProdCombos((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, titleBn: val } : item))
                            );
                          }}
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-400 block">পরিমাণ (Qty)</label>
                        <input
                          type="number"
                          value={c.quantity}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setProdCombos((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, quantity: val } : item))
                            );
                          }}
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-slate-400 block">অফার প্রাইস (৳)</label>
                        <input
                          type="number"
                          value={c.price}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setProdCombos((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, price: val } : item))
                            );
                          }}
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                        />
                      </div>

                      <div className="sm:col-span-3 flex items-center justify-between gap-1">
                        <div>
                          <label className="text-[10px] text-slate-400 block">ব্যাজ (ঐচ্ছিক)</label>
                          <input
                            type="text"
                            value={c.badge || ''}
                            placeholder="Best Deal"
                            onChange={(e) => {
                              const val = e.target.value;
                              setProdCombos((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, badge: val } : item))
                              );
                            }}
                            className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                          />
                        </div>

                        {prodCombos.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setProdCombos((prev) => prev.filter((_, i) => i !== idx))}
                            className="p-1 text-slate-500 hover:text-rose-400 mt-3"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Features Builder (featuresBn) */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-xs">প্রধান বৈশিষ্ট্যসমূহ (Features Bn)</h3>
                    <p className="text-[11px] text-slate-400">প্রোডাক্টের হাইলাইটস ও আকর্ষণীয় বৈশিষ্ট্য যোগ করুন</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProdFeaturesBn((prev) => [
                        ...prev,
                        { icon: 'Sparkles', title: 'নতুন বৈশিষ্ট্য', description: 'বিস্তারিত বিবরণ' },
                      ]);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>➕ Add Feature</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {prodFeaturesBn.map((feat, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 items-center text-xs"
                    >
                      <div className="sm:col-span-4">
                        <label className="text-[10px] text-slate-400 block">শিরোনাম (Title)</label>
                        <input
                          type="text"
                          value={feat.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProdFeaturesBn((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, title: val } : item))
                            );
                          }}
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                        />
                      </div>

                      <div className="sm:col-span-7">
                        <label className="text-[10px] text-slate-400 block">বিবরণ (Description)</label>
                        <input
                          type="text"
                          value={feat.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProdFeaturesBn((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, description: val } : item))
                            );
                          }}
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                        />
                      </div>

                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setProdFeaturesBn((prev) => prev.filter((_, i) => i !== idx))}
                          className="p-1 text-slate-500 hover:text-rose-400 mt-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specifications Builder (specificationsBn) */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-xs">স্পেসিফিকেশন (Specifications Bn)</h3>
                    <p className="text-[11px] text-slate-400">উপাদান, সাইজ, ওজন ইত্যাদি কি-ভ্যালু তথ্য</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProdSpecificationsBn((prev) => [...prev, { key: 'নতুন তথ্য', value: 'মান' }]);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>➕ Add Spec</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {prodSpecificationsBn.map((spec, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 items-center text-xs"
                    >
                      <div className="sm:col-span-5">
                        <label className="text-[10px] text-slate-400 block">কী (Key যেমন: উপাদান)</label>
                        <input
                          type="text"
                          value={spec.key}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProdSpecificationsBn((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, key: val } : item))
                            );
                          }}
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                        />
                      </div>

                      <div className="sm:col-span-6">
                        <label className="text-[10px] text-slate-400 block">ভ্যালু (Value যেমন: লেদার)</label>
                        <input
                          type="text"
                          value={spec.value}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProdSpecificationsBn((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, value: val } : item))
                            );
                          }}
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                        />
                      </div>

                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setProdSpecificationsBn((prev) => prev.filter((_, i) => i !== idx))}
                          className="p-1 text-slate-500 hover:text-rose-400 mt-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 text-slate-400 flex items-center justify-center text-sm">
          ড্যাশবোর্ড লোড হচ্ছে...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
