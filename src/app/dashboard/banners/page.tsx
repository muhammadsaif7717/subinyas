'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  X,
  Sliders,
  ImageIcon,
  Camera,
  Loader2,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { Product, StoreSettings } from '@/lib/types';

export default function BannersPage() {
  const queryClient = useQueryClient();
  const cardCls = 'bg-[#211C28] rounded-2xl border border-[#2E2733]';

  // Fetch Products
  const {
    data: products = [],
    isLoading: isProductsLoading,
  } = useQuery<Product[]>({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const res = await axios.get('/api/products');
      return res.data?.products || [];
    },
  });

  // Fetch Store Settings (stores heroBannerSlugs)
  const {
    data: settingsData,
    isLoading: isSettingsLoading,
  } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const res = await axios.get('/api/settings');
      return res.data?.settings as StoreSettings;
    },
  });

  // Product Mutation (for updating banner image, layout orientation, or pool membership)
  const saveProductMutation = useMutation({
    mutationFn: async (payload: Partial<Product>) => {
      const res = await axios.post('/api/products', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Settings Mutation (for updating heroBannerSlugs order)
  const saveSettingsMutation = useMutation({
    mutationFn: async (payload: Partial<StoreSettings>) => {
      const res = await axios.post('/api/settings', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['store-settings'] });
    },
  });

  // Helper: Auto-Crop any image into a high-res 16:9 aspect ratio File
  const cropImageTo16by9 = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;
        const targetRatio = 16 / 9;
        const currentRatio = naturalWidth / naturalHeight;

        let sx = 0;
        let sy = 0;
        let sWidth = naturalWidth;
        let sHeight = naturalHeight;

        if (currentRatio > targetRatio) {
          sHeight = naturalHeight;
          sWidth = naturalHeight * targetRatio;
          sx = (naturalWidth - sWidth) / 2;
          sy = 0;
        } else {
          sWidth = naturalWidth;
          sHeight = naturalWidth / targetRatio;
          sx = 0;
          sy = (naturalHeight - sHeight) / 2;
        }

        const canvasWidth = Math.max(1600, Math.round(sWidth));
        const canvasHeight = Math.round(canvasWidth / targetRatio);

        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvasWidth, canvasHeight);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const croppedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '') + '-16x9.webp', {
              type: 'image/webp',
            });
            resolve(croppedFile);
          },
          'image/webp',
          0.92
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };

      img.src = objectUrl;
    });
  };

  // Banner Upload state
  const [uploadingBannerSlug, setUploadingBannerSlug] = useState<string | null>(null);

  const handleHeroBannerUpload = async (prod: Product, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const targetInput = e.target;
    setUploadingBannerSlug(prod.slug);

    try {
      const formatted16by9File = await cropImageTo16by9(file);
      const formData = new FormData();
      formData.append('file', formatted16by9File);
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
    } catch (err) {
      console.error('Banner upload error:', err);
      alert('Failed to process and upload 16:9 banner image.');
    } finally {
      setUploadingBannerSlug(null);
      if (targetInput) targetInput.value = '';
    }
  };

  const heroEnabledProducts = products.filter((p) => p.isHeroSlider === true);
  const selectedBannerSlugs: string[] =
    settingsData?.heroBannerSlugs ?? heroEnabledProducts.slice(0, 4).map((p) => p.slug);

  const activeHeroSlides = selectedBannerSlugs
    .map((slug) => heroEnabledProducts.find((p) => p.slug === slug))
    .filter(Boolean) as Product[];

  const handleToggleSlideSelection = (prodSlug: string) => {
    if (selectedBannerSlugs.includes(prodSlug)) {
      const newSlugs = selectedBannerSlugs.filter((s) => s !== prodSlug);
      saveSettingsMutation.mutate({ heroBannerSlugs: newSlugs });
    } else {
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
      {/* Header */}
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
                      <h5 className="text-xs font-bold text-white truncate">{prod.name}</h5>
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
                    <span>{prod.name}</span>
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
                      <h4 className="text-sm font-bold text-white">{prod.name}</h4>
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
                  <div className="lg:col-span-7">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-white flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-[#D3A45E]" />
                          <span>16:9 Hero Banner Visual (Full-Bleed Background)</span>
                        </label>
                        <span className="text-[10px] text-[#8A7D97] font-mono">Auto 16:9 Crop</span>
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
                            <span>Upload Banner Image</span>
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
                              Reset to Default Photo
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#8A7D97]">
                        <span>
                          {prod.heroBannerImage ? (
                            <span className="text-[#8FC7A9] font-medium">✓ Custom 16:9 Banner Active</span>
                          ) : (
                            <span className="text-[#E4BC79]">Using product photo (Upload for full-width custom design)</span>
                          )}
                        </span>

                        <label className="cursor-pointer text-[#E39BB4] hover:underline flex items-center gap-1 font-semibold">
                          <Plus className="w-3 h-3" />
                          <span>Upload Image</span>
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
                      <h5 className="text-sm font-bold text-white truncate">{prod.name}</h5>
                      <p className="text-xs text-[#8A7D97] line-clamp-2">
                        {prod.subtitle || prod.description}
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
}
