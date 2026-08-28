'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, PhoneCall, ShieldCheck, Heart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function Navbar() {
  const { data: settings } = useQuery({
    queryKey: ['store-settings'],
    queryFn: async () => {
      const res = await axios.get('/api/settings');
      return res.data?.settings;
    },
  });

  const announcement = settings?.announcementTextBn || '🚚 সারাদেশে দ্রুত ক্যাশ অন ডেলিভারি | সীমিত সময়ের মেগা অফার!';
  const phone = settings?.phone || '01700000000';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100/60 shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white text-xs sm:text-sm font-medium py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
        <span>{announcement}</span>
        <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center text-white shadow-md shadow-rose-200 group-hover:scale-105 transition-transform duration-200">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-slate-900 via-rose-950 to-rose-700 bg-clip-text text-transparent tracking-tight">
                সুবিন্যাস
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest text-rose-500">.shop</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium -mt-1 hidden sm:block">
              পরিপাটী জীবনের নান্দনিক অনুষঙ্গ
            </span>
          </div>
        </Link>

        {/* Quick Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-rose-600 transition-colors">
            হোম (Home)
          </Link>
          <Link href="/products/jewelry-box" className="text-rose-600 font-semibold flex items-center gap-1 hover:text-rose-700 transition-colors">
            <span>জুয়েলারি বক্স অফার</span>
            <span className="bg-rose-100 text-rose-600 text-[10px] px-1.5 py-0.5 rounded-full uppercase font-bold">Hot</span>
          </Link>
          <Link href="/admin" className="hover:text-rose-600 transition-colors text-slate-400 text-xs">
            অ্যাডমিন
          </Link>
        </nav>

        {/* Trust Badges & Helpline */}
        <div className="flex items-center gap-3">
          <a
            href={`tel:${phone}`}
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 rounded-full border border-rose-200/60 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>হেল্পলাইন: {phone}</span>
          </a>

          <Link
            href="/products/jewelry-box#order-section"
            className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-sm shadow-rose-200 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>অর্ডার করুন</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
