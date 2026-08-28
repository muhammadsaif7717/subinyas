'use client';

import React from 'react';
import Link from 'next/link';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Sleek Minimalist Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl font-bold tracking-tight text-slate-900 font-serif">
            সুবিন্যাস
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          <span className="text-xs font-mono tracking-widest text-slate-400 font-light">
            subinyas.shop
          </span>
        </Link>

        {/* Minimal Navigation Links */}
        <nav className="flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            হোম
          </Link>
          <Link
            href="/products/jewelry-box"
            className="text-rose-600 hover:text-rose-700 transition-colors font-semibold"
          >
            জুয়েলারি বক্স
          </Link>
          <Link
            href="/admin"
            className="text-slate-400 hover:text-slate-600 transition-colors text-xs"
          >
            অ্যাডমিন
          </Link>
        </nav>
      </div>
    </header>
  );
}
