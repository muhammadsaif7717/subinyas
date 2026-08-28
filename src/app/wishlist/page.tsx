'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { INITIAL_JEWELRY_BOX_PRODUCT } from '@/lib/constants';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, addToCart } = useCart();
  const product = INITIAL_JEWELRY_BOX_PRODUCT;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Your Wishlist</h1>
        <p className="text-xs text-slate-500 mt-1">Saved items you love and plan to order</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-slate-50 rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <Heart className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
          <h3 className="text-base font-bold text-slate-800">Your wishlist is empty</h3>
          <p className="text-xs text-slate-500">Save items you want to keep track of by adding them to your wishlist.</p>
          <Link
            href="/products/jewelry-box"
            className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-2xs hover:bg-slate-100 transition-colors"
          >
            <span>Explore Jewelry Box</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between"
            >
              <div className="relative aspect-square bg-slate-50">
                <Image src={item.image} alt={item.productName} fill className="object-cover" />
                <button
                  onClick={() => removeFromWishlist(item.productSlug)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 text-slate-400 hover:text-rose-500 shadow-xs transition-colors"
                  title="Remove from Wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{item.productNameBn}</h4>
                  <div className="text-base font-bold text-slate-900 mt-1">৳{item.price}</div>
                </div>

                <button
                  onClick={() => {
                    addToCart({
                      productSlug: item.productSlug,
                      productName: item.productName,
                      productNameBn: item.productNameBn,
                      image: item.image,
                      comboId: 'combo-single',
                      comboTitleBn: '১টি বক্স (সিঙ্গেল প্যাক)',
                      selectedVariants: [product.variants[0].nameBn],
                      price: item.price,
                      quantity: 1,
                    });
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
