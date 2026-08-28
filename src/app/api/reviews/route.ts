import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/jwt';
import { getDb } from '@/lib/mongodb';
import { Review } from '@/lib/types';
import { ObjectId } from 'mongodb';

const INITIAL_REVIEWS: Record<string, Review[]> = {
  'jewelry-box': [
    {
      id: 'rev-1',
      productSlug: 'jewelry-box',
      userId: 'user-1',
      userName: 'সুমাইয়া রহমান',
      rating: 5,
      comment:
        'Hello Kitty Pink বক্সটি সত্যি অনেক সুন্দর এবং এলিগ্যান্ট। মেটেরিয়াল কোয়ালিটি বেশ ভালো এবং ভেতরের ভেলভেট খুব সফট। ভ্রমণের সময় প্রিয় জুয়েলারিগুলো একদম সুরক্ষিত থাকে।',
      mediaUrls: ['/images/products/hello-kitty-open.png'],
      isVerifiedPurchase: true,
      status: 'Approved',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    },
    {
      id: 'rev-2',
      productSlug: 'jewelry-box',
      userId: 'user-2',
      userName: 'আফরোজা খান',
      rating: 5,
      comment:
        'বেস্টি কম্বো (Bestie Combo) অফারে ২টা নিয়েছিলাম। ১টা নিজের জন্য আর ১টা বান্ধবীর জন্মদিনে গিফট দিয়েছি। ও দেখে অনেক খুশি হয়েছে! প্যাকেজিং দারুণ ছিল।',
      mediaUrls: ['/images/products/hello-kitty-pair.png'],
      isVerifiedPurchase: true,
      status: 'Approved',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    },
    {
      id: 'rev-3',
      productSlug: 'jewelry-box',
      userId: 'user-3',
      userName: 'নুসরাত জাহান',
      rating: 5,
      comment:
        'ক্যাশ অন ডেলিভারিতে মাত্র ২ দিনে পেয়েছি। চেন বা দুল প্যাঁচ খাওয়ার কোনো ঝামেলা নেই। সাইজটা একদম পারফেক্ট ব্যাগে নেওয়ার মতো।',
      mediaUrls: ['/images/products/mandala-boxes.png'],
      isVerifiedPurchase: true,
      status: 'Approved',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
    },
  ],
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productSlug = searchParams.get('productSlug');
    const isAdminView = searchParams.get('admin') === 'true';
    const status = searchParams.get('status');

    const db = await getDb();
    if (db) {
      const query: Record<string, unknown> = {};

      if (productSlug) {
        query.productSlug = productSlug;
      }

      if (isAdminView) {
        if (status && status !== 'All') {
          query.status = status;
        }
      } else {
        // Public store view: ONLY Approved reviews are shown
        query.status = 'Approved';
      }

      const dbReviews = await db
        .collection('reviews')
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();

      if (dbReviews && dbReviews.length > 0) {
        return NextResponse.json({ success: true, reviews: dbReviews });
      }
    }

    if (!isAdminView) {
      const key = productSlug || 'jewelry-box';
      const fallback = INITIAL_REVIEWS[key] || INITIAL_REVIEWS['jewelry-box'] || [];
      return NextResponse.json({ success: true, reviews: fallback });
    }

    // Default fallback for admin view
    const allFallback = Object.values(INITIAL_REVIEWS).flat();
    return NextResponse.json({ success: true, reviews: allFallback });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('subinyas_admin_token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Please log in to submit a review.' },
        { status: 401 }
      );
    }

    const payload = verifyJwtToken(token);
    if (!payload?.userId) {
      return NextResponse.json(
        { success: false, message: 'Invalid authentication session.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productSlug, rating, comment, mediaUrls } = body;

    if (!productSlug || !rating || !comment?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Please provide rating and comment.' },
        { status: 400 }
      );
    }

    // New reviews start in 'Pending' status awaiting Admin Approval
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      productSlug,
      userId: payload.userId,
      userName: payload.name || 'Customer',
      userAvatar: payload.avatar,
      rating: Number(rating) || 5,
      comment: comment.trim(),
      mediaUrls: Array.isArray(mediaUrls) ? mediaUrls : [],
      isVerifiedPurchase: true,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    const db = await getDb();
    if (db) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await db.collection('reviews').insertOne(newReview as any);
    }

    return NextResponse.json({
      success: true,
      message: 'আপনার রিভিউটি সফলভাবে সাবমিট হয়েছে। অ্যাডমিনের পর্যালোচনার পর এটি প্রকাশিত হবে।',
      review: newReview,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ success: false, message: 'Failed to submit review' }, { status: 500 });
  }
}

// Admin Moderation: Approve or Decline
export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('subinyas_admin_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyJwtToken(token);
    if (payload?.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { reviewId, status } = body;

    if (!reviewId || !['Approved', 'Declined', 'Pending'].includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
    }

    const db = await getDb();
    if (db) {
      let filter: Record<string, unknown> = { id: reviewId };
      if (ObjectId.isValid(reviewId)) {
        filter = { $or: [{ _id: new ObjectId(reviewId) }, { id: reviewId }] };
      }

      const review = await db.collection('reviews').findOne(filter);
      await db.collection('reviews').updateOne(filter, {
        $set: { status, updatedAt: new Date().toISOString() },
      });

      // Recalculate product rating based only on Approved reviews
      if (review?.productSlug) {
        const approvedReviews = await db
          .collection('reviews')
          .find({ productSlug: review.productSlug, status: 'Approved' })
          .toArray();

        if (approvedReviews.length > 0) {
          const avgRating =
            approvedReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / approvedReviews.length;

          await db.collection('products').updateOne(
            { slug: review.productSlug },
            {
              $set: {
                rating: Number(avgRating.toFixed(1)),
                reviewCount: approvedReviews.length,
                updatedAt: new Date().toISOString(),
              },
            }
          );
        }
      }
    }

    return NextResponse.json({ success: true, message: `Review ${status}` });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ success: false, message: 'Failed to update review status' }, { status: 500 });
  }
}

// Admin delete review
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('subinyas_admin_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyJwtToken(token);
    if (payload?.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('id');

    if (!reviewId) {
      return NextResponse.json({ success: false, message: 'Review ID required' }, { status: 400 });
    }

    const db = await getDb();
    if (db) {
      let filter: Record<string, unknown> = { id: reviewId };
      if (ObjectId.isValid(reviewId)) {
        filter = { $or: [{ _id: new ObjectId(reviewId) }, { id: reviewId }] };
      }
      await db.collection('reviews').deleteOne(filter);
    }

    return NextResponse.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete review' }, { status: 500 });
  }
}
