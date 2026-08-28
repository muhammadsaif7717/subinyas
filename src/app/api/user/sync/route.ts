import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/jwt';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('subinyas_admin_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyJwtToken(token);
    if (!payload?.userId) {
      return NextResponse.json({ success: false, message: 'Invalid session' }, { status: 401 });
    }

    const body = await request.json();
    const { cart, wishlist } = body;

    const db = await getDb();
    if (db) {
      let filter: Record<string, unknown> = { email: payload.email };
      if (ObjectId.isValid(payload.userId)) {
        filter = { _id: new ObjectId(payload.userId) };
      }

      await db.collection('users').updateOne(
        filter,
        { $set: { cart: cart || [], wishlist: wishlist || [], updatedAt: new Date().toISOString() } },
        { upsert: false }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error syncing user data:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
