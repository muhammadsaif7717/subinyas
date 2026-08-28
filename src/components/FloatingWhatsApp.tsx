'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface FloatingWhatsAppProps {
  productName?: string;
}

export function FloatingWhatsApp({ productName = 'জুয়েলারি বক্স' }: FloatingWhatsAppProps) {
  const { data } = useQuery({
    queryKey: ['store-settings'],
    queryFn: async () => {
      const res = await axios.get('/api/settings');
      return res.data?.settings;
    },
  });

  const whatsappNumber = data?.whatsappNumber || '8801617492486';
  const defaultMessage = encodeURIComponent(
    `আসসালামু আলাইকুম! আমি সুবিন্যাস (subinyas.shop) থেকে ${productName} অর্ডার করতে চাই।`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${defaultMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-13 h-13 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:shadow-xl cursor-pointer"
      aria-label="Chat on WhatsApp"
      title="WhatsApp Support"
    >
      <MessageCircle className="w-6 h-6 fill-white stroke-none" />
    </a>
  );
}
