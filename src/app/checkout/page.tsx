'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Lock,
} from 'lucide-react';
import axios from 'axios';
import { useCart } from '@/lib/cart-context';
import { DeliveryArea, Order } from '@/lib/types';
import { OrderReceiptModal } from '@/components/OrderReceiptModal';
import { trackInitiateCheckout, trackPurchase } from '@/lib/pixel';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, clearCart, cartSubtotal } = useCart();

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [deliveryArea, setDeliveryArea] = useState<DeliveryArea>('inside_dhaka');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'sslcommerz'>('cod');

  // UI State
  const [couponCode, setCouponCode] = useState('');
  const [isCouponOpen, setIsCouponOpen] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const deliveryFee = deliveryArea === 'outside_dhaka' ? 130 : 70;
  const grandTotal = Math.max(0, cartSubtotal - discount) + deliveryFee;

  useEffect(() => {
    if (cart.length > 0) {
      trackInitiateCheckout(cart.length, cartSubtotal);
    }
  }, [cart, cartSubtotal]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    if (couponCode.trim().toUpperCase() === 'SUB100' || couponCode.trim().toUpperCase() === 'OFFER100') {
      setDiscount(100);
      setCouponMessage('🎉 ৳১০০ ডিসকাউন্ট সফলভাবে প্রয়োগ হয়েছে!');
    } else {
      setCouponMessage('❌ অবৈধ কুপন কোড।');
    }
  };

  const handlePhoneFocus = () => {
    if (cart.length > 0) {
      trackInitiateCheckout(cart.length, cartSubtotal);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!customerName.trim()) {
      setFormError('অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    if (!cleanPhone || cleanPhone.length < 11) {
      setFormError('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন (যেমন: 01712345678)');
      return;
    }

    if (!address.trim()) {
      setFormError('অনুগ্রহ করে আপনার পূর্ণ ডেলিভারি ঠিকানা লিখুন (বাসা/রোড/এলাকা/জেলা)');
      return;
    }

    if (cart.length === 0) {
      setFormError('আপনার কার্ট খালি। অনুগ্রহ করে পণ্য যোগ করুন।');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerName: customerName.trim(),
        phone: cleanPhone,
        address: address.trim(),
        deliveryArea,
        notes: notes.trim(),
        items: cart,
        subtotal: cartSubtotal - discount,
        paymentMethod,
      };

      const res = await axios.post('/api/orders', payload);

      if (res.data?.success && res.data?.order) {
        const orderData = res.data.order as Order;
        setCompletedOrder(orderData);

        // Pixel Purchase tracking
        trackPurchase(orderData.orderId, orderData.totalAmount, cart.length);

        // Clear cart
        clearCart();
      } else {
        setFormError(res.data?.message || 'অর্ডার সম্পন্ন হতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      }
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'অর্ডার সম্পন্ন হতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Notice Banner */}
        {cart.length > 0 && (
          <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-5 py-3.5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-white" />
              <span>
                <strong>&ldquo;{cart[cart.length - 1]?.productName}&rdquo;</strong> has been added to your cart.
              </span>
            </div>
            <Link
              href="/products"
              className="bg-white/20 hover:bg-white/30 text-white font-bold text-xs px-4 py-2 rounded-xl backdrop-blur-xs transition-all whitespace-nowrap"
            >
              Continue Shopping
            </Link>
          </div>
        )}

        {/* Coupon Code Dropdown */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <button
            type="button"
            onClick={() => setIsCouponOpen(!isCouponOpen)}
            className="text-xs sm:text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Have a coupon?</span>
            <span className="text-orange-600 font-bold underline">Click here to enter your code</span>
          </button>

          {isCouponOpen && (
            <form onSubmit={handleApplyCoupon} className="mt-3 flex gap-2 max-w-md pt-2 border-t border-slate-100">
              <input
                type="text"
                placeholder="Coupon code (e.g. SUB100)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-orange-500 uppercase"
              />
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                Apply
              </button>
            </form>
          )}

          {couponMessage && (
            <p className="text-xs font-semibold mt-2 text-emerald-600">{couponMessage}</p>
          )}
        </div>

        {/* Main 2-Column Checkout Layout */}
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: BILLING & SHIPPING */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <span>Billing & Shipping</span>
                <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100 uppercase tracking-wider">
                  Cash on Delivery
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Please provide accurate details below to confirm your order. No advance payment required.
              </p>
            </div>

            {formError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl animate-shake">
                {formError}
              </div>
            )}

            <div className="space-y-4">
              {/* Customer Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onFocus={handlePhoneFocus}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
                <p className="text-[11px] text-slate-400 mt-1">We will call this number to verify your delivery.</p>
              </div>

              {/* Full Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Delivery Address <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="House/Road no, Area, Thana & District..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                />
              </div>

              {/* Delivery Area Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Delivery Location <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      deliveryArea === 'inside_dhaka'
                        ? 'border-orange-500 bg-orange-50/40 text-orange-950 ring-1 ring-orange-500'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="deliveryArea"
                        value="inside_dhaka"
                        checked={deliveryArea === 'inside_dhaka'}
                        onChange={() => setDeliveryArea('inside_dhaka')}
                        className="w-4 h-4 accent-orange-500"
                      />
                      <div>
                        <p className="text-xs font-bold">Inside Dhaka City</p>
                        <p className="text-[10px] text-slate-500">Home Delivery (24-48 hrs)</p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold font-mono text-orange-600">৳70</span>
                  </label>

                  <label
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      deliveryArea === 'outside_dhaka'
                        ? 'border-orange-500 bg-orange-50/40 text-orange-950 ring-1 ring-orange-500'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="deliveryArea"
                        value="outside_dhaka"
                        checked={deliveryArea === 'outside_dhaka'}
                        onChange={() => setDeliveryArea('outside_dhaka')}
                        className="w-4 h-4 accent-orange-500"
                      />
                      <div>
                        <p className="text-xs font-bold">Outside Dhaka</p>
                        <p className="text-[10px] text-slate-500">All Bangladesh (2-4 days)</p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold font-mono text-orange-600">৳130</span>
                  </label>
                </div>
              </div>

              {/* Order Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Order Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Special instructions or delivery landmark..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-slate-600 text-xs font-medium">
                <Truck className="w-4 h-4 text-orange-500 shrink-0" />
                <span>Cash on Delivery across Bangladesh</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 text-xs font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>100% Genuine Quality Guarantee</span>
              </div>
            </div>
          </div>

          {/* Right Column: YOUR ORDER */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900 uppercase tracking-tight">
                Your Order
              </h2>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {cart.length} {cart.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
                <p className="text-sm font-semibold text-slate-500">Your cart is currently empty</p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-all"
                >
                  <span>Browse Products</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100"
                  >
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
                      <Image
                        src={item.image || '/images/products/hello-kitty-pair.png'}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {item.productName}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold text-orange-700 bg-orange-100/80 px-2 py-0.5 rounded-md border border-orange-200">
                          {item.comboTitle || 'Standard Package'}
                        </span>
                      </div>
                      {item.selectedVariants && item.selectedVariants.length > 0 && (
                        <div className="mt-1 text-[11px] text-slate-600 bg-slate-100/70 p-1.5 rounded-lg border border-slate-200/60">
                          <span className="font-semibold text-slate-700 block text-[10px] uppercase text-orange-600">Selected Colors:</span>
                          <span className="text-slate-800 font-medium text-[11px]">
                            {item.selectedVariants.length > 1
                              ? item.selectedVariants.map((v, i) => `#${i + 1} ${v}`).join(' • ')
                              : item.selectedVariants[0]}
                          </span>
                        </div>
                      )}

                      {/* Quantity Controller */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-mono font-bold text-slate-900 min-w-[20px] text-center">
                            {item.quantity} {item.quantity > 1 ? 'Packs' : 'Pack'}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-xs font-extrabold text-slate-900 font-mono">
                          ৳{item.price * item.quantity}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Calculations Summary */}
            {cart.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">৳{cartSubtotal}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between items-center text-emerald-600 font-bold">
                    <span>Discount</span>
                    <span className="font-mono">-৳{discount}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span>Delivery Charge ({deliveryArea === 'outside_dhaka' ? 'Outside Dhaka' : 'Inside Dhaka'})</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">৳{deliveryFee}</span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-200 text-base font-extrabold text-slate-900">
                  <span>Total</span>
                  <span className="font-mono text-xl text-orange-600">৳{grandTotal}</span>
                </div>

                {/* Payment Methods */}
                <div className="pt-4 space-y-2">
                  <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-orange-50/60 border border-orange-200/80 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-0.5 w-4 h-4 accent-orange-500"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Cash on Delivery (ক্যাশ অন ডেলিভারি)</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Pay with cash after inspecting the product upon delivery.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Submit Order Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold text-sm sm:text-base transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing Order...</span>
                    </span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Confirm Order • ৳{grandTotal}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Order Success Receipt Modal */}
      {completedOrder && (
        <OrderReceiptModal order={completedOrder} onClose={() => setCompletedOrder(null)} />
      )}
    </div>
  );
}
