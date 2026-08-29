'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  Search,
  SlidersHorizontal,
  Star,
  ShoppingBag,
  Sparkles,
  Loader2,
  Heart,
  CheckCircle2,
} from 'lucide-react';
import { Product, isProductInStock } from '@/lib/types';
import { useCart } from '@/lib/cart-context';

export default function ProductsCatalogPage() {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  // Fetch Live Products from API
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await axios.get('/api/products');
      return res.data?.products || [];
    },
  });

  // Fetch Categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await axios.get('/api/categories');
      return res.data?.categories || [];
    },
  });

  const categories = useMemo(() => {
    if (categoriesData && categoriesData.length > 0) {
      return ['All', ...categoriesData.map((c: { name: string }) => c.name)];
    }
    const set = new Set(products.map((p) => p.category));
    return ['All', ...Array.from(set)];
  }, [categoriesData, products]);

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        if (product.isActive === false) return false;

        const matchesSearch =
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.subtitle && product.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        const matchesPrice = product.basePrice <= maxPrice;

        return matchesSearch && matchesCategory && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
        if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
        if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);

        // 'featured' / default sort: Prioritize Featured + In Stock products
        const aInStock = isProductInStock(a) ? 1 : 0;
        const bInStock = isProductInStock(b) ? 1 : 0;
        if (aInStock !== bInStock) return bInStock - aInStock;

        const aFeat = a.isFeatured === true ? 1 : 0;
        const bFeat = b.isFeatured === true ? 1 : 0;
        if (aFeat !== bFeat) return bFeat - aFeat;

        return (b.reviewCount || 0) - (a.reviewCount || 0) || (b.rating || 5) - (a.rating || 5);
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
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search products by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 text-xs"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-rose-500 cursor-pointer text-xs"
            >
              <option value="featured">Sort by: Featured & In Stock</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60">
          <span className="text-slate-500 font-medium mr-1">Categories:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Max Price Range Filter */}
        <div className="flex items-center gap-3 pt-2 text-slate-600">
          <span className="font-medium whitespace-nowrap">Max Price: ৳{maxPrice}</span>
          <input
            type="range"
            min="300"
            max="3000"
            step="50"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full sm:w-48 accent-rose-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="py-24 text-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-rose-500" />
          <p className="text-sm">Loading products catalog...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 text-center text-slate-400 space-y-3 bg-white rounded-3xl border border-slate-200">
          <Sparkles className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-base font-bold text-slate-700">No products match your filter criteria.</p>
          <p className="text-xs text-slate-400">Try adjusting your search keywords or resetting categories.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setMaxPrice(3000);
            }}
            className="mt-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{filteredProducts.length}</span> product(s)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p) => {
              const inWishlist = isInWishlist(p.slug);
              const inStock = isProductInStock(p);
              const pkgs = p.packages || p.combos;

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
                        alt={p.name}
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

                    {/* Category Badge */}
                    <span className="absolute top-3 left-3 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {p.category}
                    </span>

                    {/* Stock Status Badge */}
                    <span
                      className={`absolute bottom-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs backdrop-blur-xs ${
                        inStock
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-rose-500/90 text-white'
                      }`}
                    >
                      {inStock ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          <span>In Stock</span>
                        </>
                      ) : (
                        <span>Out of Stock</span>
                      )}
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
                          {p.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-slate-500 line-clamp-2">{p.subtitle}</p>
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
                        disabled={!inStock}
                        onClick={() => {
                          addToCart({
                            productSlug: p.slug,
                            productName: p.name,
                            image: p.images[0],
                            comboId: pkgs?.[0]?.id || 'pkg-1',
                            comboTitle: pkgs?.[0]?.title || '1 Piece (Single Pack)',
                            selectedVariants: [p.variants?.[0]?.name || 'Default'],
                            price: p.basePrice,
                            quantity: 1,
                          });
                        }}
                        className={`border font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors ${
                          inStock
                            ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 cursor-pointer'
                            : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                      </button>

                      <Link
                        href={`/products/${p.slug}`}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 px-3 rounded-xl text-xs text-center flex items-center justify-center transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
