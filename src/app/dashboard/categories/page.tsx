'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  Folder,
  Plus,
  Trash2,
  Edit,
  FolderPlus,
  RefreshCw,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { CategoryItem } from '@/app/api/categories/route';
import { Product } from '@/lib/types';

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const cardCls = 'bg-[#211C28] rounded-2xl border border-[#2E2733]';

  const [newCatName, setNewCatName] = useState('');
  const [catError, setCatError] = useState('');
  const [catSuccess, setCatSuccess] = useState('');

  // Fetch Categories
  const { data: categories = [], isLoading } = useQuery<CategoryItem[]>({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await axios.get('/api/categories');
      return res.data?.categories || [];
    },
  });

  // Fetch Products to count items per category
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const res = await axios.get('/api/products');
      return res.data?.products || [];
    },
  });

  // Save Category Mutation
  const saveCategoryMutation = useMutation({
    mutationFn: async (payload: Partial<CategoryItem>) => {
      const res = await axios.post('/api/categories', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-categories-overview'] });
    },
  });

  // Delete Category Mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.delete(`/api/categories?id=${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-categories-overview'] });
    },
  });

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatError('');
    setCatSuccess('');

    if (!newCatName.trim()) {
      setCatError('Please enter a category name.');
      return;
    }

    try {
      await saveCategoryMutation.mutateAsync({
        name: newCatName.trim(),
      });
      setCatSuccess('Category created successfully!');
      setNewCatName('');
      setTimeout(() => setCatSuccess(''), 3000);
    } catch (err: any) {
      setCatError(err.response?.data?.message || 'Failed to create category.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${cardCls} p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Folder className="w-5 h-5 text-[#8FC7A9]" />
            <span>Categories Management</span>
          </h2>
          <p className="text-xs text-[#8A7D97] mt-0.5">
            Organize products into curated collections for easier browsing on your storefront
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Create Category Form */}
        <div className="lg:col-span-4">
          <div className={`${cardCls} p-5 sm:p-6 space-y-4`}>
            <div className="flex items-center gap-2 border-b border-[#2E2733] pb-3">
              <FolderPlus className="w-4 h-4 text-[#C4587A]" />
              <h3 className="text-sm font-bold text-white">Add New Category</h3>
            </div>

            {catError && (
              <div className="p-3 rounded-xl bg-[#C1495A]/15 border border-[#C1495A]/30 text-xs text-[#DD8A94]">
                {catError}
              </div>
            )}
            {catSuccess && (
              <div className="p-3 rounded-xl bg-[#6FAE8C]/15 border border-[#6FAE8C]/30 text-xs text-[#8FC7A9]">
                {catSuccess}
              </div>
            )}

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white">Category Name</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Travel Organizers"
                  className="w-full bg-[#191520] border border-[#2E2733] focus:border-[#C4587A] text-xs text-white rounded-xl px-3 py-2 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={saveCategoryMutation.isPending}
                className="w-full py-2.5 rounded-xl bg-[#C4587A] hover:bg-[#B24A6B] text-white text-xs font-bold shadow-lg shadow-[#C4587A]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {saveCategoryMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>Create Category</span>
              </button>
            </form>
          </div>
        </div>

        {/* Existing Categories List */}
        <div className="lg:col-span-8">
          <div className={`${cardCls} overflow-hidden`}>
            <div className="p-5 border-b border-[#2E2733] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                All Categories ({categories.length})
              </h3>
            </div>

            {isLoading ? (
              <div className="py-16 text-center space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#C4587A]" />
                <p className="text-xs text-[#8A7D97]">Loading categories...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#8A7D97]">
                No categories found. Create your first category on the left.
              </div>
            ) : (
              <div className="divide-y divide-[#2E2733]/60">
                {categories.map((c) => {
                  const productCount = products.filter((p) => p.category === c.name).length;

                  return (
                    <div
                      key={c.id || c.name}
                      className="p-4 flex items-center justify-between hover:bg-[#282230]/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#191520] border border-[#2E2733] flex items-center justify-center text-[#8FC7A9]">
                          <Folder className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{c.name}</h4>
                          <p className="text-[11px] text-[#8A7D97]">
                            <span className="text-[#D8CFE0] font-mono">{productCount} product(s) in this collection</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete category "${c.name}"?`)) {
                              deleteCategoryMutation.mutate(c.id || c.name);
                            }
                          }}
                          className="p-2 rounded-xl bg-[#C1495A]/12 hover:bg-[#C1495A] text-[#DD8A94] hover:text-white transition-colors cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
