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
  Layers,
  AlertCircle,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { Product, ProductVariant, ComboOption } from '@/lib/types';
import { CategoryItem } from '@/app/api/categories/route';

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const cardCls = 'bg-[#211C28] rounded-2xl border border-[#2E2733]';

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
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

  // Reset / Open Modal
  const openNewProductModal = () => {
    setEditingSlug(null);
    setFormError('');
    setFormSuccess('');
    setProdName('');
    setProdNameBn('');
    setProdSlug('');
    setProdCategory(categories[0]?.name || 'Organizers');
    setProdTaglineBn('পরিচ্ছন্ন ও নান্দনিক অর্গানাইজার');
    setProdDescriptionBn('প্রিমিয়াম কোয়ালিটির দীর্ঘস্থায়ী প্রোডাক্ট।');
    setProdBasePrice(499);
    setProdOriginalPrice(800);
    setProdIsFeatured(true);
    setProdIsHeroSlider(false);
    setProdIsActive(true);
    setProdImages(['/images/products/hello-kitty-pair.png']);
    setProdVariants([
      {
        id: 'var-1',
        name: 'Pink',
        nameBn: 'গোলাপি',
        colorCode: '#FFB6C1',
        image: '/images/products/hello-kitty-pink.png',
        inStock: true,
        stockCount: 50,
        stock: 50,
        isDefault: true,
      },
    ]);
    setProdCombos([
      {
        id: 'combo-single',
        title: 'Single Pack',
        titleBn: '১ টি (একক প্যাকেজ)',
        subtitleBn: 'স্ট্যান্ডার্ড প্যাকেজ',
        quantity: 1,
        price: 499,
        originalPrice: 800,
        savingsBn: 'Save ৳301',
        isPopular: false,
      },
      {
        id: 'combo-pair',
        title: 'Double Saver',
        titleBn: '২ টি (ডাবল সেভার প্যাক)',
        subtitleBn: 'সবচেয়ে জনপ্রিয় প্যাকেজ',
        quantity: 2,
        price: 899,
        originalPrice: 1600,
        savingsBn: 'Save ৳701',
        isPopular: true,
      },
    ]);
    setProdFeaturesBn([
      { icon: 'Shield', title: 'প্রিমিয়াম কোয়ালিটি', description: 'দীর্ঘস্থায়ী উপাদান দিয়ে তৈরি।' },
      { icon: 'Sparkles', title: 'নান্দনিক ডিজাইন', description: 'প্রতিদিনের ব্যবহারে সর্বোচ্চ সুবিধা।' },
    ]);
    setProdSpecificationsBn([
      { key: 'উপাদান', value: 'হাই-কোয়ালিটি পিইউ লেদার' },
      { key: 'সাইজ', value: '10cm x 10cm x 5cm' },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingSlug(p.slug);
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
    setProdImages(p.images || []);
    setProdVariants(p.variants || []);
    setProdCombos(p.combos || []);
    setProdFeaturesBn(p.featuresBn || []);
    setProdSpecificationsBn(p.specificationsBn || []);
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
      alert('Failed to upload image.');
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

    try {
      await saveProductMutation.mutateAsync(payload);
      setFormSuccess('Product saved successfully!');
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess('');
      }, 800);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save product.');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.slug || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${cardCls} p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#E39BB4]" />
            <span>Products & Stock Management</span>
          </h2>
          <p className="text-xs text-[#8A7D97] mt-0.5">
            Create new store items, track inventory levels, configure combos, and manage variations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openNewProductModal}
            className="px-4 py-2.5 rounded-xl bg-[#C4587A] hover:bg-[#B24A6B] text-white text-xs font-bold shadow-lg shadow-[#C4587A]/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className={`${cardCls} p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#8A7D97]">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#191520] border border-[#2E2733] text-xs text-white rounded-xl px-3 py-1.5 outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A7D97]" />
          <input
            type="text"
            placeholder="Search products by title or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#191520] border border-[#2E2733] focus:border-[#C4587A] text-xs text-white rounded-xl pl-9 pr-3 py-2 outline-none"
          />
        </div>
      </div>

      {/* Products Grid / Table */}
      <div className={`${cardCls} overflow-hidden`}>
        {isLoading ? (
          <div className="py-20 text-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#C4587A]" />
            <p className="text-xs text-[#8A7D97]">Loading products catalog...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <ShoppingBag className="w-8 h-8 mx-auto text-[#8A7D97]" />
            <p className="text-xs text-[#8A7D97]">No products found in this category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#2E2733] text-[#8A7D97] font-semibold bg-[#1C1822]">
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price / Promo</th>
                  <th className="py-3.5 px-4">Variants & Stock</th>
                  <th className="py-3.5 px-4">Flags</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E2733]/60">
                {filteredProducts.map((p) => {
                  const totalStock = p.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) ?? 50;

                  return (
                    <tr key={p.slug} className="hover:bg-[#282230]/40 transition-colors">
                      {/* Product Thumbnail & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#191520] border border-[#2E2733] shrink-0">
                            <Image
                              src={p.images?.[0] || '/images/products/hello-kitty-pair.png'}
                              alt={p.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{p.name || p.nameBn}</p>
                            <span className="font-mono text-[11px] text-[#8A7D97]">/{p.slug}</span>
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
                            {p.variants?.length || 1} variant(s)
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

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className={`${cardCls} w-full max-w-3xl p-6 border border-[#2E2733] space-y-6 max-h-[92vh] overflow-y-auto`}>
            <div className="flex items-center justify-between border-b border-[#2E2733] pb-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingSlug ? 'Edit Product' : 'Add New Product'}
                </h3>
                <p className="text-xs text-[#8A7D97]">
                  Fill out all required fields to update your live storefront catalog
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#8A7D97] hover:text-white rounded-lg hover:bg-[#2E2733] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-[#C1495A]/15 border border-[#C1495A]/30 text-xs text-[#DD8A94]">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="p-3.5 rounded-xl bg-[#6FAE8C]/15 border border-[#6FAE8C]/30 text-xs text-[#8FC7A9]">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-6">
              {/* Product Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white">
                    Product Name <span className="text-[#C4587A]">*</span>
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
                    placeholder="e.g. Travel Jewelry Organizer Box"
                    className="w-full bg-[#191520] border border-[#2E2733] focus:border-[#C4587A] text-xs text-white rounded-xl px-3 py-2 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white">
                    Product Slug (URL) <span className="text-[#C4587A]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={prodSlug}
                    onChange={(e) => setProdSlug(e.target.value)}
                    placeholder="e.g. travel-jewelry-organizer-box"
                    className="w-full bg-[#191520] border border-[#2E2733] focus:border-[#C4587A] text-xs text-white rounded-xl px-3 py-2 outline-none font-mono"
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
                    className="w-full bg-[#191520] border border-[#2E2733] focus:border-[#C4587A] text-xs text-white rounded-xl px-3 py-2 outline-none cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white">
                      Base Price (৳) <span className="text-[#C4587A]">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={prodBasePrice}
                      onChange={(e) => setProdBasePrice(Number(e.target.value))}
                      className="w-full bg-[#191520] border border-[#2E2733] focus:border-[#C4587A] text-xs text-white rounded-xl px-3 py-2 outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white">
                      Original Price (৳) <span className="text-[#C4587A]">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={prodOriginalPrice}
                      onChange={(e) => setProdOriginalPrice(Number(e.target.value))}
                      className="w-full bg-[#191520] border border-[#2E2733] focus:border-[#C4587A] text-xs text-white rounded-xl px-3 py-2 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Subtitle & Bengali Description */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white">
                    Subtitle / Tagline (Bengali) <span className="text-[#C4587A]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={prodTaglineBn}
                    onChange={(e) => setProdTaglineBn(e.target.value)}
                    placeholder="e.g. আপনার প্রিয় গহনাগুলো গুছিয়ে রাখার পারফেক্ট সঙ্গী"
                    className="w-full bg-[#191520] border border-[#2E2733] focus:border-[#C4587A] text-xs text-white rounded-xl px-3 py-2 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white">
                    Product Description (Bengali) <span className="text-[#C4587A]">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={prodDescriptionBn}
                    onChange={(e) => setProdDescriptionBn(e.target.value)}
                    placeholder="বিস্তারিত প্রোডাক্ট বিবরণ লিখুন..."
                    className="w-full bg-[#191520] border border-[#2E2733] focus:border-[#C4587A] text-xs text-white rounded-xl px-3 py-2 outline-none resize-none"
                  />
                </div>
              </div>

              {/* Toggles & Checkboxes */}
              <div className="p-4 bg-[#191520] rounded-xl border border-[#2E2733] flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
                  <input
                    type="checkbox"
                    checked={prodIsFeatured}
                    onChange={(e) => setProdIsFeatured(e.target.checked)}
                    className="rounded accent-[#C4587A]"
                  />
                  <span>Featured Product</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
                  <input
                    type="checkbox"
                    checked={prodIsHeroSlider}
                    onChange={(e) => setProdIsHeroSlider(e.target.checked)}
                    className="rounded accent-[#C4587A]"
                  />
                  <span>Enable for Hero Banner Pool</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
                  <input
                    type="checkbox"
                    checked={prodIsActive}
                    onChange={(e) => setProdIsActive(e.target.checked)}
                    className="rounded accent-[#C4587A]"
                  />
                  <span>Active in Store</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2E2733]">
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
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
