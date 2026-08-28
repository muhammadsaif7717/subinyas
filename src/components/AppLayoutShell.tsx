'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { FloatingWhatsApp } from './FloatingWhatsApp';

export function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide Navbar, Footer, and WhatsApp button on /login and /admin routes
  const isAuthOrAdminPage = pathname === '/login' || pathname?.startsWith('/admin');

  if (isAuthOrAdminPage) {
    return <main className="min-h-screen flex flex-col justify-center">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
