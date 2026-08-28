'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Phone, MapPin, PackageCheck, Sparkles, MessageCircle, X } from 'lucide-react';
import { Order } from '@/lib/types';

interface OrderReceiptModalProps {
  order: Order;
  onClose: () => void;
}

export function OrderReceiptModal({ order, onClose }: OrderReceiptModalProps) {
  useEffect(() => {
    // Fire celebratory confetti explosion
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#ec4899', '#fb7185', '#10b981', '#f59e0b'],
      });
    } catch {
      // ignore
    }
  }, []);

  const whatsappConfirmMsg = encodeURIComponent(
    `আসসালামু আলাইকুম! আমার অর্ডার আইডি ${order.orderId} (${order.productNameBn})। আমি অর্ডারটি কনফার্ম করতে মেসেজ দিচ্ছি।`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-rose-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-3 shadow-lg shadow-emerald-700/20 animate-bounce duration-700">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight">অভিনন্দন! অর্ডার সফল হয়েছে 🎉</h3>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। অর্ডার আইডি: <span className="font-bold underline text-white">{order.orderId}</span>
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-slate-700 text-sm">
          {/* Order items summary */}
          <div className="bg-rose-50/60 rounded-2xl p-4 border border-rose-100/80">
            <div className="flex items-center gap-2 font-semibold text-rose-950 mb-2">
              <PackageCheck className="w-4 h-4 text-rose-600" />
              <span>পণ্যের বিবরণ</span>
            </div>
            <div className="text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between font-medium text-slate-800">
                <span>{order.productNameBn}</span>
                <span>৳{order.subtotal}</span>
              </div>
              <div className="text-rose-600 font-medium">প্যাকেজ: {order.comboTitleBn}</div>
              <div className="text-slate-500">কালার/ডিজাইন: {order.selectedVariants.join(', ')}</div>
              <div className="flex justify-between pt-2 border-t border-rose-200/60 text-slate-700">
                <span>ডেলিভারি চার্জ ({order.deliveryArea === 'inside_dhaka' ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে'}):</span>
                <span>৳{order.deliveryCharge}</span>
              </div>
              <div className="flex justify-between pt-1 font-bold text-sm text-slate-900">
                <span>সর্বমোট পরিশোধযোগ্য:</span>
                <span className="text-rose-600 font-extrabold text-base">৳{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Customer delivery details */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
            <div className="flex items-start gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-500 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800">{order.customerName}</span> ({order.phone})
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-500 mt-0.5" />
              <div className="text-slate-600">{order.address}</div>
            </div>
          </div>

          {/* Notice box */}
          {order.deliveryArea === 'outside_dhaka' ? (
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-950">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>ঢাকার বাইরের গ্রাহকদের জন্য বিশেষ নির্দেশিকা:</span>
              </div>
              <p>
                অহেতুক ফেক অর্ডার এড়াতে এবং আপনার পার্সেলটি দ্রুত বুকিং নিশ্চিত করতে শুধুমাত্র ডেলিভারি চার্জ (৳{order.deliveryCharge}) অগ্রিম বিকাশ/নগদে পরিশোধ প্রযোজ্য। আমাদের প্রতিনিধি শীঘ্রই আপনাকে কল করবেন।
              </p>
            </div>
          ) : (
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 text-xs text-emerald-900">
              <p className="font-semibold">
                ঢাকার ভেতরে সম্পূর্ণ ক্যাশ অন ডেলিভারি! ২৪-৪৮ ঘণ্টার মধ্যে ডেলিভারি ম্যান আপনার ঠিকানায় পৌঁছে দেবে।
              </p>
            </div>
          )}

          {/* WhatsApp Direct Confirm Button */}
          <a
            href={`https://wa.me/8801700000000?text=${whatsappConfirmMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-2xl shadow-md shadow-emerald-200 transition-all text-xs sm:text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            <span>হোয়াটসঅ্যাপে দ্রুত কনফার্ম করুন</span>
          </a>

          <button
            onClick={onClose}
            className="w-full text-center py-2.5 text-xs text-slate-500 hover:text-slate-700 font-medium"
          >
            উইন্ডো বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}
