import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 font-sans selection:bg-rose-500 selection:text-white">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
