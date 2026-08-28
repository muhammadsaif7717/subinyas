'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Image from 'next/image';
import {
  MessageSquare,
  Star,
  Check,
  X,
  Trash2,
  RefreshCw,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Review } from '@/lib/types';

export default function ReviewsPage() {
  const queryClient = useQueryClient();
  const cardCls = 'bg-[#211C28] rounded-2xl border border-[#2E2733]';

  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Fetch Reviews
  const {
    data: reviews = [],
    isLoading,
    refetch,
  } = useQuery<Review[]>({
    queryKey: ['admin-reviews', statusFilter],
    queryFn: async () => {
      const res = await axios.get(`/api/reviews?admin=true&status=${statusFilter}`);
      return res.data?.reviews || [];
    },
  });

  // Update Review Status Mutation
  const updateReviewMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      const res = await axios.patch(`/api/reviews?id=${id}`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reviews-overview'] });
    },
  });

  // Delete Review Mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.delete(`/api/reviews?id=${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reviews-overview'] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${cardCls} p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#BAA3DE]" />
            <span>Customer Reviews Moderation</span>
          </h2>
          <p className="text-xs text-[#8A7D97] mt-0.5">
            Approve genuine customer ratings and social proof before they appear on the public storefront
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          className="p-2.5 rounded-xl bg-[#2E2733] hover:bg-[#3B3242] text-[#9C8FA8] hover:text-white transition-colors cursor-pointer self-start sm:self-auto"
          title="Refresh Reviews"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className={`${cardCls} p-4 flex items-center gap-2`}>
        {['All', 'pending', 'approved', 'rejected'].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
              statusFilter === st
                ? 'bg-[#C4587A] text-white shadow-md shadow-[#C4587A]/25'
                : 'bg-[#191520] text-[#9C8FA8] hover:text-white border border-[#2E2733]'
            }`}
          >
            {st === 'All' ? 'All Reviews' : st}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className={`${cardCls} py-20 text-center space-y-2`}>
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#C4587A]" />
            <p className="text-xs text-[#8A7D97]">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className={`${cardCls} py-20 text-center space-y-2`}>
            <MessageSquare className="w-8 h-8 mx-auto text-[#8A7D97]" />
            <p className="text-xs text-[#8A7D97]">No reviews found matching this filter.</p>
          </div>
        ) : (
          reviews.map((r) => (
            <div
              key={r.id || r._id}
              className={`${cardCls} p-5 sm:p-6 border border-[#2E2733] space-y-4`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2E2733] pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#C4587A]/20 text-[#E39BB4] font-bold flex items-center justify-center text-xs font-mono">
                    {r.userName ? r.userName[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{r.userName}</span>
                      {r.isVerifiedPurchase && (
                        <span className="text-[10px] bg-[#6FAE8C]/15 text-[#8FC7A9] px-2 py-0.5 rounded border border-[#6FAE8C]/30 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verified Purchase</span>
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-[#8A7D97] font-mono">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString('bn-BD') : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                      r.status === 'approved'
                        ? 'bg-[#6FAE8C]/15 text-[#8FC7A9] border-[#6FAE8C]/30'
                        : r.status === 'rejected'
                        ? 'bg-[#C1495A]/15 text-[#DD8A94] border-[#C1495A]/30'
                        : 'bg-[#D6A24E]/15 text-[#E4BC79] border-[#D6A24E]/30'
                    }`}
                  >
                    {r.status || 'pending'}
                  </span>

                  {r.status !== 'approved' && (
                    <button
                      type="button"
                      onClick={() => updateReviewMutation.mutate({ id: r.id || r._id!, status: 'approved' })}
                      className="px-2.5 py-1 bg-[#6FAE8C]/15 hover:bg-[#6FAE8C] text-[#8FC7A9] hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      title="Approve Review"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  )}

                  {r.status !== 'rejected' && (
                    <button
                      type="button"
                      onClick={() => updateReviewMutation.mutate({ id: r.id || r._id!, status: 'rejected' })}
                      className="px-2.5 py-1 bg-[#D6A24E]/15 hover:bg-[#D6A24E] text-[#E4BC79] hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      title="Reject Review"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Delete this review completely?')) {
                        deleteReviewMutation.mutate(r.id || r._id!);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-[#C1495A]/12 hover:bg-[#C1495A] text-[#DD8A94] hover:text-white transition-colors cursor-pointer"
                    title="Delete Review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Star Rating & Comment */}
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= (r.rating || 5)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-slate-700 text-slate-700'
                      }`}
                    />
                  ))}
                  <span className="text-xs text-[#8A7D97] ml-2 font-mono">{r.rating?.toFixed(1)} / 5.0</span>
                </div>

                <p className="text-xs sm:text-sm text-[#D8CFE0] leading-relaxed bg-[#191520] p-3.5 rounded-xl border border-[#2E2733]">
                  {r.comment}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
