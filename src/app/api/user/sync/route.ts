import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/jwt';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

function extractUserPayload(request: NextRequest) {
  const token =
    request.cookies.get('subinyas_admin_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) return null;
  return verifyJwtToken(token);
}

export async function GET(request: NextRequest) {
  try {
    const payload = extractUserPayload(request);
    if (!payload?.email && !payload?.userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ success: true, cart: [], wishlist: [] });
    }

    const filter: Record<string, unknown> = {};
    if (payload.email) {
      filter.email = payload.email.toLowerCase();
    } else if (payload.userId && ObjectId.isValid(payload.userId)) {
      filter._id = new ObjectId(payload.userId);
    }

    const dbUser = await db.collection('users').findOne(filter);

    return NextResponse.json({
      success: true,
      cart: Array.isArray(dbUser?.cart) ? dbUser.cart : [],
      wishlist: Array.isArray(dbUser?.wishlist) ? dbUser.wishlist : [],
    });
  } catch (error) {
    console.error('Error fetching user sync data:', error);
    return NextResponse.json({ success: false, cart: [], wishlist: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = extractUserPayload(request);
    if (!payload?.email && !payload?.userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { cart, wishlist } = body;

    const db = await getDb();
    if (db) {
      const filter: Record<string, unknown> = {};
      if (payload.email) {
        filter.email = payload.email.toLowerCase();
      } else if (payload.userId && ObjectId.isValid(payload.userId)) {
        filter._id = new ObjectId(payload.userId);
      }

      await db.collection('users').updateOne(
        filter,
        {
          $set: {
            cart: Array.isArray(cart) ? cart : [],
            wishlist: Array.isArray(wishlist) ? wishlist : [],
            updatedAt: new Date().toISOString(),
          },
        },
        { upsert: false }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error syncing user data:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
