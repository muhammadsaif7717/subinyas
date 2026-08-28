import type { Metadata } from 'next';
import { Hind_Siliguri } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { AppLayoutShell } from '@/components/AppLayoutShell';

const hindSiliguri = Hind_Siliguri({
  weight: ['400', '500', '600', '700'],
  subsets: ['bengali', 'latin'],
  variable: '--font-hind-siliguri',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'সুবিন্যাস (subinyas.shop) — পরিপাটী জীবনের নান্দনিক অনুষঙ্গ',
  description:
    'সুবিন্যাস (subinyas.shop) নিয়ে এলো প্রিমিয়াম পোর্টেবল ট্রাভেল জুয়েলারি বক্স ও নান্দনিক লাইফস্টাইল কালেকশন। সারাদেশে দ্রুত ক্যাশ অন ডেলিভারি সুবিধা।',
  keywords: [
    'subinyas',
    'subinyas.shop',
    'সুবিন্যাস',
    'jewelry box bangladesh',
    'travel jewelry organizer bd',
    'hello kitty jewelry box',
    'mini jewelry box',
  ],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className={`${hindSiliguri.variable} scroll-smooth`}>
      <body className="antialiased font-sans bg-white text-slate-900 selection:bg-rose-500 selection:text-white flex flex-col min-h-screen justify-between">
        <Providers>
          <AppLayoutShell>{children}</AppLayoutShell>
        </Providers>
      </body>
    </html>
  );
}
