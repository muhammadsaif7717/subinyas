import { NextRequest, NextResponse } from 'next/server';
import { signJwtToken } from '@/lib/jwt';
import { getDb } from '@/lib/mongodb';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@subinyas.shop';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'subinyas2026';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Please enter both email and password.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if Admin login
    if (cleanEmail === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      const token = signJwtToken({
        userId: 'admin-01',
        email: ADMIN_EMAIL,
        role: 'admin',
        name: 'সুবিন্যাস অ্যাডমিন',
      });

      const response = NextResponse.json({
        success: true,
        message: 'Admin login successful',
        user: {
          id: 'admin-01',
          email: ADMIN_EMAIL,
          name: 'সুবিন্যাস অ্যাডমিন',
          role: 'admin',
        },
      });

      response.cookies.set('subinyas_admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return response;
    }

    // Customer login via MongoDB
    const db = await getDb();
    if (db) {
      const user = await db.collection('users').findOne({ email: cleanEmail });
      if (user && user.password === password) {
        const token = signJwtToken({
          userId: user._id.toString(),
          email: user.email,
          role: user.role || 'customer',
          name: user.name || 'Customer',
        });

        const response = NextResponse.json({
          success: true,
          message: 'Login successful',
          user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role || 'customer',
          },
        });

        response.cookies.set('subinyas_admin_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
        });

        return response;
      }
    }

    // Fallback simple customer login for dev
    const token = signJwtToken({
      userId: `user-${Buffer.from(cleanEmail).toString('hex').slice(0, 8)}`,
      email: cleanEmail,
      role: 'customer',
      name: cleanEmail.split('@')[0],
    });

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: `user-${Buffer.from(cleanEmail).toString('hex').slice(0, 8)}`,
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        role: 'customer',
      },
    });

    response.cookies.set('subinyas_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json({ success: false, message: 'An error occurred during login.' }, { status: 500 });
  }
}
