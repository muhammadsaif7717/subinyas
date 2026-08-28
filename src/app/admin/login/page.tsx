'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { Heart, Lock, Mail, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@subinyas.shop');
  const [password, setPassword] = useState('subinyas2026');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data?.success) {
        router.push('/admin');
      } else {
        setError(res.data?.message || 'লগইন ব্যর্থ হয়েছে');
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) && err.response?.data?.message
        ? err.response.data.message
        : 'ভুল ইমেইল বা পাসওয়ার্ড!';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 text-slate-100 font-sans">
      <div className="max-w-md w-full bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-md shadow-rose-500/20">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">সুবিন্যাস</span>
          </Link>
          <h2 className="text-lg font-bold text-slate-200">অ্যাডমিন সিকিউর পোর্টাল</h2>
          <p className="text-xs text-slate-400">আপনার শপের ড্যাশবোর্ডে প্রবেশ করতে লগইন করুন</p>
        </div>

        {error && (
          <div className="bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs p-3 rounded-xl font-medium">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-bold text-slate-300 mb-1">অ্যাডমিন ইমেইল</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@subinyas.shop"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">পাসওয়ার্ড</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60 text-[11px] text-slate-400">
            <span className="font-semibold text-rose-300">ডিফল্ট ক্রেডেনশিয়ালস:</span>
            <div>ইমেইল: <code className="text-slate-200">admin@subinyas.shop</code></div>
            <div>পাসওয়ার্ড: <code className="text-slate-200">subinyas2026</code></div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>লগইন করুন</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300">
            ← মূল ওয়েবসাইটে ফিরে যান
          </Link>
        </div>
      </div>
    </div>
  );
}
