import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/jwt';
import { getOrders } from '@/lib/data-store';
import { getDb } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('subinyas_admin_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Please log in to view your orders.' }, { status: 401 });
    }

    const payload = verifyJwtToken(token);
    if (!payload?.email) {
      return NextResponse.json({ success: false, message: 'Invalid session' }, { status: 401 });
    }

    const db = await getDb();
    if (db) {
      const orders = await db
        .collection('orders')
        .find({
          $or: [
            { userEmail: payload.email },
            { customerName: { $regex: payload.name || '', $options: 'i' } },
          ],
        })
        .sort({ createdAt: -1 })
        .toArray();

      return NextResponse.json({ success: true, orders });
    }

    // Fallback in-memory
    const allOrders = await getOrders();
    return NextResponse.json({ success: true, orders: allOrders });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch orders' }, { status: 500 });
  }
}
