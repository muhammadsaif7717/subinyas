'use client';

import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import { trackPageView } from '@/lib/pixel';
import { AuthProvider } from '@/lib/auth-context';
import { CartProvider } from '@/lib/cart-context';
import { CartDrawer } from './CartDrawer';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 2, // 2 minutes
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    // Fetch store settings to initialize Meta Pixel dynamically
    const initMetaPixel = async () => {
      try {
        const res = await axios.get('/api/settings');
        const settings = res.data?.settings;
        const pixelId = settings?.metaPixelId;

        if (pixelId && settings.isPixelActive && typeof window !== 'undefined') {
          /* eslint-disable */
          (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
            if (f.fbq) return;
            n = f.fbq = function () {
              n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
            };
            if (!f._fbq) f._fbq = n;
            n.push = n;
            n.loaded = !0;
            n.version = '2.0';
            n.queue = [];
            t = b.createElement(e);
            t.async = !0;
            t.src = v;
            s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s);
          })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
          /* eslint-enable */

          if (window.fbq) {
            window.fbq('init', pixelId);
            trackPageView();
          }
        }
      } catch (err) {
        console.error('Failed to init Meta Pixel:', err);
      }
    };

    initMetaPixel();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
