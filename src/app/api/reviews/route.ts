import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/jwt';
import { getDb } from '@/lib/mongodb';
import { Review, Product } from '@/lib/types';
import { ObjectId } from 'mongodb';

// Helper for admin auth check with DB fallback
async function checkIsAdmin(request: NextRequest): Promise<boolean> {
  try {
    const token =
      request.cookies.get('subinyas_admin_token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) return false;

    const payload = verifyJwtToken(token);
    if (!payload) return false;

    if (payload.role && payload.role.toLowerCase() === 'admin') {
      return true;
    }

    const db = await getDb();
    if (db && (payload.email || payload.userId)) {
      const query: Record<string, unknown> = {};
      if (payload.email) query.email = payload.email;
      else if (payload.userId) query.userId = payload.userId;

      const user = await db.collection('users').findOne(query);
      if (user && user.role && user.role.toLowerCase() === 'admin') {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productSlug = searchParams.get('productSlug');
    const isAdminView = searchParams.get('admin') === 'true';
    const status = searchParams.get('status');

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ success: true, reviews: [] });
    }

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

    return NextResponse.json({ success: true, reviews: dbReviews || [] });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch reviews', reviews: [] }, { status: 500 });
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

    const db = await getDb();
    let productId = '';

    if (db) {
      const product = await db.collection('products').findOne({ slug: productSlug });
      if (product) {
        productId = product._id?.toString() || product.id || '';
      }
    }

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      productId: productId || undefined,
      productSlug,
      userId: payload.userId,
      userName: payload.name || payload.email?.split('@')[0] || 'Customer',
      rating: Number(rating),
      comment: comment.trim(),
      mediaUrls: Array.isArray(mediaUrls) ? mediaUrls : [],
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    if (db) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await db.collection('reviews').insertOne(newReview as any);
    }

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully and is pending admin approval.',
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
    const isAdmin = await checkIsAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: 'Unauthorized - Admin access required' }, { status: 401 });
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

        const count = approvedReviews.length;
        const avgRating =
          count > 0
            ? Number((approvedReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / count).toFixed(1))
            : 5.0;

        await db.collection('products').updateOne(
          { slug: review.productSlug },
          {
            $set: {
              rating: avgRating,
              reviewCount: count,
              updatedAt: new Date().toISOString(),
            },
          }
        );
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
    const isAdmin = await checkIsAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: 'Unauthorized - Admin access required' }, { status: 401 });
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

      const review = await db.collection('reviews').findOne(filter);
      await db.collection('reviews').deleteOne(filter);

      // Recalculate rating
      if (review?.productSlug) {
        const approvedReviews = await db
          .collection('reviews')
          .find({ productSlug: review.productSlug, status: 'Approved' })
          .toArray();

        const count = approvedReviews.length;
        const avgRating =
          count > 0
            ? Number((approvedReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / count).toFixed(1))
            : 5.0;

        await db.collection('products').updateOne(
          { slug: review.productSlug },
          {
            $set: {
              rating: avgRating,
              reviewCount: count,
              updatedAt: new Date().toISOString(),
            },
          }
        );
      }
    }

    return NextResponse.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete review' }, { status: 500 });
  }
}
