'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Camera,
  Loader2,
  X,
  Check,
  Sparkles,
  RefreshCw,
  Palette,
  Percent,
  Info,
  Star,
  CheckSquare,
  AlertCircle,
} from 'lucide-react';
import { Product, ProductVariant, ComboOption } from '@/lib/types';
import { CategoryItem } from '@/app/api/categories/route';

type TabType = 'general' | 'media' | 'variants' | 'combos' | 'features';
const TABS: TabType[] = ['general', 'media', 'variants', 'combos', 'features'];

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const cardCls = 'bg-[#211C28] rounded-2xl border border-[#2E2733]';
  const labelCls = 'text-[#B7ACC4] font-medium text-xs block mb-1.5';
  const inputCls =
    'w-full px-3.5 py-2.5 bg-[#191520] border border-[#2E2733] rounded-xl text-white placeholder:text-[#6E6278] focus:border-[#C4587A] focus:outline-none transition-colors text-xs sm:text-sm';

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadingVariantIdx, setUploadingVariantIdx] = useState<number | null>(null);

  // Form Fields (Clean unified schema)
  const [prodName, setProdName] = useState('');
  const [prodSlug, setProdSlug] = useState('');
  const [prodCategory, setProdCategory] = useState('Organizers');
  const [prodTaglineBn, setProdTaglineBn] = useState('');
  const [prodDescriptionBn, setProdDescriptionBn] = useState('');
  const [prodBasePrice, setProdBasePrice] = useState<number>(499);
  const [prodOriginalPrice, setProdOriginalPrice] = useState<number>(800);
  const [prodIsFeatured, setProdIsFeatured] = useState<boolean>(true);
  const [prodIsHeroSlider, setProdIsHeroSlider] = useState<boolean>(false);
  const [prodHeroOrder, setProdHeroOrder] = useState<number>(1);
  const [prodIsActive, setProdIsActive] = useState<boolean>(true);
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [prodVariants, setProdVariants] = useState<ProductVariant[]>([]);
  const [prodCombos, setProdCombos] = useState<ComboOption[]>([]);
  const [prodFeaturesBn, setProdFeaturesBn] = useState<{ icon: string; title: string; description: string }[]>([]);
  const [prodSpecificationsBn, setProdSpecificationsBn] = useState<{ key: string; value: string }[]>([]);

  // Fetch Products
  const {
    data: products = [],
    isLoading,
    refetch,
  } = useQuery<Product[]>({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const res = await axios.get('/api/products');
      return res.data?.products || [];
    },
  });

  // Fetch Categories
  const { data: categories = [] } = useQuery<CategoryItem[]>({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await axios.get('/api/categories');
      return res.data?.categories || [];
    },
  });

  // Save Mutation
  const saveProductMutation = useMutation({
    mutationFn: async (payload: Partial<Product>) => {
      const res = await axios.post('/api/products', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products-overview'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Delete Mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (slug: string) => {
      const res = await axios.delete(`/api/products?slug=${slug}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products-overview'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Auto-detect color Hex from color name
  const detectColorHex = (name: string, fallbackHex = '#3B82F6') => {
    const lower = name.toLowerCase().trim();
    if (lower.includes('pink') || lower.includes('rose') || lower.includes('গোলাপি')) return '#F9A8D4';
    if (lower.includes('white') || lower.includes('pearl') || lower.includes('সাদা')) return '#F8FAFC';
    if (lower.includes('black') || lower.includes('matte') || lower.includes('কালো')) return '#1E293B';
    if (lower.includes('red') || lower.includes('লাল')) return '#EF4444';
    if (lower.includes('blue') || lower.includes('নীল')) return '#3B82F6';
    if (lower.includes('green') || lower.includes('সবুজ')) return '#10B981';
    if (lower.includes('yellow') || lower.includes('হলুদ')) return '#EAB308';
    if (lower.includes('purple') || lower.includes('বেগুনী')) return '#8B5CF6';
    if (lower.includes('gold') || lower.includes('সোনালী')) return '#D97706';
    if (lower.includes('vintage') || lower.includes('cork') || lower.includes('mandala')) return '#D97706';
    if (lower.includes('gray') || lower.includes('grey') || lower.includes('ধূসর')) return '#64748B';
    return fallbackHex;
  };

  // Open Modal for New Product
  const openNewProductModal = () => {
    setEditingSlug(null);
    setActiveTab('general');
    setFormError('');
    setFormSuccess('');
    setProdName('');
    setProdSlug('');
    setProdCategory(categories[0]?.name || 'Organizers');
    setProdTaglineBn('শখের গহনা ও প্রসাধন সুরক্ষিত রাখুন নিখুঁত পরিপাটীভাবে — যেকোনো ভ্রমণের সেরা সঙ্গী!');
    setProdDescriptionBn('প্রিমিয়াম কোয়ালিটির দীর্ঘস্থায়ী ওয়াটারপ্রুফ মেটেরিয়াল দিয়ে তৈরি কম্প্যাক্ট ট্রাভেল জুয়েলারি বক্স।');
    setProdBasePrice(499);
    setProdOriginalPrice(800);
    setProdIsFeatured(true);
    setProdIsHeroSlider(false);
    setProdHeroOrder(1);
    setProdIsActive(true);
    setProdImages(['/images/products/hello-kitty-pair.png', '/images/products/hello-kitty-open.png']);
    setProdVariants([
      {
        id: 'var-1',
        name: 'Soft Pink',
        nameBn: 'Soft Pink',
        color: 'Baby Pink',
        colorHex: '#F9A8D4',
        image: '/images/products/hello-kitty-pair.png',
        inStock: true,
        stockCount: 50,
        stock: 50,
        isDefault: true,
      },
      {
        id: 'var-2',
        name: 'Pearl White',
        nameBn: 'Pearl White',
        color: 'Pearl White',
        colorHex: '#F8FAFC',
        image: '/images/products/hello-kitty-open.png',
        inStock: true,
        stockCount: 40,
        stock: 40,
        isDefault: false,
      },
    ]);
    setProdCombos([
      {
        id: 'combo-single',
        title: 'Single Box (1 Piece)',
        titleBn: 'Single Box (1 Piece)',
        subtitleBn: 'নিজের জন্য বা ছোট উপহারের জন্য',
        quantity: 1,
        price: 499,
        originalPrice: 800,
        savingsBn: 'Save ৳301',
        isPopular: false,
      },
      {
        id: 'combo-duo',
        title: 'Bestie Combo (2 Pieces)',
        titleBn: 'Bestie Combo (2 Pieces)',
        subtitleBn: '১টি আপনার জন্য + ১টি প্রিয় বান্ধবীর জন্য',
        quantity: 2,
        price: 899,
        originalPrice: 1600,
        badge: '🔥 Best Deal',
        savingsBn: 'Save ৳701',
        isPopular: true,
      },
      {
        id: 'combo-trio',
        title: 'Mega Gift Pack (3 Pieces)',
        titleBn: 'Mega Gift Pack (3 Pieces)',
        subtitleBn: 'গিফটিং ও ট্রাভেলের সেরা প্যাকেজ',
        quantity: 3,
        price: 1249,
        originalPrice: 2400,
        badge: '🎁 Mega Offer',
        savingsBn: 'Save ৳1,151',
        isPopular: false,
      },
    ]);
    setProdFeaturesBn([
      { icon: 'Sparkles', title: 'কম্প্যাক্ট ও সহজে বহনযোগ্য', description: 'হাতের তালুর সমান সাইজ, ট্রাভেল ব্যাগে সহজেই জায়গা হয়ে যায়।' },
      { icon: 'ShieldCheck', title: 'স্ক্র্যাচপ্রুফ সফট ভেলভেট লাইনিং', description: 'ভেতরের নরম ভেলভেট আপনার গহনাকে স্ক্র্যাচ থেকে সুরক্ষিত রাখে।' },
      { icon: 'Layers', title: 'মাল্টি-কম্পার্টমেন্ট পার্টিশন', description: 'আংটির জন্য স্লট, নেকলেস হ্যাঙ্গার ও কানের দুলের ফ্লেক্সিবল চেম্বার।' },
      { icon: 'Gift', title: 'অপূর্ব গিফট প্যাকেজিং', description: 'প্রিয় মানুষকে উপহার দেওয়ার মতো আকর্ষণীয় লুক ও ফিনিশিং।' },
    ]);
    setProdSpecificationsBn([
      { key: 'মেটেরিয়াল', value: 'প্রিমিয়াম ওয়াটারপ্রুফ PU লেদার + সফট ভেলভেট' },
      { key: 'সাইজ', value: '১০ সেমি x ১০ সেমি x ৫ সেমি' },
      { key: 'ওজন', value: '১৫০ গ্রাম (লাইটওয়েট)' },
      { key: 'লক সিস্টেম', value: 'স্মুথ মেটাল জিপার সিকিউর লক' },
    ]);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const openEditModal = (p: Product) => {
    setEditingSlug(p.slug);
    setActiveTab('general');
    setFormError('');
    setFormSuccess('');
    setProdName(p.name || p.nameBn || '');
    setProdSlug(p.slug || '');
    setProdCategory(p.category || 'Organizers');
    setProdTaglineBn(p.taglineBn || '');
    setProdDescriptionBn(p.descriptionBn || '');
    setProdBasePrice(p.basePrice || 499);
    setProdOriginalPrice(p.originalPrice || 800);
    setProdIsFeatured(p.isFeatured !== false);
    setProdIsHeroSlider(p.isHeroSlider === true);
    setProdHeroOrder(p.heroOrder || 1);
    setProdIsActive(p.isActive !== false);
    setProdImages(p.images && p.images.length > 0 ? p.images : ['/images/products/hello-kitty-pair.png']);
    setProdVariants(
      p.variants && p.variants.length > 0
        ? p.variants
        : [
            {
              id: 'var-1',
              name: 'Standard',
              nameBn: 'Standard',
              image: p.images?.[0] || '/images/products/hello-kitty-pair.png',
              inStock: true,
              stockCount: 50,
              stock: 50,
            },
          ]
    );
    setProdCombos(
      p.combos && p.combos.length > 0
        ? p.combos
        : [
            {
              id: 'combo-single',
              title: 'Single Pack',
              titleBn: 'Single Pack',
              subtitleBn: 'Standard Package',
              quantity: 1,
              price: p.basePrice || 499,
              originalPrice: p.originalPrice || 800,
              savingsBn: `Save ৳${(p.originalPrice || 800) - (p.basePrice || 499)}`,
            },
          ]
    );
    setProdFeaturesBn(
      p.featuresBn && p.featuresBn.length > 0
        ? p.featuresBn
        : [{ icon: 'Sparkles', title: 'প্রিমিয়াম কোয়ালিটি', description: 'দীর্ঘস্থায়ী উপাদান দিয়ে তৈরি।' }]
    );
    setProdSpecificationsBn(
      p.specificationsBn && p.specificationsBn.length > 0
        ? p.specificationsBn
        : [{ key: 'মেটেরিয়াল', value: 'প্রিমিয়াম PU লেদার' }]
    );
    setIsModalOpen(true);
  };

  // Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, variantIdx?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (variantIdx !== undefined) {
      setUploadingVariantIdx(variantIdx);
    } else {
      setIsUploadingImage(true);
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success && res.data?.url) {
        const uploadedUrl = res.data.url;
        if (variantIdx !== undefined) {
          const updated = [...prodVariants];
          updated[variantIdx].image = uploadedUrl;
          setProdVariants(updated);
        } else {
          setProdImages((prev) => [...prev, uploadedUrl]);
        }
      }
    } catch {
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
      setUploadingVariantIdx(null);
    }
  };

  // Validation Checks Across All 5 Tabs
  const isGeneralValid =
    prodName.trim().length > 0 &&
    prodSlug.trim().length > 0 &&
    prodCategory.trim().length > 0 &&
    Number(prodBasePrice) > 0 &&
    Number(prodOriginalPrice) > 0 &&
    prodTaglineBn.trim().length > 0 &&
    prodDescriptionBn.trim().length > 0;

  const isMediaValid = prodImages.length > 0;

  const isVariantsValid =
    prodVariants.length > 0 && prodVariants.every((v) => v.name.trim().length > 0);

  const isCombosValid =
    prodCombos.length > 0 &&
    prodCombos.every((c) => c.title.trim().length > 0 && Number(c.price) > 0);

  const isFormValid = isGeneralValid && isMediaValid && isVariantsValid && isCombosValid;

  // Handle Form Submit
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!isFormValid) {
      setFormError('Please fill out all required fields across the tabs before saving.');
      return;
    }

    const cleanSlug = prodSlug.toLowerCase().trim().replace(/[^a-z0-9-_]/g, '-');
    const parsedBasePrice = Number(prodBasePrice) || 499;
    const parsedOrigPrice = Number(prodOriginalPrice) || 800;
    const finalName = prodName.trim();

    // Auto-sync base price into the single pack combo if matching
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

    const payload: Partial<Product> = {
      name: finalName,
      nameBn: finalName,
      slug: cleanSlug,
      category: prodCategory.trim(),
      taglineBn: prodTaglineBn.trim() || finalName,
      descriptionBn: prodDescriptionBn.trim() || finalName,
      basePrice: parsedBasePrice,
      originalPrice: parsedOrigPrice,
      isFeatured: prodIsFeatured,
      isHeroSlider: prodIsHeroSlider,
      heroOrder: Number(prodHeroOrder) || 1,
      isActive: prodIsActive,
      images: combinedImages.length > 0 ? combinedImages : ['/images/products/hello-kitty-pair.png'],
      variants: prodVariants,
      combos: syncedCombos,
      featuresBn: prodFeaturesBn,
      specificationsBn: prodSpecificationsBn,
      updatedAt: new Date().toISOString(),
    };

    if (!editingSlug) {
      payload.createdAt = new Date().toISOString();
      payload.rating = 4.9;
      payload.reviewCount = 0;
    }

    try {
      const res = await saveProductMutation.mutateAsync(payload);
      if (res?.success) {
        setFormSuccess('Product saved successfully!');
        setTimeout(() => {
          setIsModalOpen(false);
          setFormSuccess('');
        }, 600);
      } else {
        setFormError(res?.message || 'Failed to save product');
      }
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'Error occurred while saving product';
      setFormError(msg);
    }
  };

  // Filtered list
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.nameBn && p.nameBn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.slug && p.slug.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Products Management</h1>
          <p className="text-xs text-[#8A7D97] mt-1">
            Create, edit, and manage your products, color variants, pricing combos, and media catalog
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            className="p-2.5 rounded-xl bg-[#211C28] hover:bg-[#2A2332] text-[#8A7D97] hover:text-white border border-[#2E2733] transition-colors"
            title="Refresh Products"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={openNewProductModal}
            className="bg-[#C4587A] hover:bg-[#B24A6B] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-[#C4587A]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={`${cardCls} p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs`}>
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8A7D97] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by product name, category, or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#191520] border border-[#2E2733] focus:border-[#C4587A] text-white rounded-xl pl-10 pr-4 py-2.5 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#191520] border border-[#2E2733] text-white rounded-xl px-3 py-2.5 outline-none cursor-pointer"
          >
            <option value="All">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id || c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className={`${cardCls} overflow-hidden`}>
        {isLoading ? (
          <div className="py-20 text-center text-[#8A7D97] flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#C4587A]" />
            <p className="text-xs">Loading products catalog...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-[#8A7D97] space-y-3">
            <ShoppingBag className="w-10 h-10 mx-auto text-[#4E4357]" />
            <p className="text-sm font-semibold text-white">No products found</p>
            <p className="text-xs text-[#8A7D97]">Try modifying your search filter or click &quot;Add New Product&quot;.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#D8CFE0]">
              <thead className="bg-[#191520] text-[11px] font-bold text-[#8A7D97] uppercase tracking-wider border-b border-[#2E2733]">
                <tr>
                  <th className="py-3.5 px-4">Product Info</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Pricing</th>
                  <th className="py-3.5 px-4">Stock & Variants</th>
                  <th className="py-3.5 px-4">Badges</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E2733]">
                {filteredProducts.map((p) => {
                  const totalStock =
                    p.variants?.reduce((sum, v) => sum + (Number(v.stockCount ?? v.stock ?? 0)), 0) ?? 0;

                  return (
                    <tr key={p.slug} className="hover:bg-[#2A2332]/50 transition-colors">
                      {/* Product Thumbnail & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl bg-[#191520] border border-[#2E2733] overflow-hidden shrink-0">
                            <Image
                              src={p.images?.[0] || '/images/products/hello-kitty-pair.png'}
                              alt={p.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{p.name || p.nameBn}</p>
                            <span className="font-mono text-[10px] text-[#8A7D97]">/{p.slug}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-[#191520] border border-[#2E2733] text-[#D8CFE0] text-[11px] font-medium">
                          {p.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-white text-sm">৳{p.basePrice}</span>
                        {p.originalPrice > p.basePrice && (
                          <span className="font-mono text-[11px] line-through text-[#6E6278] ml-2">
                            ৳{p.originalPrice}
                          </span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-block font-mono font-bold text-[11px] px-2 py-0.5 rounded border ${
                              totalStock <= 5
                                ? 'bg-[#C1495A]/15 text-[#DD8A94] border-[#C1495A]/30'
                                : 'bg-[#6FAE8C]/15 text-[#8FC7A9] border-[#6FAE8C]/30'
                            }`}
                          >
                            {totalStock} in stock
                          </span>
                          <p className="text-[10px] text-[#8A7D97]">
                            {p.variants?.length || 1} variant(s) • {p.combos?.length || 1} package(s)
                          </p>
                        </div>
                      </td>

                      {/* Badges */}
                      <td className="py-3.5 px-4 space-x-1.5">
                        {p.isHeroSlider && (
                          <span className="text-[10px] font-bold bg-[#D3A45E]/15 text-[#E4BC79] px-2 py-0.5 rounded border border-[#D3A45E]/25">
                            Hero Slider
                          </span>
                        )}
                        {p.isFeatured && (
                          <span className="text-[10px] font-bold bg-[#C4587A]/15 text-[#E39BB4] px-2 py-0.5 rounded border border-[#C4587A]/25">
                            Featured
                          </span>
                        )}
                        {!p.isActive && (
                          <span className="text-[10px] font-bold bg-[#6E6278]/20 text-[#A093AC] px-2 py-0.5 rounded border border-[#6E6278]/30">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/products/${p.slug}`}
                            target="_blank"
                            className="p-2 rounded-xl bg-[#191520] hover:bg-[#2A2332] text-[#8A7D97] hover:text-white border border-[#2E2733] transition-colors"
                            title="View Live Product Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => openEditModal(p)}
                            className="px-3 py-1.5 rounded-xl bg-[#2E2733] hover:bg-[#3E3447] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5 text-[#E39BB4]" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${p.name}"?`)) {
                                deleteProductMutation.mutate(p.slug);
                              }
                            }}
                            className="p-2 rounded-xl bg-[#C1495A]/12 hover:bg-[#C1495A] text-[#DD8A94] hover:text-white transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FULL-FEATURED MODAL WITH TABBED STRUCTURE & STRICT VALIDATION */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className={`${cardCls} w-full max-w-4xl p-5 sm:p-7 border border-[#2E2733] space-y-5 max-h-[94vh] flex flex-col`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2E2733] pb-4 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingSlug ? `Edit Product: ${prodName || editingSlug}` : 'Create New Product'}
                </h3>
                <p className="text-xs text-[#8A7D97]">
                  All required fields across the tabs must be filled to enable saving
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#8A7D97] hover:text-white rounded-lg hover:bg-[#2E2733] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs with Validation Badges */}
            <div className="flex items-center gap-1.5 border-b border-[#2E2733] pb-2 shrink-0 overflow-x-auto text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('general')}
                className={`px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'general'
                    ? 'bg-[#C4587A] text-white shadow-md'
                    : 'bg-[#191520] text-[#8A7D97] hover:text-white'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>1. General & Pricing</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isGeneralValid ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                  }`}
                  title={isGeneralValid ? 'Completed' : 'Required fields incomplete'}
                />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('media')}
                className={`px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'media'
                    ? 'bg-[#C4587A] text-white shadow-md'
                    : 'bg-[#191520] text-[#8A7D97] hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>2. Gallery Photos ({prodImages.length})</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isMediaValid ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                  }`}
                  title={isMediaValid ? 'Completed' : 'At least 1 image required'}
                />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('variants')}
                className={`px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'variants'
                    ? 'bg-[#C4587A] text-white shadow-md'
                    : 'bg-[#191520] text-[#8A7D97] hover:text-white'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>3. Variants & Stock ({prodVariants.length})</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isVariantsValid ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                  }`}
                  title={isVariantsValid ? 'Completed' : 'At least 1 valid variant required'}
                />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('combos')}
                className={`px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'combos'
                    ? 'bg-[#C4587A] text-white shadow-md'
                    : 'bg-[#191520] text-[#8A7D97] hover:text-white'
                }`}
              >
                <Percent className="w-3.5 h-3.5" />
                <span>4. Packages / Combos ({prodCombos.length})</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isCombosValid ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                  }`}
                  title={isCombosValid ? 'Completed' : 'At least 1 valid package required'}
                />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('features')}
                className={`px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'features'
                    ? 'bg-[#C4587A] text-white shadow-md'
                    : 'bg-[#191520] text-[#8A7D97] hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>5. Features & Specs</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </button>
            </div>

            {/* Notifications */}
            {formError && (
              <div className="p-3 rounded-xl bg-[#C1495A]/15 border border-[#C1495A]/30 text-xs text-[#DD8A94] shrink-0">
                ⚠️ {formError}
              </div>
            )}
            {formSuccess && (
              <div className="p-3 rounded-xl bg-[#6FAE8C]/15 border border-[#6FAE8C]/30 text-xs text-[#8FC7A9] shrink-0">
                ✓ {formSuccess}
              </div>
            )}

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto pr-1 space-y-6">
              {/* TAB 1: GENERAL INFO */}
              {activeTab === 'general' && (
                <div className="space-y-4 animate-in fade-in">
                  {/* Product Name */}
                  <div>
                    <label className={labelCls}>
                      Product Name <span className="text-[#C4587A]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={prodName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProdName(val);
                        if (!editingSlug) {
                          const autoSlug = val
                            .toLowerCase()
                            .trim()
                            .replace(/[^\w\s-]/g, '')
                            .replace(/[\s_-]+/g, '-')
                            .replace(/^-+|-+$/g, '');
                          setProdSlug(autoSlug);
                        }
                      }}
                      placeholder="e.g. Portable Mini Travel Jewelry Box"
                      className={inputCls}
                    />
                  </div>

                  {/* Slug, Category, Pricing */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className={labelCls}>
                        Slug (URL Path) <span className="text-[#C4587A]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={prodSlug}
                        onChange={(e) => setProdSlug(e.target.value)}
                        placeholder="jewelry-box"
                        className={`${inputCls} text-[#E39BB4] font-mono text-xs font-semibold`}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>
                        Category <span className="text-[#C4587A]">*</span>
                      </label>
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
                            <option key={cat.id || cat._id || i} value={cat.name}>
                              {cat.name}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>
                        Base Price (৳) <span className="text-[#C4587A]">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={prodBasePrice}
                        onChange={(e) => setProdBasePrice(Number(e.target.value))}
                        className={`${inputCls} font-mono`}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>
                        Original Price (৳) <span className="text-[#C4587A]">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={prodOriginalPrice}
                        onChange={(e) => setProdOriginalPrice(Number(e.target.value))}
                        className={`${inputCls} font-mono`}
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
                        <p className="text-[10px] text-[#8A7D97]">Show in Featured Collections</p>
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
                          <span>Hero Slider Pool</span>
                        </label>
                        <p className="text-[10px] text-[#8A7D97]">Enable for Homepage Banner</p>
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
                        <p className="text-[10px] text-[#8A7D97]">Live in Storefront</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={prodIsActive}
                        onChange={(e) => setProdIsActive(e.target.checked)}
                        className="w-5 h-5 accent-[#6FAE8C] rounded cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Subtitle & Description */}
                  <div>
                    <label className={labelCls}>
                      Subtitle / Tagline <span className="text-[#C4587A]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={prodTaglineBn}
                      onChange={(e) => setProdTaglineBn(e.target.value)}
                      placeholder="e.g. শখের গহনা ও প্রসাধন সুরক্ষিত রাখুন নিখুঁত পরিপাটীভাবে — যেকোনো ভ্রমণের সেরা সঙ্গী!"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>
                      Description <span className="text-[#C4587A]">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={prodDescriptionBn}
                      onChange={(e) => setProdDescriptionBn(e.target.value)}
                      placeholder="Write full product description, key features, and package benefits..."
                      className={`${inputCls} resize-none leading-relaxed`}
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: MEDIA GALLERY */}
              {activeTab === 'media' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        Product Photos Gallery <span className="text-[#C4587A]">*</span>
                      </h4>
                      <p className="text-[11px] text-[#8A7D97]">
                        Upload at least 1 high-res product photo. The first image is the primary storefront thumbnail.
                      </p>
                    </div>

                    <label className="bg-[#C4587A] hover:bg-[#B24A6B] text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer">
                      {isUploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                      <span>+ Upload Photo</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e)} />
                    </label>
                  </div>

                  {prodImages.length === 0 ? (
                    <div className="p-8 border border-dashed border-[#3E3447] rounded-2xl text-center space-y-2">
                      <Camera className="w-8 h-8 text-[#6E6278] mx-auto" />
                      <p className="text-xs text-[#8A7D97]">No gallery photos uploaded yet.</p>
                      <p className="text-[11px] text-amber-400">At least 1 product photo is required.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {prodImages.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl bg-[#191520] border border-[#2E2733] overflow-hidden group">
                          <Image src={img} alt={`Product photo ${idx}`} fill className="object-cover" />
                          {idx === 0 && (
                            <span className="absolute top-2 left-2 bg-[#C4587A] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                              Primary
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setProdImages(prodImages.filter((_, i) => i !== idx))}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-rose-400 hover:text-white hover:bg-rose-600 transition-colors cursor-pointer"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: VARIANTS & STOCK */}
              {activeTab === 'variants' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        Variants & Stock <span className="text-[#C4587A]">*</span>
                      </h4>
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
                            stock: 20,
                          },
                        ]);
                      }}
                      className="bg-[#C4587A]/15 hover:bg-[#C4587A] text-[#E39BB4] hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer border border-[#C4587A]/25"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Color</span>
                    </button>
                  </div>

                  {prodVariants.length === 0 ? (
                    <div className="p-8 border border-dashed border-[#3E3447] rounded-2xl text-center space-y-2">
                      <Palette className="w-8 h-8 text-[#6E6278] mx-auto" />
                      <p className="text-xs text-[#8A7D97]">No variants added yet.</p>
                      <p className="text-[11px] text-amber-400">At least 1 variant is required.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {prodVariants.map((v, idx) => (
                        <div
                          key={v.id || idx}
                          className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3.5 rounded-xl bg-[#1C1821] border border-[#2E2733] items-center"
                        >
                          {/* 1. Color Photo Upload */}
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
                                  onChange={(e) => handleImageUpload(e, idx)}
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
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>

                          {/* 2. Color Name with auto hex detection */}
                          <div className="sm:col-span-3">
                            <label className="text-[10px] text-[#8A7D97] block mb-1">
                              Color Name <span className="text-[#C4587A]">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={v.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                setProdVariants((prev) =>
                                  prev.map((item, i) =>
                                    i === idx
                                      ? {
                                          ...item,
                                          name: val,
                                          nameBn: val,
                                          colorHex: detectColorHex(val, item.colorHex),
                                        }
                                      : item
                                  )
                                );
                              }}
                              placeholder="e.g. Soft Pink"
                              className="w-full px-2.5 py-1.5 bg-[#14111A] border border-[#2E2733] rounded-lg text-white text-xs"
                            />
                          </div>

                          {/* 3. Color Hex */}
                          <div className="sm:col-span-3">
                            <label className="text-[10px] text-[#8A7D97] block mb-1">Color Hex</label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="color"
                                value={v.colorHex || '#F9A8D4'}
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
                              value={v.stockCount ?? v.stock ?? 0}
                              onChange={(e) => {
                                const cnt = Number(e.target.value);
                                setProdVariants((prev) =>
                                  prev.map((item, i) =>
                                    i === idx ? { ...item, stockCount: cnt, stock: cnt, inStock: cnt > 0 } : item
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
                                checked={v.inStock !== false}
                                onChange={(e) => {
                                  const chk = e.target.checked;
                                  setProdVariants((prev) =>
                                    prev.map((item, i) => (i === idx ? { ...item, inStock: chk } : item))
                                  );
                                }}
                                className="accent-[#C4587A] rounded"
                              />
                              <span>{v.inStock !== false ? 'In Stock' : 'Out'}</span>
                            </label>

                            {prodVariants.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setProdVariants((prev) => prev.filter((_, i) => i !== idx))}
                                className="p-1.5 text-[#6E6278] hover:text-[#DD8A94] transition-colors cursor-pointer"
                                title="Delete Variant"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: PACKAGES & COMBOS */}
              {activeTab === 'combos' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white text-xs">
                        Packages <span className="text-[#C4587A]">*</span>
                      </h3>
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

                  {prodCombos.length === 0 ? (
                    <div className="p-8 border border-dashed border-[#3E3447] rounded-2xl text-center space-y-2">
                      <Percent className="w-8 h-8 text-[#6E6278] mx-auto" />
                      <p className="text-xs text-[#8A7D97]">No combo packages created yet.</p>
                      <p className="text-[11px] text-amber-400">At least 1 pricing package is required.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {prodCombos.map((c, idx) => (
                        <div
                          key={c.id || idx}
                          className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 rounded-xl bg-[#1C1821] border border-[#2E2733] items-center text-xs"
                        >
                          <div className="sm:col-span-4">
                            <label className="text-[10px] text-[#8A7D97] block">
                              Combo Title <span className="text-[#C4587A]">*</span>
                            </label>
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
                            <label className="text-[10px] text-[#8A7D97] block">
                              Qty <span className="text-[#C4587A]">*</span>
                            </label>
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
                              className="w-full px-2 py-1 bg-[#14111A] border border-[#2E2733] rounded-lg text-white text-xs font-mono"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="text-[10px] text-[#8A7D97] block">
                              Deal Price (৳) <span className="text-[#C4587A]">*</span>
                            </label>
                            <input
                              type="number"
                              required
                              min="1"
                              value={c.price}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setProdCombos((prev) =>
                                  prev.map((item, i) => (i === idx ? { ...item, price: val } : item))
                                );
                              }}
                              className="w-full px-2 py-1 bg-[#14111A] border border-[#2E2733] rounded-lg text-white text-xs font-mono font-bold"
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
                                className="p-1 text-[#6E6278] hover:text-[#DD8A94] mt-3 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: FEATURES & SPECIFICATIONS */}
              {activeTab === 'features' && (
                <div className="space-y-6 animate-in fade-in">
                  {/* Features Highlights */}
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
                      {prodFeaturesBn.map((f, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 rounded-xl bg-[#1C1821] border border-[#2E2733] items-center text-xs"
                        >
                          <div className="sm:col-span-4">
                            <input
                              type="text"
                              value={f.title}
                              placeholder="Title (e.g. ওয়াটারপ্রুফ লেদার)"
                              onChange={(e) => {
                                const val = e.target.value;
                                setProdFeaturesBn((prev) =>
                                  prev.map((item, i) => (i === idx ? { ...item, title: val } : item))
                                );
                              }}
                              className="w-full px-2 py-1 bg-[#14111A] border border-[#2E2733] rounded-lg text-white text-xs font-semibold"
                            />
                          </div>

                          <div className="sm:col-span-7">
                            <input
                              type="text"
                              value={f.description}
                              placeholder="Description (e.g. দীর্ঘস্থায়ী ওয়াটারপ্রুফ সুরক্ষা)"
                              onChange={(e) => {
                                const val = e.target.value;
                                setProdFeaturesBn((prev) =>
                                  prev.map((item, i) => (i === idx ? { ...item, description: val } : item))
                                );
                              }}
                              className="w-full px-2 py-1 bg-[#14111A] border border-[#2E2733] rounded-lg text-white text-xs"
                            />
                          </div>

                          <div className="sm:col-span-1 text-right">
                            <button
                              type="button"
                              onClick={() => setProdFeaturesBn((prev) => prev.filter((_, i) => i !== idx))}
                              className="p-1 text-[#6E6278] hover:text-[#DD8A94] cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="bg-[#14111A] p-4 rounded-2xl border border-[#2E2733] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-white text-xs">Specifications</h3>
                        <p className="text-[11px] text-[#8A7D97]">Add technical specification rows (Material, Size, Weight, etc.)</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setProdSpecificationsBn((prev) => [
                            ...prev,
                            { key: 'বৈশিষ্ট্য', value: 'মান' },
                          ]);
                        }}
                        className="bg-[#211C28] hover:bg-[#2A2430] text-[#D8CFE0] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer border border-[#2E2733]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Row</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {prodSpecificationsBn.map((s, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 rounded-xl bg-[#1C1821] border border-[#2E2733] items-center text-xs"
                        >
                          <div className="sm:col-span-4">
                            <input
                              type="text"
                              value={s.key}
                              placeholder="Key (e.g. মেটেরিয়াল)"
                              onChange={(e) => {
                                const val = e.target.value;
                                setProdSpecificationsBn((prev) =>
                                  prev.map((item, i) => (i === idx ? { ...item, key: val } : item))
                                );
                              }}
                              className="w-full px-2 py-1 bg-[#14111A] border border-[#2E2733] rounded-lg text-white text-xs font-semibold"
                            />
                          </div>

                          <div className="sm:col-span-7">
                            <input
                              type="text"
                              value={s.value}
                              placeholder="Value (e.g. প্রিমিয়াম PU লেদার)"
                              onChange={(e) => {
                                const val = e.target.value;
                                setProdSpecificationsBn((prev) =>
                                  prev.map((item, i) => (i === idx ? { ...item, value: val } : item))
                                );
                              }}
                              className="w-full px-2 py-1 bg-[#14111A] border border-[#2E2733] rounded-lg text-white text-xs"
                            />
                          </div>

                          <div className="sm:col-span-1 text-right">
                            <button
                              type="button"
                              onClick={() => setProdSpecificationsBn((prev) => prev.filter((_, i) => i !== idx))}
                              className="p-1 text-[#6E6278] hover:text-[#DD8A94] cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-[#2E2733] shrink-0">
                <div className="flex items-center gap-2">
                  {activeTab !== 'general' && (
                    <button
                      type="button"
                      onClick={() => {
                        const idx = TABS.indexOf(activeTab);
                        if (idx > 0) setActiveTab(TABS[idx - 1]);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#191520] hover:bg-[#2A2332] text-[#8A7D97] hover:text-white text-xs font-semibold border border-[#2E2733] cursor-pointer"
                    >
                      ← Previous Tab
                    </button>
                  )}
                  {activeTab !== 'features' && (
                    <button
                      type="button"
                      onClick={() => {
                        const idx = TABS.indexOf(activeTab);
                        if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1]);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#2E2733] hover:bg-[#3E3447] text-white text-xs font-semibold cursor-pointer"
                    >
                      Next Tab →
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3">
                  {!isFormValid && (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-400/90 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Fill all required fields (*)</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-[#191520] hover:bg-[#2A2332] text-white text-xs font-semibold border border-[#2E2733] cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={!isFormValid || saveProductMutation.isPending}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      isFormValid && !saveProductMutation.isPending
                        ? 'bg-[#C4587A] hover:bg-[#B24A6B] text-white shadow-lg shadow-[#C4587A]/25 cursor-pointer active:scale-98'
                        : 'bg-[#2E2733] text-[#6E6278] border border-[#3E3447] cursor-not-allowed opacity-60'
                    }`}
                    title={
                      !isFormValid
                        ? 'Fill in all required fields across the tabs to enable saving'
                        : 'Save and publish product'
                    }
                  >
                    {saveProductMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>Save Product</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
