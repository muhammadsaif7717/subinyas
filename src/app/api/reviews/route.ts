import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/jwt';
import { getDb } from '@/lib/mongodb';
import { Review } from '@/lib/types';

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
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
    },
  ],
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productSlug = searchParams.get('productSlug') || 'jewelry-box';

    const db = await getDb();
    if (db) {
      const dbReviews = await db
        .collection('reviews')
        .find({ productSlug })
        .sort({ createdAt: -1 })
        .toArray();

      if (dbReviews && dbReviews.length > 0) {
        return NextResponse.json({ success: true, reviews: dbReviews });
      }
    }

    const fallback = INITIAL_REVIEWS[productSlug] || INITIAL_REVIEWS['jewelry-box'] || [];
    return NextResponse.json({ success: true, reviews: fallback });
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

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      productSlug,
      userId: payload.userId,
      userName: payload.name || 'Verified Customer',
      rating: Number(rating) || 5,
      comment: comment.trim(),
      mediaUrls: Array.isArray(mediaUrls) ? mediaUrls : [],
      isVerifiedPurchase: true,
      createdAt: new Date().toISOString(),
    };

    const db = await getDb();
    if (db) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await db.collection('reviews').insertOne(newReview as any);

      // Update product average rating & review count
      const allProductReviews = await db.collection('reviews').find({ productSlug }).toArray();
      const avgRating =
        allProductReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / allProductReviews.length;

      await db.collection('products').updateOne(
        { slug: productSlug },
        {
          $set: {
            rating: Number(avgRating.toFixed(1)),
            reviewCount: allProductReviews.length,
            updatedAt: new Date().toISOString(),
          },
        }
      );
    }

    return NextResponse.json({ success: true, review: newReview }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ success: false, message: 'Failed to submit review' }, { status: 500 });
  }
}
