import React from 'react';
import Link from 'next/link';
import { Heart, ShieldCheck, Truck, RotateCcw, Headphones, Lock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Features / Guarantees Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-10 border-b border-slate-800 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">সারাদেশে ক্যাশ অন ডেলিভারি</h4>
              <p className="text-xs text-slate-400 mt-0.5">পণ্য হাতে পেয়ে মূল্য পরিশোধের সুবিধা</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি</h4>
              <p className="text-xs text-slate-400 mt-0.5">যেকোনো ত্রুটিতে ফ্রি রিপ্লেসমেন্ট</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">১০০% অরিজিনাল ও প্রিমিয়াম</h4>
              <p className="text-xs text-slate-400 mt-0.5">উন্নত ফিনিশিং ও কোয়ালিটি নিশ্চিত</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">২৪/৭ কাস্টমার সাপোর্ট</h4>
              <p className="text-xs text-slate-400 mt-0.5">ফোন ও হোয়াটসঅ্যাপে সরাসরি সহায়তা</p>
            </div>
          </div>
        </div>

        {/* Links & Brand Description */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center text-white">
                <Heart className="w-4 h-4 fill-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">সুবিন্যাস</span>
              <span className="text-xs text-rose-400 font-semibold">.shop</span>
            </div>
            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
              সুবিন্যাস (subinyas.shop) হলো নান্দনিকভাবে গুছিয়ে রাখার সকল লাইফস্টাইল, ট্রাভেল ও গিফট অনুষঙ্গের একটি আধুনিক বাংলাদেশি ব্র্যান্ড। আপনার প্রতিটি মুহূর্তকে পরিপাটি ও সুন্দর করতে আমরা প্রতিশ্রুতিবদ্ধ।
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">গুরুত্বপূর্ণ লিংকসমূহ</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/" className="hover:text-rose-400 transition-colors">
                  হোমপেজ (Home)
                </Link>
              </li>
              <li>
                <Link href="/products/jewelry-box" className="hover:text-rose-400 transition-colors">
                  মিনি ট্রাভেল জুয়েলারি বক্স
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-rose-400 transition-colors">
                  অ্যাডমিন ড্যাশবোর্ড (Admin)
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">পেমেন্ট মেথড ও সিকিউরিটি</h4>
            <p className="text-xs text-slate-400 mb-3">
              ক্যাশ অন ডেলিভারি (Cash on Delivery) ছাড়াও বিকাশ ও নগদ গ্রহণযোগ্য।
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>আপনার সকল তথ্য ও লেনদেন সম্পূর্ণ নিরাপদ ও এনক্রিপ্টেড।</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-slate-800 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} সুবিন্যাস (subinyas.shop). সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="text-slate-400">Made with ❤️ for Bangladesh E-Commerce</p>
        </div>
      </div>
    </footer>
  );
}
