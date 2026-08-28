'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Star,
  Truck,
  ShieldCheck,
  Heart,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { Product, StoreSettings, isProductInStock } from '@/lib/types';
import { useCart } from '@/lib/cart-context';

export default function HomePage() {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();

  // Fetch live products from MongoDB
  const { data: productsData, isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await axios.get('/api/products');
      return res.data?.products || [];
    },
  });

  // Fetch store settings for hero banner selection
  const { data: settingsData } = useQuery({
    queryKey: ['store-settings'],
    queryFn: async () => {
      const res = await axios.get('/api/settings');
      return res.data?.settings as StoreSettings;
    },
  });

  const products = productsData || [];

  // Controlled Hero Slider Selection from Admin Dashboard
  const slides = React.useMemo(() => {
    if (!products || products.length === 0) return [];

    const activeSelectedSlugs = settingsData?.heroBannerSlugs || [];
    if (activeSelectedSlugs.length > 0) {
      const matched = activeSelectedSlugs
        .map((slug) => products.find((p) => p.slug === slug && p.isActive !== false))
        .filter(Boolean) as Product[];
      if (matched.length > 0) return matched;
    }

    // Fallback: products with isHeroSlider === true
    const heroProducts = products.filter(
      (p) => p.isHeroSlider === true && p.isActive !== false
    );
    if (heroProducts.length > 0) {
      return [...heroProducts].sort((a, b) => (a.heroOrder || 1) - (b.heroOrder || 1));
    }

    // Fallback: featured products sorted by reviews & rating
    const featured = products.filter((p) => p.isFeatured !== false && p.isActive !== false);
    const sortedFeatured = [...featured].sort(
      (a, b) => (b.reviewCount || 0) - (a.reviewCount || 0) || (b.rating || 5) - (a.rating || 5)
    );

    if (sortedFeatured.length > 0) {
      return sortedFeatured.slice(0, 4);
    }

    // Fallback: all active products
    const active = products.filter((p) => p.isActive !== false);
    return [...active]
      .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0) || (b.rating || 5) - (a.rating || 5))
      .slice(0, 4);
  }, [products, settingsData?.heroBannerSlugs]);

  // Auto Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
  }, [slides.length]);

  const prevSlide = () => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 2800);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, slides.length]);

  const activeProduct = slides[currentSlide % Math.max(1, slides.length)];

  return (
    <div className="w-full bg-white text-slate-900">
      {/* Dynamic Hero Auto Slider from MongoDB with Full-Bleed 16:9 Background Banner */}
      {activeProduct && (
        <section
          className="relative overflow-hidden w-full min-h-[480px] sm:min-h-[540px] lg:min-h-[580px] flex items-center bg-slate-950 border-b border-slate-800 select-none"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Full Banner Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              key={activeProduct.slug}
              src={
                activeProduct.heroBannerImage ||
                activeProduct.images[0] ||
                '/images/products/hello-kitty-pair.png'
              }
              alt={activeProduct.name}
              fill
              priority
              className="object-cover object-center transition-opacity duration-700 animate-in fade-in"
            />

            {/* Smart Gradient Overlay based on text_left vs text_right */}
            <div
              className={`absolute inset-0 transition-all duration-500 ${
                activeProduct.heroLayout === 'text_right'
                  ? 'bg-gradient-to-t sm:bg-gradient-to-l from-black/95 via-black/75 to-black/35 sm:to-transparent'
                  : 'bg-gradient-to-t sm:bg-gradient-to-r from-black/95 via-black/75 to-black/35 sm:to-transparent'
              }`}
            />
          </div>

          {/* Foreground Dynamic Content Container */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 w-full py-12 sm:py-20">
            <div
              className={`max-w-xl space-y-6 ${
                activeProduct.heroLayout === 'text_right'
                  ? 'sm:ml-auto text-left sm:text-right'
                  : 'sm:mr-auto text-left'
              }`}
            >
              {/* Badges */}
              <div
                className={`flex flex-wrap items-center gap-2 ${
                  activeProduct.heroLayout === 'text_right'
                    ? 'justify-start sm:justify-end'
                    : 'justify-start'
                }`}
              >
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-300 bg-rose-950/70 backdrop-blur-md px-3.5 py-1 rounded-full border border-rose-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  <span>Featured Deal • Save ৳{activeProduct.originalPrice - activeProduct.basePrice}</span>
                </span>
                <span className="text-[11px] font-bold text-white/90 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                  {activeProduct.category || 'Organizers'}
                </span>
                {activeProduct.reviewCount > 0 && (
                  <div className="flex items-center gap-1 text-xs text-amber-300 font-bold bg-amber-950/70 backdrop-blur-md px-3 py-1 rounded-full border border-amber-500/30">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{activeProduct.rating?.toFixed(1) || '5.0'}</span>
                    <span className="text-white/60 font-normal">({activeProduct.reviewCount})</span>
                  </div>
                )}
              </div>

              {/* Product Title */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
                  {activeProduct.name || activeProduct.nameBn}
                </h1>
              </div>

              {/* Tagline / Description */}
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-lg drop-shadow">
                {activeProduct.taglineBn || activeProduct.descriptionBn}
              </p>

              {/* Price & Action Buttons */}
              <div className="space-y-4 pt-1">
                <div
                  className={`flex items-baseline gap-3 ${
                    activeProduct.heroLayout === 'text_right'
                      ? 'justify-start sm:justify-end'
                      : 'justify-start'
                  }`}
                >
                  <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono drop-shadow">
                    ৳{activeProduct.basePrice}
                  </span>
                  {activeProduct.originalPrice > activeProduct.basePrice && (
                    <span className="text-sm sm:text-base line-through text-slate-400 font-mono">
                      ৳{activeProduct.originalPrice}
                    </span>
                  )}
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/70 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/30">
                    Save ৳{activeProduct.originalPrice - activeProduct.basePrice}
                  </span>
                </div>

                <div
                  className={`flex flex-wrap items-center gap-3 pt-2 ${
                    activeProduct.heroLayout === 'text_right'
                      ? 'justify-start sm:justify-end'
                      : 'justify-start'
                  }`}
                >
                  <Link
                    href={`/products/${activeProduct.slug}`}
                    className="inline-flex items-center gap-2 bg-[#C4587A] hover:bg-[#B24A6B] text-white font-bold text-sm sm:text-base py-3.5 px-7 rounded-2xl shadow-xl shadow-[#C4587A]/35 transition-all cursor-pointer"
                  >
                    <span>Order Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold text-sm sm:text-base py-3.5 px-6 rounded-2xl border border-white/20 transition-all cursor-pointer"
                  >
                    <span>Browse All Products ({products.length})</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Slider Navigation Arrows (only if multiple slides) */}
            {slides.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-white transition-all cursor-pointer z-20"
                  title="Previous Banner"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-white transition-all cursor-pointer z-20"
                  title="Next Banner"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </>
            )}

            {/* Bottom Dots Indicator */}
            {slides.length > 1 && (
              <div className="flex items-center justify-center gap-2 pt-10 sm:pt-14 relative z-20">
                {slides.map((s, idx) => (
                  <button
                    key={s.slug || idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      currentSlide === idx
                        ? 'w-9 h-2 bg-[#C4587A] shadow-md shadow-[#C4587A]/40'
                        : 'w-2.5 h-2 bg-white/40 hover:bg-white/70'
                    }`}
                    title={`Slide ${idx + 1}: ${s.name}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Featured Collections</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Our curated in-stock premium essentials</p>
          </div>

          <Link
            href="/products"
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
          >
            <span>View All Products ({products.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Loading products...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products
              .filter((p) => p.isActive !== false && p.isFeatured === true && isProductInStock(p))
              .map((product) => {
                const inStock = isProductInStock(product);

                return (
                  <div
                    key={product.slug}
                    className="group rounded-2xl border border-slate-200 overflow-hidden bg-white hover:border-slate-400 transition-all flex flex-col justify-between"
                  >
                    <div className="relative aspect-square bg-slate-50 overflow-hidden">
                      <Link href={`/products/${product.slug}`}>
                        <Image
                          src={product.images[0] || '/images/products/hello-kitty-open.png'}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-103 transition-transform duration-300"
                        />
                      </Link>

                      {/* Wishlist Button */}
                      <button
                        onClick={() => {
                          if (isInWishlist(product.slug)) {
                            removeFromWishlist(product.slug);
                          } else {
                            addToWishlist({
                              id: product.id,
                              productSlug: product.slug,
                              productName: product.name,
                              productNameBn: product.nameBn,
                              image: product.images[0],
                              price: product.basePrice,
                              rating: product.rating,
                            });
                          }
                        }}
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-slate-400 hover:text-rose-500 shadow-xs transition-colors cursor-pointer"
                        title="Wishlist"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isInWishlist(product.slug) ? 'fill-rose-500 text-rose-500' : ''
                          }`}
                        />
                      </button>

                      {/* Category Badge */}
                      <span className="absolute top-3 left-3 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {product.category}
                      </span>

                      {/* Stock Status Badge */}
                      <span
                        className={`absolute bottom-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs backdrop-blur-xs ${
                          inStock
                            ? 'bg-emerald-500/90 text-white'
                            : 'bg-rose-500/90 text-white'
                        }`}
                      >
                        {inStock ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            <span>In Stock</span>
                          </>
                        ) : (
                          <span>Out of Stock</span>
                        )}
                      </span>
                    </div>

                    <div className="p-5 space-y-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-amber-500 text-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span className="font-semibold text-slate-800">{product.rating}</span>
                          <span className="text-slate-400">({product.reviewCount})</span>
                        </div>
                        <Link href={`/products/${product.slug}`}>
                          <h3 className="font-semibold text-slate-900 text-base group-hover:text-rose-600 transition-colors">
                            {product.name || product.nameBn}
                          </h3>
                        </Link>
                        <p className="text-xs text-slate-500 line-clamp-2">{product.taglineBn}</p>
                      </div>

                      <div className="flex items-baseline justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-bold text-slate-900">৳{product.basePrice}</span>
                          <span className="text-xs line-through text-slate-400">৳{product.originalPrice}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                          Save ৳{product.originalPrice - product.basePrice}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          disabled={!inStock}
                          onClick={() => {
                            addToCart({
                              productSlug: product.slug,
                              productName: product.name,
                              productNameBn: product.nameBn,
                              image: product.images[0],
                              comboId: product.combos?.[0]?.id || 'combo-single',
                              comboTitleBn: product.combos?.[0]?.title || '1 Piece Single Pack',
                              selectedVariants: [product.variants?.[0]?.name || 'Default'],
                              price: product.basePrice,
                              quantity: 1,
                            });
                          }}
                          className={`border font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors ${
                            inStock
                              ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 cursor-pointer'
                              : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                        </button>

                        <Link
                          href={`/products/${product.slug}`}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 px-3 rounded-xl text-xs text-center flex items-center justify-center transition-colors"
                        >
                          <span>{inStock ? 'Order Now' : 'View Details'}</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </section>

      {/* Trust Badges */}
      <section className="border-t border-slate-100 py-12 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100">
            <Truck className="w-5 h-5 text-slate-800 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">Fast Nationwide Delivery</div>
              <div>Cash on Delivery across Bangladesh</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100">
            <ShieldCheck className="w-5 h-5 text-slate-800 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">100% Quality Guaranteed</div>
              <div>7-Day Easy Replacement Warranty</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100">
            <Heart className="w-5 h-5 text-slate-800 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">Premium Lifestyle Products</div>
              <div>Carefully Curated & Authentic Collection</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
