'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { INITIAL_JEWELRY_BOX_PRODUCT } from '@/lib/constants';
import { useCart } from '@/lib/cart-context';

const HERO_SLIDES = [
  {
    id: 'slide-1',
    badge: 'Limited Time Deal • 38% OFF',
    title: 'Mini Portable Travel Jewelry Box',
    titleBn: 'প্রিমিয়াম পোর্টেবল ট্রাভেল জুয়েলারি বক্স',
    description:
      'আংটি, কানের দুল ও চেইন সুরক্ষিত ও পরিপাটি রাখার জন্য মাল্টি-কম্পার্টমেন্ট সফট ভেলভেট বক্স।',
    price: 499,
    originalPrice: 800,
    image: '/images/products/hello-kitty-pair.png',
    link: '/products/jewelry-box',
    buttonText: 'Order Jewelry Box',
    tag: 'Bestseller',
  },
  {
    id: 'slide-2',
    badge: 'Eco-Luxury Collection',
    title: 'Vintage Cork Mandala Jewelry Organizer',
    titleBn: 'ভিন্টেজ কর্ক মান্দালা জুয়েলারি কেস',
    description:
      'প্রিমিয়াম কর্ক লেদার ও ট্র্যাডিশনাল মান্দালা আর্টের অপূর্ব সমন্বয়। উপহার দেওয়ার জন্য পারফেক্ট।',
    price: 599,
    originalPrice: 950,
    image: '/images/products/mandala-boxes.png',
    link: '/products/jewelry-box',
    buttonText: 'Explore Mandala Box',
    tag: 'Trending',
  },
  {
    id: 'slide-3',
    badge: 'Essential Accessory',
    title: 'Soft Velvet Multi-Slot Compact Organizer',
    titleBn: 'ভেলভেট মাল্টি-স্লট কম্প্যাক্ট ট্রাভেল বক্স',
    description:
      'স্ক্র্যাচ-প্রুফ ভেলভেট ইনার লাইনিং সহ লাইটওয়েট ট্রাভেল ফ্রেন্ডলি ডিজাইন। ব্যাগে সহজেই বহনযোগ্য।',
    price: 499,
    originalPrice: 800,
    image: '/images/products/pink-box-interior.png',
    link: '/products/jewelry-box',
    buttonText: 'View Interior Details',
    tag: 'High Demand',
  },
];

export default function HomePage() {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();
  const product = INITIAL_JEWELRY_BOX_PRODUCT;

  // Auto Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <div className="w-full bg-white text-slate-900">
      {/* Dynamic Hero Auto Slider */}
      <section
        className="border-b border-slate-100 py-12 sm:py-20 relative overflow-hidden bg-gradient-to-b from-slate-50/50 to-white"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[420px]">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-md border border-rose-100">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{slide.badge}</span>
                </span>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {slide.tag}
                </span>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
                  {slide.titleBn}
                </h1>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">
                  {slide.title}
                </p>
              </div>

              <p className="text-sm sm:text-base text-slate-600 max-w-lg leading-relaxed">
                {slide.description}
              </p>

              {/* Price & CTAs */}
              <div className="space-y-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-slate-900">৳{slide.price}</span>
                  <span className="text-sm line-through text-slate-400">৳{slide.originalPrice}</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Save ৳{slide.originalPrice - slide.price}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link
                    href={slide.link}
                    className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm py-3.5 px-6 rounded-xl transition-all shadow-xs"
                  >
                    <span>{slide.buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm py-3.5 px-6 rounded-xl border border-slate-300 transition-all"
                  >
                    <span>Browse All Products</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Visual Frame */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-50 border border-slate-200 shadow-sm">
                <Image
                  key={slide.id}
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority
                  className="object-cover transition-opacity duration-500 animate-in fade-in"
                />
              </div>

              {/* Slider Arrows */}
              <div className="absolute -bottom-4 right-4 flex items-center gap-2">
                <button
                  onClick={prevSlide}
                  className="w-9 h-9 rounded-full bg-white/90 border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextSlide}
                  className="w-9 h-9 rounded-full bg-white/90 border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Next"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2 pt-8">
            {HERO_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentSlide === idx ? 'w-8 h-2 bg-slate-900' : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                }`}
                title={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Featured Collections</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Our most loved lifestyle essentials</p>
          </div>

          <Link
            href="/products"
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Active Product */}
          <div className="group rounded-2xl border border-slate-200 overflow-hidden bg-white hover:border-slate-400 transition-all flex flex-col justify-between">
            <div className="relative aspect-square bg-slate-50 overflow-hidden">
              <Link href={`/products/${product.slug}`}>
                <Image
                  src={product.images[0] || '/images/products/hello-kitty-open.png'}
                  alt={product.nameBn}
                  fill
                  className="object-cover group-hover:scale-103 transition-transform duration-300"
                />
              </Link>

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

              <span className="absolute top-3 left-3 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                {product.category}
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
                    {product.nameBn}
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
                  onClick={() => {
                    addToCart({
                      productSlug: product.slug,
                      productName: product.name,
                      productNameBn: product.nameBn,
                      image: product.images[0],
                      comboId: product.combos[0]?.id || 'combo-single',
                      comboTitleBn: product.combos[0]?.titleBn || '১টি বক্স',
                      selectedVariants: [product.variants[0]?.nameBn || 'Default'],
                      price: product.basePrice,
                      quantity: 1,
                    });
                  }}
                  className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </button>

                <Link
                  href={`/products/${product.slug}`}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 px-3 rounded-xl text-xs text-center flex items-center justify-center transition-colors"
                >
                  <span>Order Now</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-t border-slate-100 py-12 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100">
            <Truck className="w-5 h-5 text-slate-800 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">সারাদেশে হোম ডেলিভারি</div>
              <div>ক্যাশ অন ডেলিভারি সুবিধা (No Login Required)</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100">
            <ShieldCheck className="w-5 h-5 text-slate-800 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">১০০% কোয়ালিটি গ্যারান্টি</div>
              <div>৭ দিনের সহজ রিপ্লেসমেন্ট সুবিধা</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100">
            <Heart className="w-5 h-5 text-slate-800 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">উপহারের জন্য সেরা চয়েস</div>
              <div>প্রিমিয়াম ও নান্দনিক ফিনিশিং</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
