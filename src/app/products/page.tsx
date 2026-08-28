'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Search, SlidersHorizontal, Star, Heart, ShoppingBag, ArrowUpDown, X } from 'lucide-react';
import { Product } from '@/lib/types';
import { INITIAL_JEWELRY_BOX_PRODUCT } from '@/lib/constants';
import { useCart } from '@/lib/cart-context';

export default function ProductsPage() {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [maxPrice, setMaxPrice] = useState<number>(2000);

  // Fetch all products from API
  const { data: productsData, isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await axios.get('/api/products');
      return res.data?.products || [];
    },
  });

  // Fetch categories from API
  const { data: categoriesData } = useQuery<{ success: boolean; categories: { name: string }[] }>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await axios.get('/api/categories');
      return res.data;
    },
  });

  const products = productsData || [];

  // Extract categories dynamically
  const categories = useMemo(() => {
    const set = new Set<string>(['All']);
    if (categoriesData?.categories) {
      categoriesData.categories.forEach((c) => set.add(c.name));
    }
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [categoriesData, products]);

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.nameBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.descriptionBn.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        const matchesPrice = product.basePrice <= maxPrice;

        return matchesSearch && matchesCategory && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
        if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0; // featured / default
      });
  }, [products, searchQuery, selectedCategory, maxPrice, sortBy]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          All Collections & Products
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Explore our complete collection of travel organizers, vanity accessories, and aesthetic essentials.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4 text-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name or keyword..."
              className="w-full pl-10 pr-8 py-2.5 bg-white rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium shrink-0 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort By:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-white px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-slate-900 cursor-pointer"
            >
              <option value="featured">Featured (জনপ্রিয়)</option>
              <option value="price-asc">Price: Low to High (কম থেকে বেশি)</option>
              <option value="price-desc">Price: High to Low (বেশি থেকে কম)</option>
              <option value="rating">Top Rated (সর্বোচ্চ রেটিং)</option>
            </select>
          </div>
        </div>

        {/* Categories Pills and Price Range Slider */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
                }`}
              >
                {cat === 'All' ? 'All Products' : cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <span>Max Price:</span>
            <span className="font-bold text-slate-900">৳{maxPrice}</span>
            <input
              type="range"
              min="300"
              max="2500"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-28 accent-slate-900 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400">Loading products...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-slate-50 rounded-3xl p-16 text-center border border-slate-200 space-y-3">
          <SlidersHorizontal className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
          <h3 className="text-base font-bold text-slate-800">No products match your filters</h3>
          <p className="text-xs text-slate-500">Try adjusting your search terms or price range filter.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setMaxPrice(2000);
            }}
            className="text-xs font-bold text-rose-600 hover:underline mt-2"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((p) => {
            const inWishlist = isInWishlist(p.slug);
            return (
              <div
                key={p.id}
                className="group rounded-2xl border border-slate-200 overflow-hidden bg-white hover:border-slate-400 transition-all flex flex-col justify-between"
              >
                {/* Image Link */}
                <div className="relative aspect-square bg-slate-50 overflow-hidden">
                  <Link href={`/products/${p.slug}`}>
                    <Image
                      src={p.images[0] || '/images/products/hello-kitty-pair.png'}
                      alt={p.nameBn}
                      fill
                      className="object-cover group-hover:scale-103 transition-transform duration-300"
                    />
                  </Link>

                  {/* Wishlist Button */}
                  <button
                    onClick={() => {
                      if (inWishlist) {
                        removeFromWishlist(p.slug);
                      } else {
                        addToWishlist({
                          id: p.id,
                          productSlug: p.slug,
                          productName: p.name,
                          productNameBn: p.nameBn,
                          image: p.images[0],
                          price: p.basePrice,
                          rating: p.rating,
                        });
                      }
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-slate-400 hover:text-rose-500 shadow-xs transition-colors cursor-pointer"
                    title="Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>

                  <span className="absolute top-3 left-3 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {p.category}
                  </span>
                </div>

                {/* Info and Actions */}
                <div className="p-5 space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1 text-amber-500 text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span className="font-semibold text-slate-800">{p.rating}</span>
                      <span className="text-slate-400">({p.reviewCount})</span>
                    </div>

                    <Link href={`/products/${p.slug}`} className="block">
                      <h3 className="font-semibold text-slate-900 text-base group-hover:text-rose-600 transition-colors">
                        {p.nameBn}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-500 line-clamp-2">{p.taglineBn}</p>
                  </div>

                  <div className="flex items-baseline justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-slate-900">৳{p.basePrice}</span>
                      <span className="text-xs line-through text-slate-400">৳{p.originalPrice}</span>
                    </div>

                    <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                      Save ৳{p.originalPrice - p.basePrice}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => {
                        addToCart({
                          productSlug: p.slug,
                          productName: p.name,
                          productNameBn: p.nameBn,
                          image: p.images[0],
                          comboId: p.combos[0]?.id || 'combo-single',
                          comboTitleBn: p.combos[0]?.titleBn || '১টি বক্স',
                          selectedVariants: [p.variants[0]?.nameBn || 'Default'],
                          price: p.basePrice,
                          quantity: 1,
                        });
                      }}
                      className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>

                    <Link
                      href={`/products/${p.slug}`}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 px-3 rounded-xl text-xs text-center flex items-center justify-center transition-colors"
                    >
                      <span>Buy Now</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
