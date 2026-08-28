'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import {
  Star,
  ShieldCheck,
  Truck,
  Sparkles,
  CheckCircle,
  Clock,
  Layers,
  Gift,
  Heart,
  ChevronRight,
  Loader2,
  Check,
  Eye,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { OrderReceiptModal } from '@/components/OrderReceiptModal';
import { INITIAL_JEWELRY_BOX_PRODUCT } from '@/lib/constants';
import { Order, DeliveryArea, Product } from '@/lib/types';
import { trackViewContent, trackInitiateCheckout, trackPurchase } from '@/lib/pixel';

export default function JewelryBoxLandingPage() {
  const { data: dynamicProduct } = useQuery<Product>({
    queryKey: ['product', 'jewelry-box'],
    queryFn: async () => {
      const res = await axios.get('/api/products?slug=jewelry-box');
      return res.data?.product;
    },
    initialData: INITIAL_JEWELRY_BOX_PRODUCT,
  });

  const product = dynamicProduct || INITIAL_JEWELRY_BOX_PRODUCT;

  // Selected state
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [selectedCombo, setSelectedCombo] = useState(product.combos[1]); // Default to Bestie Combo (Best Deal!)
  const [selectedVariants, setSelectedVariants] = useState<string[]>([
    product.variants[0].nameBn,
    product.variants[1].nameBn,
  ]);
  const [deliveryArea, setDeliveryArea] = useState<DeliveryArea>('inside_dhaka');

  // Form inputs
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Live countdown timer for discount urgency
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 45 });

  useEffect(() => {
    trackViewContent(product.nameBn, product.category, selectedCombo.price);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 5, minutes: 59, seconds: 59 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update selected variants array size when combo changes
  const handleComboSelect = (combo: typeof product.combos[0]) => {
    setSelectedCombo(combo);
    const newVariants: string[] = [];
    for (let i = 0; i < combo.quantity; i++) {
      const v = product.variants[i % product.variants.length];
      newVariants.push(v.nameBn);
    }
    setSelectedVariants(newVariants);
  };

  const handleVariantChange = (index: number, variantName: string) => {
    const updated = [...selectedVariants];
    updated[index] = variantName;
    setSelectedVariants(updated);

    const matchedVariant = product.variants.find((v) => v.nameBn === variantName);
    if (matchedVariant) {
      setSelectedImage(matchedVariant.image);
    }
  };

  const deliveryFee = deliveryArea === 'outside_dhaka' ? 130 : 70;
  const totalAmount = selectedCombo.price + deliveryFee;

  const handlePhoneFocus = () => {
    trackInitiateCheckout(totalAmount, selectedCombo.quantity);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!customerName.trim()) {
      setFormError('অনুগ্রহ করে আপনার পুরো নাম লিখুন।');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length !== 11 || !cleanPhone.startsWith('01')) {
      setFormError('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন (যেমন: 017XXXXXXXX)।');
      return;
    }

    if (!address.trim() || address.trim().length < 8) {
      setFormError('অনুগ্রহ করে আপনার সম্পূর্ণ ও বিস্তারিত ঠিকানা লিখুন (বাড়ি/রোড/এলাকা/থানা/জেলা)।');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post('/api/orders', {
        customerName,
        phone: cleanPhone,
        address,
        deliveryArea,
        productSlug: product.slug,
        productNameBn: product.nameBn,
        comboId: selectedCombo.id,
        comboTitleBn: selectedCombo.titleBn,
        quantity: selectedCombo.quantity,
        selectedVariants,
        subtotal: selectedCombo.price,
        notes,
      });

      if (response.data?.success) {
        const order = response.data.order;
        setCompletedOrder(order);

        // Fire Meta Pixel Purchase event
        trackPurchase(order.orderId, order.totalAmount, order.quantity, order.productNameBn);

        // Reset form fields
        setCustomerName('');
        setPhone('');
        setAddress('');
        setNotes('');
      } else {
        setFormError(response.data?.message || 'অর্ডার সাবমিট করতে সমস্যা হয়েছে।');
      }
    } catch (err: unknown) {
      const errorMessage =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'সার্ভারে সংযোগ করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
      setFormError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Limited Offer Countdown Bar */}
      <div className="bg-rose-900 text-rose-100 py-2.5 px-4 text-center text-xs sm:text-sm font-semibold border-b border-rose-800 flex items-center justify-center gap-3">
        <span className="flex items-center gap-1.5 text-rose-300">
          <Clock className="w-4 h-4 text-rose-400 animate-pulse" />
          <span>সীমিত সময়ের মেগা ডিসকাউন্ট অফার! শেষ হতে বাকি:</span>
        </span>
        <div className="flex items-center gap-1 font-mono font-bold text-white bg-rose-950/80 px-2.5 py-1 rounded-lg border border-rose-700/50">
          <span>{String(timeLeft.hours).padStart(2, '0')}</span>:
          <span>{String(timeLeft.minutes).padStart(2, '0')}</span>:
          <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Main Product Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Visual Gallery */}
          <div className="lg:col-span-6 space-y-4 sticky top-24">
            {/* Main Active Image with Zoom/Badge */}
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-rose-100/80 shadow-xl group">
              <Image
                src={selectedImage}
                alt={product.nameBn}
                fill
                priority
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              {/* Offer Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                <span className="bg-rose-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>বেস্ট সেলার (Best Seller)</span>
                </span>
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md">
                  ১০০% প্রিমিয়াম ফিনিশ
                </span>
              </div>

              <div className="absolute bottom-4 right-4 bg-slate-900/75 backdrop-blur-md text-white text-[11px] px-3 py-1 rounded-full flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-rose-400" />
                <span>ছবিতে ক্লিক করে বড় দেখুন</span>
              </div>
            </div>

            {/* Thumbnail Carousel */}
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all bg-white ${
                    selectedImage === img
                      ? 'border-rose-500 shadow-md ring-2 ring-rose-200'
                      : 'border-slate-200 hover:border-rose-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="100px"
                  />
                </button>
              ))}
            </div>

            {/* Trust Badges Card */}
            <div className="bg-rose-50/70 rounded-2xl p-4 border border-rose-100 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="flex flex-col items-center">
                <Truck className="w-5 h-5 text-rose-600 mb-1" />
                <span className="font-semibold text-slate-800">দ্রুত ডেলিভারি</span>
                <span className="text-[10px] text-slate-500">২৪-৪৮ ঘণ্টায় ঢাকা</span>
              </div>
              <div className="flex flex-col items-center border-x border-rose-200/80">
                <ShieldCheck className="w-5 h-5 text-rose-600 mb-1" />
                <span className="font-semibold text-slate-800">ক্যাশ অন ডেলিভারি</span>
                <span className="text-[10px] text-slate-500">হাতে পেয়ে টাকা</span>
              </div>
              <div className="flex flex-col items-center">
                <Heart className="w-5 h-5 text-rose-600 mb-1" />
                <span className="font-semibold text-slate-800">৭ দিনের গ্যারান্টি</span>
                <span className="text-[10px] text-slate-500">সহজ রিপ্লেসমেন্ট</span>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Fast 1-Click Order Form */}
          <div className="lg:col-span-6 space-y-6">
            {/* Title & Ratings */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-800">{product.rating} / 5.0</span>
                <span className="text-xs text-slate-500">({product.reviewCount}+ ভেরিফায়েড রিভিউ)</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {product.nameBn}
              </h1>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                {product.taglineBn}
              </p>
            </div>

            {/* Price Highlight Banner */}
            <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 rounded-2xl p-4 border border-rose-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-rose-700 uppercase tracking-wide">অফার মূল্য:</span>
                <div className="flex items-baseline gap-2.5 mt-0.5">
                  <span className="text-3xl font-black text-rose-600">৳{selectedCombo.price}</span>
                  <span className="text-sm line-through text-slate-400 font-medium">৳{selectedCombo.originalPrice}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block bg-rose-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow-xs">
                  {selectedCombo.savingsBn}
                </span>
                <p className="text-[10px] text-rose-700 font-semibold mt-1">🚚 ক্যাশ অন ডেলিভারি প্রযোজ্য</p>
              </div>
            </div>

            {/* Step 1: Select Combo Offer (High AOV Booster) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center font-bold">১</span>
                  <span>প্যাকেজ ও কম্বো অফার বেছে নিন:</span>
                </label>
                <span className="text-xs text-rose-600 font-semibold">সেরা সাশ্রয়ী অফার</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {product.combos.map((combo) => {
                  const isSelected = selectedCombo.id === combo.id;
                  return (
                    <button
                      key={combo.id}
                      type="button"
                      onClick={() => handleComboSelect(combo)}
                      className={`relative p-3.5 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-rose-500 bg-rose-50/50 shadow-md ring-1 ring-rose-400'
                          : 'border-slate-200 hover:border-rose-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center border ${
                          isSelected ? 'border-rose-600 bg-rose-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">{combo.titleBn}</span>
                            {combo.badge && (
                              <span className="text-[10px] bg-rose-600 text-white font-bold px-2 py-0.5 rounded-full animate-pulse">
                                {combo.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{combo.subtitleBn}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-base font-extrabold text-rose-600">৳{combo.price}</div>
                        <div className="text-[11px] line-through text-slate-400">৳{combo.originalPrice}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Select Color / Design Variants for each box */}
            <div className="space-y-3 bg-white p-4 rounded-2xl border border-rose-100">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center font-bold">২</span>
                <span>বক্সের কালার ও ডিজাইন সিলেক্ট করুন ({selectedCombo.quantity}টি বক্স):</span>
              </label>

              <div className="space-y-2.5">
                {selectedVariants.map((currentVariantName, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="font-semibold text-slate-700 shrink-0">
                      বক্স #{idx + 1}:
                    </span>
                    <select
                      value={currentVariantName}
                      onChange={(e) => handleVariantChange(idx, e.target.value)}
                      className="w-full bg-white text-slate-800 font-medium py-1.5 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs"
                    >
                      {product.variants.map((v) => (
                        <option key={v.id} value={v.nameBn}>
                          {v.nameBn} {v.inStock ? '' : '(স্টক সীমিত)'}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: Fast 1-Click Order Form */}
            <div id="order-section" className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-rose-400 shadow-xl space-y-4 scroll-mt-24">
              <div className="flex items-center justify-between pb-3 border-b border-rose-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center font-bold">
                    ৩
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">ক্যাশ অন ডেলিভারিতে অর্ডার করুন</h3>
                    <p className="text-[11px] text-slate-500">নিচের ফর্মটি পূরণ করে অর্ডার কনফার্ম করুন</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-full">
                  হাতে পেয়ে টাকা দিন
                </span>
              </div>

              {formError && (
                <div className="bg-rose-50 border border-rose-300 text-rose-700 text-xs p-3 rounded-xl font-medium animate-shake">
                  ⚠️ {formError}
                </div>
              )}

              <form onSubmit={handleSubmitOrder} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    আপনার নাম <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="যেমন: সুমাইয়া আক্তার"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/50"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    মোবাইল নাম্বার (১১ ডিজিট) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onFocus={handlePhoneFocus}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="যেমন: 017XXXXXXXX"
                    maxLength={11}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/50 font-mono"
                  />
                </div>

                {/* Full Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    সম্পূর্ণ ঠিকানা (বাসা/রোড/এলাকা/থানা/জেলা) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="যেমন: বাড়ি ১২, রোড ৪, সেক্টর ৭, উত্তরা, ঢাকা"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/50 resize-none"
                  />
                </div>

                {/* Delivery Area Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    ডেলিভারি এরিয়া সিলেক্ট করুন: <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDeliveryArea('inside_dhaka')}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        deliveryArea === 'inside_dhaka'
                          ? 'border-rose-500 bg-rose-50 text-rose-950 font-bold shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 font-medium'
                      }`}
                    >
                      <div className="text-xs">ঢাকার ভিতরে</div>
                      <div className="text-sm font-extrabold text-rose-600 mt-0.5">৳৭০</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryArea('outside_dhaka')}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        deliveryArea === 'outside_dhaka'
                          ? 'border-rose-500 bg-rose-50 text-rose-950 font-bold shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 font-medium'
                      }`}
                    >
                      <div className="text-xs">ঢাকার বাইরে</div>
                      <div className="text-sm font-extrabold text-rose-600 mt-0.5">৳১৩০</div>
                    </button>
                  </div>
                </div>

                {/* Advance Delivery note for Outside Dhaka */}
                {deliveryArea === 'outside_dhaka' && (
                  <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                    💡 <strong>ঢাকার বাইরের গ্রাহকদের জন্য:</strong> অহেতুক ফেক অর্ডার রোধে এবং পার্সেল দ্রুত বুকিং করতে ডেলিভারি চার্জ ১৩০ টাকা অগ্রিম বিকাশ/নগদে প্রযোজ্য (বাকি ৳{selectedCombo.price} টাকা হাতে পেয়ে দিবেন)।
                  </div>
                )}

                {/* Live Order Summary Breakdown */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>প্রোডাক্ট প্যাকেজ ({selectedCombo.titleBn}):</span>
                    <span className="font-semibold text-slate-900">৳{selectedCombo.price}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>ডেলিভারি চার্জ:</span>
                    <span className="font-semibold text-slate-900">৳{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-300 font-extrabold text-sm text-slate-900">
                    <span>সর্বমোট টাকা:</span>
                    <span className="text-rose-600 text-lg">৳{totalAmount}</span>
                  </div>
                </div>

                {/* Big 1-Click Order Confirmation Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:from-rose-700 hover:to-pink-700 active:scale-[0.98] text-white font-extrabold py-4 px-6 rounded-2xl shadow-xl shadow-rose-500/30 transition-all flex items-center justify-center gap-2 text-base cursor-pointer disabled:opacity-75"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>অর্ডার প্রসেসিং হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>অর্ডার কনফার্ম করুন (৳{totalAmount})</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>১০০% নিরাপদ ও বিশ্বস্ত কেনাকাটা | সুবিন্যাস (subinyas.shop)</span>
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* Section: Features & Specifications */}
        <section className="mt-16 sm:mt-24 pt-12 border-t border-slate-200">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              কেন এটি আপনার সেরা পছন্দ?
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              শখের গহনা যত্নে রাখার নিখুঁত সমাধান
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              দৈনন্দিন সাজগোজ কিংবা দূরপাল্লার ভ্রমণে আপনার বহুমূল্য রিং, ইয়াররিং ও চেইন থাকবে সুরক্ষিত ও সুবিন্যস্ত।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {product.featuresBn.map((feature, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-3xl border border-rose-100/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                  {i === 0 && <Sparkles className="w-6 h-6" />}
                  {i === 1 && <ShieldCheck className="w-6 h-6" />}
                  {i === 2 && <Layers className="w-6 h-6" />}
                  {i === 3 && <Gift className="w-6 h-6" />}
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">{feature.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Specifications Table */}
          <div className="mt-12 bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 max-w-3xl mx-auto shadow-md">
            <h3 className="text-lg font-bold text-slate-900 mb-4 text-center">পণ্যের স্পেসিফিকেশন ও সাইজ</h3>
            <div className="divide-y divide-slate-100 text-xs sm:text-sm">
              {product.specificationsBn.map((spec, i) => (
                <div key={i} className="py-3 flex justify-between">
                  <span className="font-medium text-slate-500">{spec.key}</span>
                  <span className="font-bold text-slate-900 text-right">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section: Bangladeshi Customer Reviews */}
        <section className="mt-16 sm:mt-24 pt-12 border-t border-slate-200">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400" />
              ))}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              গ্রাহকদের অভিজ্ঞতা ও রিভিউ
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              আমাদের সম্মানিত গ্রাহকদের মতামত ও তাদের সন্তুষ্টি
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-sm">
                    স
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">সুমাইয়া রহমান</h4>
                    <p className="text-[11px] text-slate-400">উত্তরা, ঢাকা</p>
                  </div>
                </div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                "Hello Kitty Pink বক্সটি সত্যি অসাধারণ কিউট! মেটেরিয়াল কোয়ালিটি অনেক প্রিমিয়াম। ট্রাভেলে গহনা নেওয়ার জন্য এর চেয়ে ভালো জিনিস আর হয় না।"
              </p>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> ভেরিফায়েড পারচেজার
              </span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-700 font-bold flex items-center justify-center text-sm">
                    আ
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">আফরোজা খান</h4>
                    <p className="text-[11px] text-slate-400">জিইসি, চট্টগ্রাম</p>
                  </div>
                </div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                "আমি বেস্টি কম্বো অফারটি নিয়েছিলাম—একটা আমার জন্য আর অন্যটা বান্ধবীর জন্মদিনে গিফট দিয়েছি। ও দেখে অনেক খুশি হয়েছে! প্যাকেজিং চমৎকার ছিল।"
              </p>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> ভেরিফায়েড পারচেজার
              </span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-sm">
                    ন
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">নুসরাত জাহান</h4>
                    <p className="text-[11px] text-slate-400">সিলেট সদর</p>
                  </div>
                </div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                "ক্যাশ অন ডেলিভারিতে ২ দিনের মধ্যেই পার্সেল হাতে পেয়েছি। ভেলভেট ইনারের কারণে গহনায় কোনো দাগ পড়ে না। সুবিন্যাস শপকে ধন্যবাদ!"
              </p>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> ভেরিফায়েড পারচেজার
              </span>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <div className="mt-16 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 rounded-3xl p-8 text-white text-center shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-xl mx-auto space-y-4">
            <h3 className="text-2xl sm:text-3xl font-black">অফারটি শেষ হওয়ার আগেই অর্ডার করুন</h3>
            <p className="text-xs sm:text-sm text-rose-100">
              স্টক সীমিত! আপনার পছন্দের কালার ও কম্বো বেছে নিন এবং ক্যাশ অন ডেলিভারিতে সংগ্রহ করুন।
            </p>
            <a
              href="#order-section"
              className="inline-flex items-center gap-2 bg-white text-rose-600 hover:bg-rose-50 font-extrabold text-sm sm:text-base py-3.5 px-8 rounded-full shadow-lg transition-transform active:scale-95"
            >
              <span>এখনই অর্ডার করুন</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </main>

      {/* Order Celebration Receipt Modal */}
      {completedOrder && (
        <OrderReceiptModal
          order={completedOrder}
          onClose={() => setCompletedOrder(null)}
        />
      )}
    </div>
  );
}
