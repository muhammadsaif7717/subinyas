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
  ChevronUp,
  GripVertical,
  ArrowUpRight,
  ShieldCheck,
  ShoppingBag,
  Store,
  DollarSign,
  Truck,
  AlertCircle,
  Eye,
  ImageIcon,
} from 'lucide-react';
import { Order, OrderStatus, StoreSettings, Product, Review, ProductVariant, ComboOption } from '@/lib/types';
import { CategoryItem } from '@/app/api/categories/route';
import { useAuth } from '@/lib/auth-context';

type TabType = 'orders' | 'products' | 'banners' | 'categories' | 'reviews' | 'settings';

const NAV_ITEMS: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'products', label: 'Products & Stock', icon: ShoppingBag },
  { id: 'banners', label: 'Manage Banners', icon: Sparkles },
  { id: 'categories', label: 'Categories', icon: Folder },
  { id: 'reviews', label: 'Reviews', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

const TAB_TITLES: Record<TabType, string> = {
  orders: 'Order Management',
  products: 'Products & Inventory',
  banners: 'Hero Banner Manager',
  categories: 'Category Settings',
  reviews: 'Customer Reviews',
  settings: 'Store Configuration',
};

const STATUS_STYLES: Record<string, string> = {
  Pending: 'bg-[#D6A24E]/15 text-[#E4BC79] border-[#D6A24E]/30',
  Confirmed: 'bg-[#6C93C4]/15 text-[#8FB0D9] border-[#6C93C4]/30',
  Shipped: 'bg-[#9C7FC4]/15 text-[#BAA3DE] border-[#9C7FC4]/30',
  Delivered: 'bg-[#6FAE8C]/15 text-[#8FC7A9] border-[#6FAE8C]/30',
  Returned: 'bg-[#CB8A4E]/15 text-[#DDA876] border-[#CB8A4E]/30',
  Cancelled: 'bg-[#C1495A]/15 text-[#DD8A94] border-[#C1495A]/30',
};

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
    if (
      currentTabParam &&
      ['orders', 'products', 'banners', 'categories', 'reviews', 'settings'].includes(currentTabParam)
    ) {
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
  const [uploadingVariantIdx, setUploadingVariantIdx] = useState<number | null>(null);

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
        name: 'White',
        nameBn: 'White',
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
        title: '1 Piece',
        titleBn: '1 Piece',
        subtitleBn: 'Standard Package',
        quantity: 1,
        price: 499,
        originalPrice: 800,
        badge: 'Popular',
        isPopular: true,
        savingsBn: 'Save ৳301',
      },
      {
        id: 'combo-duo',
        title: '2 Pieces',
        titleBn: '2 Pieces',
        subtitleBn: 'Best Value Package',
        quantity: 2,
        price: 899,
        originalPrice: 1600,
        badge: '',
        isPopular: false,
        savingsBn: 'Save ৳701',
      },
    ]);
    setProdFeaturesBn([
      { icon: 'ShieldCheck', title: '100% Genuine Quality', description: 'Durable, premium materials and long-lasting build' },
      { icon: 'Truck', title: 'Cash on Delivery', description: 'Fast delivery across Bangladesh' },
    ]);
    setProdSpecificationsBn([
      { key: 'Material', value: 'Premium Grade' },
      { key: 'Warranty', value: '6 Months Replacement Warranty' },
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

  // Handle Main Showcase Images Upload
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

  // Handle Specific Variant Matching Image Upload
  const handleVariantImageUpload = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVariantIdx(idx);
    setProductFormError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success && res.data?.url) {
        const uploadedUrl = res.data.url;
        setProdVariants((prev) =>
          prev.map((item, i) => (i === idx ? { ...item, image: uploadedUrl } : item))
        );
        // Ensure image is also part of the general gallery
        setProdImages((prev) => (prev.includes(uploadedUrl) ? prev : [...prev, uploadedUrl]));
      }
    } catch {
      setProductFormError('Failed to upload variant image.');
    } finally {
      setUploadingVariantIdx(null);
    }
  };

  // Handle 16:9 Dedicated Hero Banner Upload with Strict 16:9 Aspect Ratio Validation
  const [uploadingBannerSlug, setUploadingBannerSlug] = useState<string | null>(null);

  const handleHeroBannerUpload = async (prod: Product, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const targetInput = e.target;

    // Step 1: Pre-validate Image Aspect Ratio (16:9 format)
    const validateAspectRatio = (): Promise<{ valid: boolean; width: number; height: number; ratio: number }> => {
      return new Promise((resolve) => {
        const img = new window.Image();
        const objectUrl = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
          const width = img.naturalWidth;
          const height = img.naturalHeight;
          const ratio = width / height;
          const targetRatio = 16 / 9; // ~1.7778
          // Allow reasonable tolerance (+/- 0.08) for minor rounding variations (e.g. 1920x1080, 1600x900, 1280x720)
          const isValidRatio = Math.abs(ratio - targetRatio) <= 0.08;
          resolve({ valid: isValidRatio, width, height, ratio });
        };
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          resolve({ valid: false, width: 0, height: 0, ratio: 0 });
        };
        img.src = objectUrl;
      });
    };

    const validation = await validateAspectRatio();
    if (!validation.valid) {
      alert(
        `⚠️ Invalid Image Aspect Ratio!\n\nদয়া করে ১৬:৯ (16:9) রেশিওর ব্যানার ইমেজ আপলোড করুন (যেমন: 1920x1080, 1600x900 বা 1280x720)।\n\nআপনার সিলেক্ট করা ইমেজের সাইজ: ${validation.width}x${validation.height} (Ratio: ${validation.ratio.toFixed(2)})`
      );
      if (targetInput) targetInput.value = '';
      return;
    }

    setUploadingBannerSlug(prod.slug);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success && res.data?.url) {
        const bannerUrl = res.data.url;
        saveProductMutation.mutate({
          ...prod,
          heroBannerImage: bannerUrl,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch {
      alert('Failed to upload 16:9 banner image.');
    } finally {
      setUploadingBannerSlug(null);
      if (targetInput) targetInput.value = '';
    }
  };

  // Handle Save (Create or Update)
  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    setProductFormError('');

    if (!prodName.trim() || !prodSlug.trim()) {
      setProductFormError('Product Title and Slug are required.');
      return;
    }

    const cleanSlug = prodSlug.toLowerCase().trim().replace(/[^a-z0-9-_]/g, '-');
    const parsedBasePrice = Number(prodBasePrice) || 499;
    const parsedOrigPrice = Number(prodOriginalPrice) || 800;
    const finalName = prodName.trim();

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

    const variantImages = prodVariants.map((v) => v.image).filter(Boolean) as string[];
    const combinedImages = Array.from(new Set([...prodImages, ...variantImages])).filter(Boolean);

    const fullProduct: Product = {
      id: editingProductSlug ? `prod-${editingProductSlug}` : `prod-${Date.now()}`,
      slug: cleanSlug,
      name: finalName,
      nameBn: prodNameBn.trim() || finalName,
      category: prodCategory.trim(),
      taglineBn: prodTaglineBn.trim() || finalName,
      descriptionBn: prodDescriptionBn.trim() || finalName,
      rating: prodRating || 5.0,
      reviewCount: prodReviewCount || 0,
      basePrice: parsedBasePrice,
      originalPrice: parsedOrigPrice,
      images: combinedImages.length > 0 ? combinedImages : ['/images/products/hello-kitty-pair.png'],
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

  // Shared style tokens
  const inputCls =
    'w-full px-3.5 py-2.5 bg-[#14111A] border border-[#332B3D] rounded-xl text-[#F3EFEC] placeholder-[#6E6278] focus:outline-none focus:border-[#C4587A] focus:ring-1 focus:ring-[#C4587A]/40 transition-colors';
  const labelCls = 'block text-[#B7ACC4] font-medium mb-1.5 text-xs';
  const cardCls = 'bg-[#1C1821] border border-[#2E2733] rounded-2xl';

  return (
    <div className="min-h-screen bg-[#14111A] text-[#F3EFEC] font-['Inter',sans-serif] selection:bg-[#C4587A] selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600;700;800&display=swap');
        .font-display { font-family: 'Fraunces', Georgia, serif; }
      `}</style>

      <div className="flex">
        {/* ================= SIDEBAR (desktop) ================= */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-[#2E2733] bg-[#17131C]">
          <div className="h-16 flex items-center gap-2.5 px-5 border-b border-[#2E2733]">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C4587A] to-[#8C4064] flex items-center justify-center text-white shadow-lg shadow-[#C4587A]/20 shrink-0">
              <Store className="w-4.5 h-4.5" strokeWidth={2.25} />
            </div>
            <div className="leading-tight">
              <div className="font-display italic text-[17px] text-white tracking-wide">Subinyas</div>
              <div className="text-[9.5px] text-[#9C8FA8] uppercase tracking-[0.18em] font-semibold">Admin Console</div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
            <p className="px-3 pb-2 text-[10px] uppercase tracking-[0.18em] text-[#6E6278] font-semibold">পরিচালনা</p>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const count =
                item.id === 'orders'
                  ? orders.length
                  : item.id === 'products'
                  ? products.length
                  : item.id === 'categories'
                  ? categories.length
                  : item.id === 'reviews'
                  ? reviews.length
                  : null;
              return (
                <button
                  key={item.id}
                  onClick={() => switchTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-[#C4587A]/12 text-white border border-[#C4587A]/30'
                      : 'text-[#B7ACC4] hover:text-white hover:bg-[#211C28] border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#E39BB4]' : 'text-[#8A7D97] group-hover:text-[#C4587A]'}`} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {count !== null && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                        isActive ? 'bg-[#C4587A] text-white' : 'bg-[#2A2430] text-[#9C8FA8]'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                  {item.id === 'reviews' && pendingReviews > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D6A24E]" title={`${pendingReviews} pending`} />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-3 border-t border-[#2E2733] space-y-1">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#8FC7A9] hover:bg-[#211C28] transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span className="flex-1">লাইভ স্টোর দেখুন</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
            </Link>
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#DD8A94] hover:bg-[#211C28] transition-colors cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>লগ আউট</span>
            </button>
          </div>
        </aside>

        {/* ================= MAIN COLUMN ================= */}
        <div className="flex-1 min-w-0">
          {/* Topbar */}
          <header className="sticky top-0 z-30 bg-[#14111A]/90 backdrop-blur-xl border-b border-[#2E2733]">
            <div className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 gap-3">
              <div className="flex items-center gap-2.5 lg:hidden">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C4587A] to-[#8C4064] flex items-center justify-center text-white shrink-0">
                  <Store className="w-4 h-4" />
                </div>
                <span className="font-display italic text-white text-base">Subinyas</span>
              </div>

              <div className="hidden lg:block">
                <h1 className="font-display text-lg text-white">{TAB_TITLES[activeTab]}</h1>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    refetchOrders();
                    refetchReviews();
                    refetchProducts();
                    refetchCategories();
                  }}
                  className="p-2.5 text-[#B7ACC4] hover:text-white bg-[#1C1821] hover:bg-[#241F2B] rounded-xl border border-[#2E2733] cursor-pointer transition-all"
                  title="Refresh Data"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                {/* Admin Profile Dropdown */}
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-2 text-xs font-semibold text-[#F3EFEC] bg-[#1C1821] hover:bg-[#241F2B] py-1.5 pl-1.5 pr-2.5 rounded-full border border-[#2E2733] transition-all cursor-pointer"
                  >
                    {user?.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.avatar}
                        alt={user.name || 'Admin'}
                        className="w-7 h-7 rounded-full object-cover border border-[#C4587A]/50"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#C4587A] to-[#8C4064] text-white flex items-center justify-center text-xs font-black">
                        {user?.name ? user.name.slice(0, 1).toUpperCase() : 'A'}
                      </div>
                    )}
                    <span className="max-w-[100px] truncate hidden sm:inline font-medium">{user?.name || 'Administrator'}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#8A7D97]" />
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-[#1C1821] rounded-2xl shadow-2xl border border-[#2E2733] py-2 text-xs text-[#D8CFE0] z-50">
                      <div className="px-4 py-3 border-b border-[#2E2733]">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-white text-sm truncate">{user?.name || 'Store Admin'}</p>
                          <span className="bg-[#C4587A] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                            Admin
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8A7D97] font-mono truncate mt-0.5">{user?.email || 'admin@subinyas.shop'}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/"
                          target="_blank"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center justify-between px-4 py-2.5 hover:bg-[#241F2B] text-[#8FC7A9] font-medium transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <ExternalLink className="w-4 h-4" />
                            <span>View Live Store</span>
                          </div>
                        </Link>
                        <button
                          onClick={() => logout()}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#241F2B] text-[#DD8A94] font-semibold border-t border-[#2E2733] cursor-pointer text-left transition-colors"
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

            {/* Mobile tab bar */}
            <div className="lg:hidden flex items-center gap-2 overflow-x-auto px-4 pb-3 pt-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => switchTab(item.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#C4587A] text-white shadow-lg shadow-[#C4587A]/25'
                        : 'bg-[#1C1821] text-[#9C8FA8] border border-[#2E2733]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </header>

          <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-7">
            {/* Metric Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`${cardCls} p-5 relative overflow-hidden`}>
                <div className="flex items-center justify-between text-[#9C8FA8] text-[10px] font-semibold uppercase tracking-wider mb-3">
                  <span>মোট বিক্রয়</span>
                  <div className="w-7 h-7 rounded-lg bg-[#6FAE8C]/15 flex items-center justify-center">
                    <DollarSign className="w-3.5 h-3.5 text-[#8FC7A9]" />
                  </div>
                </div>
                <div className="font-display text-2xl sm:text-3xl text-white">৳{totalRevenue.toLocaleString()}</div>
                <span className="text-[11px] text-[#8FC7A9] mt-1.5 block font-medium">Cash On Delivery</span>
              </div>

              <div className={`${cardCls} p-5 relative overflow-hidden`}>
                <div className="flex items-center justify-between text-[#9C8FA8] text-[10px] font-semibold uppercase tracking-wider mb-3">
                  <span>মোট অর্ডার</span>
                  <div className="w-7 h-7 rounded-lg bg-[#C4587A]/15 flex items-center justify-center">
                    <Package className="w-3.5 h-3.5 text-[#E39BB4]" />
                  </div>
                </div>
                <div className="font-display text-2xl sm:text-3xl text-white">{orders.length}</div>
                <span className="text-[11px] text-[#9C8FA8] mt-1.5 block font-medium">সকল কাস্টমার অর্ডার</span>
              </div>

              <div className={`${cardCls} p-5 relative overflow-hidden`}>
                <div className="flex items-center justify-between text-[#9C8FA8] text-[10px] font-semibold uppercase tracking-wider mb-3">
                  <span>পেন্ডিং অর্ডার</span>
                  <div className="w-7 h-7 rounded-lg bg-[#D6A24E]/15 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5 text-[#E4BC79]" />
                  </div>
                </div>
                <div className="font-display text-2xl sm:text-3xl text-[#E4BC79]">{pendingOrders}</div>
                <span className="text-[11px] text-[#9C8FA8] mt-1.5 block font-medium">রিভিউ পেন্ডিং: {pendingReviews}</span>
              </div>

              <div className={`${cardCls} p-5 relative overflow-hidden`}>
                <div className="flex items-center justify-between text-[#9C8FA8] text-[10px] font-semibold uppercase tracking-wider mb-3">
                  <span>সক্রিয় প্রোডাক্ট</span>
                  <div className="w-7 h-7 rounded-lg bg-[#6C93C4]/15 flex items-center justify-center">
                    <Layers className="w-3.5 h-3.5 text-[#8FB0D9]" />
                  </div>
                </div>
                <div className="font-display text-2xl sm:text-3xl text-[#8FB0D9]">{products.length}</div>
                <span className="text-[11px] text-[#9C8FA8] mt-1.5 block font-medium">ক্যাটাগরি: {categories.length}</span>
              </div>
            </div>

            {/* TAB 1: ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${cardCls} p-4`}>
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#6E6278] absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="অর্ডার আইডি, ফোন নম্বর, বা কাস্টমারের নাম খুঁজুন..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`${inputCls} pl-9 py-2 text-xs sm:text-sm`}
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                          statusFilter === st
                            ? 'bg-[#C4587A] text-white'
                            : 'bg-[#211C28] text-[#9C8FA8] hover:bg-[#241F2B] hover:text-[#D8CFE0] border border-[#2E2733]'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <a
                    href="/api/orders/export"
                    download="subinyas_orders.csv"
                    className="bg-[#6FAE8C] hover:bg-[#5F9E7C] text-[#0E1A14] text-xs font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" />
                    <span>কুরিয়ার CSV এক্সপোর্ট</span>
                  </a>
                </div>

                {/* Orders Table */}
                <div className={`${cardCls} overflow-hidden`}>
                  {isOrdersLoading ? (
                    <div className="p-14 text-center text-[#9C8FA8] text-sm flex flex-col items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-[#C4587A]" />
                      <span>ডেটাবেজ থেকে অর্ডার লোড হচ্ছে...</span>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="p-14 text-center text-[#9C8FA8] text-sm space-y-2">
                      <Package className="w-10 h-10 mx-auto text-[#3A323F] stroke-1" />
                      <p>কোনো অর্ডার পাওয়া যায়নি।</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-[#D8CFE0]">
                        <thead className="bg-[#17131C] text-[#8A7D97] uppercase text-[10px] tracking-wider border-b border-[#2E2733]">
                          <tr>
                            <th className="py-3.5 px-4 font-bold">অর্ডার আইডি ও তারিখ</th>
                            <th className="py-3.5 px-4 font-bold">কাস্টমার তথ্য</th>
                            <th className="py-3.5 px-4 font-bold">প্রোডাক্ট ও ভ্যারিয়েন্ট</th>
                            <th className="py-3.5 px-4 font-bold">মোট মূল্য</th>
                            <th className="py-3.5 px-4 font-bold">স্ট্যাটাস</th>
                            <th className="py-3.5 px-4 text-right font-bold">যোগাযোগ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2A2430]">
                          {orders.map((ord) => (
                            <tr key={ord.orderId} className="hover:bg-[#211C28]/60 transition-colors">
                              <td className="py-4 px-4 font-mono font-bold text-white">
                                {ord.orderId}
                                <span className="block text-[10px] font-normal text-[#8A7D97] font-sans mt-0.5">
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
                                <div className="text-[#9C8FA8] font-mono mt-0.5">{ord.phone}</div>
                                <div className="text-[11px] text-[#8A7D97] max-w-[200px] truncate mt-0.5" title={ord.address}>
                                  📍 {ord.address}
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="font-semibold text-[#E39BB4]">{ord.productNameBn}</div>
                                <div className="text-[11px] text-[#D8CFE0]">{ord.comboTitleBn}</div>
                                <div className="text-[10px] text-[#8A7D97] font-mono">
                                  Colors: {ord.selectedVariants?.join(', ')}
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="font-black text-white text-sm">৳{ord.totalAmount}</div>
                                <div className="text-[10px] text-[#8A7D97]">
                                  {ord.deliveryArea === 'inside_dhaka' ? 'Inside Dhaka (৳70)' : 'Outside Dhaka (৳130)'}
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <select
                                  value={ord.status}
                                  onChange={(e) => handleStatusChange(ord.orderId, e.target.value as OrderStatus)}
                                  className={`text-xs font-bold py-1.5 px-3 rounded-lg border focus:outline-none cursor-pointer ${
                                    STATUS_STYLES[ord.status] || STATUS_STYLES.Pending
                                  }`}
                                >
                                  <option value="Pending" className="bg-[#1C1821] text-[#E4BC79]">Pending</option>
                                  <option value="Confirmed" className="bg-[#1C1821] text-[#8FB0D9]">Confirmed (Stock -1)</option>
                                  <option value="Shipped" className="bg-[#1C1821] text-[#BAA3DE]">Shipped</option>
                                  <option value="Delivered" className="bg-[#1C1821] text-[#8FC7A9]">Delivered</option>
                                  <option value="Returned" className="bg-[#1C1821] text-[#DDA876]">Returned (Stock +1)</option>
                                  <option value="Cancelled" className="bg-[#1C1821] text-[#DD8A94]">Cancelled (Stock +1)</option>
                                </select>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <a
                                    href={`tel:${ord.phone}`}
                                    className="p-2 bg-[#211C28] hover:bg-[#2A2430] rounded-lg text-[#D8CFE0] transition-colors border border-[#2E2733]"
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
                                    className="p-2 bg-[#6FAE8C]/15 hover:bg-[#6FAE8C] text-[#8FC7A9] hover:text-[#0E1A14] rounded-lg transition-colors border border-[#6FAE8C]/25"
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
                <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${cardCls} p-4`}>
                  <div>
                    <h3 className="text-base font-bold text-white">প্রোডাক্ট ও ইনভেন্টরি নিয়ন্ত্রণ</h3>
                    <p className="text-xs text-[#9C8FA8] mt-0.5">মূল্য, স্টক, ভ্যারিয়েন্ট ও ফিচার্ড স্ট্যাটাস ম্যানেজ করুন</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => switchTab('categories')}
                      className="bg-[#211C28] hover:bg-[#2A2430] text-[#D8CFE0] text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 border border-[#2E2733] transition-colors cursor-pointer"
                    >
                      <FolderPlus className="w-4 h-4 text-[#D3A45E]" />
                      <span>ক্যাটাগরি ({categories.length})</span>
                    </button>

                    <button
                      onClick={handleOpenAddProduct}
                      className="bg-[#C4587A] hover:bg-[#B24A6B] text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-[#C4587A]/20 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>নতুন প্রোডাক্ট যোগ করুন</span>
                    </button>
                  </div>
                </div>

                {isProductsLoading ? (
                  <div className="p-14 text-center text-[#9C8FA8] flex flex-col items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-[#C4587A]" />
                    <span>MongoDB থেকে প্রোডাক্ট লোড হচ্ছে...</span>
                  </div>
                ) : products.length === 0 ? (
                  <div className={`p-14 text-center text-[#9C8FA8] ${cardCls} space-y-3`}>
                    <Layers className="w-12 h-12 mx-auto text-[#3A323F] stroke-1" />
                    <p>কোনো প্রোডাক্ট পাওয়া যায়নি।</p>
                    <button
                      onClick={handleOpenAddProduct}
                      className="bg-[#C4587A] text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                    >
                      প্রথম প্রোডাক্ট তৈরি করুন
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {products.map((prod) => (
                      <div key={prod.slug} className={`${cardCls} p-6 space-y-5`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2E2733] pb-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#14111A] border border-[#2E2733] shrink-0">
                              <Image src={prod.images[0] || '/images/products/hello-kitty-pair.png'} alt={prod.name} fill className="object-cover" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-white text-base">{prod.name}</h3>
                                <span className="bg-[#211C28] text-[#D8CFE0] text-[10px] font-bold px-2 py-0.5 rounded border border-[#2E2733]">
                                  {prod.category}
                                </span>
                                {prod.isFeatured && (
                                  <span className="bg-[#D3A45E]/15 text-[#E4BC79] border border-[#D3A45E]/30 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    <span>Featured</span>
                                  </span>
                                )}
                                {!prod.isActive && (
                                  <span className="bg-[#211C28] text-[#8A7D97] text-[10px] font-bold px-2 py-0.5 rounded border border-[#2E2733]">
                                    Draft / Hidden
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-[#8A7D97] font-mono">/products/{prod.slug}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() =>
                                toggleHeroSliderMutation.mutate({
                                  slug: prod.slug,
                                  isHeroSlider: !prod.isHeroSlider,
                                })
                              }
                              className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                                prod.isHeroSlider
                                  ? 'bg-[#D3A45E]/15 text-[#E4BC79] border-[#D3A45E]/35'
                                  : 'bg-[#211C28] text-[#8A7D97] border-[#2E2733] hover:text-[#D8CFE0]'
                              }`}
                              title="হোমপেজ হিরো স্লাইডারে টগল করুন"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>{prod.isHeroSlider ? `Hero Slider #${prod.heroOrder || 1}` : '+ Hero-তে যোগ করুন'}</span>
                            </button>

                            <span className="text-xs font-bold text-[#E39BB4] bg-[#C4587A]/10 px-3 py-1.5 rounded-lg border border-[#C4587A]/20">
                              ৳{prod.basePrice} <span className="text-[#8A7D97] line-through font-normal">৳{prod.originalPrice}</span>
                            </span>

                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              className="bg-[#211C28] hover:bg-[#2A2430] text-[#D8CFE0] text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-[#2E2733]"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            <Link
                              href={`/products/${prod.slug}`}
                              target="_blank"
                              className="bg-[#211C28] hover:bg-[#2A2430] text-[#D8CFE0] text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors border border-[#2E2733]"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Live</span>
                            </Link>

                            <button
                              onClick={() => {
                                if (confirm(`আপনি কি নিশ্চিত "${prod.name}" ডিলিট করতে চান?`)) {
                                  deleteProductMutation.mutate(prod.slug);
                                }
                              }}
                              className="p-2 bg-[#C1495A]/12 hover:bg-[#C1495A] text-[#DD8A94] hover:text-white rounded-lg transition-colors cursor-pointer border border-[#C1495A]/25"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Variants and Stock */}
                        <div>
                          <h4 className="text-[10px] font-bold text-[#8A7D97] uppercase tracking-wider mb-3">
                            কালার ভ্যারিয়েন্ট ও লাইভ স্টক
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {prod.variants?.map((v) => (
                              <div key={v.id} className="bg-[#14111A] p-3.5 rounded-xl border border-[#2E2733] space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2.5">
                                    <div
                                      className="w-4 h-4 rounded-full border border-[#3A323F] shrink-0"
                                      style={{ backgroundColor: v.colorHex }}
                                    />
                                    <span className="font-bold text-white text-xs truncate">{v.name}</span>
                                  </div>
                                  <span className="text-[10px] font-mono text-[#8A7D97]">Stock: {v.stockCount || 0}</span>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-[#2A2430] text-xs">
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
                                      className="accent-[#C4587A] rounded"
                                    />
                                    <span className={v.inStock ? 'text-[#8FC7A9] font-bold text-[11px]' : 'text-[#DD8A94] text-[11px]'}>
                                      {v.inStock ? 'স্টকে আছে' : 'স্টক নেই'}
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

            {/* TAB: MANAGE BANNERS / HERO SLIDER */}
            {activeTab === 'banners' && (() => {
              const heroEnabledProducts = products.filter((p) => p.isHeroSlider === true);
              const selectedBannerSlugs: string[] =
                settingsData?.heroBannerSlugs ?? heroEnabledProducts.slice(0, 4).map((p) => p.slug);

              const activeHeroSlides = selectedBannerSlugs
                .map((slug) => heroEnabledProducts.find((p) => p.slug === slug))
                .filter(Boolean) as Product[];

              const handleToggleSlideSelection = (prodSlug: string) => {
                if (selectedBannerSlugs.includes(prodSlug)) {
                  // Deselect slide from active list (keeps product in Hero Pool!)
                  const newSlugs = selectedBannerSlugs.filter((s) => s !== prodSlug);
                  saveSettingsMutation.mutate({ heroBannerSlugs: newSlugs });
                } else {
                  // Select slide (max 4)
                  if (selectedBannerSlugs.length >= 4) {
                    alert('You can select up to 4 active hero slides at a time.');
                    return;
                  }
                  const newSlugs = [...selectedBannerSlugs, prodSlug];
                  saveSettingsMutation.mutate({ heroBannerSlugs: newSlugs });
                }
              };

              const handleReorderSlides = (fromIdx: number, toIdx: number) => {
                if (toIdx < 0 || toIdx >= selectedBannerSlugs.length) return;
                const newSlugs = [...selectedBannerSlugs];
                const [moved] = newSlugs.splice(fromIdx, 1);
                newSlugs.splice(toIdx, 0, moved);
                saveSettingsMutation.mutate({ heroBannerSlugs: newSlugs });
              };

              return (
                <div className="space-y-7">
                  {/* Header with Info & Live Link */}
                  <div className={`${cardCls} p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#D3A45E]/15 border border-[#D3A45E]/30 flex items-center justify-center text-[#D3A45E]">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-white">Homepage Hero Slider & Banner Manager</h2>
                          <p className="text-xs text-[#9C8FA8]">
                            Select up to 4 products from the pool below, upload dedicated 16:9 banner visuals, and preview live
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <Link
                        href="/"
                        target="_blank"
                        className="px-4 py-2.5 rounded-xl bg-[#211C28] hover:bg-[#2E2733] text-[#D8CFE0] hover:text-white text-xs font-semibold border border-[#2E2733] transition-colors flex items-center gap-2"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#E39BB4]" />
                        <span>Live Homepage</span>
                      </Link>
                    </div>
                  </div>

                  {/* Top Section: Hero-Enabled Products Selection Pool (Grid) */}
                  <div className={`${cardCls} p-5 sm:p-6 space-y-4`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2E2733] pb-4">
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <span>Hero Products Pool</span>
                          <span className="text-[11px] font-mono font-bold bg-[#D3A45E]/15 text-[#E4BC79] px-2 py-0.5 rounded-md border border-[#D3A45E]/25">
                            {heroEnabledProducts.length} in Pool • {activeHeroSlides.length} Active Slides
                          </span>
                        </h3>
                        <p className="text-xs text-[#8A7D97] mt-0.5">
                          Click any card to select or unselect it for the active homepage slider (Max 4 active slides)
                        </p>
                      </div>
                    </div>

                    {heroEnabledProducts.length === 0 ? (
                      <div className="py-10 text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#211C28] border border-[#2E2733] flex items-center justify-center mx-auto text-[#8A7D97]">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-white">No Products in Hero Pool</h4>
                        <p className="text-xs text-[#8A7D97] max-w-sm mx-auto">
                          Choose products from below and click &quot;+ Add to Hero Pool&quot; to make them available for the banner slider.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                        {heroEnabledProducts.map((prod) => {
                          const slideIndex = selectedBannerSlugs.indexOf(prod.slug);
                          const isSelected = slideIndex !== -1;

                          return (
                            <div
                              key={prod.slug}
                              onClick={() => handleToggleSlideSelection(prod.slug)}
                              className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                                isSelected
                                  ? 'bg-[#C4587A]/12 border-[#C4587A] shadow-md shadow-[#C4587A]/20'
                                  : 'bg-[#14111A] border-[#2E2733] hover:border-[#42374A]'
                              }`}
                            >
                              {/* Selected Ribbon / Badge */}
                              <div className="flex items-center justify-between mb-2.5">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                    isSelected
                                      ? 'bg-[#C4587A] text-white'
                                      : 'bg-[#211C28] text-[#8A7D97] border border-[#2E2733]'
                                  }`}
                                >
                                  {isSelected ? `✓ Slide #${slideIndex + 1}` : '+ Click to Select'}
                                </span>
                                <span className="text-[10px] text-[#8A7D97] font-mono">৳{prod.basePrice}</span>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#1C1821] border border-[#2E2733] shrink-0">
                                  <Image
                                    src={prod.images?.[0] || '/images/products/hello-kitty-pair.png'}
                                    alt={prod.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h5 className="text-xs font-bold text-white truncate">{prod.name || prod.nameBn}</h5>
                                  <p className="text-[10px] text-[#8A7D97] truncate">{prod.category}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Catalog products not yet in hero pool */}
                    {products.filter((p) => p.isHeroSlider !== true).length > 0 && (
                      <div className="pt-4 border-t border-[#2E2733]">
                        <h4 className="text-xs font-bold text-[#D8CFE0] mb-2">Add Other Store Products to Hero Pool:</h4>
                        <div className="flex flex-wrap gap-2">
                          {products
                            .filter((p) => p.isHeroSlider !== true)
                            .map((prod) => (
                              <button
                                key={prod.slug}
                                type="button"
                                onClick={() => {
                                  saveProductMutation.mutate({
                                    ...prod,
                                    isHeroSlider: true,
                                    updatedAt: new Date().toISOString(),
                                  });
                                }}
                                className="px-2.5 py-1.5 bg-[#211C28] hover:bg-[#2E2733] text-[#D8CFE0] hover:text-white rounded-xl text-xs font-medium border border-[#2E2733] flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Plus className="w-3 h-3 text-[#D3A45E]" />
                                <span>{prod.name || prod.nameBn}</span>
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Section: Dedicated 16:9 Banner Slide Customizers */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <span>Active Banner Slides Customizer (16:9 Format)</span>
                          <span className="text-[11px] font-mono font-bold bg-[#6FAE8C]/15 text-[#8FC7A9] px-2 py-0.5 rounded-md border border-[#6FAE8C]/25">
                            {activeHeroSlides.length} Live on Homepage
                          </span>
                        </h3>
                        <p className="text-xs text-[#8A7D97] mt-0.5">
                          Upload 16:9 banner visuals, choose layout orientation, and preview dynamic actions
                        </p>
                      </div>
                    </div>

                    {activeHeroSlides.length === 0 ? (
                      <div className={`${cardCls} p-12 text-center space-y-2`}>
                        <p className="text-xs text-[#8A7D97]">
                          Please select at least 1 product from the Hero Products Pool above to configure its 16:9 banner image and settings.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {activeHeroSlides.map((prod, idx, arr) => (
                          <div
                            key={prod.slug || idx}
                            className={`${cardCls} p-5 sm:p-6 border border-[#2E2733] space-y-5`}
                          >
                            {/* Slide Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2E2733] pb-4">
                              <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl bg-[#C4587A] text-white flex items-center justify-center font-mono font-bold text-xs">
                                  #{idx + 1}
                                </span>
                                <div>
                                  <h4 className="text-sm font-bold text-white">{prod.name || prod.nameBn}</h4>
                                  <p className="text-[11px] text-[#8A7D97]">
                                    Category: <span className="text-[#D8CFE0]">{prod.category}</span> • Linked to{' '}
                                    <span className="font-mono text-[#E39BB4]">/products/{prod.slug}</span>
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-center">
                                {/* Move Up / Down Buttons */}
                                <div className="flex items-center bg-[#14111A] border border-[#2E2733] rounded-xl overflow-hidden">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => handleReorderSlides(idx, idx - 1)}
                                    className="p-2 text-[#9C8FA8] hover:text-white hover:bg-[#211C28] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    title="Move Slide Up"
                                  >
                                    <ChevronUp className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === arr.length - 1}
                                    onClick={() => handleReorderSlides(idx, idx + 1)}
                                    className="p-2 text-[#9C8FA8] hover:text-white hover:bg-[#211C28] disabled:opacity-30 disabled:cursor-not-allowed transition-colors border-l border-[#2E2733]"
                                    title="Move Slide Down"
                                  >
                                    <ChevronDown className="w-4 h-4" />
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleToggleSlideSelection(prod.slug)}
                                  className="px-3 py-2 bg-[#211C28] hover:bg-[#2E2733] text-[#D8CFE0] hover:text-white text-xs font-semibold rounded-xl border border-[#2E2733] flex items-center gap-1.5 transition-colors cursor-pointer"
                                  title="Unselect this Slide"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Unselect Slide</span>
                                </button>
                              </div>
                            </div>

                            {/* Banner Layout Orientation Controls */}
                            <div className="bg-[#14111A] p-4 rounded-xl border border-[#2E2733] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div>
                                <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                                  <Sliders className="w-3.5 h-3.5 text-[#D3A45E]" />
                                  <span>Banner Layout Orientation</span>
                                </h5>
                                <p className="text-[11px] text-[#8A7D97]">
                                  Choose whether text details appear on the left or right side on the homepage
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    saveProductMutation.mutate({
                                      ...prod,
                                      heroLayout: 'text_left',
                                      updatedAt: new Date().toISOString(),
                                    });
                                  }}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                                    prod.heroLayout !== 'text_right'
                                      ? 'bg-[#C4587A] text-white border-[#C4587A] shadow-sm shadow-[#C4587A]/25'
                                      : 'bg-[#211C28] text-[#9C8FA8] hover:text-white border-[#2E2733]'
                                  }`}
                                >
                                  <span>Text in Left • Image in Right</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    saveProductMutation.mutate({
                                      ...prod,
                                      heroLayout: 'text_right',
                                      updatedAt: new Date().toISOString(),
                                    });
                                  }}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                                    prod.heroLayout === 'text_right'
                                      ? 'bg-[#C4587A] text-white border-[#C4587A] shadow-sm shadow-[#C4587A]/25'
                                      : 'bg-[#211C28] text-[#9C8FA8] hover:text-white border-[#2E2733]'
                                  }`}
                                >
                                  <span>Image in Left • Text in Right</span>
                                </button>
                              </div>
                            </div>

                            {/* 16:9 Banner Image Uploader & Live Preview Frame */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                              {/* 16:9 Visual Container */}
                              <div className="lg:col-span-7">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                                      <ImageIcon className="w-3.5 h-3.5 text-[#D3A45E]" />
                                      <span>16:9 Hero Banner Visual</span>
                                    </label>
                                    <span className="text-[10px] text-[#8A7D97] font-mono">16:9 Aspect Ratio</span>
                                  </div>

                                  <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#14111A] border-2 border-dashed border-[#332B3D] group">
                                    <Image
                                      src={
                                        prod.heroBannerImage ||
                                        prod.images?.[0] ||
                                        '/images/products/hello-kitty-pair.png'
                                      }
                                      alt={prod.name}
                                      fill
                                      className="object-cover"
                                    />

                                    {/* Overlay Uploader Action */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4 text-center">
                                      <label className="cursor-pointer bg-[#C4587A] hover:bg-[#B24A6B] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg transition-all">
                                        {uploadingBannerSlug === prod.slug ? (
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                          <Camera className="w-4 h-4" />
                                        )}
                                        <span>Upload 16:9 Banner Image</span>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          disabled={uploadingBannerSlug === prod.slug}
                                          onChange={(e) => handleHeroBannerUpload(prod, e)}
                                        />
                                      </label>

                                      {prod.heroBannerImage && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            saveProductMutation.mutate({
                                              ...prod,
                                              heroBannerImage: '',
                                              updatedAt: new Date().toISOString(),
                                            });
                                          }}
                                          className="text-[11px] text-[#DD8A94] hover:underline cursor-pointer"
                                        >
                                          Reset to Product Photo
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between text-[11px] text-[#8A7D97]">
                                    <span>
                                      {prod.heroBannerImage ? (
                                        <span className="text-[#8FC7A9] font-medium">✓ Custom 16:9 Banner Active</span>
                                      ) : (
                                        <span className="text-[#E4BC79]">Using default product photo (Click to upload 16:9 banner)</span>
                                      )}
                                    </span>

                                    <label className="cursor-pointer text-[#E39BB4] hover:underline flex items-center gap-1 font-semibold">
                                      <Plus className="w-3 h-3" />
                                      <span>Upload Custom Image</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        disabled={uploadingBannerSlug === prod.slug}
                                        onChange={(e) => handleHeroBannerUpload(prod, e)}
                                      />
                                    </label>
                                  </div>
                                </div>
                              </div>

                              {/* Dynamic Homepage Action Preview */}
                              <div className="lg:col-span-5 bg-[#14111A] p-5 rounded-2xl border border-[#2E2733] space-y-3.5">
                                <div className="space-y-1">
                                  <span className="text-[10px] uppercase font-bold text-[#E39BB4] tracking-wider">
                                    Homepage Live Action Preview
                                  </span>
                                  <h5 className="text-sm font-bold text-white truncate">{prod.name || prod.nameBn}</h5>
                                  <p className="text-xs text-[#8A7D97] line-clamp-2">
                                    {prod.taglineBn || prod.descriptionBn}
                                  </p>
                                </div>

                                <div className="flex items-baseline gap-2 pt-1 border-t border-[#2E2733]">
                                  <span className="text-base font-extrabold text-white font-mono">৳{prod.basePrice}</span>
                                  {prod.originalPrice > prod.basePrice && (
                                    <span className="text-xs line-through text-[#6E6278] font-mono">
                                      ৳{prod.originalPrice}
                                    </span>
                                  )}
                                  <span className="text-[10px] font-bold text-[#8FC7A9] bg-[#6FAE8C]/12 px-2 py-0.5 rounded">
                                    Save ৳{Math.max(0, prod.originalPrice - prod.basePrice)}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                  <Link
                                    href={`/products/${prod.slug}`}
                                    target="_blank"
                                    className="flex-1 py-2 bg-[#C4587A] hover:bg-[#B24A6B] text-white text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 shadow-md shadow-[#C4587A]/20 transition-all"
                                  >
                                    <span>Order Now Button</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* TAB 3: CATEGORY SETTINGS */}
            {activeTab === 'categories' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* LEFT: Add Category Form */}
                <div className={`lg:col-span-5 ${cardCls} p-6 space-y-5`}>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <FolderPlus className="w-5 h-5 text-[#D3A45E]" />
                      <span>নতুন ক্যাটাগরি তৈরি করুন</span>
                    </h3>
                    <p className="text-xs text-[#9C8FA8] mt-1">
                      ক্যাটাগরির নাম লিখুন। এটি স্বয়ংক্রিয়ভাবে সবার শেষে যুক্ত হবে।
                    </p>
                  </div>

                  {catError && (
                    <div className="bg-[#C1495A]/12 border border-[#C1495A]/30 text-[#DD8A94] text-xs p-3.5 rounded-xl font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{catError}</span>
                    </div>
                  )}

                  {catSuccess && (
                    <div className="bg-[#6FAE8C]/12 border border-[#6FAE8C]/30 text-[#8FC7A9] text-xs p-3.5 rounded-xl font-medium flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{catSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleCreateCategory} className="space-y-4 text-xs sm:text-sm">
                    <div>
                      <label className={labelCls}>ক্যাটাগরির নাম *</label>
                      <input
                        type="text"
                        required
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="যেমন: Travel, Organizers, Jewelry Box, Pouches..."
                        className={inputCls}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={addCategoryMutation.isPending}
                      className="w-full bg-[#D3A45E] hover:bg-[#C4964F] text-[#1A140A] font-bold py-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      {addCategoryMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      <span>ক্যাটাগরি সংরক্ষণ করুন</span>
                    </button>
                  </form>
                </div>

                {/* RIGHT: Categories List & Drag-and-Drop Reordering */}
                <div className={`lg:col-span-7 ${cardCls} overflow-hidden space-y-4`}>
                  <div className="p-5 border-b border-[#2E2733] flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Folder className="w-4 h-4 text-[#D3A45E]" />
                        <span>ক্যাটাগরি তালিকা ({categories.length})</span>
                      </h4>
                      <p className="text-[11px] text-[#8A7D97] mt-0.5">
                        ক্রম পরিবর্তন করতে যেকোনো আইটেম টেনে উপরে-নিচে করুন
                      </p>
                    </div>
                  </div>

                  {isCategoriesLoading ? (
                    <div className="p-14 text-center text-[#9C8FA8] text-xs">লোড হচ্ছে...</div>
                  ) : categories.length === 0 ? (
                    <div className="p-14 text-center text-[#9C8FA8] text-xs space-y-2">
                      <Folder className="w-10 h-10 mx-auto text-[#3A323F] stroke-1" />
                      <p>কোনো ক্যাটাগরি নেই।</p>
                      <p className="text-[11px] text-[#6E6278]">বাম পাশের ফর্ম ব্যবহার করে প্রথম ক্যাটাগরি যোগ করুন।</p>
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
                          className={`p-3.5 bg-[#14111A] rounded-xl border transition-all cursor-grab active:cursor-grabbing flex items-center justify-between gap-3 select-none ${
                            draggedCategoryIndex === idx
                              ? 'opacity-30 border-[#D3A45E]/60 bg-[#D3A45E]/10 scale-[0.98]'
                              : dragOverCategoryIndex === idx
                              ? 'border-[#D3A45E] bg-[#D3A45E]/10 ring-1 ring-[#D3A45E]/30'
                              : 'border-[#2E2733] hover:border-[#3A323F] hover:bg-[#1C1821]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="text-[#6E6278] hover:text-[#D3A45E] cursor-grab active:cursor-grabbing p-1 rounded transition-colors shrink-0"
                              title="Drag to Reorder"
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>

                            <div className="w-7 h-7 rounded-lg bg-[#D3A45E]/15 text-[#E4BC79] border border-[#D3A45E]/30 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                              #{cat.order || idx + 1}
                            </div>

                            <span className="font-bold text-white text-sm">{cat.name}</span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-[#6E6278] font-mono hidden sm:inline">টেনে সরান</span>
                            <button
                              onClick={() => {
                                if (confirm(`আপনি কি নিশ্চিত "${cat.name}" ক্যাটাগরি ডিলিট করতে চান?`)) {
                                  deleteCategoryMutation.mutate(cat._id || (cat.id as string) || cat.name);
                                }
                              }}
                              className="p-1.5 bg-[#C1495A]/12 hover:bg-[#C1495A] text-[#DD8A94] hover:text-white rounded-lg transition-colors cursor-pointer border border-[#C1495A]/25"
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
                <div className={`flex items-center justify-between ${cardCls} p-4 flex-wrap gap-3`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#9C8FA8]">ফিল্টার:</span>
                    {['All', 'Pending', 'Approved', 'Declined'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setReviewStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          reviewStatusFilter === st
                            ? 'bg-[#C4587A] text-white'
                            : 'bg-[#211C28] text-[#9C8FA8] hover:bg-[#241F2B] hover:text-[#D8CFE0] border border-[#2E2733]'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <span className="text-xs text-[#9C8FA8]">
                    মোট রিভিউ: <strong className="text-white">{reviews.length}</strong>
                  </span>
                </div>

                {isReviewsLoading ? (
                  <div className="p-14 text-center text-[#9C8FA8] text-sm flex flex-col items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-[#C4587A]" />
                    <span>MongoDB থেকে রিভিউ লোড হচ্ছে...</span>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className={`p-14 text-center text-[#9C8FA8] text-sm ${cardCls}`}>
                    কোনো রিভিউ পাওয়া যায়নি।
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className={`${cardCls} p-5 space-y-3 flex flex-col justify-between`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm">{rev.userName}</span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    rev.status === 'Approved'
                                      ? 'bg-[#6FAE8C]/15 text-[#8FC7A9] border-[#6FAE8C]/30'
                                      : rev.status === 'Declined'
                                      ? 'bg-[#C1495A]/15 text-[#DD8A94] border-[#C1495A]/30'
                                      : 'bg-[#D6A24E]/15 text-[#E4BC79] border-[#D6A24E]/30'
                                  }`}
                                >
                                  {rev.status || 'Pending'}
                                </span>
                              </div>
                              <span className="text-[10px] text-[#8A7D97]">
                                Slug: <strong className="text-[#D8CFE0]">{rev.productSlug}</strong> •{' '}
                                {new Date(rev.createdAt).toLocaleDateString('en-GB')}
                              </span>
                            </div>

                            <div className="flex text-[#D3A45E]">
                              {[...Array(rev.rating)].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-[#D3A45E]" />
                              ))}
                            </div>
                          </div>

                          <p className="text-xs text-[#D8CFE0] leading-relaxed bg-[#14111A] p-3 rounded-xl border border-[#2A2430]">
                            "{rev.comment}"
                          </p>

                          {rev.mediaUrls && rev.mediaUrls.length > 0 && (
                            <div className="flex gap-2 pt-1">
                              {rev.mediaUrls.map((url, idx) => (
                                <div
                                  key={idx}
                                  className="relative w-14 h-14 rounded-lg overflow-hidden border border-[#2E2733] bg-[#14111A]"
                                >
                                  <Image src={url} alt="Review media" fill className="object-cover" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2A2430]">
                          {rev.status !== 'Approved' && (
                            <button
                              onClick={() => updateReviewStatusMutation.mutate({ reviewId: rev.id, status: 'Approved' })}
                              className="bg-[#6FAE8C] hover:bg-[#5F9E7C] text-[#0E1A14] font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                          )}

                          {rev.status !== 'Declined' && (
                            <button
                              onClick={() => updateReviewStatusMutation.mutate({ reviewId: rev.id, status: 'Declined' })}
                              className="bg-[#D6A24E]/15 hover:bg-[#D6A24E] text-[#E4BC79] hover:text-[#1A140A] font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer border border-[#D6A24E]/30"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Decline</span>
                            </button>
                          )}

                          <button
                            onClick={() => deleteReviewMutation.mutate(rev.id)}
                            className="bg-[#C1495A]/12 hover:bg-[#C1495A] text-[#DD8A94] hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer border border-[#C1495A]/25"
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
              <div className={`max-w-2xl ${cardCls} p-6 space-y-6`}>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#C4587A]" />
                  <span>স্টোর কনফিগারেশন ও Meta Pixel ইন্টিগ্রেশন</span>
                </h3>

                {settingsSuccess && (
                  <div className="bg-[#6FAE8C]/12 border border-[#6FAE8C]/30 text-[#8FC7A9] text-xs p-3.5 rounded-xl font-medium">
                    {settingsSuccess}
                  </div>
                )}

                <form onSubmit={handleSaveSettings} className="space-y-4 text-xs sm:text-sm">
                  <div>
                    <label className={labelCls}>Meta Pixel ID (Facebook Ads Tracking)</label>
                    <input
                      type="text"
                      value={metaPixelId}
                      onChange={(e) => setMetaPixelId(e.target.value)}
                      placeholder="e.g. 1234567890123456"
                      className={`${inputCls} font-mono text-xs`}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>অফিসিয়াল হোয়াটসঅ্যাপ সাপোর্ট নম্বর (কান্ট্রি কোডসহ)</label>
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="8801617492486"
                      className={`${inputCls} font-mono text-xs`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>ঢাকার ভিতরে ডেলিভারি চার্জ (৳)</label>
                      <input
                        type="number"
                        value={deliveryInside}
                        onChange={(e) => setDeliveryInside(Number(e.target.value))}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>ঢাকার বাইরে ডেলিভারি চার্জ (৳)</label>
                      <input
                        type="number"
                        value={deliveryOutside}
                        onChange={(e) => setDeliveryOutside(Number(e.target.value))}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saveSettingsMutation.isPending}
                    className="w-full bg-[#C4587A] hover:bg-[#B24A6B] text-white font-bold py-3 rounded-xl transition-colors cursor-pointer shadow-lg shadow-[#C4587A]/20"
                  >
                    {saveSettingsMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : 'স্টোর কনফিগারেশন সংরক্ষণ করুন'}
                  </button>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* FULL-FEATURED ADD / EDIT PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0B0910]/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1821] border border-[#2E2733] rounded-3xl w-full max-w-4xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#2E2733] pb-4">
              <h2 className="font-display text-lg text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#C4587A]" />
                <span>{editingProductSlug ? 'প্রোডাক্ট এডিট করুন' : 'নতুন প্রোডাক্ট যোগ করুন (MongoDB)'}</span>
              </h2>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 text-[#8A7D97] hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {productFormError && (
              <div className="bg-[#C1495A]/12 border border-[#C1495A]/30 text-[#DD8A94] text-xs p-3.5 rounded-xl font-medium">
                ⚠️ {productFormError}
              </div>
            )}

            {productFormSuccess && (
              <div className="bg-[#6FAE8C]/12 border border-[#6FAE8C]/30 text-[#8FC7A9] text-xs p-3.5 rounded-xl font-medium">
                ✅ {productFormSuccess}
              </div>
            )}

            <form onSubmit={handleSaveProductForm} className="space-y-5 text-xs sm:text-sm">
              {/* Product Name */}
              <div>
                <label className={labelCls}>Product Name *</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setProdName(val);
                    setProdNameBn(val);
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
                  placeholder="e.g. G63 Smart Light Digital Clock with Wireless Charger"
                  className={inputCls}
                />
              </div>

              {/* Slug, Category, Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className={labelCls}>Slug *</label>
                  <input
                    type="text"
                    required
                    value={prodSlug}
                    onChange={(e) => setProdSlug(e.target.value)}
                    placeholder="velvet-pouch"
                    className={`${inputCls} text-[#E39BB4] font-mono text-xs font-semibold`}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[#B7ACC4] font-medium text-xs">Category *</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsProductModalOpen(false);
                        switchTab('categories');
                      }}
                      className="text-[10px] text-[#D3A45E] hover:underline cursor-pointer"
                    >
                      + Manage
                    </button>
                  </div>
                  <select
                    required
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className={`${inputCls} cursor-pointer`}
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
                  <label className={labelCls}>Base Price *</label>
                  <input
                    type="number"
                    required
                    value={prodBasePrice}
                    onChange={(e) => setProdBasePrice(Number(e.target.value))}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Original Price *</label>
                  <input
                    type="number"
                    required
                    value={prodOriginalPrice}
                    onChange={(e) => setProdOriginalPrice(Number(e.target.value))}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Status Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#14111A] p-3.5 rounded-xl border border-[#2E2733] flex items-center justify-between">
                  <div>
                    <label className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-[#E39BB4]" />
                      <span>Featured</span>
                    </label>
                    <p className="text-[10px] text-[#8A7D97]">Enable or Disable</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prodIsFeatured}
                    onChange={(e) => setProdIsFeatured(e.target.checked)}
                    className="w-5 h-5 accent-[#C4587A] rounded cursor-pointer"
                  />
                </div>

                <div className="bg-[#14111A] p-3.5 rounded-xl border border-[#2E2733] flex items-center justify-between">
                  <div>
                    <label className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#D3A45E]" />
                      <span>Hero Slider</span>
                    </label>
                    <p className="text-[10px] text-[#8A7D97]">Enable or Disable</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prodIsHeroSlider}
                    onChange={(e) => setProdIsHeroSlider(e.target.checked)}
                    className="w-5 h-5 accent-[#D3A45E] rounded cursor-pointer"
                  />
                </div>

                <div className="bg-[#14111A] p-3.5 rounded-xl border border-[#2E2733] flex items-center justify-between">
                  <div>
                    <label className="font-bold text-white text-xs flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4 text-[#8FC7A9]" />
                      <span>Is Active</span>
                    </label>
                    <p className="text-[10px] text-[#8A7D97]">Enable or Disable</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prodIsActive}
                    onChange={(e) => setProdIsActive(e.target.checked)}
                    className="w-5 h-5 accent-[#6FAE8C] rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Tagline & Description */}
              <div>
                <label className={labelCls}>Subtitle *</label>
                <input
                  type="text"
                  required
                  value={prodTaglineBn}
                  onChange={(e) => setProdTaglineBn(e.target.value)}
                  placeholder="e.g. Modern multifunctional smart alarm clock with RGB ambient lighting"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Description *</label>
                <textarea
                  rows={3}
                  required
                  value={prodDescriptionBn}
                  onChange={(e) => setProdDescriptionBn(e.target.value)}
                  placeholder="Write full product description, key features, and package benefits..."
                  className={`${inputCls} resize-none`}
                />
              </div>

              {/* Color Variants Builder */}
              <div className="bg-[#14111A] p-4 rounded-2xl border border-[#2E2733] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-xs">Variants & Stock</h3>
                    <p className="text-[11px] text-[#8A7D97]">Add color variants, hex colors, and individual stock counts</p>
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
                          nameBn: 'New Color',
                          color: 'Custom',
                          colorHex: '#3B82F6',
                          image: prodImages[0] || '/images/products/hello-kitty-pair.png',
                          inStock: true,
                          stockCount: 20,
                        },
                      ]);
                    }}
                    className="bg-[#C4587A]/12 hover:bg-[#C4587A] text-[#E39BB4] hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer border border-[#C4587A]/25"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Color</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {prodVariants.map((v, idx) => (
                    <div
                      key={v.id || idx}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3.5 rounded-xl bg-[#1C1821] border border-[#2E2733] items-center"
                    >
                      {/* 1. Color Variant Image Slot */}
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-[#8A7D97] block mb-1">Color Photo</label>
                        <div className="flex items-center gap-2">
                          <label className="relative w-11 h-11 rounded-xl overflow-hidden border border-[#332B3D] bg-[#14111A] hover:border-[#C4587A] flex items-center justify-center cursor-pointer group shrink-0 transition-colors">
                            {uploadingVariantIdx === idx ? (
                              <Loader2 className="w-4 h-4 animate-spin text-[#C4587A]" />
                            ) : v.image ? (
                              <>
                                <Image src={v.image} alt={v.name} fill className="object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <Camera className="w-3.5 h-3.5 text-white" />
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-col items-center justify-center text-[9px] text-[#8A7D97] group-hover:text-[#E39BB4]">
                                <Camera className="w-3.5 h-3.5 mb-0.5" />
                                <span>+ Photo</span>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleVariantImageUpload(idx, e)}
                              className="hidden"
                            />
                          </label>

                          {v.image && (
                            <button
                              type="button"
                              onClick={() =>
                                setProdVariants((prev) =>
                                  prev.map((item, i) => (i === idx ? { ...item, image: '' } : item))
                                )
                              }
                              className="text-[10px] text-[#DD8A94] hover:underline"
                              title="Clear Photo"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>

                      {/* 2. Color / Variant Name */}
                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-[#8A7D97] block mb-1">Color Name</label>
                        <input
                          type="text"
                          required
                          value={v.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            const detectedHex = (name: string) => {
                              const lower = name.toLowerCase();
                              if (lower.includes('black')) return '#1E293B';
                              if (lower.includes('white')) return '#F8FAFC';
                              if (lower.includes('silver')) return '#E2E8F0';
                              if (lower.includes('pink')) return '#F472B6';
                              if (lower.includes('red')) return '#EF4444';
                              if (lower.includes('blue')) return '#3B82F6';
                              if (lower.includes('green')) return '#10B981';
                              if (lower.includes('yellow')) return '#EAB308';
                              if (lower.includes('purple')) return '#8B5CF6';
                              if (lower.includes('gold')) return '#D97706';
                              if (lower.includes('rose gold')) return '#B76E79';
                              if (lower.includes('brown')) return '#78350F';
                              if (lower.includes('gray') || lower.includes('grey')) return '#64748B';
                              return v.colorHex;
                            };
                            setProdVariants((prev) =>
                              prev.map((item, i) =>
                                i === idx ? { ...item, name: val, nameBn: val, colorHex: detectedHex(val) } : item
                              )
                            );
                          }}
                          placeholder="e.g. Matte Black"
                          className="w-full px-2.5 py-1.5 bg-[#14111A] border border-[#2E2733] rounded-lg text-white text-xs"
                        />
                      </div>

                      {/* 3. Color Hex */}
                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-[#8A7D97] block mb-1">Color Hex</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={v.colorHex || '#1E293B'}
                            onChange={(e) => {
                              const hex = e.target.value;
                              setProdVariants((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, colorHex: hex } : item))
                              );
                            }}
                            className="w-8 h-8 rounded-lg border border-[#3A323F] bg-transparent cursor-pointer p-0.5 shrink-0"
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
                            className="w-full px-2 py-1.5 bg-[#14111A] border border-[#2E2733] rounded-lg text-white text-[11px] font-mono"
                          />
                        </div>
                      </div>

                      {/* 4. Stock Count */}
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-[#8A7D97] block mb-1">Stock Count</label>
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
                          className="w-full px-2 py-1.5 bg-[#14111A] border border-[#2E2733] rounded-lg text-white text-xs font-mono font-bold"
                        />
                      </div>

                      {/* 5. In Stock Checkbox & Delete */}
                      <div className="sm:col-span-2 flex items-center justify-between gap-2 pt-3 sm:pt-0">
                        <label className="flex items-center gap-1 text-[11px] cursor-pointer text-[#D8CFE0]">
                          <input
                            type="checkbox"
                            checked={v.inStock}
                            onChange={(e) => {
                              const chk = e.target.checked;
                              setProdVariants((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, inStock: chk } : item))
                              );
                            }}
                            className="accent-[#C4587A] rounded"
                          />
                          <span>{v.inStock ? 'In Stock' : 'Out'}</span>
                        </label>

                        {prodVariants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setProdVariants((prev) => prev.filter((_, i) => i !== idx))}
                            className="p-1.5 text-[#6E6278] hover:text-[#DD8A94] transition-colors"
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

              {/* Packages Builder */}
              <div className="bg-[#14111A] p-4 rounded-2xl border border-[#2E2733] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-xs">Packages</h3>
                    <p className="text-[11px] text-[#8A7D97]">Setup 1-Pack, 2-Pack quantity deals with discounted pricing</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const count = prodCombos.length + 1;
                      setProdCombos((prev) => [
                        ...prev,
                        {
                          id: `combo-${count}`,
                          title: `${count} Pieces Pack`,
                          titleBn: `${count} Pieces Pack`,
                          subtitleBn: `${count} Pieces • Mega Saver Deal`,
                          quantity: count,
                          price: prodBasePrice * count - 100,
                          originalPrice: prodOriginalPrice * count,
                          savingsBn: `Save ৳${prodOriginalPrice * count - (prodBasePrice * count - 100)}`,
                          badge: 'Special Offer',
                        },
                      ]);
                    }}
                    className="bg-[#211C28] hover:bg-[#2A2430] text-[#D8CFE0] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer border border-[#2E2733]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Package</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {prodCombos.map((c, idx) => (
                    <div
                      key={c.id || idx}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 rounded-xl bg-[#1C1821] border border-[#2E2733] items-center text-xs"
                    >
                      <div className="sm:col-span-4">
                        <label className="text-[10px] text-[#8A7D97] block">Combo Title *</label>
                        <input
                          type="text"
                          required
                          value={c.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProdCombos((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, title: val, titleBn: val } : item))
                            );
                          }}
                          className="w-full px-2 py-1 bg-[#14111A] border border-[#2E2733] rounded-lg text-white text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-[#8A7D97] block">Quantity (Qty) *</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={c.quantity}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setProdCombos((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, quantity: val } : item))
                            );
                          }}
                          className="w-full px-2 py-1 bg-[#14111A] border border-[#2E2733] rounded-lg text-white text-xs"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-[#8A7D97] block">Deal Price (৳) *</label>
                        <input
                          type="number"
                          required
                          value={c.price}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setProdCombos((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, price: val } : item))
                            );
                          }}
                          className="w-full px-2 py-1 bg-[#14111A] border border-[#2E2733] rounded-lg text-white text-xs"
                        />
                      </div>

                      <div className="sm:col-span-3 flex items-center justify-between gap-1">
                        <div className="flex-1">
                          <label className="text-[10px] text-[#8A7D97] block">Badge</label>
                          <input
                            type="text"
                            value={c.badge || ''}
                            placeholder="e.g. Popular"
                            onChange={(e) => {
                              const val = e.target.value;
                              setProdCombos((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, badge: val } : item))
                              );
                            }}
                            className="w-full px-2 py-1 bg-[#14111A] border border-[#2E2733] rounded-lg text-white text-xs"
                          />
                        </div>

                        {prodCombos.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setProdCombos((prev) => prev.filter((_, i) => i !== idx))}
                            className="p-1 text-[#6E6278] hover:text-[#DD8A94] mt-3"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features Builder */}
              <div className="bg-[#14111A] p-4 rounded-2xl border border-[#2E2733] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-xs">Features</h3>
                    <p className="text-[11px] text-[#8A7D97]">Add highlight bullet cards for the product page</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProdFeaturesBn((prev) => [
                        ...prev,
                        { icon: 'Sparkles', title: 'Feature Title', description: 'Feature description' },
                      ]);
                    }}
                    className="bg-[#211C28] hover:bg-[#2A2430] text-[#D8CFE0] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer border border-[#2E2733]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Feature</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {prodFeaturesBn.map((feat, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 rounded-xl bg-[#1C1821] border border-[#2E2733] items-center text-xs"
                    >
                      <div className="sm:col-span-4">
                        <label className="text-[10px] text-[#8A7D97] block">Title *</label>
                        <input
                          type="text"
                          required
                          value={feat.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProdFeaturesBn((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, title: val } : item))
                            );
                          }}
                          placeholder="e.g. Long Battery Life"
                          className="w-full px-2 py-1 bg-[#14111A] border border-[#2E2733] rounded-lg text-white text-xs"
                        />
                      </div>

                      <div className="sm:col-span-7">
                        <label className="text-[10px] text-[#8A7D97] block">Description *</label>
                        <input
                          type="text"
                          required
                          value={feat.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProdFeaturesBn((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, description: val } : item))
                            );
                          }}
                          placeholder="e.g. Up to 10 hours continuous operation"
                          className="w-full px-2 py-1 bg-[#14111A] border border-[#2E2733] rounded-lg text-white text-xs"
                        />
                      </div>

                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setProdFeaturesBn((prev) => prev.filter((_, i) => i !== idx))}
                          className="p-1 text-[#6E6278] hover:text-[#DD8A94] mt-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specifications Builder */}
              <div className="bg-[#14111A] p-4 rounded-2xl border border-[#2E2733] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-xs">Specifications</h3>
                    <p className="text-[11px] text-[#8A7D97]">Material, size, warranty and specifications</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProdSpecificationsBn((prev) => [...prev, { key: 'Specification', value: 'Detail' }]);
                    }}
                    className="bg-[#211C28] hover:bg-[#2A2430] text-[#D8CFE0] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer border border-[#2E2733]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Spec</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {prodSpecificationsBn.map((spec, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 rounded-xl bg-[#1C1821] border border-[#2E2733] items-center text-xs"
                    >
                      <div className="sm:col-span-5">
                        <label className="text-[10px] text-[#8A7D97] block">Key (e.g. Material / Battery) *</label>
                        <input
                          type="text"
                          required
                          value={spec.key}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProdSpecificationsBn((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, key: val } : item))
                            );
                          }}
                          className="w-full px-2 py-1 bg-[#14111A] border border-[#2E2733] rounded-lg text-white text-xs"
                        />
                      </div>

                      <div className="sm:col-span-6">
                        <label className="text-[10px] text-[#8A7D97] block">Value (e.g. Premium Aluminium) *</label>
                        <input
                          type="text"
                          required
                          value={spec.value}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProdSpecificationsBn((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, value: val } : item))
                            );
                          }}
                          className="w-full px-2 py-1 bg-[#14111A] border border-[#2E2733] rounded-lg text-white text-xs"
                        />
                      </div>

                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setProdSpecificationsBn((prev) => prev.filter((_, i) => i !== idx))}
                          className="p-1 text-[#6E6278] hover:text-[#DD8A94] mt-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Showcase & Gallery Images */}
              <div className="bg-[#14111A] p-4 rounded-2xl border border-[#2E2733] space-y-3">
                <div>
                  <h3 className="font-bold text-white text-xs">Main Product Showcase & Extra Gallery Photos</h3>
                  <p className="text-[11px] text-[#8A7D97]">
                    Upload general multi-angle shots, banners, or combined package photos
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <label className="inline-flex items-center gap-2 bg-[#211C28] border border-[#2E2733] hover:border-[#3A323F] text-[#D8CFE0] px-4 py-2.5 rounded-xl text-xs cursor-pointer transition-colors">
                    {isUploadingImage ? <Loader2 className="w-4 h-4 animate-spin text-[#C4587A]" /> : <Camera className="w-4 h-4 text-[#E39BB4]" />}
                    <span>{isUploadingImage ? 'Uploading Photos...' : '+ Upload Showcase Photos'}</span>
                    <input type="file" accept="image/*" multiple onChange={handleProductImageUpload} className="hidden" />
                  </label>

                  {prodImages.map((url, idx) => (
                    <div key={idx} className="relative w-14 h-14 rounded-xl overflow-hidden border border-[#2E2733] bg-[#14111A] group">
                      <Image src={url} alt={`Preview ${idx}`} fill className="object-cover" />
                      {idx === 0 && (
                        <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] text-[#E39BB4] text-center font-bold py-0.5">
                          Main
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setProdImages((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-0.5 right-0.5 bg-[#0B0910]/90 text-white hover:text-rose-400 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove Photo"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2E2733]">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#9C8FA8] hover:bg-[#211C28] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveProductMutation.isPending || isUploadingImage}
                  className="bg-[#C4587A] hover:bg-[#B24A6B] text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-[#C4587A]/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
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
        <div className="min-h-screen bg-[#14111A] text-[#9C8FA8] flex items-center justify-center text-sm">
          Loading Dashboard...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}