'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  Settings as SettingsIcon,
  Save,
  Check,
  RefreshCw,
  Phone,
  MessageCircle,
  Truck,
  Sparkles,
  Layers,
  Store,
} from 'lucide-react';
import { StoreSettings } from '@/lib/types';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const cardCls = 'bg-[#211C28] rounded-2xl border border-[#2E2733]';

  // Fetch Settings
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const res = await axios.get('/api/settings');
      return res.data?.settings as StoreSettings;
    },
  });

  // State
  const [storeName, setStoreName] = useState('Subinyas');
  const [storeNameBn, setStoreNameBn] = useState('সুবিন্যাস');
  const [metaPixelId, setMetaPixelId] = useState('');
  const [isPixelActive, setIsPixelActive] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryInside, setDeliveryInside] = useState(70);
  const [deliveryOutside, setDeliveryOutside] = useState(130);
  const [announcement, setAnnouncement] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    if (settingsData) {
      setStoreName(settingsData.storeName || 'Subinyas');
      setStoreNameBn(settingsData.storeNameBn || 'সুবিন্যাস');
      setMetaPixelId(settingsData.metaPixelId || '');
      setIsPixelActive(settingsData.isPixelActive !== false);
      setWhatsappNumber(settingsData.whatsappNumber || '');
      setPhone(settingsData.phone || '');
      setDeliveryInside(settingsData.deliveryInsideDhaka ?? 70);
      setDeliveryOutside(settingsData.deliveryOutsideDhaka ?? 130);
      setAnnouncement(settingsData.announcementTextBn || '');
    }
  }, [settingsData]);

  // Save Settings Mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (payload: Partial<StoreSettings>) => {
      const res = await axios.post('/api/settings', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['store-settings'] });
      setSaveSuccess('স্টোর কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!');
      setTimeout(() => setSaveSuccess(''), 3000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettingsMutation.mutate({
      storeName,
      storeNameBn,
      metaPixelId,
      isPixelActive,
      whatsappNumber,
      phone,
      deliveryInsideDhaka: Number(deliveryInside),
      deliveryOutsideDhaka: Number(deliveryOutside),
      announcementTextBn: announcement,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className={`${cardCls} p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-[#DDA876]" />
            <span>Store Configuration & Settings</span>
          </h2>
          <p className="text-xs text-[#8A7D97] mt-0.5">
            Configure delivery charges, Facebook Pixel tracking, customer support numbers, and announcements
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-[#6FAE8C]/15 border border-[#6FAE8C]/30 text-xs font-semibold text-[#8FC7A9] flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{saveSuccess}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Meta Pixel & Marketing */}
        <div className={`${cardCls} p-5 sm:p-6 space-y-4`}>
          <div className="flex items-center justify-between border-b border-[#2E2733] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C4587A]" />
                <span>Facebook Meta Pixel Tracking</span>
              </h3>
              <p className="text-xs text-[#8A7D97]">
                Track conversions, PageViews, AddToCart, and Purchase events automatically
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
              <input
                type="checkbox"
                checked={isPixelActive}
                onChange={(e) => setIsPixelActive(e.target.checked)}
                className="rounded accent-[#C4587A]"
              />
              <span>Pixel Active</span>
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white">Meta Pixel ID / Dataset ID</label>
            <input
              type="text"
              value={metaPixelId}
              onChange={(e) => setMetaPixelId(e.target.value)}
              placeholder="e.g. 123456789012345"
              className="w-full bg-[#191520] border border-[#2E2733] focus:border-[#C4587A] text-xs text-white rounded-xl px-3 py-2.5 outline-none font-mono"
            />
          </div>
        </div>

        {/* Customer Support Numbers */}
        <div className={`${cardCls} p-5 sm:p-6 space-y-4`}>
          <div className="border-b border-[#2E2733] pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#8FB0D9]" />
              <span>Customer Contact & Support</span>
            </h3>
            <p className="text-xs text-[#8A7D97]">
              Numbers used for instant WhatsApp order alerts and direct phone support
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-[#6FAE8C]" />
                <span>WhatsApp Order Support Number</span>
              </label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="e.g. 01700000000"
                className="w-full bg-[#191520] border border-[#2E2733] focus:border-[#C4587A] text-xs text-white rounded-xl px-3 py-2.5 outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#8FB0D9]" />
                <span>Primary Hotline Phone</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 01800000000"
                className="w-full bg-[#191520] border border-[#2E2733] focus:border-[#C4587A] text-xs text-white rounded-xl px-3 py-2.5 outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Delivery Charges */}
        <div className={`${cardCls} p-5 sm:p-6 space-y-4`}>
          <div className="border-b border-[#2E2733] pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#8FC7A9]" />
              <span>Standard Delivery Charges (Cash on Delivery)</span>
            </h3>
            <p className="text-xs text-[#8A7D97]">
              Shipping charges calculated dynamically during checkout
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white">Inside Dhaka (৳)</label>
              <input
                type="number"
                value={deliveryInside}
                onChange={(e) => setDeliveryInside(Number(e.target.value))}
                className="w-full bg-[#191520] border border-[#2E2733] focus:border-[#C4587A] text-xs text-white rounded-xl px-3 py-2.5 outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white">Outside Dhaka (৳)</label>
              <input
                type="number"
                value={deliveryOutside}
                onChange={(e) => setDeliveryOutside(Number(e.target.value))}
                className="w-full bg-[#191520] border border-[#2E2733] focus:border-[#C4587A] text-xs text-white rounded-xl px-3 py-2.5 outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Announcement Header */}
        <div className={`${cardCls} p-5 sm:p-6 space-y-4`}>
          <div className="border-b border-[#2E2733] pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Store className="w-4 h-4 text-[#E4BC79]" />
              <span>Storefront Announcement Banner</span>
            </h3>
            <p className="text-xs text-[#8A7D97]">
              Banner displayed at the top of every page on the live website
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white">Announcement Text (Bengali)</label>
            <input
              type="text"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="e.g. 🌸 স্পেশাল অফার! যেকোনো ২টি জুয়েলারি বক্স অর্ডারে ডেলিভারি সম্পূর্ণ ফ্রি!"
              className="w-full bg-[#191520] border border-[#2E2733] focus:border-[#C4587A] text-xs text-white rounded-xl px-3 py-2.5 outline-none"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saveSettingsMutation.isPending}
            className="px-6 py-3 rounded-xl bg-[#C4587A] hover:bg-[#B24A6B] text-white text-xs font-bold shadow-lg shadow-[#C4587A]/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            {saveSettingsMutation.isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Store Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
