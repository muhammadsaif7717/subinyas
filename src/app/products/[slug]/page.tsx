'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { useParams } from 'next/navigation';
import {
  Star,
  ShieldCheck,
  Truck,
  Check,
  Layers,
  Gift,
  Loader2,
  ShoppingBag,
  Heart,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '@/lib/cart-context';
import { ProductReviews } from '@/components/ProductReviews';
import { OrderReceiptModal } from '@/components/OrderReceiptModal';
import { INITIAL_JEWELRY_BOX_PRODUCT } from '@/lib/constants';
import { Order, DeliveryArea, Product } from '@/lib/types';
import { trackViewContent, trackInitiateCheckout, trackPurchase } from '@/lib/pixel';

export default function DynamicProductPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'jewelry-box';
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();

  const { data: dynamicProduct, isLoading } = useQuery<Product>({
    queryKey: ['product', slug],
    queryFn: async () => {
      const res = await axios.get(`/api/products?slug=${slug}`);
      return res.data?.product;
    },
    initialData: slug === 'jewelry-box' ? INITIAL_JEWELRY_BOX_PRODUCT : undefined,
  });

  const product = dynamicProduct || INITIAL_JEWELRY_BOX_PRODUCT;

  // Selected state
  const [selectedImage, setSelectedImage] = useState(product.images[0] || '/images/products/hello-kitty-pair.png');
  const [selectedCombo, setSelectedCombo] = useState(product.combos[1] || product.combos[0]);
  const [selectedVariants, setSelectedVariants] = useState<string[]>([
    product.variants[0]?.nameBn || 'Default',
    product.variants[1]?.nameBn || 'Default',
  ]);
  const [deliveryArea, setDeliveryArea] = useState<DeliveryArea>('inside_dhaka');

  // Sync state when product loads
  useEffect(() => {
    if (product) {
      setSelectedImage(product.images[0]);
      setSelectedCombo(product.combos[1] || product.combos[0]);
      const initialVars: string[] = [];
      const qty = product.combos[1]?.quantity || 1;
      for (let i = 0; i < qty; i++) {
        initialVars.push(product.variants[i % product.variants.length]?.nameBn || 'Default');
      }
      setSelectedVariants(initialVars);
      trackViewContent(product.nameBn, product.category, product.basePrice);
    }
  }, [product]);

  // Form inputs
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const handleComboSelect = (combo: typeof product.combos[0]) => {
    setSelectedCombo(combo);
    const newVariants: string[] = [];
    for (let i = 0; i < combo.quantity; i++) {
      const v = product.variants[i % product.variants.length];
      newVariants.push(v?.nameBn || 'Default');
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
  const currentPrice = selectedCombo?.price || product.basePrice;
  const totalAmount = currentPrice + deliveryFee;

  const handlePhoneFocus = () => {
    trackInitiateCheckout(totalAmount, selectedCombo?.quantity || 1);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!customerName.trim()) {
      setFormError('আপনার পুরো নাম লিখুন।');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length !== 11 || !cleanPhone.startsWith('01')) {
      setFormError('সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন (যেমন: 017XXXXXXXX)।');
      return;
    }

    if (!address.trim() || address.trim().length < 8) {
      setFormError('সম্পূর্ণ ঠিকানা লিখুন (বাসা/রোড/এলাকা/জেলা)।');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post('/api/orders', {
        customerName: customerName.trim(),
        phone: cleanPhone,
        address: address.trim(),
        deliveryArea,
        productSlug: product.slug,
        productNameBn: product.nameBn,
        comboId: selectedCombo?.id || 'combo-single',
        comboTitleBn: selectedCombo?.titleBn || '১টি বক্স',
        quantity: selectedCombo?.quantity || 1,
        selectedVariants,
        subtotal: currentPrice,
        notes,
      });

      if (response.data?.success) {
        const order = response.data.order;
        setCompletedOrder(order);
        trackPurchase(order.orderId, order.totalAmount, order.quantity, order.productNameBn);

        setCustomerName('');
        setPhone('');
        setAddress('');
        setNotes('');
      } else {
        setFormError(response.data?.message || 'অর্ডার সম্পন্ন হয়নি।');
      }
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'সার্ভারে সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !dynamicProduct) {
    return <div className="py-24 text-center text-slate-400">Loading product details...</div>;
  }

  return (
    <div className="w-full bg-white text-slate-900">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-16">
        {/* Product Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Visual Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200">
              <Image
                src={selectedImage}
                alt={product.nameBn}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative aspect-square rounded-xl overflow-hidden border transition-all cursor-pointer ${
                      selectedImage === img
                        ? 'border-slate-900 ring-1 ring-slate-900'
                        : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`Thumb ${idx + 1}`} fill className="object-cover" sizes="100px" />
                  </button>
                ))}
              </div>
            )}

            {/* Subtle Trust Line */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 px-1">
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-slate-700" />
                <span>সারাদেশে ক্যাশ অন ডেলিভারি</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-slate-700" />
                <span>৭ দিনের রিপ্লেসমেন্ট</span>
              </div>
            </div>
          </div>

          {/* Right Column: Information & Checkout */}
          <div className="lg:col-span-6 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                  ))}
                </div>
                <span className="font-semibold text-slate-800">{product.rating}</span>
                <span>({product.reviewCount} রিভিউ)</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {product.nameBn}
              </h1>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                {product.descriptionBn}
              </p>
            </div>

            {/* Price Header */}
            <div className="flex items-baseline gap-3 pb-4 border-b border-slate-100">
              <span className="text-3xl font-bold text-slate-900">৳{selectedCombo?.price || product.basePrice}</span>
              <span className="text-sm line-through text-slate-400">৳{selectedCombo?.originalPrice || product.originalPrice}</span>
              {selectedCombo?.savingsBn && (
                <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md">
                  {selectedCombo.savingsBn}
                </span>
              )}
            </div>

            {/* 1. Combo Selector */}
            {product.combos?.length > 0 && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  প্যাকেজ নির্বাচন করুন:
                </label>

                <div className="grid grid-cols-1 gap-2.5">
                  {product.combos.map((combo) => {
                    const isSelected = selectedCombo?.id === combo.id;
                    return (
                      <button
                        key={combo.id}
                        type="button"
                        onClick={() => handleComboSelect(combo)}
                        className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'border-slate-900 bg-slate-50'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{combo.titleBn}</div>
                            <div className="text-xs text-slate-500">{combo.subtitleBn}</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-bold text-slate-900">৳{combo.price}</div>
                          <div className="text-[11px] line-through text-slate-400">৳{combo.originalPrice}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Color Selection */}
            {product.variants?.length > 0 && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  কালার ও ডিজাইন ({selectedCombo?.quantity || 1} টি বক্স):
                </label>

                <div className="space-y-2">
                  {selectedVariants.map((currentVariantName, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                      <span className="font-semibold text-slate-600 shrink-0">বক্স {idx + 1}:</span>
                      <select
                        value={currentVariantName}
                        onChange={(e) => handleVariantChange(idx, e.target.value)}
                        className="w-full bg-white text-slate-800 py-1.5 px-3 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-800 cursor-pointer"
                      >
                        {product.variants.map((v) => (
                          <option key={v.id} value={v.nameBn}>
                            {v.nameBn}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                {/* Quick Cart / Wishlist Action Row */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      addToCart({
                        productSlug: product.slug,
                        productName: product.name,
                        productNameBn: product.nameBn,
                        image: selectedImage,
                        comboId: selectedCombo?.id || 'combo-single',
                        comboTitleBn: selectedCombo?.titleBn || '১টি বক্স',
                        selectedVariants,
                        price: currentPrice,
                        quantity: 1,
                      });
                    }}
                    className="flex-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (isInWishlist(product.slug)) {
                        removeFromWishlist(product.slug);
                      } else {
                        addToWishlist({
                          id: product.id,
                          productSlug: product.slug,
                          productName: product.name,
                          productNameBn: product.nameBn,
                          image: product.images[0],
                          price: product.basePrice,
                          rating: product.rating,
                        });
                      }
                    }}
                    className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                      isInWishlist(product.slug)
                        ? 'bg-rose-50 border-rose-200 text-rose-600'
                        : 'bg-white border-slate-300 text-slate-600 hover:text-rose-600'
                    }`}
                    title="Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${isInWishlist(product.slug) ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>
              </div>
            )}

            {/* 3. Clean Order Form */}
            <div id="order-section" className="bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                ডেলিভারি তথ্য ও ক্যাশ অন ডেলিভারি অর্ডার
              </h3>

              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-lg font-medium">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmitOrder} className="space-y-3.5 text-xs sm:text-sm">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">আপনার নাম *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="নাম লিখুন"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">মোবাইল নাম্বার (১১ ডিজিট) *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onFocus={handlePhoneFocus}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    maxLength={11}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">সম্পূর্ণ ঠিকানা *</label>
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="বাসা, রোড, এলাকা, জেলা"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-900 resize-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1.5">ডেলিভারি এরিয়া *</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDeliveryArea('inside_dhaka')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        deliveryArea === 'inside_dhaka'
                          ? 'border-slate-900 bg-white shadow-xs font-semibold'
                          : 'border-slate-200 bg-slate-100 text-slate-500'
                      }`}
                    >
                      <div className="text-xs text-slate-600">ঢাকার ভিতরে</div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5">৳৭০</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryArea('outside_dhaka')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        deliveryArea === 'outside_dhaka'
                          ? 'border-slate-900 bg-white shadow-xs font-semibold'
                          : 'border-slate-200 bg-slate-100 text-slate-500'
                      }`}
                    >
                      <div className="text-xs text-slate-600">ঢাকার বাইরে</div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5">৳১৩০</div>
                    </button>
                  </div>
                </div>

                {deliveryArea === 'outside_dhaka' && (
                  <p className="text-[11px] text-slate-500 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                    ℹ️ ঢাকার বাইরে অহেতুক ফেক অর্ডার এড়াতে ডেলিভারি চার্জ (৳১৩০) অগ্রিম বিকাশ/নগদ প্রযোজ্য, বাকি টাকা পণ্য হাতে পেয়ে পরিশোধ করবেন।
                  </p>
                )}

                {/* Total Summary */}
                <div className="pt-3 border-t border-slate-200 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>পণ্য মূল্য:</span>
                    <span>৳{currentPrice}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>ডেলিভারি চার্জ:</span>
                    <span>৳{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                    <span>সর্বমোট:</span>
                    <span>৳{totalAmount}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>প্রসেস হচ্ছে...</span>
                    </>
                  ) : (
                    <span>অর্ডার কনফার্ম করুন (৳{totalAmount})</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Features Section */}
        {product.featuresBn?.length > 0 && (
          <div className="pt-12 border-t border-slate-100 space-y-8">
            <div className="text-center max-w-xl mx-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">পণ্যের বিশেষত্ব</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {product.taglineBn}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {product.featuresBn.slice(0, 3).map((f, i) => (
                <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  {i === 0 && <Layers className="w-5 h-5 text-slate-800" />}
                  {i === 1 && <ShieldCheck className="w-5 h-5 text-slate-800" />}
                  {i === 2 && <Gift className="w-5 h-5 text-slate-800" />}
                  <h3 className="text-sm font-bold text-slate-900">{f.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer Reviews & Ratings */}
        <ProductReviews
          productSlug={product.slug}
          productNameBn={product.nameBn}
        />
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
