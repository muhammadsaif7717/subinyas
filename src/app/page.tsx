'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, Truck, ShieldCheck, Heart } from 'lucide-react';
import { INITIAL_JEWELRY_BOX_PRODUCT } from '@/lib/constants';

export default function HomePage() {
  const product = INITIAL_JEWELRY_BOX_PRODUCT;

  return (
    <div className="w-full bg-white text-slate-900">
      {/* Minimal Hero Section */}
      <section className="border-b border-slate-100 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-block text-xs font-semibold uppercase tracking-widest text-slate-500 bg-slate-50 px-3 py-1 rounded-md border border-slate-200">
                পরিপাটী ও নান্দনিক অনুষঙ্গ
              </div>

              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
                আপনার শখের জিনিস রাখুন সুবিন্যস্ত ও সুরক্ষিত
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-lg leading-relaxed">
                সুবিন্যাস নিয়ে এলো নান্দনিক ট্রাভেল জুয়েলারি বক্স ও উপহারের কালেকশন। যেকোনো স্থানে নিজের শখের অনুষঙ্গগুলো রাখুন পরিপাটি।
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm py-3 px-6 rounded-xl transition-all shadow-xs"
                >
                  <span>Browse All Products</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/products/jewelry-box"
                  className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-sm py-3 px-6 rounded-xl transition-all"
                >
                  <span>Featured Jewelry Box</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-200">
                <Image
                  src="/images/products/hello-kitty-pair.png"
                  alt="Subinyas Jewelry Box"
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">ফিচারড কালেকশন</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">আমাদের সর্বাধিক জনপ্রিয় প্রডাক্টস</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Active Product */}
          <Link
            href="/products/jewelry-box"
            className="group block rounded-2xl border border-slate-200 overflow-hidden bg-white hover:border-slate-400 transition-colors"
          >
            <div className="relative aspect-square bg-slate-50 overflow-hidden">
              <Image
                src="/images/products/hello-kitty-open.png"
                alt={product.nameBn}
                fill
                className="object-cover group-hover:scale-103 transition-transform duration-300"
              />
            </div>
            <div className="p-5 space-y-2">
              <div className="flex items-center gap-1 text-amber-500 text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <span className="font-semibold text-slate-800">৪.৯</span>
                <span className="text-slate-400">({product.reviewCount})</span>
              </div>
              <h3 className="font-semibold text-slate-900 text-base">{product.nameBn}</h3>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-lg font-bold text-slate-900">৳{product.basePrice}</span>
                <span className="text-xs line-through text-slate-400">৳{product.originalPrice}</span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Minimal Trust Features */}
      <section className="border-t border-slate-100 py-12 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100">
            <Truck className="w-5 h-5 text-slate-800 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">সারাদেশে হোম ডেলিভারি</div>
              <div>ক্যাশ অন ডেলিভারি সুবিধা</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100">
            <ShieldCheck className="w-5 h-5 text-slate-800 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">১০০% কোয়ালিটি গ্যারান্টি</div>
              <div>৭ দিনের সহজ রিপ্লেসমেন্ট</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100">
            <Heart className="w-5 h-5 text-slate-800 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">উপহারের জন্য সেরা পছন্দ</div>
              <div>প্রিমিয়াম ও নান্দনিক প্যাকেজিং</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
