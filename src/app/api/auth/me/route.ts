import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/jwt';
import { getDb } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('subinyas_admin_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
    }

    const payload = verifyJwtToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
    }

    let finalUser: Record<string, unknown> = {
      id: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role || 'customer',
      avatar: payload.avatar,
      cart: [],
      wishlist: [],
    };

    // Check MongoDB for real-time role, profile, cart & wishlist sync
    const db = await getDb();
    if (db && payload.email) {
      const dbUser = await db.collection('users').findOne({ email: payload.email.toLowerCase() });
      if (dbUser) {
        finalUser = {
          id: dbUser._id.toString(),
          email: dbUser.email,
          name: dbUser.name || payload.name,
          role: dbUser.role || payload.role || 'customer',
          avatar: dbUser.avatar || payload.avatar,
          phone: dbUser.phone,
          cart: Array.isArray(dbUser.cart) ? dbUser.cart : [],
          wishlist: Array.isArray(dbUser.wishlist) ? dbUser.wishlist : [],
        };
      }
    }

    // If matches configured ADMIN_EMAIL, guarantee role is admin
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@subinyas.shop').toLowerCase();
    const userEmailStr = String(finalUser.email || '').toLowerCase();
    const userRoleStr = String(finalUser.role || '').toLowerCase();

    if (userEmailStr === adminEmail || userRoleStr === 'admin') {
      finalUser.role = 'admin';
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: finalUser,
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json({ success: false, authenticated: false }, { status: 500 });
  }
}

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'লগআউট সফল হয়েছে' });
  response.cookies.delete('subinyas_admin_token');
  return response;
}
