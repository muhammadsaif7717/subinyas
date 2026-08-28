'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, ShieldCheck, Camera, Loader2, MessageSquarePlus, User, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Review } from '@/lib/types';

interface ProductReviewsProps {
  productSlug: string;
  productNameBn?: string;
  productId?: string;
}

export function ProductReviews({ productSlug, productNameBn }: ProductReviewsProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [uploadedMedia, setUploadedMedia] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch reviews for this specific product
  const { data: reviews, isLoading } = useQuery<Review[]>({
    queryKey: ['reviews', productSlug],
    queryFn: async () => {
      const res = await axios.get(`/api/reviews?productSlug=${productSlug}`);
      return res.data?.reviews || [];
    },
  });

  // Handle Media Upload to Cloudinary / Server
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setSubmitError('');

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);

        const res = await axios.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (res.data?.success && res.data?.url) {
          setUploadedMedia((prev) => [...prev, res.data.url]);
        }
      }
    } catch {
      setSubmitError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Submit Review Mutation
  const reviewMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post('/api/reviews', {
        productSlug,
        rating,
        comment,
        mediaUrls: uploadedMedia,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productSlug] });
      queryClient.invalidateQueries({ queryKey: ['product', productSlug] });
      setComment('');
      setUploadedMedia([]);
      setSubmitSuccess(true);
      setShowReviewForm(false);
      setTimeout(() => setSubmitSuccess(false), 5000);
    },
    onError: (err: unknown) => {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'Failed to submit review.';
      setSubmitError(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setSubmitError('Please write your review feedback.');
      return;
    }
    reviewMutation.mutate();
  };

  const avgRating =
    reviews && reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

  return (
    <section className="pt-14 border-t border-slate-100 space-y-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Customer Reviews & Ratings
            </h2>
            <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {reviews?.length || 0}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real feedback and unboxing photos from verified buyers of {productNameBn}
          </p>
        </div>

        {/* Rating Summary & Write Review Button */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-500" />
              ))}
            </div>
            <span className="font-bold text-slate-900 text-sm">{avgRating} / 5</span>
          </div>

          {user ? (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>{showReviewForm ? 'Close Form' : 'Write a Review'}</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-200 transition-all flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Log in to Review</span>
            </Link>
          )}
        </div>
      </div>

      {submitSuccess && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-4 rounded-2xl flex items-center gap-2 font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
          <span>আপনার রিভিউটি সফলভাবে সাবমিট হয়েছে। অ্যাডমিনের পর্যালোচনার পর এটি ওয়েবসাইটে প্রকাশিত হবে। ধন্যবাদ!</span>
        </div>
      )}

      {/* Authenticated Review Form */}
      {showReviewForm && user && (
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">Reviewing as:</span>
              <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200 font-semibold text-slate-700">
                {user.name}
              </span>
            </div>
            <span className="text-slate-400">Verified Buyer</span>
          </div>

          {submitError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-medium">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            {/* Interactive Star Picker */}
            <div>
              <label className="block font-medium text-slate-700 mb-1.5">Your Rating *</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-slate-300 hover:text-amber-500 transition-colors cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        (hoverRating || rating) >= star
                          ? 'fill-amber-500 text-amber-500'
                          : 'fill-transparent text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 font-bold text-slate-700 text-xs">
                  {rating === 5
                    ? 'Excellent (অসাধারণ)'
                    : rating === 4
                    ? 'Very Good (অনেক ভালো)'
                    : rating === 3
                    ? 'Average (মোটামুটি)'
                    : 'Poor'}
                </span>
              </div>
            </div>

            {/* Review Comment */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">Your Review & Experience *</label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="প্রোডাক্টের কোয়ালিটি, ফিনিশিং বা ব্যবহার করার অভিজ্ঞতা শেয়ার করুন..."
                className="w-full p-3.5 bg-white rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900 resize-none text-xs sm:text-sm"
              />
            </div>

            {/* Photo / Video Upload (Cloudinary Supported) */}
            <div>
              <label className="block font-medium text-slate-700 mb-1.5">
                Add Photos or Videos (Optional)
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-medium px-3.5 py-2 rounded-xl text-xs cursor-pointer shadow-2xs transition-colors">
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-800" />
                  ) : (
                    <Camera className="w-4 h-4 text-slate-600" />
                  )}
                  <span>{isUploading ? 'Uploading Media...' : 'Upload Image / Video'}</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    disabled={isUploading}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {uploadedMedia.map((url, i) => (
                  <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-white">
                    <Image src={url} alt={`Upload ${i}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setUploadedMedia((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-0.5 right-0.5 bg-slate-900/80 text-white rounded-full p-0.5"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reviewMutation.isPending || isUploading}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-2 rounded-xl text-xs shadow-xs transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {reviewMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Review</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400 text-xs">Loading reviews...</div>
      ) : !reviews || reviews.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500">
          No reviews yet. Be the first to review this product!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                {/* Header & Stars */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-xs">{rev.userName}</span>
                      {rev.isVerifiedPurchase && (
                        <span className="inline-flex items-center text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium">
                          <ShieldCheck className="w-3 h-3 mr-0.5 text-emerald-600" />
                          Verified Buyer
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-500" />
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
              </div>

              {/* Photos Gallery */}
              {rev.mediaUrls && rev.mediaUrls.length > 0 && (
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  {rev.mediaUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 bg-slate-50"
                    >
                      <Image src={url} alt={`Review media ${idx + 1}`} fill className="object-cover" sizes="60px" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
