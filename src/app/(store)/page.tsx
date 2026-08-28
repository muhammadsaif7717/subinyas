'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  Heart,
  Star,
  CheckCircle2,
  Gift,
  Package,
} from 'lucide-react';
import { INITIAL_JEWELRY_BOX_PRODUCT } from '@/lib/constants';

export default function HomePage() {
  const product = INITIAL_JEWELRY_BOX_PRODUCT;

  return (
    <div className="w-full">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-rose-50/70 via-white to-slate-50 py-16 sm:py-24 border-b border-rose-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-rose-100/80 text-rose-700 text-xs font-bold px-4 py-1.5 rounded-full border border-rose-200 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>সুবিন্যাস — পরিপাটী জীবনের নান্দনিক অনুষঙ্গ</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight tracking-tight">
                আপনার শখের জিনিস রাখুন <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 bg-clip-text text-transparent">পরিপাটী ও সুরক্ষিত</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                সুবিন্যাস (subinyas.shop) নিয়ে এলো রুচিশীল ও নান্দনিক ট্রাভেল অর্গানাইজার এবং উপহারের সেরা কালেকশন। প্রতিটি পণ্যেই প্রিমিয়াম কোয়ালিটি ও সর্বোচ্চ সন্তুষ্টি নিশ্চিত।
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/products/jewelry-box"
                  className="w-full sm:w-auto bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-extrabold text-sm sm:text-base py-4 px-8 rounded-2xl shadow-xl shadow-rose-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>জুয়েলারি বক্স অফার দেখুন</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#featured-section"
                  className="w-full sm:w-auto bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm sm:text-base py-4 px-8 rounded-2xl border border-slate-200 shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <span>কালেকশন ব্রাউজ করুন</span>
                </a>
              </div>

              {/* Mini Trust Points */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>ক্যাশ অন ডেলিভারি</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>৭ দিনের রিপ্লেসমেন্ট</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>১০০% প্রিমিয়াম মেটেরিয়াল</span>
                </div>
              </div>
            </div>

            {/* Hero Image Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-square max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white group">
                <Image
                  src="/images/products/hello-kitty-pair.png"
                  alt="Subinyas Jewelry Box"
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white">
                    <span className="bg-rose-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                      হট ট্রেন্ডিং
                    </span>
                    <h3 className="text-lg font-bold mt-1">মিনি ট্রাভেল জুয়েলারি বক্স</h3>
                    <p className="text-xs text-rose-200">স্পেশাল কম্বো অফার মাত্র ৳৮৯৯</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collection Section */}
      <section id="featured-section" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            আমাদের কালেকশন
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-2">
            সর্বাধিক জনপ্রিয় লাইফস্টাইল পণ্যসমূহ
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            প্রতিটি পণ্য অত্যন্ত যত্নের সাথে বাছাইকৃত ও প্রস্তুতকৃত।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Active Product: Jewelry Box */}
          <div className="bg-white rounded-3xl overflow-hidden border border-rose-100 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col group">
            <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
              <Image
                src="/images/products/hello-kitty-open.png"
                alt={product.nameBn}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 bg-rose-600 text-white text-[11px] font-bold px-3 py-1 rounded-full">
                অফার চলছে 🔥
              </span>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-1 text-amber-400 text-xs mb-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="font-bold text-slate-800">৪.৯</span>
                  <span className="text-slate-400">({product.reviewCount}+ রিভিউ)</span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg group-hover:text-rose-600 transition-colors">
                  {product.nameBn}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {product.descriptionBn}
                </p>
              </div>

              <div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-black text-rose-600">৳{product.basePrice}</span>
                  <span className="text-xs line-through text-slate-400">৳{product.originalPrice}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full ml-auto">
                    ইন স্টক
                  </span>
                </div>

                <Link
                  href="/products/jewelry-box"
                  className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-xl shadow-md text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
                >
                  <span>অর্ডার করুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Upcoming Product 1: Cosmetic Vanity Pouch */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-md opacity-90 flex flex-col">
            <div className="relative aspect-4/3 w-full bg-rose-50 flex items-center justify-center text-rose-300">
              <Package className="w-16 h-16 stroke-1" />
              <span className="absolute top-3 right-3 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                শীঘ্রই আসছে (Coming Soon)
              </span>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">
                  প্রিমিয়াম ভ্যানিটি কসমেটিক্স পাউচ
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  মেকআপ ও স্কিনকেয়ারের সকল প্রসাধন পরিচ্ছন্ন ও সহজে বহনের জন্য ওয়াটারপ্রুফ পাউচ।
                </p>
              </div>
              <button disabled className="w-full bg-slate-100 text-slate-400 font-bold py-3 px-4 rounded-xl text-xs cursor-not-allowed">
                শীঘ্রই স্টক পাওয়া যাবে
              </button>
            </div>
          </div>

          {/* Upcoming Product 2: Handbag & Accessories Organizer */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-md opacity-90 flex flex-col">
            <div className="relative aspect-4/3 w-full bg-pink-50 flex items-center justify-center text-pink-300">
              <Gift className="w-16 h-16 stroke-1" />
              <span className="absolute top-3 right-3 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                শীঘ্রই আসছে (Coming Soon)
              </span>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">
                  ট্রাভেল কিউট হ্যান্ডব্যাগ অর্গানাইজার
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  ব্যাগের ভেতরের সবকিছু সুন্দরভাবে আলাদা চেম্বারে গুছিয়ে রাখার স্মার্ট সমাধান।
                </p>
              </div>
              <button disabled className="w-full bg-slate-100 text-slate-400 font-bold py-3 px-4 rounded-xl text-xs cursor-not-allowed">
                শীঘ্রই স্টক পাওয়া যাবে
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Values */}
      <section className="bg-white py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
                <Truck className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">সারাদেশে হোম ডেলিভারি</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                ঢাকা এবং ঢাকার বাইরে যেকোনো জেলা ও উপজেলায় বিশ্বস্ত কুরিয়ারে দ্রুততম সময়ে ডেলিভারি।
              </p>
            </div>

            <div className="p-6 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center mx-auto shadow-sm">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">১০০% কোয়ালিটি গ্যারান্টি</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                পণ্য হাতে পেয়ে দেখে চেক করার সুবিধা এবং কোনো সমস্যা হলে ৭ দিনের ফ্রি রিপ্লেসমেন্ট।
              </p>
            </div>

            <div className="p-6 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <Heart className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">সেরা উপহারের ঠিকানা</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                প্রিয় মানুষ কিংবা নিজের জন্য সবচেয়ে মিষ্টি ও আকর্ষণীয় উপহারের বিশ্বস্ত প্ল্যাটফর্ম।
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
