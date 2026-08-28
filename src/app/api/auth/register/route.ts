import { NextRequest, NextResponse } from 'next/server';
import { signJwtToken } from '@/lib/jwt';
import { getDb } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, phone } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ success: false, message: 'Please provide name, email, and password.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = await getDb();
    let userId = `user-${Date.now()}`;

    if (db) {
      const existing = await db.collection('users').findOne({ email: cleanEmail });
      if (existing) {
        return NextResponse.json({ success: false, message: 'This email is already registered. Please log in.' }, { status: 400 });
      }

      const res = await db.collection('users').insertOne({
        email: cleanEmail,
        password,
        name: name.trim(),
        phone: phone || '',
        role: 'customer',
        createdAt: new Date().toISOString(),
      });
      userId = res.insertedId.toString();
    }

    const token = signJwtToken({
      userId,
      email: cleanEmail,
      role: 'customer',
      name: name.trim(),
    });

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: userId,
        email: cleanEmail,
        name: name.trim(),
        phone: phone || '',
        role: 'customer',
      },
    }, { status: 201 });

    response.cookies.set('subinyas_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create account.' }, { status: 500 });
  }
}
