import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white text-slate-500 text-xs py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900">সুবিন্যাস</span>
          <span className="text-slate-300">•</span>
          <span>subinyas.shop</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            হোম
          </Link>
          <Link href="/products/jewelry-box" className="hover:text-slate-900 transition-colors">
            জুয়েলারি বক্স
          </Link>
          <Link href="/admin" className="hover:text-slate-900 transition-colors">
            অ্যাডমিন
          </Link>
        </div>

        <div className="text-slate-400">
          © {new Date().getFullYear()} সুবিন্যাস. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
