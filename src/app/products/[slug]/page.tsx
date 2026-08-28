'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import {
  Star,
  ShieldCheck,
  Truck,
  Check,
  Layers,
  Gift,
  ShoppingBag,
  Heart,
  Eye,
  ArrowRight,
  Share2,
  ChevronRight,
  Sparkles,
  Plus,
  Minus,
  CheckCircle2,
  RefreshCw,
  Award,
  AlertCircle,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '@/lib/cart-context';
import { ProductReviews } from '@/components/ProductReviews';
import { INITIAL_JEWELRY_BOX_PRODUCT } from '@/lib/constants';
import { Product, ProductVariant, ComboOption } from '@/lib/types';
import { trackViewContent, trackAddToCart, trackInitiateCheckout } from '@/lib/pixel';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || 'jewelry-box';
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist, setIsCartOpen } = useCart();

  // Active Tab for details
  const [activeTab, setActiveTab] = useState<'description' | 'features' | 'specifications' | 'reviews' | 'shipping'>('description');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedToast, setAddedToast] = useState(false);

  // Fetch product data
  const { data: dynamicProduct, isLoading } = useQuery<Product>({
    queryKey: ['product', slug],
    queryFn: async () => {
      const res = await axios.get(`/api/products?slug=${slug}`);
      return res.data?.product;
    },
  });

  // Fetch all products for Related items
  const { data: allProductsData } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await axios.get('/api/products');
      return res.data?.products || [];
    },
  });

  const product = dynamicProduct;

  // Selected State
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedCombo, setSelectedCombo] = useState<ComboOption | null>(null);

  useEffect(() => {
    if (product) {
      setSelectedImage(product.images?.[0] || '/images/products/hello-kitty-pair.png');
      if (product.variants?.length > 0) {
        const firstInStock = product.variants.find(
          (v) => v.inStock !== false && (v.stockCount === undefined || Number(v.stockCount) > 0)
        );
        setSelectedVariant(firstInStock || product.variants[0]);
      }
      if (product.combos?.length > 0) {
        setSelectedCombo(product.combos[0]);
      }
      trackViewContent(product.nameBn, product.category, product.basePrice);
    }
  }, [product]);

  // Related products
  const relatedProducts = useMemo(() => {
    if (!allProductsData || !product) return [];
    return allProductsData
      .filter((p) => p.slug !== product.slug && p.isActive !== false)
      .slice(0, 4);
  }, [allProductsData, product]);

  // Sorted variants: available in-stock first, sold out variants last
  const sortedVariants = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return [];
    return [...product.variants].sort((a, b) => {
      const aInStock = a.inStock !== false && (a.stockCount === undefined || Number(a.stockCount) > 0);
      const bInStock = b.inStock !== false && (b.stockCount === undefined || Number(b.stockCount) > 0);
      if (aInStock === bInStock) return 0;
      return aInStock ? -1 : 1;
    });
  }, [product?.variants]);

  if (isLoading || !product) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading product details...</p>
        </div>
      </div>
    );
  }

  const currentPrice =
    selectedCombo && selectedCombo.quantity > 1 ? selectedCombo.price : product.basePrice;
  const currentOriginalPrice =
    selectedCombo && selectedCombo.quantity > 1 ? selectedCombo.originalPrice : product.originalPrice;
  const savings = Math.max(0, currentOriginalPrice - currentPrice);
  const discountPercent =
    currentOriginalPrice > 0 ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100) : 0;
  const inWish = isInWishlist(product.slug);

  const isVariantOutOfStock = Boolean(
    selectedVariant &&
      (selectedVariant.inStock === false ||
        (selectedVariant.stockCount !== undefined && Number(selectedVariant.stockCount) <= 0))
  );

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    if (variant.image) {
      setSelectedImage(variant.image);
    }
  };

  const handleAddToCart = () => {
    if (isVariantOutOfStock) return;

    addToCart({
      productSlug: product.slug,
      productName: product.name,
      productNameBn: product.nameBn,
      image: selectedImage || product.images[0],
      comboId: selectedCombo?.id || 'standard',
      comboTitleBn: selectedCombo?.titleBn || 'Single Pack',
      selectedVariants: selectedVariant ? [selectedVariant.name || selectedVariant.nameBn] : ['Standard'],
      price: currentPrice,
      quantity,
    });

    trackAddToCart(product.name, currentPrice * quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const handleBuyNow = () => {
    if (isVariantOutOfStock) return;

    addToCart({
      productSlug: product.slug,
      productName: product.name,
      productNameBn: product.nameBn,
      image: selectedImage || product.images[0],
      comboId: selectedCombo?.id || 'standard',
      comboTitleBn: selectedCombo?.titleBn || 'Single Pack',
      selectedVariants: selectedVariant ? [selectedVariant.name || selectedVariant.nameBn] : ['Standard'],
      price: currentPrice,
      quantity,
    });

    trackInitiateCheckout(1, currentPrice * quantity);
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans pb-16">
      {/* Toast Notification when item is added */}
      {addedToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="text-xs font-bold">Added to Cart!</p>
            <p className="text-[10px] text-slate-400">Click checkout to place your order</p>
          </div>
          <Link
            href="/checkout"
            className="ml-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            Checkout
          </Link>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 border-b border-slate-100">
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <Link href="/products" className="hover:text-slate-900 transition-colors">
            {product.category || 'Products'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-900 font-medium truncate max-w-[200px] sm:max-w-md">
            {product.name}
          </span>
        </nav>
      </div>

      {/* Main Showcase Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            {/* Primary Main Image Frame */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-50 border border-slate-200 shadow-sm group">
              <Image
                src={selectedImage || product.images[0] || '/images/products/hello-kitty-pair.png'}
                alt={product.nameBn}
                fill
                priority
                className="object-cover transition-all duration-300 group-hover:scale-105"
              />

              {/* Discount / Hot Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                {discountPercent > 0 && (
                  <span className="bg-rose-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-md">
                    -{discountPercent}% OFF
                  </span>
                )}
                {product.isFeatured && (
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
                    HOT
                  </span>
                )}
              </div>

              {/* Floating Wishlist Heart Button */}
              <button
                type="button"
                onClick={() => {
                  if (inWish) removeFromWishlist(product.slug);
                  else
                    addToWishlist({
                      id: `wish-${Date.now()}`,
                      productSlug: product.slug,
                      productName: product.name,
                      productNameBn: product.nameBn,
                      image: selectedImage || product.images[0],
                      price: currentPrice,
                    });
                }}
                className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/90 hover:bg-white text-slate-400 hover:text-rose-500 shadow-md hover:shadow-lg transition-all cursor-pointer backdrop-blur-xs active:scale-90"
                title={inWish ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart
                  className={`w-5 h-5 transition-transform ${
                    inWish ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-500 hover:text-rose-500'
                  }`}
                />
              </button>
            </div>

            {/* Thumbnail Strip */}
            {product.images && product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-50 border-2 transition-all shrink-0 cursor-pointer ${
                      selectedImage === img
                        ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details, Variants & Direct Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200/60 uppercase tracking-wider">
                  {product.category || 'Exclusive'}
                </span>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.rating?.toFixed(1) || '5.0'}</span>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className="text-slate-400 font-normal hover:underline cursor-pointer"
                  >
                    ({product.reviewCount || 0} reviews)
                  </button>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
                {product.name || product.nameBn}
              </h1>
              {product.taglineBn && product.taglineBn !== product.name && (
                <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                  {product.taglineBn}
                </p>
              )}
            </div>

            {/* Price & Savings */}
            <div className="flex items-baseline gap-3 pt-2 border-t border-slate-100">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono">
                ৳{currentPrice}
              </span>
              {currentOriginalPrice > currentPrice && (
                <span className="text-base sm:text-lg line-through text-slate-400 font-mono">
                  ৳{currentOriginalPrice}
                </span>
              )}
              {savings > 0 && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60">
                  Save ৳{savings}
                </span>
              )}
            </div>

            {/* Variant Selection */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Variant
                </label>

                <div className="flex flex-wrap gap-2.5">
                  {sortedVariants.map((v) => {
                    const isOutOfStock =
                      v.inStock === false || (v.stockCount !== undefined && Number(v.stockCount) <= 0);
                    const isSelected = selectedVariant?.id === v.id;

                    return (
                      <button
                        key={v.id}
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => {
                          if (!isOutOfStock) {
                            handleVariantSelect(v);
                          }
                        }}
                        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                          isOutOfStock
                            ? 'border-slate-200 bg-slate-50 text-slate-400 opacity-50 cursor-not-allowed'
                            : isSelected
                            ? 'border-orange-500 bg-orange-50/70 text-slate-900 font-semibold ring-1.5 ring-orange-500 shadow-xs cursor-pointer'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-900 cursor-pointer'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs shrink-0"
                          style={{ backgroundColor: v.colorHex || '#ddd' }}
                        />

                        <span>{v.name || v.nameBn}</span>

                        {isOutOfStock && (
                          <span className="text-[10px] text-slate-400 font-normal">
                            (Sold out)
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Combo / Package Deals */}
            {product.combos && product.combos.length > 1 && (
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Combo Package:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {product.combos.map((combo) => (
                    <button
                      key={combo.id}
                      type="button"
                      onClick={() => setSelectedCombo(combo)}
                      className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                        selectedCombo?.id === combo.id
                          ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-900">{combo.titleBn}</span>
                        {combo.isPopular && (
                          <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            Popular
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-sm font-extrabold text-slate-900 font-mono">
                          ৳{combo.price}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold">{combo.savingsBn}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Main Action Buttons (Add to Cart & Buy Now) */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center gap-3">
                {/* Add To Cart Button */}
                <button
                  type="button"
                  disabled={isVariantOutOfStock}
                  onClick={handleAddToCart}
                  className={`flex-1 h-12 sm:h-13 font-bold text-xs sm:text-sm px-5 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-[0.99] ${
                    isVariantOutOfStock
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 shadow-none cursor-not-allowed'
                      : 'bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-900 shadow-xs hover:border-slate-800 cursor-pointer'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isVariantOutOfStock ? 'Out of Stock' : 'Add To Cart'}</span>
                </button>

                {/* Buy Now Button (Instant Checkout) */}
                <button
                  type="button"
                  disabled={isVariantOutOfStock}
                  onClick={handleBuyNow}
                  className={`flex-1 h-12 sm:h-13 font-extrabold text-xs sm:text-sm px-5 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.99] ${
                    isVariantOutOfStock
                      ? 'bg-slate-200 text-slate-400 border border-slate-300 shadow-none cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-orange-500/25 cursor-pointer'
                  }`}
                >
                  <span>{isVariantOutOfStock ? 'Currently Unavailable' : 'Buy Now'}</span>
                  {!isVariantOutOfStock && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Assurance / Trust Points */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2.5 text-xs text-slate-600">
                <Truck className="w-4 h-4 text-orange-500 shrink-0" />
                <span>সারা দেশে ক্যাশ অন ডেলিভারি</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>১০০% আসল প্রোডাক্টের নিশ্চয়তা</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-600">
                <RefreshCw className="w-4 h-4 text-blue-500 shrink-0" />
                <span>৭ দিনের সহজ রিটার্ন পলিসি</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-600">
                <Award className="w-4 h-4 text-amber-500 shrink-0" />
                <span>প্রিমিয়াম কোয়ালিটি গ্যারান্টি</span>
              </div>
            </div>
          </div>
        </div>

        {/* Structured Tabs (Description, Features, Specs, Reviews, Shipping) */}
        <div className="mt-16 pt-8 border-t border-slate-200">
          <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
            {[
              { key: 'description', label: 'DESCRIPTION' },
              { key: 'features', label: `FEATURES (${product.featuresBn?.length || 0})` },
              { key: 'specifications', label: `SPECIFICATIONS (${product.specificationsBn?.length || 0})` },
              { key: 'reviews', label: `REVIEWS (${product.reviewCount || 0})` },
              { key: 'shipping', label: 'SHIPPING & DELIVERY' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`px-5 py-3 text-xs font-extrabold tracking-wider uppercase transition-all whitespace-nowrap border-b-2 cursor-pointer ${
                  activeTab === tab.key
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="py-8">
            {/* Tab 1: Description */}
            {activeTab === 'description' && (
              <div className="max-w-3xl space-y-4 text-slate-700 leading-relaxed text-sm">
                <p className="text-base font-semibold text-slate-900">{product.taglineBn}</p>
                <div className="whitespace-pre-line">{product.descriptionBn}</div>
              </div>
            )}

            {/* Tab 2: Features */}
            {activeTab === 'features' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {product.featuresBn && product.featuresBn.length > 0 ? (
                  product.featuresBn.map((f, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                      <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{f.title}</h4>
                      <p className="text-xs text-slate-600">{f.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No key features listed.</p>
                )}
              </div>
            )}

            {/* Tab 3: Specifications */}
            {activeTab === 'specifications' && (
              <div className="max-w-xl bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden text-xs">
                {product.specificationsBn && product.specificationsBn.length > 0 ? (
                  <table className="w-full text-left">
                    <tbody>
                      {product.specificationsBn.map((spec, i) => (
                        <tr key={i} className="border-b border-slate-200 last:border-0">
                          <td className="py-3 px-4 font-bold text-slate-700 bg-slate-100/70 w-1/3">
                            {spec.key}
                          </td>
                          <td className="py-3 px-4 text-slate-900">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-4 text-slate-400">No specifications listed.</div>
                )}
              </div>
            )}

            {/* Tab 4: Reviews */}
            {activeTab === 'reviews' && (
              <div className="max-w-4xl">
                <ProductReviews productSlug={product.slug} productId={product._id} />
              </div>
            )}

            {/* Tab 5: Shipping & Delivery Policy */}
            {activeTab === 'shipping' && (
              <div className="max-w-2xl bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 text-xs text-slate-700">
                <h3 className="text-sm font-bold text-slate-900">ডেলিভারি সংক্রান্ত নিয়মাবলী</h3>
                <ul className="space-y-2 list-disc list-inside leading-relaxed">
                  <li>
                    <strong>ঢাকা সিটির ভেতরে:</strong> ডেলিভারি চার্জ ৳৭০ (২৪ থেকে ৪৮ ঘণ্টার মধ্যে ডেলিভারি)।
                  </li>
                  <li>
                    <strong>ঢাকা সিটির বাইরে:</strong> ডেলিভারি চার্জ ৳১৩০ (২ থেকে ৪ কার্যদিবসের মধ্যে ডেলিভারি)।
                  </li>
                  <li>
                    <strong>পেমেন্ট পদ্ধতি:</strong> সারা দেশে সম্পূর্ণ ক্যাশ অন ডেলিভারি (Cash on Delivery)। প্রোডাক্ট হাতে পেয়ে চেক করে মূল্য পরিশোধ করবেন।
                  </li>
                  <li>
                    <strong>রিটার্ন পলিসি:</strong> প্রোডাক্টে কোনো ত্রুটি থাকলে ডেলিভারি ম্যানের সামনেই চেক করে রিটার্ন করতে পারবেন অথবা আমাদের কাস্টমার সার্ভিসে যোগাযোগ করতে পারবেন।
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Related / Recommended Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">Related Products</h3>
                <p className="text-xs text-slate-400">You might also like these popular items</p>
              </div>
              <Link
                href="/products"
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/products/${rel.slug}`}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col"
                >
                  <div className="relative aspect-square bg-slate-50 overflow-hidden">
                    <Image
                      src={rel.images[0] || '/images/products/hello-kitty-pair.png'}
                      alt={rel.nameBn}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-orange-600 uppercase">
                        {rel.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 mt-0.5">
                        {rel.nameBn}
                      </h4>
                    </div>
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-sm font-extrabold text-slate-900 font-mono">
                        ৳{rel.basePrice}
                      </span>
                      <span className="text-[11px] line-through text-slate-400 font-mono">
                        ৳{rel.originalPrice}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
