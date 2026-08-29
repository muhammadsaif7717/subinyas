'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Trash2,
  Zap,
  ArrowRight,
  Star,
  CheckCircle2,
  ShoppingBag,
  ExternalLink,
  ShoppingBag as CartIcon,
} from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { WishlistItem } from '@/lib/types';

export default function WishlistPage() {
  const router = useRouter();
  const { wishlist, removeFromWishlist, addToCart } = useCart();

  const handleBuyNow = (item: WishlistItem) => {
    const added = addToCart({
      productSlug: item.productSlug,
      productName: item.productName,
      image: item.image,
      comboId: 'pkg-1',
      comboTitle: '1 Piece (Single Pack)',
      selectedVariants: ['Standard'],
      price: item.price,
      quantity: 1,
    });

    if (added) {
      router.push('/checkout');
    }
  };

  const handleAddToCart = (item: WishlistItem) => {
    addToCart({
      productSlug: item.productSlug,
      productName: item.productName,
      image: item.image,
      comboId: 'pkg-1',
      comboTitle: '1 Piece (Single Pack)',
      selectedVariants: ['Standard'],
      price: item.price,
      quantity: 1,
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-xs">
              <Heart className="w-5 h-5 fill-rose-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                My Wishlist ({wishlist.length})
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Your saved favorite products for quick shopping and instant checkout
              </p>
            </div>
          </div>
        </div>

        {wishlist.length > 0 && (
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/70 border border-rose-200 px-4 py-2.5 rounded-xl transition-all w-fit"
          >
            <span>Explore More Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Wishlist Items Grid or Empty State */}
      {wishlist.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">Your Wishlist is Empty</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              You have not added any products to your wishlist yet. Tap the heart icon on any product to save it here.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md shadow-rose-600/20 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Products</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <div
              key={item.id || item.productSlug}
              className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              {/* Product Thumbnail & Overlay Actions */}
              <div className="relative aspect-4/3 bg-slate-50 overflow-hidden">
                <Link href={`/products/${item.productSlug}`}>
                  <Image
                    src={item.image || '/images/products/hello-kitty-open.png'}
                    alt={item.productName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                {/* Delete Wishlist Button */}
                <button
                  type="button"
                  onClick={() => removeFromWishlist(item.productSlug)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/95 text-slate-400 hover:text-rose-600 hover:bg-white shadow-md hover:shadow-lg transition-all cursor-pointer backdrop-blur-xs"
                  title="Remove from Wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* In Stock Badge */}
                <span className="absolute bottom-3 left-3 bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-xs shadow-xs">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>In Stock</span>
                </span>
              </div>

              {/* Product Details & Actions */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  {/* Rating */}
                  <div className="flex items-center gap-1.5 text-xs text-amber-500">
                    <div className="flex items-center">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    </div>
                    <span className="font-semibold text-slate-800">{item.rating?.toFixed(1) || '4.9'}</span>
                    <span className="text-[11px] text-slate-400 font-mono">(120+ reviews)</span>
                  </div>

                  {/* Title */}
                  <Link href={`/products/${item.productSlug}`} className="block">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-rose-600 transition-colors line-clamp-1">
                      {item.productName}
                    </h3>
                  </Link>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-xl font-bold text-slate-900 font-mono">৳{item.price}</span>
                    <span className="text-xs line-through text-slate-400 font-mono">৳800</span>
                    <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded ml-auto">
                      Save ৳{Math.max(800 - item.price, 0)}
                    </span>
                  </div>
                </div>

                {/* Dual Action Buttons: Buy Now & Add to Cart */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {/* Primary Buy Now Button */}
                  <button
                    type="button"
                    onClick={() => handleBuyNow(item)}
                    className="w-full bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Buy Now</span>
                  </button>

                  {/* Secondary Add to Cart Button */}
                  <button
                    type="button"
                    onClick={() => handleAddToCart(item)}
                    className="w-full bg-rose-50 hover:bg-rose-100 active:scale-98 text-rose-600 border border-rose-200 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <CartIcon className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
