'use client';

import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface FloatingWhatsAppProps {
  productName?: string;
}

export function FloatingWhatsApp({ productName = 'জুয়েলারি বক্স' }: FloatingWhatsAppProps) {
  const [showTooltip, setShowTooltip] = useState(true);

  const { data } = useQuery({
    queryKey: ['store-settings'],
    queryFn: async () => {
      const res = await axios.get('/api/settings');
      return res.data?.settings;
    },
  });

  const whatsappNumber = data?.whatsappNumber || '8801700000000';
  const defaultMessage = encodeURIComponent(
    `আসসালামু আলাইকুম! আমি সুবিন্যাস (subinyas.shop) থেকে ${productName} সম্পর্কে বিস্তারিত জানতে ও অর্ডার করতে চাই।`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${defaultMessage}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 group">
      {showTooltip && (
        <div className="relative bg-white text-slate-800 text-xs sm:text-sm font-medium py-2 px-3.5 rounded-2xl shadow-xl border border-rose-100 flex items-center gap-2 max-w-[240px] animate-bounce duration-1000">
          <span>💬 যেকোনো প্রশ্ন থাকলে হোয়াটসঅ্যাপে সরাসরি কথা বলুন!</span>
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowTooltip(false);
            }}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
            aria-label="Close tooltip"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-semibold px-4 py-3 rounded-full shadow-lg shadow-emerald-500/30 transition-all duration-200 border-2 border-white cursor-pointer"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 fill-current" />
        <span className="text-sm hidden sm:inline-block font-medium">WhatsApp চ্যাট</span>
      </a>
    </div>
  );
}
