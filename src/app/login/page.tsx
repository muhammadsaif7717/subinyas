'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, User as UserIcon, ArrowRight, Loader2, Phone, ShoppingBag, Heart, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { GoogleAuthButton } from '@/components/GoogleAuthButton';
import axios from 'axios';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '';
  const authRequired = searchParams.get('authRequired') === 'true';
  const actionType = searchParams.get('action');

  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRedirect = (userRole?: string) => {
    if (userRole === 'admin' || email.trim().toLowerCase() === 'admin@subinyas.shop') {
      router.push('/dashboard');
    } else if (callbackUrl && !callbackUrl.startsWith('/login')) {
      router.push(callbackUrl);
    } else {
      router.push('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegister) {
        const res = await axios.post('/api/auth/register', { name, email, password, phone });
        if (res.data?.success) {
          handleRedirect(res.data?.user?.role);
        } else {
          setError(res.data?.message || 'Registration failed');
        }
      } else {
        const res = await login(email, password);
        if (res.success) {
          handleRedirect();
        } else {
          setError(res.message || 'Login failed');
        }
      }
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'Authentication error';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-16 sm:py-24 max-w-md mx-auto px-4">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 font-serif text-2xl font-bold text-slate-900">
            <span>সুবিন্যাস</span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            {isRegister ? 'Create an Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-500">
            {isRegister
              ? 'Sign up to track your orders and save your wishlist'
              : 'Log in to view your orders and manage wishlist'}
          </p>
        </div>

        {/* Action-Specific English Notification Banner */}
        {authRequired && (
          <div className="bg-rose-50/90 border border-rose-200 text-rose-900 text-xs p-3.5 rounded-2xl flex items-start gap-3 shadow-xs">
            {actionType === 'cart' ? (
              <ShoppingBag className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            ) : actionType === 'wishlist' ? (
              <Heart className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <p className="font-bold text-rose-950">
                {actionType === 'cart'
                  ? 'Sign In Required for Cart'
                  : actionType === 'wishlist'
                  ? 'Sign In Required for Wishlist'
                  : 'Authentication Required'}
              </p>
              <p className="text-[11px] text-rose-800 leading-relaxed">
                {actionType === 'cart'
                  ? 'Please sign in to add this item to your shopping cart and continue.'
                  : actionType === 'wishlist'
                  ? 'Please sign in to save items to your wishlist and access them anytime.'
                  : 'Please sign in to continue with your requested action.'}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-medium leading-relaxed">
            ⚠️ {error}
          </div>
        )}

        {/* Real Google Account Chooser Component */}
        <GoogleAuthButton onError={(msg) => setError(msg)} />

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full"></div>
          <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold absolute">
            Or with email
          </span>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs sm:text-sm">
          {isRegister && (
            <div>
              <label className="block font-medium text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Nusrat Jahan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3.5 outline-none focus:border-rose-500 focus:bg-white transition-all text-xs"
                />
              </div>
            </div>
          )}

          {isRegister && (
            <div>
              <label className="block font-medium text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  placeholder="e.g. 01700000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3.5 outline-none focus:border-rose-500 focus:bg-white transition-all text-xs font-mono"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-medium text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3.5 outline-none focus:border-rose-500 focus:bg-white transition-all text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3.5 outline-none focus:border-rose-500 focus:bg-white transition-all text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer text-xs sm:text-sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Register/Login */}
        <div className="text-center pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
