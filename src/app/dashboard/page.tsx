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
  ArrowUpRight,
  ShieldCheck,
  ShoppingBag,
  Store,
  DollarSign,
  Truck,
  AlertCircle,
  Eye,
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

  // Category Add State (English Only UI)
  const [newCatName, setNewCatName] = useState('');
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
  const [prodIsHeroSlider, setProdIsHeroSlider] = useState<boolean>(true);
  const [prodHeroOrder, setProdHeroOrder] = useState<number>(1);
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

  // Fetch categories from MongoDB
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

  // Settings form state
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
      setCatSuccess('Category created successfully!');
      setTimeout(() => setCatSuccess(''), 3000);
    },
    onError: (err: unknown) => {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'Failed to create category.';
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
      const res = await axios.delete(`/api/categories?id=${encodeURIComponent(catId)}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setCatSuccess('Category deleted successfully');
      setTimeout(() => setCatSuccess(''), 2500);
    },
    onError: (err: unknown) => {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'Failed to delete category.';
      setCatError(msg);
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

  // Hero Slider toggle mutation
  const toggleHeroSliderMutation = useMutation({
    mutationFn: async ({ slug, isHeroSlider }: { slug: string; isHeroSlider: boolean }) => {
      const res = await axios.post('/api/products', { toggleHeroSlider: true, slug, isHeroSlider });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Delete Product Mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (slug: string) => {
      const res = await axios.delete(`/api/products?slug=${encodeURIComponent(slug)}`);
      return res.data;
    },
    onSuccess: (_, deletedSlug) => {
      queryClient.setQueryData<Product[]>(['admin-products'], (prev) =>
        prev ? prev.filter((p) => p.slug !== deletedSlug) : []
      );
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: unknown) => {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'Failed to delete product.';
      alert(`Error: ${msg}`);
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
      setProductFormSuccess('Product successfully saved to MongoDB database!');
      setTimeout(() => {
        setProductFormSuccess('');
        setIsProductModalOpen(false);
      }, 1200);
    },
    onError: (err: unknown) => {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'Failed to save product.';
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
      setSettingsSuccess('Settings saved successfully!');
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
    setProdIsHeroSlider(true);
    setProdHeroOrder(1);
    setProdIsActive(true);
    setProdRating(5.0);
    setProdReviewCount(0);
    setProdImages(['/images/products/hello-kitty-pair.png']);
    setProdVariants([
      {
        id: 'var-1',
        name: 'Black',
        nameBn: 'Black',
        color: 'Black',
        colorHex: '#0F172A',
        image: '/images/products/hello-kitty-pair.png',
        inStock: true,
        stockCount: 50,
      },
      {
        id: 'var-2',
        name: 'Silver / White',
        nameBn: 'Silver / White',
        color: 'White',
        colorHex: '#F1F5F9',
        image: '/images/products/hello-kitty-open.png',
        inStock: true,
        stockCount: 30,
      },
    ]);
    setProdCombos([
      {
        id: 'combo-single',
        title: '1 Piece Single Pack',
        titleBn: '1 Piece Single Pack',
        subtitleBn: 'Standard Package',
        quantity: 1,
        price: 499,
        originalPrice: 800,
        savingsBn: 'Save ৳301',
      },
      {
        id: 'combo-duo',
        title: '2 Pieces Duo Pack',
        titleBn: '2 Pieces Duo Pack (Best Deal)',
        subtitleBn: 'Best Value Deal • Save More',
        quantity: 2,
        price: 899,
        originalPrice: 1600,
        badge: 'Best Deal 🔥',
        isPopular: true,
        savingsBn: 'Save ৳701',
      },
    ]);
    setProdFeaturesBn([
      { icon: 'ShieldCheck', title: '100% Genuine Quality', description: 'Durable, premium materials and long-lasting build' },
      { icon: 'Sparkles', title: 'Modern & Elegant Design', description: 'Sleek aesthetics perfect for daily lifestyle and convenience' },
      { icon: 'Truck', title: 'Fast Nationwide Delivery', description: 'Cash on delivery available all across Bangladesh' },
    ]);
    setProdSpecificationsBn([
      { key: 'Material / Build', value: 'Premium High-Grade Quality' },
      { key: 'Warranty', value: '6 Months Replacement Warranty' },
      { key: 'Condition', value: '100% Brand New & Authentic' },
      { key: 'Delivery', value: 'Cash On Delivery Nationwide' },
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
    setProdIsHeroSlider(prod.isHeroSlider !== false);
    setProdHeroOrder(prod.heroOrder || 1);
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
              nameBn: 'Default',
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
              titleBn: '1 Piece Single Pack',
              subtitleBn: 'Standard Package',
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
            { icon: 'ShieldCheck', title: '100% Genuine Quality', description: 'Durable, premium materials and long-lasting build' },
            { icon: 'Truck', title: 'Cash on Delivery', description: 'Fast delivery across Bangladesh' },
          ]
    );
    setProdSpecificationsBn(
      prod.specificationsBn?.length > 0
        ? prod.specificationsBn
        : [
            { key: 'Material / Quality', value: 'Premium Grade' },
            { key: 'Warranty', value: '6 Months Replacement Warranty' },
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
      setProductFormError('Failed to upload image.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle Save (Create or Update)
  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    setProductFormError('');

    if (!prodName.trim() || !prodNameBn.trim() || !prodSlug.trim()) {
      setProductFormError('Product Name (English), Name (Bangla), and Slug are required.');
      return;
    }

    const cleanSlug = prodSlug.toLowerCase().trim().replace(/[^a-z0-9-_]/g, '-');
    const parsedBasePrice = Number(prodBasePrice) || 499;
    const parsedOrigPrice = Number(prodOriginalPrice) || 800;

    const syncedCombos = prodCombos.map((c) => {
      if (c.quantity === 1 || c.id === 'combo-single') {
        return {
          ...c,
          price: parsedBasePrice,
          originalPrice: parsedOrigPrice,
          savingsBn: `Save ৳${Math.max(0, parsedOrigPrice - parsedBasePrice)}`,
        };
      }
      return c;
    });

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
      basePrice: parsedBasePrice,
      originalPrice: parsedOrigPrice,
      images: prodImages.length > 0 ? prodImages : ['/images/products/hello-kitty-pair.png'],
      variants: prodVariants,
      combos: syncedCombos,
      featuresBn: prodFeaturesBn,
      specificationsBn: prodSpecificationsBn,
      isFeatured: prodIsFeatured,
      isHeroSlider: prodIsHeroSlider,
      heroOrder: Number(prodHeroOrder) || 1,
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
      setCatError('Please enter a category name.');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Navbar with Profile Dropdown */}
      <header className="bg-slate-900/80 border-b border-slate-800/80 sticky top-0 z-30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white font-black text-base shadow-lg shadow-rose-500/25 group-hover:scale-105 transition-transform">
                S
              </div>
              <div>
                <span className="font-black text-white text-base tracking-tight">SUBINYAS</span>
                <span className="text-[11px] text-rose-400 ml-2 font-bold px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 uppercase tracking-wider">
                  Admin Console
                </span>
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
              className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-xl border border-slate-700/70 cursor-pointer transition-all hover:border-slate-600 shadow-xs"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Admin Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2.5 text-xs font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-800 py-1.5 pl-2 pr-3 rounded-full border border-slate-700/80 transition-all cursor-pointer shadow-xs hover:border-slate-600"
              >
                {user?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar}
                    alt={user.name || 'Admin'}
                    className="w-6 h-6 rounded-full object-cover border border-rose-500/60 shadow-xs"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center text-xs font-black">
                    {user?.name ? user.name.slice(0, 1).toUpperCase() : 'A'}
                  </div>
                )}
                <span className="max-w-[120px] truncate hidden sm:inline font-medium">{user?.name || 'Administrator'}</span>
                <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-rose-500/30">
                  Admin
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 py-2 text-xs text-slate-200 z-50 animate-in fade-in duration-150">
                  {/* Admin Info Header */}
                  <div className="px-4 py-3 border-b border-slate-800">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-white text-sm truncate">{user?.name || 'Store Admin'}</p>
                      <span className="bg-rose-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                        Admin
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">{user?.email || 'admin@subinyas.shop'}</p>
                  </div>

                  {/* Navigation Links inside Dropdown */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        switchTab('orders');
                        setIsProfileDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-800 transition-colors text-left cursor-pointer ${
                        activeTab === 'orders' ? 'text-rose-400 font-bold bg-slate-800/60' : 'text-slate-300'
                      }`}
                    >
                      <Package className="w-4 h-4 text-rose-400" />
                      <span>Orders Management ({orders.length})</span>
                    </button>

                    <button
                      onClick={() => {
                        switchTab('products');
                        setIsProfileDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-800 transition-colors text-left cursor-pointer ${
                        activeTab === 'products' ? 'text-rose-400 font-bold bg-slate-800/60' : 'text-slate-300'
                      }`}
                    >
                      <Layers className="w-4 h-4 text-teal-400" />
                      <span>Products & Stock ({products.length})</span>
                    </button>

                    <button
                      onClick={() => {
                        switchTab('categories');
                        setIsProfileDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-800 transition-colors text-left cursor-pointer ${
                        activeTab === 'categories' ? 'text-rose-400 font-bold bg-slate-800/60' : 'text-slate-300'
                      }`}
                    >
                      <Folder className="w-4 h-4 text-amber-400" />
                      <span>Categories ({categories.length})</span>
                    </button>

                    <button
                      onClick={() => {
                        switchTab('reviews');
                        setIsProfileDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-800 transition-colors text-left cursor-pointer ${
                        activeTab === 'reviews' ? 'text-rose-400 font-bold bg-slate-800/60' : 'text-slate-300'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 text-purple-400" />
                      <span>Reviews Moderation ({reviews.length})</span>
                      {pendingReviews > 0 && (
                        <span className="ml-auto bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                          {pendingReviews}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        switchTab('settings');
                        setIsProfileDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-800 transition-colors text-left cursor-pointer ${
                        activeTab === 'settings' ? 'text-rose-400 font-bold bg-slate-800/60' : 'text-slate-300'
                      }`}
                    >
                      <SettingsIcon className="w-4 h-4 text-blue-400" />
                      <span>Store & Meta Pixel Config</span>
                    </button>

                    {/* Website View */}
                    <Link
                      href="/"
                      target="_blank"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-800 text-emerald-400 font-medium transition-colors border-t border-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        <span>View Live Store</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">↗</span>
                    </Link>

                    <button
                      onClick={() => logout()}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-800 text-rose-400 font-semibold border-t border-slate-800 cursor-pointer text-left transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
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
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 shadow-md backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Total Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">৳{totalRevenue.toLocaleString()}</div>
            <span className="text-[11px] text-emerald-400 mt-1 block font-medium">Cash On Delivery</span>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 shadow-md backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Total Orders</span>
              <Package className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">{orders.length}</div>
            <span className="text-[11px] text-slate-400 mt-1 block font-medium">All Customer Orders</span>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 shadow-md backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Pending Orders</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400">{pendingOrders}</div>
            <span className="text-[11px] text-slate-400 mt-1 block font-medium">Pending Reviews: {pendingReviews}</span>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 shadow-md backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Active Products</span>
              <Layers className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-teal-400">{products.length}</div>
            <span className="text-[11px] text-slate-400 mt-1 block font-medium">Categories: {categories.length}</span>
          </div>
        </div>

        {/* Tab Navigation (Synchronized with ?tab= query parameter) */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => switchTab('orders')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 ring-1 ring-rose-500'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:bg-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => switchTab('products')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 ring-1 ring-rose-500'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Products & Stock ({products.length})</span>
          </button>

          <button
            onClick={() => switchTab('categories')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 ring-1 ring-rose-500'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:bg-slate-800'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            onClick={() => switchTab('reviews')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 ring-1 ring-rose-500'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Review Moderation ({reviews.length})</span>
            {pendingReviews > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {pendingReviews} new
              </span>
            )}
          </button>

          <button
            onClick={() => switchTab('settings')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 ring-1 ring-rose-500'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:bg-slate-800'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Store & Meta Pixel</span>
          </button>
        </div>

        {/* TAB 1: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by Order ID, Phone, or Customer Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto">
                {['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      statusFilter === st
                        ? 'bg-slate-100 text-slate-900'
                        : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <a
                href="/api/orders/export"
                download="subinyas_orders.csv"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shadow-md shadow-emerald-600/20"
              >
                <Download className="w-4 h-4" />
                <span>Courier CSV Export</span>
              </a>
            </div>

            {/* Orders Table */}
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              {isOrdersLoading ? (
                <div className="p-12 text-center text-slate-400 text-sm">Loading orders from database...</div>
              ) : orders.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm">No customer orders found matching criteria.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-3.5 px-4 font-bold">Order ID & Date</th>
                        <th className="py-3.5 px-4 font-bold">Customer Details</th>
                        <th className="py-3.5 px-4 font-bold">Product & Variant</th>
                        <th className="py-3.5 px-4 font-bold">Total Amount</th>
                        <th className="py-3.5 px-4 font-bold">Status</th>
                        <th className="py-3.5 px-4 text-right font-bold">Quick Contact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {orders.map((ord) => (
                        <tr key={ord.orderId} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-4 px-4 font-mono font-bold text-white">
                            {ord.orderId}
                            <span className="block text-[10px] font-normal text-slate-400 font-sans mt-0.5">
                              {new Date(ord.createdAt).toLocaleDateString('en-GB', {
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
                            <div className="text-[11px] text-slate-400 max-w-[200px] truncate mt-0.5" title={ord.address}>
                              📍 {ord.address}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-semibold text-rose-300">{ord.productNameBn}</div>
                            <div className="text-[11px] text-slate-300">{ord.comboTitleBn}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Colors: {ord.selectedVariants?.join(', ')}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-black text-white text-sm">৳{ord.totalAmount}</div>
                            <div className="text-[10px] text-slate-400">
                              {ord.deliveryArea === 'inside_dhaka' ? 'Inside Dhaka (৳70)' : 'Outside Dhaka (৳130)'}
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
                                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 transition-colors"
                                title="Call Customer"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                              <a
                                href={`https://wa.me/88${ord.phone}?text=${encodeURIComponent(
                                  `আসসালামু আলাইকুম ${ord.customerName}! সুবিন্যাস (subinyas.shop) থেকে আপনার অর্ডার ${ord.orderId} কনফার্মেশনের জন্য যোগাযোগ করছি।`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg transition-colors border border-emerald-500/20"
                                title="WhatsApp Customer"
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Products & Inventory Control</h3>
                <p className="text-xs text-slate-400">Manage all products, pricing, stock levels, variants, and featured status in MongoDB</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => switchTab('categories')}
                  className="bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
                >
                  <FolderPlus className="w-4 h-4 text-amber-400" />
                  <span>Manage Categories ({categories.length})</span>
                </button>

                <button
                  onClick={handleOpenAddProduct}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-rose-600/25 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>
            </div>

            {isProductsLoading ? (
              <div className="p-12 text-center text-slate-400">Loading products from MongoDB...</div>
            ) : products.length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
                <Layers className="w-12 h-12 mx-auto text-slate-600 stroke-1" />
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
                  <div key={prod.slug} className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                          <Image src={prod.images[0] || '/images/products/hello-kitty-pair.png'} alt={prod.name} fill className="object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-base">{prod.name}</h3>
                            <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700">
                              {prod.category}
                            </span>
                            {prod.isFeatured && (
                              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                <span>Featured</span>
                              </span>
                            )}
                            {!prod.isActive && (
                              <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700">
                                Draft / Hidden
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 font-mono">Slug: /products/{prod.slug}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Quick Hero Slider Switch */}
                        <button
                          onClick={() =>
                            toggleHeroSliderMutation.mutate({
                              slug: prod.slug,
                              isHeroSlider: !prod.isHeroSlider,
                            })
                          }
                          className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                            prod.isHeroSlider
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs ring-1 ring-amber-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                          }`}
                          title="Click to toggle Homepage Hero Slider banner"
                        >
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>{prod.isHeroSlider ? `In Hero Slider (#${prod.heroOrder || 1})` : '+ Add to Hero'}</span>
                        </button>

                        <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
                          Base: ৳{prod.basePrice} (Orig: ৳{prod.originalPrice})
                        </span>

                        <button
                          onClick={() => handleOpenEditProduct(prod)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <Link
                          href={`/products/${prod.slug}`}
                          target="_blank"
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors border border-slate-700"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Live</span>
                        </Link>

                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${prod.name}"?`)) {
                              deleteProductMutation.mutate(prod.slug);
                            }
                          }}
                          className="p-2 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition-colors cursor-pointer border border-rose-500/20"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Variants and Stock */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                        Color Variants & Live Stock Inventory
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {prod.variants?.map((v) => (
                          <div key={v.id} className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className="w-4 h-4 rounded-full border border-slate-600 shrink-0"
                                  style={{ backgroundColor: v.colorHex }}
                                />
                                <span className="font-bold text-white text-xs truncate">{v.name}</span>
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

        {/* TAB 3: CATEGORY SETTINGS (LEFT FORM, RIGHT LIST WITH DRAG & DROP) */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT SIDE: Add Category Form (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-5 shadow-xl">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FolderPlus className="w-5 h-5 text-amber-400" />
                  <span>Create New Category</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enter the category name. It will automatically be placed at the end of the order sequence.
                </p>
              </div>

              {catError && (
                <div className="bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs p-3.5 rounded-xl font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{catError}</span>
                </div>
              )}

              {catSuccess && (
                <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs p-3.5 rounded-xl font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{catSuccess}</span>
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
                    placeholder="e.g. Travel, Organizers, Jewelry Box, Pouches..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={addCategoryMutation.isPending}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl shadow-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-amber-600/20"
                >
                  {addCategoryMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>Save Category</span>
                </button>
              </form>
            </div>

            {/* RIGHT SIDE: Categories List & Drag-and-Drop Reordering (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-xl space-y-4">
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Folder className="w-4 h-4 text-amber-400" />
                    <span>Category List ({categories.length})</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Drag and drop any category item up or down to reorder sequence
                  </p>
                </div>
              </div>

              {isCategoriesLoading ? (
                <div className="p-12 text-center text-slate-400 text-xs">Loading categories...</div>
              ) : categories.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs space-y-2">
                  <Folder className="w-10 h-10 mx-auto text-slate-600 stroke-1" />
                  <p>No categories in database.</p>
                  <p className="text-[11px] text-slate-500">Use the form on the left to add your first category.</p>
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
                          title="Drag to Reorder"
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
                            if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
                              deleteCategoryMutation.mutate(cat._id || (cat.id as string) || cat.name);
                            }
                          }}
                          className="p-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition-colors cursor-pointer border border-rose-500/20"
                          title="Delete Category"
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
            <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Filter Status:</span>
                {['All', 'Pending', 'Approved', 'Declined'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setReviewStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      reviewStatusFilter === st
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <span className="text-xs text-slate-400">
                Total Reviews: <strong className="text-white">{reviews.length}</strong>
              </span>
            </div>

            {isReviewsLoading ? (
              <div className="p-12 text-center text-slate-400 text-sm">Loading reviews from MongoDB...</div>
            ) : reviews.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm bg-slate-900/40 rounded-2xl border border-slate-800">
                No customer reviews found matching criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between"
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
                            Product Slug: <strong className="text-slate-300">{rev.productSlug}</strong> •{' '}
                            {new Date(rev.createdAt).toLocaleDateString('en-GB')}
                          </span>
                        </div>

                        <div className="flex text-amber-400">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                        "{rev.comment}"
                      </p>

                      {/* Photo/video thumbnails */}
                      {rev.mediaUrls && rev.mediaUrls.length > 0 && (
                        <div className="flex gap-2 pt-1">
                          {rev.mediaUrls.map((url, idx) => (
                            <div
                              key={idx}
                              className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-800 bg-slate-950"
                            >
                              <Image src={url} alt="Review media" fill className="object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                      {rev.status !== 'Approved' && (
                        <button
                          onClick={() => updateReviewStatusMutation.mutate({ reviewId: rev.id, status: 'Approved' })}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve Review</span>
                        </button>
                      )}

                      {rev.status !== 'Declined' && (
                        <button
                          onClick={() => updateReviewStatusMutation.mutate({ reviewId: rev.id, status: 'Declined' })}
                          className="bg-amber-600/30 hover:bg-amber-600 text-amber-300 hover:text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer border border-amber-500/30"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      )}

                      <button
                        onClick={() => deleteReviewMutation.mutate(rev.id)}
                        className="bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer border border-rose-500/20"
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
          <div className="max-w-2xl bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-rose-400" />
              <span>Store Configuration & Meta Pixel Integration</span>
            </h3>

            {settingsSuccess && (
              <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs p-3.5 rounded-xl font-medium">
                {settingsSuccess}
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Meta Pixel ID (Facebook Ads Tracking)</label>
                <input
                  type="text"
                  value={metaPixelId}
                  onChange={(e) => setMetaPixelId(e.target.value)}
                  placeholder="e.g. 1234567890123456"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Official WhatsApp Support Number (with Country Code)</label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="8801617492486"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Inside Dhaka Delivery Fee (৳)</label>
                  <input
                    type="number"
                    value={deliveryInside}
                    onChange={(e) => setDeliveryInside(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Outside Dhaka Delivery Fee (৳)</label>
                  <input
                    type="number"
                    value={deliveryOutside}
                    onChange={(e) => setDeliveryOutside(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saveSettingsMutation.isPending}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl shadow-lg transition-colors cursor-pointer shadow-rose-600/25"
              >
                {saveSettingsMutation.isPending ? 'Saving Settings...' : 'Save Store Configuration'}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* FULL-FEATURED ADD / EDIT PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-500" />
                <span>{editingProductSlug ? 'Edit Product Details' : 'Add New Product (MongoDB)'}</span>
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
                  <label className="block text-slate-300 font-medium mb-1">Product Title (English) *</label>
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
                    placeholder="e.g. Velvet Cosmetic Travel Organizer Pouch"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Product Title (Bangla) *</label>
                  <input
                    type="text"
                    required
                    value={prodNameBn}
                    onChange={(e) => setProdNameBn(e.target.value)}
                    placeholder="যেমন: প্রিমিয়াম ভেলভেট ট্রাভেল মেকআপ ব্যাগ"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Slug, Category, Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={prodSlug}
                    onChange={(e) => setProdSlug(e.target.value)}
                    placeholder="velvet-pouch"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-rose-300 focus:outline-none focus:border-rose-500 font-mono text-xs font-semibold"
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
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    {categories.length === 0 ? (
                      <option value="">No categories (Create one first)</option>
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
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Original / Scratch Price (৳)</label>
                  <input
                    type="number"
                    value={prodOriginalPrice}
                    onChange={(e) => setProdOriginalPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Status Toggles (isFeatured, isHeroSlider & isActive) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <label className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-rose-400" />
                      <span>Featured Product</span>
                    </label>
                    <p className="text-[10px] text-slate-400">Featured badge & showcase</p>
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
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Hero Slider</span>
                    </label>
                    <p className="text-[10px] text-slate-400">Top homepage auto-slider</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {prodIsHeroSlider && (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-mono">#</span>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={prodHeroOrder}
                          onChange={(e) => setProdHeroOrder(Number(e.target.value))}
                          className="w-10 px-1.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-amber-300 text-xs font-mono font-bold text-center"
                          title="Slide display sequence"
                        />
                      </div>
                    )}
                    <input
                      type="checkbox"
                      checked={prodIsHeroSlider}
                      onChange={(e) => setProdIsHeroSlider(e.target.checked)}
                      className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <label className="font-bold text-white text-xs flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                      <span>Is Active</span>
                    </label>
                    <p className="text-[10px] text-slate-400">Publish live on storefront</p>
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
                <label className="block text-slate-300 font-medium mb-1">Tagline (Bangla)</label>
                <input
                  type="text"
                  value={prodTaglineBn}
                  onChange={(e) => setProdTaglineBn(e.target.value)}
                  placeholder="যেমন: আপনার প্রসাধনী ও জুয়েলারি সুরক্ষিত ও পরিপাটি রাখার জন্য"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Detailed Description (Bangla)</label>
                <textarea
                  rows={2}
                  value={prodDescriptionBn}
                  onChange={(e) => setProdDescriptionBn(e.target.value)}
                  placeholder="প্রোডাক্টের বিবরণ লিখুন..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              {/* Color Variants Builder */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-xs">Color Variants & Inventory Stock</h3>
                    <p className="text-[11px] text-slate-400">Add color variants, hex colors, and individual stock counts</p>
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
                    className="bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer border border-rose-500/20"
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
                        <label className="text-[10px] text-slate-400 block mb-0.5">Color Name (Bangla / English)</label>
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
                          placeholder="e.g. Black (কালো), White (সাদা), Pink..."
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-slate-400 block mb-0.5">Hex Color</label>
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
                            className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-[11px] font-mono"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-400 block mb-0.5">Stock Count</label>
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
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs font-mono font-bold"
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
                            title="Delete Variant"
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
                    <h3 className="font-bold text-white text-xs">Combo Packages & Quantity Deals</h3>
                    <p className="text-[11px] text-slate-400">Setup 1-Pack, 2-Pack bestie deals with discounted pricing</p>
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
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer border border-slate-700"
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
                        <label className="text-[10px] text-slate-400 block">Combo Title (Bangla)</label>
                        <input
                          type="text"
                          value={c.titleBn}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProdCombos((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, titleBn: val } : item))
                            );
                          }}
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-400 block">Quantity (Qty)</label>
                        <input
                          type="number"
                          value={c.quantity}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setProdCombos((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, quantity: val } : item))
                            );
                          }}
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-slate-400 block">Deal Price (৳)</label>
                        <input
                          type="number"
                          value={c.price}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setProdCombos((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, price: val } : item))
                            );
                          }}
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs"
                        />
                      </div>

                      <div className="sm:col-span-3 flex items-center justify-between gap-1">
                        <div>
                          <label className="text-[10px] text-slate-400 block">Badge (Optional)</label>
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
                            className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs"
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
                    <h3 className="font-bold text-white text-xs">Key Highlights (featuresBn)</h3>
                    <p className="text-[11px] text-slate-400">Add highlight bullet cards for the product page</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProdFeaturesBn((prev) => [
                        ...prev,
                        { icon: 'Sparkles', title: 'নতুন বৈশিষ্ট্য', description: 'বিস্তারিত বিবরণ' },
                      ]);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer border border-slate-700"
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
                        <label className="text-[10px] text-slate-400 block">Title (Bangla)</label>
                        <input
                          type="text"
                          value={feat.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProdFeaturesBn((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, title: val } : item))
                            );
                          }}
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs"
                        />
                      </div>

                      <div className="sm:col-span-7">
                        <label className="text-[10px] text-slate-400 block">Description (Bangla)</label>
                        <input
                          type="text"
                          value={feat.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProdFeaturesBn((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, description: val } : item))
                            );
                          }}
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs"
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
                    <h3 className="font-bold text-white text-xs">Technical Specifications (specificationsBn)</h3>
                    <p className="text-[11px] text-slate-400">Material, size, weight and specifications</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProdSpecificationsBn((prev) => [...prev, { key: 'উপাদান', value: 'মান' }]);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer border border-slate-700"
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
                        <label className="text-[10px] text-slate-400 block">Key (e.g. উপাদান)</label>
                        <input
                          type="text"
                          value={spec.key}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProdSpecificationsBn((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, key: val } : item))
                            );
                          }}
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs"
                        />
                      </div>

                      <div className="sm:col-span-6">
                        <label className="text-[10px] text-slate-400 block">Value (e.g. লেদার)</label>
                        <input
                          type="text"
                          value={spec.value}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProdSpecificationsBn((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, value: val } : item))
                            );
                          }}
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs"
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
                <label className="block text-slate-300 font-medium mb-1.5">Product Images (Cloudinary CDN Upload)</label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-200 px-3.5 py-2 rounded-xl text-xs cursor-pointer">
                    {isUploadingImage ? <Loader2 className="w-4 h-4 animate-spin text-rose-500" /> : <Camera className="w-4 h-4 text-rose-400" />}
                    <span>{isUploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                    <input type="file" accept="image/*" multiple onChange={handleProductImageUpload} className="hidden" />
                  </label>

                  {prodImages.map((url, idx) => (
                    <div key={idx} className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
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
                  <span>{editingProductSlug ? 'Update Product' : 'Save Product to MongoDB'}</span>
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
        <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center text-sm font-sans">
          Loading Dashboard...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
