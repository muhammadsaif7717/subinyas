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
} from 'lucide-react';
import { Product, ProductVariant, ComboOption } from '@/lib/types';
import { CategoryItem } from '@/app/api/categories/route';

type TabType = 'general' | 'media' | 'variants' | 'combos' | 'features';
const TABS: TabType[] = ['general', 'media', 'variants', 'combos', 'features'];

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const cardCls = 'bg-[#211C28] rounded-2xl border border-[#2E2733]';

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
  const [prodIsHeroSlider, setProdIsHeroSlider] = useState<boolean>(false);
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

  // Reset / Open Modal for New Product
  const openNewProductModal = () => {
    setEditingSlug(null);
    setActiveTab('general');
    setFormError('');
    setFormSuccess('');
    setProdName('');
    setProdNameBn('');
    setProdSlug('');
    setProdCategory(categories[0]?.name || 'Organizers');
    setProdTaglineBn('শখের গহনা ও প্রসাধন সুরক্ষিত রাখুন নিখুঁত পরিপাটীভাবে — যেকোনো ভ্রমণের সেরা সঙ্গী!');
    setProdDescriptionBn('প্রিমিয়াম কোয়ালিটির দীর্ঘস্থায়ী ওয়াটারপ্রুফ মেটেরিয়াল দিয়ে তৈরি কম্প্যাক্ট ট্রাভেল জুয়েলারি বক্স।');
    setProdBasePrice(499);
    setProdOriginalPrice(800);
    setProdIsFeatured(true);
    setProdIsHeroSlider(false);
    setProdIsActive(true);
    setProdImages(['/images/products/hello-kitty-pair.png', '/images/products/hello-kitty-open.png']);
    setProdVariants([
      {
        id: 'var-1',
        name: 'Soft Pink',
        nameBn: 'সফট পিঙ্ক (Baby Pink)',
        color: 'Baby Pink',
        colorHex: '#f9a8d4',
        image: '/images/products/hello-kitty-pair.png',
        inStock: true,
        stockCount: 50,
        stock: 50,
        isDefault: true,
      },
      {
        id: 'var-2',
        name: 'Pearl White',
        nameBn: 'পার্ল হোয়াইট (Pearl White)',
        color: 'Pearl White',
        colorHex: '#f8fafc',
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
        titleBn: '১টি জুয়েলারি বক্স (সিঙ্গেল প্যাক)',
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
        titleBn: '২টি বক্স বেস্টি কম্বো (Best Deal)',
        subtitleBn: '১টি আপনার জন্য + ১টি প্রিয় বান্ধবীর জন্য',
        quantity: 2,
        price: 899,
        originalPrice: 1600,
        badge: '🔥 সর্বাধিক বিক্রিত অফার (Save ৳১০০ Extra)',
        savingsBn: 'Save ৳701 (সেরা ডিল)',
        isPopular: true,
      },
      {
        id: 'combo-trio',
        title: 'Mega Gift Pack (3 Pieces)',
        titleBn: '৩টি বক্স মেগা ফ্যামিলি প্যাক',
        subtitleBn: 'গিফটিং ও ট্রাভেলের সেরা প্যাকেজ',
        quantity: 3,
        price: 1249,
        originalPrice: 2400,
        badge: '🎁 মেগা সেভিংস অফার',
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
    setProdName(p.name || '');
    setProdNameBn(p.nameBn || '');
    setProdSlug(p.slug || '');
    setProdCategory(p.category || 'Organizers');
    setProdTaglineBn(p.taglineBn || '');
    setProdDescriptionBn(p.descriptionBn || '');
    setProdBasePrice(p.basePrice || 499);
    setProdOriginalPrice(p.originalPrice || 800);
    setProdIsFeatured(p.isFeatured !== false);
    setProdIsHeroSlider(p.isHeroSlider === true);
    setProdIsActive(p.isActive !== false);
    setProdImages(p.images && p.images.length > 0 ? p.images : ['/images/products/hello-kitty-pair.png']);
    setProdVariants(
      p.variants && p.variants.length > 0
        ? p.variants
        : [
            {
              id: 'var-1',
              name: 'Standard',
              nameBn: 'স্ট্যান্ডার্ড',
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
              titleBn: '১টি বক্স (সিঙ্গেল প্যাক)',
              subtitleBn: 'স্ট্যান্ডার্ড প্যাক',
              quantity: 1,
              price: p.basePrice || 499,
              originalPrice: p.originalPrice || 800,
              savingsBn: 'Save ৳301',
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

  // Image Upload
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

  // Handle Form Submit
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!prodName.trim() || !prodSlug.trim()) {
      setFormError('Product Name and Slug are required.');
      return;
    }

    const payload: Partial<Product> = {
      name: prodName.trim(),
      nameBn: prodNameBn.trim() || prodName.trim(),
      slug: prodSlug.toLowerCase().trim().replace(/[^a-z0-9-_]/g, '-'),
      category: prodCategory,
      taglineBn: prodTaglineBn.trim(),
      descriptionBn: prodDescriptionBn.trim(),
      basePrice: Number(prodBasePrice) || 499,
      originalPrice: Number(prodOriginalPrice) || 800,
      isFeatured: prodIsFeatured,
      isHeroSlider: prodIsHeroSlider,
      isActive: prodIsActive,
      images: prodImages.length > 0 ? prodImages : ['/images/products/hello-kitty-pair.png'],
      variants: prodVariants,
      combos: prodCombos,
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
            placeholder="Search by product name, Bengali title, or slug..."
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
              <option key={c.id} value={c.name}>
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
                      {/* Product Thumbnail & Names */}
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
                            <p className="font-bold text-white text-sm">{p.name}</p>
                            {p.nameBn && <p className="text-xs text-[#E39BB4] font-medium">{p.nameBn}</p>}
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
                            {p.variants?.length || 1} variant(s) • {p.combos?.length || 1} combo(s)
                          </p>
                        </div>
                      </td>

                      {/* Flags */}
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

      {/* FULL-FEATURED MODAL (General, Media, Variants, Combos, Features) */}
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
                  Configure product details, gallery images, variants, discount packages, and features
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

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-1.5 border-b border-[#2E2733] pb-2 shrink-0 overflow-x-auto text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('general')}
                className={`px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'general'
                    ? 'bg-[#C4587A] text-white shadow-md'
                    : 'bg-[#191520] text-[#8A7D97] hover:text-white'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>General Info & Pricing</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('media')}
                className={`px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'media'
                    ? 'bg-[#C4587A] text-white shadow-md'
                    : 'bg-[#191520] text-[#8A7D97] hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Gallery Images ({prodImages.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('variants')}
                className={`px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'variants'
                    ? 'bg-[#C4587A] text-white shadow-md'
                    : 'bg-[#191520] text-[#8A7D97] hover:text-white'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Color Variants ({prodVariants.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('combos')}
                className={`px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'combos'
                    ? 'bg-[#C4587A] text-white shadow-md'
                    : 'bg-[#191520] text-[#8A7D97] hover:text-white'
                }`}
              >
                <Percent className="w-3.5 h-3.5" />
                <span>Combo Offers ({prodCombos.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('features')}
                className={`px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'features'
                    ? 'bg-[#C4587A] text-white shadow-md'
                    : 'bg-[#191520] text-[#8A7D97] hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Features & Specs</span>
              </button>
            </div>

            {/* Error / Success Notifications */}
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

            {/* Form Content Body (Scrollable) */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto pr-1 space-y-6">
              {/* TAB 1: GENERAL INFO */}
              {activeTab === 'general' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white">
                        Product Name (English) <span className="text-[#C4587A]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={prodName}
                        onChange={(e) => {
                          setProdName(e.target.value);
                          if (!editingSlug) {
                            setProdSlug(e.target.value.toLowerCase().trim().replace(/[^a-z0-9]/g, '-'));
                          }
                        }}
                        placeholder="e.g. Mini Portable Travel Jewelry Box"
                        className="w-full bg-[#191520] border border-[#2E2733] focus:border-[#C4587A] text-xs text-white rounded-xl px-3.5 py-2.5 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white">
                        Product Name (Bengali) <span className="text-[#C4587A]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={prodNameBn}
                        onChange={(e) => setProdNameBn(e.target.value)}
                        placeholder="e.g. প্রিমিয়াম মিনি পোর্টেবল ট্রাভেল জুয়েলারি বক্স"
                        className="w-full bg-[#191520] border border-[#2E2733] focus:border-[#C4587A] text-xs text-white rounded-xl px-3.5 py-2.5 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white">
                        Product Slug (URL Path) <span className="text-[#C4587A]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={prodSlug}
                        onChange={(e) => setProdSlug(e.target.value)}
                        placeholder="e.g. jewelry-box"
                        className="w-full bg-[#191520] border border-[#2E2733] focus:border-[#C4587A] text-xs text-white rounded-xl px-3.5 py-2.5 outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white">
                        Category <span className="text-[#C4587A]">*</span>
                      </label>
                      <select
                        required
                        value={prodCategory}
                        onChange={(e) => setProdCategory(e.target.value)}
                        className="w-full bg-[#191520] border border-[#2E2733] focus:border-[#C4587A] text-xs text-white rounded-xl px-3.5 py-2.5 outline-none cursor-pointer"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white">
                        Base Price (৳ Offer Price) <span className="text-[#C4587A]">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        value={prodBasePrice}
                        onChange={(e) => setProdBasePrice(Number(e.target.value))}
                        className="w-full bg-[#191520] border border-[#2E2733] focus:border-[#C4587A] text-xs text-white rounded-xl px-3.5 py-2.5 outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white">
                        Original Price (৳ Regular Price) <span className="text-[#C4587A]">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        value={prodOriginalPrice}
                        onChange={(e) => setProdOriginalPrice(Number(e.target.value))}
                        className="w-full bg-[#191520] border border-[#2E2733] focus:border-[#C4587A] text-xs text-white rounded-xl px-3.5 py-2.5 outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Bengali Tagline & Description */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white">
                      Subtitle / Tagline (Bengali) <span className="text-[#C4587A]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={prodTaglineBn}
                      onChange={(e) => setProdTaglineBn(e.target.value)}
                      placeholder="e.g. শখের গহনা ও প্রসাধন সুরক্ষিত রাখুন নিখুঁত পরিপাটীভাবে"
                      className="w-full bg-[#191520] border border-[#2E2733] focus:border-[#C4587A] text-xs text-white rounded-xl px-3.5 py-2.5 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white">
                      Full Product Description (Bengali) <span className="text-[#C4587A]">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={prodDescriptionBn}
                      onChange={(e) => setProdDescriptionBn(e.target.value)}
                      placeholder="বিস্তারিত পণ্যের বিবরণ লিখুন..."
                      className="w-full bg-[#191520] border border-[#2E2733] focus:border-[#C4587A] text-xs text-white rounded-xl px-3.5 py-2.5 outline-none resize-none leading-relaxed"
                    />
                  </div>

                  {/* Visibility Toggles */}
                  <div className="p-4 bg-[#191520] rounded-xl border border-[#2E2733] grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
                      <input
                        type="checkbox"
                        checked={prodIsFeatured}
                        onChange={(e) => setProdIsFeatured(e.target.checked)}
                        className="rounded accent-[#C4587A] w-4 h-4"
                      />
                      <span>Featured Product</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
                      <input
                        type="checkbox"
                        checked={prodIsHeroSlider}
                        onChange={(e) => setProdIsHeroSlider(e.target.checked)}
                        className="rounded accent-[#C4587A] w-4 h-4"
                      />
                      <span>Hero Slider Pool</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
                      <input
                        type="checkbox"
                        checked={prodIsActive}
                        onChange={(e) => setProdIsActive(e.target.checked)}
                        className="rounded accent-[#C4587A] w-4 h-4"
                      />
                      <span>Active in Live Store</span>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: MEDIA GALLERY */}
              {activeTab === 'media' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Product Image Gallery</h4>
                      <p className="text-[11px] text-[#8A7D97]">Upload high resolution images. First image is the main thumbnail.</p>
                    </div>

                    <label className="bg-[#C4587A] hover:bg-[#B24A6B] text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer">
                      {isUploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                      <span>Upload Image</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e)} />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {prodImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl bg-[#191520] border border-[#2E2733] overflow-hidden group">
                        <Image src={img} alt={`Product ${idx}`} fill className="object-cover" />
                        {idx === 0 && (
                          <span className="absolute top-2 left-2 bg-[#C4587A] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            Primary
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setProdImages(prodImages.filter((_, i) => i !== idx))}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-rose-400 hover:text-white hover:bg-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: COLOR VARIANTS */}
              {activeTab === 'variants' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Color & Style Variants</h4>
                      <p className="text-[11px] text-[#8A7D97]">Manage colors, stock quantities, and variant images</p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setProdVariants([
                          ...prodVariants,
                          {
                            id: `var-${Date.now()}`,
                            name: 'New Color',
                            nameBn: 'নতুন কালার',
                            color: 'Pink',
                            colorHex: '#f9a8d4',
                            image: prodImages[0] || '/images/products/hello-kitty-pair.png',
                            inStock: true,
                            stockCount: 20,
                            stock: 20,
                          },
                        ])
                      }
                      className="bg-[#2E2733] hover:bg-[#3E3447] text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Variant</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {prodVariants.map((v, vIdx) => (
                      <div key={v.id || vIdx} className="p-3.5 bg-[#191520] rounded-xl border border-[#2E2733] flex flex-col sm:flex-row items-center gap-3">
                        {/* Variant Image Preview + Upload */}
                        <div className="relative w-14 h-14 rounded-xl bg-[#211C28] border border-[#2E2733] overflow-hidden shrink-0 group">
                          <Image src={v.image || '/images/products/hello-kitty-pair.png'} alt={v.name} fill className="object-cover" />
                          <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                            {uploadingVariantIdx === vIdx ? (
                              <Loader2 className="w-4 h-4 text-white animate-spin" />
                            ) : (
                              <Camera className="w-4 h-4 text-white" />
                            )}
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, vIdx)} />
                          </label>
                        </div>

                        {/* Variant Names */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 w-full">
                          <input
                            type="text"
                            placeholder="Variant Name (En)"
                            value={v.name}
                            onChange={(e) => {
                              const updated = [...prodVariants];
                              updated[vIdx].name = e.target.value;
                              setProdVariants(updated);
                            }}
                            className="bg-[#211C28] border border-[#2E2733] text-xs text-white rounded-lg px-2.5 py-1.5 outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Variant Name (Bn)"
                            value={v.nameBn || ''}
                            onChange={(e) => {
                              const updated = [...prodVariants];
                              updated[vIdx].nameBn = e.target.value;
                              setProdVariants(updated);
                            }}
                            className="bg-[#211C28] border border-[#2E2733] text-xs text-white rounded-lg px-2.5 py-1.5 outline-none"
                          />
                        </div>

                        {/* Color Hex & Stock Count */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <input
                            type="color"
                            value={v.colorHex || '#f9a8d4'}
                            onChange={(e) => {
                              const updated = [...prodVariants];
                              updated[vIdx].colorHex = e.target.value;
                              setProdVariants(updated);
                            }}
                            className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"
                            title="Pick Color"
                          />

                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-[#8A7D97]">Stock:</span>
                            <input
                              type="number"
                              value={v.stockCount ?? v.stock ?? 0}
                              onChange={(e) => {
                                const updated = [...prodVariants];
                                const cnt = Number(e.target.value);
                                updated[vIdx].stockCount = cnt;
                                updated[vIdx].stock = cnt;
                                updated[vIdx].inStock = cnt > 0;
                                setProdVariants(updated);
                              }}
                              className="w-16 bg-[#211C28] border border-[#2E2733] text-xs text-white rounded-lg px-2 py-1 outline-none font-mono text-center"
                            />
                          </div>

                          <label className="flex items-center gap-1 cursor-pointer text-[11px] text-white">
                            <input
                              type="checkbox"
                              checked={v.inStock !== false}
                              onChange={(e) => {
                                const updated = [...prodVariants];
                                updated[vIdx].inStock = e.target.checked;
                                setProdVariants(updated);
                              }}
                              className="accent-[#C4587A]"
                            />
                            <span>In Stock</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => setProdVariants(prodVariants.filter((_, i) => i !== vIdx))}
                            className="p-1.5 text-[#8A7D97] hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: COMBO OFFERS */}
              {activeTab === 'combos' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Combo Pricing & Quantity Packages</h4>
                      <p className="text-[11px] text-[#8A7D97]">Set discounted bundles (1 pack, 2 pack saver, 3 pack mega gift)</p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setProdCombos([
                          ...prodCombos,
                          {
                            id: `combo-${Date.now()}`,
                            title: 'New Combo Pack',
                            titleBn: 'নতুন কম্বো প্যাক',
                            subtitleBn: 'বিশেষ সেভিংস অফার',
                            quantity: 2,
                            price: 899,
                            originalPrice: 1600,
                            savingsBn: 'Save ৳701',
                            isPopular: false,
                          },
                        ])
                      }
                      className="bg-[#2E2733] hover:bg-[#3E3447] text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Combo</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {prodCombos.map((c, cIdx) => (
                      <div key={c.id || cIdx} className="p-3.5 bg-[#191520] rounded-xl border border-[#2E2733] space-y-2.5">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Title (Bn) e.g. ১টি জুয়েলারি বক্স"
                            value={c.titleBn}
                            onChange={(e) => {
                              const updated = [...prodCombos];
                              updated[cIdx].titleBn = e.target.value;
                              setProdCombos(updated);
                            }}
                            className="bg-[#211C28] border border-[#2E2733] text-xs text-white rounded-lg px-2.5 py-1.5 outline-none font-bold"
                          />
                          <input
                            type="text"
                            placeholder="Subtitle (Bn) e.g. নিজের জন্য বা ছোট উপহারের জন্য"
                            value={c.subtitleBn}
                            onChange={(e) => {
                              const updated = [...prodCombos];
                              updated[cIdx].subtitleBn = e.target.value;
                              setProdCombos(updated);
                            }}
                            className="bg-[#211C28] border border-[#2E2733] text-xs text-white rounded-lg px-2.5 py-1.5 outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Savings text e.g. Save ৳301"
                            value={c.savingsBn}
                            onChange={(e) => {
                              const updated = [...prodCombos];
                              updated[cIdx].savingsBn = e.target.value;
                              setProdCombos(updated);
                            }}
                            className="bg-[#211C28] border border-[#2E2733] text-xs text-white rounded-lg px-2.5 py-1.5 outline-none text-[#E39BB4]"
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-[#8A7D97]">Qty:</span>
                            <input
                              type="number"
                              value={c.quantity}
                              onChange={(e) => {
                                const updated = [...prodCombos];
                                updated[cIdx].quantity = Number(e.target.value);
                                setProdCombos(updated);
                              }}
                              className="w-14 bg-[#211C28] border border-[#2E2733] text-xs text-white rounded-lg px-2 py-1 outline-none font-mono text-center"
                            />
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-[#8A7D97]">Offer ৳:</span>
                            <input
                              type="number"
                              value={c.price}
                              onChange={(e) => {
                                const updated = [...prodCombos];
                                updated[cIdx].price = Number(e.target.value);
                                setProdCombos(updated);
                              }}
                              className="w-20 bg-[#211C28] border border-[#2E2733] text-xs text-white rounded-lg px-2 py-1 outline-none font-mono font-bold"
                            />
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-[#8A7D97]">Original ৳:</span>
                            <input
                              type="number"
                              value={c.originalPrice}
                              onChange={(e) => {
                                const updated = [...prodCombos];
                                updated[cIdx].originalPrice = Number(e.target.value);
                                setProdCombos(updated);
                              }}
                              className="w-20 bg-[#211C28] border border-[#2E2733] text-xs text-white rounded-lg px-2 py-1 outline-none font-mono line-through text-[#8A7D97]"
                            />
                          </div>

                          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-amber-300">
                            <input
                              type="checkbox"
                              checked={c.isPopular === true}
                              onChange={(e) => {
                                const updated = [...prodCombos];
                                updated[cIdx].isPopular = e.target.checked;
                                setProdCombos(updated);
                              }}
                              className="accent-amber-400"
                            />
                            <span>Popular Deal Badge</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => setProdCombos(prodCombos.filter((_, i) => i !== cIdx))}
                            className="p-1 text-[#8A7D97] hover:text-rose-400 ml-auto cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: FEATURES & SPECIFICATIONS */}
              {activeTab === 'features' && (
                <div className="space-y-6 animate-in fade-in">
                  {/* Highlights */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white">Highlighted Features (Bengali)</h4>
                      <button
                        type="button"
                        onClick={() =>
                          setProdFeaturesBn([
                            ...prodFeaturesBn,
                            { icon: 'Sparkles', title: 'নতুন বৈশিষ্ট্য', description: 'বৈশিষ্ট্যের বিবরণ লিখুন...' },
                          ])
                        }
                        className="bg-[#2E2733] hover:bg-[#3E3447] text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Feature</span>
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {prodFeaturesBn.map((f, fIdx) => (
                        <div key={fIdx} className="p-3 bg-[#191520] rounded-xl border border-[#2E2733] flex items-start gap-2.5">
                          <input
                            type="text"
                            placeholder="Title"
                            value={f.title}
                            onChange={(e) => {
                              const updated = [...prodFeaturesBn];
                              updated[fIdx].title = e.target.value;
                              setProdFeaturesBn(updated);
                            }}
                            className="w-1/3 bg-[#211C28] border border-[#2E2733] text-xs text-white rounded-lg px-2.5 py-1.5 outline-none font-bold"
                          />
                          <input
                            type="text"
                            placeholder="Description"
                            value={f.description}
                            onChange={(e) => {
                              const updated = [...prodFeaturesBn];
                              updated[fIdx].description = e.target.value;
                              setProdFeaturesBn(updated);
                            }}
                            className="flex-1 bg-[#211C28] border border-[#2E2733] text-xs text-white rounded-lg px-2.5 py-1.5 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setProdFeaturesBn(prodFeaturesBn.filter((_, i) => i !== fIdx))}
                            className="p-1.5 text-[#8A7D97] hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white">Technical Specifications Table</h4>
                      <button
                        type="button"
                        onClick={() =>
                          setProdSpecificationsBn([
                            ...prodSpecificationsBn,
                            { key: 'বৈশিষ্ট্য', value: 'মান' },
                          ])
                        }
                        className="bg-[#2E2733] hover:bg-[#3E3447] text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Spec Row</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {prodSpecificationsBn.map((s, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Key (e.g. মেটেরিয়াল)"
                            value={s.key}
                            onChange={(e) => {
                              const updated = [...prodSpecificationsBn];
                              updated[sIdx].key = e.target.value;
                              setProdSpecificationsBn(updated);
                            }}
                            className="w-1/3 bg-[#191520] border border-[#2E2733] text-xs text-white rounded-lg px-2.5 py-1.5 outline-none font-medium"
                          />
                          <input
                            type="text"
                            placeholder="Value (e.g. প্রিমিয়াম PU লেদার)"
                            value={s.value}
                            onChange={(e) => {
                              const updated = [...prodSpecificationsBn];
                              updated[sIdx].value = e.target.value;
                              setProdSpecificationsBn(updated);
                            }}
                            className="flex-1 bg-[#191520] border border-[#2E2733] text-xs text-white rounded-lg px-2.5 py-1.5 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setProdSpecificationsBn(prodSpecificationsBn.filter((_, i) => i !== sIdx))}
                            className="p-1.5 text-[#8A7D97] hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-[#2E2733] shrink-0">
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

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-[#191520] hover:bg-[#2A2332] text-white text-xs font-semibold border border-[#2E2733] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveProductMutation.isPending}
                    className="px-6 py-2.5 rounded-xl bg-[#C4587A] hover:bg-[#B24A6B] text-white text-xs font-bold shadow-lg shadow-[#C4587A]/25 transition-all flex items-center gap-2 cursor-pointer"
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
