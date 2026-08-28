'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User as UserIcon, ArrowRight, Loader2, Phone } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { GoogleAuthButton } from '@/components/GoogleAuthButton';
import axios from 'axios';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegister) {
        const res = await axios.post('/api/auth/register', { name, email, password, phone });
        if (res.data?.success) {
          router.push('/');
        } else {
          setError(res.data?.message || 'Registration failed');
        }
      } else {
        const res = await login(email, password);
        if (res.success) {
          if (email.trim().toLowerCase() === 'admin@subinyas.shop') {
            router.push('/dashboard');
          } else {
            router.push('/');
          }
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900"
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block font-medium text-slate-700 mb-1">Phone Number (Optional)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{isRegister ? 'Sign Up' : 'Log In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => setIsRegister(false)}
                className="font-bold text-slate-900 hover:underline cursor-pointer"
              >
                Log In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => setIsRegister(true)}
                className="font-bold text-slate-900 hover:underline cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
