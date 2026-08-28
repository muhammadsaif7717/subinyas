import { NextRequest, NextResponse } from 'next/server';
import { signJwtToken } from '@/lib/jwt';

// Admin credentials (can be customized via environment variables)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@subinyas.shop';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'subinyas2026';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'ইমেইল এবং পাসওয়ার্ড দিন' }, { status: 400 });
    }

    if (email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      const token = signJwtToken({
        userId: 'admin-01',
        email: ADMIN_EMAIL,
        role: 'admin',
        name: 'সুবিন্যাস অ্যাডমিন (Admin)',
      });

      const response = NextResponse.json({
        success: true,
        message: 'লগইন সফল হয়েছে',
        user: {
          email: ADMIN_EMAIL,
          name: 'সুবিন্যাস অ্যাডমিন (Admin)',
          role: 'admin',
        },
      });

      response.cookies.set('subinyas_admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ success: false, message: 'ভুল ইমেইল বা পাসওয়ার্ড!' }, { status: 401 });
  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json({ success: false, message: 'লগইনে সমস্যা হয়েছে' }, { status: 500 });
  }
}
