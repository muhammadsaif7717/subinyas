'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google?: any;
  }
}

export function GoogleAuthButton({ onError }: { onError?: (msg: string) => void }) {
  const router = useRouter();
  const { refetchUser } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    ''; // Google Cloud Client ID

  useEffect(() => {
    // Load Google Identity Services SDK
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !window.google || !googleClientId) return;

    try {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callback: async (response: any) => {
          setIsLoading(true);
          try {
            const res = await axios.post('/api/auth/google', {
              credential: response.credential,
            });

            if (res.data?.success) {
              await refetchUser();
              const userRole = res.data?.user?.role;
              if (userRole === 'admin') {
                router.push('/dashboard');
              } else {
                router.push('/');
              }
            } else {
              onError?.(res.data?.message || 'Google Sign-In failed');
            }
          } catch (err: unknown) {
            const msg =
              axios.isAxiosError(err) && err.response?.data?.message
                ? err.response.data.message
                : 'Failed to authenticate with Google.';
            onError?.(msg);
          } finally {
            setIsLoading(false);
          }
        },
      });

      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          width: 380,
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
        });
      }
    } catch (e) {
      console.error('Google Sign-In init error:', e);
    }
  }, [scriptLoaded, googleClientId, router, refetchUser, onError]);

  const handleManualClick = () => {
    if (!googleClientId) {
      onError?.(
        'Google Client ID এখনো .env.local ফাইলে যুক্ত করা হয়নি। অনুগ্রহ করে .env.local ফাইলে NEXT_PUBLIC_GOOGLE_CLIENT_ID বসিয়ে দিন।'
      );
      return;
    }
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {isLoading && (
        <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
          <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
          <span>Signing in with Google...</span>
        </div>
      )}

      {/* Official Google GSI Rendered Button */}
      {googleClientId ? (
        <div ref={buttonRef} className="w-full flex justify-center min-h-[44px]" />
      ) : (
        <button
          type="button"
          onClick={handleManualClick}
          className="w-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-3 text-xs sm:text-sm cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>
      )}
    </div>
  );
}
